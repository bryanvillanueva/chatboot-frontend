import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Alert,
  useTheme,
  alpha,
  Divider,
  Chip
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular delay de red
    setTimeout(() => {
      if (credentials.username === 'Admin' && credentials.password === 'Shark2025*!_') {
        // Guardar estado de autenticación
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authMethod', 'credentials');
        localStorage.setItem('userData', JSON.stringify({
          firstname: 'Admin',
          role: 'Administrator'
        }));
        navigate('/');
      } else {
        setError('Credenciales inválidas');
      }
      setLoading(false);
    }, 1000);
  };

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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}>
            <WhatsAppIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SHARK Business Suite
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inicia sesión para continuar
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Botón de Facebook Login */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FacebookIcon />}
          onClick={handleFacebookLogin}
          disabled={facebookLoading}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1877F2',
            borderColor: alpha('#1877F2', 0.4),
            background: '#fff',
            boxShadow: `0 2px 8px ${alpha('#1877F2', 0.1)}`,
            '&:hover': {
              background: alpha('#1877F2', 0.06),
              borderColor: '#1877F2',
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha('#1877F2', 0.2)}`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.6
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {facebookLoading ? 'Redirigiendo a Facebook...' : 'Continuar con Facebook'}
        </Button>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Chip 
            label="o" 
            size="small" 
            sx={{ 
              mx: 2, 
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              color: theme.palette.text.secondary,
              fontWeight: 500
            }} 
          />
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* Formulario tradicional */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            autoComplete="username"
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            autoComplete="current-password"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100())`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100())`,
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        {/* Información adicional */}
        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
            Al usar Facebook, podrás acceder a tus páginas de Facebook<br />
            y gestionar leads automáticamente
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;