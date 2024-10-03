// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from './Router';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await getAccessToken();
        const role = Cookies.get('userRole'); // Get roll user from cookies

        setIsAuthenticated(!!token);
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching token or role:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null || userRole === null) {
    return <div>Loading...</div>; // Loading message
  }

  if (isAuthenticated && userRole === '2' && window.location.pathname === '/map') {
    window.location.replace('/map-public');
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
