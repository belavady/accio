import React from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../session';

const TILES = [
  {
    id: 'challenge',
    icon: '🎯',
    label: "Today's Challenge",
    sub: 'Math · Science · English',
    theme: 'tile-challenge',
    path: '/challenge'
  },
  {
    id: 'news',
    icon: '🌍',
    label: 'Current Affairs',
    sub: 'Explore the world',
    theme: 'tile-news',
    path: '/current-affairs'
  },
  {
    id: 'music',
    icon: '🎵',
    label: 'Music',
    sub: 'Compose something amazing',
    theme: 'tile-music',
    path: '/music'
  },
  {
    id: 'jarvis',
    icon: '🤖',
    label: 'Jarvis',
    sub: 'Your AI friend',
    theme: 'tile-jarvis',
    path: '/jarvis'
  }
];

export default function Home() {
  const child = session.getChild();
  const nav = useNavigate();

  // Get time-based greeting
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div className="page" style={{ gap: 32 }}>

      {/* Greeting */}
      <div className="greeting fade-in">
        <div className="greeting-hey">{getGreeting()}</div>
        <div className="greeting-name">{child.childName} ✨</div>
        <div className="greeting-sub">
          Grade {child.grade} · What are we exploring today?
        </div>
      </div>

      {/* 4 tiles */}
      <div className="home-grid fade-in">
        {TILES.map(tile => (
          <div
            key={tile.id}
            className={`home-tile ${tile.theme}`}
            onClick={() => nav(tile.path)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && nav(tile.path)}
          >
            <div className="tile-icon">{tile.icon}</div>
            <div className="tile-label">{tile.label}</div>
            <div className="tile-sub">{tile.sub}</div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        className="btn btn-ghost"
        style={{ fontSize: '0.8rem', width: 'auto' }}
        onClick={() => {
          session.clearChild();
          nav('/select');
        }}
      >
        Switch profile
      </button>

    </div>
  );
}
