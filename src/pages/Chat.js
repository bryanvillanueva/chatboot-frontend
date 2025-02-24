import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchConversations } from '../services/webhookService';
import Messages from '../components/Messages';

const Chat = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
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

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (onSelectConversation) onSelectConversation(conversationId);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '90vh', // Fixed height for the chat container
        overflow: 'hidden',
        bgcolor: '#f0f2f5',
      }}
    >
      {/* Left panel: Conversations list */}
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
        <Typography variant="h6" sx={{ p: 2 }}>
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
                onClick={() => handleSelectConversation(conv.conversation_id)}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                    {conv.client_name ? conv.client_name.charAt(0) : '?'}
                  </Avatar>
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
                      }}
                    >
                      {conv.last_message || 'Sin mensajes'}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Right panel: Messages */}
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
  );
};

export default Chat;