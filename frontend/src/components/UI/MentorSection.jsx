import { useState, useEffect } from 'react';
import { Linkedin, Instagram, Youtube, ExternalLink, BookOpen, Rocket, CheckCircle2, Sparkles, Video, Play, Award, Users } from 'lucide-react';
import { settingsApi } from '../../services/api';

/**
 * Format any YouTube link into a clean embed link
 */
const getYoutubeEmbedUrl = (rawInput = '') => {
  if (!rawInput) return '';
  let str = rawInput.trim();

  // Extract src from <iframe src="..."> if raw iframe HTML was pasted
  const iframeSrcMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    str = iframeSrcMatch[1];
  }

  // Direct embed link: https://www.youtube.com/embed/ID
  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  // Standard watch link: https://www.youtube.com/watch?v=ID
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Short link: https://youtu.be/ID
  const shortMatch = str.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return str;
};

export default function MentorSection({ compact = false }) {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('bio');

  useEffect(() => {
    settingsApi.get()
      .then(({ data }) => setSettings(data.settings))
      .catch(console.error);
  }, []);

  const s = settings || {
    linkedin_url: 'https://www.linkedin.com/in/chaitanya-madakasira-77676934a',
    instagram_url: 'https://www.instagram.com/careerwithchaitanya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    mentor_name: 'Chaitanya Madakasira',
    mentor_title: 'Full-Stack Developer (MERN & Python) & Lead Educator',
    mentor_tagline: 'Learn. Complete. Grow.',
    mentor_bio: `Hi, I’m Chaitanya — a passionate Full-Stack Developer (MERN & Python) who transitioned into tech training to make a bigger impact.

From building apps at MedMate, ERT, and Cigniti to mentoring 10,000+ students and guiding 100+ trainers at 10,000 Coders, my journey has been all about turning code into careers and learning into real-world capability.

Over time, my role evolved beyond teaching — I now lead program strategy, cohort experience, and outcome-based training. I work on strengthening batch retention, enabling placement readiness, and building training systems that scale.

I design and execute initiatives like dummy hiring drives, mock interviews, real-world project sprints, skill-gap mapping, and job-readiness training, ensuring learners don’t just learn — they transform into confident professionals.`,
    mentor_focus: `Curriculum Design & Training Strategy | Learning & Development (L&D) Leadership | Corporate & Technical Training | Batch Retention & Program Management | Placement Enablement & Job Pipelines | Innovation in Tech Education (Agentic AI, Job Simulations, Future Skills)`,
    stats_students: '10,000+',
    stats_trainers: '100+',
    stats_projects: '500+',
    stats_hiring: '100+',
  };

  const focusList = s.mentor_focus.split('|').map(item => item.trim()).filter(Boolean);
  const embedYoutube = getYoutubeEmbedUrl(s.youtube_url);

  return (
    <div className="card" style={{
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(229,9,20,0.3)',
      background: 'linear-gradient(145deg, #0d0d14 0%, #050508 100%)',
      padding: compact ? '20px' : '32px',
      marginBottom: '28px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    }}>
      {/* Background ambient light - Crimson Red Aesthetic */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-60px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,9,20,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '260px 1fr',
        gap: '28px',
        alignItems: 'center',
      }}>
        {/* Mentor Image Showcase */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            position: 'relative',
            width: '210px',
            height: '210px',
            margin: '0 auto',
            borderRadius: '24px',
            padding: '4px',
            background: 'linear-gradient(135deg, #e50914, #6c63ff, #ff2b4a)',
            boxShadow: '0 8px 32px rgba(229,9,20,0.35)',
          }}>
            <img
              src="/chaithanya_hero.png"
              alt="Chaitanya Madakasira"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '20px',
                background: '#12121c',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#e50914',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(229,9,20,0.5)'
            }}>
              <Sparkles size={12} color="#fff" /> Lead Educator
            </div>
          </div>

          {/* Social Quick Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            {s.linkedin_url && (
              <a
                href={s.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{
                  background: '#0a66c2',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {s.instagram_url && (
              <a
                href={s.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}
              >
                <Instagram size={14} /> Instagram
              </a>
            )}
          </div>
        </div>

        {/* Info & Story Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: '#e50914',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
              padding: '4px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              FOUNDER & MENTOR
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              CAREER WITH CHAITHANYA
            </span>
          </div>

          <h2 style={{
            fontSize: compact ? '1.4rem' : '1.8rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '6px'
          }}>
            {s.mentor_name}
          </h2>

          <p style={{
            color: '#ff4d5a',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '16px'
          }}>
            {s.mentor_title}
          </p>

          {/* Raw Talks Aesthetic Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.02)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(229,9,20,0.2)'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e50914' }}>{s.stats_students}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Students Mentored</div>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6c63ff' }}>{s.stats_trainers}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trainers Guided</div>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ff2b4a' }}>{s.stats_hiring}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hiring Drives & Sprints</div>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>{s.stats_projects}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Real-World Projects</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'bio' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveTab('bio')}
              style={{ fontSize: '0.78rem' }}
            >
              <BookOpen size={13} /> Journey & Bio
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'video' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveTab('video')}
              style={{ fontSize: '0.78rem' }}
            >
              <Video size={13} /> Featured Video & Sessions
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'focus' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveTab('focus')}
              style={{ fontSize: '0.78rem' }}
            >
              <Rocket size={13} /> Core Initiatives
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'embeds' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveTab('embeds')}
              style={{ fontSize: '0.78rem' }}
            >
              <Linkedin size={13} /> Social Cards
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'bio' && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {s.mentor_bio}
            </div>
          )}

          {activeTab === 'video' && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Play size={14} color="#e50914" /> Tech Talks & Podcast Sprint
                </span>
                {s.youtube_url && (
                  <a href={s.youtube_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#e50914', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Watch on YouTube <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {embedYoutube ? (
                <div style={{
                  maxWidth: '680px',
                  margin: '0 auto',
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid rgba(229,9,20,0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                }}>
                  <iframe
                    src={embedYoutube}
                    title="Featured Tech Video"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <p>No video URL configured yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'focus' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {focusList.map((item, idx) => (
                <div key={idx} style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                }}>
                  <CheckCircle2 size={15} color="#e50914" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'embeds' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '10px' }}>
              {/* LinkedIn Preview Card */}
              <div style={{
                background: '#0a1726',
                border: '1px solid rgba(10,102,194,0.4)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Chaitanya Madakasira</div>
                    <div style={{ fontSize: '0.72rem', color: '#8bb4e7' }}>LinkedIn Official</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#b0c4de', marginBottom: '14px', lineHeight: 1.5 }}>
                  Full-Stack Developer (MERN & Python) | L&D Leader | Mentored 10,000+ Students | Job Readiness Strategy
                </p>
                <a
                  href={s.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm w-full"
                  style={{ background: '#0a66c2', color: '#fff', justifyContent: 'center' }}
                >
                  View LinkedIn Profile <ExternalLink size={13} />
                </a>
              </div>

              {/* Instagram Preview Card */}
              <div style={{
                background: '#1c0a15',
                border: '1px solid rgba(220,39,67,0.4)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Instagram size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>@careerwithchaitanya</div>
                    <div style={{ fontSize: '0.72rem', color: '#f593b4' }}>Instagram Community</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#e8b4cb', marginBottom: '14px', lineHeight: 1.5 }}>
                  Career & Tech Insights | Placement Enablement | Daily Motivation & Sprint Mentorship
                </p>
                <a
                  href={s.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm w-full"
                  style={{
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                    color: '#fff',
                    justifyContent: 'center'
                  }}
                >
                  Follow on Instagram <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
