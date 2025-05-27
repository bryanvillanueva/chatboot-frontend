import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  MenuItem,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  useMediaQuery,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const AppointmentForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    city: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    mode: '',
  });

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const steps = [
    {
      label: 'Información Personal',
      description: 'Datos de contacto',
      icon: <PersonIcon />
    },
    {
      label: 'Detalles del Servicio',
      description: 'Descripción y ubicación',
      icon: <DescriptionIcon />
    },
    {
      label: 'Fecha y Hora',
      description: 'Programación de la cita',
      icon: <ScheduleIcon />
    },
    {
      label: 'Confirmación',
      description: 'Revisar y enviar',
      icon: <CheckCircleIcon />
    }
  ];

  const cities = [
    'Barranquilla',
    'Bogotá',
    'Medellín',
    'Cali',
    'Cartagena',
    'Melbourne',
    'Sydney',
    'Otra ciudad'
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('https://chatboot-webhook-production.up.railway.app/appointments', formData);
      
      setSnackbar({
        open: true,
        message: '¡Cita agendada exitosamente! Te contactaremos pronto.',
        severity: 'success'
      });

      // Resetear formulario
      setFormData({
        name: '',
        phone_number: '',
        email: '',
        city: '',
        description: '',
        preferred_date: '',
        preferred_time: '',
        mode: '',
      });
      setActiveStep(0);

    } catch (error) {
      console.error('Error al enviar la cita:', error.message);
      setSnackbar({
        open: true,
        message: `Error al agendar la cita: ${error.response?.data || 'Verifica tu conexión'}`,
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

  // Validación por pasos
  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.name && formData.phone_number && formData.email && formData.email.includes('@');
      case 1:
        return formData.city && formData.description;
      case 2:
        return formData.preferred_date && formData.preferred_time && 
               ((!['Barranquilla', 'Melbourne'].includes(formData.city)) || formData.mode);
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
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Completa tus datos de contacto para que podamos coordinar la cita contigo
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!formData.name && activeStep > 0}
                  helperText={!formData.name && activeStep > 0 ? "Este campo es requerido" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Teléfono"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={!formData.phone_number && activeStep > 0}
                  helperText={!formData.phone_number && activeStep > 0 ? "Este campo es requerido" : "Incluye código de país (+57)"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!formData.email && activeStep > 0}
                  helperText={!formData.email && activeStep > 0 ? "Este campo es requerido" : "Te enviaremos la confirmación aquí"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );

      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!formData.city && activeStep > 1}
                  helperText={!formData.city && activeStep > 1 ? "Este campo es requerido" : "Selecciona tu ubicación"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" />
                        {city}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {['Barranquilla', 'Melbourne'].includes(formData.city) && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    label="Modalidad"
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    error={!formData.mode && activeStep > 1}
                    helperText={!formData.mode && activeStep > 1 ? "Este campo es requerido" : "¿Cómo prefieres la reunión?"}
                  >
                    <MenuItem value="Presencial">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" />
                        Presencial
                      </Box>
                    </MenuItem>
                    <MenuItem value="Virtual">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoCallIcon fontSize="small" />
                        Virtual
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Descripción del servicio o proyecto"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!formData.description && activeStep > 1}
                  helperText={!formData.description && activeStep > 1 ? "Este campo es requerido" : "Cuéntanos qué necesitas, esto nos ayuda a preparar mejor la reunión"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Selecciona tu fecha y hora preferida. Confirmaremos la disponibilidad contigo.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Fecha preferida"
                  name="preferred_date"
                  type="date"
                  value={formData.preferred_date}
                  onChange={handleChange}
                  error={!formData.preferred_date && activeStep > 2}
                  helperText={!formData.preferred_date && activeStep > 2 ? "Este campo es requerido" : "Elige una fecha"}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Hora preferida"
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  error={!formData.preferred_time && activeStep > 2}
                  helperText={!formData.preferred_time && activeStep > 2 ? "Este campo es requerido" : "Horario de oficina"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" />
                        {time}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {formData.mode && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {formData.mode === 'Virtual' ? <VideoCallIcon color="info" /> : <BusinessIcon color="info" />}
                      <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 600 }}>
                        Modalidad {formData.mode}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formData.mode === 'Virtual' 
                        ? 'Te enviaremos el enlace de la videollamada por email antes de la reunión.'
                        : 'La reunión será en nuestras oficinas. Te enviaremos la dirección exacta.'}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Fade>
        );

      case 3:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ¡Todo listo para agendar tu cita!
                </Typography>
                <Typography variant="body2">
                  Revisa los detalles y confirma el agendamiento.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                      Información de Contacto
                    </Typography>
                    <Box sx={{ space: 'y-1' }}>
                      <Typography variant="body2"><strong>Nombre:</strong> {formData.name}</Typography>
                      <Typography variant="body2"><strong>Teléfono:</strong> {formData.phone_number}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
                      <Typography variant="body2"><strong>Ciudad:</strong> {formData.city}</Typography>
                      {formData.mode && (
                        <Chip 
                          label={`Modalidad: ${formData.mode}`}
                          size="small"
                          color={formData.mode === 'Virtual' ? 'info' : 'secondary'}
                          icon={formData.mode === 'Virtual' ? <VideoCallIcon /> : <BusinessIcon />}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.secondary.main }}>
                      Detalles de la Cita
                    </Typography>
                    <Box sx={{ space: 'y-1' }}>
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {new Date(formData.preferred_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="body2"><strong>Hora:</strong> {formData.preferred_time}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Proyecto:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontStyle: 'italic',
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        p: 1,
                        borderRadius: 1,
                        mt: 0.5
                      }}>
                        {formData.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Próximos pasos:</strong> Te contactaremos dentro de las próximas 24 horas para confirmar 
                  la disponibilidad y coordinar los detalles finales de la reunión.
                </Typography>
              </Alert>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      mt: 8,
      maxWidth: 1200,
      mx: 'auto'
    }}>
      <Navbar />
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#003491' }}>
        Gestión de Citas
      </Typography>
      <Card 
        elevation={0}
        sx={{ 
          maxWidth: 1000, 
          mx: 'auto',
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <CardHeader
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            textAlign: 'center'
          }}
          avatar={
            <Box sx={{
              p: 2,
              borderRadius: '50%',
              backgroundColor: alpha('#fff', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EventNoteIcon sx={{ fontSize: 32 }} />
            </Box>
          }
          title={
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Agenda tu Cita
            </Typography>
          }
          subheader={
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Completa el formulario para coordinar una reunión personalizada
            </Typography>
          }
        />

        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completed ? theme.palette.success.main : 
                                       active ? theme.palette.primary.main : 
                                       alpha(theme.palette.text.secondary, 0.2),
                        color: completed || active ? 'white' : theme.palette.text.secondary,
                        transition: 'all 0.3s ease',
                        boxShadow: completed || active ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                      }}>
                        {completed ? <CheckCircleIcon /> : step.icon}
                      </Box>
                    )}
                  >
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Contenido del paso actual */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              backgroundColor: alpha(theme.palette.background.default, 0.3),
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              minHeight: 300
            }}
          >
            {renderStepContent(activeStep)}
          </Paper>

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
                px: 3,
                py: 1.5
              }}
            >
              Anterior
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Paso {activeStep + 1} de {steps.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index <= activeStep ? 
                        theme.palette.primary.main : 
                        alpha(theme.palette.text.secondary, 0.3),
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Box>
            </Box>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !isStepValid(activeStep)}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                  }
                }}
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
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
                  px: 3,
                  py: 1.5
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <ScheduleIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Respuesta Rápida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Te contactaremos dentro de las próximas 24 horas
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <VideoCallIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Modalidad Flexible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Presencial o virtual, como prefieras
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Sin Compromiso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Evaluación gratuita de tu proyecto
              </Typography>
            </Paper>
          </Grid>
        </Grid>
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
  );
};

export default AppointmentForm;