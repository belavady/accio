import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../session';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ── Data Rights Section ───────────────────────────────────────────────────────
function DataRights({ childId, childName, parentId }) {
  const [deleting, setDeleting]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted]       = useState(false);
  const [error, setError]           = useState('');
  const nav = useNavigate();

  async function requestDeletion() {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/child/${childId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId })
      });
      if (!res.ok) throw new Error('Failed');
      setDeleted(true);
      setTimeout(() => {
        session.clearAll();
        nav('/');
      }, 3000);
    } catch {
      setError('Deletion request failed. Please email belavady@gmail.com directly.');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  if (deleted) {
    return (
      <div style={{
        background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
        borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
          Deletion confirmed
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          All data for {childName} has been deleted. You will be redirected shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Right to access */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                📋 Right to Access
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                View all data collected about {childName} in this dashboard
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700, padding: '4px 10px', background: 'rgba(74,222,128,0.1)', borderRadius: 999 }}>
              Available
            </div>
          </div>
        </div>

        {/* Right to correction */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                ✏️ Right to Correction
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Update {childName}'s profile, grade, preferences at any time
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700, padding: '4px 10px', background: 'rgba(74,222,128,0.1)', borderRadius: 999 }}>
              Available
            </div>
          </div>
        </div>

        {/* Right to withdraw consent */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                🔄 Right to Withdraw Consent
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Withdraw consent for third-party data sharing at any time
              </div>
            </div>
            <a href="mailto:belavady@gmail.com?subject=Accio%20Data%20Consent%20Withdrawal"
              style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 700, padding: '4px 10px', background: 'rgba(57,208,216,0.1)', borderRadius: 999, textDecoration: 'none' }}>
              Email us
            </a>
          </div>
        </div>

        {/* Right to deletion */}
        <div style={{
          background: 'rgba(255,107,107,0.04)',
          border: '1px solid rgba(255,107,107,0.2)',
          borderRadius: 'var(--radius-md)', padding: '16px 20px'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--coral)', marginBottom: 4 }}>
            🗑️ Right to Deletion
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Permanently delete {childName}'s account and all associated data. This includes profile, session history, Jarvis conversations, music compositions, and all progress data. This action cannot be undone.
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(255,107,107,0.5)',
                color: 'var(--coral)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)'
              }}
            >
              Request deletion of {childName}'s data
            </button>
          ) : (
            <div style={{
              background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                All of {childName}'s data will be permanently deleted. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={requestDeletion}
                  disabled={deleting}
                  style={{
                    background: 'var(--coral)', color: 'white',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font-display)'
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font-display)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && <div className="msg msg-error" style={{ marginTop: 12 }}>{error}</div>}
        </div>

      </div>

      {/* Data retention summary */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Data retention periods
        </div>
        {[
          ['Child profile and preferences', 'Until deletion requested'],
          ['Session and progress data', '12 months, then auto-deleted'],
          ['Jarvis conversation history', '6 months, then summarised and deleted'],
          ['Music compositions', 'Until deletion requested'],
          ['Flagged interaction logs', '6 months'],
        ].map(([type, period]) => (
          <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', gap: 12 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{type}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{period}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Constitution Section ──────────────────────────────────────────────────────
function ConstitutionSection() {
  const [expanded, setExpanded] = useState(false);

  const articles = [
    { num: "I", title: "Unconditional Positive Regard", text: "Every child is accepted completely and without condition, regardless of their answer, behaviour, or mood. No response ever judges, criticises, or evaluates the child as a person." },
    { num: "II", title: "Process Praise Only", text: "Accio praises effort, approach, and thinking — never the child's identity. A 5:1 positive-to-corrective ratio is enforced in every Socratic interaction." },
    { num: "III", title: "Developmental Calibration", text: "Every agent calibrates its language, tone, and vocabulary to the child's exact age. A 9-year-old and a 15-year-old receive entirely different communication styles." },
    { num: "IV", title: "Emotional Safety First", text: "Every agent monitors for distress signals. If detected, emotional safety is addressed before any academic content. Crisis indicators trigger immediate parent notification." },
    { num: "V", title: "No Parasocial Dependency", text: "Accio never positions itself as a substitute for human connection. Jarvis actively encourages real-world friendships and family relationships." },
    { num: "VI", title: "Identity and Inclusion", text: "Zero assumptions about gender, family structure, religion, or background. Inclusive language that works for any child anywhere." },
    { num: "VII", title: "Absolute Prohibitions", text: "Sarcasm, comparisons, frustration, embarrassment, adult content, political content, medical advice — all absolutely prohibited. No exceptions. No overrides." },
  ];

  return (
    <div>
      <div style={{
        background: 'rgba(245,197,66,0.06)',
        border: '1px solid rgba(245,197,66,0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem', marginBottom: 8 }}>
              ⚖️ The Accio Constitution
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every AI response your child receives is governed by the Accio Constitution — a child psychology and safety framework grounded in peer-reviewed developmental research. It is the supreme law of the platform. No agent, ever, can violate it for any reason whatsoever.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'transparent', border: '1px solid rgba(245,197,66,0.3)',
            color: 'var(--gold)', borderRadius: 'var(--radius-md)',
            padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-display)', marginTop: 16
          }}
        >
          {expanded ? 'Hide articles ↑' : 'Read the Constitution ↓'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {articles.map(a => (
            <div key={a.num} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  background: 'rgba(245,197,66,0.15)',
                  color: 'var(--gold)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: '0.75rem',
                  padding: '3px 8px', borderRadius: 4, flexShrink: 0
                }}>
                  Art. {a.num}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {a.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{
            background: 'rgba(255,107,107,0.06)',
            border: '1px solid rgba(255,107,107,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--coral)' }}>
              + Output Validation Agent — reviews every single response before your child sees it
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Parent Dashboard ─────────────────────────────────────────────────────
export default function ParentDashboard() {
  const [children, setChildren]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const nav = useNavigate();

  const parentId = session.getParent();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/parent/${parentId}/children`);
        const data = await res.json();
        setChildren(data.children || []);
        if (data.children?.length > 0) setSelected(data.children[0]);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [parentId]);

  const TABS = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'constitution', label: '⚖️ Safety' },
    { id: 'data-rights',  label: '🔒 Data Rights' },
  ];

  if (loading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 20px 60px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <div className="accio-logo" style={{ textAlign: 'left', fontSize: '1.8rem', marginBottom: 2 }}>Accio ✨</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parent Dashboard</div>
          </div>
          <button
            onClick={() => { session.clearAll(); nav('/'); }}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 'var(--radius-md)',
              padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)'
            }}
          >
            Sign out
          </button>
        </div>

        {/* Child selector */}
        {children.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelected(child)}
                style={{
                  background: selected?.id === child.id ? 'rgba(245,197,66,0.15)' : 'var(--bg-card)',
                  border: `1.5px solid ${selected?.id === child.id ? 'var(--gold)' : 'var(--border)'}`,
                  color: selected?.id === child.id ? 'var(--gold)' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontSize: '0.88rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-display)',
                  transition: 'all 0.2s'
                }}
              >
                {child.name} · Grade {child.grade}
              </button>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 8px',
                fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-display)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {selected ? (
          <div className="fade-in">

            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>
                  {selected.name}'s Dashboard
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Grade', value: `Grade ${selected.grade}` },
                    { label: 'Age', value: `${selected.age} years` },
                    { label: 'Last active', value: selected.last_active ? new Date(selected.last_active).toLocaleDateString() : 'Just joined' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Coming in Phase 2 notice */}
                <div style={{
                  background: 'rgba(57,208,216,0.05)',
                  border: '1px solid rgba(57,208,216,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>
                    Full dashboard coming in Phase 2
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Daily summaries, weekly narratives, subject progress, Jarvis topics, music compositions, flagged interactions, and weekly conversation starters will all appear here once learning sessions begin.
                  </p>
                </div>
              </div>
            )}

            {/* Constitution tab */}
            {activeTab === 'constitution' && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
                  How we protect {selected.name}
                </div>
                <ConstitutionSection />
                <div style={{ marginTop: 16 }}>
                  <a
                    href="/accio/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center',
                      color: 'var(--teal)', fontSize: '0.85rem',
                      padding: '12px', border: '1px solid rgba(57,208,216,0.3)',
                      borderRadius: 'var(--radius-md)', textDecoration: 'none',
                      fontWeight: 700, fontFamily: 'var(--font-display)'
                    }}
                  >
                    Read the full Privacy Policy →
                  </a>
                </div>
              </div>
            )}

            {/* Data Rights tab */}
            {activeTab === 'data-rights' && (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
                  Your data rights for {selected.name}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                  Under COPPA 2025 and Accio's Privacy Policy, you have full control over your child's data at all times.
                </p>
                <DataRights
                  childId={selected.id}
                  childName={selected.name}
                  parentId={parentId}
                />
              </div>
            )}

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No child profiles found.{' '}
            <button onClick={() => nav('/select')} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Add a child
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
