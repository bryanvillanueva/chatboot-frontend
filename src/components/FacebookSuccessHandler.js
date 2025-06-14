// src/components/FacebookSuccessHandler.js
// Componente opcional para manejar la página de éxito
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const FacebookSuccessHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fbToken = urlParams.get('fb_token');
    const fbId = urlParams.get('fb_id');
    const userName = urlParams.get('name');
    const email = urlParams.get('email');
    const pages = urlParams.get('pages');

    if (fbToken && fbId) {
      // Guardar datos de autenticación
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authMethod', 'facebook');
      localStorage.setItem('facebookToken', fbToken);
      localStorage.setItem('userData', JSON.stringify({
        id: fbId,
        firstname: userName || 'Usuario Facebook',
        name: userName || 'Usuario Facebook',
        email: email || '',
        role: 'Facebook User',
        pages: pages || '0'
      }));

      // Mostrar mensaje de éxito por un momento y luego redirigir
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } else {
      // Si no hay datos válidos, redirigir al login
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3, color: '#1877F2' }} />
      <Typography variant="h6" sx={{ mb: 1, color: '#1877F2', fontWeight: 600 }}>
        ¡Conectado con Facebook!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Redirigiendo al dashboard...
      </Typography>
    </Box>
  );
};

export default FacebookSuccessHandler;