import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CrmLeads = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          CRM & Leads
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de clientes potenciales y relaciones con clientes
        </Typography>
      </Paper>
    </Box>
  );
};

export default CrmLeads; 