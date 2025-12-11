import React from 'react';
import { Container, Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useAppSelector } from '../hooks/redux';

const PaymentsPage: React.FC = () => {
    const { lessons } = useAppSelector((state) => state.lessons);
    const payments = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.subject,
        amount: lesson.price,
        status: lesson.paymentStatus,
    }));

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Платежи
            </Typography>
            <Paper>
                <List>
                    {payments.map((payment) => (
                        <ListItem key={payment.id} divider>
                            <ListItemText
                                primary={payment.title}
                                secondary={`Сумма: ${payment.amount.toLocaleString('ru-RU')} ₽`}
                            />
                            <Chip
                                label={payment.status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                                color={payment.status === 'PAID' ? 'success' : 'warning'}
                            />
                        </ListItem>
                    ))}
                    {payments.length === 0 && (
                        <ListItem>
                            <ListItemText primary="Нет платежей" />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default PaymentsPage;






