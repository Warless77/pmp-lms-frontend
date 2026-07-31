import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Page components
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Modules = lazy(() => import('./pages/Modules.jsx'));
const ModuleDetail = lazy(() => import('./pages/ModuleDetail.jsx'));
const Flashcards = lazy(() => import('./pages/Flashcards.jsx'));
const QuestionBank = lazy(() => import('./pages/QuestionBank.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const MockExam = lazy(() => import('./pages/MockExam.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Certificates = lazy(() => import('./pages/Certificates.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
import ProtectedRoute from './components/ProtectedRoute.jsx';
import EntitlementGate from './components/EntitlementGate.jsx';

/**
 * Main application component defining all routes.
 *
 * Routes are grouped under two primary layouts: MarketingLayout for public pages and
 * DashboardLayout for authenticated sections of the LMS. The catch‑all route renders
 * a simple 404 page for unknown paths.
 */
function App() {
  return <Suspense fallback={<div className="route-status">Loading PMP Compass…</div>}>
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
        <Route path="modules" element={<EntitlementGate feature="modules"><Modules /></EntitlementGate>} />
        <Route path="modules/:id" element={<EntitlementGate feature="modules"><ModuleDetail /></EntitlementGate>} />
        <Route path="flashcards" element={<EntitlementGate feature="flashcards"><Flashcards /></EntitlementGate>} />
        <Route path="questions" element={<EntitlementGate feature="questions"><QuestionBank /></EntitlementGate>} />
        <Route path="quiz" element={<EntitlementGate feature="practice"><Quiz /></EntitlementGate>} />
        <Route path="mock-exam" element={<EntitlementGate feature="mockExam"><MockExam /></EntitlementGate>} />
        <Route path="mock-exams" element={<EntitlementGate feature="mockExam"><MockExam /></EntitlementGate>} />
        <Route path="analytics" element={<EntitlementGate feature="analytics"><Analytics /></EntitlementGate>} />
        <Route path="certificates" element={<EntitlementGate feature="certificates"><Certificates /></EntitlementGate>} />
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
  </Suspense>;
}

export default App;
