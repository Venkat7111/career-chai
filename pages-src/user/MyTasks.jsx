'use client';
import { useEffect, useState } from 'react';
import { Play, X, Send, Calendar, Paperclip, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { assignmentApi, resultApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import Modal from '@/components/UI/Modal';
import { fmtDate } from '@/utils/helpers';

export default function MyTasks() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitForm, setSubmitForm] = useState({ proofText: '', proofUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    assignmentApi.myList()
      .then(({ data }) => setAssignments(data.assignments))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStart = async (id) => {
    try {
      await assignmentApi.start(id);
      toast.success('Task started!');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnassign = async (id, title) => {
    if (!window.confirm(`Unassign from "${title}"?`)) return;
    try {
      await assignmentApi.unassign(id);
      toast.success('Unassigned successfully');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitProof = async () => {
    if (!submitForm.proofText && !submitForm.proofUrl) {
      toast.error('Please enter proof text or URL');
      return;
    }
    setSubmitting(true);
    try {
      await resultApi.submit({ assignmentId: submitModal.id, ...submitForm });
      toast.success('Proof submitted! Task completed 🎉');
      setSubmitModal(null);
      setSubmitForm({ proofText: '', proofUrl: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <p className="page-subtitle">Manage your enrolled tasks</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks here</h3>
          <p>Browse available tasks and take one to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map((a) => (
            <div key={a.id} className="task-card">
              <div className="task-card-header">
                <h3 className="task-card-title">{a.task_title}</h3>
                <Badge status={a.status} />
              </div>

              <p className="task-card-desc">{a.description || 'No description.'}</p>

              {a.proof_requirement && (
                <div style={{
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--primary)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Paperclip size={14} /> Proof required: {a.proof_requirement}
                </div>
              )}

              <div className="task-card-meta">
                {a.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={13} /> Due: {fmtDate(a.deadline)}
                  </span>
                )}
                {a.started_at && (
                  <span>Started: {fmtDate(a.started_at)}</span>
                )}
              </div>

              <div className="task-card-actions">
                {a.status === 'NOT_STARTED' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStart(a.id)}
                    >
                      <Play size={14} /> Start
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleUnassign(a.id, a.task_title)}
                    >
                      <X size={14} /> Unassign
                    </button>
                  </>
                )}
                {a.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => setSubmitModal(a)}
                    >
                      <Send size={14} /> Submit Proof
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleUnassign(a.id, a.task_title)}
                    >
                      <X size={14} /> Unassign
                    </button>
                  </>
                )}
                {a.status === 'COMPLETED' && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 size={14} /> Completed on {fmtDate(a.completed_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Proof Modal */}
      <Modal
        isOpen={!!submitModal}
        onClose={() => { setSubmitModal(null); setSubmitForm({ proofText: '', proofUrl: '' }); }}
        title="Submit Task Proof"
        subtitle={`Task: ${submitModal?.task_title}`}
      >
        {submitModal?.proof_requirement && (
          <div style={{
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.82rem',
            color: 'var(--primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Paperclip size={14} /> Required: {submitModal.proof_requirement}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Proof Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe what you've done, what you achieved..."
            value={submitForm.proofText}
            onChange={(e) => setSubmitForm({ ...submitForm, proofText: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Proof URL (Optional)</label>
          <input
            className="form-input"
            type="url"
            placeholder="https://github.com/... or any link"
            value={submitForm.proofUrl}
            onChange={(e) => setSubmitForm({ ...submitForm, proofUrl: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            onClick={() => { setSubmitModal(null); setSubmitForm({ proofText: '', proofUrl: '' }); }}
          >
            Cancel
          </button>
          <button
            id="submit-proof-btn"
            className="btn btn-success"
            onClick={handleSubmitProof}
            disabled={submitting}
          >
            {submitting ? <span className="spinner" /> : <Send size={16} />}
            {submitting ? 'Submitting...' : 'Submit Proof'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

