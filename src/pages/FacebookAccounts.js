import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab,
  Button, CircularProgress, Alert, Stack, Chip, Grid,
  IconButton, Tooltip
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import PagesIcon from '@mui/icons-material/Pages';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API_BASE = 'https://chatboot-webhook-production.up.railway.app';

const STATUS_ICONS = {
  'Activo': <CheckCircleIcon sx={{ color: '#2B91FF', mr: 1 }} />,
  'Pendiente': <WarningAmberIcon sx={{ color: '#FFC107', mr: 1 }} />,
  'Error': <CancelIcon sx={{ color: '#F44336', mr: 1 }} />,
};

const STATUS_COLORS = {
  'Activo': '#2B91FF',
  'Pendiente': '#FFC107',
  'Error': '#F44336',
};

const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function FacebookAccounts() {
  const [tab, setTab] = useState(0);
  const [businesses, setBusinesses] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: 'info', message: '' });
  const [copiedId, setCopiedId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Obtener facebook_id del usuario autenticado
  const getFacebookId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.id || '';
    } catch {
      return '';
    }
  };

  const facebookId = getFacebookId();

  // Función de sincronización para negocios
  const syncBusinesses = async () => {
    if (!facebookId) {
      setAlert({ open: true, severity: 'warning', message: 'No hay usuario autenticado.' });
      return;
    }
    setLoading(true);
    setIsSyncing(true);
    setAlert({ open: false, message: '', severity: 'info' });
    try {
      // POST para sincronizar negocios
      const res = await fetch(`${API_BASE}/api/facebook/businesses/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facebook_id: facebookId }),
      });
      if (!res.ok) throw new Error('Error al sincronizar negocios');
      // Tras sincronizar, consulta lo que tengas localmente
      await fetchData('businesses', false);
      setAlert({ open: true, severity: 'success', message: 'Negocios sincronizados y cargados correctamente.' });
    } catch (err) {
      setAlert({ open: true, severity: 'error', message: 'No se pudieron sincronizar los negocios.' });
      setBusinesses([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Función de sincronización para páginas
  const syncPages = async () => {
    if (!facebookId) {
      setAlert({ open: true, severity: 'warning', message: 'No hay usuario autenticado.' });
      return;
    }
    setLoading(true);
    setIsSyncing(true);
    setAlert({ open: false, message: '', severity: 'info' });
    try {
      const res = await fetch(`${API_BASE}/api/facebook/pages/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facebook_id: facebookId }),
      });
      if (!res.ok) throw new Error('Error al sincronizar páginas');
      await fetchData('pages', false);
      setAlert({ open: true, severity: 'success', message: 'Páginas sincronizadas y cargadas correctamente.' });
    } catch (err) {
      setAlert({ open: true, severity: 'error', message: 'No se pudieron sincronizar las páginas.' });
      setPages([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Fetch al cambiar tab o al cargar componente
  const fetchData = async (endpoint, showSuccessMessage = true) => {
    if (!facebookId) {
      setAlert({ open: true, severity: 'warning', message: 'No hay usuario autenticado.' });
      return;
    }
    setLoading(true);
    setAlert({ open: false, message: '', severity: 'info' });

    let url = '';
    if (endpoint === 'businesses') url = `${API_BASE}/api/facebook/businesses?facebook_id=${facebookId}`;
    if (endpoint === 'pages') url = `${API_BASE}/api/facebook/pages?facebook_id=${facebookId}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener datos');
      const data = await res.json();
      
      if (endpoint === 'businesses') {
        // Agregar propiedades simuladas para el diseño
        const enhancedBusinesses = (data.businesses || []).map(business => ({
          ...business,
          status: 'Activo', // Simular estado
          created_at: new Date().toISOString(), // Simular fecha
          connected: true,
          meta_api: true
        }));
        setBusinesses(enhancedBusinesses);
      }
      
      if (endpoint === 'pages') {
        // Agregar propiedades simuladas para el diseño
        const enhancedPages = (data.pages || []).map(page => ({
          ...page,
          status: 'Activo', // Simular estado
          created_at: new Date().toISOString(), // Simular fecha
          connected: true,
          followers: Math.floor(Math.random() * 10000) + 100 // Simular seguidores
        }));
        setPages(enhancedPages);
      }
      
      if (showSuccessMessage) {
        setAlert({ open: true, severity: 'success', message: 'Datos cargados correctamente.' });
      }
    } catch (err) {
      setAlert({ open: true, severity: 'error', message: 'No se pudieron cargar los datos.' });
      if (endpoint === 'businesses') setBusinesses([]);
      if (endpoint === 'pages') setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sincronizar al montar el componente según el tab
    if (tab === 0) {
      syncBusinesses();
    } else {
      syncPages();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleCopyId = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const currentData = tab === 0 ? businesses : pages;
  const currentType = tab === 0 ? 'businesses' : 'pages';

  return (
    <Box sx={{ 
      fontFamily: 'Poppins, sans-serif', 
      p: { xs: 1, md: 4 }, 
      background: '#f7faff', 
      minHeight: '100vh',
      mt: 8,
      maxWidth: 1200,
      mx: 'auto'
    }}>
      <Alert severity="info" sx={{ mb: 3, background: '#e3f0ff', color: '#003491', fontWeight: 500, borderRadius: 2, boxShadow: '0 2px 12px #00349122' }}>
        Este módulo muestra las cuentas de negocios y páginas de Facebook conectadas mediante la API oficial de Facebook Business.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#003491', fontWeight: 700, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FacebookIcon sx={{ color: '#1877F2', fontSize: 32, mb: '-4px' }} />
          {tab === 0 ? 'Negocios de Facebook' : 'Páginas de Facebook'}
        </Typography>
        <Tooltip title={`Agregar nuevo ${tab === 0 ? 'negocio' : 'página'}`}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              background: '#fff',
              color: '#1877F2',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              borderRadius: 2,
              borderColor: '#1877F2',
              textTransform: 'none',
              '&:hover': { background: '#1877F211', borderColor: '#1877F2' },
            }}
          >
            Agregar {tab === 0 ? 'negocio' : 'página'}
          </Button>
        </Tooltip>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px #00349111', mb: 4 }}>
        <CardContent>
          <Tabs 
            value={tab} 
            onChange={(_, t) => setTab(t)} 
            sx={{ mb: 3 }}
            TabIndicatorProps={{
              sx: { backgroundColor: '#1877F2', height: 3 }
            }}
          >
            <Tab 
              label="Negocios" 
              icon={<BusinessIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600, 
                fontFamily: 'Poppins, sans-serif',
                '&.Mui-selected': { color: '#1877F2' }
              }}
            />
            <Tab 
              label="Páginas" 
              icon={<PagesIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600, 
                fontFamily: 'Poppins, sans-serif',
                '&.Mui-selected': { color: '#1877F2' }
              }}
            />
          </Tabs>

          <Button
            variant="contained"
            onClick={() => (tab === 0 ? syncBusinesses() : syncPages())}
            disabled={loading}
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2, 
              minWidth: 180, 
              mb: 3,
              backgroundColor: '#1877F2',
              '&:hover': { backgroundColor: '#166FE5' }
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
          >
            {loading ? 
              (isSyncing ? 'Sincronizando...' : 'Cargando...') : 
              `Refrescar ${tab === 0 ? 'negocios' : 'páginas'}`
            }
          </Button>

          {alert.open && (
            <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }}>
              {alert.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="primary" size={40} />
        </Box>
      ) : currentData.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 4, borderRadius: 2 }}>
          No hay {tab === 0 ? 'negocios' : 'páginas'} de Facebook conectados actualmente.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {/* Card para agregar nuevo */}
          <Grid item xs={12} sm={6} md={4} key="add-new">
            <Card sx={{
              borderRadius: 4,
              boxShadow: '0 6px 24px #00349122',
              border: '2px dashed #1877F2',
              background: 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.03)',
                boxShadow: '0 12px 32px #1877F233',
                borderColor: '#166FE5',
              },
            }}>
              <IconButton sx={{
                background: '#fff',
                color: '#1877F2',
                border: '2px solid #1877F2',
                mb: 2,
                width: 64,
                height: 64,
                fontSize: 40,
                boxShadow: '0 4px 16px #1877F222',
                '&:hover': { 
                  background: '#1877F211',
                  transform: 'scale(1.1)'
                },
              }}>
                <AddIcon sx={{ fontSize: 40 }} />
              </IconButton>
              <Typography variant="subtitle1" sx={{ color: '#1877F2', fontWeight: 600, fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
                Agregar {tab === 0 ? 'nuevo negocio' : 'nueva página'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', textAlign: 'center', mt: 1, px: 2 }}>
                Conecta {tab === 0 ? 'un negocio' : 'una página'} de Facebook para gestionar tu presencia
              </Typography>
            </Card>
          </Grid>

          {currentData.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{
                borderRadius: 4,
                boxShadow: '0 6px 24px #00349122',
                border: `1.5px solid ${STATUS_COLORS[item.status] || '#e0e0e0'}`,
                background: 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)',
                position: 'relative',
                overflow: 'visible',
                minHeight: 280,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.03)',
                  boxShadow: '0 12px 32px #1877F233',
                },
              }}>
                {/* Icono flotante */}
                <Box sx={{
                  position: 'absolute',
                  top: -28,
                  right: 24,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 4px 16px #1877F233',
                  p: 1,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {tab === 0 ? 
                    <BusinessIcon sx={{ color: '#1877F2', fontSize: 38 }} /> :
                    <PagesIcon sx={{ color: '#1877F2', fontSize: 38 }} />
                  }
                </Box>

                <CardContent sx={{ pt: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header con nombre y estado */}
                  <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap">
                    {STATUS_ICONS[item.status] || <CancelIcon sx={{ color: '#BDBDBD', mr: 1 }} />}
                    <Typography variant="h6" sx={{ 
                      color: '#003491', 
                      fontWeight: 700, 
                      fontFamily: 'Poppins, sans-serif', 
                      letterSpacing: 0.5,
                      flex: 1,
                      wordBreak: 'break-word'
                    }}>
                      {item.name || 'Sin nombre'}
                    </Typography>
                    <Chip
                      label={item.status || 'Desconocido'}
                      size="small"
                      sx={{
                        background: STATUS_COLORS[item.status] || '#BDBDBD',
                        color: '#fff',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    />
                  </Stack>

                  {/* Información específica */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      <strong>ID:</strong> {item.id}
                    </Typography>
                    
                    {tab === 0 ? (
                      <>
                        {item.permissions && item.permissions.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                              Permisos:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {item.permissions.slice(0, 3).map(permission => (
                                <Chip
                                  key={permission}
                                  label={permission}
                                  size="small"
                                  sx={{
                                    background: '#E3F2FD',
                                    color: '#1877F2',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                  }}
                                />
                              ))}
                              {item.permissions.length > 3 && (
                                <Chip
                                  label={`+${item.permissions.length - 3}`}
                                  size="small"
                                  sx={{
                                    background: '#F5F5F5',
                                    color: '#666',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          <strong>Categoría:</strong> {item.category || 'No especificada'}
                        </Typography>
                        {item.followers && (
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            <strong>Seguidores:</strong> {item.followers.toLocaleString()}
                          </Typography>
                        )}
                      </>
                    )}

                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      <strong>Conectado:</strong> {formatDate(item.created_at)}
                    </Typography>
                  </Box>

                  {/* Status chips */}
                  <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                    <Chip
                      label={item.meta_api ? 'Meta API' : 'Sin Meta API'}
                      size="small"
                      sx={{
                        background: item.meta_api ? '#E8F5E8' : '#FFEBEE',
                        color: item.meta_api ? '#2E7D32' : '#C62828',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    />
                    {item.connected && (
                      <Chip
                        label="Conectado"
                        size="small"
                        sx={{ 
                          background: '#E3F2FD', 
                          color: '#1877F2', 
                          fontWeight: 600, 
                          fontFamily: 'Poppins, sans-serif' 
                        }}
                      />
                    )}
                  </Stack>

                  {/* Botones de acción */}
                  <Stack direction="row" spacing={1} mt="auto">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                        borderColor: '#1877F2',
                        color: '#1877F2',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        flex: 1,
                        '&:hover': { background: '#1877F211', borderColor: '#166FE5', color: '#166FE5' },
                      }}
                    >
                      Ver detalles
                    </Button>
                    <Tooltip title={copiedId === item.id ? '¡Copiado!' : 'Copiar ID'}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyId(item.id)}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid #1877F2',
                          color: '#1877F2',
                          '&:hover': { background: '#1877F211' },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}