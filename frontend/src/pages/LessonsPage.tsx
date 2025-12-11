import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LessonList from '../components/lessons/LessonList';

const LessonsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Мои уроки</Typography>
                <Button variant="contained" onClick={() => navigate('/lessons/create')}>
                    Создать урок
                </Button>
            </Box>
            <LessonList />
        </Box>
    );
};

export default LessonsPage;






