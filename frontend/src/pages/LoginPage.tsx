import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login, clearError } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await dispatch(login({ email, password }));
        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    // Убираем useEffect, чтобы избежать циклов
    // Редирект будет происходить только после успешного логина через handleSubmit

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Вход в систему
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Используйте учетные данные, чтобы продолжить.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                        />

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Входим...' : 'Войти'}
                        </Button>
                        <Button component={RouterLink} to="/register">
                            Нет аккаунта? Зарегистрироваться
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;






