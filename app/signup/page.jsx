'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/api';

export default function Signup() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await authApi.signup(form);
            toast.success('Account created! Awaiting admin approval.');
            router.push('/pending');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 460 }}>
                <div className="auth-brand">
                    <div className="auth-brand-icon"><Sparkles size={24} color="#fff" /></div>
                    <div className="auth-brand-title">Career With Chaithanya</div>
                    <div className="auth-brand-tagline">Learn. Complete. Grow.</div>
                </div>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Join the platform and start your career journey</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-name">Full Name</label>
                        <input id="signup-name" className="form-input" type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email Address</label>
                        <input id="signup-email" className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" htmlFor="signup-password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input id="signup-password" className="form-input" type={showPwd ? 'text' : 'password'} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} style={{ paddingRight: 42 }} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
                            <input id="signup-confirm" className="form-input" type={showPwd ? 'text' : 'password'} name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '12px 0 16px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Info size={14} color="var(--primary)" /> Your account will require admin approval before you can access the platform.
                    </p>
                    <button id="signup-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? <span className="spinner" /> : <UserPlus size={18} />}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <div className="auth-footer-link">
                    Already have an account? <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
