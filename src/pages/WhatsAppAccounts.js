import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Tooltip,
  Grid,
  CircularProgress,
  Stack,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const STATUS_ICONS = {
  'Verificado': <CheckCircleIcon sx={{ color: '#2B91FF', mr: 1 }} />,
  'Pendiente': <WarningAmberIcon sx={{ color: '#FFC107', mr: 1 }} />,
  'Error': <CancelIcon sx={{ color: '#F44336', mr: 1 }} />,
};

const STATUS_COLORS = {
  'Verificado': '#2B91FF',
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

const WhatsAppAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://chatboot-webhook-production.up.railway.app/api/whatsapp-accounts');
        if (!res.ok) throw new Error('No se pudo obtener las cuentas');
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

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
      <Navbar />
      <Alert severity="info" sx={{ mb: 3, background: '#e3f0ff', color: '#003491', fontWeight: 500, borderRadius: 2, boxShadow: '0 2px 12px #00349122' }}>
        Este módulo muestra las cuentas conectadas mediante la API oficial de WhatsApp Business. Aún estás en modo demo.
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#003491', fontWeight: 700, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WhatsAppIcon sx={{ color: '#25D366', fontSize: 32, mb: '-4px' }} />
          Cuentas de WhatsApp conectadas
        </Typography>
        <Tooltip title="Funcionalidad próximamente disponible tras aprobación de Meta">
          <span>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              disabled
              sx={{
                background: '#f5f5f5',
                color: '#888',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                borderRadius: 2,
                boxShadow: 'none',
                textTransform: 'none',
                borderColor: '#e0e0e0',
                '&:hover': { background: '#f5f5f5', color: '#888', borderColor: '#e0e0e0' },
              }}
            >
              Agregar nueva cuenta
            </Button>
          </span>
        </Tooltip>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : accounts.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 4 }}>
          No hay cuentas de WhatsApp conectadas actualmente.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {/* Card para agregar nueva cuenta (deshabilitado) */}
          <Grid item xs={12} sm={6} md={4} key="add-account">
            <Tooltip title="Funcionalidad próximamente disponible tras aprobación de Meta">
              <span>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: '0 6px 24px #00349122',
                  border: '2px dashed #e0e0e0',
                  background: '#fafbfc',
                  minHeight: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'box-shadow 0.2s',
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  '&:hover': {
                    boxShadow: '0 12px 32px #25D36622',
                  },
                }}>
                  <IconButton disabled sx={{
                    background: '#fff',
                    color: '#bdbdbd',
                    border: '2px solid #e0e0e0',
                    mb: 2,
                    width: 64,
                    height: 64,
                    fontSize: 40,
                    boxShadow: '0 2px 8px #00349111',
                  }}>
                    <AddIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ color: '#888', fontWeight: 600, fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
                    Agregar nueva cuenta
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#bdbdbd', textAlign: 'center', mt: 1 }}>
                    Próximamente disponible tras aprobación de Meta
                  </Typography>
                </Card>
              </span>
            </Tooltip>
          </Grid>
          {accounts.map(account => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card sx={{
                borderRadius: 4,
                boxShadow: '0 6px 24px #00349122',
                border: `1.5px solid ${STATUS_COLORS[account.status] || '#e0e0e0'}`,
                background: 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)',
                position: 'relative',
                overflow: 'visible',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.03)',
                  boxShadow: '0 12px 32px #25D36633',
                },
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: -28,
                  right: 24,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px #25D36633',
                  p: 1,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <WhatsAppIcon sx={{ color: '#25D366', fontSize: 38 }} />
                </Box>
                <CardContent sx={{ pt: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {STATUS_ICONS[account.status] || <CancelIcon sx={{ color: '#BDBDBD', mr: 1 }} />}
                    <Typography variant="h6" sx={{ color: '#003491', fontWeight: 700, fontFamily: 'Poppins, sans-serif', letterSpacing: 0.5 }}>
                      {account.number}
                    </Typography>
                    <Tooltip title="Funcionalidad próximamente disponible tras aprobación de Meta">
                      <span>
                        <IconButton size="small" disabled sx={{ color: '#bdbdbd', ml: 0.5 }}>
                          <AddIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Chip
                      label={account.status}
                      size="small"
                      sx={{
                        background: STATUS_COLORS[account.status] || '#BDBDBD',
                        color: '#fff',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                        ml: 1
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#003491', mb: 1, opacity: 0.8 }}>
                    Fecha de conexión: <b>{formatDate(account.created_at)}</b>
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip
                      label={account.meta_api ? 'Meta API' : 'Sin Meta API'}
                      size="small"
                      sx={{
                        background: account.meta_api ? '#2BFF91' : '#BDBDBD',
                        color: account.meta_api ? '#003491' : '#757575',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    />
                    {account.connected && (
                      <Chip
                        label="Conectado"
                        size="small"
                        sx={{ background: '#2B91FF', color: '#fff', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
                      />
                    )}
                  </Stack>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      borderColor: '#2B91FF',
                      color: '#2B91FF',
                      textTransform: 'none',
                      boxShadow: '0 2px 8px #2B91FF22',
                      mr: 1,
                      '&:hover': { background: '#2B91FF11', borderColor: '#003491', color: '#003491' },
                    }}
                    onClick={() => navigate('/chat', { state: { number: account.number } })}
                  >
                    Abrir chat
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      borderColor: '#25D366',
                      color: '#25D366',
                      textTransform: 'none',
                      boxShadow: '0 2px 8px #25D36622',
                      '&:hover': { background: '#25D36611', borderColor: '#25D366', color: '#25D366' },
                    }}
                    onClick={async () => {
                      await navigator.clipboard.writeText(account.wa_link);
                      setCopiedId(account.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                  >
                    {copiedId === account.id ? '¡Copiado!' : 'Copiar enlace'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default WhatsAppAccounts; 