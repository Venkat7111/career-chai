'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, CheckSquare, ClipboardList,
    Award, BarChart3, Settings, LogOut, Shield, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/utils/helpers';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/challenges', icon: Flame, label: 'Daily Challenges' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/admin/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/admin/results', icon: Award, label: 'Results' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-logo">
                    <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg,#e50914,#6c63ff)' }}>
                        <Shield size={20} color="#fff" />
                    </div>
                    <div className="sidebar-brand-name">Admin Panel<br /><span style={{ color: 'var(--primary)', fontSize: '0.65rem' }}>Career With Chaithanya</span></div>
                </div>
                <div className="sidebar-brand-tagline">Admin Control Center</div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-label">Administration</div>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <Link key={to} href={to} className={`sidebar-nav-item ${pathname === to ? 'active' : ''}`}>
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg,#f7b731,#ef4444)' }}>
                        {initials(user?.name)}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role" style={{ color: 'var(--warning)' }}>Administrator</div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={handleLogout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
