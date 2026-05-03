import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupParent, createChild, updatePreferences } from '../api';
import { session } from '../session';

const GRADES = [1,2,3,4,5,6,7,8,9,10,11,12];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const GENDER_OPTIONS = ['Boy', 'Girl', 'Non-binary', 'Prefer not to say'];

const SENSITIVE_TOPICS = [
  { key: 'reproduction',           label: 'Human Reproduction',           sub: 'How babies are born, reproductive biology' },
  { key: 'puberty',                label: 'Puberty & Body Changes',        sub: 'Physical changes during adolescence' },
  { key: 'body_systems_full',      label: 'Human Body Systems (detailed)', sub: 'Detailed anatomy and body part naming' },
  { key: 'mental_health',          label: 'Mental Health',                 sub: 'Brain chemistry, emotions, psychology' },
  { key: 'substances',             label: 'Drugs & Substances',            sub: 'Effects of drugs and alcohol on the body' },
  { key: 'evolution',              label: 'Evolution',                     sub: 'Origins of species, natural selection' },
  { key: 'climate_change',         label: 'Climate Change',                sub: 'Environmental science, climate topics' },
  { key: 'death_grief',            label: 'Death & Grief',                 sub: 'In English passages and Jarvis discussions' },
  { key: 'divorce_family',         label: 'Divorce & Family Breakdown',    sub: 'Family structure topics' },
  { key: 'violence_conflict',      label: 'Violence & Conflict',           sub: 'Beyond age-appropriate adventure stories' },
  { key: 'relationships_attraction', label: 'Relationships & Attraction',  sub: 'Romantic relationships and attraction' },
  { key: 'drugs_alcohol',          label: 'Drugs & Alcohol (Jarvis)',      sub: 'Jarvis conversations on substances' },
  { key: 'political_topics',       label: 'Political Topics',              sub: 'Political opinions and debates' },
  { key: 'religious_topics',       label: 'Religious Topics',              sub: 'Religious beliefs and practices' },
];

