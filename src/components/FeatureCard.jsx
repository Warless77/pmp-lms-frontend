import React from 'react';

/**
 * Simple feature card highlighting a key benefit of the LMS. Accepts a title
 * and description. Icons can be added as children.
 */
function FeatureCard({ title, description, children }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', textAlign: 'center', flex: 1 }}>
      {children && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{children}</div>}
      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{description}</p>
    </div>
  );
}

export default FeatureCard;