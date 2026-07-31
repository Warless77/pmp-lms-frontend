import React from 'react';
import { Link } from 'react-router-dom';

/**
 * UpgradeGate replaces a locked feature with an on-brand upsell card instead
 * of letting the user hit a raw server error. Shown when the learner's
 * current tier does not include a given feature (Mock Exam, Question Bank,
 * AI Coach, etc.).
 *
 * Usage:
 *   <UpgradeGate
 *     feature="Mock Exam"
 *     requiredTier="Premium"
 *     currentTier={entitlement.tier}
 *     description="Full 180-question, 230-minute timed simulations with
 *       server-graded results are part of the Premium plan."
 *   />
 */
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