// ── City autocomplete using Nominatim (free, no key) ──────────────────────────
function CityAutocomplete({ value, onChange }) {
  const [query, setQuery]       = useState(value || '');
  const [options, setOptions]   = useState([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const timer                   = useRef(null);

  const search = useCallback(async (q) => {
    if (q.length < 3) { setOptions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=us&format=json&limit=6&addressdetails=1&featuretype=city`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'Accio-Learning-App' } });
      const data = await res.json();
      const seen = new Set();
      const cities = data
        .filter(d => d.address && (d.address.city || d.address.town || d.address.village || d.address.county))
        .map(d => {
          const city = d.address.city || d.address.town || d.address.village || d.address.county;
          const state = d.address.state || '';
          return { label: `${city}, ${state}`, city };
        })
        .filter(v => {
          if (seen.has(v.label)) return false;
          seen.add(v.label);
          return true;
        });
      setOptions(cities);
      setOpen(cities.length > 0);
    } catch { setOptions([]); }
    finally { setLoading(false); }
  }, []);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 350);
  }

  function select(opt) {
    setQuery(opt.label);
    onChange(opt.label);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Start typing your city..."
        value={query}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        autoComplete="off"
      />
      {loading && <div className="autocomplete-loading">Searching...</div>}
      {open && (
        <div className="autocomplete-dropdown">
          {options.map((opt, i) => (
            <div key={i} className="autocomplete-item" onMouseDown={() => select(opt)}>
              📍 {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── School autocomplete using NCES API ────────────────────────────────────────
function SchoolAutocomplete({ city, value, onChange }) {
  const [query, setQuery]     = useState(value || '');
  const [options, setOptions] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const timer                 = useRef(null);

  const search = useCallback(async (q) => {
    if (q.length < 3) { setOptions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const cityName = city ? city.split(',')[0].trim() : '';
      // Use NCES Education Data API — free, official, no key needed
      const params = new URLSearchParams({
        search: q,
        ...(cityName && { 'filter[city]': cityName }),
        'filter[status]': 'Active',
        'fields[schools]': 'name,city,state_code',
        'page[size]': '8'
      });
      const res = await fetch(`https://educationdata.urban.org/api/v1/schools/ccd/directory/2021/?${params}`);
      const data = await res.json();
      const results = (data.results || []).map(s => ({
        label: `${s.name} — ${s.city}, ${s.state_code}`,
        name: s.name
      }));
      if (results.length > 0) {
        setOptions(results);
        setOpen(true);
      } else {
        // Fallback — allow manual entry, show typed value as option
        setOptions([{ label: `Use "${q}"`, name: q }]);
        setOpen(true);
      }
    } catch {
      // On any error allow manual entry
      setOptions([{ label: `Use "${q}"`, name: q }]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [city]);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 400);
  }

  function select(opt) {
    setQuery(opt.name);
    onChange(opt.name);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={city ? `Search schools in ${city.split(',')[0]}...` : 'Enter city first, then search school...'}
        value={query}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        autoComplete="off"
        disabled={!city}
      />
      {loading && <div className="autocomplete-loading">Searching schools...</div>}
      {open && (
        <div className="autocomplete-dropdown">
          {options.map((opt, i) => (
            <div key={i} className="autocomplete-item" onMouseDown={() => select(opt)}>
              🏫 {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-track" />
    </label>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ParentSetup() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [parentId, setParentId]     = useState(null);
  const [parentName, setParentName] = useState('');
  const [childId, setChildId]       = useState(null);
  const [childName, setChildName]   = useState('');

  // Parent fields
  const [pName, setPName]   = useState('');
  const [pPin, setPPin]     = useState('');
  const [pEmail, setPEmail] = useState('');

  // Child fields
  const [cName, setCName]         = useState('');
  const [cAge, setCAge]           = useState('');
  const [cGrade, setCGrade]       = useState('');
  const [cGender, setCGender]     = useState('');
  const [cCity, setCCity]         = useState('');
  const [cSchool, setCSchool]     = useState('');
  const [cPin, setCPin]           = useState('');
  const [cMonthStart, setCMonthStart] = useState('');
  const [cEndDate, setCEndDate]   = useState('');

  // Preferences
  const [prefs, setPrefs] = useState(
    Object.fromEntries(SENSITIVE_TOPICS.map(t => [t.key, false]))
  );

  const nav = useNavigate();

  function togglePref(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  // ── Step 0: Parent account ──
  async function submitParent(e) {
    e.preventDefault();
    if (!pName.trim()) return setError('Please enter your name.');
    if (!pPin.trim() || pPin.length < 4) return setError('PIN must be at least 4 characters.');
    setError(''); setLoading(true);
    try {
      const codeId = sessionStorage.getItem('accio_setup_code_id');
      if (!codeId) { nav('/'); return; }
      const res = await setupParent({ codeId, name: pName.trim(), dashboardPin: pPin.trim(), email: pEmail.trim() || undefined });
      setParentId(res.parentId);
      setParentName(pName.trim());
      session.setParent(res.parentId, res.token);
      sessionStorage.removeItem('accio_setup_code_id');
      setStep(1);
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  // ── Step 1: Child ──
  async function submitChild(e) {
    e.preventDefault();
    if (!cName.trim()) return setError('Child\'s name is required.');
    if (!cAge) return setError('Age is required.');
    if (!cGrade) return setError('Grade is required.');
    if (!cGender) return setError('Please select a gender.');
    if (!cPin.trim() || cPin.length < 4) return setError('Child PIN must be at least 4 characters.');
    setError(''); setLoading(true);
    try {
      const res = await createChild({
        parentId,
        name: cName.trim(),
        age: parseInt(cAge),
        grade: parseInt(cGrade),
        gender: cGender,
        city: cCity || undefined,
        school: cSchool || undefined,
        pin: cPin.trim(),
        schoolYearStartMonth: cMonthStart ? parseInt(cMonthStart) : undefined,
        schoolYearEndDate: cEndDate || undefined
      });
      setChildId(res.childId);
      setChildName(cName.trim());
      setStep(2);
    } catch (err) { setError(err.message || 'Failed to create child profile.'); }
    finally { setLoading(false); }
  }

  // ── Step 2: Preferences ──
  async function submitPrefs(e) {
    e.preventDefault();
    if (childId) {
      try { await updatePreferences(childId, prefs); } catch {}
    }
    setStep(3);
  }

  const stepLabels = ['Your Account', 'Add Child', 'Content Settings', 'All Set!'];

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 32, paddingBottom: 32 }}>
      <div className="card fade-in" style={{ maxWidth: step === 1 ? 560 : 480 }}>

        {/* Step indicator */}
        <div className="steps">
          {stepLabels.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} title={s} />
              {i < stepLabels.length - 1 && <div style={{ width: 16, height: 1, background: 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 0: Parent account ── */}
        {step === 0 && (
          <>
            <div className="accio-logo">Accio ✨</div>
            <div className="accio-tagline">Let's set up your family account</div>
            <form onSubmit={submitParent}>
              <div className="field">
                <label>Your Name <span className="required">*</span></label>
                <input type="text" placeholder="e.g. Anu Gupta"
                  value={pName} onChange={e => setPName(e.target.value)} />
                <div className="field-hint">Enter your full name as you'd like to be addressed</div>
              </div>
              <div className="field">
                <label>Email <span className="optional">(optional)</span></label>
                <input type="email" placeholder="you@example.com"
                  value={pEmail} onChange={e => setPEmail(e.target.value)} />
                <div className="field-hint">For future notifications — we'll never spam you</div>
              </div>
              <div className="field">
                <label>Dashboard PIN <span className="required">*</span></label>
                <input type="password" placeholder="Set it now — min 4 characters"
                  value={pPin} onChange={e => setPPin(e.target.value)} />
                <div className="field-hint">You'll use this to access the parent dashboard</div>
              </div>
              {error && <div className="msg msg-error">{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Continue →'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 1: Child ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 4 }}>
              Add your child
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Fields marked <span className="required">*</span> are required. You can add more children after setup.
            </p>
            <form onSubmit={submitChild}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', alignItems: 'start' }}>
                  <div className="field">
                    <label>Child's Name <span className="required">*</span></label>
                    <input type="text" placeholder="e.g. Aryan"
                      value={cName} onChange={e => setCName(e.target.value)} />
                    <div className="field-hint">First name your child goes by</div>
                  </div>
                  <div className="field">
                    <label>Age <span className="required">*</span></label>
                    <input type="number" placeholder="e.g. 12" min="4" max="18"
                      value={cAge} onChange={e => setCAge(e.target.value)} />
                    <div className="field-hint">Current age of your child</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', alignItems: 'start' }}>
                  <div className="field">
                    <label>Grade <span className="required">*</span></label>
                    <select value={cGrade} onChange={e => setCGrade(e.target.value)}>
                      <option value="">Select current grade</option>
                      {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                    <div className="field-hint">Current school grade</div>
                  </div>
                  <div className="field">
                    <label>Gender <span className="required">*</span></label>
                    <select value={cGender} onChange={e => setCGender(e.target.value)}>
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <div className="field-hint">Helps personalise Jarvis's voice</div>
                  </div>
                </div>

                <div className="field">
                  <label>City <span className="optional">(optional)</span></label>
                  <CityAutocomplete value={cCity} onChange={setCCity} />
                  <div className="field-hint">Start typing — US cities appear after 3 letters</div>
                </div>

                <div className="field">
                  <label>School <span className="optional">(optional)</span></label>
                  <SchoolAutocomplete city={cCity} value={cSchool} onChange={setCSchool} />
                  <div className="field-hint">Enter city first, then search your school</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', alignItems: 'start' }}>
                  <div className="field">
                    <label>Child's PIN <span className="required">*</span></label>
                    <input type="password" placeholder="Set a PIN for this child"
                      value={cPin} onChange={e => setCPin(e.target.value)} />
                    <div className="field-hint">Min 4 characters — child uses this to log in</div>
                  </div>
                  <div className="field">
                    <label>School year started <span className="optional">(optional)</span></label>
                    <select value={cMonthStart} onChange={e => setCMonthStart(e.target.value)}>
                      <option value="">Select month</option>
                      {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <div className="field-hint">Helps calibrate curriculum start point</div>
                  </div>
                </div>

                <div className="field">
                  <label>School year ends <span className="optional">(optional)</span></label>
                  <input type="date" value={cEndDate} onChange={e => setCEndDate(e.target.value)} />
                  <div className="field-hint">Helps pace the curriculum to match the school year end date</div>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>
              Content Settings
            </h2>
            <div className="content-settings-intro">
              <p>
                All content on Accio is age-appropriate and aligned to the <strong>US Common Core State Standards (CCSS)</strong> and <strong>Next Generation Science Standards (NGSS)</strong> — the same federal and state education standards your child follows in school.
              </p>
              <p style={{ marginTop: 8 }}>
                We have built robust guardrails to ensure inappropriate content is never discussed. Sensitive topics are <strong>off by default</strong> — turn on only what you are comfortable with. These settings apply across all subjects and Jarvis conversations.
              </p>
            </div>
            <form onSubmit={submitPrefs}>
              {SENSITIVE_TOPICS.map(t => (
                <div className="toggle-row" key={t.key}>
                  <div>
                    <div className="toggle-label">{t.label}</div>
                    <div className="toggle-sub">{t.sub}</div>
                  </div>
                  <Toggle checked={prefs[t.key]} onChange={() => togglePref(t.key)} />
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                {error && <div className="msg msg-error">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Continue →'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 3: Handoff to child ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 12 }}>
              Great job, {parentName}!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
              Now please help <strong style={{ color: 'var(--text-primary)' }}>{childName}</strong> and me get to know each other better!
            </p>
            <div className="handoff-card">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>👋</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Hand the device to <strong style={{ color: 'var(--text-primary)' }}>{childName}</strong> — it's their turn now!
              </p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 24 }}
              onClick={() => nav('/select')}>
              {childName} is ready! →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
