import React from 'react';

/**
 * Generic statistic card used throughout dashboards to display a metric and
 * description. Props include a title, value and optional children for icons.
 */
function StatCard({ title, value, children }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', flex: 1 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{value}</div>
      <div style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>{title}</div>
      {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
    </div>
  );
}

export default StatCard;