import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = "May 2026";
const CONTACT_EMAIL = "belavady@gmail.com";

const THIRD_PARTIES = [
  {
    name: "Anthropic (Claude AI)",
    purpose: "Powers all learning conversations, Socratic guidance, Jarvis, and content generation",
    data: "Child's age, grade, and conversation text only — no name, no identifying information",
    policy: "https://www.anthropic.com/privacy"
  },
  {
    name: "OpenAI",
    purpose: "Converts text responses to natural voice (Text-to-Speech)",
    data: "Text of agent responses only — no child personal information",
    policy: "https://openai.com/policies/privacy-policy"
  },
  {
    name: "Google Cloud",
    purpose: "Converts your child's spoken words to text (Speech-to-Text)",
    data: "Audio during voice interactions only — not stored, processed in real time",
    policy: "https://cloud.google.com/terms/cloud-privacy-notice"
  },
  {
    name: "Supabase",
    purpose: "Secure database storage for all Accio data",
    data: "All child profile, session, and progress data — stored securely in the EU",
    policy: "https://supabase.com/privacy"
  },
];

const RETENTION = [
  { type: "Child profile and preferences", period: "Until parent requests deletion" },
  { type: "Session and progress data", period: "12 months, then automatically deleted" },
  { type: "Jarvis conversation history", period: "6 months, then summarised and raw data deleted" },
  { type: "Music compositions", period: "Until parent requests deletion" },
  { type: "Flagged interaction logs", period: "6 months" },
  { type: "Daily and weekly summaries", period: "12 months" },
];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.2rem',
        color: 'var(--teal)', marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '2px solid rgba(57,208,216,0.3)'
      }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>{children}</p>;
}

function Li({ children }) {
  return (
    <li style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 6 }}>
      {children}
    </li>
  );
}

