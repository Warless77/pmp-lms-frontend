import React from 'react';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.jsx';
import PricingCard from '../components/PricingCard.jsx';
import { pricingPlans } from '../data/mockData.js';

/**
 * Landing page describing the PMP LMS. Includes hero, value proposition,
 * feature overview and a pricing preview. Future iterations should expand
 * these sections with richer content and imagery.
 */
function Landing() {
  // Define simple features for demonstration
  const features = [
    { title: 'Learning Modules', description: 'Structured content covering all PMP domains.' },
    { title: 'Smart Flashcards', description: 'Spaced‑repetition flashcards for long‑term retention.' },
    { title: 'Question Bank', description: 'Hundreds of practice questions with detailed explanations.' },
    { title: 'Mock Exams', description: 'Realistic 180‑question exam simulations.' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>Learn Smart. Pass Confidently.</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Private-beta PMP exam preparation with practice questions, flashcards, timed mock exams and progress tracking.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/register" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '4px' }}>
            Start 7‑Day Trial
          </Link>
          <Link to="/dashboard" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '4px' }}>
            View Dashboard
          </Link>
        </div>
      </section>
      {/* Value Strip */}
      <section style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
        {['Private beta access', 'Smart Flashcards', 'Timed Mock Exams', 'Progress Tracking', 'Admin Review'].map((text) => (
          <div
            key={text}
            style={{ flex: '1 1 150px', backgroundColor: 'var(--color-surface)', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}
          >
            <span style={{ fontWeight: 600 }}>{text}</span>
          </div>
        ))}
      </section>
      {/* Features */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center' }}>Features</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {features.map((feat) => (
            <FeatureCard key={feat.title} title={feat.title} description={feat.description} />
          ))}
        </div>
      </section>
      {/* Pricing preview */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center' }}>Pricing</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} name={plan.name} price={plan.price} features={plan.features} highlight={plan.highlight} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Landing;
