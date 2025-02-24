import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

const Dashboard = () => {
  const stats = [
    { label: 'Mensajes enviados', value: 120 },
    { label: 'Mensajes recibidos', value: 98 },
    { label: 'Mensajes pendientes', value: 5 },
    { label: 'Usuarios activos', value: 10 },
  ];

  return (
    <Box>
      <Typography variant="h4" color="primary" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" color="secondary">
                  {stat.value}
                </Typography>
                <Typography variant="body1">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
