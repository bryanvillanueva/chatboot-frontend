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
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Fade,
  Grow
} from '@mui/material';
import {
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon,
  ContentCopy as ContentCopyIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
} from '@mui/icons-material';
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
  const [activeStep, setActiveStep] = useState(0);
  
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

  const steps = [
    {
      label: 'Información Personal',
      description: 'Datos básicos del estudiante',
      icon: <PersonAddIcon />
    },
    {
      label: 'Contacto',
      description: 'Email y teléfono',
      icon: <EmailIcon />
    },
    {
      label: 'Dirección',
      description: 'Ubicación del estudiante',
      icon: <LocationOnIcon />
    },
    {
      label: 'Confirmación',
      description: 'Revisar y crear',
      icon: <CheckCircleIcon />
    }
  ];

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
        setCredentials({
          username: response.data.moodleResponse?.username || form.email.split('@')[0],
          password: response.data.password,
          studentId: studentId
        });
        
        setCredentialsDialog(true);
        
        setSnackbar({ 
          open: true, 
          message: '¡Estudiante registrado exitosamente en el sistema y Moodle!', 
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
          setActiveStep(0);
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

  // Validación por pasos
  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return form.first_name && form.last_name && form.identification_type && form.identification_number;
      case 1:
        return form.email && form.email.includes('@');
      case 2:
        return form.city && form.country;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  required 
                  label={getFieldLabel('first_name')} 
                  name="first_name"
                  value={form.first_name} 
                  onChange={handleChange} 
                  variant="outlined"
                  error={!form.first_name && activeStep > 0}
                  helperText={!form.first_name && activeStep > 0 ? "Este campo es requerido" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAddIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  required 
                  label={getFieldLabel('last_name')} 
                  name="last_name"
                  value={form.last_name} 
                  onChange={handleChange} 
                  variant="outlined"
                  error={!form.last_name && activeStep > 0}
                  helperText={!form.last_name && activeStep > 0 ? "Este campo es requerido" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!form.identification_type && activeStep > 0}>
                  <InputLabel>{getFieldLabel('identification_type')}</InputLabel>
                  <Select 
                    name="identification_type" 
                    value={form.identification_type} 
                    onChange={handleChange}
                    label={getFieldLabel('identification_type')}
                  >
                    {idTypes.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  required 
                  label={getFieldLabel('identification_number')}
                  name="identification_number" 
                  value={form.identification_number} 
                  onChange={handleChange}
                  error={!form.identification_number && activeStep > 0}
                  helperText={!form.identification_number && activeStep > 0 ? "Este campo es requerido" : ""}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{getFieldLabel('gender')}</InputLabel>
                  <Select 
                    name="gender" 
                    value={form.gender} 
                    onChange={handleChange}
                    label={getFieldLabel('gender')}
                  >
                    {genders.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label={getFieldLabel('birth_date')} 
                  name="birth_date" 
                  type="date"
                  value={form.birth_date} 
                  onChange={handleChange} 
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    El correo electrónico será utilizado como nombre de usuario en Moodle
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  required 
                  label={getFieldLabel('email')} 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange}
                  error={!form.email && activeStep > 1}
                  helperText={!form.email && activeStep > 1 ? "Este campo es requerido" : "Se usará como usuario en Moodle"}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label={getFieldLabel('phone')} 
                  name="phone"
                  value={form.phone} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label={getFieldLabel('address')} 
                  name="address"
                  value={form.address} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  required
                  label={getFieldLabel('city')} 
                  name="city"
                  value={form.city} 
                  onChange={handleChange}
                  error={!form.city && activeStep > 2}
                  helperText={!form.city && activeStep > 2 ? "Este campo es requerido" : ""}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  label={getFieldLabel('department')} 
                  name="department"
                  value={form.department} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  required
                  label={getFieldLabel('country')} 
                  name="country"
                  value={form.country} 
                  onChange={handleChange}
                  error={!form.country && activeStep > 2}
                  helperText={!form.country && activeStep > 2 ? "Este campo es requerido" : ""}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ) 
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 3:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Revisa la información antes de continuar
                </Typography>
                <Typography variant="body2">
                  Se creará una cuenta en Moodle automáticamente con las credenciales temporales.
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                      Información Personal
                    </Typography>
                    <Typography variant="body2"><strong>Nombre:</strong> {form.first_name} {form.last_name}</Typography>
                    <Typography variant="body2"><strong>Identificación:</strong> {form.identification_type} {form.identification_number}</Typography>
                    {form.gender && <Typography variant="body2"><strong>Género:</strong> {genders.find(g => g.value === form.gender)?.label}</Typography>}
                    {form.birth_date && <Typography variant="body2"><strong>Fecha de nacimiento:</strong> {form.birth_date}</Typography>}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.secondary.main }}>
                      Contacto y Ubicación
                    </Typography>
                    <Typography variant="body2"><strong>Email:</strong> {form.email}</Typography>
                    {form.phone && <Typography variant="body2"><strong>Teléfono:</strong> {form.phone}</Typography>}
                    <Typography variant="body2"><strong>Ciudad:</strong> {form.city}</Typography>
                    <Typography variant="body2"><strong>País:</strong> {form.country}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar pageTitle={pageTitle} />
      <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Card 
          elevation={0}
          sx={{ 
            maxWidth: 1000, 
            mx: 'auto',
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardHeader
            avatar={
              <Box sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            }
            title={
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Registro de Estudiante
              </Typography>
            }
            subheader={
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Complete el formulario para registrar un nuevo estudiante en el sistema y Moodle
              </Typography>
            }
            sx={{ pb: 2 }}
          />

          <CardContent sx={{ pt: 0 }}>
            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={({ active, completed }) => (
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: completed ? theme.palette.success.main : 
                                         active ? theme.palette.primary.main : 
                                         alpha(theme.palette.text.secondary, 0.2),
                          color: completed || active ? 'white' : theme.palette.text.secondary,
                          transition: 'all 0.3s ease'
                        }}>
                          {completed ? <CheckCircleIcon fontSize="small" /> : step.icon}
                        </Box>
                      )}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Box sx={{ pt: 2 }}>
                          {renderStepContent(index)}
                        </Box>
                      </StepContent>
                    )}
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Contenido del paso actual (para desktop) */}
            {!isMobile && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                {renderStepContent(activeStep)}
              </Paper>
            )}

            {/* Botones de navegación */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                startIcon={<NavigateBeforeIcon />}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 3
                }}
              >
                Anterior
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Paso {activeStep + 1} de {steps.length}
                </Typography>
              </Box>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid(activeStep)}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  {loading ? 'Registrando...' : 'Registrar Estudiante'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  endIcon={<NavigateNextIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Diálogo para mostrar las credenciales de Moodle */}
        <Dialog 
          open={credentialsDialog} 
          onClose={() => setCredentialsDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <SchoolIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ¡Registro Exitoso!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Credenciales de acceso a Moodle
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              El estudiante ha sido registrado correctamente en la base de datos y en Moodle.
            </Alert>
            
            <Paper elevation={0} sx={{ 
              p: 3, 
              backgroundColor: alpha(theme.palette.background.default, 0.7),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                Credenciales de Acceso
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Usuario
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {credentials.username}
                      </Typography>
                    </Box>
                    <Tooltip title="Copiar usuario">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(credentials.username)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                  }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Contraseña
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {credentials.password}
                      </Typography>
                    </Box>
                    <Tooltip title="Copiar contraseña">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(credentials.password)}
                        sx={{ 
                          color: theme.palette.secondary.main,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Estas son credenciales temporales. El estudiante deberá cambiar su contraseña al ingresar al sistema por primera vez.
              </Typography>
            </Alert>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setCredentialsDialog(false)} 
              variant="contained"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5
              }}
            >
              Continuar
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
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
            action={
              <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Students;