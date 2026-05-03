import React, { useState } from 'react';

const THIRD_PARTIES = [
  { name: "Anthropic (Claude AI)", receives: "Child age, grade, and conversation text for learning sessions" },
  { name: "OpenAI", receives: "Agent response text for voice generation (Text-to-Speech)" },
  { name: "Google Cloud", receives: "Real-time audio during voice interactions (not stored)" },
  { name: "Supabase", receives: "All profile, session, and progress data — securely stored" },
];

const COMMITMENTS = [
  { icon: "🧠", title: "The Accio Constitution", text: "Every AI response your child receives is governed by the Accio Constitution — a child psychology and safety framework grounded in peer-reviewed developmental research. Every agent follows it without exception." },
  { icon: "🛡️", title: "Output Validation", text: "A dedicated AI safety reviewer checks every response before your child sees it. If any response fails our child safety standards, it is rewritten before delivery." },
  { icon: "🔒", title: "No Advertising. Ever.", text: "Accio contains no ads, no advertising tracking, and no advertising data. This is a firm commitment." },
  { icon: "📊", title: "Data Minimisation", text: "We collect only what is necessary to personalise your child's experience. We never sell data. We never share data except with the named services that power the platform." },
  { icon: "👨‍👩‍👧", title: "Parent Control", text: "You have full visibility and control at all times. Content preferences, sensitivity filters, data access, and deletion — all in your dashboard." },
  { icon: "🗑️", title: "Your Right to Delete", text: "You can request complete deletion of your child's account and all data at any time. We will confirm within 7 days." },
];

export default function InformedConsent({ childName, parentName, onAgree }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);

  const allChecked = checked1 && checked2 && checked3;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 6 }}>
        Our commitments to you
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Before {childName || 'your child'} starts using Accio, we want you to know exactly how we protect them and their data. Please read and confirm below.
      </p>

      {/* Child Safety Commitments */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Child Safety Commitments</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COMMITMENTS.map(c => (
            <div key={c.title} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <div style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {c.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Third parties */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Services that receive your child's data</div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          These services power Accio. Each receives only the minimum data necessary for their function. We do not sell data.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THIRD_PARTIES.map(tp => (
            <div key={tp.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              gap: 12
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', flexShrink: 0 }}>
                {tp.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                {tp.receives}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="section-title">Your confirmation</div>

        {[
          {
            checked: checked1, setChecked: setChecked1,
            label: `I give my consent for Accio to collect and process my child's information as described above, including sharing with the named third-party services to power the platform.`
          },
          {
            checked: checked2, setChecked: setChecked2,
            label: `I have read or acknowledge Accio's Privacy Policy and understand my rights to access, correct, and delete my child's data at any time.`
          },
          {
            checked: checked3, setChecked: setChecked3,
            label: `I understand that Accio is governed by the Accio Constitution — a child psychology and safety framework — and that every AI response is reviewed for child safety before my child sees it.`
          }
        ].map((item, i) => (
          <label key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            cursor: 'pointer',
            padding: '12px 14px',
            background: item.checked ? 'rgba(57,208,216,0.06)' : 'var(--bg-elevated)',
            border: `1.5px solid ${item.checked ? 'rgba(57,208,216,0.4)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s'
          }}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={e => item.setChecked(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--teal)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* Privacy policy link */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>
        Read the full{' '}
        <a href="/accio/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>
          Privacy Policy
        </a>
        {' '}and{' '}
        <a href="/accio/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
          Accio Constitution
        </a>
      </p>

      <button
        className="btn btn-primary"
        onClick={onAgree}
        disabled={!allChecked}
        style={{ opacity: allChecked ? 1 : 0.5 }}
      >
        {allChecked ? `I agree — let's get started! 🎉` : 'Please confirm all three items above'}
      </button>
    </div>
  );
}
