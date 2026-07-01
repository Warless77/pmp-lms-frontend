import React from 'react';

/**
 * AdminCard displays a simple statistic or navigation item in the admin portal.
 */
function AdminCard({ title, value }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', flex: 1 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{value}</div>
      <div style={{ color: 'var(--color-muted)' }}>{title}</div>
    </div>
  );
}

export default AdminCard;