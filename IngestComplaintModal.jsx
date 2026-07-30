import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ingestComplaint, setIngestModalOpen } from '../store/complaintsSlice';
import axios from 'axios';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  FlaskConical,
  PackageCheck
} from 'lucide-react';

export default function IngestComplaintModal() {
  const dispatch = useDispatch();
  const { ingestModalOpen, isIngesting } = useSelector((state) => state.complaints);

  const [mode, setMode] = useState('preset'); // 'preset' | 'upload' | 'manual'
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  
  const [rawText, setRawText] = useState('');
  const [productName, setProductName] = useState('');
  const [dosageForm, setDosageForm] = useState('FDF');
  const [batchNumber, setBatchNumber] = useState('');
  const [sourceType, setSourceType] = useState('Email');

  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  // Fetch presets on load
  useEffect(() => {
    if (ingestModalOpen) {
      axios.get('http://localhost:8000/api/complaints/presets')
        .then((res) => {
          setPresets(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedPresetId(res.data[0].id);
            setRawText(res.data[0].raw_content);
            setProductName(res.data[0].product_name);
            setDosageForm(res.data[0].dosage_form);
            setBatchNumber(res.data[0].batch_number);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [ingestModalOpen]);

  // Simulate step progress while ingesting
  useEffect(() => {
    let interval;
    if (isIngesting) {
      setActiveNodeIndex(1);
      interval = setInterval(() => {
        setActiveNodeIndex((prev) => (prev < 6 ? prev + 1 : prev));
      }, 700);
    } else {
      setActiveNodeIndex(0);
    }
    return () => clearInterval(interval);
  }, [isIngesting]);

  if (!ingestModalOpen) return null;

  const handleSelectPreset = (e) => {
    const id = e.target.value;
    setSelectedPresetId(id);
    const found = presets.find((p) => p.id === id);
    if (found) {
      setRawText(found.raw_content);
      setProductName(found.product_name);
      setDosageForm(found.dosage_form);
      setBatchNumber(found.batch_number);
    }
  };

  const handleSimulateFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const simulatedText = `SIMULATED DOCUMENT INGESTION: ${file.name}\n\nRe: Quality Excursion Report for ${file.name}\n\nDear QA Manager,\nDuring our receiving inspection on ${new Date().toISOString().split('T')[0]}, we identified container damage and out-of-spec physical parameters for Lot # DOC-${Math.floor(1000 + Math.random() * 9000)}.\n\nSample retained for FTIR and HPLC assay. Please investigate under cGMP requirements.`;
      setRawText(simulatedText);
      setProductName("Ciprofloxacin 250mg Injection");
      setDosageForm("FDF");
      setBatchNumber(`DOC-${Math.floor(1000 + Math.random() * 9000)}`);
      setSourceType("PDF Document");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    dispatch(ingestComplaint({
      title: `Quality Complaint: ${productName || 'Ingested Item'}`,
      product_name: productName || 'Unspecified Pharma Product',
      dosage_form: dosageForm,
      batch_number: batchNumber || 'LOT-UNKNOWN',
      raw_content: rawText,
      source_type: sourceType
    }));
  };

  const langGraphNodes = [
    { title: 'Extraction Node', desc: 'Extracting metadata attributes (Batch, Product, Contact)' },
    { title: 'Completeness Checker Node', desc: 'Auditing mandatory regulatory criteria & email generation' },
    { title: 'Risk Classification Node', desc: 'Evaluating safety hazard & FDA reporting priority' },
    { title: 'Duplicate Detector Node', desc: 'Scanning DB lot numbers for systemic batch excursions' },
    { title: 'Root Cause Analysis (RCA) Node', desc: 'Formulating Ishikawa 5-Whys hypotheses' },
    { title: 'CAPA Recommendation Node', desc: 'Proposing Corrective & Preventive Action roadmap' },
    { title: 'Executive Summarizer Node', desc: 'Synthesizing final executive QMS report' }
  ];

  return (
    <div className="modal-overlay" onClick={() => dispatch(setIngestModalOpen(false))}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', padding: '8px', borderRadius: '8px' }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Ingest Pharmaceutical Complaint</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trigger LangGraph AI agent pipeline for instant QMS triage</p>
            </div>
          </div>
          <button className="btn-subtle" onClick={() => dispatch(setIngestModalOpen(false))}>
            <X size={18} />
          </button>
        </div>

        {isIngesting ? (
          /* Live LangGraph Execution Progress Visualizer */
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '24px'
            }}>
              <Cpu size={16} className="pulse-active" />
              <span>LANGGRAPH AGENT GRAPH RUNNING...</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              {langGraphNodes.map((node, index) => {
                const stepNum = index + 1;
                const isPassed = activeNodeIndex > stepNum;
                const isActive = activeNodeIndex === stepNum;
                
                return (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-panel)',
                      border: `1px solid ${isActive ? '#3b82f6' : isPassed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isPassed ? '#10b981' : isActive ? '#2563eb' : 'var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}>
                      {isPassed ? <CheckCircle2 size={16} /> : stepNum}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isActive ? '#fff' : isPassed ? '#34d399' : 'var(--text-muted)' }}>
                        {node.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {node.desc}
                      </div>
                    </div>

                    {isActive && <Activity size={18} color="#60a5fa" className="pulse-active" />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            {/* Mode Selection Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              background: 'var(--bg-panel)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => setMode('preset')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'preset' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'preset' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} color="#a78bfa" />
                <span>Preset Pharma Demos</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('upload')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'upload' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'upload' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <UploadCloud size={14} color="#60a5fa" />
                <span>Upload PDF / Document</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('manual')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'manual' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'manual' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={14} color="#34d399" />
                <span>Custom Email Input</span>
              </button>
            </div>

            {/* Mode 1: Preset Pharma Scenarios */}
            {mode === 'preset' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Select Pharmaceutical Complaint Scenario:
                </label>
                <select
                  value={selectedPresetId}
                  onChange={handleSelectPreset}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    marginBottom: '12px'
                  }}
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.dosage_form}] {p.product_name} - {p.title} (Batch {p.batch_number})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mode 2: Simulated File Upload */}
            {mode === 'upload' && (
              <div style={{
                border: '2px dashed var(--border-bright)',
                borderRadius: 'var(--radius-lg)',
                padding: '30px',
                textAlign: 'center',
                marginBottom: '16px',
                background: 'rgba(59, 130, 246, 0.04)'
              }}>
                <UploadCloud size={36} color="#60a5fa" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                  Drop your Complaint PDF, Image, or Inspection Report
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 14px' }}>
                  Simulates PDF OCR ingestion and passes raw text to LangGraph Agent
                </p>
                <input
                  type="file"
                  id="pdf-upload"
                  style={{ display: 'none' }}
                  onChange={handleSimulateFileUpload}
                />
                <label htmlFor="pdf-upload" className="btn-secondary" style={{ cursor: 'pointer' }}>
                  Browse Files
                </label>
              </div>
            )}

            {/* Complaint Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Dosage Form
                </label>
                <select
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="FDF">FDF (Finished Dosage Form)</option>
                  <option value="API">API (Bulk Raw Material)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Batch / Lot #
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. PCM-2024-901"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Raw Content Text Area */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Complaint Text / Email Body / Document Content
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste incoming customer email, hospital report, or wholesaler quality notification..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => dispatch(setIngestModalOpen(false))}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Sparkles size={16} />
                <span>Run LangGraph AI Agent</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
