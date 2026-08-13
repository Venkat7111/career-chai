import { useEffect, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminResultApi } from '../../services/api';
import { fmtDateTime, initials } from '../../utils/helpers';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminResultApi.list(search ? { search } : {})
      .then(({ data }) => setResults(data.results))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Submitted Results</h1>
        <p className="page-subtitle">Review all user-submitted task proofs</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            id="result-search"
            className="form-input"
            placeholder="Search by user or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No results submitted yet</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Task</th>
                <th>Proof Text</th>
                <th>Proof URL</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {initials(r.user_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.user_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.task_title}</td>
                  <td style={{ maxWidth: 240 }}>
                    {r.proof_text ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {r.proof_text.slice(0, 100)}{r.proof_text.length > 100 ? '...' : ''}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {r.proof_url ? (
                      <a
                        href={r.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        <ExternalLink size={13} /> View
                      </a>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {fmtDateTime(r.submitted_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
