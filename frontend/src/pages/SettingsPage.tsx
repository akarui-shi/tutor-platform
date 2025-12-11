import React, { useState } from 'react';
import { Container, FormControlLabel, Paper, Switch, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Настройки
            </Typography>
            <Paper sx={{ p: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                        />
                    }
                    label="Темная тема (демо)"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                        />
                    }
                    label="Уведомления"
                />
            </Paper>
        </Container>
    );
};

export default SettingsPage;






