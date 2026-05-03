import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAboutMe } from '../api';
import { session } from '../session';

const FIELDS = [
  { key: 'favouriteSport',        label: '⚽ Favourite sport or activity', placeholder: 'e.g. Cricket, Swimming, Gaming' },
  { key: 'favouriteSubject',      label: '📚 Favourite subject at school',  placeholder: 'e.g. Science, Maths, Art' },
  { key: 'favouriteAnimal',       label: '🐬 Favourite animal',             placeholder: 'e.g. Dolphin, Dog, Cheetah' },
  { key: 'favouriteMusic',        label: '🎵 Favourite music or artist',     placeholder: 'e.g. Hip hop, Violin, AR Rahman' },
  { key: 'careerAspiration',      label: '🚀 What do you want to be?',      placeholder: 'e.g. Scientist, Footballer, Engineer' },
  { key: 'favouriteBookOrMovie',  label: '🎬 Favourite book or movie',      placeholder: 'e.g. Harry Potter, The Avengers' },
  { key: 'freeText',              label: '💬 Anything else you want me to know?', placeholder: 'Tell me something cool about you!' },
];

export default function AboutMe() {
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const nav = useNavigate();

  const child = session.getChild();

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      await saveAboutMe({ childId: child.childId, ...form });
      nav('/home');
    } catch (err) {
      setError('Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
      <div className="card fade-in" style={{ maxWidth: 540 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌟</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem',
            marginBottom: 6
          }}>
            Hi {child.childName}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            I'm Accio — your learning companion. Tell me a bit about yourself
            so I can make everything just right for you. ✨
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="about-me-grid">
            {FIELDS.map(f => (
              <div
                className="field"
                key={f.key}
                style={f.key === 'freeText' ? { gridColumn: '1 / -1' } : {}}
              >
                <label>{f.label}</label>
                {f.key === 'freeText' ? (
                  <textarea
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={e => set(f.key, e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      padding: '14px 16px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.2s'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={e => set(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {error && <div className="msg msg-error" style={{ marginTop: 16 }}>{error}</div>}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : "I'm ready — let's learn! 🚀"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => nav('/home')}
              style={{ fontSize: '0.82rem' }}
            >
              Skip for now — I'll fill this in later
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
