import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/**
 * MarketingLayout wraps public‑facing pages (landing, auth, pricing) with a
 * top navigation bar and footer. The Outlet renders the child route
 * associated with the current path.
 */
function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MarketingLayout;