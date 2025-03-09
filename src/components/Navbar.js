import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Paper, InputBase, IconButton, Avatar, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = ({ pageTitle }) => {
 

  return (
    <AppBar position="fixed" color="light" sx={{ top: 0, zIndex: 3, padding: '0px', boxShadow: 3, width: 'calc(100% - 240px)', left: '240px' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flex: 0.5, display: 'flex', justifyContent: 'flex-start', pl: 2 }}>
          <Typography variant="h6">{pageTitle}</Typography>
        </Box>

        <Box sx={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          
          <IconButton color="primary">
            <EventNoteIcon />
          </IconButton>
          <IconButton color="primary">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="primary">
            <ChatIcon />
          </IconButton>

          <Avatar sx={{ bgcolor: 'primary.main' }}>
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
