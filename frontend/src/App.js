import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import LandingPage    from './pages/LandingPage';
import ParentSetup    from './pages/ParentSetup';
import ChildSelect    from './pages/ChildSelect';
import AboutMe        from './pages/AboutMe';
import Home           from './pages/Home';
import { session }    from './session';

// Guard — redirects to landing if no parent session
function RequireParent({ children }) {
  if (!session.hasParent()) return <Navigate to="/" replace />;
  return children;
}

// Guard — redirects to child select if no child session
function RequireChild({ children }) {
  if (!session.hasChild()) return <Navigate to="/select" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing — access code entry */}
        <Route path="/" element={<LandingPage />} />

        {/* Parent setup — first time only */}
        <Route path="/parent-setup" element={<ParentSetup />} />

        {/* Child selection — which child is using the app */}
        <Route path="/select" element={
          <RequireParent><ChildSelect /></RequireParent>
        } />

        {/* About Me — first time child logs in */}
        <Route path="/about-me" element={
          <RequireParent><AboutMe /></RequireParent>
        } />

        {/* Home screen — the 4 tiles */}
        <Route path="/home" element={
          <RequireChild><Home /></RequireChild>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
