import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Email as EmailIcon,
  Add as AddIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  MarkEmailRead as MarkEmailReadIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FileCopy as FileCopyIcon,
  Preview as PreviewIcon,
  Code as CodeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const EmailMarketing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del modal de campaña
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    template: '',
    recipients: 'all',
    selectedSegments: [],
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
    content: '',
    previewText: ''
  });
  
  // Estados adicionales
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    totalSubscribers: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Datos simulados
  const campaignStatuses = [
    { value: 'draft', label: 'Borrador', color: 'default' },
    { value: 'scheduled', label: 'Programada', color: 'warning' },
    { value: 'sending', label: 'Enviando', color: 'info' },
    { value: 'sent', label: 'Enviada', color: 'success' },
    { value: 'failed', label: 'Fallida', color: 'error' }
  ];

  const recipientOptions = [
    { value: 'all', label: 'Todos los suscriptores' },
    { value: 'clients', label: 'Solo clientes' },
    { value: 'leads', label: 'Solo leads' },
    { value: 'custom', label: 'Segmento personalizado' }
  ];

  const templateCategories = [
    'Newsletter',
    'Promocional',
    'Bienvenida',
    'Transaccional',
    'Seguimiento',
    'Evento'
  ];

  const steps = [
    {
      label: 'Configuración',
      description: 'Nombre y configuración básica',
      icon: <SettingsIcon />
    },
    {
      label: 'Contenido',
      description: 'Template y mensaje',
      icon: <EditIcon />
    },
    {
      label: 'Destinatarios',
      description: 'Selección de audiencia',
      icon: <PeopleIcon />
    },
    {
      label: 'Programación',
      description: 'Fecha y hora de envío',
      icon: <ScheduleIcon />
    },
    {
      label: 'Revisión',
      description: 'Confirmar y enviar',
      icon: <CheckCircleIcon />
    }
  ];

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar clientes como base para suscriptores
      const clientsResponse = await fetch('https://chatboot-webhook-production.up.railway.app/api/clients');
      const clientsData = await clientsResponse.json();
      
      if (clientsData.success && Array.isArray(clientsData.clients)) {
        // Crear suscriptores basados en clientes
        const subs = clientsData.clients
          .filter(client => client.email)
          .map(client => ({
            ...client,
            subscribed: Math.random() > 0.2, // 80% suscrito
            segment: getRandomSegment(),
            subscribed_at: getRandomDate(60),
            opens: Math.floor(Math.random() * 20),
            clicks: Math.floor(Math.random() * 5)
          }));
        
        setSubscribers(subs);
        
        // Generar campañas simuladas
        generateCampaigns(subs);
        
        // Generar templates
        generateTemplates();
        
        // Calcular métricas
        calculateMetrics(subs);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos de email marketing',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRandomSegment = () => {
    const segments = ['VIP', 'Nuevos', 'Activos', 'Inactivos', 'Leads'];
    return segments[Math.floor(Math.random() * segments.length)];
  };

  const getRandomDate = (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  };

  const generateCampaigns = (subs) => {
    const campaignNames = [
      'Newsletter Enero 2025',
      'Promoción Black Friday',
      'Bienvenida Nuevos Clientes',
      'Seguimiento Post-Compra',
      'Evento Especial'
    ];

    const camps = campaignNames.map((name, index) => ({
      id: index + 1,
      name,
      subject: `${name} - No te lo pierdas`,
      status: campaignStatuses[Math.floor(Math.random() * campaignStatuses.length)].value,
      template: templateCategories[index % templateCategories.length],
      recipients_count: Math.floor(Math.random() * subs.length) + 10,
      sent_at: getRandomDate(30),
      open_rate: (Math.random() * 40 + 15).toFixed(1), // 15-55%
      click_rate: (Math.random() * 10 + 2).toFixed(1), // 2-12%
      created_at: getRandomDate(45),
      preview_text: 'Descubre las últimas novedades y ofertas especiales...'
    }));

    setCampaigns(camps);
  };

  const generateTemplates = () => {
    const temps = templateCategories.map((category, index) => ({
      id: index + 1,
      name: `Template ${category}`,
      category,
      preview_url: `/templates/preview-${index + 1}.jpg`,
      created_at: getRandomDate(90),
      usage_count: Math.floor(Math.random() * 15) + 1,
      description: `Plantilla profesional para campañas de ${category.toLowerCase()}`
    }));

    setTemplates(temps);
  };

  const calculateMetrics = (subs) => {
    setMetrics({
      totalCampaigns: 5,
      totalSubscribers: subs.filter(s => s.subscribed).length,
      avgOpenRate: 28.5,
      avgClickRate: 4.2
    });
  };

  // Navegación del stepper
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Manejo del formulario de campaña
  const handleOpenCampaignDialog = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        subject: campaign.subject,
        template: campaign.template,
        recipients: 'all',
        selectedSegments: [],
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
        content: '',
        previewText: campaign.preview_text || ''
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        name: '',
        subject: '',
        template: '',
        recipients: 'all',
        selectedSegments: [],
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
        content: '',
        previewText: ''
      });
    }
    setActiveStep(0);
    setCampaignDialog(true);
  };

  const handleCloseCampaignDialog = () => {
    setCampaignDialog(false);
    setEditingCampaign(null);
    setActiveStep(0);
  };

  const handleCampaignFormChange = (field, value) => {
    setCampaignForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCampaign = () => {
    // Simular guardado de campaña
    const newCampaign = {
      id: campaigns.length + 1,
      ...campaignForm,
      status: campaignForm.scheduleType === 'immediate' ? 'sending' : 'scheduled',
      recipients_count: Math.floor(Math.random() * subscribers.length) + 10,
      created_at: new Date().toISOString(),
      open_rate: '0.0',
      click_rate: '0.0'
    };

    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => 
        c.id === editingCampaign.id ? { ...c, ...campaignForm } : c
      ));
      setSnackbar({
        open: true,
        message: 'Campaña actualizada correctamente',
        severity: 'success'
      });
    } else {
      setCampaigns(prev => [newCampaign, ...prev]);
      setSnackbar({
        open: true,
        message: campaignForm.scheduleType === 'immediate' 
          ? 'Campaña enviada correctamente' 
          : 'Campaña programada correctamente',
        severity: 'success'
      });
    }

    handleCloseCampaignDialog();
  };

  // Validación por pasos
  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return campaignForm.name && campaignForm.subject;
      case 1:
        return campaignForm.template;
      case 2:
        return campaignForm.recipients;
      case 3:
        return campaignForm.scheduleType === 'immediate' || 
               (campaignForm.scheduledDate && campaignForm.scheduledTime);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    return campaignStatuses.find(s => s.value === status) || campaignStatuses[0];
  };

  // Componente de métricas
  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette[color]?.main || color}15 0%, ${theme.palette[color]?.light || color}08 100%)`,
        border: `1px solid ${alpha(theme.palette[color]?.main || color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette[color]?.main || color, 0.25)}`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mt: 0.5,
              mb: 0.5
            }}>
              {typeof value === 'string' ? value : value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette[color]?.main || color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon sx={{ 
              fontSize: 24, 
              color: theme.palette[color]?.main || color
            }} />
          </Box>
        </Box>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend.direction === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
            )}
            <Typography variant="caption" sx={{ 
              color: trend.direction === 'up' ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 600
            }}>
              {trend.value}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Renderizado del contenido por tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Campañas
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Campañas de Email
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCampaignDialog()}
                sx={{ borderRadius: 2 }}
              >
                Nueva Campaña
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Campaña</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Destinatarios</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Apertura</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Clicks</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const statusConfig = getStatusConfig(campaign.status);
                    
                    return (
                      <TableRow key={campaign.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {campaign.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {campaign.subject}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {campaign.recipients_count.toLocaleString()}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {campaign.open_rate}%
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                            {campaign.click_rate}%
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(campaign.sent_at)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Ver estadísticas">
                              <IconButton size="small" sx={{ color: theme.palette.info.main }}>
                                <BarChartIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenCampaignDialog(campaign)}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Duplicar">
                              <IconButton size="small" sx={{ color: theme.palette.secondary.main }}>
                                <FileCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 1: // Templates
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Plantillas de Email
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Nueva Plantilla
              </Button>
            </Box>

            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      height: 200, 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <PaletteIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.5 }} />
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Usado {template.usage_count} veces
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Vista previa">
                            <IconButton size="small" sx={{ color: theme.palette.info.main }}>
                              <PreviewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2: // Suscriptores
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Lista de Suscriptores
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Suscriptor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Segmento</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Aperturas</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Clicks</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Suscrito</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.slice(0, 10).map((subscriber) => (
                    <TableRow key={subscriber.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            backgroundColor: theme.palette.primary.main,
                            fontSize: '0.8rem'
                          }}>
                            {subscriber.name?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {subscriber.name || 'Sin nombre'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {subscriber.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={subscriber.subscribed ? 'Activo' : 'Inactivo'}
                          color={subscriber.subscribed ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={subscriber.segment}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {subscriber.opens}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {subscriber.clicks}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(subscriber.subscribed_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      default:
        return null;
    }
  };

  // Renderizado del contenido del stepper
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
                  label="Nombre de la Campaña"
                  value={campaignForm.name}
                  onChange={(e) => handleCampaignFormChange('name', e.target.value)}
                  error={!campaignForm.name && activeStep > 0}
                  helperText={!campaignForm.name && activeStep > 0 ? "Este campo es requerido" : "Ej: Newsletter Enero 2025"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Asunto del Email"
                  value={campaignForm.subject}
                  onChange={(e) => handleCampaignFormChange('subject', e.target.value)}
                  error={!campaignForm.subject && activeStep > 0}
                  helperText={!campaignForm.subject && activeStep > 0 ? "Este campo es requerido" : "Lo que verán en su bandeja de entrada"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Texto de Vista Previa"
                  value={campaignForm.previewText}
                  onChange={(e) => handleCampaignFormChange('previewText', e.target.value)}
                  helperText="Texto que aparece después del asunto en algunos clientes de email"
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
                <FormControl fullWidth required>
                  <InputLabel>Plantilla</InputLabel>
                  <Select
                    value={campaignForm.template}
                    label="Plantilla"
                    onChange={(e) => handleCampaignFormChange('template', e.target.value)}
                  >
                    {templateCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Contenido del Email"
                  value={campaignForm.content}
                  onChange={(e) => handleCampaignFormChange('content', e.target.value)}
                  placeholder="Escribe aquí el contenido de tu email..."
                  helperText="Puedes usar HTML para dar formato al contenido"
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
                <FormControl fullWidth>
                  <InputLabel>Destinatarios</InputLabel>
                  <Select
                    value={campaignForm.recipients}
                    label="Destinatarios"
                    onChange={(e) => handleCampaignFormChange('recipients', e.target.value)}
                  >
                    {recipientOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Se enviará a {subscribers.filter(s => s.subscribed).length} suscriptores activos.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Fade>
        );

      case 3:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Envío</InputLabel>
                  <Select
                    value={campaignForm.scheduleType}
                    label="Tipo de Envío"
                    onChange={(e) => handleCampaignFormChange('scheduleType', e.target.value)}
                  >
                    <MenuItem value="immediate">Enviar Inmediatamente</MenuItem>
                    <MenuItem value="scheduled">Programar Envío</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {campaignForm.scheduleType === 'scheduled' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Envío"
                      value={campaignForm.scheduledDate}
                      onChange={(e) => handleCampaignFormChange('scheduledDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Hora de Envío"
                      value={campaignForm.scheduledTime}
                      onChange={(e) => handleCampaignFormChange('scheduledTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Fade>
        );

      case 4:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    ¡Campaña lista para enviar!
                  </Typography>
                  <Typography variant="body2">
                    Revisa todos los detalles antes de confirmar el envío.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Detalles de la Campaña
                  </Typography>
                  <Typography variant="body2"><strong>Nombre:</strong> {campaignForm.name}</Typography>
                  <Typography variant="body2"><strong>Asunto:</strong> {campaignForm.subject}</Typography>
                  <Typography variant="body2"><strong>Plantilla:</strong> {campaignForm.template}</Typography>
                  <Typography variant="body2"><strong>Destinatarios:</strong> {subscribers.filter(s => s.subscribed).length} suscriptores</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Programación
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {campaignForm.scheduleType === 'immediate' ? 'Inmediato' : 'Programado'}
                  </Typography>
                  {campaignForm.scheduleType === 'scheduled' && (
                    <Typography variant="body2">
                      <strong>Fecha:</strong> {campaignForm.scheduledDate} a las {campaignForm.scheduledTime}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar pageTitle="Email Marketing" />
        <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Navbar pageTitle="Email Marketing" />
      
      {/* Header */}
      <Box sx={{ mb: 4, mt: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Email Marketing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión completa de campañas de email marketing y automatizaciones
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCampaignDialog()}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: '0 4px 12px rgba(0, 52, 145, 0.3)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(0, 52, 145, 0.4)',
              }
            }}
          >
            Nueva Campaña
          </Button>
        </Box>
      </Box>

      {/* Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Campañas"
            value={metrics.totalCampaigns}
            subtitle="Campañas creadas"
            icon={CampaignIcon}
            color="primary"
            trend={{ direction: 'up', value: '+25%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Suscriptores"
            value={metrics.totalSubscribers}
            subtitle="Activos"
            icon={PeopleIcon}
            color="info"
            trend={{ direction: 'up', value: '+12%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tasa de Apertura"
            value={`${metrics.avgOpenRate}%`}
            subtitle="Promedio"
            icon={MarkEmailReadIcon}
            color="success"
            trend={{ direction: 'up', value: '+3.2%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tasa de Clicks"
            value={`${metrics.avgClickRate}%`}
            subtitle="Promedio"
            icon={BarChartIcon}
            color="warning"
            trend={{ direction: 'down', value: '-0.8%' }}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0, 52, 145, 0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<CampaignIcon />} 
              label="Campañas" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<PaletteIcon />} 
              label="Plantillas" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Suscriptores" 
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {renderTabContent()}
        </CardContent>
      </Card>

      {/* Modal de Campaña con Stepper */}
      <Dialog open={campaignDialog} onClose={handleCloseCampaignDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            {editingCampaign ? 'Editar Campaña' : 'Nueva Campaña de Email'}
          </Box>
          <IconButton onClick={handleCloseCampaignDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                p: 3, 
                backgroundColor: alpha(theme.palette.background.default, 0.3),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                minHeight: 200
              }}
            >
              {renderStepContent(activeStep)}
            </Paper>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
            sx={{ borderRadius: 2 }}
          >
            Anterior
          </Button>
          
          <Box sx={{ flex: 1 }} />
          
          <Button onClick={handleCloseCampaignDialog} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSaveCampaign}
              variant="contained" 
              disabled={!isStepValid(activeStep)}
              startIcon={<SendIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              }}
            >
              {campaignForm.scheduleType === 'immediate' ? 'Enviar Campaña' : 'Programar Envío'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              variant="contained" 
              disabled={!isStepValid(activeStep)}
              endIcon={<NavigateNextIcon />}
              sx={{ borderRadius: 2 }}
            >
              Siguiente
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailMarketing;