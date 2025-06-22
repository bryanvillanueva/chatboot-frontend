// Configuración de URLs según el entorno
const config = {
    development: {
      frontendUrl: 'http://localhost:3000',
      backendUrl: 'https://chatboot-webhook-production.up.railway.app',
      redirectUrl: 'http://localhost:3000/login'
    },
    production: {
      frontendUrl: 'https://crm.sharkagency.co',
      backendUrl: 'https://chatboot-webhook-production.up.railway.app',
      redirectUrl: 'https://crm.sharkagency.co/login'
    }
  };
  
  // Determinar el entorno - Mejorar la detección
  const isDevelopment = 
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '3000' ||
    window.location.hostname.includes('localhost');
  
  // Agregar logs para debug
  console.log('🔍 Config.js - Detección de entorno:');
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('📍 hostname:', window.location.hostname);
  console.log('📍 port:', window.location.port);
  console.log('📍 isDevelopment:', isDevelopment);
  console.log('📍 FRONTEND_URL:', isDevelopment ? config.development.frontendUrl : config.production.frontendUrl);
  
  export const FRONTEND_URL = isDevelopment ? config.development.frontendUrl : config.production.frontendUrl;
  export const BACKEND_URL = isDevelopment ? config.development.backendUrl : config.production.backendUrl;
  export const REDIRECT_URL = isDevelopment ? config.development.redirectUrl : config.production.redirectUrl;
  
  // Log final para verificar exportación
  console.log('✅ Config.js - URLs exportadas:');
  console.log('📍 FRONTEND_URL:', FRONTEND_URL);
  console.log('📍 BACKEND_URL:', BACKEND_URL);
  console.log('📍 REDIRECT_URL:', REDIRECT_URL);
  
  export default config;