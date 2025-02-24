import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#013793', // Azul principal
      light: '#2B91FF', // Azul claro
    },
    secondary: {
      main: '#003491', // Azul oscuro
    },
    light: {
    main: '#ffffff', // Blanco
    },
    error: {
      main: '#2B91FF', // Azul claro
    },
  },
});

export default theme;
