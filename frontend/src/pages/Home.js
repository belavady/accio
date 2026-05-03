import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../session';

// ── Sound effects using Web Audio API (no external files needed) ──────────────
function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function playTileSound(age) {
  try {
    const ctx = createAudioContext();
    const isYoung = parseInt(age) <= 11;

    if (isYoung) {
      // Magical chime for younger kids
      const frequencies = [523, 659, 784, 1047];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.25);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } else {
      // Sharp tech click for older kids
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {}
}

// ── Age-adaptive tile config ──────────────────────────────────────────────────
function getTiles(age) {
  const isYoung = parseInt(age) <= 11;
  return [
    {
      id: 'challenge',
      emoji: isYoung ? '🎯' : '⚡',
      label: isYoung ? "Today's Challenge" : "Today's Challenge",
      sub: isYoung ? 'Math · Science · English' : 'Math · Science · English',
      theme: 'tile-challenge',
      path: '/challenge',
      color: '#f5c542'
    },
    {
      id: 'news',
      emoji: isYoung ? '🌍' : '🔭',
      label: isYoung ? 'Explore the World' : 'Current Affairs',
      sub: isYoung ? 'Cool things happening!' : 'What\'s going on out there',
      theme: 'tile-news',
      path: '/current-affairs',
      color: '#39d0d8'
    },
    {
      id: 'music',
      emoji: '🎵',
      label: 'Music Studio',
      sub: isYoung ? 'Make amazing music!' : 'Compose · Create · Explore',
      theme: 'tile-music',
      path: '/music',
      color: '#a78bfa'
    },
    {
      id: 'jarvis',
      emoji: isYoung ? '🤖' : '✦',
      label: 'Jarvis',
      sub: isYoung ? 'My AI best friend!' : 'Your AI companion',
      theme: 'tile-jarvis',
      path: '/jarvis',
      color: '#ff6b6b'
    }
  ];
}

// ── Floating particles for young kids ────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: ['⭐', '✨', '🌟', '💫', '🎈', '🎉'][i % 6],
    left: `${(i * 8.3) % 100}%`,
    animDuration: `${4 + (i * 0.7)}s`,
    animDelay: `${i * 0.4}s`,
    size: `${14 + (i % 3) * 6}px`
  }));

  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="particle"
          style={{ left: p.left, animationDuration: p.animDuration, animationDelay: p.animDelay, fontSize: p.size }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────────
function StreakBadge({ age }) {
  const isYoung = parseInt(age) <= 11;
  // In Phase 2 this will be real data from the backend
  const streak = 1;
  return (
    <div className={`streak-badge ${isYoung ? 'streak-young' : 'streak-old'}`}>
      🔥 {streak} day streak
    </div>
  );
}

// ── Main Home component ───────────────────────────────────────────────────────
export default function Home() {
  const child = session.getChild();
  const age = parseInt(child.age) || 12;
  const isYoung = age <= 11;
  const nav = useNavigate();
  const [activeTile, setActiveTile] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  function getGreeting() {
    const h = new Date().getHours();
    if (isYoung) {
      if (h < 12) return '🌅 Good morning';
      if (h < 17) return '☀️ Good afternoon';
      return '🌙 Good evening';
    } else {
      if (h < 12) return 'Morning';
      if (h < 17) return 'Hey';
      return 'Evening';
    }
  }

  function handleTileClick(tile) {
    setActiveTile(tile.id);
    playTileSound(age);
    setTimeout(() => {
      setActiveTile(null);
      nav(tile.path);
    }, 300);
  }

  const tiles = getTiles(age);

  return (
    <div className={`home-page ${isYoung ? 'home-young' : 'home-old'} ${mounted ? 'mounted' : ''}`}>

      {/* Particles for young kids */}
      {isYoung && <Particles />}

      {/* Background glow for older kids */}
      {!isYoung && <div className="home-bg-glow" aria-hidden="true" />}

      {/* Greeting section */}
      <div className={`home-greeting ${mounted ? 'greeting-mounted' : ''}`}>
        {isYoung ? (
          <>
            <div className="greeting-young-hey">{getGreeting()},</div>
            <div className="greeting-young-name">{child.childName}! 🌟</div>
            <div className="greeting-young-sub">Ready for today's adventure?</div>
          </>
        ) : (
          <>
            <div className="greeting-old-hey">{getGreeting()},</div>
            <div className="greeting-old-name">{child.childName}</div>
            <div className="greeting-old-sub">Grade {child.grade} · What are we tackling today?</div>
          </>
        )}
        <StreakBadge age={age} />
      </div>

      {/* Tiles grid */}
      <div className={`home-tiles ${isYoung ? 'tiles-young' : 'tiles-old'}`}>
        {tiles.map((tile, i) => (
          <div
            key={tile.id}
            className={`home-tile-new ${tile.theme} ${activeTile === tile.id ? 'tile-active' : ''} ${mounted ? 'tile-mounted' : ''}`}
            style={{ animationDelay: `${i * 0.08}s`, '--tile-color': tile.color }}
            onClick={() => handleTileClick(tile)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleTileClick(tile)}
          >
            {/* Glow background */}
            <div className="tile-glow" />

            {/* Content */}
            <div className="tile-emoji-new">{tile.emoji}</div>
            <div className="tile-label-new">{tile.label}</div>
            <div className="tile-sub-new">{tile.sub}</div>

            {/* Arrow for older kids */}
            {!isYoung && <div className="tile-arrow">→</div>}

            {/* Sparkle for younger kids */}
            {isYoung && activeTile === tile.id && (
              <div className="tile-sparkle">✨</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={`home-bottom ${mounted ? 'bottom-mounted' : ''}`}>
        <button className="home-switch-btn" onClick={() => { session.clearChild(); nav('/select'); }}>
          Switch profile
        </button>
      </div>

    </div>
  );
}
