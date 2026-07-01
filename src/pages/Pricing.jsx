import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PricingCard from '../components/PricingCard.jsx';
import { pricingPlans } from '../data/mockData.js';

/**
 * Pricing page lists all subscription options available in the LMS. Each plan
 * is described using a PricingCard. Additional context explaining the value
 * proposition could be added here.
 */
function Pricing() {
  return (
    <div>
      <PageHeader title="Pricing" subtitle="Choose a plan that suits your needs" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.name} name={plan.name} price={plan.price} features={plan.features} highlight={plan.highlight} />
        ))}
      </div>
    </div>
  );
}

export default Pricing;