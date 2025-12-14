import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
    Visibility,
    Edit,
    PlayArrow,
    Cancel,
    CheckCircle,
    AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLessons, cancelLesson } from '../../store/slices/lessonSlice';

const LessonList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { lessons, loading } = useAppSelector((state) => state.lessons);

    useEffect(() => {
        dispatch(fetchLessons(undefined));
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

    const handleView = (id: number) => {
        navigate(`/lessons/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/lessons/${id}/edit`);
    };

    const handleStart = async (id: number) => {
        try {
            // Логика для начала урока
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
        // Логика для завершения урока
        console.log('Complete lesson:', id);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <Typography>Загрузка уроков...</Typography>
            </Box>
        );
    }

    if (lessons.length === 0) {
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
                    {lessons.map((lesson) => (
                        <TableRow key={lesson.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2">{lesson.subject}</Typography>
                                {lesson.description && (
                                    <Typography variant="caption" color="textSecondary">
                                        {lesson.description.substring(0, 50)}...
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Typography>
                                    {lesson.startTime && format(new Date(lesson.startTime), 'dd MMMM yyyy', { locale: ru })}
                                    {lesson.scheduledTime && !lesson.startTime && format(new Date(lesson.scheduledTime), 'dd MMMM yyyy', { locale: ru })}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {format(new Date(lesson.startTime || lesson.scheduledTime), 'HH:mm', { locale: ru })} -{' '}
                                    {lesson.endTime
                                        ? format(new Date(lesson.endTime), 'HH:mm', { locale: ru })
                                        : format(new Date(new Date(lesson.scheduledTime).getTime() + lesson.durationMinutes * 60000), 'HH:mm', { locale: ru })
                                    }
                                </Typography>
                            </TableCell>
                            <TableCell>{lesson.duration} мин</TableCell>
                            <TableCell>
                                <Chip
                                    label={getStatusLabel(lesson.status)}
                                    color={getStatusColor(lesson.status) as any}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Typography fontWeight="bold">
                                    {lesson.price.toLocaleString('ru-RU')} ₽
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
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LessonList;