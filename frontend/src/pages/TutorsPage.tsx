import React, { useEffect } from 'react';
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
    Typography,
    LinearProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTutors } from '../store/slices/userSlice';

const TutorsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { tutors, loading } = useAppSelector((state) => state.users);

    useEffect(() => {
        dispatch(fetchTutors());
    }, [dispatch]);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Репетиторы
            </Typography>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <Grid container spacing={2}>
                {tutors.map((tutor) => (
                    <Grid item xs={12} sm={6} md={4} key={tutor.id}>
                        <Card>
                            <CardHeader
                                avatar={<Avatar>{tutor.firstName?.[0]}</Avatar>}
                                title={`${tutor.firstName} ${tutor.lastName}`}
                                subheader={tutor.email}
                            />
                            <CardContent>
                                <Typography variant="body2" gutterBottom>
                                    {tutor.bio || 'Нет описания'}
                                </Typography>
                                <Chip
                                    label={`Ставка: ${tutor.hourlyRate || 0} ₽/час`}
                                    size="small"
                                    sx={{ mr: 1, mt: 1 }}
                                />
                                {tutor.subjects?.map((subject) => (
                                    <Chip key={subject} label={subject} size="small" sx={{ mr: 1, mt: 1 }} />
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default TutorsPage;






