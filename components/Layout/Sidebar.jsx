'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, CheckSquare, ClipboardList, Award,
    History, ListTodo, User, LogOut, Menu, X, Sparkles, Flame
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/utils/helpers';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/challenges', icon: Flame, label: 'Daily Challenges' },
    { to: '/tasks', icon: CheckSquare, label: 'Available Tasks' },
    { to: '/my-tasks', icon: ClipboardList, label: 'My Tasks' },
    { to: '/results', icon: Award, label: 'Results' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/todos', icon: ListTodo, label: 'My To-Do' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
    };

    return (
        <>
            <button
                className="btn btn-ghost btn-icon"
                style={{ position: 'fixed', top: 16, left: 16, zIndex: 200, display: 'none' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                id="sidebar-toggle"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-logo">
                        <div className="sidebar-brand-icon"><Sparkles size={20} color="#fff" /></div>
                        <div className="sidebar-brand-name">Career With<br />Chaithanya</div>
                    </div>
                    <div className="sidebar-brand-tagline">Learn. Complete. Grow.</div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Menu</div>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            href={to}
                            className={`sidebar-nav-item ${pathname === to ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{initials(user?.name)}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleLogout} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
