import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { EntitlementProvider } from './context/EntitlementContext.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <EntitlementProvider>
          <App />
        </EntitlementProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
