import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  LinearProgress,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Message as MessageIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  WhatsApp as WhatsAppIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import Navbar from '../components/Navbar';
import { useLayout } from '../contexts/LayoutContext';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  ChartTooltip, 
  Legend,
  Filler
);

const CACHE_KEY = 'dashboardData';
const CACHE_EXPIRATION = 5 * 60 * 1000;

const Dashboard = ({ pageTitle }) => {
  const theme = useTheme();
  const { hideNavbar } = useLayout();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://chatboot-webhook-production.up.railway.app/api/dashboard-info');
      const data = response.data;
      setDashboardData(data);
      setLastUpdated(new Date());
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {
      console.error('Error fetching dashboard info:', error);
      // Intentar cargar desde cache si hay error
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        setDashboardData(parsedCache.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente de tarjeta de estadística moderna
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'primary', 
    trend = null, 
    trendDirection = 'up',
    loading = false 
  }) => {
    const colorMap = {
      primary: { main: theme.palette.primary.main, light: theme.palette.primary.light },
      secondary: { main: theme.palette.secondary.main, light: theme.palette.secondary.light },
      success: { main: theme.palette.success.main, light: theme.palette.success.light },
      warning: { main: theme.palette.warning.main, light: theme.palette.warning.light },
      error: { main: theme.palette.error.main, light: theme.palette.error.light },
      info: { main: theme.palette.info.main, light: theme.palette.info.light },
    };

    return (
      <Card
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${colorMap[color].main}15 0%, ${colorMap[color].light}08 100%)`,
          border: `1px solid ${alpha(colorMap[color].main, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(colorMap[color].main, 0.25)}`,
          },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colorMap[color].main}20 0%, ${colorMap[color].light}10 100%)`,
          }}
        />
        
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={80} height={40} />
              ) : (
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mt: 0.5,
                    mb: 0.5
                  }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.8rem'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(colorMap[color].main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ 
                fontSize: 24, 
                color: colorMap[color].main 
              }} />
            </Box>
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {trendDirection === 'up' ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trendDirection === 'up' ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600
                }}
              >
                {trend}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: theme.palette.text.secondary }}
              >
                vs período anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && !dashboardData) {
    return (
      <Box>
        <Navbar pageTitle={pageTitle} />
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={400} height={20} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box>
        <Navbar pageTitle={pageTitle} />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar la información del dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No se pudo conectar con el servidor. Intenta recargar la página.
          </Typography>
          <IconButton onClick={fetchDashboardData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  const { total_mensajes, mensajes_sharky, total_usuarios, mensajes_pendientes, timeline } = dashboardData;
  const mensajesEnviados = mensajes_sharky;
  const mensajesRecibidos = total_mensajes - mensajes_sharky;

  // Configuración del gráfico
  const chartData = {
    labels: timeline ? timeline.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }) : [],
    datasets: [
      {
        label: 'Mensajes Recibidos',
        data: timeline ? timeline.map(item => item.count) : [],
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fill: true,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: alpha(theme.palette.divider, 0.2),
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        border: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      <Navbar pageTitle={pageTitle || 'Dashboard'} />
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        backgroundColor: theme.palette.background.default, 
        minHeight: hideNavbar ? '100vh' : 'calc(100vh - 64px)',
        marginTop: hideNavbar ? 0 : '64px',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
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
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Resumen general de tu plataforma de marketing
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {lastUpdated && (
                <Chip
                  label={`Actualizado: ${lastUpdated.toLocaleTimeString()}`}
                  variant="outlined"
                  size="small"
                  icon={<ScheduleIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              )}
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={fetchDashboardData}
                  disabled={loading}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <RefreshIcon sx={{ 
                    color: theme.palette.primary.main,
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Mensajes Enviados"
              value={mensajesEnviados}
              subtitle="Respuestas del sistema"
              icon={SendIcon}
              color="primary"
              trend="+12.5%"
              trendDirection="up"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Mensajes Recibidos"
              value={mensajesRecibidos}
              subtitle="De clientes"
              icon={InboxIcon}
              color="info"
              trend="+8.3%"
              trendDirection="up"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Mensajes Pendientes"
              value={mensajes_pendientes}
              subtitle="Requieren atención"
              icon={MessageIcon}
              color="warning"
              trend="-5.2%"
              trendDirection="down"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Usuarios Activos"
              value={total_usuarios}
              subtitle="Conversaciones únicas"
              icon={PeopleIcon}
              color="success"
              trend="+15.7%"
              trendDirection="up"
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Chart and Activity */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Timeline Chart */}
          <Grid item xs={12} lg={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 400
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Actividad de Mensajes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mensajes recibidos por día
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: 400
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Estadísticas Rápidas
              </Typography>
              
              <Box sx={{ space: 'y-3' }}>
                {/* Ratio de respuesta */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ratio de Respuesta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {total_mensajes > 0 ? Math.round((mensajesEnviados / total_mensajes) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={total_mensajes > 0 ? (mensajesEnviados / total_mensajes) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      }
                    }}
                  />
                </Box>

                {/* Eficiencia */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Eficiencia de Atención
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {total_usuarios > 0 ? Math.round(((total_usuarios - mensajes_pendientes) / total_usuarios) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={total_usuarios > 0 ? ((total_usuarios - mensajes_pendientes) / total_usuarios) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                      }
                    }}
                  />
                </Box>

                {/* Métricas adicionales */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                    }}>
                      <WhatsAppIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        1 Cuenta Activa
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        WhatsApp Business
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1) 
                    }}>
                      <CampaignIcon sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Próximamente
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Campañas automatizadas
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;