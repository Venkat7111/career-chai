'use client';
import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminUserApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import Modal from '@/components/UI/Modal';
import { fmtDateTime, fmtRelative, initials } from '@/utils/helpers';

const STATUS_OPTIONS = ['ACTIVE', 'REJECTED', 'REVOKED', 'DISABLED', 'PENDING'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionModal, setActionModal] = useState(null); // { user, newStatus }
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    adminUserApi.list(params)
      .then(({ data }) => setUsers(data.users))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleAction = (user, status) => {
    setActionModal({ user, status });
  };

  const confirmAction = async () => {
    setUpdating(true);
    try {
      await adminUserApi.setStatus(actionModal.user.id, actionModal.status);
      toast.success(`User ${actionModal.status.toLowerCase()}`);
      setActionModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const actionLabel = (status) => {
    const map = { ACTIVE: 'Approve', REJECTED: 'Reject', REVOKED: 'Revoke', DISABLED: 'Disable', PENDING: 'Reset to Pending' };
    return map[status] || status;
  };

  const actionBtnClass = (status) => {
    const map = { ACTIVE: 'btn-success', REJECTED: 'btn-danger', REVOKED: 'btn-danger', DISABLED: 'btn-secondary', PENDING: 'btn-ghost' };
    return map[status] || 'btn-ghost';
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Review, approve, and manage user accounts</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            id="user-search"
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 160 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No users found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Logins</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge status={u.status} /></td>
                  <td style={{ fontSize: '0.875rem' }}>{u.login_count}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {u.last_login_at ? fmtRelative(u.last_login_at) : 'Never'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {fmtRelative(u.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {u.status !== 'ACTIVE' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAction(u, 'ACTIVE')}
                        >
                          Approve
                        </button>
                      )}
                      {u.status === 'PENDING' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(u, 'REJECTED')}
                        >
                          Reject
                        </button>
                      )}
                      {u.status === 'ACTIVE' && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAction(u, 'DISABLED')}
                          >
                            Disable
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(u, 'REVOKED')}
                          >
                            Revoke
                          </button>
                        </>
                      )}
                      {(u.status === 'DISABLED' || u.status === 'REVOKED') && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAction(u, 'ACTIVE')}
                        >
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title="Confirm Action"
        subtitle="This will update the user's account status"
      >
        {actionModal && (
          <>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 20 }}>
              <div className="info-row">
                <span className="info-label">User</span>
                <span className="info-value">{actionModal.user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{actionModal.user.email}</span>
              </div>
              <div className="info-row" style={{ border: 'none' }}>
                <span className="info-label">New Status</span>
                <Badge status={actionModal.status} />
              </div>
            </div>
            {['ACTIVE', 'REJECTED', 'REVOKED'].includes(actionModal.status) && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                📧 An email notification will be sent to the user.
              </p>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setActionModal(null)}>Cancel</button>
              <button
                id="confirm-user-action"
                className={`btn ${actionBtnClass(actionModal.status)}`}
                onClick={confirmAction}
                disabled={updating}
              >
                {updating ? <span className="spinner" /> : null}
                {actionLabel(actionModal.status)}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

