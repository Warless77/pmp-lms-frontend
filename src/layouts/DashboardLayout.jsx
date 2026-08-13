import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { EntitlementProvider } from '../context/EntitlementContext.jsx';

function DashboardLayout() {
  return (
    <EntitlementProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main"><div className="content-wrap"><Outlet /></div></main>
      </div>
    </EntitlementProvider>
  );
}

export default DashboardLayout;
