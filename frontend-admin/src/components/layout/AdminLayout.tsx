import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/features/auth/AuthProvider';
import { logout } from '@/features/auth/api';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Produits', to: '/produits', icon: <Inventory2OutlinedIcon /> },
  { label: 'Catégories', to: '/categories', icon: <CategoryOutlinedIcon /> },
  { label: 'Commandes', to: '/commandes', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Utilisateurs', to: '/utilisateurs', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Codes promo', to: '/codes-promo', icon: <LocalOfferOutlinedIcon /> },
  { label: 'Vendeurs', to: '/vendeurs', icon: <StorefrontOutlinedIcon /> },
  { label: 'Paramètres', to: '/parametres', icon: <SettingsOutlinedIcon /> },
];

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Aquilas
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: 'rgba(255,255,255,0.75)',
              '&.active': {
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default function AdminLayout(): ReactNode {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        <DrawerContent />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <DrawerContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ width: '100%' }}>
          <Toolbar sx={{ gap: 2 }}>
            <IconButton
              edge="start"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {user?.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, bgcolor: 'background.default', p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
