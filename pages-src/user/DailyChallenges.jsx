'use client';
import { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Award, Code, Send, Pencil, Search, Clock, AlertTriangle, Sparkles, MessageSquare, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { challengeApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import Modal from '@/components/UI/Modal';
import { fmtDate, fmtDateTime } from '@/utils/helpers';

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [streakData, setStreakData] = useState({ streak: 0, totalSubmitted: 0, approvedCount: 0, approvalRate: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');

  // Active solution modal state
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [solutionCode, setSolutionCode] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      challengeApi.list(),
      challengeApi.getStreak()
    ]).then(([chalRes, streakRes]) => {
      setChallenges(chalRes.data.challenges || []);
      if (streakRes.data) setStreakData(streakRes.data);
    }).catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleOpenSolve = (c) => {
    setSelectedChallenge(c);
    setSolutionCode(c.solution_code || '');
    setSolutionNotes(c.notes || '');
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionCode.trim()) {
      toast.error('Please enter your solution code');
      return;
    }
    setSubmitting(true);
    try {
      await challengeApi.submit(selectedChallenge.id, {
        solution_code: solutionCode,
        notes: solutionNotes
      });
      toast.success(selectedChallenge.submission_id ? 'Solution updated successfully!' : 'Solution submitted for review!');
      setSelectedChallenge(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = challenges.filter(c => {
    const mSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                    c.description.toLowerCase().includes(search.toLowerCase());
    const mDiff = !filterDiff || c.difficulty === filterDiff;
    return mSearch && mDiff;
  });

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Daily Coding Challenges</h1>
        <p className="page-subtitle">Solve daily problems, maintain your streak, write clean code, and get mentor review feedback</p>
      </div>

      {/* Streak & Stats Header Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(229,9,20,0.05) 100%)',
          border: '1px solid rgba(229,9,20,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#e50914', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 20px rgba(229,9,20,0.5)'
          }}>
            <Flame size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{streakData.streak} Days</div>
            <div style={{ fontSize: '0.78rem', color: '#ff4d5a', fontWeight: 700, textTransform: 'uppercase' }}>Current Streak</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Code size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{streakData.totalSubmitted}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Challenges Solved</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--success-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{streakData.approvedCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Approved Solutions</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--warning-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Award size={24} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{streakData.approvalRate}%</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Approval Rate</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            className="form-input"
            placeholder="Search problem title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 150 }}
          value={filterDiff}
          onChange={(e) => setFilterDiff(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Challenges List Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Code size={36} color="var(--text-muted)" />
          <h3>No challenges found</h3>
          <p>Check back later for new daily coding challenges</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((c) => {
            const hasSubmitted = !!c.submission_id;
            const diffColor = c.difficulty === 'EASY' ? 'var(--success)' : c.difficulty === 'MEDIUM' ? 'var(--warning)' : '#e50914';

            return (
              <div key={c.id} className="task-card" style={{
                border: hasSubmitted ? '1px solid var(--border)' : '1px solid rgba(229,9,20,0.3)',
                background: 'var(--surface)'
              }}>
                <div className="task-card-header">
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: diffColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {c.difficulty}
                    </span>
                    <h3 className="task-card-title" style={{ marginTop: 2 }}>{c.title}</h3>
                  </div>

                  <Badge status={c.submission_status || 'PENDING'} />
                </div>

                <p className="task-card-desc">
                  {c.description.length > 140 ? c.description.slice(0, 140) + '...' : c.description}
                </p>

                {c.admin_feedback && (
                  <div style={{
                    background: 'rgba(229,9,20,0.1)',
                    border: '1px solid rgba(229,9,20,0.3)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    marginBottom: 14,
                    color: '#f8fafc'
                  }}>
                    <div style={{ fontWeight: 700, color: '#ff4d5a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <MessageSquare size={13} /> Mentor Feedback:
                    </div>
                    {c.admin_feedback}
                  </div>
                )}

                <div className="task-card-meta">
                  <span>📅 {fmtDate(c.challenge_date)}</span>
                  {hasSubmitted && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Updated: {fmtDate(c.submission_updated_at || c.submitted_at)}
                    </span>
                  )}
                </div>

                <div className="task-card-actions">
                  <button
                    className={`btn btn-sm ${hasSubmitted ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleOpenSolve(c)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {hasSubmitted ? <Pencil size={14} /> : <Code size={14} />}
                    {hasSubmitted ? 'Edit Solution' : 'Solve Challenge'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Solution Editor & Submission Modal */}
      {selectedChallenge && (
        <Modal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          title={selectedChallenge.title}
          subtitle={`Difficulty: ${selectedChallenge.difficulty} | Challenge Date: ${fmtDate(selectedChallenge.challenge_date)}`}
          maxWidth={720}
        >
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>Problem Description:</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', marginBottom: 14 }}>
              {selectedChallenge.description}
            </div>

            {selectedChallenge.examples && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Examples / Inputs:</h4>
                <pre style={{ fontSize: '0.8rem', background: '#0a0a12', padding: '10px', borderRadius: '6px', overflowX: 'auto', color: '#a5b4fc' }}>
                  {selectedChallenge.examples}
                </pre>
              </div>
            )}

            {selectedChallenge.constraints && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Constraints:</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedChallenge.constraints}
                </div>
              </div>
            )}

            {selectedChallenge.admin_feedback && (
              <div style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid #e50914', padding: '12px', borderRadius: '8px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#ff4d5a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MessageSquare size={14} /> Mentor Review Feedback:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {selectedChallenge.admin_feedback}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitSolution}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  Solution Code
                </label>
                
                <label
                  className="btn btn-sm btn-ghost"
                  style={{ cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', border: '1px solid rgba(229,9,20,0.3)', padding: '6px 12px' }}
                >
                  <Upload size={14} /> Upload Code File
                  <input
                    type="file"
                    accept=".js,.py,.java,.cpp,.c,.html,.css,.json,.txt,.md"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSolutionCode(event.target?.result || '');
                        toast.success(`Loaded file: ${file.name}`);
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>

              <textarea
                className="form-textarea"
                rows={10}
                placeholder="// Type code OR click 'Upload Code File' above to import your solution...
function solution(input) {
  // your implementation
  return result;
}"
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                required
                style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem', background: '#08080d', color: '#48cfad', lineHeight: 1.5 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Explanation & Time/Space Complexity Notes (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Time complexity O(N), Space complexity O(1)"
                value={solutionNotes}
                onChange={(e) => setSolutionNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '12px', justifyContent: 'center' }}
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : <Send size={16} />}
              {submitting ? 'Submitting...' : selectedChallenge.submission_id ? 'Update & Resubmit Solution' : 'Submit Solution Code'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

