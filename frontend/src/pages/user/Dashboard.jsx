import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, Award, CalendarDays, CheckCircle2, Sparkles } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/UI/Badge';
import { fmtDate, fmtRelative } from '../../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.user()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  const { tasks, todos, todaysTasks } = data || {};

  return (
    <div className="animate-fade">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <h2>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p>Here's your progress overview for today</p>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-light)' }}>
            <CheckSquare size={22} color="var(--primary)" />
          </div>
          <div className="stat-card-value">{tasks?.total || 0}</div>
          <div className="stat-card-label">My Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-light)' }}>
            <Clock size={22} color="var(--info)" />
          </div>
          <div className="stat-card-value">{tasks?.in_progress || 0}</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-light)' }}>
            <Award size={22} color="var(--success)" />
          </div>
          <div className="stat-card-value">{tasks?.completed || 0}</div>
          <div className="stat-card-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-light)' }}>
            <CalendarDays size={22} color="var(--warning)" />
          </div>
          <div className="stat-card-value">{todos?.pending || 0}</div>
          <div className="stat-card-label">Pending To-Dos</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Today's Tasks */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <CalendarDays size={18} color="var(--primary)" />
              Today's Tasks
            </div>
            <Link to="/my-tasks" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {todaysTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon">📅</div>
              <h3>No tasks due today</h3>
              <p>Enjoy your day or explore available tasks</p>
            </div>
          ) : (
            <div>
              {todaysTasks?.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.task_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Due: {fmtDate(t.deadline)}
                    </div>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick To-Do */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <CheckCircle2 size={18} color="var(--primary)" />
              Personal To-Do
            </div>
            <Link to="/todos" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {(todos?.total || 0) === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon"><CheckCircle2 size={32} color="var(--text-muted)" /></div>
              <h3>No to-dos yet</h3>
              <p>Add your first to-do item</p>
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{
                padding: '10px 0',
                display: 'flex', justifyContent: 'space-between',
                color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckSquare size={14} /> Total</span><strong>{todos?.total}</strong>
              </div>
              <div style={{
                padding: '10px 0',
                display: 'flex', justifyContent: 'space-between',
                color: 'var(--success)', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14} /> Completed</span><strong>{todos?.done}</strong>
              </div>
              <div style={{
                padding: '10px 0',
                display: 'flex', justifyContent: 'space-between',
                color: 'var(--warning)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Pending</span><strong>{todos?.pending}</strong>
              </div>
              <Link to="/todos" className="btn btn-secondary w-full" style={{ marginTop: 16, justifyContent: 'center' }}>
                Manage To-Dos →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="var(--primary)" /> Quick Actions
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/tasks" className="btn btn-primary">Browse Available Tasks</Link>
          <Link to="/my-tasks" className="btn btn-secondary">My Task Board</Link>
          <Link to="/todos" className="btn btn-secondary">My To-Do List</Link>
          <Link to="/results" className="btn btn-secondary">View Submissions</Link>
        </div>
      </div>
    </div>
  );
}
