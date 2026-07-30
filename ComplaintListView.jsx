import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchComplaints, 
  fetchComplaintDetail, 
  setFilter, 
  setActiveTab,
  setIngestModalOpen 
} from '../store/complaintsSlice';
import { Search, Filter, ArrowRight, PlusCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ComplaintListView() {
  const dispatch = useDispatch();
  const { list, filters, loading } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch, filters]);

  const handleInspect = (id) => {
    dispatch(fetchComplaintDetail(id));
    dispatch(setActiveTab('detail'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div className="qms-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Quality Complaint Registry</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Filterable cGMP audit log of ingested customer excursions
            </p>
          </div>

          <button className="btn-primary" onClick={() => dispatch(setIngestModalOpen(true))}>
            <PlusCircle size={16} />
            <span>Ingest New Complaint</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search batch, product, title..."
              value={filters.search}
              onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={filters.risk_level}
              onChange={(e) => dispatch(setFilter({ risk_level: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Risk Tiers</option>
              <option value="Critical">Critical Priority</option>
              <option value="Major">Major OOS Risk</option>
              <option value="Minor">Minor Quality Excursion</option>
            </select>
          </div>

          {/* Dosage Form Filter */}
          <div>
            <select
              value={filters.dosage_form}
              onChange={(e) => dispatch(setFilter({ dosage_form: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Dosage Forms</option>
              <option value="FDF">FDF (Finished Product)</option>
              <option value="API">API (Bulk Raw Powder)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All QMS Statuses</option>
              <option value="Logged">Logged</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="CAPA Assigned">CAPA Assigned</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="qms-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Complaint ID</th>
              <th style={{ padding: '14px 18px' }}>Product & Batch</th>
              <th style={{ padding: '14px 18px' }}>Dosage Form</th>
              <th style={{ padding: '14px 18px' }}>Risk Tier</th>
              <th style={{ padding: '14px 18px' }}>Completeness</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No complaints match the specified filter criteria.
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => handleInspect(item.id)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* ID */}
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa' }}>
                    {item.id}
                  </td>

                  {/* Title & Batch */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Product: <strong>{item.product_name}</strong> | Lot: <code style={{ color: '#38bdf8' }}>{item.batch_number || 'N/A'}</code>
                    </div>
                  </td>

                  {/* Dosage Form */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge-dosage badge-dosage-${item.dosage_form.toLowerCase()}`}>
                      {item.dosage_form}
                    </span>
                  </td>

                  {/* Risk Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge-risk badge-risk-${item.risk_level.toLowerCase()}`}>
                      {item.risk_level}
                    </span>
                  </td>

                  {/* Completeness Score */}
                  <td style={{ padding: '14px 18px', width: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{item.completeness_score}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${item.completeness_score}%` }} />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge-status badge-status-${item.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Inspect Button */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button className="btn-subtle" style={{ color: '#60a5fa' }}>
                      Inspect <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
