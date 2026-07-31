import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PricingCard from '../components/PricingCard.jsx';
import { pricingPlans } from '../data/mockData.js';
import { getLearnerEntitlement } from '../services/contentService.js';

/**
 * Pricing page lists all subscription options available in the LMS. Each plan
 * is described using a PricingCard. Additional context explaining the value
 * proposition could be added here.
 */
function Pricing() {
  const [entitlement, setEntitlement] = useState(null);
  useEffect(() => { getLearnerEntitlement().then(setEntitlement).catch(() => setEntitlement(null)); }, []);
  const currentTier = entitlement?.tier;
  return (
    <div>
      <PageHeader title="Private beta access" subtitle="Plans are being tested; payment is not enabled." />
      <p className="form-success">This is an invitation-only beta. You will not be charged and no purchase is available yet.</p>
      {currentTier && currentTier !== 'none' && <p className="surface-card" style={{ padding: '1rem' }}>Your current plan: <strong>{currentTier[0].toUpperCase()}{currentTier.slice(1)}</strong>{entitlement.expiresAt ? ` · expires ${new Date(entitlement.expiresAt).toLocaleDateString()}` : ''}. Contact the administrator to change your plan during beta.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.name} name={plan.name} price={plan.price} features={plan.features} highlight={plan.highlight} />
        ))}
      </div>
    </div>
  );
}

export default Pricing;
