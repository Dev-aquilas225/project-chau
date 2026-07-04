import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { AppBar as RaAppBar, TitlePortal, useTranslate } from 'react-admin';
import { colors } from '../theme/tokens';

export function AppBar() {
  const translate = useTranslate();

  return (
    <RaAppBar color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <TitlePortal />
      <TextField
        size="small"
        placeholder={translate('app.appBar.search')}
        sx={{ ml: 2, flex: 1, maxWidth: 420, display: { xs: 'none', sm: 'block' } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Box sx={{ flex: 1 }} />
      <IconButton>
        <Badge color="error" variant="dot">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600, mx: 2 }}>
        {translate('app.appBar.adminConsole')}
      </Typography>
    </RaAppBar>
  );
}
