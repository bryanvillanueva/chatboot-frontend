import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  IconButton, 
  TextField, 
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  Button,
  Modal,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  Fade,
  Grow
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Article as ArticleIcon,
  TableChart as TableChartIcon,
  Slideshow as SlideshowIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import axios from 'axios';
import CustomAudioPlayer from './customAudioPlayer';
import InfoDrawer from './InfoDrawer';

// Función para procesar el texto y convertir \n en saltos de línea reales
const processMessageText = (text) => {
  if (!text) return '';
  
  // Reemplazar \n\n con doble salto de línea y \n con salto de línea simple
  return text
    .replace(/\\n\\n/g, '\n\n')  // Doble \n se convierte en doble salto real
    .replace(/\\n/g, '\n');      // \n simple se convierte en salto simple
};

// Componente para renderizar imágenes con el endpoint proxy
// Componente MessageImage modificado para mostrar caption
const MessageImage = ({ mediaId, caption, onClick }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // URL del proxy para descargar imágenes
  const imageProxyUrl = `https://chatboot-webhook-production.up.railway.app/api/download-image/${mediaId}`;
  const imageSrc = `${imageProxyUrl}?v=${retryCount}`;
  
  const handleImageLoaded = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError('No se pudo cargar la imagen');
  };
  
  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    setRetryCount(prev => prev + 1);
  };
  
  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
  }, [mediaId]);

  return (
    <Box sx={{ maxWidth: '100%', mt: 1, mb: 1 }}>   
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} />
        </Box>
      )}
      
      {error ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2,
          p: 3,
          backgroundColor: alpha(theme.palette.error.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        }}>
          <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
          >
            Intentar de nuevo
          </Button>
        </Box>
      ) : (
        <Box>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={imageSrc}
              alt="Message attachment" 
              style={{ 
                maxWidth: '300px',
                maxHeight: '200px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: loading ? 'none' : 'block',
                objectFit: 'cover',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease',
              }}
              onLoad={handleImageLoaded}
              onError={handleImageError}
              onClick={onClick || (() => window.open(imageSrc, '_blank'))}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            
            {/* Overlay con icono de zoom */}
            <Box sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: '50%',
              p: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '&:hover': { opacity: 1 }
            }}>
              <VisibilityIcon sx={{ fontSize: 16, color: theme.palette.text.primary }} />
            </Box>
          </Box>
          
          {/* Caption debajo de la imagen con texto procesado */}
          {caption && caption.trim() && (
            <Box sx={{ mt: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap', // Esto es clave para mostrar los saltos de línea
                  color: 'inherit',
                  opacity: 0.9
                }}
              >
                {processMessageText(caption)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// Componente para renderizar documentos
const MessageDocument = ({ mediaId, fileName }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const documentProxyUrl = `https://chatboot-webhook-production.up.railway.app/api/download-document/${mediaId}`;
  const displayFileName = fileName || 'Documento adjunto';
  
  const getFileIcon = () => {
    if (!fileName) return <DescriptionIcon fontSize="large" />;
    
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon fontSize="large" sx={{ color: theme.palette.error.main }} />;
      case 'doc':
      case 'docx':
        return <ArticleIcon fontSize="large" sx={{ color: theme.palette.info.main }} />;
      case 'xls':
      case 'xlsx':
        return <TableChartIcon fontSize="large" sx={{ color: theme.palette.success.main }} />;
      case 'ppt':
      case 'pptx':
        return <SlideshowIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InsertDriveFileIcon fontSize="large" sx={{ color: theme.palette.text.secondary }} />;
    }
  };
  
  useEffect(() => {
    const checkDocumentAvailability = async () => {
      try {
        setLoading(true);
        await axios.head(`${documentProxyUrl}?v=${retryCount}`);
        setLoading(false);
        setError(null);
      } catch (err) {
        setLoading(false);
        setError('No se pudo acceder al documento');
      }
    };
    
    checkDocumentAvailability();
  }, [documentProxyUrl, retryCount]);
  
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  const handleOpenDocument = () => {
    window.open(`${documentProxyUrl}?v=${retryCount}`, '_blank');
  };
  
  const handleDownloadDocument = () => {
    const link = document.createElement('a');
    link.href = `${documentProxyUrl}?v=${retryCount}&download=true`;
    link.download = displayFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper
      elevation={2}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2,
        mt: 1, 
        mb: 1,
        borderRadius: 3,
        width: '100%',
        maxWidth: '280px',
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
          <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="body2" color="text.secondary">
            Cargando documento...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1 }}>
          <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
          >
            Reintentar
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Box sx={{ mb: 2 }}>
              {getFileIcon()}
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                color: theme.palette.text.primary
              }}
            >
              {displayFileName}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              width: '100%'
            }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                onClick={handleOpenDocument}
                startIcon={<VisibilityIcon />}
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
              >
                Ver
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={handleDownloadDocument}
                startIcon={<GetAppIcon />}
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
              >
                Descargar
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

