import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmailMarketing = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Email Marketing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de campañas de email marketing
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmailMarketing; 