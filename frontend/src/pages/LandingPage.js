import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCode } from '../api';
import { session } from '../session';

export default function LandingPage() {
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (session.hasParent()) nav('/select');
  }, [nav]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return setError('Please enter your access code.');
    setError('');
    setLoading(true);
    try {
      const res = await validateCode(code.trim());
      if (!res.valid) {
        setError("That code doesn't look right. Check with the person who shared it.");
        return;
      }
      session.setCode(res.codeId);
      if (res.parentExists) {
        session.setParent(res.parentId);
        nav('/select');
      } else {
        sessionStorage.setItem('accio_setup_code_id', res.codeId);
        nav('/parent-setup');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card fade-in">

        <div className="accio-logo">Accio ✨</div>
        <div className="accio-tagline">Your personal learning companion</div>

        {/* Trust signal */}
        <div style={{
          background: 'rgba(57,208,216,0.06)',
          border: '1px solid rgba(57,208,216,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: 24,
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          🛡️ Built for child safety · Governed by the{' '}
          <button
            onClick={() => nav('/privacy')}
            style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontFamily: 'var(--font-body)' }}
          >
            Accio Constitution
          </button>
          {' '}· COPPA 2025 compliant
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Access Code</label>
            <input
              type="text"
              placeholder="e.g. ACCIO-AB12CD34"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className={error ? 'error' : ''}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>
          {error && <div className="msg msg-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Checking...' : "Let's Go! 🚀"}
          </button>
        </form>

        {/* Parent dashboard link */}
        {session.hasParent() && (
          <button
            className="btn btn-ghost"
            style={{ marginTop: 12 }}
            onClick={() => nav('/dashboard')}
          >
            Parent dashboard →
          </button>
        )}

      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <strong>Private & Confidential.</strong> Accio is a private, invite-only learning platform for registered families. Access codes must not be shared or redistributed. All content is age-appropriate and tailored to registered child profiles. We never show ads and never sell data.{' '}
        <button
          onClick={() => nav('/privacy')}
          style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.72rem', padding: 0, fontFamily: 'var(--font-body)', textDecoration: 'underline' }}
        >
          Privacy Policy
        </button>
      </div>
    </div>
  );
}
