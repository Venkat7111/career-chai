import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { resultApi } from '../../services/api';
import { fmtDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultApi.myList()
      .then(({ data }) => setResults(data.results))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-subtitle">All your submitted task proofs</p>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No results yet</h3>
          <p>Complete a task and submit your proof to see results here</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Proof</th>
                <th>URL</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.task_title}</strong>
                    <div className="text-xs text-muted mt-1">{r.description?.slice(0, 60)}...</div>
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    {r.proof_text ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {r.proof_text.slice(0, 100)}{r.proof_text.length > 100 ? '...' : ''}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {r.proof_url ? (
                      <a
                        href={r.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ gap: 5 }}
                      >
                        <ExternalLink size={13} /> View
                      </a>
                    ) : '—'}
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
