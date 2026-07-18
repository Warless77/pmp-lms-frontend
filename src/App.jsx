import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Page components
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Modules from './pages/Modules.jsx';
import ModuleDetail from './pages/ModuleDetail.jsx';
import Flashcards from './pages/Flashcards.jsx';
import QuestionBank from './pages/QuestionBank.jsx';
import Quiz from './pages/Quiz.jsx';
import MockExam from './pages/MockExam.jsx';
import Analytics from './pages/Analytics.jsx';
import Pricing from './pages/Pricing.jsx';
import Certificates from './pages/Certificates.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

/**
 * Main application component defining all routes.
 *
 * Routes are grouped under two primary layouts: MarketingLayout for public pages and
 * DashboardLayout for authenticated sections of the LMS. The catch‑all route renders
 * a simple 404 page for unknown paths.
 */
function App() {
  return (
    <Routes>
      {/* Marketing routes */}
      <Route element={<MarketingLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>

      {/* Authenticated beta routes */}
      <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="modules" element={<Modules />} />
        <Route path="modules/:id" element={<ModuleDetail />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="mock-exam" element={<MockExam />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<DashboardLayout />}>
          <Route path="admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Fallback for all other routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
