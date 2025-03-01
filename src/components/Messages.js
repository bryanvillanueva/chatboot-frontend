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
  Switch
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import CustomAudioPlayer from './customAudioPlayer';

const Messages = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoresponse, setAutoresponse] = useState(true); // State for autoresponse
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const theme = useTheme();
  const ICON_COLOR = '#2B91FF';

  // Extract client name from messages (first sender that is not "Sharky")
  const clientName = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender || conversationId;

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

  // Polling: refresh messages every 5 seconds
  useEffect(() => {
    if (conversationId) {
      let previousMessagesCount = messages.length;
      const interval = setInterval(async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          
          // Check for new messages (customer messages only)
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
  

  useEffect(() => {
    if (conversationId) {
      const getMessages = async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          setMessages(sortedMessages);
          scrollToBottom();
        } catch (error) {
          console.error('Error al obtener mensajes:', error);
        }
      };
      getMessages();
    }
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setInputMessage('');
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReply = (messageId) => {
    setReplyingTo(messages.find(m => m.message_id === messageId));
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setIsSending(true);
      console.log('Sending message:', {
        text: inputMessage,
        replyToId: replyingTo?.message_id,
        conversationId
      });
      try {
        const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
        
        if (!clientPhone) {
          console.error('No client phone number found in messages.');
          setIsSending(false);
          return;
        }
        
        const payload = {
          to: clientPhone,
          conversationId,
          message: inputMessage,
          sender: 'Sharky'
        };

        const response = await axios.post(
          'https://chatboot-webhook-production.up.railway.app/send-manual-message',
          payload
        );
        console.log('Message sent and stored:', response.data);

        const data = await fetchMessages(conversationId);
        const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        setMessages(sortedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
      }
      setInputMessage('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle media file upload (images or documents)
  const handleMediaUpload = async (mediaType, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
    if (!clientPhone) {
      console.error('No client phone number found');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('to', clientPhone);
    formData.append('mediaType', mediaType);
    // Optionally add caption here if desired, for now an empty caption:
    formData.append('caption', '');
    formData.append('conversationId', conversationId);

    try {
      const response = await axios.post(
        'https://chatboot-webhook-production.up.railway.app/api/send-media',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Media message sent:', response.data);
      const data = await fetchMessages(conversationId);
      const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending media message:', error.response ? error.response.data : error.message);
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
      {/* Header with functional switch */}
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
      
      {/* Messages List */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          },
        }}
      >
        <div ref={messagesEndRef} />
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
                {/* Reply Button */}
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

                {/* Message Bubble */}
                <Box
                  sx={{
                    backgroundColor: msg.sender === 'Sharky' ? theme.palette.primary.main : '#f0f2f5',
                    color: msg.sender === 'Sharky' ? '#fff' : 'inherit',
                    borderRadius: '25px',
                    p: 2,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.message_type === 'audio' ? (
                    <CustomAudioPlayer 
                      src={`https://chatboot-webhook-production.up.railway.app/api/download-media?url=${encodeURIComponent(msg.media_url)}&mediaId=${encodeURIComponent(msg.media_id)}`}
                    />
                  ) : (
                    <Typography variant="body1">{msg.message}</Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'right',
                      mt: 1,
                      opacity: 0.8
                    }}
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
      </List>

      {/* Loading indicator for sending */}
      {isSending && (
        <Box sx={{ position: 'absolute', bottom: '80px', right: '20px' }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Reply UI */}
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

      {/* Emoji Picker and hidden file inputs */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
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

      {/* Hidden file inputs for image and document uploads */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleMediaUpload('image', e)}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={documentInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleMediaUpload('document', e)}
      />

      {/* Message Input */}
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
                  sx={{ 
                    color: ICON_COLOR,
                    opacity: inputMessage.trim() ? 1 : 0.7,
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
