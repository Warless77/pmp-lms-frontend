import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import AdminCard from '../components/AdminCard.jsx';
import { adminStats } from '../data/mockData.js';

/**
 * Admin page provides a dashboard for administrators. It displays key
 * statistics. Future iterations should add management interfaces.
 */
function Admin() {
  return (
    <div>
      <PageHeader title="Admin" subtitle="Platform administration" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <AdminCard title="Active Users" value={adminStats.activeUsers} />
        <AdminCard title="Revenue" value={adminStats.revenue} />
        <AdminCard title="Completion Rate" value={`${adminStats.completionRate}%`} />
        <AdminCard title="New Registrations" value={adminStats.newRegistrations} />
        <AdminCard title="Popular Module" value={adminStats.popularModule} />
        <AdminCard title="Support Tickets" value={adminStats.supportTickets} />
        <AdminCard title="Trial Users" value={adminStats.trialUsers} />
        <AdminCard title="Premium Users" value={adminStats.premiumUsers} />
      </div>
    </div>
  );
}

export default Admin;