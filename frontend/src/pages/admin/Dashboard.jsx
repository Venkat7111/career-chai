import { useEffect, useState } from 'react';
import { Users, CheckSquare, ClipboardList, Award, TrendingUp, Clock } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import Badge from '../../components/UI/Badge';
import { fmtRelative, initials } from '../../utils/helpers';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: bg }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
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

  const { users, tasks, assignments, results, recentUsers, recentLogins, recentAssignments, recentResults } = data || {};

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and statistics</p>
      </div>

      {/* User stats */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>
          <Users size={16} /> Users
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Users" value={users?.total} color="var(--primary)" bg="var(--primary-light)" />
        <StatCard icon={Clock} label="Pending" value={users?.pending} color="var(--warning)" bg="var(--warning-light)" />
        <StatCard icon={TrendingUp} label="Active" value={users?.active} color="var(--success)" bg="var(--success-light)" />
        <StatCard icon={Users} label="Rejected/Revoked" value={Number(users?.rejected || 0) + Number(users?.revoked || 0)} color="var(--danger)" bg="var(--danger-light)" />
      </div>

      {/* Task + Assignment stats */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>
            <CheckSquare size={16} /> Tasks
          </div>
          <div className="grid-2">
            <StatCard icon={CheckSquare} label="Total Tasks" value={tasks?.total} color="var(--primary)" bg="var(--primary-light)" />
            <StatCard icon={CheckSquare} label="Published" value={tasks?.published} color="var(--success)" bg="var(--success-light)" />
          </div>
        </div>
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>
            <ClipboardList size={16} /> Assignments
          </div>
          <div className="grid-2">
            <StatCard icon={ClipboardList} label="In Progress" value={assignments?.in_progress} color="var(--info)" bg="var(--info-light)" />
            <StatCard icon={Award} label="Completed" value={assignments?.completed} color="var(--success)" bg="var(--success-light)" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid-2">
        {/* Recent registrations */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><Users size={16} /> Recent Registrations</div>
          </div>
          {!recentUsers?.length ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No recent registrations</p>
            </div>
          ) : recentUsers.map((u) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {initials(u.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <Badge status={u.status} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtRelative(u.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent logins */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><Clock size={16} /> Recent Logins</div>
          </div>
          {!recentLogins?.length ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No recent logins</p>
            </div>
          ) : recentLogins.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {initials(l.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.email}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fmtRelative(l.logged_in_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
