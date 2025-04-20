import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme,
  alpha,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from '../components/Navbar';

const Students = ({ pageTitle = "Registro de Estudiantes" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estado del formulario
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    identification_type: '',
    identification_number: '',
    email: '',
    phone: '',
    gender: '',
    birth_date: '',
    address: '',
    city: '',
    department: '',
    country: 'Colombia'
  });
  const [loading, setLoading] = useState(false);

  // Estado de la tabla
  const [students, setStudents] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  
  // Estado para seguir qué estudiantes están en proceso de inserción en Moodle
  const [loadingMoodle, setLoadingMoodle] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carga inicial de la lista
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingTable(true);
    try {
      const { data } = await axios.get('https://chatboot-webhook-production.up.railway.app/students');
      setStudents(data);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de estudiantes',
        severity: 'error'
      });
    } finally {
      setLoadingTable(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://chatboot-webhook-production.up.railway.app/students', form);
      setSnackbar({ open: true, message: 'Estudiante registrado correctamente', severity: 'success' });
      setForm({
        first_name: '',
        last_name: '',
        identification_type: '',
        identification_number: '',
        email: '',
        phone: '',
        gender: '',
        birth_date: '',
        address: '',
        city: '',
        department: '',
        country: 'Colombia'
      });
      fetchStudents(); // refrescar tabla
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Error al registrar estudiante: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInsertMoodle = async (student) => {
    try {
      // Marcar este estudiante específico como "cargando"
      setLoadingMoodle(prev => ({ ...prev, [student.id]: true }));
      
      // Usar el endpoint correcto que ya está definido en el backend
      const response = await axios.post(`https://chatboot-webhook-production.up.railway.app/api/moodle/students/${student.id}/create`);
      
      // Si la respuesta incluye una contraseña temporal, mostrarla
      if (response.data && response.data.password) {
        setSnackbar({ 
          open: true, 
          message: `Estudiante insertado en Moodle correctamente. Usuario: ${response.data.moodleResponse?.username || student.email.split('@')[0]}. Contraseña temporal: ${response.data.password}`, 
          severity: 'success' 
        });
      } else {
        setSnackbar({
          open: true,
          message: `Estudiante insertado en Moodle correctamente: ${student.first_name} ${student.last_name}`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error al insertar en Moodle:', err);
      setSnackbar({
        open: true,
        message: `Error al insertar en Moodle: ${err.response?.data || err.message}`,
        severity: 'error'
      });
    } finally {
      // Cuando termine, quitar el estado de carga para este estudiante
      setLoadingMoodle(prev => ({ ...prev, [student.id]: false }));
    }
  };

  const handleCloseSnackbar = (e, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const getFieldLabel = key => {
    const labels = {
      first_name: 'Nombre',
      last_name: 'Apellido',
      identification_type: 'Tipo de Identificación',
      identification_number: 'Número de Identificación',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      gender: 'Género',
      birth_date: 'Fecha de Nacimiento',
      address: 'Dirección',
      city: 'Ciudad',
      department: 'Departamento/Estado',
      country: 'País'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Opciones
  const idTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' }
  ];
  const genders = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  return (
    <>
      <Navbar pageTitle={pageTitle} />
      <Box sx={{ p: 3 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          {/* --- FORMULARIO --- */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAddIcon sx={{ mr: 2, color: '#003491', fontSize: 28 }} />
            <Typography variant="h5" component="h1" sx={{
              fontWeight: 500,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                backgroundColor: '#003491',
                borderRadius: '2px'
              }
            }}>
              Registrar Estudiante
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Complete el formulario con los datos del estudiante. Todos los campos marcados con * son obligatorios.
          </Typography>
          <Divider sx={{ my: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Datos personales */}
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Datos Personales</Typography></Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label={getFieldLabel('first_name')} name="first_name"
                  value={form.first_name} onChange={handleChange} variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label={getFieldLabel('last_name')} name="last_name"
                  value={form.last_name} onChange={handleChange} variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{getFieldLabel('identification_type')}</InputLabel>
                  <Select name="identification_type" value={form.identification_type} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': { borderColor: alpha('#003491', 0.5) }},
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#003491' }
                    }}>
                    {idTypes.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label={getFieldLabel('identification_number')}
                  name="identification_number" value={form.identification_number} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{getFieldLabel('gender')}</InputLabel>
                  <Select name="gender" value={form.gender} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': { borderColor: alpha('#003491', 0.5) }},
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#003491' }
                    }}>
                    {genders.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={getFieldLabel('birth_date')} name="birth_date" type="date"
                  value={form.birth_date} onChange={handleChange} InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>

              {/* Contacto */}
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>Datos de Contacto</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label={getFieldLabel('email')} name="email" type="email"
                  value={form.email} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={getFieldLabel('phone')} name="phone"
                  value={form.phone} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>

              {/* Dirección */}
              <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>Dirección</Typography></Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={getFieldLabel('address')} name="address"
                  value={form.address} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={getFieldLabel('city')} name="city"
                  value={form.city} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={getFieldLabel('department')} name="department"
                  value={form.department} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={getFieldLabel('country')} name="country"
                  value={form.country} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                    '&.Mui-focused fieldset': { borderColor: '#003491' }
                  }}} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                    sx={{
                      backgroundColor: '#003491',
                      '&:hover': { backgroundColor: '#002970' },
                      borderRadius: '8px',
                      px: 3, py: 1
                    }}>
                    {loading ? 'Registrando...' : 'Registrar Estudiante'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* --- TABLA DE ESTUDIANTES --- */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Lista de Estudiantes</Typography>
          {loadingTable ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead sx={{ backgroundColor: alpha('#003491', 0.1) }}>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Cédula</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No hay estudiantes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map(st => (
                      <TableRow key={st.id} hover>
                        <TableCell>{st.first_name}</TableCell>
                        <TableCell>{st.last_name}</TableCell>
                        <TableCell>{st.identification_number}</TableCell>
                        <TableCell>{st.email}</TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            variant="outlined"
                            disabled={loadingMoodle[st.id]}
                            onClick={() => handleInsertMoodle(st)}
                            sx={{
                              borderColor: '#003491',
                              color: '#003491',
                              '&:hover': {
                                borderColor: '#002970',
                                backgroundColor: alpha('#003491', 0.05)
                              }
                            }}
                          >
                            {loadingMoodle[st.id] ? (
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                            ) : null}
                            {loadingMoodle[st.id] ? 'Insertando...' : 'Insertar Moodle'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Students;