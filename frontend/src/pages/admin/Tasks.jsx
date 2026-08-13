import { useEffect, useState } from 'react';
import { Plus, Pencil, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminTaskApi } from '../../services/api';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { fmtDate } from '../../utils/helpers';

const EMPTY_FORM = { title: '', description: '', instructions: '', deadline: '', proofRequirement: '' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | task-object
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    adminTaskApi.list(params)
      .then(({ data }) => setTasks(data.tasks))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      instructions: task.instructions || '',
      deadline: task.deadline ? task.deadline.slice(0, 16) : '',
      proofRequirement: task.proof_requirement || '',
    });
    setModal(task);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminTaskApi.create(form);
        toast.success('Task created as DRAFT');
      } else {
        await adminTaskApi.update(modal.id, form);
        toast.success('Task updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    if (!window.confirm(`${status} this task?`)) return;
    try {
      await adminTaskApi.setStatus(task.id, status);
      toast.success(`Task ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">Create and manage official tasks</p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Create Task
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            id="task-admin-search"
            className="form-input"
            placeholder="Search tasks..."
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
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Create your first task to get started</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Enrollments</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    {t.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.description.slice(0, 60)}...
                      </div>
                    )}
                  </td>
                  <td><Badge status={t.status} /></td>
                  <td style={{ fontSize: '0.82rem' }}>{fmtDate(t.deadline)}</td>
                  <td style={{ fontSize: '0.875rem' }}>{t.assignment_count || 0}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.created_by_name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>
                        <Pencil size={13} /> Edit
                      </button>
                      {t.status === 'DRAFT' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(t, 'PUBLISHED')}>
                          Publish
                        </button>
                      )}
                      {t.status === 'PUBLISHED' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(t, 'DRAFT')}>
                          Unpublish
                        </button>
                      )}
                      {t.status !== 'REMOVED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(t, 'REMOVED')}>
                          Remove
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create New Task' : 'Edit Task'}
        maxWidth={560}
      >
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            id="task-title-input"
            className="form-input"
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Brief description of the task"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ minHeight: 80 }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Instructions</label>
          <textarea
            className="form-textarea"
            placeholder="Step-by-step instructions for the task"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Deadline</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Proof Requirement</label>
            <input
              className="form-input"
              placeholder="e.g. GitHub link, screenshot"
              value={form.proofRequirement}
              onChange={(e) => setForm({ ...form, proofRequirement: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
          <button
            id="save-task-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : null}
            {modal === 'create' ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
