import React, { useState } from 'react';
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
  alpha
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
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
      </Paper>
    </Box>
  );
};

export default Login;
