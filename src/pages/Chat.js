import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchConversations } from '../services/webhookService';
import Messages from '../components/Messages';
import Navbar from '../components/Navbar';

const Chat = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversationName, setSelectedConversationName] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const getConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
      }
    };
    getConversations();
  }, []);

  const handleSelectConversation = (conversationId, clientName) => {
    setSelectedConversationId(conversationId);
    setSelectedConversationName(clientName || 'Sin nombre');
    if (onSelectConversation) onSelectConversation(conversationId);
  };

  // Función para determinar qué mostrar como último mensaje según su tipo
  const getLastMessagePreview = (conversation) => {
    if (!conversation.last_message_type) {
      return conversation.last_message || 'Sin mensajes';
    }
    
    switch (conversation.last_message_type) {
      case 'audio':
        return 'Mensaje de voz';
      case 'image':
        return 'Archivo de imagen';
      case 'document':
        return 'Documento adjunto';
      default:
        return conversation.last_message || 'Sin mensajes';
    }
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 600px) {
            .css-1ygil4i-MuiToolbar-root {
              min-height: 41px !important;
              height: 41px !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
        `}
      </style>

      <Navbar pageTitle={selectedConversationId ? `Chat con ${selectedConversationName}` : 'Chat'} />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 41px)', // Ajuste para no generar scroll
          overflow: 'hidden',
          bgcolor: '#f0f2f5',
        }}
      >
        {/* Sidebar de Chats */}
        <Box
          sx={{
            width: '250px',
            height: '100%',
            bgcolor: 'white',
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" sx={{ p: 2, margin: 0 }}>
            Chats
          </Typography>
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '3px',
              },
            }}
          >
            {conversations.map((conv) => (
              <React.Fragment key={conv.conversation_id}>
                <ListItem
                  button
                  onClick={() => handleSelectConversation(conv.conversation_id, conv.client_name)}
                  sx={{
                    backgroundColor: selectedConversationId === conv.conversation_id ? theme.palette.action.selected : 'inherit',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'background 0.2s ease-in-out',
                    padding: '10px 16px',
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      variant="dot"
                      color="primary"
                      invisible={!conv.last_message_sender || conv.last_message_sender === 'Sharky'}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                        {conv.client_name ? conv.client_name.charAt(0) : '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.client_name || 'Sin nombre'}
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '160px',
                          color: conv.last_message_sender && conv.last_message_sender !== 'Sharky' ? '#2b91ff' : 'inherit',
                        }}
                      >
                        {getLastMessagePreview(conv)}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Contenedor del Chat */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          {selectedConversationId ? (
            <Messages conversationId={selectedConversationId} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Selecciona un chat para ver los mensajes
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Chat;