import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CACHE_KEY = 'dashboardData';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos de expiración (opcional)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('https://chatboot-webhook-production.up.railway.app/api/dashboard-info');
        const data = response.data;
        setDashboardData(data);
        // Guarda la data en cache junto con la marca de tiempo
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch (error) {
        console.error('Error fetching dashboard info:', error);
      }
    };

    // Revisa si existe la data en cache y si no está expirada
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const age = Date.now() - parsedCache.timestamp;
      if (age < CACHE_EXPIRATION) {
        setDashboardData(parsedCache.data);
        return;
      }
    }
    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
          Cargando información del dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  // Desestructuramos la data (incluyendo mensajes_pendientes)
  const { total_mensajes, mensajes_sharky, total_usuarios, mensajes_pendientes, timeline } = dashboardData;
  const mensajesEnviados = mensajes_sharky;
  const mensajesRecibidos = total_mensajes - mensajes_sharky;

  const stats = [
    { label: 'Mensajes enviados', value: mensajesEnviados },
    { label: 'Mensajes recibidos', value: mensajesRecibidos },
    { label: 'Mensajes pendientes', value: mensajes_pendientes },
    { label: 'Usuarios activos', value: total_usuarios },
  ];

  // Preparamos la data para el gráfico usando el timeline global
  const chartLabels = timeline ? timeline.map(item => item.date) : [];
  const chartDataCounts = timeline ? timeline.map(item => item.count) : [];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Mensajes recibidos',
        data: chartDataCounts,
        borderColor: 'rgba(43, 145, 255, 1)',
        backgroundColor: 'rgba(43, 145, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Timeline global de mensajes recibidos',
      },
    },
  };

  return (
    <Box p={3}>
      <Typography variant="h4" color="primary" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3}>
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
      <Box mt={5}>
        <Card elevation={3}>
          <CardContent>
            <Line data={chartData} options={chartOptions} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
