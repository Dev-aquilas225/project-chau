import { createTheme } from '@mui/material/styles';
import { colors } from './tokens';

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary },
    background: { default: colors.contentBg, paper: colors.cardBg },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h4: { letterSpacing: '-0.02em' },
    h5: { letterSpacing: '-0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.contentBg },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(15,23,42,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: '#64748B', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' },
      },
    },
    RaAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#0F172A',
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          color: colors.sidebarText,
          borderLeft: '3px solid transparent',
          borderRadius: '0 10px 10px 0',
          margin: '2px 8px 2px 0',
          paddingLeft: 20,
          transition: 'background-color 0.15s ease, color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: '#fff',
          },
          '&.RaMenuItemLink-active': {
            backgroundColor: colors.sidebarBgActive,
            borderLeft: `3px solid ${colors.primary}`,
            color: '#fff',
            fontWeight: 600,
          },
        },
      },
    },
  },
});
