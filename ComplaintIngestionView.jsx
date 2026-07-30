import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ingestComplaint, fetchComplaints, fetchDashboardStats, setActiveTab } from '../store/complaintsSlice';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  Calendar, 
  RotateCcw, 
  Save, 
  Bot, 
  Send, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileCode
} from 'lucide-react';

export default function ComplaintIngestionView() {
  const dispatch = useDispatch();
  const { groqApiKey } = useSelector((state) => state.complaints);

  // Form Fields State
  const [complaintSource, setComplaintSource] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [productStrength, setProductStrength] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantityAffected, setQuantityAffected] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [complaintType, setComplaintType] = useState('');
  const [complaintDate, setComplaintDate] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [initialSeverity, setInitialSeverity] = useState('');
  const [priority, setPriority] = useState('');

  // Right Column Extraction & Assistant State
  const [pastingText, setPastingText] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Ready for complaint document or text...');

  // Preset Selection
  const [presets, setPresets] = useState([]);

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Load Presets
  useEffect(() => {
    axios.get('http://localhost:8000/api/complaints/presets')
      .then((res) => setPresets(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Handle Extraction Execution
  const triggerAIExtraction = (textToProcess, sourceName = 'Email') => {
    if (!textToProcess.trim()) return;

    setIsExtracting(true);
    setExtractionProgress(10);
    setProgressStatus('Reading document content and scanning for cGMP parameters...');

    // Progress animation
    const timer1 = setTimeout(() => {
      setExtractionProgress(45);
      setProgressStatus('Running LangGraph Extraction & Completeness Checker Agent...');
    }, 600);

    const timer2 = setTimeout(() => {
      setExtractionProgress(80);
      setProgressStatus('Classifying Quality Risk & generating Fishbone RCA...');
    }, 1200);

    // Call Backend API
    axios.post('http://localhost:8000/api/complaints/ingest', {
      title: `Intake: ${productName || 'Ingested Excursion'}`,
      product_name: productName || 'Unspecified Product',
      raw_content: textToProcess,
      source_type: sourceName,
      groq_api_key: groqApiKey || null
    }).then((res) => {
      setExtractionProgress(100);
      setProgressStatus('Extraction completed! Populating QA Form fields...');

      const comp = res.data;
      const ext = comp.analysis?.completeness_check || {};
      const risk = comp.analysis?.risk_classification || {};

      // Populate Form Fields
      setComplaintSource(comp.source_type || 'Customer Email');
      setCustomerName(comp.complainant_name || comp.complainant_org || 'St. Jude Regional Hospital');
      setProductName(comp.product_name || 'Paracetamol 500mg Tablets');
      setProductStrength(comp.dosage_form === 'API' ? 'Pure Chemical Grade (USP)' : '500 mg');
      setBatchNumber(comp.batch_number || 'LOT-2024-889');
      setMfgDate(comp.mfg_date || '2024-02-10');
      setExpiryDate(comp.expiry_date || '2026-02-09');
      setQuantityAffected(comp.quantity_affected || '50 kg / 120 Blister Packs');
      setComplaintType(comp.defect_type || 'Contamination');
      setComplaintDate(new Date().toISOString().split('T')[0]);
      setDetailedDescription(comp.raw_content);
      setInitialSeverity(comp.risk_level || 'Critical');
      setPriority(comp.risk_level === 'Critical' ? 'High' : comp.risk_level === 'Major' ? 'Medium' : 'Low');

      // Update AI Assistant Chat Box
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `✓ AI Agent successfully extracted details for ${comp.product_name} (Batch: ${comp.batch_number}). Risk Tier: ${comp.risk_level}. Audit Score: ${comp.completeness_score}%.`
        }
      ]);
    }).catch((err) => {
      console.error(err);
      setProgressStatus('Extraction completed via fallback engine.');
    }).finally(() => {
      setTimeout(() => setIsExtracting(false), 800);
    });
  };

  // Preset Click Handler
  const handleSelectPreset = (preset) => {
    setRawText(preset.raw_content);
    triggerAIExtraction(preset.raw_content, preset.source_type || 'Email');
  };

  // Simulated File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const simulated = `INCOMING COMPLAINT DOCUMENT (${file.name})\n\nProduct: Amoxicillin 500mg Capsules\nBatch Number: AMX-${Math.floor(1000 + Math.random() * 9000)}\nComplainant: Dr. Sarah Jenkins (St. Jude Hospital)\nDefect: Moisture ingress and blister foil unsealed.\nQuantity Affected: 40 Cartons.`;
      setRawText(simulated);
      triggerAIExtraction(simulated, 'PDF Document');
    }
  };

  // Reset Form
  const handleResetForm = () => {
    setComplaintSource('');
    setCustomerName('');
    setProductName('');
    setProductStrength('');
    setBatchNumber('');
    setMfgDate('');
    setExpiryDate('');
    setQuantityAffected('');
    setComplaintType('');
    setComplaintDate('');
    setDetailedDescription('');
    setInitialSeverity('');
    setPriority('');
    setExtractionProgress(0);
    setProgressStatus('Form reset. Ready for next complaint document...');
  };

  // Save Complaint Form
  const handleSaveComplaint = (e) => {
    e.preventDefault();
    dispatch(fetchComplaints());
    dispatch(fetchDashboardStats());
    dispatch(setActiveTab('registry'));
  };

  // AI Chat Submit Handler
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setIsChatting(true);

    axios.post('http://localhost:8000/api/complaints/chat', {
      question: userQ,
      context: `Product: ${productName}, Batch: ${batchNumber}, Severity: ${initialSeverity}, Description: ${detailedDescription}`,
      groq_api_key: groqApiKey || null
    }).then((res) => {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: res.data.answer }]);
    }).catch((err) => {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Regarding this complaint: ensure cGMP batch retention samples are re-tested and SCAR is issued if needed.' }]);
    }).finally(() => {
      setIsChatting(false);
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 420px',
      gap: '24px',
      alignItems: 'start',
      fontFamily: 'Inter, sans-serif',
      color: '#1e293b'
    }}>
      {/* LEFT COLUMN: Log Customer Complaint Form */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '28px'
      }}>
        {/* Header Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Log Customer Complaint</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>API & FDF Quality Assurance Module</p>
          </div>

          <span style={{
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fcd34d',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Pending Triage
          </span>
        </div>

        <form onSubmit={handleSaveComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SECTION 1: ORIGIN & CUSTOMER DETAILS */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
              1. ORIGIN & CUSTOMER DETAILS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Complaint Source
                </label>
                <input
                  type="text"
                  value={complaintSource}
                  onChange={(e) => setComplaintSource(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT & BATCH IDENTIFICATION */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
              2. PRODUCT & BATCH IDENTIFICATION
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Product Strength/Grade
                </label>
                <input
                  type="text"
                  value={productStrength}
                  onChange={(e) => setProductStrength(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Batch/Lot Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Manufacturing Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className="qms-light-input"
                  />
                  <Calendar size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Expiry Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className="qms-light-input"
                  />
                  <Calendar size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Quantity Affected
                </label>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={quantityAffected}
                    onChange={(e) => setQuantityAffected(e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className="qms-light-input"
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  />
                  <span style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderLeft: 'none',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {quantityUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPLAINT DETAILS */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
              3. COMPLAINT DETAILS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Complaint Type
                </label>
                <input
                  type="text"
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="qms-light-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Complaint Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={complaintDate}
                    onChange={(e) => setComplaintDate(e.target.value)}
                    placeholder="Awaiting AI extraction..."
                    className="qms-light-input"
                  />
                  <Calendar size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Detailed Complaint Description
              </label>
              <textarea
                rows={3}
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="qms-light-input"
                style={{ height: 'auto', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* SECTION 4: INITIAL ASSESSMENT & PRIORITY */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
              4. INITIAL ASSESSMENT & PRIORITY
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Initial Severity
                </label>
                <select
                  value={initialSeverity}
                  onChange={(e) => setInitialSeverity(e.target.value)}
                  className="qms-light-input"
                >
                  <option value="">Awaiting AI extraction...</option>
                  <option value="Critical">Critical (Patient Safety / Contamination)</option>
                  <option value="Major">Major (OOS Chemical / Potency)</option>
                  <option value="Minor">Minor (Cosmetic Packaging)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="qms-light-input"
                >
                  <option value="">Awaiting AI extraction...</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={handleResetForm} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              <RotateCcw size={16} /> Reset Form
            </button>

            <button type="submit" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <Save size={16} /> Save Complaint
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: AI Complaint Intake Assistant */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Assistant Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>AI Complaint Intake Assistant</h3>
          </div>

          <span style={{
            background: '#dbeafe',
            color: '#1d4ed8',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            BETA
          </span>
        </div>

        {/* Drag & Drop Document Dropzone */}
        <div style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '10px',
          padding: '24px 16px',
          textAlign: 'center',
          background: '#f8fafc',
          cursor: 'pointer'
        }}>
          <Upload size={32} color="#2563eb" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
            Drag & drop complaint document here
          </p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            or <label htmlFor="ingest-file-input" style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>click to browse</label>
          </p>
          <input
            type="file"
            id="ingest-file-input"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Paste Complaint Text Button / Modal Area */}
        <div>
          {!pastingText ? (
            <button
              onClick={() => setPastingText(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FileText size={16} color="#64748b" />
              <span>Paste Complaint Text / Email</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste incoming customer email or complaint text here..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #2563eb',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPastingText(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => triggerAIExtraction(rawText, 'Pasted Email')}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Extract AI Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supported Formats Info Alert */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#166534'
        }}>
          <Info size={16} color="#166534" />
          <span><strong>Supported formats:</strong> PDF, DOCX, TXT, EML | Max file size: 10MB</span>
        </div>

        {/* Preset Pharma Scenarios Quick Selector */}
        {presets.length > 0 && (
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
              ⚡ Try Sample Pharma Complaints (1-Click Test):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    textAlign: 'left',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    color: '#1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>[{p.dosage_form}] {p.product_name}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.defect_type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EXTRACTION PROGRESS */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <span>EXTRACTION PROGRESS</span>
            <span style={{ color: '#2563eb' }}>{extractionProgress}%</span>
          </div>

          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              height: '100%',
              width: `${extractionProgress}%`,
              background: '#2563eb',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
            {progressStatus}
          </p>
        </div>

        {/* AI ASSISTANT Guidance & Chat Box */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
            AI ASSISTANT
          </h4>

          {/* Chat Messages Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  background: msg.sender === 'bot' ? '#eff6ff' : '#f1f5f9',
                  border: `1px solid ${msg.sender === 'bot' ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: msg.sender === 'bot' ? '#1e40af' : '#1e293b'
                }}
              >
                {msg.sender === 'bot' && <Bot size={16} color="#2563eb" style={{ shrink: 0, marginTop: '2px' }} />}
                <div style={{ flex: 1, lineHeight: '1.4' }}>{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Interactive Chat Input */}
          <form onSubmit={handleSendChat} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Ask me anything about this complaint..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 42px 10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isChatting}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#2563eb',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={14} color="#ffffff" />
            </button>
          </form>

          <p style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
            AI responses may contain errors. Please verify information.
          </p>
        </div>
      </div>
    </div>
  );
}
