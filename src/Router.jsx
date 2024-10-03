import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Map from './Map';
import MapPublic from './MapPublic';
import ProtectedRoute from './ProtectedRoute';

// Functioon to make a token
export const setAccessToken = (token) => {
    Cookies.set('accessToken', token);
}

// Function to get the access token from cookies
export const getAccessToken = () => {
    return new Promise((resolve) => {
        resolve(Cookies.get('accessToken'));
    });
};

// Function to remove token
export const removeAccessToken = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userRole');
};

// Create the router configuration
const Router = createBrowserRouter(
  [
    {
      path: '/', // Route
      element: <SignIn />, // Element to render
      index: true // Route Default
    },
    {
      path: '/sign-up',
      element: <SignUp />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/map',
          element: <Map />
        },
        {
          path: '/map-public',
          element: <MapPublic />
        },
      ]
    },
    {
      path: '*',
      element: <p>404 Error - Nothing here...</p>
    }
  ]
);

export default Router;
