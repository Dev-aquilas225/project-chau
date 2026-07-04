import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { MenuItemLink, useGetIdentity, useLogout, useTranslate } from 'react-admin';
import { colors } from '../theme/tokens';

// ===== CONSTANTES =====

const MENU_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: DashboardIcon },
  { to: '/products', label: 'Produits', icon: Inventory2Icon },
  { to: '/stock', label: 'Stock', icon: WarehouseIcon },
  { to: '/orders', label: 'Commandes', icon: ShoppingCartIcon },
  { to: '/sellers', label: 'Vendeurs', icon: StorefrontIcon },
  { to: '/users', label: 'Utilisateurs', icon: PeopleIcon },
  { to: '/promotions', label: 'Promotions', icon: LocalOfferIcon },
  { to: '/payments', label: 'Paiements', icon: PaymentIcon },
  { to: '/config', label: 'Configuration', icon: SettingsIcon },
];

// ===== COMPOSANTS =====

function MenuHeader() {
  const translate = useTranslate();

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, py: 3 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          flexShrink: 0,
        }}
      >
        <StorefrontIcon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} color="inherit" lineHeight={1.2}>
          {translate('app.sidebar.title')}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.sidebarText }}>
          {translate('app.sidebar.subtitle')}
        </Typography>
      </Box>
    </Stack>
  );
}

function MenuNavigation() {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
      {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
        <MenuItemLink
          key={to}
          to={to}
          primaryText={label}
          leftIcon={<Icon />}
        />
      ))}
    </Box>
  );
}

function UserProfile() {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        }}
        onClick={handleOpen}
      >
        <Avatar
          src={identity?.avatar}
          sx={{ width: 36, height: 36, bgcolor: colors.primary }}
        >
          {identity?.fullName?.[0] ?? 'A'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap color="inherit" fontWeight={600}>
            {identity?.fullName ?? translate('app.sidebar.adminUser')}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.sidebarText }}>
            {translate('app.sidebar.superAdmin')}
          </Typography>
        </Box>
      </Box>

      <UserMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      />
    </>
  );
}

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

function UserMenu({ anchorEl, open, onClose }: UserMenuProps) {
  const translate = useTranslate();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <MuiMenu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={handleLogout}>
        <IconButton size="small" sx={{ mr: 1 }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
        {translate('app.sidebar.logout')}
      </MenuItem>
    </MuiMenu>
  );
}

// ===== COMPOSANT PRINCIPAL =====

export function Menu() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: colors.sidebarBg,
        color: '#fff',
        width: 240,
      }}
    >
      <MenuHeader />
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <MenuNavigation />
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <UserProfile />
    </Box>
  );
}