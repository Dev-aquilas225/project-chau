import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from './hooks';
import { formatDate } from '@/lib/format';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (id: string, link: string | null, read: boolean) => {
    if (!read) markRead.mutate(id);
    setAnchorEl(null);
    if (link) navigate(link);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 440 } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllRead.mutate()}>
              Tout marquer comme lu
            </Button>
          )}
        </Box>
        <Divider />
        <List dense sx={{ py: 0 }}>
          {notifications.length === 0 && (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucune notification
              </Typography>
            </Box>
          )}
          {notifications.map((n) => (
            <ListItemButton
              key={n.id}
              onClick={() => handleClick(n.id, n.link, n.read)}
              sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', alignItems: 'flex-start', py: 1 }}
            >
              <ListItemText
                primary={n.title}
                secondary={
                  <>
                    <Typography variant="body2" component="span" display="block" color="text.secondary">
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(n.createdAt)}
                    </Typography>
                  </>
                }
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Menu>
    </>
  );
}
