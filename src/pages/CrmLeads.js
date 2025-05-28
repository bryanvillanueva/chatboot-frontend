import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  LinearProgress,
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
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  LocalOffer as LocalOfferIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CallEnd as CallEndIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

const CrmLeads = () => {
  const theme = useTheme();
  
  // Estados principales
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Estados del modal
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    status: 'lead',
    source: '',
    priority: 'medium',
    notes: ''
  });
  
  // Estados de métricas y actividades (simuladas)
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    hotLeads: 0,
    conversions: 0,
    appointmentsToday: 0
  });
  const [activities, setActivities] = useState([]);
  
  // Estado de snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Configuración de estados y colores
  const clientStatuses = [
    { value: 'lead', label: 'Lead', color: 'info' },
    { value: 'contacted', label: 'Contactado', color: 'warning' },
    { value: 'qualified', label: 'Calificado', color: 'primary' },
    { value: 'proposal', label: 'Propuesta', color: 'secondary' },
    { value: 'negotiation', label: 'Negociación', color: 'warning' },
    { value: 'closed_won', label: 'Cerrado - Ganado', color: 'success' },
    { value: 'closed_lost', label: 'Cerrado - Perdido', color: 'error' }
  ];

  const leadSources = [
    'WhatsApp',
    'Página Web',
    'Redes Sociales',
    'Referido',
    'Email Marketing',
    'Llamada Fría',
    'Evento',
    'Otro'
  ];

  const priorities = [
    { value: 'low', label: 'Baja', color: 'default' },
    { value: 'medium', label: 'Media', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'error' }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar clientes cuando cambia el término de búsqueda o estado
  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar clientes
      const clientsResponse = await fetch('https://chatboot-webhook-production.up.railway.app/api/clients');
      const clientsData = await clientsResponse.json();
      
      if (clientsData.success && Array.isArray(clientsData.clients)) {
        // Simular datos adicionales para CRM
        const enrichedClients = clientsData.clients.map(client => ({
          ...client,
          status: getRandomStatus(),
          source: getRandomSource(),
          priority: getRandomPriority(),
          last_contact: getRandomDate(),
          notes: '',
          created_at: getRandomDate(30)
        }));
        
        setClients(enrichedClients);
        
        // Calcular métricas
        calculateMetrics(enrichedClients);
        
        // Generar actividades simuladas
        generateActivities(enrichedClients);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del CRM',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares para simular datos
  const getRandomStatus = () => {
    const statuses = ['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getRandomSource = () => {
    return leadSources[Math.floor(Math.random() * leadSources.length)];
  };

  const getRandomPriority = () => {
    const priorities = ['low', 'medium', 'high'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  };

  const getRandomDate = (daysAgo = 7) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  };

  const calculateMetrics = (clientsData) => {
    const totalLeads = clientsData.length;
    const hotLeads = clientsData.filter(c => c.priority === 'high').length;
    const conversions = clientsData.filter(c => c.status === 'closed_won').length;
    const appointmentsToday = Math.floor(Math.random() * 5) + 1; // Simulado
    
    setMetrics({
      totalLeads,
      hotLeads,
      conversions,
      appointmentsToday
    });
  };

  const generateActivities = (clientsData) => {
    const activityTypes = [
      { type: 'call', icon: PhoneIcon, color: 'primary' },
      { type: 'email', icon: EmailIcon, color: 'info' },
      { type: 'whatsapp', icon: WhatsAppIcon, color: 'success' },
      { type: 'meeting', icon: EventIcon, color: 'warning' }
    ];

    const activities = clientsData.slice(0, 10).map((client, index) => {
      const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      return {
        id: index + 1,
        client: client.name,
        type: activity.type,
        icon: activity.icon,
        color: activity.color,
        description: getActivityDescription(activity.type, client.name),
        timestamp: getRandomDate(1),
        status: Math.random() > 0.5 ? 'completed' : 'pending'
      };
    });

    setActivities(activities);
  };

  const getActivityDescription = (type, clientName) => {
    const descriptions = {
      call: `Llamada realizada con ${clientName}`,
      email: `Email enviado a ${clientName}`,
      whatsapp: `Mensaje de WhatsApp enviado a ${clientName}`,
      meeting: `Reunión agendada con ${clientName}`
    };
    return descriptions[type];
  };

  const filterClients = () => {
    let filtered = clients;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone_number?.includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client => client.status === selectedStatus);
    }

    setFilteredClients(filtered);
  };

  // Manejo del formulario
  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        name: client.name || '',
        phone_number: client.phone_number || '',
        email: client.email || '',
        status: client.status || 'lead',
        source: client.source || '',
        priority: client.priority || 'medium',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setClientForm({
        name: '',
        phone_number: '',
        email: '',
        status: 'lead',
        source: '',
        priority: 'medium',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
  };

  const handleFormChange = (field, value) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveClient = () => {
    // Aquí implementarías la lógica para guardar en el servidor
    // Por ahora solo simulamos la actualización local
    
    if (editingClient) {
      // Actualizar cliente existente
      const updatedClients = clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...clientForm }
          : client
      );
      setClients(updatedClients);
      setSnackbar({
        open: true,
        message: 'Cliente actualizado correctamente',
        severity: 'success'
      });
    } else {
      // Agregar nuevo cliente
      const newClient = {
        id: Date.now(),
        ...clientForm,
        created_at: new Date().toISOString(),
        last_contact: new Date().toISOString()
      };
      setClients(prev => [newClient, ...prev]);
      setSnackbar({
        open: true,
        message: 'Nuevo lead agregado correctamente',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteClient = (clientId) => {
    // Confirmar eliminación
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      setSnackbar({
        open: true,
        message: 'Cliente eliminado correctamente',
        severity: 'info'
      });
    }
  };

  const getStatusConfig = (status) => {
    return clientStatuses.find(s => s.value === status) || clientStatuses[0];
  };

  const getPriorityConfig = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
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
              {value.toLocaleString()}
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar pageTitle="CRM & Leads" />
        <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Navbar pageTitle="CRM & Leads" />
      
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
              CRM & Leads
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión completa de clientes potenciales y relaciones comerciales
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
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
            Nuevo Lead
          </Button>
        </Box>
      </Box>

      {/* Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Leads"
            value={metrics.totalLeads}
            subtitle="Clientes potenciales"
            icon={PeopleIcon}
            color="primary"
            trend={{ direction: 'up', value: '+12.5%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Leads Calientes"
            value={metrics.hotLeads}
            subtitle="Alta prioridad"
            icon={LocalOfferIcon}
            color="error"
            trend={{ direction: 'up', value: '+8.3%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversiones"
            value={metrics.conversions}
            subtitle="Cerrados ganados"
            icon={CheckCircleIcon}
            color="success"
            trend={{ direction: 'up', value: '+15.7%' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Citas Hoy"
            value={metrics.appointmentsToday}
            subtitle="Reuniones programadas"
            icon={ScheduleIcon}
            color="warning"
            trend={{ direction: 'down', value: '-5.2%' }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Panel Principal - Lista de Clientes */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0, 52, 145, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pipeline de Ventas
                </Typography>
                <IconButton onClick={loadData}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Filtros */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
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
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Estado"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {clientStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Tabla de Clientes */}
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fuente</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Último Contacto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClients.map((client) => {
                      const statusConfig = getStatusConfig(client.status);
                      const priorityConfig = getPriorityConfig(client.priority);
                      
                      return (
                        <TableRow key={client.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                width: 36, 
                                height: 36,
                                backgroundColor: theme.palette.primary.main,
                                fontSize: '0.9rem'
                              }}>
                                {client.name?.charAt(0)?.toUpperCase() || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {client.name || 'Sin nombre'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {client.email || client.phone_number}
                                </Typography>
                              </Box>
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
                            <Chip
                              label={priorityConfig.label}
                              color={priorityConfig.color}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {client.source || 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(client.last_contact)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Editar">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenDialog(client)}
                                  sx={{ color: theme.palette.primary.main }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Llamar">
                                <IconButton 
                                  size="small"
                                  sx={{ color: theme.palette.success.main }}
                                >
                                  <PhoneIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="WhatsApp">
                                <IconButton 
                                  size="small"
                                  sx={{ color: '#25D366' }}
                                >
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDeleteClient(client.id)}
                                  sx={{ color: theme.palette.error.main }}
                                >
                                  <DeleteIcon fontSize="small" />
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

              {filteredClients.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron clientes con los filtros aplicados
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel Lateral - Actividades Recientes */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0, 52, 145, 0.1)', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Actividades Recientes
              </Typography>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {activities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        backgroundColor: alpha(theme.palette[activity.color].main, 0.1),
                        color: theme.palette[activity.color].main,
                        width: 36,
                        height: 36
                      }}>
                        <activity.icon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.description}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(activity.timestamp)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={activity.status === 'completed' ? 'Completado' : 'Pendiente'}
                        size="small"
                        color={activity.status === 'completed' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Pipeline Progress */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0, 52, 145, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Estado del Pipeline
              </Typography>
              
              {clientStatuses.slice(0, 5).map((status) => {
                const count = clients.filter(c => c.status === status.value).length;
                const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
                
                return (
                  <Box key={status.value} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {status.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} ({Math.round(percentage)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette[status.color].main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: theme.palette[status.color].main
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para agregar/editar cliente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            {editingClient ? 'Editar Cliente' : 'Nuevo Lead'}
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={clientForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={clientForm.phone_number}
                onChange={(e) => handleFormChange('phone_number', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={clientForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={clientForm.status}
                  label="Estado"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  {clientStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fuente</InputLabel>
                <Select
                  value={clientForm.source}
                  label="Fuente"
                  onChange={(e) => handleFormChange('source', e.target.value)}
                >
                  {leadSources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={clientForm.priority}
                  label="Prioridad"
                  onChange={(e) => handleFormChange('priority', e.target.value)}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={3}
                value={clientForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Agregar notas sobre el cliente..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveClient}
            variant="contained" 
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            {editingClient ? 'Actualizar' : 'Crear Lead'}
          </Button>
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

export default CrmLeads;