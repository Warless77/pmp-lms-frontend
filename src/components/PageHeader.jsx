import React from 'react';

/**
 * Generic page header component with a title and optional subtitle. Useful
 * across dashboard pages to maintain consistency.
 */
function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--color-muted)' }}>{subtitle}</p>}
      {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
    </div>
  );
}

export default PageHeader;