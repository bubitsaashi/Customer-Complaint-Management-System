import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateComplaintStatus, 
  reanalyzeComplaint, 
  setActiveTab, 
  setDetailSubTab 
} from '../store/complaintsSlice';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  Mail, 
  Copy, 
  Check, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Calendar, 
  FlaskConical, 
  PackageCheck,
  Zap,
  ListChecks,
  GitMerge
} from 'lucide-react';

export default function ComplaintDetailView() {
  const dispatch = useDispatch();
  const { activeComplaint, detailSubTab } = useSelector((state) => state.complaints);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  if (!activeComplaint) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No complaint selected for inspection.</p>
        <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={() => dispatch(setActiveTab('registry'))}>
          Return to Registry
        </button>
      </div>
    );
  }

  const analysis = activeComplaint.analysis || {};
  const completeness = analysis.completeness_check || {};
  const risk = analysis.risk_classification || {};
  const dup = analysis.duplicate_detection || {};
  const rca = analysis.root_cause_analysis || {};
  const capa = analysis.capa_recommendations || {};
  const traceSteps = (analysis.agent_trace && analysis.agent_trace.steps) || [];

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusUpdating(true);
    dispatch(updateComplaintStatus({ complaintId: activeComplaint.id, status: newStatus }))
      .finally(() => setStatusUpdating(false));
  };

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    dispatch(reanalyzeComplaint(activeComplaint.id))
      .finally(() => setIsReanalyzing(false));
  };

  const handleCopyEmail = () => {
    if (analysis.followup_email_draft) {
      navigator.clipboard.writeText(analysis.followup_email_draft);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-subtle" onClick={() => dispatch(setActiveTab('registry'))}>
            <ArrowLeft size={16} /> Registry
          </button>
          <span style={{ color: 'var(--border-bright)' }}>|</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#60a5fa', fontSize: '1.1rem' }}>
            {activeComplaint.id}
          </span>
          <span className={`badge-risk badge-risk-${activeComplaint.risk_level.toLowerCase()}`}>
            {activeComplaint.risk_level}
          </span>
          <span className={`badge-dosage badge-dosage-${activeComplaint.dosage_form.toLowerCase()}`}>
            {activeComplaint.dosage_form}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={activeComplaint.status}
              onChange={handleStatusChange}
              disabled={statusUpdating}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <option value="Logged">Logged</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="CAPA Assigned">CAPA Assigned</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={handleReanalyze} disabled={isReanalyzing}>
            <Sparkles size={16} color="#a78bfa" className={isReanalyzing ? "pulse-active" : ""} />
            <span>{isReanalyzing ? "Running LangGraph..." : "Re-Analyze AI"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Metadata + Tabbed Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Sidebar Metadata Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="qms-card">
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              Complaint File Details
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Product Name
                </span>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{activeComplaint.product_name}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Batch / Lot Number
                </span>
                <code style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {activeComplaint.batch_number || 'N/A'}
                </code>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Mfg Date</span>
                  <span style={{ color: '#fff' }}>{activeComplaint.mfg_date || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Expiry Date</span>
                  <span style={{ color: '#fff' }}>{activeComplaint.expiry_date || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Complainant Reporter
                </span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>
                  {activeComplaint.complainant_name || 'Anonymous Reporter'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeComplaint.complainant_org}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                  {activeComplaint.complainant_contact}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Quantity / Intake Source
                </span>
                <span style={{ color: '#fff' }}>{activeComplaint.quantity_affected || 'Unspecified'}</span> ({activeComplaint.source_type})
              </div>

              <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Completeness Audit</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{activeComplaint.completeness_score}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${activeComplaint.completeness_score}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Tab Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            padding: '6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              className={`btn-subtle ${detailSubTab === 'ai_intelligence' ? 'active' : ''}`}
              onClick={() => dispatch(setDetailSubTab('ai_intelligence'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: detailSubTab === 'ai_intelligence' ? '#fff' : 'var(--text-muted)',
                background: detailSubTab === 'ai_intelligence' ? 'linear-gradient(135deg, #2563eb, #8b5cf6)' : 'transparent',
                fontWeight: 600
              }}
            >
              <Sparkles size={16} />
              <span>AI Intelligence & CAPA</span>
            </button>

            <button
              className={`btn-subtle ${detailSubTab === 'overview' ? 'active' : ''}`}
              onClick={() => dispatch(setDetailSubTab('overview'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: detailSubTab === 'overview' ? '#fff' : 'var(--text-muted)',
                background: detailSubTab === 'overview' ? 'var(--bg-panel)' : 'transparent',
                fontWeight: 600
              }}
            >
              <FileText size={16} />
              <span>Raw Document Text</span>
            </button>

            <button
              className={`btn-subtle ${detailSubTab === 'workflow_trace' ? 'active' : ''}`}
              onClick={() => dispatch(setDetailSubTab('workflow_trace'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: detailSubTab === 'workflow_trace' ? '#fff' : 'var(--text-muted)',
                background: detailSubTab === 'workflow_trace' ? 'var(--bg-panel)' : 'transparent',
                fontWeight: 600
              }}
            >
              <GitMerge size={16} />
              <span>LangGraph Trace</span>
            </button>
          </div>

          {/* Sub-Tab 1: AI Intelligence */}
          {detailSubTab === 'ai_intelligence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive QMS Summary Box */}
              {analysis.executive_summary && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(6, 182, 212, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 22px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#60a5fa', fontWeight: 700 }}>
                    <Sparkles size={18} />
                    <span>Executive QMS Briefing</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#f3f4f6', lineHeight: '1.5' }}>
                    {analysis.executive_summary}
                  </p>
                </div>
              )}

              {/* Grid 2 Columns: Completeness Checker & Risk Triage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Completeness Checker */}
                <div className="qms-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListChecks size={18} color="#06b6d4" />
                      <span>Completeness Checker</span>
                    </h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: completeness.is_complete ? '#10b981' : '#f59e0b' }}>
                      {activeComplaint.completeness_score}% Complete
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {completeness.audit_comments || "Evaluated regulatory required intake parameters."}
                  </p>

                  {completeness.missing_fields && completeness.missing_fields.length > 0 && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', display: 'block' }}>
                        Missing Mandatory Parameters:
                      </span>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>
                        {completeness.missing_fields.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Customer Followup Email Draft */}
                  {analysis.followup_email_draft && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={14} /> Automated Customer Follow-up Email Draft
                        </span>
                        <button className="btn-subtle" onClick={handleCopyEmail} style={{ fontSize: '0.72rem', color: '#60a5fa' }}>
                          {copiedEmail ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          <span>{copiedEmail ? 'Copied!' : 'Copy Draft'}</span>
                        </button>
                      </div>
                      <pre style={{
                        background: 'var(--bg-input)',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        border: '1px solid var(--border-subtle)',
                        maxHeight: '140px',
                        overflowY: 'auto'
                      }}>
                        {analysis.followup_email_draft}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Risk Classification & Regulatory Impact */}
                <div className="qms-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={18} color="#ef4444" />
                      <span>Quality Risk Classification</span>
                    </h4>
                    <span className={`badge-risk badge-risk-${activeComplaint.risk_level.toLowerCase()}`}>
                      {activeComplaint.risk_level}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        Potential Safety Hazard
                      </span>
                      <p style={{ color: '#fff', marginTop: '2px' }}>
                        {risk.safety_hazard || "Evaluated under FDA / ICH Q9 Risk Assessment Framework."}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        FDA / Regulatory Impact
                      </span>
                      <p style={{ color: '#fbbf24', marginTop: '2px', fontWeight: 500 }}>
                        {risk.regulatory_impact || "Standard QMS internal investigation."}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        QMS Classification Justification
                      </span>
                      <p style={{ color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                        {risk.rationale}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duplicate Complaint Radar */}
              <div className="qms-card">
                <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Zap size={18} color="#f59e0b" />
                  <span>Duplicate Complaint Radar</span>
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {dup.rationale || "Scanned database lot numbers and product signatures."}
                </p>

                {dup.matching_complaints && dup.matching_complaints.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dup.matching_complaints.map((m, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ fontSize: '0.82rem' }}>
                          <strong style={{ color: '#fbbf24' }}>{m.complaint_id}</strong> - {m.title}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.match_reason}</div>
                        </div>
                        <span className={`badge-risk badge-risk-${(m.risk_level || 'pending').toLowerCase()}`}>
                          {m.risk_level || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Root Cause Analysis (Ishikawa 5-Whys) */}
              <div className="qms-card">
                <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Activity size={18} color="#8b5cf6" />
                  <span>Root Cause Analysis (Ishikawa Fishbone & 5-Whys)</span>
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {rca.analysis_summary || "Pharma manufacturing process root cause investigation."}
                </p>

                {rca.probable_causes && rca.probable_causes.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {rca.probable_causes.map((c, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                            {c.category} Category
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.likelihood === 'High' ? '#ef4444' : '#f59e0b' }}>
                            {c.likelihood} Likelihood
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#fff', lineHeight: '1.4' }}>
                          {c.hypothesis}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CAPA Recommendations */}
              <div className="qms-card">
                <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Recommended Corrective & Preventive Action Plan (CAPA)</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Corrective Actions */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: '#60a5fa', marginBottom: '8px' }}>
                      Immediate Corrective Actions
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {capa.corrective_actions?.map((ca, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-panel)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{ca.action}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.72rem' }}>
                            <span>Target: {ca.target_days} days</span>
                            <span>Role: {ca.responsible_role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preventive Actions */}
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '8px' }}>
                      Systemic Preventive Actions
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {capa.preventive_actions?.map((pa, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-panel)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{pa.action}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.72rem' }}>
                            <span>Target: {pa.target_days} days</span>
                            <span>Role: {pa.responsible_role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Overview & Raw Content */}
          {detailSubTab === 'overview' && (
            <div className="qms-card">
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px' }}>
                Raw Ingested Complaint Document / Email Content
              </h4>
              <pre style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                color: '#f3f4f6',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--border-bright)'
              }}>
                {activeComplaint.raw_content}
              </pre>
            </div>
          )}

          {/* Sub-Tab 3: LangGraph Trace */}
          {detailSubTab === 'workflow_trace' && (
            <div className="qms-card">
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitMerge size={18} color="#60a5fa" />
                <span>LangGraph State Graph Execution Node Map</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {traceSteps.map((step, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.88rem' }}>
                        Step {idx + 1}: {step.step}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Latency: {step.latency_ms} ms
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {step.description}
                    </p>
                    <details style={{ fontSize: '0.75rem', color: '#c084fc', cursor: 'pointer' }}>
                      <summary>View Output Payload JSON</summary>
                      <pre style={{
                        background: 'var(--bg-dark)',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '6px',
                        color: '#34d399',
                        overflowX: 'auto'
                      }}>
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
