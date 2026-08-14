'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, Check, RotateCcw, X, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { todoApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import Modal from '@/components/UI/Modal';
import { fmtDate } from '@/utils/helpers';

const EMPTY_FORM = { title: '', description: '', priority: 'MEDIUM', dueDate: '' };

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | todo-object (edit)
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = (params = {}) => {
    setLoading(true);
    const q = {};
    if (search) q.search = search;
    if (filterPriority) q.priority = filterPriority;
    if (filterCompleted !== '') q.completed = filterCompleted;
    todoApi.list({ ...q, ...params })
      .then(({ data }) => setTodos(data.todos))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterPriority, filterCompleted]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (todo) => {
    setForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.due_date || '',
    });
    setModal(todo);
  };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await todoApi.create({ ...form });
        toast.success('To-do added!');
      } else {
        await todoApi.update(modal.id, { ...form });
        toast.success('To-do updated!');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (todo) => {
    try {
      await todoApi.update(todo.id, { completed: !todo.completed });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this to-do?')) return;
    try {
      await todoApi.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My To-Do</h1>
          <p className="page-subtitle">Your personal & private task list</p>
        </div>
        <button id="add-todo-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add To-Do
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            id="todo-search"
            className="form-input"
            placeholder="Search to-dos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 140 }}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="form-select"
          style={{ width: 140 }}
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckCircle2 size={36} color="var(--text-muted)" /></div>
          <h3>No to-dos found</h3>
          <p>Click "Add To-Do" to create your first task</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                id={`todo-${todo.id}`}
              />
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                <div className="todo-meta" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <Badge status={todo.priority} />
                  {todo.due_date && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {fmtDate(todo.due_date)}</span>
                  )}
                  {todo.description && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      {todo.description.slice(0, 60)}{todo.description.length > 60 ? '...' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="todo-actions">
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => openEdit(todo)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleDelete(todo.id)}
                  title="Delete"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal === 'add' ? 'Add New To-Do' : 'Edit To-Do'}
      >
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            id="todo-title-input"
            className="form-input"
            placeholder="What do you need to do?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Optional details..."
            style={{ minHeight: 80 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button
            id="todo-save-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : null}
            {modal === 'add' ? 'Add To-Do' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

