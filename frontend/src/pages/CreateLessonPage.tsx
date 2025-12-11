import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LessonForm from '../components/lessons/LessonForm';

const CreateLessonPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const presetTimes = (location.state as any) || {};

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Создание урока
                </Typography>
                <LessonForm
                    initialData={presetTimes}
                    onSubmitSuccess={() => navigate('/lessons')}
                />
            </Paper>
        </Container>
    );
};

export default CreateLessonPage;






