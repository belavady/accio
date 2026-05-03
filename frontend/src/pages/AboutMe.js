import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAboutMe } from '../api';
import { session } from '../session';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const QUESTIONS = [
  {
    key: 'favouriteSport',
    emoji: '🏆',
    question: "First things first — what's your favourite sport or activity?",
    placeholder: 'e.g. Cricket, Swimming, Gaming, Dancing...',
    fieldLabel: 'favourite sport or activity'
  },
  {
    key: 'favouriteSubject',
    emoji: '📚',
    question: "Nice! What's your favourite subject at school?",
    placeholder: 'e.g. Science, Maths, Art, History...',
    fieldLabel: 'favourite subject'
  },
  {
    key: 'favouriteAnimal',
    emoji: '🐾',
    question: "Cool! If you could have any animal as a pet, what would it be?",
    placeholder: 'e.g. Dolphin, Dog, Cheetah, Dragon...',
    fieldLabel: 'favourite animal'
  },
  {
    key: 'favouriteMusic',
    emoji: '🎵',
    question: "Great taste! What kind of music gets you pumped up?",
    placeholder: 'e.g. Hip hop, Pop, Classical, Video game music...',
    fieldLabel: 'favourite music'
  },
  {
    key: 'careerAspiration',
    emoji: '🚀',
    question: "Big question — what do you want to be when you grow up?",
    placeholder: 'e.g. Scientist, Footballer, Engineer, Artist...',
    fieldLabel: 'career aspiration'
  },
  {
    key: 'favouriteBookOrMovie',
    emoji: '🎬',
    question: "What's your all-time favourite book or movie?",
    placeholder: 'e.g. Harry Potter, The Avengers, Percy Jackson...',
    fieldLabel: 'favourite book or movie'
  },
  {
    key: 'dreamDestination',
    emoji: '🌍',
    question: "Last one — if you could teleport anywhere in the world right now, where would you go?",
    placeholder: 'e.g. Tokyo, New York, Hogwarts, Mars...',
    fieldLabel: 'dream destination'
  }
];

async function getAccioResponse(question, answer, childName, age) {
  try {
    const res = await fetch(`${API_URL}/api/about-me/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, childName, age })
    });
    const data = await res.json();
    return data.response || "Love it! You're amazing! ✨";
  } catch {
    const fallbacks = [
      "Love that! You're incredible! ✨",
      "Amazing answer! I knew we'd get along! 🌟",
      "Fantastic! Can't wait to learn together! 🎉",
      "That's brilliant! This is going to be so fun! 🚀",
      "Wow, great taste! We're going to have a blast! ⭐"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export default function AboutMe() {
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState({});
  const [inputValue, setInputValue]   = useState('');
  const [accioResponse, setAccioResponse] = useState('');
  const [showResponse, setShowResponse]   = useState(false);
  const [animating, setAnimating]         = useState(false);
  const [direction, setDirection]         = useState('in');
  const [saving, setSaving]               = useState(false);
  const [done, setDone]                   = useState(false);
  const inputRef = useRef(null);
  const nav = useNavigate();
  const child = session.getChild();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentIdx]);

  // Entrance animation on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  async function handleNext() {
    const answer = inputValue.trim();
    if (!answer) {
      // Gentle nudge
      if (inputRef.current) {
        inputRef.current.style.borderColor = 'var(--gold)';
        inputRef.current.placeholder = "Come on, give it a go! Even a wild guess works 😄";
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.borderColor = '';
            inputRef.current.placeholder = QUESTIONS[currentIdx].placeholder;
          }
        }, 2000);
      }
      return;
    }

    // Save answer
    const newAnswers = { ...answers, [QUESTIONS[currentIdx].key]: answer };
    setAnswers(newAnswers);

    // Get Accio's playful response
    const q = QUESTIONS[currentIdx];
    const response = await getAccioResponse(q.question, answer, child.childName, child.age);
    setAccioResponse(response);
    setShowResponse(true);

    // After showing response, animate to next question
    setTimeout(async () => {
      if (currentIdx < QUESTIONS.length - 1) {
        // Animate out
        setAnimating(true);
        setDirection('out');
        await new Promise(r => setTimeout(r, 350));

        setCurrentIdx(currentIdx + 1);
        setInputValue('');
        setShowResponse(false);
        setAccioResponse('');
        setDirection('in');
        setAnimating(false);
      } else {
        // Last question — save everything
        setShowResponse(false);
        setSaving(true);
        try {
          await saveAboutMe({
            childId: child.childId,
            favouriteSport:       newAnswers.favouriteSport,
            favouriteSubject:     newAnswers.favouriteSubject,
            favouriteAnimal:      newAnswers.favouriteAnimal,
            favouriteMusic:       newAnswers.favouriteMusic,
            careerAspiration:     newAnswers.careerAspiration,
            favouriteBookOrMovie: newAnswers.favouriteBookOrMovie,
            freeText:             newAnswers.dreamDestination,
          });
          setDone(true);
          setTimeout(() => nav('/home'), 2000);
        } catch {
          nav('/home');
        }
      }
    }, 2200);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleNext();
  }

  const q = QUESTIONS[currentIdx];
  const progress = ((currentIdx) / QUESTIONS.length) * 100;

  // Done screen
  if (done) {
    return (
      <div className="page">
        <div className="about-me-done fade-in">
          <div className="about-me-done-emoji">🎉</div>
          <h2 className="about-me-done-title">We're going to be great friends!</h2>
          <p className="about-me-done-sub">Taking you to your learning adventure...</p>
          <div className="about-me-done-loader">
            <div className="about-me-done-progress" />
          </div>
        </div>
      </div>
    );
  }

  // Saving screen
  if (saving) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: '0.9rem' }}>
            Saving your answers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-me-page">

      {/* Top progress bar */}
      <div className="about-me-progress-bar">
        <div className="about-me-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Accio orb */}
      <div className={`about-me-orb ${showResponse ? 'orb-respond' : 'orb-idle'}`}>
        <div className="orb-inner" />
        <div className="orb-ring" />
      </div>

      {/* Question card */}
      <div className={`about-me-card ${mounted ? 'mounted' : ''} ${animating ? (direction === 'out' ? 'slide-out' : '') : ''}`}>

        {/* Question counter */}
        <div className="about-me-counter">
          {currentIdx + 1} of {QUESTIONS.length}
        </div>

        {/* Emoji */}
        <div className="about-me-emoji">{q.emoji}</div>

        {/* Question */}
        <h2 className="about-me-question">
          {q.question}
        </h2>

        {/* Accio response */}
        {showResponse && (
          <div className="accio-response-bubble fade-in">
            <span className="accio-label">Accio says:</span>
            <span className="accio-response-text">{accioResponse}</span>
          </div>
        )}

        {/* Input — hidden when showing response */}
        {!showResponse && (
          <div className="about-me-input-wrap fade-in">
            <input
              ref={inputRef}
              type="text"
              className="about-me-input"
              placeholder={q.placeholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              className="about-me-next-btn"
              onClick={handleNext}
              disabled={!inputValue.trim()}
            >
              {currentIdx === QUESTIONS.length - 1 ? "Done! 🎉" : "Next →"}
            </button>
          </div>
        )}

        {/* Dot indicators */}
        <div className="about-me-dots">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`about-me-dot ${i === currentIdx ? 'active' : i < currentIdx ? 'done' : ''}`}
            />
          ))}
        </div>

      </div>

      {/* Skip option */}
      <button className="about-me-skip" onClick={() => nav('/home')}>
        Skip for now
      </button>

    </div>
  );
}