// Componente para la vista previa de imagen
const ImagePreview = ({ file, onRemove }) => {
  const theme = useTheme();
  const [preview, setPreview] = useState('');
  
  useEffect(() => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    return () => {
      reader.abort();
    };
  }, [file]);
  
  return (
    <Grow in={true}>
      <Box 
        sx={{ 
          mt: 2, 
          mb: 2, 
          position: 'relative',
          display: 'inline-block',
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <img 
          src={preview} 
          alt="Preview" 
          style={{
            maxWidth: '200px',
            maxHeight: '150px',
            display: 'block',
            objectFit: 'cover'
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            color: theme.palette.error.main,
            '&:hover': { 
              backgroundColor: theme.palette.background.paper,
              transform: 'scale(1.1)'
            },
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
          onClick={onRemove}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Grow>
  );
};

const Messages = ({ conversationId }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoresponse, setAutoresponse] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [openImageModal, setOpenImageModal] = useState(false);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const messageRefs = useRef({});

  // Extraer el nombre del cliente
  let clientName = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender || conversationId;
  if (typeof clientName !== 'string') {
    clientName = String(clientName || 'Usuario');
  }

  const handleOpenInfoDrawer = () => {
    setInfoDrawerOpen(true);
  };
  
  const handleCloseInfoDrawer = () => {
    setInfoDrawerOpen(false);
  };

  const handleMessageClick = (messageId) => {
    setHighlightedMessageId(messageId);
    
    setTimeout(() => {
      if (messageRefs.current[messageId]) {
        const messageElement = messageRefs.current[messageId];
        messageElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleOpenImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setOpenImageModal(true);
  };
  
  // Obtener detalles de la conversación
  useEffect(() => {
    if (conversationId) {
      axios.get(`https://chatboot-webhook-production.up.railway.app/api/conversation-detail/${conversationId}`)
        .then((res) => {
          const conv = res.data;
          setAutoresponse(!!conv.autoresponse);
        })
        .catch((error) => {
          console.error("Error fetching conversation details", error);
        });
    }
  }, [conversationId]);
  
  // Actualizar autoresponse
  const handleAutoresponseToggle = async (e) => {
    const newValue = e.target.checked;
    setAutoresponse(newValue);
    try {
      await axios.put(`https://chatboot-webhook-production.up.railway.app/api/conversations/${conversationId}/autoresponse`, { autoresponse: newValue });
    } catch (error) {
      console.error('Error updating autoresponse:', error);
    }
  };

  // Polling para refrescar mensajes
  useEffect(() => {
    if (conversationId) {
      let previousMessagesCount = messages.length;
      const interval = setInterval(async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          
          if (sortedMessages.length > previousMessagesCount) {
            const newMessages = sortedMessages.slice(0, sortedMessages.length - previousMessagesCount);
            const newCustomerMessage = newMessages.find(m => m.sender && m.sender !== 'Sharky');
            if (newCustomerMessage && Notification.permission === 'granted') {
              new Notification('Nuevo mensaje recibido', {
                body: newCustomerMessage.message || 'Archivo multimedia',
                icon: '/favicon.ico'
              });
            }
          }
          
          previousMessagesCount = sortedMessages.length;
          setMessages(sortedMessages);
        } catch (error) {
          console.error('Error al obtener mensajes:', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId, messages.length]);
  
  // Cargar mensajes al cambiar de conversación
  useEffect(() => {
    if (conversationId) {
      const getMessages = async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          setMessages(sortedMessages);
          setTimeout(scrollToBottom, 100);
        } catch (error) {
          console.error('Error al obtener mensajes:', error);
        }
      };
      getMessages();
    }
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setInputMessage('');
    setSelectedImage(null);
  }, [conversationId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  const handleReply = (messageId) => {
    setReplyingTo(messages.find(m => m.message_id === messageId));
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelection = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() || selectedImage) {
      setIsSending(true);
      
      try {
        const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
        if (!clientPhone) {
          console.error('No client phone number found in messages.');
          setIsSending(false);
          return;
        }
        
        if (selectedImage) {
          const formData = new FormData();
          formData.append('file', selectedImage);
          formData.append('to', clientPhone);
          formData.append('conversationId', conversationId);
          formData.append('caption', inputMessage);
          formData.append('sender', 'Sharky');
          
          await axios.post(
            'https://chatboot-webhook-production.up.railway.app/api/send-media',
            formData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data' 
              } 
            }
          );
          
          setSelectedImage(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        } 
        else if (inputMessage.trim()) {
          const payload = {
            to: clientPhone,
            conversationId,
            message: inputMessage,
            sender: 'Sharky'
          };

          await axios.post(
            'https://chatboot-webhook-production.up.railway.app/send-manual-message',
            payload
          );
        }

        const data = await fetchMessages(conversationId);
        const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        setMessages(sortedMessages);
        scrollToBottom();
        
        setInputMessage('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
        
      } catch (error) {
        console.error('Error sending message:', error);
        alert(`Error al enviar mensaje: ${error.response?.data?.error || 'Ha ocurrido un error'}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleDeleteMessageRequest = (messageId) => {
    setMessageToDelete(messageId);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteMessage = () => {
    if (!messageToDelete) return;
    
    axios.delete(`https://chatboot-webhook-production.up.railway.app/api/delete-message/${messageToDelete}`)
      .then(() => {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.message_id.toString() !== messageToDelete.toString())
        );
        alert('Mensaje eliminado correctamente');
      })
      .catch(error => {
        console.error('Error completo:', error);
        alert('Error al eliminar mensaje: ' + (error.response?.data?.error || error.message));
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setMessageToDelete(null);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
    if (!clientPhone) {
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('to', clientPhone);
      formData.append('conversationId', conversationId);
      formData.append('caption', '');
      formData.append('sender', 'Sharky');
      
      const response = await axios.post(
        'https://chatboot-webhook-production.up.railway.app/api/send-media',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      const data = await fetchMessages(conversationId);
      const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending document:', error);
      alert(`Error al enviar documento: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSending(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  // Renderizado del contenido del mensaje
const renderMessageContent = (msg) => {
  switch (msg.message_type) {
    case 'audio':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <VolumeUpIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <CustomAudioPlayer 
            src={`https://chatboot-webhook-production.up.railway.app/api/download-media?url=${encodeURIComponent(msg.media_url)}&mediaId=${encodeURIComponent(msg.media_id)}`} 
          />
        </Box>
      );
    case 'image':
      return (
        <MessageImage 
          mediaId={msg.media_id} 
          caption={msg.message} // El caption se procesará automáticamente
          onClick={() => handleOpenImageModal(`https://chatboot-webhook-production.up.railway.app/api/download-image/${msg.media_id}`)}
        />
      );
    case 'document':
      return (
        <MessageDocument 
          mediaId={msg.media_id} 
          fileName="Documento Adjunto"
        />
      );
    default:
      return (
        <Typography variant="body1" sx={{ 
          lineHeight: 1.5,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap' // Importante: esto permite mostrar saltos de línea
        }}>
          {processMessageText(msg.message)} {/* Procesar el texto aquí también */}
        </Typography>
      );
  }
};

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      marginTop: 0
    }}>
      {/* Header del chat */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          zIndex: 1,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              {clientName.charAt(0).toUpperCase()}
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {clientName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.success.main,
                  animation: 'pulse 2s infinite'
                }} />
                <Typography variant="caption" color="text.secondary">
                  En línea • Última vez hace 2m
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel 
            control={
              <Switch 
                checked={autoresponse} 
                onChange={handleAutoresponseToggle}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            } 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Respuestas automáticas
                </Typography>
                <Chip 
                  label={autoresponse ? "ON" : "OFF"}
                  size="small"
                  color={autoresponse ? "success" : "default"}
                  sx={{ 
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              </Box>
            }
          />
          
          <Tooltip title="Información del contacto">
            <IconButton 
              color="primary" 
              onClick={handleOpenInfoDrawer}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      {/* Lista de mensajes */}
      <List
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
          zIndex: 1,
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.3),
            borderRadius: '3px',
          },
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <Fade key={msg.message_id} in={true} timeout={300 + index * 50}>
              <ListItem 
                ref={(el) => messageRefs.current[msg.message_id] = el}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'Sharky' ? 'flex-end' : 'flex-start',
                  px: 2,
                  py: 1,
                  ...(highlightedMessageId === msg.message_id && {
                    animation: 'highlight 2s',
                    '@keyframes highlight': {
                      '0%': { backgroundColor: alpha(theme.palette.primary.main, 0.3) },
                      '100%': { backgroundColor: 'transparent' }
                    }
                  })
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    maxWidth: '70%',
                    '&:hover .message-actions': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Botones de acción */}
                  <Box 
                    className="message-actions"
                    sx={{
                      position: 'absolute',
                      right: msg.sender === 'Sharky' ? 'auto' : '-40px',
                      left: msg.sender === 'Sharky' ? '-40px' : 'auto',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >  
                    <Tooltip title="Responder">
                      <IconButton
                        size="small"
                        onClick={() => handleReply(msg.message_id)}
                        sx={{
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': {
                            bgcolor: theme.palette.background.paper,
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMessageRequest(msg.message_id)}
                        sx={{
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          color: theme.palette.error.main,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* Burbuja del mensaje */}
                  <Paper
                    elevation={2}
                    sx={{
                      backgroundColor: msg.sender === 'Sharky' ? 
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : 
                        alpha(theme.palette.background.paper, 0.95),
                      color: msg.sender === 'Sharky' ? '#fff' : theme.palette.text.primary,
                      borderRadius: msg.sender === 'Sharky' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      p: 2,
                      wordBreak: 'break-word',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      position: 'relative',
                      backdropFilter: 'blur(10px)',
                      border: msg.sender === 'Sharky' ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      background: msg.sender === 'Sharky' ? 
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : 
                        alpha(theme.palette.background.paper, 0.95),
                    }}
                  >
                    {renderMessageContent(msg)}
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1,
                      pt: 1,
                      borderTop: msg.sender === 'Sharky' ? 
                        `1px solid ${alpha('#fff', 0.2)}` : 
                        `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <Typography 
                        variant="caption"
                        sx={{ 
                          opacity: 0.8,
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <ScheduleIcon sx={{ fontSize: 10 }} />
                        {new Date(msg.sent_at).toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </Typography>
                      
                      {msg.sender === 'Sharky' && (
                        <CheckCircleIcon sx={{ 
                          fontSize: 14, 
                          opacity: 0.8,
                          color: theme.palette.success.light
                        }} />
                      )}
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            </Fade>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron mensajes. ¡Inicia la conversación!
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Modal para visualizar imágenes */}
<Modal
  open={openImageModal}
  onClose={() => setOpenImageModal(false)}
  sx={{ zIndex: 2000 }}
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    p: 2,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: 3,
    textAlign: 'center',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
  }}>
    <IconButton 
      sx={{ 
        position: 'absolute', 
        top: 8, 
        right: 8,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        '&:hover': { 
          backgroundColor: theme.palette.background.paper,
          transform: 'scale(1.1)'
        },
        transition: 'all 0.2s ease'
      }}
      onClick={() => setOpenImageModal(false)}
    >
      <CloseIcon />
    </IconButton>
    <img 
      src={modalImageSrc} 
      alt="Full size" 
      style={{ 
        maxWidth: '100%', 
        maxHeight: 'calc(90vh - 100px)',
        objectFit: 'contain',
        borderRadius: '8px'
      }} 
    />
  </Box>
</Modal>


      {/* Indicador de carga al enviar */}
      {isSending && (
        <Fade in={true}>
          <Box sx={{ 
            position: 'absolute', 
            bottom: '100px', 
            right: '20px',
            zIndex: 10,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: 2,
            p: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="caption" color="text.secondary">
              Enviando...
            </Typography>
          </Box>
        </Fade>
      )}

      {/* UI de respuesta */}
      {replyingTo && (
        <Grow in={true}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              m: 2,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              zIndex: 1,
              position: 'relative'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                Respondiendo a:
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setReplyingTo(null)}
                sx={{ color: theme.palette.text.secondary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ pl: 2, borderLeft: `3px solid ${theme.palette.info.main}` }}>
              <Typography variant="body2" noWrap sx={{ color: theme.palette.text.secondary }}>
                {replyingTo.message}
              </Typography>
            </Box>
          </Paper>
        </Grow>
      )}

      {/* Vista previa de imagen seleccionada */}
      {selectedImage && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
          textAlign: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          zIndex: 1,
          position: 'relative'
        }}>
          <ImagePreview file={selectedImage} onRemove={handleRemoveSelectedImage} />
        </Box>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: selectedImage ? '200px' : '120px',
            left: '20px',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }}
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            searchPlaceholder="Buscar emoji..."
            theme={theme.palette.mode}
          />
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelection}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        ref={documentInputRef}
        style={{ display: 'none' }}
        onChange={handleDocumentUpload}
      />

      {/* Input de mensaje */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          zIndex: 1,
          position: 'relative'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Escribe un mensaje..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              backgroundColor: alpha(theme.palette.background.default, 0.8),
              backdropFilter: 'blur(10px)',
              '& fieldset': {
                borderColor: alpha(theme.palette.divider, 0.2),
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Emojis">
                    <IconButton 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={isSending}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar imagen">
                    <IconButton 
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isSending}
                      sx={{ 
                        color: theme.palette.success.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.1)
                        }
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar documento">
                    <IconButton 
                      onClick={() => documentInputRef.current?.click()}
                      disabled={isSending}
                      sx={{ 
                        color: theme.palette.warning.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.1)
                        }
                      }}
                    >
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Enviar mensaje">
                  <span>
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputMessage.trim() && !selectedImage)}
                      sx={{ 
                        backgroundColor: (inputMessage.trim() || selectedImage) ? 
                          theme.palette.primary.main : 
                          alpha(theme.palette.action.disabled, 0.3),
                        color: (inputMessage.trim() || selectedImage) ? 
                          'white' : 
                          theme.palette.action.disabled,
                        '&:hover': {
                          backgroundColor: (inputMessage.trim() || selectedImage) ? 
                            theme.palette.primary.dark : 
                            alpha(theme.palette.action.disabled, 0.3),
                          transform: (inputMessage.trim() || selectedImage) ? 'scale(1.05)' : 'none'
                        },
                        transition: 'all 0.2s ease',
                        '&.Mui-disabled': {
                          backgroundColor: alpha(theme.palette.action.disabled, 0.3),
                          color: theme.palette.action.disabled,
                        }
                      }}
                    >
                      {isSending ? (
                        <CircularProgress size={20} sx={{ color: 'inherit' }} />
                      ) : (
                        <SendIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Info Drawer */}
      <InfoDrawer 
        open={infoDrawerOpen} 
        onClose={handleCloseInfoDrawer} 
        conversationId={conversationId}
        onMessageClick={handleMessageClick}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          ¿Eliminar este mensaje?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará el mensaje de tu vista. El mensaje original seguirá 
            existiendo para otros usuarios.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeleteMessage} 
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;