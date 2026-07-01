import React from 'react';

/**
 * Simple component displayed when there is no data to show. Accepts a message and
 * optional action.
 */
function EmptyState({ message, action }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
      <p>{message}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export default EmptyState;