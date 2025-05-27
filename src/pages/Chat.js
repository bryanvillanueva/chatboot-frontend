import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Divider, 
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  useTheme,
  alpha,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Circle as CircleIcon,
  Schedule as ScheduleIcon,
  VoiceChat as VoiceChatIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { fetchConversations } from '../services/webhookService';
import Messages from '../components/Messages';
import Navbar from '../components/Navbar';
import { useLayout } from '../contexts/LayoutContext';

const Chat = ({ onSelectConversation }) => {
  const theme = useTheme();
  const { hideNavbar } = useLayout();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversationName, setSelectedConversationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchConversations();
        setConversations(data);
        setFilteredConversations(data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
        setError('No se pudieron cargar las conversaciones');
      } finally {
        setLoading(false);
      }
    };

    getConversations();
    
    // Refrescar conversaciones cada 30 segundos
    const interval = setInterval(getConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      // Buscar por nombre del cliente
      if (conv.client_name && conv.client_name.toLowerCase().includes(query)) {
        return true;
      }
      // Buscar por número de teléfono
      if (conv.phone_number && conv.phone_number.includes(query)) {
        return true;
      }
      // Buscar por contenido de último mensaje
      if (conv.last_message && conv.last_message.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleSelectConversation = (conversationId, clientName) => {
    setSelectedConversationId(conversationId);
    setSelectedConversationName(clientName || 'Sin nombre');
    if (onSelectConversation) onSelectConversation(conversationId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredConversations(conversations);
  };

  // Función para determinar qué mostrar como último mensaje según su tipo
  const getLastMessagePreview = (conversation) => {
    if (!conversation.last_message_type) {
      return conversation.last_message || 'Sin mensajes';
    }
    
    switch (conversation.last_message_type) {
      case 'audio':
        return '🎵 Mensaje de voz';
      case 'image':
        return '📷 Imagen';
      case 'document':
        return '📄 Documento';
      default:
        return conversation.last_message || 'Sin mensajes';
    }
  };

  // Función para obtener el icono del tipo de mensaje
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'audio':
        return <VoiceChatIcon sx={{ fontSize: 14, color: theme.palette.info.main }} />;
      case 'image':
        return <ImageIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />;
      case 'document':
        return <AttachFileIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />;
      default:
        return null;
    }
  };

  // Función para formatear tiempo
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Componente de esqueleto para conversaciones
  const ConversationSkeleton = () => (
    <ListItem sx={{ px: 2, py: 1.5 }}>
      <ListItemAvatar>
        <Skeleton variant="circular" width={48} height={48} />
      </ListItemAvatar>
      <ListItemText
        primary={<Skeleton variant="text" width="70%" height={20} />}
        secondary={
          <Box>
            <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={14} />
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      mt: 8
    }}>
      <Navbar 
        pageTitle={selectedConversationId ? `Chat con ${selectedConversationName}` : 'Centro de Mensajes'}
      />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: hideNavbar ? '100vh' : 'calc(100vh - 64px)',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.default,
          position: 'relative'
        }}
      >
        {/* Sidebar de Conversaciones */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', sm: 360, md: 380 },
            minWidth: { sm: 320 },
            maxWidth: { sm: 400 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 0,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            zIndex: 1
          }}
        >
          {/* Header del sidebar */}
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.primary.main, 0.02)
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WhatsAppIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Conversaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {conversations.length} conversaciones activas
                </Typography>
              </Box>
            </Box>

            {/* Barra de búsqueda */}
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 1,
                  }
                }
              }}
            />
          </Box>

          {/* Filtros rápidos */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Todos" 
                size="small" 
                variant="filled"
                color="primary"
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip 
                label="No leídos" 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip 
                label="Archivados" 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>
          
          {/* Lista de conversaciones */}
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              py: 0,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.15),
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.25),
                }
              },
            }}
          >
            {loading ? (
              // Mostrar skeletons mientras carga
              Array.from({ length: 8 }).map((_, index) => (
                <ConversationSkeleton key={index} />
              ))
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {error}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verifica tu conexión e intenta nuevamente
                </Typography>
              </Box>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversationId === conv.conversation_id;
                const hasNewMessage = conv.last_message_sender && conv.last_message_sender !== 'Sharky';
                
                return (
                  <React.Fragment key={conv.conversation_id}>
                    <ListItem
                      button
                      onClick={() => handleSelectConversation(conv.conversation_id, conv.client_name)}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor: isSelected ? 
                          alpha(theme.palette.primary.main, 0.1) : 
                          'transparent',
                        borderLeft: isSelected ? 
                          `3px solid ${theme.palette.primary.main}` : 
                          '3px solid transparent',
                        '&:hover': {
                          backgroundColor: isSelected ? 
                            alpha(theme.palette.primary.main, 0.15) : 
                            alpha(theme.palette.action.hover, 0.5),
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 56 }}>
                        <Badge
                          variant="dot"
                          color="success"
                          invisible={!hasNewMessage}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          sx={{
                            '& .MuiBadge-badge': {
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: `2px solid ${theme.palette.background.paper}`,
                            }
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 48,
                              height: 48,
                              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              color: 'white'
                            }}
                          >
                            {conv.client_name ? conv.client_name.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: hasNewMessage ? 700 : 600,
                                color: isSelected ? 
                                  theme.palette.primary.main : 
                                  theme.palette.text.primary,
                                fontSize: '0.9rem',
                                lineHeight: 1.2,
                              }}
                            >
                              {conv.client_name || 'Sin nombre'}
                            </Typography>
                            {conv.last_message_at && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {formatTime(conv.last_message_at)}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getMessageTypeIcon(conv.last_message_type)}
                            <Typography
                              variant="body2"
                              sx={{
                                color: hasNewMessage ? 
                                  theme.palette.text.primary : 
                                  theme.palette.text.secondary,
                                fontWeight: hasNewMessage ? 500 : 400,
                                fontSize: '0.8rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {getLastMessagePreview(conv)}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      {/* Indicador de mensaje no leído */}
                      {hasNewMessage && (
                        <Box sx={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}>
                          <CircleIcon sx={{ 
                            fontSize: 8, 
                            color: theme.palette.primary.main 
                          }} />
                        </Box>
                      )}
                    </ListItem>
                    
                    <Divider variant="inset" component="li" sx={{ 
                      ml: 9,
                      borderColor: alpha(theme.palette.divider, 0.05)
                    }} />
                  </React.Fragment>
                );
              })
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones disponibles'}
                </Typography>
                {searchQuery && (
                  <Typography variant="caption" color="text.secondary">
                    Intenta con otros términos de búsqueda
                  </Typography>
                )}
              </Box>
            )}
          </List>

          {/* Footer del sidebar */}
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.background.paper, 0.5)
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircleIcon sx={{ 
                fontSize: 8, 
                color: theme.palette.success.main,
                animation: 'pulse 2s infinite'
              }} />
              <Typography variant="caption" color="text.secondary">
                Conectado • Actualizando en tiempo real
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Área de Chat */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0, // Importante para evitar overflow
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {selectedConversationId ? (
            <Messages conversationId={selectedConversationId} />
          ) : (
            // Estado vacío cuando no hay conversación seleccionada
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
              }}
            >
              <Box sx={{
                p: 4,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                textAlign: 'center',
                maxWidth: 400,
              }}>
                <WhatsAppIcon sx={{ 
                  fontSize: 64, 
                  color: alpha(theme.palette.primary.main, 0.5),
                  mb: 2 
                }} />
                
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  color: theme.palette.text.primary
                }}>
                  Selecciona una conversación
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Elige una conversación de la lista para comenzar a chatear con tus clientes
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary">
                      Mensajes en tiempo real
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <CircleIcon sx={{ fontSize: 8, color: theme.palette.success.main }} />
                    <Typography variant="caption" color="text.secondary">
                      Sistema activo y monitoreando
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;