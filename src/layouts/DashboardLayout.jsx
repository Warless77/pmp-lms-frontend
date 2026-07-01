import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

/**
 * DashboardLayout provides a two‑column layout with a persistent sidebar
 * for authenticated routes. The main content area renders the nested
 * routes using the Outlet component.
 */
function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;