'use client';
import { useState, useEffect } from 'react';
import { Save, Linkedin, Instagram, Youtube, Sparkles, Shield, User, BarChart2, Mail, Calendar, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '@/services/api';
import { fmtDateTime } from '@/utils/helpers';

export default function AdminSettings() {
  const [form, setForm] = useState({
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
    youtube_videos: '',
    mentor_name: '',
    mentor_title: '',
    mentor_quote: '',
    mentor_bio: '',
    mentor_focus: '',
    stats_students: '',
    stats_trainers: '',
    stats_projects: '',
    stats_hiring: '',
  });
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'inquiries'

  useEffect(() => {
    Promise.all([
      settingsApi.get(),
      settingsApi.getInquiries().catch(() => ({ data: { inquiries: [] } }))
    ]).then(([settRes, inqRes]) => {
      if (settRes.data?.settings) setForm(settRes.data.settings);
      if (inqRes.data?.inquiries) setInquiries(inqRes.data.inquiries);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update(form);
      toast.success('Platform profile & video gallery settings updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Platform & Media Settings</h1>
          <p className="page-subtitle">Configure social profile links, YouTube video embeds, mentor bio, and view contact submissions</p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('settings')}
          >
            Platform Settings
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <Mail size={14} /> Contact Leads ({inquiries.length})
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <form onSubmit={handleSubmit} style={{ maxWidth: '840px' }}>
          {/* Social Profiles & Video Embed Links */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--primary)" /> Social Profiles & Video Embed Links
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Linkedin size={14} color="#0a66c2" /> LinkedIn Profile URL
              </label>
              <input
                className="form-input"
                type="url"
                name="linkedin_url"
                placeholder="https://www.linkedin.com/in/chaitanya-madakasira-77676934a"
                value={form.linkedin_url}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Instagram size={14} color="#dc2743" /> Instagram Profile URL
              </label>
              <input
                className="form-input"
                type="url"
                name="instagram_url"
                placeholder="https://www.instagram.com/careerwithchaitanya"
                value={form.instagram_url}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Youtube size={14} color="#e50914" /> Featured YouTube Video Links (Comma-separated for Multiple Videos)
              </label>
              <textarea
                className="form-textarea"
                name="youtube_videos"
                rows={3}
                placeholder="https://www.youtube.com/embed/VIDEO_ID1, https://www.youtube.com/watch?v=VIDEO_ID2"
                value={form.youtube_videos || form.youtube_url}
                onChange={handleChange}
                style={{ minHeight: 70 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Paste YouTube video links separated by commas. They will automatically display as responsive video embed players on the public Landing Page!
              </span>
            </div>
          </div>

          {/* Mentor Profile Information */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="var(--secondary)" /> Mentor Profile & Bio
            </div>

            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mentor Name</label>
                <input
                  className="form-input"
                  name="mentor_name"
                  value={form.mentor_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title / Role</label>
                <input
                  className="form-input"
                  name="mentor_title"
                  value={form.mentor_title}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quote / Subtitle</label>
              <input
                className="form-input"
                name="mentor_quote"
                value={form.mentor_quote}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Journey Story</label>
              <textarea
                className="form-textarea"
                name="mentor_bio"
                rows={6}
                value={form.mentor_bio}
                onChange={handleChange}
                style={{ minHeight: 120 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Core Initiatives (Separated by |)</label>
              <textarea
                className="form-textarea"
                name="mentor_focus"
                rows={3}
                value={form.mentor_focus}
                onChange={handleChange}
                style={{ minHeight: 80 }}
              />
            </div>
          </div>

          {/* Statistics Counters */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={18} color="var(--warning)" /> Impact Statistics Counters
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Students Mentored</label>
                <input
                  className="form-input"
                  name="stats_students"
                  value={form.stats_students}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trainers Guided</label>
                <input
                  className="form-input"
                  name="stats_trainers"
                  value={form.stats_trainers}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row" style={{ margin: 0 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hiring Drives</label>
                <input
                  className="form-input"
                  name="stats_hiring"
                  value={form.stats_hiring}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Real-World Projects</label>
                <input
                  className="form-input"
                  name="stats_projects"
                  value={form.stats_projects}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : <Save size={18} />}
            {saving ? 'Saving Changes...' : 'Save Platform Settings'}
          </button>
        </form>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div style={{ maxWidth: '900px' }}>
          {inquiries.length === 0 ? (
            <div className="empty-state">
              <Mail size={36} color="var(--text-muted)" />
              <h3>No contact leads yet</h3>
              <p>Inquiries submitted via "Let's Collaborate" on the homepage will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {inquiries.map((inq) => (
                <div key={inq.id} className="card" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{inq.name}</h3>
                      <span className="badge badge-active" style={{ fontSize: '0.72rem', marginTop: 4 }}>
                        {inq.reason || 'General Inquiry'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {fmtDateTime(inq.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {inq.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} /> {inq.phone}</span>}
                    {inq.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {inq.city}</span>}
                  </div>

                  {inq.requirement && (
                    <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      "{inq.requirement}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

