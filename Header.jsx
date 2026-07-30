import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setIngestModalOpen, setGroqModalOpen } from '../store/complaintsSlice';
import { ShieldAlert, LayoutDashboard, Database, PlusCircle, Cpu, Pill } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { activeTab, groqApiKey, activeComplaint } = useSelector((state) => state.complaints);

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => dispatch(setActiveTab('dashboard'))} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
          }}>
            <Pill size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.02em' }}>
                PharmaQMS<span style={{ color: '#60a5fa' }}>.AI</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                LANGGRAPH
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              API & Finished Dosage Form Complaint Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={`btn-subtle ${activeTab === 'intake' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveTab('intake'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'intake' ? '#60a5fa' : 'var(--text-muted)',
              background: activeTab === 'intake' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              fontWeight: activeTab === 'intake' ? 600 : 500
            }}
          >
            <PlusCircle size={16} />
            <span>Log Complaint (AI Intake)</span>
          </button>

          <button
            className={`btn-subtle ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveTab('dashboard'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'dashboard' ? '#60a5fa' : 'var(--text-muted)',
              background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              fontWeight: activeTab === 'dashboard' ? 600 : 500
            }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`btn-subtle ${activeTab === 'registry' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveTab('registry'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'registry' ? '#60a5fa' : 'var(--text-muted)',
              background: activeTab === 'registry' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              fontWeight: activeTab === 'registry' ? 600 : 500
            }}
          >
            <Database size={16} />
            <span>Complaint Registry</span>
          </button>

          {activeComplaint && (
            <button
              className={`btn-subtle ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => dispatch(setActiveTab('detail'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'detail' ? '#60a5fa' : 'var(--text-muted)',
                background: activeTab === 'detail' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                fontWeight: activeTab === 'detail' ? 600 : 500
              }}
            >
              <ShieldAlert size={16} />
              <span>Inspection ({activeComplaint.id})</span>
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Groq LLM Key Badge */}
          <button
            onClick={() => dispatch(setGroqModalOpen(true))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: groqApiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${groqApiKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              color: groqApiKey ? '#34d399' : '#fbbf24',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Cpu size={14} />
            <span>{groqApiKey ? 'Groq LLM Active' : 'Fallback Engine'}</span>
          </button>

          {/* New Ingestion Trigger */}
          <button className="btn-primary" onClick={() => dispatch(setIngestModalOpen(true))}>
            <PlusCircle size={16} />
            <span>Ingest Complaint</span>
          </button>
        </div>
      </div>
    </header>
  );
}
