import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PublicRoute Component
 *
 * Redirects authenticated users away from public pages (like sign-in/sign-up)
 * to the dashboard. This prevents logged-in users from accessing auth pages.
 *
 * @param {ReactNode} children - The component to render if user is not authenticated
 * @returns {ReactNode} - Either the children or a redirect to dashboard
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  // Otherwise, show the public page (sign-in/sign-up)
  return user ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
