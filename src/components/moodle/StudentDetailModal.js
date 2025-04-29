import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Componente TabPanel para las pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StudentDetailModal = ({ open, onClose, studentId, moodleUserId, refreshData }) => {
  const [student, setStudent] = useState(null);
  const [moodleUser, setMoodleUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [syncWithMoodle, setSyncWithMoodle] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Opciones para formularios
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

  // Cargar datos del estudiante cuando se abre el modal
  useEffect(() => {
    if (open && studentId) {
      loadStudentData();
    }
  }, [open, studentId, moodleUserId]);

  const loadStudentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos del estudiante desde nuestra base de datos
      const studentResponse = await axios.get(`https://chatboot-webhook-production.up.railway.app/students/${studentId}`);
      setStudent(studentResponse.data);
      
      // Si hay un moodleUserId, cargar también los datos de Moodle
      if (moodleUserId) {
        try {
          // Este endpoint debería ser implementado para obtener detalles de un usuario específico de Moodle
          const moodleResponse = await axios.get(`https://chatboot-webhook-production.up.railway.app/api/moodle/users/${moodleUserId}`);
          setMoodleUser(moodleResponse.data);
        } catch (moodleError) {
          console.error('Error al cargar datos de Moodle:', moodleError);
          // No establecemos error general, solo logger, porque los datos principales se cargaron
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del estudiante:', error);
      setError('No se pudieron cargar los datos del estudiante. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Actualizar estudiante en nuestra base de datos
      await axios.put(`https://chatboot-webhook-production.up.railway.app/students/${studentId}`, student);
      
      // Si está marcada la sincronización con Moodle y existe un moodleUserId
      if (syncWithMoodle && moodleUserId) {
        try {
          // Endpoint para actualizar en Moodle - solo enviamos datos relevantes
          await axios.put(`https://chatboot-webhook-production.up.railway.app/api/moodle/students/${studentId}/update`, {
            moodleUserId,
            firstname: student.first_name,
            lastname: student.last_name,
            email: student.email
          });
          
          setSuccessMessage('Estudiante actualizado correctamente en la base de datos y en Moodle.');
        } catch (moodleError) {
          console.error('Error al actualizar en Moodle:', moodleError);
          setSuccessMessage('Estudiante actualizado en la base de datos, pero ocurrió un error al sincronizar con Moodle.');
          setError('Error al sincronizar con Moodle: ' + (moodleError.response?.data?.error || moodleError.message));
        }
      } else {
        setSuccessMessage('Estudiante actualizado correctamente en la base de datos.');
      }
      
      // Actualizar la vista
      if (refreshData) refreshData();
      setEditMode(false);
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      setError('Error al actualizar los datos: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Eliminar estudiante de la base de datos
      await axios.delete(`https://chatboot-webhook-production.up.railway.app/students/${studentId}`);
      
      // Si existe en Moodle, podemos desactivarlo allí también (opcional)
      if (moodleUserId) {
        try {
          // Este endpoint debería implementarse para suspender o eliminar usuario en Moodle
          await axios.post(`https://chatboot-webhook-production.up.railway.app/api/moodle/users/${moodleUserId}/suspend`);
        } catch (moodleError) {
          console.error('Error al suspender usuario en Moodle:', moodleError);
          // Continuamos incluso si hay error en Moodle, ya que se eliminó de nuestra BD
        }
      }
      
      if (refreshData) refreshData();
      onClose(); // Cerrar el modal después de eliminar
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      setError('Error al eliminar el estudiante: ' + (error.response?.data?.error || error.message));
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={() => !saving && onClose()}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: '#003491', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          {loading ? 'Cargando información del estudiante...' : 
            editMode ? 'Editar Estudiante' : 'Detalles del Estudiante'}
        </Box>
        <IconButton 
          onClick={onClose}
          disabled={saving}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 3, pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !student ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : student ? (
          <>
            {/* Pestañas para separar información */}
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab 
                icon={<PersonIcon />} 
                label="Información Personal" 
                id="student-tab-0"
                aria-controls="student-tabpanel-0"
              />
              <Tab 
                icon={<SchoolIcon />} 
                label="Moodle" 
                id="student-tab-1"
                aria-controls="student-tabpanel-1"
                disabled={!moodleUser}
              />
            </Tabs>
            
            {/* Mensajes de éxito/error */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* Panel de información personal */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Datos personales */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Datos Personales
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="first_name"
                    value={student.first_name || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="last_name"
                    value={student.last_name || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode || saving}>
                    <InputLabel>Tipo de Identificación</InputLabel>
                    <Select
                      name="identification_type"
                      value={student.identification_type || ''}
                      onChange={handleInputChange}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': { borderColor: alpha('#003491', 0.5) }},
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#003491' }
                      }}
                    >
                      {idTypes.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Identificación"
                    name="identification_number"
                    value={student.identification_number || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode || saving}>
                    <InputLabel>Género</InputLabel>
                    <Select
                      name="gender"
                      value={student.gender || ''}
                      onChange={handleInputChange}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': { borderColor: alpha('#003491', 0.5) }},
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#003491' }
                      }}
                    >
                      {genders.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="birth_date"
                    type="date"
                    value={student.birth_date || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                
                {/* Contacto */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Divider />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Datos de Contacto
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={student.email || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                    helperText={editMode ? "Actualizar este campo también modificará el email en Moodle" : ""}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={student.phone || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                
                {/* Dirección */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Divider />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                    Dirección
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={student.address || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Ciudad"
                    name="city"
                    value={student.city || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Departamento/Estado"
                    name="department"
                    value={student.department || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="País"
                    name="country"
                    value={student.country || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    sx={{ '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: alpha('#003491', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#003491' }
                    }}}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Panel de información de Moodle */}
            <TabPanel value={tabValue} index={1}>
              {moodleUser ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Typography variant="h6">
                        Información en Moodle
                      </Typography>
                      <Chip 
                        icon={<SchoolIcon />} 
                        label="Usuario Moodle" 
                        color="primary" 
                        sx={{ bgcolor: '#003491' }}
                      />
                    </Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Esta información está sincronizada con el sistema Moodle. Algunos cambios en la información personal
                      del estudiante se reflejarán automáticamente en Moodle.
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID en Moodle"
                      value={moodleUser.id || ''}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre de usuario"
                      value={moodleUser.username || ''}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre mostrado"
                      value={moodleUser.fullname || ''}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={moodleUser.email || ''}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Primer acceso"
                      value={moodleUser.firstaccess ? new Date(moodleUser.firstaccess * 1000).toLocaleString() : 'Nunca'}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Último acceso"
                      value={moodleUser.lastaccess ? new Date(moodleUser.lastaccess * 1000).toLocaleString() : 'Nunca'}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  
                  {/* Sección de acciones específicas de Moodle */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                      Acciones de Moodle
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => window.open(`https://tu-url-moodle/user/profile.php?id=${moodleUser.id}`, '_blank')}
                      >
                        Ver perfil en Moodle
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        onClick={() => window.open(`https://tu-url-moodle/user/edit.php?id=${moodleUser.id}`, '_blank')}
                      >
                        Editar perfil en Moodle
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => {
                          // Implementar lógica para resetear contraseña
                          alert('Esta funcionalidad debe ser implementada');
                        }}
                      >
                        Resetear contraseña
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="warning">
                  No se encontró información de Moodle para este estudiante.
                </Alert>
              )}
            </TabPanel>
            
            {/* Opciones para sincronización con Moodle (cuando está en modo edición) */}
            {editMode && moodleUserId && (
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={syncWithMoodle} 
                      onChange={(e) => setSyncWithMoodle(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Sincronizar cambios con Moodle"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Los cambios en nombre, apellido y correo electrónico se actualizarán también en Moodle.
                </Typography>
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {student && !loading && (
          <>
            {editMode ? (
              <>
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    loadStudentData(); // Recargar datos originales
                    setConfirmDelete(false);
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="contained" 
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ bgcolor: '#003491' }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </>
            ) : (
              <>
                {confirmDelete ? (
                  <>
                    <Button 
                      onClick={() => setConfirmDelete(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleDelete}
                      variant="contained" 
                      color="error"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <DeleteIcon />}
                    >
                      {saving ? 'Eliminando...' : 'Confirmar Eliminación'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={onClose}
                      disabled={saving}
                    >
                      Cerrar
                    </Button>
                    <Button 
                      onClick={() => setConfirmDelete(true)}
                      variant="outlined" 
                      color="error"
                      disabled={saving}
                      startIcon={<DeleteIcon />}
                    >
                      Eliminar
                    </Button>
                    <Button 
                      onClick={() => setEditMode(true)}
                      variant="contained" 
                      color="primary"
                      disabled={saving}
                      startIcon={<EditIcon />}
                      sx={{ bgcolor: '#003491' }}
                    >
                      Editar
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailModal;