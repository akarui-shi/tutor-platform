import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Chip,
    Button,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Alert,
    Card,
    CardContent,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    AccessTime,
    Person,
    Subject,
    AttachMoney,
    Description,
    VideoCall,
    Download,
    Edit,
    Cancel,
    CheckCircle,
    ArrowBack,
    Payment,
    Schedule,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setCurrentLesson, completeLesson, cancelLesson } from '../store/slices/lessonSlice';
import api from '../services/api';
import PaymentForm from '../components/payment/PaymentForm';

const LessonDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currentLesson } = useAppSelector((state) => state.lessons);
    const { user } = useAppSelector((state) => state.auth);
    const [tutor, setTutor] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [joinUrl, setJoinUrl] = useState<string>('');
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

    useEffect(() => {
        const fetchLessonDetails = async () => {
            try {
                if (id) {
                    const response = await api.lessons.getById(parseInt(id));
                    dispatch(setCurrentLesson(response.data.data));

                    // Загружаем информацию о репетиторе и студенте
                    if (response.data.data.tutorId) {
                        const tutorResponse = await api.users.getById(response.data.data.tutorId);
                        setTutor(tutorResponse.data.data);
                    }

                    if (response.data.data.studentId) {
                        const studentResponse = await api.users.getById(response.data.data.studentId);
                        setStudent(studentResponse.data.data);
                    }

                    // Получаем ссылку для подключения
                    if (response.data.data.status === 'IN_PROGRESS' || response.data.data.status === 'SCHEDULED') {
                        const joinResponse = await api.lessons.getJoinUrl(parseInt(id));
                        setJoinUrl(joinResponse.data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching lesson details:', error);
            }
        };

        fetchLessonDetails();

        return () => {
            dispatch(setCurrentLesson(null));
        };
    }, [id, dispatch]);

    const handleCompleteLesson = async () => {
        if (currentLesson && window.confirm('Вы уверены, что хотите завершить урок?')) {
            await dispatch(completeLesson(currentLesson.id));
        }
    };

    const handleCancelLesson = async () => {
        if (currentLesson) {
            await dispatch(cancelLesson({ id: currentLesson.id, reason: cancelReason }));
            setOpenCancelDialog(false);
            setCancelReason('');
        }
    };

    const handleJoinLesson = () => {
        if (joinUrl) {
            window.open(joinUrl, '_blank');
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return { color: 'primary', label: 'Запланирован', icon: <Schedule /> };
            case 'IN_PROGRESS':
                return { color: 'warning', label: 'В процессе', icon: <AccessTime /> };
            case 'COMPLETED':
                return { color: 'success', label: 'Завершен', icon: <CheckCircle /> };
            case 'CANCELLED':
                return { color: 'error', label: 'Отменен', icon: <Cancel /> };
            default:
                return { color: 'default', label: status, icon: null };
        }
    };

    const getPaymentStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { color: 'success', label: 'Оплачено' };
            case 'PENDING':
                return { color: 'warning', label: 'Ожидает оплаты' };
            case 'REFUNDED':
                return { color: 'error', label: 'Возврат' };
            default:
                return { color: 'default', label: status };
        }
    };

    if (!currentLesson) {
        return (
            <Container>
                <LinearProgress />
            </Container>
        );
    }

    const statusInfo = getStatusInfo(currentLesson.status);
    const paymentStatusInfo = getPaymentStatusInfo(currentLesson.paymentStatus);
    const canEdit = user?.role === 'ADMIN' ||
        (user?.id === currentLesson.studentId && currentLesson.status === 'SCHEDULED') ||
        (user?.id === currentLesson.tutorId && currentLesson.status === 'SCHEDULED');

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Назад
            </Button>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {currentLesson.subject}
                                </Typography>
                                <Box display="flex" gap={1} alignItems="center" mb={2}>
                                        <Chip
                                            icon={statusInfo.icon || undefined}
                                            label={statusInfo.label}
                                            color={statusInfo.color as any}
                                            size="small"
                                        />
                                    <Chip
                                        label={paymentStatusInfo.label}
                                        color={paymentStatusInfo.color as any}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            {canEdit && (
                                <Box>
                                    <Button
                                        startIcon={<Edit />}
                                        onClick={() => navigate(`/lessons/${id}/edit`)}
                                        sx={{ mr: 1 }}
                                    >
                                        Редактировать
                                    </Button>
                                    {currentLesson.status === 'SCHEDULED' && (
                                        <Button
                                            startIcon={<Cancel />}
                                            color="error"
                                            onClick={() => setOpenCancelDialog(true)}
                                        >
                                            Отменить
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AccessTime />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Дата и время"
                                            secondary={
                                                <>
                                                    <Typography variant="body2">
                                                        {format(new Date(currentLesson.startTime), 'dd MMMM yyyy', { locale: ru })}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {format(new Date(currentLesson.startTime), 'HH:mm', { locale: ru })} -{' '}
                                                        {format(new Date(currentLesson.endTime), 'HH:mm', { locale: ru })}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>

                                    <ListItem>
                                        <ListItemIcon>
                                            <Schedule />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Длительность"
                                            secondary={`${currentLesson.duration} минут`}
                                        />
                                    </ListItem>

                                    <ListItem>
                                        <ListItemIcon>
                                            <AttachMoney />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Стоимость"
                                            secondary={`${currentLesson.price.toLocaleString('ru-RU')} ₽`}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Person />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Репетитор"
                                            secondary={
                                                tutor ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 24, height: 24 }}>
                                                            {tutor.firstName?.[0]}
                                                        </Avatar>
                                                        <Typography>
                                                            {tutor.firstName} {tutor.lastName}
                                                        </Typography>
                                                    </Box>
                                                ) : 'Загрузка...'
                                            }
                                        />
                                    </ListItem>

                                    <ListItem>
                                        <ListItemIcon>
                                            <Person />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Студент"
                                            secondary={
                                                student ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 24, height: 24 }}>
                                                            {student.firstName?.[0]}
                                                        </Avatar>
                                                        <Typography>
                                                            {student.firstName} {student.lastName}
                                                        </Typography>
                                                    </Box>
                                                ) : 'Загрузка...'
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>

                        {currentLesson.description && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        Описание урока
                                    </Typography>
                                    <Typography paragraph>
                                        {currentLesson.description}
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {currentLesson.materials && currentLesson.materials.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Материалы урока
                                    </Typography>
                                    <List>
                                        {currentLesson.materials.map((material, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Download />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={material.split('/').pop()}
                                                    secondary="Файл для скачивания"
                                                />
                                                <Button
                                                    size="small"
                                                    href={material}
                                                    target="_blank"
                                                    download
                                                >
                                                    Скачать
                                                </Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" gap={2} justifyContent="space-between">
                            {currentLesson.status === 'SCHEDULED' && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<VideoCall />}
                                        onClick={handleJoinLesson}
                                        disabled={!joinUrl}
                                    >
                                        Присоединиться к уроку
                                    </Button>

                                    {currentLesson.paymentStatus !== 'PAID' && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<Payment />}
                                            onClick={() => setOpenPaymentDialog(true)}
                                        >
                                            Оплатить урок
                                        </Button>
                                    )}
                                </>
                            )}

                            {currentLesson.status === 'IN_PROGRESS' && user?.id === currentLesson.tutorId && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={handleCompleteLesson}
                                >
                                    Завершить урок
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Действия
                            </Typography>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<VideoCall />}
                                onClick={handleJoinLesson}
                                disabled={!joinUrl}
                                sx={{ mb: 1 }}
                            >
                                Присоединиться к уроку
                            </Button>

                            {currentLesson.paymentStatus !== 'PAID' && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    startIcon={<Payment />}
                                    onClick={() => setOpenPaymentDialog(true)}
                                    sx={{ mb: 1 }}
                                >
                                    Оплатить урок
                                </Button>
                            )}

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => navigate(`/lessons/${id}/materials`)}
                                sx={{ mb: 1 }}
                            >
                                Материалы урока
                            </Button>

                            {canEdit && (
                                <>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={() => navigate(`/lessons/${id}/edit`)}
                                        sx={{ mb: 1 }}
                                    >
                                        Редактировать
                                    </Button>

                                    {currentLesson.status === 'SCHEDULED' && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Cancel />}
                                            onClick={() => setOpenCancelDialog(true)}
                                        >
                                            Отменить урок
                                        </Button>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {currentLesson.paymentStatus !== 'PAID' && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Урок не оплачен. Оплатите урок для подтверждения бронирования.
                        </Alert>
                    )}

                    {currentLesson.status === 'CANCELLED' && (
                        <Alert severity="error">
                            Урок отменен. {currentLesson.updatedAt && (
                            <Typography variant="caption" display="block">
                                Отменен: {format(new Date(currentLesson.updatedAt), 'dd.MM.yyyy HH:mm')}
                            </Typography>
                        )}
                        </Alert>
                    )}
                </Grid>
            </Grid>

            {/* Диалог отмены урока */}
            <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
                <DialogTitle>Отмена урока</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Вы уверены, что хотите отменить урок? Это действие нельзя отменить.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Причина отмены (необязательно)"
                        multiline
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCancelDialog(false)}>Отмена</Button>
                    <Button
                        onClick={handleCancelLesson}
                        color="error"
                        variant="contained"
                    >
                        Отменить урок
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог оплаты */}
            <Dialog
                open={openPaymentDialog}
                onClose={() => setOpenPaymentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Оплата урока</DialogTitle>
                <DialogContent>
                    <PaymentForm
                        lessonId={currentLesson.id}
                        amount={currentLesson.price}
                        onSuccess={() => {
                            setOpenPaymentDialog(false);
                            window.location.reload();
                        }}
                        onCancel={() => setOpenPaymentDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default LessonDetailsPage;