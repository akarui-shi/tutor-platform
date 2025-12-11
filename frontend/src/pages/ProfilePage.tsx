import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useAppSelector } from '../hooks/redux';

const ProfilePage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Профиль
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ width: 64, height: 64 }}>
                        {user?.firstName?.[0] || 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">
                            {user ? `${user.firstName} ${user.lastName}` : 'Гость'}
                        </Typography>
                        <Typography color="textSecondary">
                            {user?.role || 'Роль не указана'}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Имя"
                            value={user?.firstName || ''}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Фамилия"
                            value={user?.lastName || ''}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Email"
                            value={user?.email || ''}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="contained" disabled>
                        Изменить данные (скоро)
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;






