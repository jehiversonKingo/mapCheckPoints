import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccessToken, setAccessToken } from './Router'; // Importar getAccessToken
import { nanoid } from 'nanoid';
import Cookies from 'js-cookie';
import logo from '/logo.png';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in
    const checkIfLoggedIn = async () => {
      const token = await getAccessToken();
      if (token) {
        navigate('/map'); // Redirect if, already logged in
      }
    };
    checkIfLoggedIn();
  }, [navigate]); // Add navigate how denpence

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const loginData = {
      userName: email,
      userPassword: password,
    };
  
    try {
      const response = await fetch('http://localhost:3001/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
  
      if (response.ok) {
        const accessToken = nanoid();
        setAccessToken(accessToken);
  
        const data = await response.json();
        Cookies.set('userRole', data.idRoll); // Almacenar el rol del usuario en cookies
  
        if (data.idRoll === 1) {
          navigate('/map'); // Admin
        } else if (data.idRoll === 2) {
          navigate('/map-public'); // User
        }
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className='bg-gray-900 w-full h-[100vh] flex flex-col items-center'>
      <div className='m-[15vh] flex flex-col items-center gap-2'>
        <img className='bg-white p-2 rounded-3xl' src={logo} alt="Not Found" width={'100px'} />
        <form className='bg-slate-800 text-white w-96 p-5 rounded-lg flex flex-col gap-5' onSubmit={handleSubmit}>
          <h1 className='font-bold text-3xl text-center'>Inicio de Sesión</h1>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="email@gmail.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className='text-red-500'>{error}</div>}
          <button type='submit' className='bg-orange-500 py-2 rounded-xl hover:bg-orange-700'>Iniciar Sesión</button>
          <span className='text-sm text-gray-400'>No tienes una cuenta? <Link to='/sign-up' className='text-blue-500 hover:underline'>Crear Cuenta</Link></span>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
