import { useEffect, useState } from 'react';
import { Search, Calendar, Users, CheckCircle2, Paperclip, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskApi, assignmentApi } from '../../services/api';
import Badge from '../../components/UI/Badge';
import { fmtDate } from '../../utils/helpers';

export default function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [taking, setTaking] = useState({});

  const load = () => {
    setLoading(true);
    taskApi.list()
      .then(({ data }) => setTasks(data.tasks))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleTake = async (task) => {
    setTaking((t) => ({ ...t, [task.id]: true }));
    try {
      await assignmentApi.take(task.id);
      toast.success(`Task "${task.title}" added to your list!`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTaking((t) => ({ ...t, [task.id]: false }));
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Available Tasks</h1>
        <p className="page-subtitle">Browse and take official tasks to build your career</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            id="task-search"
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 300 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckCircle2 size={36} color="var(--text-muted)" /></div>
          <h3>No tasks available</h3>
          <p>Check back later for new tasks</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3 className="task-card-title">{task.title}</h3>
                <Badge status={task.my_status || 'PUBLISHED'} />
              </div>

              <p className="task-card-desc">{task.description || 'No description provided.'}</p>

              {task.proof_requirement && (
                <div style={{
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--primary)',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Paperclip size={14} /> Proof required: {task.proof_requirement}
                </div>
              )}

              <div className="task-card-meta">
                {task.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={13} /> Due: {fmtDate(task.deadline)}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} /> {task.assignment_count || 0} enrolled
                </span>
              </div>

              <div className="task-card-actions">
                {task.my_assignment_id ? (
                  <button className="btn btn-secondary btn-sm" disabled>
                    <CheckCircle2 size={14} /> Already Enrolled
                  </button>
                ) : (
                  <button
                    id={`take-task-${task.id}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => handleTake(task)}
                    disabled={taking[task.id]}
                  >
                    {taking[task.id] ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
                    Take Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
