import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlement } from '../context/EntitlementContext.jsx';

const featureText = {
  questions: 'Question Bank is included with Standard and Premium.',
  mockExam: 'Mock Exams are included with Premium.',
  analytics: 'Analytics is included with Standard and Premium.',
  certificates: 'Certificates are included with Standard and Premium.',
  modules: 'Learning modules are included with an active plan.'
};

export default function EntitlementGate({ feature, children }) {
  const { loading, can } = useEntitlement();
  if (loading) return <p>Checking your learning plan…</p>;
  if (can(feature)) return children;
  return <section className="surface-card" style={{ maxWidth: '42rem', padding: '1.5rem' }}>
    <span className="page-eyebrow">Plan required</span>
    <h2>Upgrade your learning access</h2>
    <p>{featureText[feature] || 'This feature is not included with your current plan.'}</p>
    <Link className="button-primary" to="/pricing">View plans</Link>
  </section>;
}
