import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Facebook as FacebookIcon,
  Pages as PagesIcon,
  TrendingUp as LeadsIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as SharkLogo } from '../assets/icon.svg';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [error, setError] = useState('');
  const [facebookLoading, setFacebookLoading] = useState(false);

  // Manejar callback de Facebook al cargar el componente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbToken = urlParams.get('fb_token');
    const fbId = urlParams.get('fb_id');
    const userName = urlParams.get('name');
    const fbError = urlParams.get('error');
    
    if (fbError) {
      setError('Error al iniciar sesión con Facebook: ' + (urlParams.get('error_description') || 'Error desconocido'));
    } else if (fbToken && fbId) {
      // Login exitoso con Facebook
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authMethod', 'facebook');
      localStorage.setItem('facebookToken', fbToken);
      localStorage.setItem('userData', JSON.stringify({
        id: fbId,
        firstname: userName || 'Usuario Facebook',
        name: userName || 'Usuario Facebook',
        role: 'Facebook User'
      }));
      
      // Limpiar URL y redirigir
      window.history.replaceState({}, document.title, '/login');
      navigate('/');
    }
  }, [navigate]);

  const handleFacebookLogin = () => {
    setFacebookLoading(true);
    setError('');
    
    // Redirigir directamente al endpoint de inicio de Facebook en tu backend
    window.location.href = 'https://chatboot-webhook-production.up.railway.app/auth/facebook/start';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://id-frontend.prod-east.frontend.public.atl-paas.net/assets/wac.92a80da2.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha('#000', 0.3),
          zIndex: 1
        }
      }}
    >
              <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: { xs: '90%', sm: 450 },
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
          <Box sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            borderRadius: 2,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            p: 1
          }}>
            <SharkLogo 
              style={{
                width: '48px',
                height: '48px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Shark Business Suite
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Inicia sesión con tu portafolio de Meta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: { xs: '0.875rem', sm: '0.875rem' }
          }}>
            Accede a todas tus herramientas de marketing digital
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Botón de Facebook Login */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<FacebookIcon />}
          onClick={handleFacebookLogin}
          disabled={facebookLoading}
          sx={{
            py: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            textTransform: 'none',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
            boxShadow: '0 4px 16px rgba(24, 119, 242, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #166FE5 0%, #1976D2 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(24, 119, 242, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.7,
              transform: 'none'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {facebookLoading ? 'Conectando con Meta...' : 'Continuar con Meta Business'}
        </Button>

        {/* Información adicional mejorada */}
        <Box sx={{ mt: { xs: 3, sm: 4 }, pt: { xs: 2, sm: 3 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="body2" color="text.secondary" sx={{ 
            textAlign: 'center', 
            mb: { xs: 2, sm: 3 },
            fontWeight: 500,
            fontSize: { xs: '0.875rem', sm: '0.875rem' }
          }}>
            Al continuar con Meta, podrás:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            {[
              {
                icon: <PagesIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#1877F2' }} />,
                text: 'Gestionar tus páginas de Facebook e Instagram'
              },
              {
                icon: <LeadsIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#00C851' }} />,
                text: 'Acceder a leads y mensajes automatizados'
              },
              {
                icon: <CampaignIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#FF6900' }} />,
                text: 'Sincronizar campañas de marketing digital'
              }
            ].map((feature, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                    transform: { xs: 'none', sm: 'translateX(4px)' }
                  }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: 1,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  fontWeight: 500,
                  flex: 1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: { xs: 3, sm: 4 }, pt: { xs: 2, sm: 3 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontSize: { xs: '0.75rem', sm: '0.75rem' }
          }}>
            Desarrollado con 
            <span style={{ color: '#e25555', fontSize: '16px' }}>❤️</span> 
            por Shark Agency
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;