import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupParent, createChild } from '../api';
import { session } from '../session';

const GRADES = [1,2,3,4,5,6,7,8,9,10,11,12];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const SENSITIVE_TOPICS = [
  { key: 'reproduction',        label: 'Human Reproduction',          sub: 'How babies are born, reproductive biology' },
  { key: 'puberty',             label: 'Puberty & Body Changes',       sub: 'Physical changes during adolescence' },
  { key: 'body_systems_full',   label: 'Human Body Systems (full)',    sub: 'Detailed anatomy and body part naming' },
  { key: 'mental_health',       label: 'Mental Health',                sub: 'Brain chemistry, emotions, psychology' },
  { key: 'substances',          label: 'Drugs & Substances',           sub: 'Effects of drugs, alcohol on the body' },
  { key: 'evolution',           label: 'Evolution',                    sub: 'Origins of species, natural selection' },
  { key: 'climate_change',      label: 'Climate Change',               sub: 'Environmental science, climate topics' },
  { key: 'death_grief',         label: 'Death & Grief',                sub: 'In English passages and discussions' },
  { key: 'divorce_family',      label: 'Divorce & Family Breakdown',   sub: 'Family structure topics' },
  { key: 'violence_conflict',   label: 'Violence & Conflict',          sub: 'Beyond age-appropriate adventure stories' },
  { key: 'relationships_attraction', label: 'Relationships & Attraction', sub: 'Romantic relationships, attraction' },
  { key: 'drugs_alcohol',       label: 'Drugs & Alcohol',              sub: 'For Jarvis conversations' },
  { key: 'political_topics',    label: 'Political Topics',             sub: 'Political opinions and debates' },
  { key: 'religious_topics',    label: 'Religious Topics',             sub: 'Religious beliefs and practices' },
];

