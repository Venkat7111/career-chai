import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, AlertTriangle, XCircle, Code, Send, Search, Calendar, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminChallengeApi } from '../../services/api';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { fmtDate, fmtDateTime } from '../../utils/helpers';

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'submissions'
  const [search, setSearch] = useState('');

  // Challenge Modal State (Create / Edit)
  const [chalModal, setChalModal] = useState(null);
  const [chalForm, setChalForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    examples: '',
    constraints: '',
    challenge_date: new Date().toISOString().split('T')[0]
  });
  const [savingChal, setSavingChal] = useState(false);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminChallengeApi.list(),
      adminChallengeApi.submissions()
    ]).then(([cRes, sRes]) => {
      setChallenges(cRes.data.challenges || []);
      setSubmissions(sRes.data.submissions || []);
    }).catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleOpenCreate = () => {
    setChalModal('NEW');
    setChalForm({
      title: '',
      description: '',
      difficulty: 'EASY',
      examples: '',
      constraints: '',
      challenge_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleOpenEdit = (c) => {
    setChalModal(c);
    setChalForm({
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      examples: c.examples || '',
      constraints: c.constraints || '',
      challenge_date: c.challenge_date ? c.challenge_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveChallenge = async (e) => {
    e.preventDefault();
    setSavingChal(true);
    try {
      if (chalModal === 'NEW') {
        await adminChallengeApi.create(chalForm);
        toast.success('Daily challenge created successfully!');
      } else {
        await adminChallengeApi.update(chalModal.id, chalForm);
        toast.success('Challenge updated successfully!');
      }
      setChalModal(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingChal(false);
    }
  };

  const handleDeleteChallenge = async (id, title) => {
    if (!window.confirm(`Delete challenge "${title}"?`)) return;
    try {
      await adminChallengeApi.delete(id);
      toast.success('Challenge deleted');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenReview = (sub) => {
    setReviewModal(sub);
    setReviewStatus(sub.status === 'SUBMITTED' ? 'APPROVED' : sub.status);
    setAdminFeedback(sub.admin_feedback || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await adminChallengeApi.review(reviewModal.id, {
        status: reviewStatus,
        admin_feedback: adminFeedback
      });
      toast.success('Submission reviewed successfully!');
      setReviewModal(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Daily Challenges Management</h1>
          <p className="page-subtitle">Post daily coding challenges, review student solution submissions, and provide feedback</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 4, borderRadius: 8 }}>
            <button
              className={`btn btn-sm ${activeTab === 'challenges' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('challenges')}
            >
              Challenges ({challenges.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'submissions' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> Post New Challenge
          </button>
        </div>
      </div>

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div>
          {challenges.length === 0 ? (
            <div className="empty-state">
              <Code size={36} color="var(--text-muted)" />
              <h3>No daily challenges posted yet</h3>
              <p>Click "Post New Challenge" to publish your first daily problem</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {challenges.map((c) => (
                <div key={c.id} className="task-card">
                  <div className="task-card-header">
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: c.difficulty === 'EASY' ? 'var(--success)' : c.difficulty === 'MEDIUM' ? 'var(--warning)' : '#e50914' }}>
                        {c.difficulty}
                      </span>
                      <h3 className="task-card-title">{c.title}</h3>
                    </div>
                    <Badge status={c.difficulty} />
                  </div>

                  <p className="task-card-desc">
                    {c.description.length > 140 ? c.description.slice(0, 140) + '...' : c.description}
                  </p>

                  <div className="task-card-meta">
                    <span>📅 Date: {fmtDate(c.challenge_date)}</span>
                    <span>Submissions: {c.submission_count || 0} ({c.approved_count || 0} approved)</span>
                  </div>

                  <div className="task-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(c)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteChallenge(c.id, c.title)}>
                      <Trash2 size={14} color="var(--danger)" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submissions Review Tab */}
      {activeTab === 'submissions' && (
        <div>
          {submissions.length === 0 ? (
            <div className="empty-state">
              <Code size={36} color="var(--text-muted)" />
              <h3>No student submissions yet</h3>
              <p>When students solve daily challenges, their code solutions will appear here for your review.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {submissions.map((sub) => (
                <div key={sub.id} className="card" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{sub.user_name}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({sub.user_email})</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                        Problem: {sub.challenge_title} ({sub.difficulty})
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Badge status={sub.status} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleOpenReview(sub)}>
                        Review & Feedback
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Solution Code:</div>
                    <pre style={{
                      background: '#08080d',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontFamily: 'Consolas, monospace',
                      color: '#48cfad',
                      maxHeight: '160px',
                      overflowY: 'auto'
                    }}>
                      {sub.solution_code}
                    </pre>
                  </div>

                  {sub.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      <strong>Student Notes:</strong> {sub.notes}
                    </div>
                  )}

                  {sub.admin_feedback && (
                    <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <strong style={{ color: '#ff4d5a' }}>Your Review Feedback:</strong> {sub.admin_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge Create / Edit Modal */}
      {chalModal && (
        <Modal
          isOpen={!!chalModal}
          onClose={() => setChalModal(null)}
          title={chalModal === 'NEW' ? 'Post New Daily Challenge' : 'Edit Daily Challenge'}
          subtitle="Formulate coding problem, examples, and target date"
        >
          <form onSubmit={handleSaveChallenge}>
            <div className="form-group">
              <label className="form-label">Problem Title</label>
              <input
                className="form-input"
                placeholder="e.g. Reverse a String & Remove Vowels"
                value={chalForm.title}
                onChange={(e) => setChalForm({ ...chalForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={chalForm.difficulty}
                  onChange={(e) => setChalForm({ ...chalForm, difficulty: e.target.value })}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Challenge Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={chalForm.challenge_date}
                  onChange={(e) => setChalForm({ ...chalForm, challenge_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Problem Description</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Detailed problem statement..."
                value={chalForm.description}
                onChange={(e) => setChalForm({ ...chalForm, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Input / Output Examples (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Input: 'hello' -> Output: 'hll'"
                value={chalForm.examples}
                onChange={(e) => setChalForm({ ...chalForm, examples: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Constraints (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. 1 <= s.length <= 10^5"
                value={chalForm.constraints}
                onChange={(e) => setChalForm({ ...chalForm, constraints: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '12px', justifyContent: 'center' }}
              disabled={savingChal}
            >
              {savingChal ? <span className="spinner" /> : <Send size={16} />}
              {savingChal ? 'Saving...' : chalModal === 'NEW' ? 'Publish Challenge' : 'Update Challenge'}
            </button>
          </form>
        </Modal>
      )}

      {/* Review Submission Modal */}
      {reviewModal && (
        <Modal
          isOpen={!!reviewModal}
          onClose={() => setReviewModal(null)}
          title={`Review Solution: ${reviewModal.user_name}`}
          subtitle={`Problem: ${reviewModal.challenge_title}`}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Student Solution Code:</div>
            <pre style={{
              background: '#08080d',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontFamily: 'Consolas, monospace',
              color: '#48cfad',
              maxHeight: '240px',
              overflowY: 'auto'
            }}>
              {reviewModal.solution_code}
            </pre>
          </div>

          <form onSubmit={handleSaveReview}>
            <div className="form-group">
              <label className="form-label">Review Status</label>
              <select
                className="form-select"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
              >
                <option value="APPROVED">APPROVED (Solution Verified)</option>
                <option value="NEEDS_REVISION">NEEDS_REVISION (Request Changes)</option>
                <option value="REJECTED">REJECTED (Incorrect)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mentor Review Feedback & Guidance</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Give constructive feedback, optimization tips, or praise..."
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '12px', justifyContent: 'center' }}
              disabled={reviewing}
            >
              {reviewing ? <span className="spinner" /> : <CheckCircle2 size={16} />}
              {reviewing ? 'Saving Review...' : 'Submit Review Feedback'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
