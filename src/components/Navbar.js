import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Avatar, 
  Typography, 
  Badge,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = ({ pageTitle }) => {
  // Estados para el menú de perfil
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  
  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
      }
    } else {
      // Datos de usuario dummy para demostración
      setUserData({
        firstname: 'Usuario',
        lastname: 'Prueba',
        role: 'Admin'
      });
    }
  }, []);

  // Manejo del menú de usuario
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    handleClose();
    // Eliminar datos de autenticación del localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Redirigir al usuario a la página de login
    navigate('/login', { replace: true });
  };

  // Determinar el nombre de usuario y rol para mostrar
  const displayName = userData ? 
    (userData.firstname && userData.lastname ? 
      `${userData.firstname} ${userData.lastname}` : 
      userData.username || userData.email || 'Usuario') : 
    'Usuario';
    
  // Obtener el rol principal
  const userRole = userData ? 
    (userData.role || 'Usuario') : 
    'Usuario';

  // Función para obtener el icono apropiado según el rol
  const getRoleIcon = (role) => {
    if (!role) return <PersonIcon fontSize="small" />;
    
    const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
    
    if (roleLower.includes('admin') || roleLower === 'administrator' || roleLower === 'manager') {
      return <AdminPanelSettingsIcon fontSize="small" />;
    } else if (roleLower.includes('teach') || roleLower === 'professor' || roleLower === 'instructor') {
      return <SupervisorAccountIcon fontSize="small" />;
    } else if (roleLower === 'student' || roleLower === 'estudiante' || roleLower === 'alumno') {
      return <SchoolIcon fontSize="small" />;
    } else {
      return <PersonIcon fontSize="small" />;
    }
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0} 
      sx={{ 
        top: 0, 
        zIndex: 1100, 
        padding: '0px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
        width: 'calc(100% - 250px)', 
        left: '250px',
        bgcolor: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', minHeight: '64px' }}>
        {/* Título de la página */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#333',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -6,
                left: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#003491',
                borderRadius: '2px'
              }
            }}
          >
            {pageTitle}
          </Typography>
        </Box>

        {/* Iconos y perfil */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          {/* Tooltip para agenda */}
          <Tooltip title="Agenda">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#003491',
                  backgroundColor: 'rgba(0, 52, 145, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <EventNoteIcon />
            </IconButton>
          </Tooltip>
          
          {/* Tooltip para notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#003491',
                  backgroundColor: 'rgba(0, 52, 145, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#003491' } }}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Tooltip para chat */}
          <Tooltip title="Chat">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#003491',
                  backgroundColor: 'rgba(0, 52, 145, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Badge badgeContent={2} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: '#003491' } }}>
                <ChatIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />
          
          {/* Perfil de usuario */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              pl: 1,
              cursor: 'pointer',
              '&:hover': {
                '& .perfil-usuario-nombre': {
                  color: '#003491'
                }
              }
            }}
            onClick={handleClick}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#f5f5f5', 
                color: '#003491',
                border: '2px solid #003491',
                width: 38,
                height: 38
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ mr: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  className="perfil-usuario-nombre"
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    transition: 'color 0.2s'
                  }}
                >
                  {displayName}
                </Typography>
                <KeyboardArrowDownIcon 
                  fontSize="small" 
                  sx={{ 
                    color: open ? '#003491' : '#666',
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* Chip del rol principal */}
                <Chip 
                  icon={getRoleIcon(userRole)}
                  label={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                  size="small" 
                  sx={{ 
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: 'rgba(0, 52, 145, 0.1)',
                    color: '#003491',
                    borderRadius: 1
                  }} 
                />
              </Box>
            </Box>
          </Box>
          
          {/* Menú de usuario */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 2,
              sx: {
                width: 240, // Ancho fijo para el menú
                borderRadius: 2,
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ py: 1.5 }} onClick={handleClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Mi Perfil</Typography>
            </MenuItem>
            <MenuItem sx={{ py: 1.5 }} onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Configuración</Typography>
            </MenuItem>
            <Divider />
            <MenuItem 
              sx={{ py: 1.5, color: '#003491' }}
              onClick={handleLogout}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#003491' }} />
              </ListItemIcon>
              <Typography variant="body2">Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;