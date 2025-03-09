import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Paper, InputBase, IconButton, Avatar, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = ({ pageTitle }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AppBar position="fixed" color="primary" sx={{ top: 0, zIndex: 1100, padding: '0px', boxShadow: 3, width: 'calc(100% - 240px)', left: '240px' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flex: 0.5, display: 'flex', justifyContent: 'flex-start', pl: 2 }}>
          <Typography variant="h6">{pageTitle}</Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: 300, padding: '4px 10px', borderRadius: 2 }}>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }}>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
        <Box sx={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <EventNoteIcon />
          </IconButton>
          <IconButton color="inherit">
            <ChatIcon />
          </IconButton>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
          <Box>
            <Typography variant="body1">Usuario Prueba</Typography>
            <Typography variant="caption">Administrador</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
