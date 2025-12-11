import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h2" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Страница не найдена
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
                Похоже, вы ищете то, чего нет. Вернитесь на главную.
            </Typography>
            <Box>
                <Button variant="contained" onClick={() => navigate('/')}>
                    На главную
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;






