import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { EntitlementProvider } from '../context/EntitlementContext.jsx';

/**
 * DashboardLayout provides a two‑column layout with a persistent sidebar
 * for authenticated routes. The main content area renders the nested
 * routes using the Outlet component.
 */
function DashboardLayout() {
  return (
    <EntitlementProvider><div className="app-shell">
      <Sidebar />
      <main className="app-main"><div className="content-wrap"><Outlet /></div></main>
    </div></EntitlementProvider>
  );
}

export default DashboardLayout;