export default function ParentSetup() {
  const [step, setStep]     = useState(0); // 0: parent, 1: child, 2: preferences
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Parent fields
  const [parentName, setParentName]   = useState('');
  const [parentPin, setParentPin]     = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentId, setParentId]       = useState(null);

  // Child fields
  const [childName, setChildName]         = useState('');
  const [childAge, setChildAge]           = useState('');
  const [childGrade, setChildGrade]       = useState('');
  const [childCity, setChildCity]         = useState('');
  const [childSchool, setChildSchool]     = useState('');
  const [childPin, setChildPin]           = useState('');
  const [schoolMonth, setSchoolMonth]     = useState('');
  const [schoolEndDate, setSchoolEndDate] = useState('');

  // Preferences — all off by default
  const [prefs, setPrefs] = useState(
    Object.fromEntries(SENSITIVE_TOPICS.map(t => [t.key, false]))
  );

  const nav = useNavigate();

  function togglePref(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  // Step 0 — Create parent account
  async function handleParentSubmit(e) {
    e.preventDefault();
    if (!parentName.trim() || !parentPin.trim()) {
      return setError('Name and PIN are required.');
    }
    if (parentPin.length < 4) return setError('PIN must be at least 4 characters.');
    setError(''); setLoading(true);

    try {
      const codeId = sessionStorage.getItem('accio_setup_code_id');
      if (!codeId) { nav('/'); return; }

      const res = await setupParent({
        codeId,
        name: parentName.trim(),
        dashboardPin: parentPin.trim(),
        email: parentEmail.trim() || undefined
      });

      setParentId(res.parentId);
      session.setParent(res.parentId);
      sessionStorage.removeItem('accio_setup_code_id');
      setStep(1);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Step 1 — Create first child
  async function handleChildSubmit(e) {
    e.preventDefault();
    if (!childName.trim() || !childAge || !childGrade || !childPin.trim()) {
      return setError('Name, age, grade and PIN are required.');
    }
    if (childPin.length < 4) return setError('Child PIN must be at least 4 characters.');
    setError(''); setLoading(true);

    try {
      await createChild({
        parentId,
        name: childName.trim(),
        age: parseInt(childAge),
        grade: parseInt(childGrade),
        city: childCity.trim() || undefined,
        school: childSchool.trim() || undefined,
        pin: childPin.trim(),
        schoolYearStartMonth: schoolMonth ? parseInt(schoolMonth) : undefined,
        schoolYearEndDate: schoolEndDate || undefined
      });

      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to create child profile.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — Save preferences and go to child select
  async function handlePrefsSubmit(e) {
    e.preventDefault();
    // Preferences are saved when child login happens — stored in state for now
    // In Phase 2 we'll wire the PUT /api/child/:id/preferences call here
    nav('/select');
  }

  return (
    <div className="page">
      <div className="card fade-in">

        {/* Steps indicator */}
        <div className="steps">
          {['Your Account', 'Add Child', 'Content Settings'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
              {i < 2 && <div style={{ width: 20, height: 1, background: 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 0: Parent account ── */}
        {step === 0 && (
          <>
            <div className="accio-logo">Accio ✨</div>
            <div className="accio-tagline">Let's set up your family account</div>

            <form onSubmit={handleParentSubmit}>
              <div className="field">
                <label>Your Name</label>
                <input type="text" placeholder="e.g. Priya Singh"
                  value={parentName} onChange={e => setParentName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email (optional — for future notifications)</label>
                <input type="email" placeholder="you@example.com"
                  value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Your Dashboard PIN</label>
                <input type="password" placeholder="Min 4 characters"
                  value={parentPin} onChange={e => setParentPin(e.target.value)} />
              </div>

              {error && <div className="msg msg-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Continue →'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 1: First child ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4, fontSize: '1.4rem' }}>
              Add your child
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              You can add more children after setup.
            </p>

            <form onSubmit={handleChildSubmit}>
              <div className="about-me-grid">
                <div className="field">
                  <label>Child's Name</label>
                  <input type="text" placeholder="e.g. Aryan"
                    value={childName} onChange={e => setChildName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Age</label>
                  <input type="number" placeholder="e.g. 12" min="4" max="18"
                    value={childAge} onChange={e => setChildAge(e.target.value)} />
                </div>
                <div className="field">
                  <label>Grade</label>
                  <select value={childGrade} onChange={e => setChildGrade(e.target.value)}>
                    <option value="">Select grade</option>
                    {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>City</label>
                  <input type="text" placeholder="e.g. Chicago"
                    value={childCity} onChange={e => setChildCity(e.target.value)} />
                </div>
                <div className="field">
                  <label>School</label>
                  <input type="text" placeholder="School name"
                    value={childSchool} onChange={e => setChildSchool(e.target.value)} />
                </div>
                <div className="field">
                  <label>Child's PIN</label>
                  <input type="password" placeholder="Min 4 characters"
                    value={childPin} onChange={e => setChildPin(e.target.value)} />
                </div>
                <div className="field">
                  <label>School year started (month)</label>
                  <select value={schoolMonth} onChange={e => setSchoolMonth(e.target.value)}>
                    <option value="">Select month</option>
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>School year ends</label>
                  <input type="date" value={schoolEndDate}
                    onChange={e => setSchoolEndDate(e.target.value)} />
                </div>
              </div>

              {error && <div className="msg msg-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Continue →'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Content preferences ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4, fontSize: '1.4rem' }}>
              Content settings
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              All sensitive topics are <strong style={{ color: 'var(--text-primary)' }}>off by default</strong>.
              Turn on only what you're comfortable with. These apply across all subjects and Jarvis.
            </p>

            <form onSubmit={handlePrefsSubmit}>
              {SENSITIVE_TOPICS.map(t => (
                <div className="toggle-row" key={t.key}>
                  <div>
                    <div className="toggle-label">{t.label}</div>
                    <div className="toggle-sub">{t.sub}</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefs[t.key]}
                      onChange={() => togglePref(t.key)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <button className="btn btn-primary" type="submit">
                  All done — let's go! 🎉
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
