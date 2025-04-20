import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Appointments from './pages/Appointments';
import Layout from './components/Layout';
import Students from './components/Students'; // Importamos el componente Students
import MoodleUsers from './components/moodle/MoodleUsers'; // Importamos el componente MoodleUsers

const App = () => {
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard pageTitle="Dashboard"/>} />
          <Route path="/chat" element={<Chat pageTitle="Chat"/>} />
          <Route path="/appointments" element={<Appointments pageTitle="Appointments"/>} />
          <Route path="/components/moodle" element={<MoodleUsers pageTitle="Consulta Moodle"/>} />
          <Route path="/components/students" element={<Students pageTitle="Registro Estudiantes"/>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;