import React from 'react';
import { Link } from 'react-router-dom';

function UpgradeGate({ feature, requiredTier = 'Premium', currentTier, description }) {
  const tierLabel = currentTier ? `${currentTier[0].toUpperCase()}${currentTier.slice(1)}` : 'your current plan';
  return (
    <div className="surface-card upgrade-gate">
      <span className="page-eyebrow">Locked feature</span>
      <h2>{feature} is a {requiredTier} feature</h2>
      <p>{description || `${feature} isn't included on ${tierLabel}. Upgrade to unlock it.`}</p>
      <div className="upgrade-gate-actions">
        <Link className="button-primary" to="/pricing">View plans</Link>
        <Link className="button-secondary" to="/dashboard">Back to dashboard</Link>
      </div>
      {currentTier && <p className="upgrade-gate-current">Current plan: <strong>{tierLabel}</strong></p>}
    </div>
  );
}

export default UpgradeGate;
