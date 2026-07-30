import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchComplaintDetail, setActiveTab, setIngestModalOpen } from '../store/complaintsSlice';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  FlaskConical,
  PackageCheck
} from 'lucide-react';

export default function DashboardView() {
  const dispatch = useDispatch();
  const { dashboardStats, list } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (!dashboardStats) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Activity className="pulse-active" size={32} color="#3b82f6" />
        <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Loading QMS Executive Metrics...</p>
      </div>
    );
  }

  const criticalComplaints = list.filter((item) => item.risk_level === 'Critical');

  const handleInspect = (id) => {
    dispatch(fetchComplaintDetail(id));
    dispatch(setActiveTab('detail'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner & Action Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(139, 92, 246, 0.12))',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Executive QMS Quality Dashboard</h2>
            <span className="badge-dosage badge-dosage-fdf">21 CFR 211.198 / ICH Q10</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Real-time pharmaceutical customer complaint triage, AI completeness scoring, Ishikawa RCA, and CAPA roadmaps.
          </p>
        </div>
        <button className="btn-primary" onClick={() => dispatch(setIngestModalOpen(true))}>
          <PlusCircle size={18} />
          <span>Ingest Complaint</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Complaints */}
        <div className="qms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Logged
              </p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{dashboardStats.total_complaints}</h3>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <FileText size={20} color="#60a5fa" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: '#34d399' }}>
            <TrendingUp size={14} />
            <span>{dashboardStats.open_complaints} Active in Pipeline</span>
          </div>
        </div>

        {/* Critical Risk */}
        <div className="qms-card" style={{ borderColor: dashboardStats.critical_risk > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--risk-critical)', textTransform: 'uppercase' }}>
                Critical Alerts
              </p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '4px', color: '#f87171' }}>{dashboardStats.critical_risk}</h3>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <ShieldAlert size={20} color="#ef4444" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            Patient Safety & Sterile Hazard Priority
          </p>
        </div>

        {/* Major Excursions */}
        <div className="qms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--risk-major)', textTransform: 'uppercase' }}>
                Major OOS Risk
              </p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '4px', color: '#fbbf24' }}>{dashboardStats.major_risk}</h3>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            Assay Potency & Stability Failures
          </p>
        </div>

        {/* Active CAPA */}
        <div className="qms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CAPA Assigned
              </p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{dashboardStats.capa_assigned_complaints}</h3>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <Clock size={20} color="#c084fc" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            Corrective Action Roadmap Tracking
          </p>
        </div>

        {/* Average Completeness Score */}
        <div className="qms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Avg AI Audit Score
              </p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '4px', color: '#38bdf8' }}>
                {dashboardStats.avg_completeness_score}%
              </h3>
            </div>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={20} color="#06b6d4" />
            </div>
          </div>
          <div className="progress-bar-bg" style={{ marginTop: '12px' }}>
            <div className="progress-bar-fill" style={{ width: `${dashboardStats.avg_completeness_score}%` }} />
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Dosage Form Segment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Risk Distribution Breakdown */}
        <div className="qms-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#60a5fa" />
              <span>Risk Tier Distribution</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QRM ICH Q9 Criteria</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Critical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>Critical Priority</span>
                <span style={{ fontWeight: 700 }}>{dashboardStats.critical_risk}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${dashboardStats.total_complaints ? (dashboardStats.critical_risk / dashboardStats.total_complaints) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)' 
                  }} 
                />
              </div>
            </div>

            {/* Major */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Major OOS Risk</span>
                <span style={{ fontWeight: 700 }}>{dashboardStats.major_risk}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${dashboardStats.total_complaints ? (dashboardStats.major_risk / dashboardStats.total_complaints) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)' 
                  }} 
                />
              </div>
            </div>

            {/* Minor */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>Minor Quality Excursion</span>
                <span style={{ fontWeight: 700 }}>{dashboardStats.minor_risk}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${dashboardStats.total_complaints ? (dashboardStats.minor_risk / dashboardStats.total_complaints) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dosage Form Breakdown (API vs FDF) */}
        <div className="qms-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="#c084fc" />
              <span>Pharma Sector Split</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>API vs Finished Product</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <FlaskConical size={24} color="#c084fc" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c084fc' }}>
                {dashboardStats.api_complaints_count}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                API Raw Powders
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active Chemical Ingredients
              </p>
            </div>

            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <PackageCheck size={24} color="#38bdf8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                {dashboardStats.fdf_complaints_count}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                Finished Dosage (FDF)
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tablets, Blisters, Injectables
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Active Complaints Alert Section */}
      <div className="qms-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '6px', borderRadius: '6px' }}>
              <ShieldAlert size={18} color="#ef4444" />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#fff' }}>Critical Quality Alerts Needing Review</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Immediate QMS Triage & Regulatory Notification</p>
            </div>
          </div>

          <button className="btn-subtle" onClick={() => dispatch(setActiveTab('registry'))}>
            View All Complaints <ArrowRight size={14} />
          </button>
        </div>

        {criticalComplaints.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            ✓ No critical level quality alerts logged currently.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalComplaints.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleInspect(item.id)}
                className="qms-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'var(--bg-panel)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--risk-critical)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f87171', fontSize: '0.85rem' }}>
                      {item.id}
                    </span>
                    <span className={`badge-dosage badge-dosage-${item.dosage_form.toLowerCase()}`}>
                      {item.dosage_form}
                    </span>
                    <span className="badge-risk badge-risk-critical">CRITICAL</span>
                  </div>
                  <h5 style={{ fontSize: '0.92rem', color: '#fff' }}>{item.title}</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Product: <strong>{item.product_name}</strong> | Batch: <code style={{ color: '#60a5fa' }}>{item.batch_number}</code>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge-status badge-status-${item.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {item.status}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Audit Score: {item.completeness_score}%
                    </p>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
