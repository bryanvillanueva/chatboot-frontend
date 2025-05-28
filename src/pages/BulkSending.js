import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Switch,
  Divider,
  useTheme,
  alpha,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Campaign as CampaignIcon,
  Message as MessageIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const API_BASE = 'https://chatboot-webhook-production.up.railway.app';
const EXCEL_TEMPLATE_URL = 'https://sharkagency.co/img/Contacts-template.xlsx';

const getRandomStatus = () => {
  const statuses = ['Enviado', 'Pendiente', 'Error'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const BulkSending = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados del stepper
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados de datos
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  
  // Estados del formulario
  const [campaignData, setCampaignData] = useState({
    campaignName: '',
    campaignType: '',
    message: '',
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
    useTemplate: false,
    templateName: ''
  });
  
  // Estados de listas y archivos
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uploadError, setUploadError] = useState('');
  
  // Estados de UI
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const fileInputRef = useRef();

  const steps = [
    {
      label: 'Configurar Campaña',
      description: 'Mensaje y configuración',
      icon: <CampaignIcon />
    },
    {
      label: 'Seleccionar Destinatarios',
      description: 'Clientes y listas',
      icon: <PeopleIcon />
    },
    {
      label: 'Revisar y Enviar',
      description: 'Confirmar campaña',
      icon: <CheckCircleIcon />
    }
  ];

  const campaignTypes = [
    { value: 'promotional', label: 'Promocional', description: 'Ofertas y promociones' },
    { value: 'informational', label: 'Informativo', description: 'Noticias y actualizaciones' },
    { value: 'transactional', label: 'Transaccional', description: 'Confirmaciones y recibos' },
    { value: 'reminder', label: 'Recordatorio', description: 'Citas y eventos' },
    { value: 'survey', label: 'Encuesta', description: 'Feedback y opiniones' }
  ];

  // Cargar clientes al montar
  useEffect(() => {
    setLoadingClients(true);
    fetch(`${API_BASE}/api/clients`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar los clientes');
        }
        return res.json();
      })
      .then(data => {
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setSelectedClients([]);
        setSelectAll(false);
      })
      .catch((error) => {
        console.error('Error fetching clients:', error);
        setSnackbar({ 
          open: true, 
          message: 'Error al cargar la lista de clientes. Por favor, intente nuevamente.', 
          severity: 'error' 
        });
      })
      .finally(() => {
        setLoadingClients(false);
      });
  }, []);

  // Funciones de navegación del stepper
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCampaignData({
      campaignName: '',
      campaignType: '',
      message: '',
      scheduleType: 'immediate',
      scheduledDate: '',
      scheduledTime: '',
      useTemplate: false,
      templateName: ''
    });
    setSelectedClients([]);
    setResults([]);
  };

  // Validación por pasos
  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return campaignData.campaignName && campaignData.campaignType && campaignData.message;
      case 1:
        return selectedClients.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  // Manejo de cambios en el formulario
  const handleCampaignChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Selección de clientes
  const handleSelectClient = (id) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
      setSelectAll(false);
    } else {
      setSelectedClients(clients.map(c => c.id));
      setSelectAll(true);
    }
  };

  // Importar archivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setUploadError('');
    setContacts([]);
    setColumns([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/clients/upload-excel`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir el archivo');
      const data = await res.json();
      setContacts(data.contacts || []);
      setColumns(data.columns || []);
      setSnackbar({ open: true, message: 'Contactos importados correctamente', severity: 'success' });
    } catch (err) {
      setUploadError('No se pudo importar el archivo. Verifica el formato.');
      setSnackbar({ open: true, message: 'Error al importar contactos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Descargar plantilla
  const handleDownloadTemplate = () => {
    window.open(EXCEL_TEMPLATE_URL, '_blank');
  };

  // Enviar campaña
  const handleSendCampaign = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/bulk-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: campaignData.message, 
          clients: selectedClients,
          campaignData 
        })
      });
      if (!res.ok) throw new Error('No se pudo enviar los mensajes');
      const data = await res.json();
      setResults(
        (clients.filter(c => selectedClients.includes(c.id))).map((c, i) => ({ 
          ...c, 
          status: data.statuses?.[i] || getRandomStatus() 
        }))
      );
      setSnackbar({ open: true, message: 'Campaña enviada exitosamente', severity: 'success' });
      setActiveStep(3); // Ir a los resultados
    } catch (err) {
      setResults(
        (clients.filter(c => selectedClients.includes(c.id))).map((c) => ({ 
          ...c, 
          status: getRandomStatus() 
        }))
      );
      setSnackbar({ open: true, message: 'Error en el envío, mostrando resultados simulados', severity: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar y ordenar clientes
  const getFilteredAndSortedClients = () => {
    let filtered = clients;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = clients.filter(client => 
        client.name?.toLowerCase().includes(searchLower) ||
        client.phone_number?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  };

  // Preview del mensaje
  const getMessagePreview = () => {
    let msg = campaignData.message;
    if (selectedClients.length > 0) {
      const sampleClient = clients.find(c => c.id === selectedClients[0]);
      if (sampleClient) {
        msg = msg.replace(/{{name}}/g, sampleClient.name || '');
        msg = msg.replace(/{{phone_number}}/g, sampleClient.phone_number || '');
        msg = msg.replace(/{{email}}/g, sampleClient.email || '');
      }
    }
    return msg;
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
                    Configura tu campaña de WhatsApp con todos los detalles necesarios
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre de la Campaña"
                  value={campaignData.campaignName}
                  onChange={(e) => handleCampaignChange('campaignName', e.target.value)}
                  error={!campaignData.campaignName && activeStep > 0}
                  helperText={!campaignData.campaignName && activeStep > 0 ? "Este campo es requerido" : "Ej: Promoción Black Friday"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CampaignIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!campaignData.campaignType && activeStep > 0}>
                  <InputLabel>Tipo de Campaña</InputLabel>
                  <Select
                    value={campaignData.campaignType}
                    label="Tipo de Campaña"
                    onChange={(e) => handleCampaignChange('campaignType', e.target.value)}
                  >
                    {campaignTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {type.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Mensaje de la Campaña"
                  value={campaignData.message}
                  onChange={(e) => handleCampaignChange('message', e.target.value)}
                  error={!campaignData.message && activeStep > 0}
                  helperText={!campaignData.message && activeStep > 0 ? "Este campo es requerido" : "Usa {{name}}, {{phone_number}}, {{email}} para personalizar"}
                  placeholder="Hola {{name}}, te tenemos una oferta especial..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <MessageIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Programación</InputLabel>
                  <Select
                    value={campaignData.scheduleType}
                    label="Programación"
                    onChange={(e) => handleCampaignChange('scheduleType', e.target.value)}
                  >
                    <MenuItem value="immediate">Enviar Inmediatamente</MenuItem>
                    <MenuItem value="scheduled">Programar Envío</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {campaignData.scheduleType === 'scheduled' && (
                <>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha"
                      value={campaignData.scheduledDate}
                      onChange={(e) => handleCampaignChange('scheduledDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Hora"
                      value={campaignData.scheduledTime}
                      onChange={(e) => handleCampaignChange('scheduledTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={campaignData.useTemplate}
                      onChange={(e) => handleCampaignChange('useTemplate', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Usar plantilla predefinida"
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
                    Selecciona los destinatarios para tu campaña de WhatsApp
                  </Typography>
                </Alert>
              </Grid>

              {/* Búsqueda y filtros */}
              <Grid item xs={12}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ minWidth: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant={selectAll ? "contained" : "outlined"}
                    onClick={handleSelectAll}
                    disabled={loadingClients || clients.length === 0}
                    sx={{ minWidth: 200 }}
                  >
                    {selectAll ? "Deseleccionar Todos" : "Seleccionar Todos"}
                  </Button>
                  <Chip 
                    label={`${selectedClients.length} seleccionados`}
                    color="primary"
                    variant="filled"
                  />
                </Stack>
              </Grid>

              {/* Lista de clientes */}
              <Grid item xs={12}>
                {loadingClients ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : clients.length === 0 ? (
                  <Alert severity="info">
                    No hay clientes disponibles. Importa contactos o agrega nuevos clientes.
                  </Alert>
                ) : (
                  <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectAll}
                              onChange={handleSelectAll}
                              inputProps={{ 'aria-label': 'Seleccionar todos' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            Nombre
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            Número
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            Email
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredAndSortedClients().map((client) => (
                          <TableRow key={client.id} selected={selectedClients.includes(client.id)}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedClients.includes(client.id)}
                                onChange={() => handleSelectClient(client.id)}
                                inputProps={{ 'aria-label': `Seleccionar cliente ${client.name}` }}
                              />
                            </TableCell>
                            <TableCell>{client.name}</TableCell>
                            <TableCell>{client.phone_number}</TableCell>
                            <TableCell>{client.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    ¡Todo listo para enviar tu campaña!
                  </Typography>
                  <Typography variant="body2">
                    Revisa todos los detalles antes de confirmar el envío.
                  </Typography>
                </Alert>
              </Grid>

              {/* Resumen de la campaña */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                    Detalles de la Campaña
                  </Typography>
                  <Box sx={{ space: 'y-1' }}>
                    <Typography variant="body2"><strong>Nombre:</strong> {campaignData.campaignName}</Typography>
                    <Typography variant="body2"><strong>Tipo:</strong> {campaignTypes.find(t => t.value === campaignData.campaignType)?.label}</Typography>
                    <Typography variant="body2"><strong>Programación:</strong> {campaignData.scheduleType === 'immediate' ? 'Inmediato' : `${campaignData.scheduledDate} ${campaignData.scheduledTime}`}</Typography>
                    <Typography variant="body2"><strong>Destinatarios:</strong> {selectedClients.length} contactos</Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Preview del mensaje */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.secondary.main }}>
                    Vista Previa del Mensaje
                  </Typography>
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #25D366',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace'
                    }}>
                      {getMessagePreview()}
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Importante:</strong> Una vez enviada, la campaña no se puede cancelar. 
                    Asegúrate de que todos los datos sean correctos.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 8, mb: 6, p: { xs: 1, md: 3 } }}>
      <Navbar />
      
      {/* Header */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ color: '#003491', fontWeight: 700 }}>
                Envío masivo de WhatsApp
              </Typography>
              <Typography variant="body2" sx={{ color: '#2B91FF', mb: 1 }}>
                Importa tus contactos, crea listas y envía mensajes personalizados.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Descarga una plantilla para importar tus contactos" arrow>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  sx={{ borderRadius: 1, fontWeight: 600 }}
                >
                  Descargar plantilla Excel
                </Button>
              </Tooltip>
              <Tooltip title="Sube un archivo .csv o .xlsx con tus contactos" arrow>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadFileIcon />}
                  component="label"
                  sx={{ borderRadius: 1, fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Subir archivo de contactos'}
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    hidden
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
        </CardContent>
      </Card>

      {/* Stepper Form */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
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

          <Divider sx={{ mb: 4 }} />

          {/* Contenido del paso actual (para desktop) */}
          {!isMobile && (
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
                onClick={handleSendCampaign}
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
                {loading ? 'Enviando Campaña...' : 'Enviar Campaña'}
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

      {/* Resultados del Envío */}
      {results.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600 }}>
                Resultados del Envío
              </Typography>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Nueva Campaña
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Número</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((contact, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{contact.name || '-'}</TableCell>
                      <TableCell>{contact.phone_number || '-'}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={contact.status}
                          color={
                            contact.status === 'Enviado'
                              ? 'success'
                              : contact.status === 'Pendiente'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            fontFamily: 'Poppins',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
          action={
            <IconButton size="small" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
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

export default BulkSending;