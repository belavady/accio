import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChildren, loginChild } from '../api';
import { session } from '../session';

export default function ChildSelect() {
  const [children, setChildren]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const nav = useNavigate();

  const parentId = session.getParent();

  useEffect(() => {
    async function load() {
      try {
        const res = await getChildren(parentId);
        setChildren(res.children || []);
      } catch (err) {
        setError('Could not load profiles. Please try again.');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [parentId]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!pin.trim()) return setError('Enter your PIN.');
    setError(''); setLoading(true);

    try {
      const res = await loginChild({ parentId, pin: pin.trim() });

      if (!res.valid) {
        setError('Wrong PIN. Try again!');
        setPin('');
        return;
      }

      session.setChild(res);

      if (!res.aboutMeCompleted) {
        nav('/about-me');
      } else {
        nav('/home');
      }

    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card fade-in">

        <div className="accio-logo">Accio ✨</div>
        <div className="accio-tagline">Who's learning today?</div>

        {/* Child avatars */}
        {children.length > 0 && (
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 28
          }}>
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => { setSelected(child); setPin(''); setError(''); }}
                style={{
                  background: selected?.id === child.id
                    ? 'rgba(245,197,66,0.15)' : 'var(--bg-elevated)',
                  border: `2px solid ${selected?.id === child.id ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: 100,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: selected?.id === child.id ? 'var(--gold)' : 'var(--text-primary)'
                }}>
                  {child.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Grade {child.grade}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PIN entry — shown when a child is selected or if only one child */}
        {(selected || children.length === 1) && (
          <form onSubmit={handleLogin}>
            {children.length === 1 && !selected && (
              <p style={{
                textAlign: 'center', fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: 700, marginBottom: 20,
                color: 'var(--text-primary)'
              }}>
                Hey {children[0].name}! 👋
              </p>
            )}
            <div className="field">
              <label>
                {selected ? `${selected.name}'s PIN` : `${children[0]?.name}'s PIN`}
              </label>
              <input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
            </div>

            {error && <div className="msg msg-error">{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Checking...' : "Let's Go! 🚀"}
            </button>
          </form>
        )}

        {!selected && children.length > 1 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Tap your name above to get started
          </p>
        )}

        {children.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            No child profiles found. Please complete parent setup.
          </p>
        )}

      </div>

      {/* Parent dashboard link */}
      <button
        className="btn-ghost btn"
        style={{ marginTop: 16, width: 'auto' }}
        onClick={() => nav('/')}
      >
        Parent dashboard →
      </button>
    </div>
  );
}
