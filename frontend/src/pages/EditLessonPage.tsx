import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, LinearProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import LessonForm from '../components/lessons/LessonForm';
import api from '../services/api';
import { Lesson } from '../types';

const EditLessonPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                if (id) {
                    const response = await api.lessons.getById(parseInt(id, 10));
                    setLesson(response.data.data);
                }
            } catch (e: any) {
                setError(e?.response?.data?.message || 'Не удалось загрузить урок');
            }
        };
        load();
    }, [id]);

    if (!lesson) {
        return (
            <Container maxWidth="md">
                {error ? <Alert severity="error">{error}</Alert> : <LinearProgress />}
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Редактирование урока
                </Typography>
                <LessonForm
                    initialData={lesson}
                    lessonId={lesson.id}
                    onSubmitSuccess={() => navigate(`/lessons/${lesson.id}`)}
                />
            </Paper>
        </Container>
    );
};

export default EditLessonPage;






