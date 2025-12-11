import React, { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import api from '../../services/api';

interface PaymentFormProps {
    lessonId: number;
    amount: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ lessonId, amount, onSuccess, onCancel }) => {
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cvc, setCvc] = useState('');
    const [expiry, setExpiry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.payments.create(lessonId, amount);
            onSuccess?.();
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Не удалось обработать платеж');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
                <Typography>Сумма к оплате: {amount.toLocaleString('ru-RU')} ₽</Typography>

                <TextField
                    label="Держатель карты"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Номер карты"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    inputProps={{ maxLength: 19 }}
                    fullWidth
                />
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        required
                        inputProps={{ maxLength: 4 }}
                        fullWidth
                    />
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    {onCancel && (
                        <Button variant="outlined" onClick={onCancel} disabled={loading}>
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Обработка...' : 'Оплатить'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default PaymentForm;






