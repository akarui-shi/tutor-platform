import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Box,
    Typography,
    Button,
    Alert,
} from '@mui/material';
import {
    Visibility,
    Edit,
    PlayArrow,
    Cancel,
    CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid, addMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLessons, cancelLesson } from '../store/slices/lessonSlice';

const LessonList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { lessons, loading, error } = useAppSelector((state) => state.lessons);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchLessons(undefined))
            .unwrap()
            .catch((err) => {
                console.error('Error fetching lessons:', err);
                setRenderError(err.toString());
            });
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'primary';
            case 'IN_PROGRESS':
                return 'warning';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'Запланирован';
            case 'IN_PROGRESS':
                return 'В процессе';
            case 'COMPLETED':
                return 'Завершен';
            case 'CANCELLED':
                return 'Отменен';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Дата не указана';

        try {
            const date = parseISO(dateString);

            if (!isValid(date)) {
                console.error('Invalid date:', dateString);
                return 'Неверная дата';
            }

            return format(date, 'dd MMMM yyyy', { locale: ru });
        } catch (e) {
            console.error('Date format error:', e, dateString);
            return 'Ошибка форматирования';
        }
    };

    const formatTime = (dateString: string | null | undefined) => {
        if (!dateString) return '--:--';

        try {
            const date = parseISO(dateString);

            if (!isValid(date)) {
                console.error('Invalid time:', dateString);
                return '--:--';
            }

            return format(date, 'HH:mm', { locale: ru });
        } catch (e) {
            console.error('Time format error:', e, dateString);
            return '--:--';
        }
    };

    const calculateEndTime = (scheduledTime: string, durationMinutes: number) => {
        try {
            const startDate = parseISO(scheduledTime);
            if (!isValid(startDate)) return '--:--';

            const endDate = addMinutes(startDate, durationMinutes);
            return format(endDate, 'HH:mm', { locale: ru });
        } catch (e) {
            console.error('End time calculation error:', e);
            return '--:--';
        }
    };

    const handleView = (id: number) => {
        navigate(`/lessons/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/lessons/${id}/edit`);
    };

    const handleStart = async (id: number) => {
        try {
            console.log('Start lesson:', id);
        } catch (error) {
            console.error('Error starting lesson:', error);
        }
    };

    const handleCancel = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите отменить урок?')) {
            await dispatch(cancelLesson({ id, reason: 'Отменено пользователем' }));
        }
    };

    const handleComplete = async (id: number) => {
        console.log('Complete lesson:', id);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <Typography>Загрузка уроков...</Typography>
            </Box>
        );
    }

    if (error || renderError) {
        return (
            <Box textAlign="center" py={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Ошибка загрузки уроков
                    </Typography>
                    <Typography variant="body2">
                        {error || renderError}
                    </Typography>
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => {
                        setRenderError(null);
                        dispatch(fetchLessons(undefined));
                    }}
                >
                    Попробовать снова
                </Button>
            </Box>
        );
    }

    if (!lessons || lessons.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" gutterBottom>
                    Уроки не найдены
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/lessons/create')}
                >
                    Создать первый урок
                </Button>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Предмет</TableCell>
                        <TableCell>Дата и время</TableCell>
                        <TableCell>Длительность</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Оплата</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lessons.map((lesson) => {
                        try {
                            return (
                                <TableRow key={lesson.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {lesson.subject || `Предмет #${lesson.subjectId}`}
                                        </Typography>
                                        {lesson.description && (
                                            <Typography variant="caption" color="textSecondary">
                                                {lesson.description.substring(0, 50)}
                                                {lesson.description.length > 50 ? '...' : ''}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {formatDate(lesson.scheduledTime)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {formatTime(lesson.scheduledTime)} - {calculateEndTime(lesson.scheduledTime, lesson.durationMinutes)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{lesson.durationMinutes || 0} мин</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(lesson.status)}
                                            color={getStatusColor(lesson.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold">
                                            {(lesson.price || 0).toLocaleString('ru-RU')} ₽
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={lesson.paymentStatus === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                                            color={lesson.paymentStatus === 'PAID' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Просмотр">
                                            <IconButton size="small" onClick={() => handleView(lesson.id)}>
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>

                                        {lesson.status === 'SCHEDULED' && (
                                            <>
                                                <Tooltip title="Редактировать">
                                                    <IconButton size="small" onClick={() => handleEdit(lesson.id)}>
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Начать урок">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleStart(lesson.id)}
                                                    >
                                                        <PlayArrow />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Отменить">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleCancel(lesson.id)}
                                                    >
                                                        <Cancel />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}

                                        {lesson.status === 'IN_PROGRESS' && (
                                            <Tooltip title="Завершить урок">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleComplete(lesson.id)}
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        } catch (rowError) {
                            console.error('Error rendering lesson row:', lesson, rowError);
                            return (
                                <TableRow key={lesson.id}>
                                    <TableCell colSpan={7}>
                                        <Alert severity="error">
                                            Ошибка отображения урока ID: {lesson.id}
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            );
                        }
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LessonList;
