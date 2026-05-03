import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import LandingPage      from './pages/LandingPage';
import ParentSetup      from './pages/ParentSetup';
import ChildSelect      from './pages/ChildSelect';
import AboutMe          from './pages/AboutMe';
import Home             from './pages/Home';
import PrivacyPolicy    from './pages/PrivacyPolicy';
import ParentDashboard  from './pages/ParentDashboard';
import { session }      from './session';

function RequireParent({ children }) {
  if (!session.hasParent()) return <Navigate to="/" replace />;
  return children;
}

function RequireChild({ children }) {
  if (!session.hasChild()) return <Navigate to="/select" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/privacy"        element={<PrivacyPolicy />} />
        <Route path="/parent-setup"   element={<ParentSetup />} />
        <Route path="/dashboard"      element={<RequireParent><ParentDashboard /></RequireParent>} />
        <Route path="/select"         element={<RequireParent><ChildSelect /></RequireParent>} />
        <Route path="/about-me"       element={<RequireParent><AboutMe /></RequireParent>} />
        <Route path="/home"           element={<RequireChild><Home /></RequireChild>} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
