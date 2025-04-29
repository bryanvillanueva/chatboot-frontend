import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  
  // Diálogo de credenciales de Moodle
  const [credentialsDialog, setCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    studentId: null
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCopyToClipboard = text => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copiado al portapapeles',
      severity: 'success'
    });
  };

  const registerStudentInMoodle = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.post(`https://chatboot-webhook-production.up.railway.app/api/moodle/students/${studentId}/create`);
      
      if (response.data && response.data.password) {
        // Guardar credenciales para mostrar en el diálogo
        setCredentials({
          username: response.data.moodleResponse?.username || form.email.split('@')[0],
          password: response.data.password,
          studentId: studentId
        });
        
        setCredentialsDialog(true);
        
        setSnackbar({ 
          open: true, 
          message: 'Estudiante registrado y creado en Moodle correctamente', 
          severity: 'success' 
        });
        
        return true;
      } else {
        setSnackbar({
          open: true,
          message: 'Estudiante registrado pero hubo un problema al crear usuario en Moodle',
          severity: 'warning'
        });
        return false;
      }
    } catch (error) {
      console.error('Error al insertar en Moodle:', error);
      setSnackbar({
        open: true,
        message: `Error al crear usuario en Moodle: ${error.response?.data?.error || error.message}`,
        severity: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Registrar estudiante en la base de datos
      const response = await axios.post('https://chatboot-webhook-production.up.railway.app/students', form);
      
      if (response.data && response.data.id) {
        // 2. Crear el usuario en Moodle
        const moodleSuccess = await registerStudentInMoodle(response.data.id);
        
        // Limpiar formulario solo si todo salió bien
        if (moodleSuccess) {
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
        }
      } else {
        throw new Error('No se pudo obtener el ID del estudiante registrado');
      }
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
            Complete el formulario con los datos del estudiante. El estudiante será registrado en la base de datos y
            creado automáticamente en Moodle. Todos los campos marcados con * son obligatorios.
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
                  helperText="Este email se usará como nombre de usuario en Moodle"
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
                    {loading ? 'Registrando...' : 'Registrar en Sistema y Moodle'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* Diálogo para mostrar las credenciales de Moodle */}
      <Dialog 
        open={credentialsDialog} 
        onClose={() => setCredentialsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#003491', color: 'white' }}>
          Credenciales de Moodle
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            El estudiante ha sido registrado correctamente en la base de datos y en Moodle. 
            Aquí están las credenciales de acceso a Moodle:
          </DialogContentText>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Usuario:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace', mx: 1 }}>
                      {credentials.username}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyToClipboard(credentials.username)}
                      sx={{ color: '#003491' }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Contraseña:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace', mx: 1 }}>
                      {credentials.password}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyToClipboard(credentials.password)}
                      sx={{ color: '#003491' }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 3 }}>
            Estas son credenciales temporales. El estudiante deberá cambiar su contraseña al ingresar al sistema por primera vez.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCredentialsDialog(false)} 
            color="primary" 
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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