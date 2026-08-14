'use client';
import { useEffect, useState } from 'react';
import { assignmentApi } from '@/services/api';
import Badge from '@/components/UI/Badge';
import { fmtDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function History() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentApi.history()
      .then(({ data }) => setAssignments(data.assignments))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Task History</h1>
        <p className="page-subtitle">Complete history of all your task assignments</p>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>No history yet</h3>
          <p>Your task assignments will appear here</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.task_title}</strong>
                    {a.removal_reason && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 3 }}>
                        Removed: {a.removal_reason}
                      </div>
                    )}
                  </td>
                  <td><Badge status={a.status} /></td>
                  <td style={{ fontSize: '0.82rem' }}>{fmtDate(a.created_at)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{fmtDate(a.started_at)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{fmtDate(a.completed_at)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{fmtDate(a.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

