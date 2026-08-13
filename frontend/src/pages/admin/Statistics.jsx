import { useEffect, useState } from 'react';
import { Users, ClipboardList, CheckSquare, Award, BarChart2, CheckCircle2, Clock, Link2, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import toast from 'react-hot-toast';

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <strong>{value}</strong>
      </div>
      <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function AdminStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.admin()
      .then(({ data }) => setData(data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  const { users, tasks, assignments, results } = data || {};
  const totalUsers = parseInt(users?.total || 0);
  const totalAssignments = parseInt(assignments?.total || 0);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Statistics</h1>
        <p className="page-subtitle">Platform analytics and performance metrics</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* User breakdown */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="var(--primary)" /> User Status Breakdown
          </div>
          <Bar label="Active" value={parseInt(users?.active || 0)} max={totalUsers} color="var(--success)" />
          <Bar label="Pending" value={parseInt(users?.pending || 0)} max={totalUsers} color="var(--warning)" />
          <Bar label="Rejected" value={parseInt(users?.rejected || 0)} max={totalUsers} color="var(--danger)" />
          <Bar label="Revoked" value={parseInt(users?.revoked || 0)} max={totalUsers} color="#a855f7" />
          <Bar label="Disabled" value={parseInt(users?.disabled || 0)} max={totalUsers} color="var(--text-muted)" />
        </div>

        {/* Assignment breakdown */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={18} color="var(--info)" /> Assignment Status Breakdown
          </div>
          <Bar label="In Progress" value={parseInt(assignments?.in_progress || 0)} max={totalAssignments} color="var(--info)" />
          <Bar label="Completed" value={parseInt(assignments?.completed || 0)} max={totalAssignments} color="var(--success)" />
          <Bar label="Not Started" value={parseInt(assignments?.not_started || 0)} max={totalAssignments} color="var(--warning)" />
          <Bar label="Removed" value={parseInt(assignments?.removed || 0)} max={totalAssignments} color="var(--danger)" />
        </div>
      </div>

      {/* Summary numbers */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={18} color="var(--warning)" /> Summary
        </div>
        <div className="grid-4">
          {[
            { label: 'Total Users', value: users?.total, icon: Users, color: 'var(--primary)' },
            { label: 'Total Tasks', value: tasks?.total, icon: CheckSquare, color: 'var(--info)' },
            { label: 'Published Tasks', value: tasks?.published, icon: CheckCircle2, color: 'var(--success)' },
            { label: 'Total Submissions', value: results?.total, icon: Award, color: 'var(--warning)' },
            { label: 'Total Assignments', value: assignments?.total, icon: Link2, color: '#a855f7' },
            { label: 'Completion Rate', value: totalAssignments > 0
                ? `${Math.round((parseInt(assignments?.completed || 0) / totalAssignments) * 100)}%`
                : '0%', icon: TrendingUp, color: 'var(--success)' },
            { label: 'Active Users', value: users?.active, icon: Users, color: 'var(--success)' },
            { label: 'Pending Approval', value: users?.pending, icon: Clock, color: 'var(--warning)' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <item.icon size={22} color={item.color} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{item.value ?? '—'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
