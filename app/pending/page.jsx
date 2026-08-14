'use client';
import { useRouter } from 'next/navigation';
import { Clock, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function Pending() {
    const { logout, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        toast('Logged out');
        router.push('/login');
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-brand">
                    <div className="auth-brand-icon"><Sparkles size={24} color="#fff" /></div>
                    <div className="auth-brand-title">Career With Chaithanya</div>
                    <div className="auth-brand-tagline">Learn. Complete. Grow.</div>
                </div>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px auto 20px' }}>
                    <Clock size={32} color="var(--warning)" />
                </div>
                <h1 className="auth-title">Account Pending Approval</h1>
                <p className="auth-subtitle" style={{ maxWidth: 320, margin: '8px auto 24px' }}>
                    Your account has been created successfully. Please wait for the administrator to review and approve your account.
                </p>
                {user && (
                    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24, textAlign: 'left' }}>
                        <div className="info-row"><span className="info-label">Name</span><span className="info-value">{user.name}</span></div>
                        <div className="info-row"><span className="info-label">Email</span><span className="info-value">{user.email}</span></div>
                        <div className="info-row" style={{ border: 'none' }}><span className="info-label">Status</span><span className="badge badge-pending">PENDING</span></div>
                    </div>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    You'll receive an email notification once your account is approved.
                </p>
                <button className="btn btn-ghost w-full" onClick={handleLogout}><LogOut size={16} /> Sign out</button>
            </div>
        </div>
    );
}
