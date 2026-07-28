import React from 'react';

/**
 * Generic statistic card used throughout dashboards to display a metric and
 * description. Props include a title, value and optional children for icons.
 */
function StatCard({ title, value, children }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div><div className="stat-title">{title}</div>
      {children && <div style={{ marginTop: '.5rem' }}>{children}</div>}
    </div>
  );
}

export default StatCard;
