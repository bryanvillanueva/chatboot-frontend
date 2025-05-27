import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003491', // Azul corporativo principal
      light: '#1e4ea3',
      dark: '#002066',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2B91FF', // Azul secundario moderno
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafbfc', // Gris muy claro y moderno
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#4a5568',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12, // Bordes más redondeados y modernos
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 52, 145, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #003491 0%, #1e4ea3 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #002066 0%, #003491 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 12px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #003491 0%, #1e4ea3 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #002066 0%, #003491 100%)',
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '& .MuiListItemText-root': {
              color: '#ffffff',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 52, 145, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a202c',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fafbfc',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 52, 145, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#003491',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #003491 0%, #1e4ea3 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#fafbfc',
            fontWeight: 600,
            color: '#1a202c',
            borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});

export default theme;