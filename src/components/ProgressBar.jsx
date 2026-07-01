import React from 'react';

/**
 * Simple horizontal progress bar. Accepts a `progress` prop between 0 and 100.
 */
function ProgressBar({ progress }) {
  return (
    <div style={{ backgroundColor: 'var(--color-border)', borderRadius: '4px', width: '100%', height: '8px' }}>
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '4px'
        }}
      ></div>
    </div>
  );
}

export default ProgressBar;