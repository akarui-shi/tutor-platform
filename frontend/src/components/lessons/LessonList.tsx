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
    Avatar,
} from '@mui/material';
import {
    Visibility,
    Edit,
    PlayArrow,
    Cancel,
    CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLessons, cancelLesson } from '../../store/slices/lessonSlice';
import api from '../../services/api';

const LessonList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { lessons, loading } = useAppSelector((state) => state.lessons);
    const { user } = useAppSelector((state) => state.auth);

    const [tutorsMap, setTutorsMap] = useState<Record<number, any>>({});
    const [studentsMap, setStudentsMap] = useState<Record<number, any>>({});

    useEffect(() => {
        dispatch(fetchLessons(undefined));
    }, [dispatch]);

    // Загружаем информацию о репетиторах и студентах
    useEffect(() => {
        const fetchUsers = async () => {
            if (lessons.length === 0) return;

            try {
                // Получаем уникальные ID репетиторов и студентов
                const tutorIds = [...new Set(lessons.map(l => l.tutorId))];
                const studentIds = [...new Set(lessons.map(l => l.studentId))];

                // Загружаем репетиторов
                const tutorsData: Record<number, any> = {};
                for (const id of tutorIds) {
                    try {
                        const response = await api.users.getById(id);
                        tutorsData[id] = response.data.data;
                    } catch (error) {
                        console.error(`Error fetching tutor ${id}:`, error);
                    }
                }
                setTutorsMap(tutorsData);

                // Загружаем студентов
                const studentsData: Record<number, any> = {};
                for (const id of studentIds) {
                    try {
                        const response = await api.users.getById(id);
                        studentsData[id] = response.data.data;
                    } catch (error) {
                        console.error(`Error fetching student ${id}:`, error);
                    }
                }
                setStudentsMap(studentsData);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [lessons]);

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

    const getSubjectName = (subjectId: number): string => {
        const subjectMap: Record<number, string> = {
            1: 'Математика',
            2: 'Физика',
            3: 'Химия',
            4: 'Информатика',
            5: 'Английский язык',
            6: 'Русский язык',
            7: 'История',
            8: 'Биология',
        };
        return subjectMap[subjectId] || `Предмет #${subjectId}`;
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
                    {lessons.map((lesson) => {
                        const tutor = tutorsMap[lesson.tutorId];
                        const student = studentsMap[lesson.studentId];
                        const isStudent = user?.role === 'STUDENT';

                        return (
                            <TableRow key={lesson.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                            {isStudent ? tutor?.firstName?.[0] : student?.firstName?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {getSubjectName(lesson.subjectId)}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {isStudent
                                                    ? `с ${tutor?.firstName || ''} ${tutor?.lastName || ''}`
                                                    : `для ${student?.firstName || ''} ${student?.lastName || ''}`
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {format(new Date(lesson.scheduledTime), 'dd MMMM yyyy', { locale: ru })}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {format(new Date(lesson.scheduledTime), 'HH:mm', { locale: ru })} -{' '}
                                        {format(
                                            new Date(new Date(lesson.scheduledTime).getTime() + lesson.durationMinutes * 60000),
                                            'HH:mm',
                                            { locale: ru }
                                        )}
                                    </Typography>
                                </TableCell>
                                <TableCell>{lesson.durationMinutes} мин</TableCell>
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
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LessonList;