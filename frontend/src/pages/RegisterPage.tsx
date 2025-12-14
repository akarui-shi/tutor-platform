import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { register, clearError } from '../store/slices/authSlice';

const RegisterPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STUDENT', // По умолчанию - студент
    });

    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleRoleChange = (event: any) => {
        setForm((prev) => ({ ...prev, role: event.target.value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await dispatch(register(form));
        if (register.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Регистрация
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Создайте новый аккаунт на платформе.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Имя"
                                    value={form.firstName}
                                    onChange={handleChange('firstName')}
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Фамилия"
                                    value={form.lastName}
                                    onChange={handleChange('lastName')}
                                    required
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={handleChange('email')}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={form.password}
                            onChange={handleChange('password')}
                            required
                            fullWidth
                        />

                        {/* НОВОЕ ПОЛЕ - Выбор роли */}
                        <FormControl fullWidth required>
                            <InputLabel>Роль</InputLabel>
                            <Select
                                value={form.role}
                                label="Роль"
                                onChange={handleRoleChange}
                            >
                                <MenuItem value="STUDENT">Студент</MenuItem>
                                <MenuItem value="TUTOR">Преподаватель</MenuItem>
                            </Select>
                        </FormControl>

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Создаем...' : 'Зарегистрироваться'}
                        </Button>
                        <Button component={RouterLink} to="/login">
                            Уже есть аккаунт? Войти
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;
