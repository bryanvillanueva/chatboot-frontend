import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Divider, 
  Collapse,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
  AppBar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  DateRange as DateRangeIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Add as AddIcon,
  WhatsApp as WhatsAppIcon,
  AccountTree as AccountTreeIcon,
  Send as SendIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Smartphone as SmartphoneIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  FiberManualRecord as DotIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutProvider } from '../contexts/LayoutContext';

const drawerWidth = 320;

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [hideNavbar, setHideNavbar] = useState(false);
  
  // Estados para submenús
  const [moodleOpen, setMoodleOpen] = useState(
    location.pathname.includes('/components/moodle')
  );
  const [studentsOpen, setStudentsOpen] = useState(
    location.pathname.includes('/components/students')
  );
  const [whatsappOpen, setWhatsappOpen] = useState(
    location.pathname.includes('/whatsapp') || 
    location.pathname.includes('/flow-builder') || 
    location.pathname.includes('/bulk-sending') || 
    location.pathname.includes('/crm-leads') || 
    location.pathname.includes('/email-marketing')
  );

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
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerExpand = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  const handleNavbarToggle = () => {
    setHideNavbar(!hideNavbar);
  };

  const handleMoodleClick = () => {
    setMoodleOpen(!moodleOpen);
  };

  const handleStudentsClick = () => {
    setStudentsOpen(!studentsOpen);
  };

  const handleWhatsAppClick = () => {
    setWhatsappOpen(!whatsappOpen);
  };

  // Función para obtener estilos de items
  const getListItemStyle = (isSelected) => ({
    margin: isDrawerExpanded ? '6px 16px' : '6px 8px',
    borderRadius: 12,
    minHeight: 48,
    backgroundColor: isSelected ? 
      theme.palette.primary.main : 
      'transparent',
    color: isSelected ? '#fff' : theme.palette.text.primary,
    boxShadow: isSelected ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
    '&:hover': {
      backgroundColor: isSelected ? 
        theme.palette.primary.dark : 
        alpha(theme.palette.primary.main, 0.08),
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
  });

  const getSubItemStyle = (isSelected) => ({
    pl: isDrawerExpanded ? 4 : 2,
    margin: isDrawerExpanded ? '4px 16px 4px 32px' : '4px 8px',
    borderRadius: 10,
    minHeight: 40,
    backgroundColor: isSelected ? 
      alpha(theme.palette.primary.main, 0.15) : 
      'transparent',
    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    transition: 'all 0.2s ease-in-out'
  });

  // Menú principal de navegación
  const mainMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: DashboardIcon, 
      path: '/', 
      badge: null 
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: ChatIcon, 
      path: '/chat', 
      badge: 3 
    },
    { 
      id: 'appointments', 
      label: 'Citas', 
      icon: DateRangeIcon, 
      path: '/appointments', 
      badge: null 
    },
  ];

  // WhatsApp Business submenu
  const whatsappMenuItems = [
    { 
      id: 'whatsapp-accounts', 
      label: 'Cuentas', 
      icon: SmartphoneIcon, 
      path: '/whatsapp-accounts' 
    },
    { 
      id: 'flow-builder', 
      label: 'Flujos', 
      icon: AccountTreeIcon, 
      path: '/flow-builder' 
    },
    { 
      id: 'bulk-sending', 
      label: 'Envíos Masivos', 
      icon: SendIcon, 
      path: '/bulk-sending' 
    },
    { 
      id: 'crm-leads', 
      label: 'CRM & Leads', 
      icon: PeopleIcon, 
      path: '/crm-leads' 
    },
    { 
      id: 'email-marketing', 
      label: 'Email Marketing', 
      icon: EmailIcon, 
      path: '/email-marketing' 
    },
  ];

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
    }}>
      {/* Header del Drawer */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isDrawerExpanded ? 'space-between' : 'center',
        p: 2,
        minHeight: 64,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        {isDrawerExpanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}>
              <WhatsAppIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                fontSize: '1.25rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                SHARK
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Business Suite
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={hideNavbar ? "Mostrar Navbar" : "Ocultar Navbar"}>
            <IconButton 
              onClick={handleNavbarToggle}
              size="small"
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }
              }}
            >
              {hideNavbar ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isDrawerExpanded ? "Contraer menú" : "Expandir menú"}>
            <IconButton 
              onClick={handleDrawerExpand}
              size="small"
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }
              }}
            >
              {isDrawerExpanded ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
        <List sx={{ px: 1 }}>
          {/* Main Menu Items */}
          {mainMenuItems.map((item) => (
            <Box key={item.id} sx={{ textDecoration: 'none' }} component={Link} to={item.path}>
              <ListItem 
                button 
                disableRipple
                sx={getListItemStyle(location.pathname === item.path)}
              >
                <ListItemIcon sx={{ 
                  minWidth: isDrawerExpanded ? 40 : 'auto',
                  mr: isDrawerExpanded ? 0 : 0,
                  justifyContent: 'center'
                }}>
                  <Badge 
                    badgeContent={item.badge} 
                    color="error" 
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: theme.palette.error.main,
                        fontSize: '0.7rem',
                        minWidth: 16,
                        height: 16,
                      }
                    }}
                  >
                    <item.icon sx={{ 
                      color: location.pathname === item.path ? '#fff' : theme.palette.primary.main,
                      transition: 'all 0.2s ease-in-out',
                      fontSize: 22
                    }} />
                  </Badge>
                </ListItemIcon>
                {isDrawerExpanded && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname === item.path ? '#fff' : theme.palette.text.primary,
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                )}
              </ListItem>
            </Box>
          ))}

          {/* WhatsApp Business Section */}
          <Box sx={{ mt: 2 }}>
            {isDrawerExpanded && (
              <Typography variant="overline" sx={{ 
                px: 2, 
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em'
              }}>
                WhatsApp Business
              </Typography>
            )}
            
            <ListItem 
              button 
              onClick={handleWhatsAppClick}
              disableRipple
              sx={{
                ...getListItemStyle(location.pathname.includes('/whatsapp') || 
                  location.pathname.includes('/flow-builder') || 
                  location.pathname.includes('/bulk-sending') || 
                  location.pathname.includes('/crm-leads') || 
                  location.pathname.includes('/email-marketing')),
                mt: 1
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: isDrawerExpanded ? 40 : 'auto',
                justifyContent: 'center'
              }}>
                <WhatsAppIcon sx={{ 
                  color: (location.pathname.includes('/whatsapp') || 
                    location.pathname.includes('/flow-builder') || 
                    location.pathname.includes('/bulk-sending') || 
                    location.pathname.includes('/crm-leads') || 
                    location.pathname.includes('/email-marketing')) 
                    ? '#fff' : theme.palette.success.main,
                  transition: 'all 0.2s ease-in-out',
                  fontSize: 22
                }} />
              </ListItemIcon>
              {isDrawerExpanded && (
                <>
                  <ListItemText 
                    primary="Marketing Suite" 
                    primaryTypographyProps={{
                      sx: { 
                        color: (location.pathname.includes('/whatsapp') || 
                          location.pathname.includes('/flow-builder') || 
                          location.pathname.includes('/bulk-sending') || 
                          location.pathname.includes('/crm-leads') || 
                          location.pathname.includes('/email-marketing')) 
                          ? '#fff' : theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                  {whatsappOpen ? 
                    <ExpandLess sx={{ 
                      color: (location.pathname.includes('/whatsapp') || 
                        location.pathname.includes('/flow-builder') || 
                        location.pathname.includes('/bulk-sending') || 
                        location.pathname.includes('/crm-leads') || 
                        location.pathname.includes('/email-marketing')) 
                        ? '#fff' : theme.palette.text.secondary,
                    }} /> : 
                    <ExpandMore sx={{ 
                      color: (location.pathname.includes('/whatsapp') || 
                        location.pathname.includes('/flow-builder') || 
                        location.pathname.includes('/bulk-sending') || 
                        location.pathname.includes('/crm-leads') || 
                        location.pathname.includes('/email-marketing')) 
                        ? '#fff' : theme.palette.text.secondary,
                    }} />
                  }
                </>
              )}
            </ListItem>
            
            {/* WhatsApp Submenu */}
            {isDrawerExpanded && (
              <Collapse in={whatsappOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {whatsappMenuItems.map((subItem) => (
                    <Box key={subItem.id} sx={{ textDecoration: 'none' }} component={Link} to={subItem.path}>
                      <ListItem 
                        button 
                        disableRipple
                        sx={getSubItemStyle(location.pathname === subItem.path)}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <subItem.icon sx={{ 
                            color: location.pathname === subItem.path ? 
                              theme.palette.primary.main : theme.palette.text.secondary,
                            fontSize: 18,
                            transition: 'all 0.2s ease-in-out'
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.label} 
                          primaryTypographyProps={{
                            sx: { 
                              color: location.pathname === subItem.path ? 
                                theme.palette.primary.main : theme.palette.text.secondary,
                              fontSize: '0.85rem',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>

          {/* Moodle Section */}
          {/* 
          <Box sx={{ mt: 2 }}>
            {isDrawerExpanded && (
              <Typography variant="overline" sx={{ 
                px: 2, 
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em'
              }}>
                Educación
              </Typography>
            )}
            
            <ListItem 
              button 
              onClick={handleMoodleClick}
              disableRipple
              sx={{
                ...getListItemStyle(location.pathname.includes('/components/moodle')),
                mt: 1
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: isDrawerExpanded ? 40 : 'auto',
                justifyContent: 'center'
              }}>
                <SchoolIcon sx={{ 
                  color: location.pathname.includes('/components/moodle') 
                    ? '#fff' : theme.palette.warning.main,
                  transition: 'all 0.2s ease-in-out',
                  fontSize: 22
                }} />
              </ListItemIcon>
              {isDrawerExpanded && (
                <>
                  <ListItemText 
                    primary="Moodle" 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname.includes('/components/moodle') 
                          ? '#fff' : theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                  {moodleOpen ? 
                    <ExpandLess sx={{ 
                      color: location.pathname.includes('/components/moodle') 
                        ? '#fff' : theme.palette.text.secondary,
                    }} /> : 
                    <ExpandMore sx={{ 
                      color: location.pathname.includes('/components/moodle') 
                        ? '#fff' : theme.palette.text.secondary,
                    }} />
                  }
                </>
              )}
            </ListItem>
            
            {isDrawerExpanded && (
              <Collapse in={moodleOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <Box sx={{ textDecoration: 'none' }} component={Link} to="/components/moodle">
                    <ListItem 
                      button 
                      disableRipple
                      sx={getSubItemStyle(location.pathname === '/components/moodle')}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <SearchIcon sx={{ 
                          color: location.pathname === '/components/moodle' ? 
                            theme.palette.primary.main : theme.palette.text.secondary,
                          fontSize: 18,
                          transition: 'all 0.2s ease-in-out'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Consultar" 
                        primaryTypographyProps={{
                          sx: { 
                            color: location.pathname === '/components/moodle' ? 
                              theme.palette.primary.main : theme.palette.text.secondary,
                            fontSize: '0.85rem',
                            fontWeight: location.pathname === '/components/moodle' ? 600 : 400,
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      />
                    </ListItem>
                  </Box>
                </List>
              </Collapse>
            )}
          </Box>
          */}

          {/* Students Section */}
          <ListItem 
            button 
            onClick={handleStudentsClick}
            disableRipple
            sx={{
              ...getListItemStyle(location.pathname.includes('/components/students')),
              mt: 1
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: isDrawerExpanded ? 40 : 'auto',
              justifyContent: 'center'
            }}>
              <PersonIcon sx={{ 
                color: location.pathname.includes('/components/students') 
                  ? '#fff' : theme.palette.info.main,
                transition: 'all 0.2s ease-in-out',
                fontSize: 22
              }} />
            </ListItemIcon>
            {isDrawerExpanded && (
              <>
                <ListItemText 
                  primary="Estudiantes" 
                  primaryTypographyProps={{
                    sx: { 
                      color: location.pathname.includes('/components/students') 
                        ? '#fff' : theme.palette.text.primary,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                />
                {studentsOpen ? 
                  <ExpandLess sx={{ 
                    color: location.pathname.includes('/components/students') 
                      ? '#fff' : theme.palette.text.secondary,
                  }} /> : 
                  <ExpandMore sx={{ 
                    color: location.pathname.includes('/components/students') 
                      ? '#fff' : theme.palette.text.secondary,
                  }} />
                }
              </>
            )}
          </ListItem>
          
          {/* Students Submenu */}
          {isDrawerExpanded && (
            <Collapse in={studentsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Box sx={{ textDecoration: 'none' }} component={Link} to="/components/students">
                  <ListItem 
                    button 
                    disableRipple
                    sx={getSubItemStyle(location.pathname === '/components/students')}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <AddIcon sx={{ 
                        color: location.pathname === '/components/students' ? 
                          theme.palette.primary.main : theme.palette.text.secondary,
                        fontSize: 18,
                        transition: 'all 0.2s ease-in-out'
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Registrar" 
                      primaryTypographyProps={{
                        sx: { 
                          color: location.pathname === '/components/students' ? 
                            theme.palette.primary.main : theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          fontWeight: location.pathname === '/components/students' ? 600 : 400,
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    />
                  </ListItem>
                </Box>
              </List>
            </Collapse>
          )}
        </List>
      </Box>

      {/* Footer del Drawer */}
      {isDrawerExpanded && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ 
                width: 36, 
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                {userData?.firstname?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.success.main,
                border: '2px solid white',
              }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '0.85rem',
                lineHeight: 1.2
              }}>
                {userData?.firstname || 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.7rem'
              }}>
                En línea
              </Typography>
            </Box>
            <IconButton size="small" sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': { 
                backgroundColor: alpha(theme.palette.primary.main, 0.1) 
              }
            }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <LayoutProvider value={{ drawerWidth, isDrawerExpanded, hideNavbar }}>
      {/* El truco está aquí: */}
      <Box sx={{ 
        display: 'flex', 
        width: '100vw',   // Para que Drawer + Main ocupen el 100%
        minHeight: '100vh',
        overflow: 'hidden', // Quita cualquier desborde lateral
        position: 'relative'
      }}>
        <CssBaseline />
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: isDrawerExpanded ? drawerWidth : 72,
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
          [`& .MuiDrawer-paper`]: { 
            width: isDrawerExpanded ? drawerWidth : 72,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease-in-out',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflowX: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '2px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
              }
            }
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100vh',  // Esto ahora SÍ es seguro porque el AppBar es fixed y fuera de flujo normal
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Ajusta solo el overflow vertical aquí */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',      // Solo scroll vertical donde corresponde
          overflowX: 'hidden',    // Evita scroll horizontal siempre
          // ...tu código de scrollbars opcional
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  </LayoutProvider>
);

};

export default Layout;