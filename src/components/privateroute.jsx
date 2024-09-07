import React from 'react';
import { Navigate } from 'react-router-dom';

// PrivateRoute component to protect dashboard
function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token'); // Assuming token is stored in localStorage

  return isAuthenticated ? children : <Navigate to="/" />; // Redirect to login if not authenticated
}

export default PrivateRoute;
