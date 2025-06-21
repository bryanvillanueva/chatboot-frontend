import React, { useEffect, useState } from 'react';

const Layout = () => {
  const [userData, setUserData] = useState({});

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        // Asegurar que siempre tenga un role
        if (!parsedUserData.role) {
          parsedUserData.role = 'Usuario';
        }
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
        // Datos por defecto en caso de error
        setUserData({
          firstname: 'Usuario',
          lastname: 'Sistema',
          role: 'Usuario',
          email: 'usuario@sistema.com'
        });
      }
    }
  }, []);

  return (
    // Rest of the component code
  );
};

export default Layout; 