export default function PrivacyPolicy() {
  const nav = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '40px 20px 80px',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => nav(-1)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: 32, padding: 0,
            fontFamily: 'var(--font-body)'
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="accio-logo" style={{ textAlign: 'left', marginBottom: 4 }}>Accio ✨</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.8rem',
            color: 'var(--text-primary)', marginBottom: 8
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Last updated: {LAST_UPDATED} · Questions? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        {/* Plain language summary box */}
        <div style={{
          background: 'rgba(57,208,216,0.06)',
          border: '1px solid rgba(57,208,216,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 40
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>
            Plain language summary
          </div>
          <P>Accio is a private, invite-only learning companion for children. We collect the minimum information needed to personalise your child's experience. We never sell data, never show ads, and never share your child's information with anyone except the specific services that power the app — listed clearly below. Parents have full control at all times.</P>
        </div>

        {/* Sections */}
        <Section title="1. Who we are">
          <P>Accio is a private educational platform operated by Harsha Belavady. Accio is accessible by invitation only, via a unique access code shared directly with families. This is not a public platform.</P>
          <P>Contact: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a></P>
        </Section>

        <Section title="2. Who this policy applies to">
          <P>This policy applies to all users of the Accio platform, including parents and children of all ages. Accio is designed for children aged 8-16 and is compliant with the US Children's Online Privacy Protection Act (COPPA, updated 2025) for users under 13, and applies equivalent protections to all users regardless of age.</P>
        </Section>

        <Section title="3. What information we collect and why">
          <P>We collect only what is necessary to provide a personalised, safe learning experience. Here is exactly what we collect:</P>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Parent information:</strong> Name, email (optional), dashboard PIN. Used to manage your account and communicate with you about your child's progress.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Child profile:</strong> Name, age, grade, city, school (optional), gender, PIN, school year dates. Used to calibrate curriculum, language level, and content appropriateness.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Child interests and hobbies:</strong> Entered by the child in the About Me card. Used to personalise AI responses and analogies.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Learning session data:</strong> Questions answered, scores, topics covered, response times. Used to track progress and personalise the curriculum.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Jarvis conversation history:</strong> Text of conversations between the child and Jarvis. Used to enable Jarvis to remember past conversations and provide a consistent experience. Summarised and raw data deleted after 6 months.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Voice audio:</strong> Only during voice interactions. Sent in real time to Google Cloud Speech-to-Text for conversion to text. Not stored by Accio.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Music compositions:</strong> Notes and compositions created by the child. Stored until parent requests deletion.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Content preferences:</strong> Sensitivity topic settings set by the parent. Used to filter all AI-generated content.</Li>
          </ul>
        </Section>

        <Section title="4. What we never collect">
          <ul style={{ paddingLeft: 20 }}>
            <Li>We never collect precise geolocation data</Li>
            <Li>We never collect biometric identifiers (no face recognition, fingerprints, or retina scans)</Li>
            <Li>We never collect payment information</Li>
            <Li>We never collect social media data</Li>
            <Li>We never use advertising tracking or persistent advertising identifiers</Li>
            <Li>We never collect data for any purpose other than providing the Accio service</Li>
          </ul>
        </Section>

        <Section title="5. Third parties who receive child data">
          <P>Accio uses the following third-party services to power the platform. Each receives only the minimum data necessary for its function. We do not sell child data to any third party under any circumstances.</P>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {THIRD_PARTIES.map(tp => (
              <div key={tp.name} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px'
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {tp.name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <strong>Purpose:</strong> {tp.purpose}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <strong>Data received:</strong> {tp.data}
                </div>
                <a href={tp.policy} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: 'var(--teal)' }}>
                  View their privacy policy →
                </a>
              </div>
            ))}
          </div>
        </Section>

        <Section title="6. Data retention">
          <P>We retain data only as long as necessary. Here are our retention periods:</P>
          <div style={{ marginTop: 12 }}>
            {RETENTION.map(r => (
              <div key={r.type} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-light)',
                gap: 16
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{r.type}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{r.period}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="7. Your parental rights">
          <P>As a parent or guardian, you have the following rights at any time:</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Right to access:</strong> View all data collected about your child in the parent dashboard</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Right to correction:</strong> Update any information in your child's profile at any time</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Right to deletion:</strong> Request complete deletion of your child's account and all associated data using the "Delete Account" button in the parent dashboard. We will confirm deletion within 7 days.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Right to withdraw consent:</strong> You may withdraw consent for any third-party data sharing at any time by contacting us. This may affect some features of the platform.</Li>
            <Li><strong style={{ color: 'var(--text-primary)' }}>Right to refuse further collection:</strong> You may request that we stop collecting new data while retaining existing data</Li>
          </ul>
          <P style={{ marginTop: 12 }}>To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a> or use the Data Rights section in your parent dashboard.</P>
        </Section>

        <Section title="8. COPPA compliance">
          <P>Accio complies with the US Children's Online Privacy Protection Act (COPPA) as updated in 2025. Specifically:</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li>We obtain verifiable parental consent before collecting any personal information from children under 13</Li>
            <Li>We apply equivalent protections to all users regardless of age</Li>
            <Li>We never use children's data for targeted advertising</Li>
            <Li>We provide parents with access, correction, and deletion rights</Li>
            <Li>We share data with third parties only to the extent necessary to provide the service, with explicit parental consent</Li>
            <Li>We maintain a formal data security program including risk evaluation and safeguard monitoring</Li>
            <Li>We enforce strict data retention limits and deletion policies</Li>
          </ul>
        </Section>

        <Section title="9. Data security">
          <P>All data is stored in Supabase with row-level security enforced. All API communications are encrypted using HTTPS/TLS. Access to the backend is protected by environment-level secrets. No child data is ever transmitted without encryption.</P>
          <P>In the event of a data breach that affects your child's personal information, we will notify you within 72 hours of becoming aware of it.</P>
        </Section>

        <Section title="10. No advertising — ever">
          <P>Accio contains no advertising of any kind. We do not display ads, we do not use advertising networks, we do not build advertising profiles, and we do not sell data to advertisers. This is a firm commitment, not a policy subject to change.</P>
        </Section>

        <Section title="11. Changes to this policy">
          <P>If we make material changes to this policy, we will notify you by email (if provided) and display a prominent notice in the parent dashboard. Your continued use of Accio after changes take effect constitutes acceptance of the updated policy. We will always give you at least 30 days notice before material changes take effect.</P>
        </Section>

        <Section title="12. Contact us">
          <P>For any privacy questions, data requests, or concerns, contact us at:</P>
          <P><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a></P>
          <P>We respond to all enquiries within 5 business days.</P>
        </Section>

        {/* Constitution reference */}
        <div style={{
          background: 'rgba(245,197,66,0.06)',
          border: '1px solid rgba(245,197,66,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginTop: 40
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
            The Accio Constitution
          </div>
          <P>Beyond legal compliance, Accio is governed by the Accio Constitution — a comprehensive child psychology and safety framework grounded in peer-reviewed developmental research. It governs every AI response your child receives. Every agent, every interaction, every word. You can read the Accio Constitution in your parent dashboard.</P>
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Accio · Private & Confidential · Not for public distribution · {LAST_UPDATED}
          </p>
        </div>

      </div>
    </div>
  );
}
