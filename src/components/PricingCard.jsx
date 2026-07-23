import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PricingCard displays information about a subscription plan including the
 * plan name, price, features and a call to action. Prop `highlight` will
 * apply a special style to draw attention to premium plans.
 */
function PricingCard({ name, price, features, highlight }) {
  return (
    <div
      style={{
        backgroundColor: highlight ? 'var(--color-primary)' : 'var(--color-surface)',
        color: highlight ? '#fff' : 'inherit',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3 style={{ marginTop: 0 }}>{name}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{price}</div>
      <ul style={{ marginTop: '1rem', flexGrow: 1 }}>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <Link
        to="/register"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: highlight ? '#fff' : 'var(--color-primary)',
          color: highlight ? 'var(--color-primary)' : '#fff',
          cursor: 'pointer', textAlign: 'center'
        }}
      >
        Request beta access
      </Link>
    </div>
  );
}

export default PricingCard;
