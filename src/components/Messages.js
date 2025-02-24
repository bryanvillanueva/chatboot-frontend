import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  IconButton, 
  TextField, 
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const Messages = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const ICON_COLOR = '#2B91FF';

  

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
    // Reset states when conversation changes
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setInputMessage('');
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReply = (messageId) => {
    setReplyingTo(messages.find(m => m.message_id === messageId));
    setShowEmojiPicker(false); // Close emoji picker when replying
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
        // Retrieve the client's phone number from messages (first message with sender not "Sharky")
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

        // Refresh the messages after sending
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative', // For emoji picker positioning
      }}
    >
      {/* Header */}
      <Typography 
        variant="h6" 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid #ccc',
          backgroundColor: 'white',
        }}
      >
        Mensajes de la Conversación {conversationId}
      </Typography>
      
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
                  <Typography variant="body1">{msg.message}</Typography>
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

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
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
