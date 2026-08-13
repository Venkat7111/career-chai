import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/Layout/Sidebar';
import AdminSidebar from './components/Layout/AdminSidebar';

// Auth pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pending from './pages/Pending';

// User pages
import Dashboard from './pages/user/Dashboard';
import DailyChallenges from './pages/user/DailyChallenges';
import AvailableTasks from './pages/user/AvailableTasks';
import MyTasks from './pages/user/MyTasks';
import Results from './pages/user/Results';
import History from './pages/user/History';
import Todos from './pages/user/Todos';
import Profile from './pages/user/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminChallenges from './pages/admin/Challenges';
import AdminUsers from './pages/admin/Users';
import AdminTasks from './pages/admin/Tasks';
import AdminAssignments from './pages/admin/Assignments';
import AdminResults from './pages/admin/Results';
import AdminStatistics from './pages/admin/Statistics';
import AdminSettings from './pages/admin/Settings';

// ─── Loading screen ───────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="loading-page">
      <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</span>
    </div>
  );
}

// ─── Protected route helpers ──────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && user.status === 'PENDING')
    return <Navigate to="/pending" replace />;
  if (user.role !== 'admin' && user.status !== 'ACTIVE')
    return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.status === 'PENDING') return <Navigate to="/pending" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ─── Layouts ──────────────────────────────────────────────────
function UserLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content animate-fade">{children}</main>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <main className="main-content animate-fade">{children}</main>
    </div>
  );
}

// ─── App routes ───────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login"  element={<RequireGuest><Login /></RequireGuest>} />
      <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />
      <Route path="/pending" element={<Pending />} />

      {/* User */}
      <Route path="/dashboard" element={
        <RequireAuth><UserLayout><Dashboard /></UserLayout></RequireAuth>
      } />
      <Route path="/challenges" element={
        <RequireAuth><UserLayout><DailyChallenges /></UserLayout></RequireAuth>
      } />
      <Route path="/tasks" element={
        <RequireAuth><UserLayout><AvailableTasks /></UserLayout></RequireAuth>
      } />
      <Route path="/my-tasks" element={
        <RequireAuth><UserLayout><MyTasks /></UserLayout></RequireAuth>
      } />
      <Route path="/results" element={
        <RequireAuth><UserLayout><Results /></UserLayout></RequireAuth>
      } />
      <Route path="/history" element={
        <RequireAuth><UserLayout><History /></UserLayout></RequireAuth>
      } />
      <Route path="/todos" element={
        <RequireAuth><UserLayout><Todos /></UserLayout></RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth><UserLayout><Profile /></UserLayout></RequireAuth>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/challenges" element={
        <RequireAdmin><AdminLayout><AdminChallenges /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/users" element={
        <RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/tasks" element={
        <RequireAdmin><AdminLayout><AdminTasks /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/assignments" element={
        <RequireAdmin><AdminLayout><AdminAssignments /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/results" element={
        <RequireAdmin><AdminLayout><AdminResults /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/statistics" element={
        <RequireAdmin><AdminLayout><AdminStatistics /></AdminLayout></RequireAdmin>
      } />
      <Route path="/admin/settings" element={
        <RequireAdmin><AdminLayout><AdminSettings /></AdminLayout></RequireAdmin>
      } />

      {/* Fallbacks */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
