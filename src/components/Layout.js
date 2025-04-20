import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person'; // Add this import
import AddIcon from '@mui/icons-material/Add'; // Add this import
import { Link, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 250;

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [moodleOpen, setMoodleOpen] = useState(
    location.pathname.includes('/components/moodle')
  );
  const [studentsOpen, setStudentsOpen] = useState(
    location.pathname.includes('/components/students')
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

  const handleMoodleClick = () => {
    setMoodleOpen(!moodleOpen);
  };

  const handleStudentsClick = () => {
    setStudentsOpen(!studentsOpen);
  };

  // Definimos estilos específicos para items seleccionados y no seleccionados
  const getListItemStyle = (isSelected) => ({
    margin: '8px 16px',
    borderRadius: '8px',
    backgroundColor: isSelected ? 'rgba(0, 52, 145, 0.9)' : 'transparent',
    color: isSelected ? '#fff' : '#333',
    boxShadow: isSelected ? '0 2px 4px rgba(0, 52, 145, 0.25)' : 'none',
    '&:hover': {
      backgroundColor: isSelected ? 'rgba(0, 52, 145, 0.9)' : 'rgba(0, 52, 145, 0.1)',
    },
    transition: 'all 0.2s ease-in-out'
  });

  // Estilo específico para el submenú
  const getSubItemStyle = (isSelected) => ({
    pl: 4,
    margin: '6px 16px 6px 32px',
    borderRadius: '8px',
    backgroundColor: isSelected ? 'rgba(0, 52, 145, 0.9)' : 'transparent',
    color: isSelected ? '#fff' : '#555',
    boxShadow: isSelected ? '0 2px 4px rgba(0, 52, 145, 0.25)' : 'none',
    '&:hover': {
      backgroundColor: isSelected ? 'rgba(0, 52, 145, 0.9)' : 'rgba(0, 52, 145, 0.1)',
    },
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <Box 
      sx={{ 
        display: 'flex',
        overflow: 'hidden' // Prevenir overflow en el contenedor principal
      }}
    >
      <CssBaseline />
      
      {/* Menú Lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            background: "#fff", 
            color: '#333',
            overflowX: 'hidden', // Prevenir overflow horizontal en el drawer
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRight: 'none'
          },
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: "100%", 
            py: 2
          }}
        >
          <Typography variant="h6" noWrap sx={{ fontSize: '30px', color: '#003491', fontWeight: 'bold' }}>
            SHARK
          </Typography>
        </Toolbar>
        
        <Divider sx={{ mx: 2, backgroundColor: 'rgba(0,0,0,0.08)' }} />

        <List sx={{ mt: 2 }}>
          {/* Dashboard */}
          <Box sx={{ textDecoration: 'none' }} component={Link} to="/">
            <ListItem 
              button 
              disableRipple
              sx={getListItemStyle(location.pathname === '/')}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ 
                  color: location.pathname === '/' ? '#fff' : '#003491',
                  transition: 'all 0.2s ease-in-out'
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  sx: { 
                    color: location.pathname === '/' ? '#fff' : '#333',
                    fontWeight: location.pathname === '/' ? 500 : 400,
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              />
            </ListItem>
          </Box>
          
          {/* Chat */}
          <Box sx={{ textDecoration: 'none' }} component={Link} to="/chat">
            <ListItem 
              button 
              disableRipple
              sx={getListItemStyle(location.pathname === '/chat')}
            >
              <ListItemIcon>
                <ChatIcon sx={{ 
                  color: location.pathname === '/chat' ? '#fff' : '#003491',
                  transition: 'all 0.2s ease-in-out'
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Chat" 
                primaryTypographyProps={{
                  sx: { 
                    color: location.pathname === '/chat' ? '#fff' : '#333',
                    fontWeight: location.pathname === '/chat' ? 500 : 400,
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              />
            </ListItem>
          </Box>
          
          
          {/* Moodle con submenú */}
          <ListItem 
            button 
            onClick={handleMoodleClick}
            disableRipple
            sx={{
              margin: '8px 16px',
              borderRadius: '8px',
              backgroundColor: (location.pathname.includes('/components/moodle')) 
                ? 'rgba(0, 52, 145, 0.9)' 
                : 'transparent',
              color: (location.pathname.includes('/components/moodle')) 
                ? '#fff' 
                : '#333',
              boxShadow: (location.pathname.includes('/components/moodle'))
                ? '0 2px 4px rgba(0, 52, 145, 0.25)'
                : 'none',
              '&:hover': {
                backgroundColor: (location.pathname.includes('/components/moodle')) 
                  ? 'rgba(0, 52, 145, 0.9)' 
                  : 'rgba(0, 52, 145, 0.1)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon>
              <SchoolIcon sx={{ 
                color: (location.pathname.includes('/components/moodle')) 
                  ? '#fff' 
                  : '#003491',
                transition: 'all 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <ListItemText 
              primary="Moodle" 
              primaryTypographyProps={{
                sx: { 
                  color: (location.pathname.includes('/components/moodle')) 
                    ? '#fff' 
                    : '#333',
                  fontWeight: (location.pathname.includes('/components/moodle')) 
                    ? 500 
                    : 400,
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            />
            {/* Mostrar el expandir/colapsar */}
            {moodleOpen ? 
              <ExpandLess sx={{ 
                color: (location.pathname.includes('/components/moodle')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} /> : 
              <ExpandMore sx={{ 
                color: (location.pathname.includes('/components/moodle')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} />
            }
          </ListItem>
          
          {/* Submenú de Moodle */}
          <Collapse in={moodleOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Consultar Moodle */}
              <Box sx={{ textDecoration: 'none' }} component={Link} to="/components/moodle">
                <ListItem 
                  button 
                  disableRipple
                  sx={getSubItemStyle(location.pathname === '/components/moodle')}
                >
                  <ListItemIcon>
                    <SearchIcon sx={{ 
                      color: location.pathname === '/components/moodle' ? '#fff' : '#003491',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease-in-out'
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Consultar" 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname === '/components/moodle' ? '#fff' : '#555',
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === '/components/moodle' ? 500 : 400,
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                </ListItem>
              </Box>
            </List>
          </Collapse>

          {/* Students con submenú */}
          <ListItem 
            button 
            onClick={handleStudentsClick}
            disableRipple
            sx={{
              margin: '8px 16px',
              borderRadius: '8px',
              backgroundColor: (location.pathname.includes('/components/students')) 
                ? 'rgba(0, 52, 145, 0.9)' 
                : 'transparent',
              color: (location.pathname.includes('/components/Students')) 
                ? '#fff' 
                : '#333',
              boxShadow: (location.pathname.includes('/components/Students'))
                ? '0 2px 4px rgba(0, 52, 145, 0.25)'
                : 'none',
              '&:hover': {
                backgroundColor: (location.pathname.includes('/components/students')) 
                  ? 'rgba(0, 52, 145, 0.9)' 
                  : 'rgba(0, 52, 145, 0.1)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon>
              <PersonIcon sx={{ 
                color: (location.pathname.includes('/components/students')) 
                  ? '#fff' 
                  : '#003491',
                transition: 'all 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <ListItemText 
              primary="Students" 
              primaryTypographyProps={{
                sx: { 
                  color: (location.pathname.includes('/components/students')) 
                    ? '#fff' 
                    : '#333',
                  fontWeight: (location.pathname.includes('/components/students')) 
                    ? 500 
                    : 400,
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            />
            {studentsOpen ? 
              <ExpandLess sx={{ 
                color: (location.pathname.includes('/components/students')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} /> : 
              <ExpandMore sx={{ 
                color: (location.pathname.includes('/components/students')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} />
            }
          </ListItem>
          
          {/* Submenú de Students */}
          <Collapse in={studentsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Registrar Estudiante */}
              <Box sx={{ textDecoration: 'none' }} component={Link} to="/components/students">
                <ListItem 
                  button 
                  disableRipple
                  sx={getSubItemStyle(location.pathname === '/components/students')}
                >
                  <ListItemIcon>
                    <AddIcon sx={{ 
                      color: location.pathname === '/components/students' ? '#fff' : '#003491',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease-in-out'
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Registrar" 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname === '/components/students' ? '#fff' : '#555',
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === '/components/students' ? 500 : 400,
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                </ListItem>
              </Box>
            </List>
          </Collapse>
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto', // Permitir scroll vertical, pero no horizontal
          overflowX: 'hidden',
          backgroundColor: '#fafafa'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;