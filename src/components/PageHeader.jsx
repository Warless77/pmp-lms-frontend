import React from 'react';

/**
 * Generic page header component with a title and optional subtitle. Useful
 * across dashboard pages to maintain consistency.
 */
function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div><span className="page-eyebrow">PMP Learning Hub</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {children && <div>{children}</div>}
    </div>
  );
}

export default PageHeader;
