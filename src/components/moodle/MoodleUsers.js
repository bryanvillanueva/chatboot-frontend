import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableContainer,
  TableHead, 
  TableRow, 
  Paper, 
  Avatar, 
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  TablePagination,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../Navbar';

const MoodleUsers = ({ pageTitle = "Usuarios de Moodle" }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://chatboot-webhook-production.up.railway.app/api/moodle/users');
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } else {
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar los usuarios. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.fullname && user.fullname.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
    setPage(0); // Volver a la primera página al filtrar
  }, [searchTerm, users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  // Formatear fechas de manera más elegante
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp * 1000);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return 'Fecha no válida';

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Formatear según la antigüedad
    if (diffDays < 1) {
      return 'Hoy, ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
      return 'Ayer, ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString([], {day: '2-digit', month: '2-digit', year: 'numeric'}) + 
             ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  return (
    <>
      <Navbar pageTitle={pageTitle} />
      
      <Box sx={{ p: 2 }}>
        {/* Encabezado y controles */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3, 
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
            Usuarios de Moodle
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar usuario..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '8px',
                  bgcolor: 'white'
                }
              }}
              sx={{ width: 250 }}
            />
            
            <Tooltip title="Actualizar lista">
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading}
                color="primary"
                sx={{ 
                  bgcolor: alpha('#003491', 0.08),
                  '&:hover': {
                    bgcolor: alpha('#003491', 0.15),
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Estado de carga y errores */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} sx={{ color: '#003491' }} />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Tabla de usuarios */}
        {!loading && !error && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mostrando {filteredUsers.length} usuarios de Moodle
            </Typography>
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                mb: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <Table sx={{ minWidth: 1200 }} size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Idioma</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Primer Acceso</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Último Acceso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(user => (
                    <TableRow 
                      key={user.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(0, 52, 145, 0.04)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            alt={user.fullname} 
                            src={user.profileimageurlsmall}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              border: '1px solid rgba(0,0,0,0.08)'
                            }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {user.fullname || 'Sin nombre'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{user.username}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.lang || 'es'} 
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: 'rgba(0, 52, 145, 0.08)',
                            color: '#003491'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            icon={user.confirmed ? 
                              <CheckCircleIcon fontSize="small" /> : 
                              <CancelIcon fontSize="small" />
                            }
                            label={user.confirmed ? 'Confirmado' : 'Sin confirmar'}
                            size="small"
                            color={user.confirmed ? 'success' : 'default'}
                            variant={user.confirmed ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.75rem' }}
                          />
                          
                          {user.suspended && (
                            <Chip 
                              label="Suspendido"
                              size="small"
                              color="error"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {formatDate(user.firstaccess)}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {formatDate(user.lastaccess)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{
                borderTop: '1px solid rgba(0,0,0,0.08)',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  margin: 0,
                },
              }}
            />
          </>
        )}
      </Box>
    </>
  );
};

export default MoodleUsers;