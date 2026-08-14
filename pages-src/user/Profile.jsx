'use client';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, ShieldCheck, Calendar, Info } from 'lucide-react';
import Badge from '@/components/UI/Badge';
import { fmtDateTime, initials } from '@/utils/helpers';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Your account information</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card">
          {/* Avatar header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            marginBottom: 28, paddingBottom: 28,
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: '#fff',
              boxShadow: 'var(--shadow-glow)',
            }}>
              {initials(user?.name)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
              <Badge status={user?.status || 'ACTIVE'} />
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="info-row">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Name
              </span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> Email
              </span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} /> Role
              </span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Member Since
              </span>
              <span className="info-value">{fmtDateTime(user?.created_at) || '—'}</span>
            </div>
          </div>

          <div style={{
            marginTop: 24,
            padding: '16px',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} /> To update your profile or change your password, please contact the administrator.
          </div>
        </div>
      </div>
    </div>
  );
}

