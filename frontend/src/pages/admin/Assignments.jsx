import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAssignmentApi } from '../../services/api';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { fmtDate, fmtRelative, initials } from '../../utils/helpers';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [removeModal, setRemoveModal] = useState(null);
  const [removeForm, setRemoveForm] = useState({ reason: '', notifyUser: true });
  const [removing, setRemoving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    adminAssignmentApi.list(params)
      .then(({ data }) => setAssignments(data.assignments))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await adminAssignmentApi.remove(removeModal.id, removeForm);
      toast.success('Assignment removed');
      setRemoveModal(null);
      setRemoveForm({ reason: '', notifyUser: true });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Assignment Management</h1>
        <p className="page-subtitle">View and manage all user task assignments</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            id="assignment-search"
            className="form-input"
            placeholder="Search by user, email, or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 180 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No assignments found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Task</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {initials(a.user_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.user_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{a.task_title}</td>
                  <td><Badge status={a.status} /></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{fmtRelative(a.created_at)}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {a.completed_at ? fmtDate(a.completed_at) : '—'}
                  </td>
                  <td>
                    {a.status !== 'REMOVED' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRemoveModal(a)}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                    {a.status === 'REMOVED' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.removal_reason ? `Reason: ${a.removal_reason.slice(0, 30)}` : 'Removed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remove Assignment Modal */}
      <Modal
        isOpen={!!removeModal}
        onClose={() => { setRemoveModal(null); setRemoveForm({ reason: '', notifyUser: true }); }}
        title="Remove Assignment?"
        subtitle="This action cannot be undone. The history will be preserved."
      >
        {removeModal && (
          <>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 20 }}>
              <div className="info-row">
                <span className="info-label">User</span>
                <span className="info-value">{removeModal.user_name}</span>
              </div>
              <div className="info-row" style={{ border: 'none' }}>
                <span className="info-label">Task</span>
                <span className="info-value">{removeModal.task_title}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Why is this assignment being removed?"
                style={{ minHeight: 80 }}
                value={removeForm.reason}
                onChange={(e) => setRemoveForm({ ...removeForm, reason: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notify User by Email?</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="notify"
                    checked={removeForm.notifyUser === true}
                    onChange={() => setRemoveForm({ ...removeForm, notifyUser: true })}
                  />
                  Yes, send email
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="notify"
                    checked={removeForm.notifyUser === false}
                    onChange={() => setRemoveForm({ ...removeForm, notifyUser: false })}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setRemoveModal(null); setRemoveForm({ reason: '', notifyUser: true }); }}
              >
                Cancel
              </button>
              <button
                id="confirm-remove-assignment"
                className="btn btn-danger"
                onClick={handleRemove}
                disabled={removing}
              >
                {removing ? <span className="spinner" /> : <Trash2 size={16} />}
                {removing ? 'Removing...' : 'Remove Assignment'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
