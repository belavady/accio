import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCode } from '../api';
import { session } from '../session';

export default function LandingPage() {
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // If already have a parent session, go straight to child select
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
        setError('That code doesn\'t look right. Check with the person who shared it.');
        return;
      }

      session.setCode(res.codeId);

      if (res.parentExists) {
        // Returning family — go to child select
        session.setParent(res.parentId);
        nav('/select');
      } else {
        // New family — go to parent setup
        // Store codeId in sessionStorage temporarily for setup page
        sessionStorage.setItem('accio_setup_code_id', res.codeId);
        nav('/parent-setup');
      }

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card fade-in">

        {/* Logo */}
        <div className="accio-logo">Accio ✨</div>
        <div className="accio-tagline">Your personal learning companion</div>

        {/* Code form */}
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

      </div>

      {/* Legal disclaimer */}
      <div className="disclaimer">
        <strong>Private & Confidential.</strong> Accio is a private learning platform
        for registered families only. Access is provided via invitation codes which
        must not be shared or redistributed. Unauthorised access is not permitted.
        All content is age-appropriate and tailored to registered child profiles.
        User data is not shared with third parties.
      </div>
    </div>
  );
}
