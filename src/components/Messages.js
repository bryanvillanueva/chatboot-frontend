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
  Paper
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import CustomAudioPlayer from './customAudioPlayer';

// Componente para renderizar imágenes con el endpoint proxy
const MessageImage = ({ mediaId, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Generamos la URL directa al endpoint proxy
  const imageProxyUrl = `https://chatboot-webhook-production.up.railway.app/api/download-image/${mediaId}`;
  
  // Usamos el mediaId como clave para refrescar la imagen
  const imageSrc = `${imageProxyUrl}?v=${retryCount}`;
  
  // Cuando la imagen termine de cargar
  const handleImageLoaded = () => {
    setLoading(false);
    setError(null);
  };
  
  // Si hay error al cargar la imagen
  const handleImageError = () => {
    setLoading(false);
    setError('No se pudo cargar la imagen');
  };
  
  // Forzar recarga de la imagen
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  useEffect(() => {
    // Resetear estado al cambiar de mediaId
    setLoading(true);
    setError(null);
    setRetryCount(0);
  }, [mediaId]);
  
  return (
    <Box sx={{ maxWidth: '100%', mt: 1, mb: 1 }}>   
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Intentar de nuevo
          </Button>
        </Box>
      ) : (
        <img 
          src={imageSrc}
          alt="Message attachment" 
          style={{ 
            maxWidth: '70%', // Imagen más pequeña
            maxHeight: '200px', // Controlar altura
            borderRadius: '8px',
            cursor: 'pointer',
            display: loading ? 'none' : 'block',
            objectFit: 'contain'
          }}
          onLoad={handleImageLoaded}
          onError={handleImageError}
          onClick={onClick || (() => window.open(imageSrc, '_blank'))}
        />
      )}
    </Box>
  );
};

