'use client';
import { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Award, Code, Send, Pencil, Search, Clock, AlertTriangle, Sparkles, MessageSquare, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { challengeApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import Modal from '@/components/UI/Modal';
import { fmtDate, fmtDateTime } from '@/utils/helpers';

const BOILERPLATE_TEMPLATES = {
  javascript: `// JavaScript Solution
function solution(s) {
    // Write your code here
    return "";
}

// Example usage:
// console.log(solution("the sky is blue"));
`,
  python: `# Python Solution
def solution(s: str) -> str:
    # Write your code here
    return ""

# Example usage:
# print(solution("the sky is blue"))
`,
  python3: `# Python 3 Solution
def solution(s: str) -> str:
    # Write your code here
    return ""

# Example usage:
# print(solution("the sky is blue"))
`,
  java: `// Java Solution
import java.util.*;

public class Main {
    public static String solution(String s) {
        // Write your code here
        return "";
    }

    public static void main(String[] args) {
        // Test your solution here
        System.out.println(solution("the sky is blue"));
    }
}
`,
  cpp: `// C++ Solution
#include <iostream>
#include <string>

using namespace std;

string solution(string s) {
    // Write your code here
    return "";
}

int main() {
    // Test your solution here
    cout << solution("the sky is blue") << endl;
    return 0;
}
`,
  c: `/* C Solution */
#include <stdio.h>
#include <string.h>

void solution(char* s, char* result) {
    /* Write your code here */
    strcpy(result, "");
}

int main() {
    char result[100];
    solution("the sky is blue", result);
    printf("%s\\n", result);
    return 0;
}
`
};

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
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [stdinInput, setStdinInput] = useState('');
  const [compilationOutput, setCompilationOutput] = useState(null);
  const [compiling, setCompiling] = useState(false);
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
    const savedLang = c.language || 'javascript';
    setSelectedLanguage(savedLang);
    setSolutionNotes(c.notes || '');
    setStdinInput('');
    setCompilationOutput(null);
    if (c.solution_code) {
      setSolutionCode(c.solution_code);
    } else {
      setSolutionCode(BOILERPLATE_TEMPLATES[savedLang] || '');
    }
  };

  const handleLanguageChange = (lang) => {
    const prevLang = selectedLanguage;
    setSelectedLanguage(lang);

    const prevBoilerplate = BOILERPLATE_TEMPLATES[prevLang]?.trim();
    const isTemplateOrEmpty = !solutionCode.trim() || solutionCode.trim() === prevBoilerplate;

    if (isTemplateOrEmpty) {
      setSolutionCode(BOILERPLATE_TEMPLATES[lang] || '');
    }
  };

  const handleRunCode = async () => {
    if (!solutionCode.trim()) {
      toast.error('Please write some code first');
      return;
    }
    setCompiling(true);
    setCompilationOutput(null);
    try {
      const response = await challengeApi.compile({
        language: selectedLanguage,
        code: solutionCode,
        stdin: stdinInput
      });
      setCompilationOutput(response.data);
      if (response.data.run?.stderr) {
        toast.error('Code execution finished with some errors!');
      } else {
        toast.success('Code executed successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Sandbox execution failed');
      setCompilationOutput({ error: err.message || 'Sandbox execution failed' });
    } finally {
      setCompiling(false);
    }
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
        language: selectedLanguage,
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
          maxWidth={1200}
        >
          <div className="challenge-split-container">
            {/* Left Side: Question Pane */}
            <div className="challenge-left-pane">
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>Problem Description:</h4>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', marginBottom: 14 }}>
                  {selectedChallenge.description}
                </div>
              </div>

              {selectedChallenge.examples && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Examples / Inputs:</h4>
                  <pre style={{ fontSize: '0.82rem', background: '#0a0a12', padding: '12px', borderRadius: '8px', overflowX: 'auto', color: '#a5b4fc', fontFamily: 'monospace' }}>
                    {selectedChallenge.examples}
                  </pre>
                </div>
              )}

              {selectedChallenge.constraints && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Constraints:</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '12px', borderRadius: '8px' }}>
                    {selectedChallenge.constraints}
                  </div>
                </div>
              )}

              {selectedChallenge.admin_feedback && (
                <div style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid #e50914', padding: '16px', borderRadius: '12px', marginTop: 10 }}>
                  <div style={{ fontWeight: 700, color: '#ff4d5a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MessageSquare size={14} /> Mentor Review Feedback:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                    {selectedChallenge.admin_feedback}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Compiler & Console Pane */}
            <form onSubmit={handleSubmitSolution} className="challenge-right-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: 4 }}>Language Selector</label>
                  <select
                    className="form-select"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>

                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
                >
                  <Upload size={14} /> Upload Code File
                  <input
                    type="file"
                    accept=".js,.py,.java,.cpp,.c,.txt"
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

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: 4 }}>Solution Code</label>
                <textarea
                  className="form-textarea"
                  placeholder="// Paste or write code here..."
                  value={solutionCode}
                  onChange={(e) => setSolutionCode(e.target.value)}
                  required
                  style={{
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.85rem',
                    background: '#08080d',
                    color: '#48cfad',
                    lineHeight: 1.5,
                    flex: 1,
                    minHeight: '280px',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: 4 }}>Complexity / Execution Notes (Optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Time complexity O(N), Space complexity O(1)"
                  value={solutionNotes}
                  onChange={(e) => setSolutionNotes(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                />
              </div>

              {/* Run Code Custom Inputs Panel */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                <input
                  className="form-input"
                  placeholder="Custom inputs stdin (e.g. input parameter values)..."
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                />

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRunCode}
                  disabled={compiling}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: '38px', padding: '0 16px' }}
                >
                  {compiling ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Code size={14} />}
                  Run Code
                </button>
              </div>

              {/* Console Execution Display logs */}
              {compilationOutput && (
                <div className="compiler-console">
                  <div className="compiler-console-header">
                    <span>Integrated Execution Console</span>
                    <span style={{ color: compilationOutput.run?.stderr ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                      {compilationOutput.run?.stderr ? 'Execution Error' : `Exit Code: ${compilationOutput.run?.code ?? 0}`}
                    </span>
                  </div>
                  <div className="compiler-console-body">
                    {compilationOutput.run?.stdout && (
                      <div style={{ color: '#a5b4fc', marginBottom: 6 }}>
                        <strong>Output (stdout):</strong>
                        <pre style={{ marginTop: 4, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{compilationOutput.run.stdout}</pre>
                      </div>
                    )}
                    {compilationOutput.run?.stderr && (
                      <div style={{ color: '#ff4d5a' }}>
                        <strong>Error (stderr):</strong>
                        <pre style={{ marginTop: 4, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{compilationOutput.run.stderr}</pre>
                      </div>
                    )}
                    {!compilationOutput.run?.stdout && !compilationOutput.run?.stderr && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        {compilationOutput.error || 'Execution completed with no printed output.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? <span className="spinner" /> : <Send size={16} />}
                {submitting ? 'Submitting...' : selectedChallenge.submission_id ? 'Update & Resubmit Solution' : 'Submit Solution Code'}
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
