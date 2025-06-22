import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Appointments from './pages/Appointments';
import Students from './components/Students'; // Importamos el componente Students
import MoodleUsers from './components/moodle/MoodleUsers'; // Importamos el componente MoodleUsers
import WhatsAppAccounts from './pages/WhatsAppAccounts';
import FacebookAccounts from './pages/FacebookAccounts';
import FlowBuilder from './pages/FlowBuilder';
import BulkSending from './pages/BulkSending';
import CrmLeads from './pages/CrmLeads';
import EmailMarketing from './pages/EmailMarketing';
import Contacts from './pages/Contacts';

// Crear tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#003391',
      light: '#1A8FCE',
      dark: '#002266',
    },
    secondary: {
      main: '#1A8FCE',
      light: '#4BAFCE',
      dark: '#006491',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          
          <Route path="/components/moodle" element={<MoodleUsers pageTitle="Consulta Moodle"/>} />
          
          <Route path="/components/students" element={<Students pageTitle="Registro Estudiantes"/>} />
          
          <Route path="/whatsapp-accounts" element={
            <ProtectedRoute>
              <WhatsAppAccounts />
            </ProtectedRoute>
          } />
          
          <Route path="/facebook-accounts" element={
            <ProtectedRoute>
              <FacebookAccounts />
            </ProtectedRoute>
          } />
          
          <Route path="/flow-builder" element={
            <ProtectedRoute>
              <FlowBuilder />
            </ProtectedRoute>
          } />
          
          <Route path="/bulk-sending" element={
            <ProtectedRoute>
              <BulkSending />
            </ProtectedRoute>
          } />
          
          <Route path="/crm-leads" element={
            <ProtectedRoute>
              <CrmLeads />
            </ProtectedRoute>
          } />
          
          <Route path="/email-marketing" element={
            <ProtectedRoute>
              <EmailMarketing />
            </ProtectedRoute>
          } />
          
          <Route path="/contacts" element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;