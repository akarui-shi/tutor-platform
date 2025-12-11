import React, { useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLessons } from '../store/slices/lessonSlice';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { lessons } = useAppSelector((state) => state.lessons);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchLessons(undefined));
    }, [dispatch]);

    const scheduled = lessons.filter((l) => l.status === 'SCHEDULED').length;
    const completed = lessons.filter((l) => l.status === 'COMPLETED').length;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <div>
                    <Typography variant="h4" gutterBottom>
                        Привет, {user?.firstName || 'друг'}!
                    </Typography>
                    <Typography color="textSecondary">
                        Вот краткая сводка по вашим урокам.
                    </Typography>
                </div>
                <Button variant="contained" onClick={() => navigate('/lessons/create')}>
                    Создать урок
                </Button>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Всего уроков</Typography>
                            <Typography variant="h4">{lessons.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Запланировано</Typography>
                            <Typography variant="h4">{scheduled}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Завершено</Typography>
                            <Typography variant="h4">{completed}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;

