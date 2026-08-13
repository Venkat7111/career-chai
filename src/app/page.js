'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Instagram, Youtube, Linkedin, Send, Play, CheckCircle2, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const getYoutubeEmbedUrl = (rawInput = '') => {
  if (!rawInput) return '';
  let str = rawInput.trim();

  const iframeSrcMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    str = iframeSrcMatch[1];
  }

  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return str;
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    city: '',
    reason: 'Tech Mentorship',
    requirement: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : { user: null })
      .then(d => setUser(d.user))
      .catch(() => {});

    fetch('/api/settings')
      .then(res => res.json())
      .then(d => setSettings(d.settings))
      .catch(console.error);
  }, []);

  const s = settings || {
    linkedin_url: 'https://www.linkedin.com/in/chaitanya-madakasira-77676934a',
    instagram_url: 'https://www.instagram.com/careerwithchaitanya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    youtube_url: 'https://www.youtube.com/embed/b96o4XwueHE',
    youtube_videos: 'https://www.youtube.com/embed/b96o4XwueHE, https://www.youtube.com/embed/w7ejDZ8SWv8',
    mentor_name: 'Chaitanya Madakasira',
    mentor_title: 'Full-Stack Developer (MERN & Python) & Lead Educator',
    mentor_quote: 'Experience is not the number of years we spent, it’s the number of situations we faced.',
    mentor_bio: `Hi, I’m Chaitanya — a passionate Full-Stack Developer (MERN & Python) who transitioned into tech training to make a bigger impact.

From building apps at MedMate, ERT, and Cigniti to mentoring 10,000+ students and guiding 100+ trainers at 10,000 Coders, my journey has been all about turning code into careers and learning into real-world capability.`,
    stats_students: '10,000+',
    stats_trainers: '100+',
    stats_projects: '500+',
    stats_hiring: '100+',
  };

  const videoList = (s.youtube_videos || s.youtube_url || '')
    .split(',')
    .map(v => getYoutubeEmbedUrl(v.trim()))
    .filter(Boolean);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (!res.ok) throw new Error('Submission failed');
      toast.success('Thank you! Your message has been submitted.');
      setContactForm({ name: '', phone: '', city: '', reason: 'Tech Mentorship', requirement: '' });
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = [
    { handle: '@gaddamabhishek229', text: 'I am happy to see this type of quality content in our tech community. The practical guidance is unmatched!' },
    { handle: '@travel_life197', text: 'This is the first video & module I watched without skipping! Tq so much Chaitanya bro for this great guidance.' },
    { handle: '@RamyaKollu', text: 'Honestly great work. We should support mentors who make the tech world better by uploading practical content in simple words.' },
    { handle: '@ManojKumar-yc1hf', text: 'One of the best talks & job readiness frameworks I have seen in recent times. Thanks for bringing this to us!' },
    { handle: '@naveen0005', text: 'Great podcast & project sprints worth watching. Keep going! Indians are the backbone of software era.' },
    { handle: '@kiranKumarKyasa', text: 'I was looking for this kind of outcome-based content for tech careers. Tremendous value getting delivered!' },
  ];

  return (
    <div style={{ background: '#050508', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(5, 5, 8, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(229,9,20,0.2)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#e50914',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.2rem',
            color: '#fff',
            boxShadow: '0 0 16px rgba(229,9,20,0.6)'
          }}>
            CC
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em', color: '#fff' }}>
              CAREER WITH CHAITHANYA
            </div>
            <div style={{ fontSize: '0.7rem', color: '#e50914', fontWeight: 600 }}>
              Learn. Complete. Grow.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="btn btn-sm" style={{ background: '#e50914', color: '#fff', fontWeight: 700 }}>
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm" style={{ color: '#fff' }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-sm" style={{ background: '#e50914', color: '#fff', fontWeight: 700, borderRadius: '6px' }}>
                Join Community
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Hero Showcase */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          padding: '40px 0 60px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              position: 'relative',
              maxWidth: '360px',
              margin: '0 auto',
              borderRadius: '20px',
              padding: '6px',
              background: 'linear-gradient(145deg, #e50914 0%, #1a1a2e 100%)',
              boxShadow: '0 12px 40px rgba(229,9,20,0.3)'
            }}>
              <img
                src="/chaithanya_hero.png"
                alt="Chaitanya Madakasira"
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  display: 'block',
                  background: '#0d0d14'
                }}
              />
            </div>
          </div>

          <div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              color: '#e50914',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}>
              {s.mentor_name}
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px',
              fontStyle: 'italic'
            }}>
              "{s.mentor_quote || 'Experience is not the number of years we spent, it’s the number of situations we faced.'}"
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <a
                href={s.instagram_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  minWidth: '130px',
                  background: '#12121c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                }}
              >
                <Instagram size={24} color="#dc2743" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{s.stats_students}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mentored Students</div>
              </a>

              <a
                href={s.linkedin_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  minWidth: '130px',
                  background: '#12121c',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                }}
              >
                <Linkedin size={24} color="#0a66c2" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{s.stats_trainers}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guided Trainers</div>
              </a>
            </div>

            <Link
              href="/signup"
              className="btn btn-lg"
              style={{
                background: '#e50914',
                color: '#fff',
                fontWeight: 800,
                padding: '16px 36px',
                borderRadius: '8px',
                fontSize: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(229,9,20,0.4)'
              }}
            >
              JOIN THE COMMUNITY
            </Link>
          </div>
        </section>

        {/* What is Career With Chaithanya */}
        <section style={{ padding: '60px 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '12px' }}>
            What is <span style={{ color: '#e50914' }}>Career With Chaithanya?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 24px', lineHeight: 1.7, fontSize: '1rem' }}>
            It’s not just about learning code; it’s about turning code into careers and learning into real-world capability.
            From building apps at MedMate, ERT, and Cigniti to leading program strategy & cohort experience at 10,000 Coders.
          </p>
          <div style={{
            fontSize: '1.3rem',
            fontFamily: 'serif',
            fontStyle: 'italic',
            color: '#ff4d5a',
            fontWeight: 700
          }}>
            Chaitanya Madakasira
          </div>
        </section>

        {/* Horizontal Scroll Side-by-Side YouTube Video Gallery */}
        {videoList.length > 0 && (
          <section style={{ padding: '36px 0 50px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>
                <span style={{ color: '#e50914' }}>Featured Videos</span> & Sessions
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Practical Tech Talks & Mentorship Episodes</p>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '16px',
              justifyContent: videoList.length === 1 ? 'center' : 'flex-start',
            }}>
              {videoList.map((vUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: '0 0 auto',
                    width: videoList.length === 1 ? 'min(440px, 90vw)' : '320px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#12121c',
                    border: '1px solid rgba(229,9,20,0.3)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    background: '#000'
                  }}>
                    <iframe
                      src={vUrl}
                      title={`Featured Session ${idx + 1}`}
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Learner Reviews */}
        <section style={{
          background: 'linear-gradient(135deg, #cc0812 0%, #80050b 100%)',
          borderRadius: '24px',
          padding: '48px 32px',
          margin: '40px 0 60px',
          boxShadow: '0 12px 40px rgba(229,9,20,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
              Our Learners Are the Wordsmiths!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>They keep us charging!</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {reviews.map((r, idx) => (
              <div key={idx} style={{
                background: '#12121c',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ff4d5a', marginBottom: '8px' }}>
                  {r.handle}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  "{r.text}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Let's Collaborate Form */}
        <section style={{
          background: '#12121c',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '40px',
          margin: '40px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
              Let's Collaborate
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Time to Start the Conversation.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Looking for a mentor, trainer, or collaborator in shaping future tech talent? Fill in the details and let's connect!
            </div>
          </div>

          <form onSubmit={handleContactSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>NAME</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
                style={{ background: '#08080d', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>PHONE</label>
              <input
                className="form-input"
                type="tel"
                placeholder="Phone Number"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                style={{ background: '#08080d', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>CITY</label>
              <input
                className="form-input"
                type="text"
                placeholder="City"
                value={contactForm.city}
                onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                style={{ background: '#08080d', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>THE REASON I'D LIKE TO CONNECT</label>
              <select
                className="form-select"
                value={contactForm.reason}
                onChange={(e) => setContactForm({ ...contactForm, reason: e.target.value })}
                style={{ background: '#08080d', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="Tech Mentorship">Tech Mentorship & Training</option>
                <option value="Corporate Training">Corporate Training & L&D</option>
                <option value="Placement Drive">Placement Enablement & Hiring Drives</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>BRIEF ABOUT YOUR REQUIREMENT</label>
              <textarea
                className="form-textarea"
                placeholder="Brief details..."
                value={contactForm.requirement}
                onChange={(e) => setContactForm({ ...contactForm, requirement: e.target.value })}
                style={{ background: '#08080d', border: '1px solid rgba(255,255,255,0.1)', minHeight: '80px' }}
              />
            </div>

            <button
              type="submit"
              className="btn w-full"
              style={{ background: '#e50914', color: '#fff', fontWeight: 800, padding: '14px', borderRadius: '6px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              disabled={submitting}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
