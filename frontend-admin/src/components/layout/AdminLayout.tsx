import { useMemo, useState, type ReactNode } from 'react';
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
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePermission } from '@/features/auth/usePermission';
import { logout } from '@/features/auth/api';
import NotificationBell from '@/features/notifications/NotificationBell';
import { resolveImageUrl } from '@/lib/media';
import type { ResourceKey } from '@/types';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  resource?: ResourceKey;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Produits', to: '/produits', icon: <Inventory2OutlinedIcon />, resource: 'products' },
  { label: 'Catégories', to: '/categories', icon: <CategoryOutlinedIcon />, resource: 'categories' },
  { label: 'Commandes', to: '/commandes', icon: <ReceiptLongOutlinedIcon />, resource: 'orders' },
  { label: 'Utilisateurs', to: '/utilisateurs', icon: <PeopleAltOutlinedIcon />, resource: 'users' },
  { label: 'Codes promo', to: '/codes-promo', icon: <LocalOfferOutlinedIcon />, resource: 'promoCodes' },
  { label: 'Vendeurs', to: '/vendeurs', icon: <StorefrontOutlinedIcon />, resource: 'sellers' },
  { label: 'Paramètres', to: '/parametres', icon: <SettingsOutlinedIcon />, resource: 'platformConfig' },
  { label: 'Retraits', to: '/retraits', icon: <AccountBalanceWalletOutlinedIcon />, adminOnly: true },
  { label: 'Rôles', to: '/roles', icon: <AdminPanelSettingsOutlinedIcon />, adminOnly: true },
];

function useVisibleNavItems(): NavItem[] {
  const { role } = useAuth();
  // Les hooks de permission doivent être appelés inconditionnellement : on les calcule tous, puis on filtre.
  const products = usePermission('products');
  const categories = usePermission('categories');
  const orders = usePermission('orders');
  const users = usePermission('users');
  const promoCodes = usePermission('promoCodes');
  const sellers = usePermission('sellers');
  const platformConfig = usePermission('platformConfig');
  const grants: Record<ResourceKey, string[]> = { products, categories, orders, users, promoCodes, sellers, platformConfig };

  return useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.adminOnly) return role === 'admin';
        if (!item.resource) return true;
        return grants[item.resource].length > 0;
      }),
    [role, products, categories, orders, users, promoCodes, sellers, platformConfig],
  );
}

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  const items = useVisibleNavItems();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box component="img" src="/logo-mark.png" alt="PJ International" sx={{ height: 44, width: 'auto' }} />
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {items.map((item) => (
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
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton
              edge="start"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <NotificationBell />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar
                src={user?.photoURL ? resolveImageUrl(user.photoURL) : undefined}
                sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}
              >
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
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profil'); }}>
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                Mon profil
              </MenuItem>
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
