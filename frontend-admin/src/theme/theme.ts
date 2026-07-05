import { createTheme } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';
import { frFR as dataGridFrFR } from '@mui/x-data-grid/locales';

export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: { main: '#111111', contrastText: '#ffffff' },
      secondary: { main: '#6b7280' },
      error: { main: '#b71c1c' },
      background: { default: '#f7f7f5', paper: '#ffffff' },
      text: { primary: '#111111', secondary: '#6b7280' },
      divider: '#e5e7eb',
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
      h1: { fontFamily: '"Playfair Display", Georgia, serif' },
      h2: { fontFamily: '"Playfair Display", Georgia, serif' },
      h3: { fontFamily: '"Playfair Display", Georgia, serif' },
      h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      h6: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
            color: '#111111',
            boxShadow: '0 1px 0 0 #e5e7eb',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#111111',
            color: '#ffffff',
            borderRight: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid #e5e7eb',
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  },
  frFR,
  dataGridFrFR,
);