// Componente para la vista previa de imagen
const ImagePreview = ({ file, onRemove }) => {
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
    <Box 
      sx={{ 
        mt: 2, 
        mb: 2, 
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <img 
        src={preview} 
        alt="Preview" 
        style={{
          maxWidth: '150px',
          maxHeight: '150px',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}
      />
      <IconButton
        size="small"
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          backgroundColor: 'white',
          '&:hover': { backgroundColor: '#f5f5f5' },
          boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
        }}
        onClick={onRemove}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

const Messages = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoresponse, setAutoresponse] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const theme = useTheme();
  const ICON_COLOR = '#2B91FF';

  // Extraer el nombre del cliente (primer sender que no sea "Sharky")
  const clientName = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender || conversationId;

  // Función para abrir imagen en modal
  const handleOpenImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setOpenImageModal(true);
  };
  
  // Obtener detalles de la conversación (autoresponse)
  useEffect(() => {
    if (conversationId) {
      axios.get(`https://chatboot-webhook-production.up.railway.app/api/conversation-detail/${conversationId}`)
        .then((res) => {
          const conv = res.data;
          console.log("Valor de autoresponse:", conv.autoresponse);
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
      const response = await axios.put(`https://chatboot-webhook-production.up.railway.app/api/conversations/${conversationId}/autoresponse`, { autoresponse: newValue });
      console.log('Autoresponse updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating autoresponse:', error.response ? error.response.data : error.message);
    }
  };

  // Polling: refrescar mensajes cada 5 segundos
  useEffect(() => {
    if (conversationId) {
      let previousMessagesCount = messages.length;
      const interval = setInterval(async () => {
        try {
          const data = await fetchMessages(conversationId);
          // Ordenar para que los mensajes más recientes estén primero
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          
          // Notificar si hay mensajes nuevos (solo de cliente)
          if (sortedMessages.length > previousMessagesCount) {
            const newMessages = sortedMessages.slice(0, sortedMessages.length - previousMessagesCount);
            const newCustomerMessage = newMessages.find(m => m.sender && m.sender !== 'Sharky');
            if (newCustomerMessage) {
              if (Notification.permission === 'granted') {
                new Notification('New message received', {
                  body: newCustomerMessage.message,
                  icon: '/path/to/icon.png'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('New message received', {
                      body: newCustomerMessage.message,
                      icon: '/path/to/icon.png'
                    });
                  }
                });
              }
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
          // Ordenar mensajes: últimos primero
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          setMessages(sortedMessages);
          // Esperar a que los mensajes se carguen y luego desplazar a los más recientes
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

  // Función para desplazarse a los mensajes más recientes
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0; // Scrollea al inicio (mensajes más recientes)
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

  // Función para manejar la selección de imagen (sin envío inmediato)
  const handleImageSelection = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  // Función para eliminar la imagen seleccionada
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
        
        // Si hay una imagen seleccionada, la enviamos primero
        if (selectedImage) {
          console.log('📤 Enviando imagen:', selectedImage.name);
          
          // Crear FormData con el archivo y datos adicionales
          const formData = new FormData();
          formData.append('file', selectedImage); // El archivo
          formData.append('to', clientPhone); // Número del destinatario
          formData.append('conversationId', conversationId); // ID de la conversación
          formData.append('caption', inputMessage); // Usar el mensaje como caption
          formData.append('sender', 'Sharky'); // Remitente
          
          // Enviar al endpoint de medios
          await axios.post(
            'https://chatboot-webhook-production.up.railway.app/api/send-media',
            formData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data' 
              } 
            }
          );
          
          // Limpiar la imagen seleccionada
          setSelectedImage(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        } 
        // Si hay texto y no hay imagen (o si hay texto y ya se envió la imagen)
        else if (inputMessage.trim()) {
          console.log('Sending text message:', {
            text: inputMessage,
            replyToId: replyingTo?.message_id,
            conversationId
          });
          
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

        // Actualizar la vista con los mensajes más recientes
        const data = await fetchMessages(conversationId);
        const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        setMessages(sortedMessages);
        scrollToBottom();
        
        // Limpiar estado
        setInputMessage('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
        
      } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        alert(`Error al enviar mensaje: ${error.response?.data?.error || 'Ha ocurrido un error'}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manejar subida de documentos (sin cambios)
  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
    if (!clientPhone) {
      console.error('No client phone number found');
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    setIsSending(true);
    
    try {
      console.log(`📤 Enviando documento:`, file.name);
      
      // Crear FormData con el archivo y datos adicionales
      const formData = new FormData();
      formData.append('file', file); // El archivo
      formData.append('to', clientPhone); // Número del destinatario
      formData.append('conversationId', conversationId); // ID de la conversación
      formData.append('caption', ''); // Caption opcional
      formData.append('sender', 'Sharky'); // Remitente
      
      // Enviar directamente al endpoint de medios
      const response = await axios.post(
        'https://chatboot-webhook-production.up.railway.app/api/send-media',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      console.log('✅ Document message sent:', response.data);

      // Actualizar la vista con los mensajes más recientes
      const data = await fetchMessages(conversationId);
      const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('❌ Error sending document:', error);
      let errorMessage = 'Error al enviar el documento';
      
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
        errorMessage = error.response.data.error || error.response.data.details || errorMessage;
      }
      
      alert(`Error al enviar documento: ${errorMessage}`);
    } finally {
      setIsSending(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  // Renderizado del contenido del mensaje según su tipo
  const renderMessageContent = (msg) => {
    switch (msg.message_type) {
      case 'audio':
        return (
          <CustomAudioPlayer 
            src={`https://chatboot-webhook-production.up.railway.app/api/download-media?url=${encodeURIComponent(msg.media_url)}&mediaId=${encodeURIComponent(msg.media_id)}`} 
          />
        );
      case 'image':
        return (
          <MessageImage 
            mediaId={msg.media_id} 
            onClick={() => handleOpenImageModal(`https://chatboot-webhook-production.up.railway.app/api/download-image/${msg.media_id}`)}
          />
        );
      case 'document':
        return (
          <Box>
            <Typography variant="caption" display="block" sx={{ mb: 1, fontStyle: 'italic' }}>
              📄 Documento adjunto
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<DescriptionIcon />}
              onClick={() => window.open(msg.media_url, '_blank')}
            >
              Ver documento
            </Button>
          </Box>
        );
      default:
        return <Typography variant="body1">{msg.message}</Typography>;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header con switch funcional */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #ccc',
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h6">
          {clientName}
        </Typography>
        <FormControlLabel 
          control={
            <Switch 
              checked={autoresponse} 
              onChange={handleAutoresponseToggle} 
            />
          } 
          label="Respuestas automáticas" 
        />
      </Box>
      
      {/* Lista de mensajes */}
      <List
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse', // Lista invertida
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ListItem
              key={msg.message_id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'Sharky' ? 'flex-end' : 'flex-start',
                px: 2,
                py: 1,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: '70%',
                  '&:hover .reply-button': {
                    opacity: 1,
                  },
                }}
              >
                {/* Botón de respuesta */}
                <IconButton
                  className="reply-button"
                  size="small"
                  onClick={() => handleReply(msg.message_id)}
                  sx={{
                    position: 'absolute',
                    right: msg.sender === 'Sharky' ? 'auto' : '-30px',
                    left: msg.sender === 'Sharky' ? '-30px' : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    bgcolor: 'white',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>

                {/* Burbuja del mensaje con box-shadow */}
                <Box
                  sx={{
                    backgroundColor: msg.sender === 'Sharky' ? '#2B91FF' : '#f0f2f5',
                    color: msg.sender === 'Sharky' ? '#fff' : 'inherit',
                    borderRadius: '25px',
                    p: 2,
                    wordBreak: 'break-word',
                    boxShadow: '2px 2px 10px #0202027d',
                  }}
                >
                  {renderMessageContent(msg)}

                  <Typography 
                    variant="caption" 
                    sx={{ display: 'block', textAlign: 'right', mt: 1, opacity: 0.8 }}
                  >
                    {new Date(msg.sent_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            No se encontraron mensajes.
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Modal para visualizar imágenes en tamaño completo */}
      <Modal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        aria-labelledby="image-modal"
        aria-describedby="full-size-image-view"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
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
              objectFit: 'contain' 
            }} 
          />
        </Box>
      </Modal>

      {/* Indicador de carga al enviar */}
      {isSending && (
        <Box sx={{ position: 'absolute', bottom: '80px', right: '20px' }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* UI de respuesta */}
      {replyingTo && (
        <Box
          sx={{
            p: 2,
            bgcolor: '#f0f2f5',
            borderTop: '1px solid #ccc',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Respondiendo a:
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setReplyingTo(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              pl: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="body2" noWrap>
              {replyingTo.message}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Vista previa de imagen seleccionada */}
      {selectedImage && (
        <Box sx={{ p: 1, borderTop: '1px solid #ccc', textAlign: 'center' }}>
          <ImagePreview file={selectedImage} onRemove={handleRemoveSelectedImage} />
        </Box>
      )}

      {/* Emoji Picker y inputs ocultos para archivos */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: selectedImage ? '160px' : '80px',
            left: '20px',
            zIndex: 1,
            boxShadow: 3,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            searchPlaceholder="Buscar emoji..."
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
        accept=".pdf,.doc,.docx"
        ref={documentInputRef}
        style={{ display: 'none' }}
        onChange={handleDocumentUpload}
      />

      {/* Input de mensaje */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #ccc',
          backgroundColor: 'white',
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: '#f0f2f5',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ 
                      color: ICON_COLOR,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <EmojiIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => imageInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => documentInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <DescriptionIcon />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={isSending}
                  sx={{ 
                    color: ICON_COLOR,
                    opacity: (inputMessage.trim() || selectedImage) ? 1 : 0.7,
                    '&:hover': {
                      backgroundColor: 'rgba(43, 145, 255, 0.04)'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default Messages;