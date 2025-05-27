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
  Chip,
  Button,
  useTheme,
  alpha,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import {
  Notifications as NotificationsIcon,
  EventNote as EventNoteIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  SupervisorAccount as SupervisorAccountIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

const Navbar = ({ pageTitle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { drawerWidth, isDrawerExpanded, hideNavbar } = useLayout();
  
  // Estados para menús
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const open = Boolean(anchorEl);
  const notificationsOpen = Boolean(notificationsAnchor);

  // Cargar datos del usuario
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
      // Datos dummy para demo
      setUserData({
        firstname: 'Admin',
        lastname: 'Usuario',
        role: 'Administrator',
        email: 'admin@shark.com'
      });
    }
  }, []);

  // Manejo del menú de usuario
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Manejo del menú de notificaciones
  const handleNotificationsClick = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    handleUserMenuClose();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login', { replace: true });
  };

  // Determinar el nombre de usuario y rol para mostrar
  const displayName = userData ? 
    (userData.firstname && userData.lastname ? 
      `${userData.firstname} ${userData.lastname}` : 
      userData.username || userData.email || 'Usuario') : 
    'Usuario';
    
  const userRole = userData?.role || 'Usuario';

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

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    const breadcrumbNameMap = {
      '': 'Dashboard',
      'chat': 'Chat',
      'appointments': 'Citas',
      'components': 'Componentes',
      'moodle': 'Moodle',
      'students': 'Estudiantes',
      'whatsapp-accounts': 'Cuentas WhatsApp',
      'flow-builder': 'Constructor de Flujos',
      'bulk-sending': 'Envíos Masivos',
      'crm-leads': 'CRM & Leads',
      'email-marketing': 'Email Marketing'
    };

    return (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ 
          '& .MuiBreadcrumbs-separator': { 
            color: theme.palette.text.secondary,
            mx: 1
          }
        }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            '&:hover': {
              color: theme.palette.primary.main,
            },
            transition: 'color 0.2s ease'
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Inicio
        </Link>
        
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return last ? (
            <Typography 
              key={to} 
              color="text.primary" 
              variant="body2"
              sx={{ fontWeight: 500 }}
            >
              {name}
            </Typography>
          ) : (
            <Link
              key={to}
              component="button"
              variant="body2"
              onClick={() => navigate(to)}
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                transition: 'color 0.2s ease'
              }}
            >
              {name}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  // Notificaciones dummy
  const notifications = [
    { id: 1, title: 'Nuevo mensaje en Chat', time: '2 min', type: 'message', unread: true },
    { id: 2, title: 'Cita programada para hoy', time: '15 min', type: 'event', unread: true },
    { id: 3, title: 'Usuario registrado en Moodle', time: '1 hora', type: 'user', unread: false },
    { id: 4, title: 'Backup completado', time: '2 horas', type: 'system', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  if (hideNavbar) return null;

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        width: { sm: `calc(100% - ${isDrawerExpanded ? drawerWidth : 72}px)` },
        ml: { sm: `${isDrawerExpanded ? drawerWidth : 72}px` },
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: theme.palette.text.primary,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 2, sm: 3 },
        gap: 2
      }}>
        {/* Título y Breadcrumbs */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              lineHeight: 1.2
            }}
          >
            {pageTitle}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {generateBreadcrumbs()}
          </Box>
        </Box>

        {/* Indicador de estado */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          alignItems: 'center', 
          gap: 1,
          px: 2,
          py: 0.5,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        }}>
          <CircleIcon sx={{ 
            fontSize: 8, 
            color: theme.palette.success.main,
            animation: 'pulse 2s infinite'
          }} />
          <Typography variant="caption" sx={{ 
            color: theme.palette.success.dark,
            fontWeight: 600,
            fontSize: '0.7rem'
          }}>
            Sistema Activo
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Búsqueda rápida */}
          <Tooltip title="Búsqueda rápida">
            <IconButton 
              sx={{ 
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Citas */}
          <Tooltip title="Citas programadas">
            <IconButton 
              onClick={() => navigate('/appointments')}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                },
                transition: 'all 0.2s ease'
              }}
            >
              <EventNoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              onClick={handleNotificationsClick}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                sx={{
                  '& .MuiBadge-badge': { 
                    backgroundColor: theme.palette.error.main,
                    fontSize: '0.6rem',
                    minWidth: 16,
                    height: 16
                  }
                }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Chat */}
          <Tooltip title="Chat en vivo">
            <IconButton 
              onClick={() => navigate('/chat')}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Badge 
                badgeContent={2} 
                color="primary" 
                sx={{
                  '& .MuiBadge-badge': { 
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.6rem',
                    minWidth: 16,
                    height: 16
                  }
                }}
              >
                <ChatIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />
          
          {/* Perfil de usuario */}
          <Button
            onClick={handleUserMenuClick}
            sx={{ 
              color: theme.palette.text.primary,
              textTransform: 'none',
              borderRadius: 3,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease'
            }}
            endIcon={
              <KeyboardArrowDownIcon 
                sx={{ 
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ 
                display: { xs: 'none', md: 'block' },
                textAlign: 'left',
                minWidth: 0
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    fontSize: '0.85rem'
                  }}
                >
                  {displayName.split(' ')[0]}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip 
                    icon={getRoleIcon(userRole)}
                    label={userRole} 
                    size="small" 
                    sx={{ 
                      height: 16,
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '& .MuiChip-icon': {
                        fontSize: '0.7rem'
                      }
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Button>
        </Box>

        {/* Menú de usuario */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleUserMenuClose}
          PaperProps={{
            elevation: 8,
            sx: {
              width: 280,
              borderRadius: 3,
              mt: 1,
              overflow: 'visible',
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 20,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderBottom: 'none',
                borderRight: 'none',
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header del menú */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userData?.email || 'admin@shark.com'}
            </Typography>
          </Box>

          <MenuItem sx={{ py: 1.5, px: 3 }} onClick={handleUserMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <Typography variant="body2">Mi Perfil</Typography>
          </MenuItem>
          
          <MenuItem sx={{ py: 1.5, px: 3 }} onClick={handleUserMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </ListItemIcon>
            <Typography variant="body2">Configuración</Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem 
            sx={{ py: 1.5, px: 3, color: theme.palette.error.main }}
            onClick={handleLogout}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <Typography variant="body2">Cerrar Sesión</Typography>
          </MenuItem>
        </Menu>

        {/* Menú de notificaciones */}
        <Menu
          anchorEl={notificationsAnchor}
          open={notificationsOpen}
          onClose={handleNotificationsClose}
          PaperProps={{
            elevation: 8,
            sx: {
              width: 320,
              borderRadius: 3,
              mt: 1,
              maxHeight: 400,
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header de notificaciones */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notificaciones ({unreadCount} nuevas)
            </Typography>
          </Box>

          {/* Lista de notificaciones */}
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              sx={{ 
                py: 2, 
                px: 3,
                borderLeft: notification.unread ? `3px solid ${theme.palette.primary.main}` : 'none',
                backgroundColor: notification.unread ? alpha(theme.palette.primary.main, 0.04) : 'transparent'
              }}
              onClick={handleNotificationsClose}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: notification.unread ? 600 : 400, mb: 0.5 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  hace {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />
          
          <MenuItem sx={{ py: 1.5, px: 3, justifyContent: 'center' }} onClick={handleNotificationsClose}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
              Ver todas las notificaciones
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;