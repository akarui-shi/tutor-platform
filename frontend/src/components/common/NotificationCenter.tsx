import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Badge,
    Popover,
    Typography,
    Box,
    Button,
} from '@mui/material';
import {
    Notifications,
    School,
    Payment,
    Schedule,
    Close,
    MarkEmailRead,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { markAsRead, clearAll } from '../../store/slices/notificationSlice';

const NotificationCenter: React.FC = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'LESSON_CREATED':
            case 'LESSON_UPDATED':
            case 'LESSON_CANCELLED':
                return <School />;
            case 'PAYMENT_SUCCESS':
                return <Payment />;
            case 'REMINDER':
                return <Schedule />;
            default:
                return <Notifications />;
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ width: 360, maxHeight: 400 }}>
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">Уведомления</Typography>
                        <Box>
                            {unreadCount > 0 && (
                                <Button
                                    size="small"
                                    startIcon={<MarkEmailRead />}
                                    onClick={() => notifications.forEach(n => !n.read && dispatch(markAsRead(n.id)))}
                                >
                                    Прочитать все
                                </Button>
                            )}
                            <IconButton size="small" onClick={handleClose}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary="Нет уведомлений"
                                    secondary="Здесь будут появляться новые уведомления"
                                />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
                                    sx={{
                                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                                        borderLeft: notification.read ? 'none' : '4px solid',
                                        borderColor: 'primary.main',
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => dispatch(markAsRead(notification.id))}
                                        >
                                            <Close />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {getNotificationIcon(notification.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={notification.title}
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {notification.message}
                                                </Typography>
                                                <br />
                                                <Typography variant="caption" color="textSecondary">
                                                    {format(new Date(notification.createdAt), 'dd MMM HH:mm', { locale: ru })}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>

                    {notifications.length > 0 && (
                        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                            <Button size="small" onClick={() => dispatch(clearAll())}>
                                Очистить все
                            </Button>
                        </Box>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationCenter;