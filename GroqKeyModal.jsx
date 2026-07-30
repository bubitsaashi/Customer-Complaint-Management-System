import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGroqApiKey, setGroqModalOpen } from '../store/complaintsSlice';
import { Key, ShieldCheck, Cpu, X } from 'lucide-react';

export default function GroqKeyModal() {
  const dispatch = useDispatch();
  const { groqApiKey, groqModalOpen } = useSelector((state) => state.complaints);
  const [keyInput, setKeyInput] = useState(groqApiKey);

  if (!groqModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(setGroqApiKey(keyInput.trim()));
    dispatch(setGroqModalOpen(false));
  };

  const handleClear = () => {
    setKeyInput('');
    dispatch(setGroqApiKey(''));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(setGroqModalOpen(false))}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Cpu size={20} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Groq AI LLM Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure Groq API key for LangGraph reasoning</p>
            </div>
          </div>
          <button className="btn-subtle" onClick={() => dispatch(setGroqModalOpen(false))}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Groq API Key (gemma2-9b-it / llama-3.3-70b-versatile)
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="gsk_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {groqApiKey ? '✓ Active API key set in local storage.' : '⚡ No key provided? The built-in Pharma QMS Fallback Engine will generate domain responses automatically!'}
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>100% Zero-Failure Guarantee</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              The system seamlessly runs LangGraph agent nodes with Groq models, and safely falls back to offline rule inference if rate-limited.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {groqApiKey && (
              <button type="button" className="btn-secondary" onClick={handleClear}>
                Use Fallback Engine
              </button>
            )}
            <button type="submit" className="btn-primary">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
