import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Paper,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    CircularProgress,
    Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createLesson, updateLesson } from '../../store/slices/lessonSlice';
import api from '../../services/api';
import { CreateLessonRequest } from '../../types';

const lessonSchema = z.object({
    tutorId: z.number().min(1, 'Выберите репетитора'),
    subject: z.string().min(2, 'Предмет обязателен').max(100),
    description: z.string().max(500).optional(),
    startTime: z.string().min(1, 'Время начала обязательно'),
    endTime: z.string().min(1, 'Время окончания обязательно'),
    price: z.number().min(100, 'Минимальная цена 100 руб').max(10000),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormProps {
    initialData?: Partial<LessonFormData>;
    lessonId?: number;
    onSubmitSuccess?: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({
                                                   initialData,
                                                   lessonId,
                                                   onSubmitSuccess,
                                               }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { loading, error } = useAppSelector((state) => state.lessons);

    const [tutors, setTutors] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<LessonFormData>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            tutorId: initialData?.tutorId || 0,
            subject: initialData?.subject || '',
            description: initialData?.description || '',
            startTime: initialData?.startTime || format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
            endTime: initialData?.endTime || format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm"),
            price: initialData?.price || 1000,
        },
    });

    const startTime = watch('startTime');
    const selectedTutorId = watch('tutorId');

    // Обновляем доступные предметы при выборе репетитора
    useEffect(() => {
        if (selectedTutorId) {
            const selectedTutor = tutors.find(t => t.id === selectedTutorId);
            if (selectedTutor && selectedTutor.subjects) {
                // Разбиваем строку предметов на массив
                const subjects = selectedTutor.subjects
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s.length > 0);
                setAvailableSubjects(subjects);

                // Автоматически выбираем первый предмет, если текущий не входит в список
                const currentSubject = watch('subject');
                if (!subjects.includes(currentSubject)) {
                    setValue('subject', subjects[0] || '');
                }
            } else {
                setAvailableSubjects([]);
            }
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedTutorId, tutors, setValue, watch]);

    useEffect(() => {
        if (startTime) {
            const endTime = format(addHours(new Date(startTime), 1), "yyyy-MM-dd'T'HH:mm");
            setValue('endTime', endTime);
        }
    }, [startTime, setValue]);

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const response = await api.users.getTutors();
                setTutors(response.data.data);
            } catch (error) {
                console.error('Error fetching tutors:', error);
            }
        };

        fetchTutors();
    }, []);

    const onSubmit = async (data: LessonFormData) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const durationMinutes = Math.max(15, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));

        const subjectMap: Record<string, number> = {
            'Математика': 1,
            'Физика': 2,
            'Химия': 3,
            'Информатика': 4,
            'Английский язык': 5,
            'Русский язык': 6,
            'История': 7,
            'Биология': 8,
            'Алгебра': 1,
            'Геометрия': 1,
            'Астрономия': 2,
            'Механика': 2,
            'Подготовка к IELTS': 5,
            'Программирование': 4,
            'Python': 4,
            'Органическая химия': 3,
            'Литература': 6,
            'Обществознание': 7,
            'Экология': 8,
        };

        const formatLocalDateTime = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        const scheduledTime = formatLocalDateTime(new Date(data.startTime));

        const formData: CreateLessonRequest = {
            studentId: user?.id || 0,
            tutorId: data.tutorId,
            subjectId: subjectMap[data.subject] || 1,
            scheduledTime: scheduledTime,
            durationMinutes: durationMinutes,
            price: data.price,
        };

        try {
            if (lessonId) {
                await dispatch(updateLesson({ id: lessonId, data: formData as any })).unwrap();
            } else {
                await dispatch(createLesson(formData as any)).unwrap();
            }

            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (error) {
            console.error('Error submitting lesson:', error);
        }
    };

    const calculateDuration = () => {
        if (startTime && watch('endTime')) {
            const start = new Date(startTime);
            const end = new Date(watch('endTime'));
            const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
            return duration > 0 ? duration : 0;
        }
        return 0;
    };

    const calculateTotal = () => {
        const duration = calculateDuration();
        const hourlyRate = watch('price');
        return Math.round((duration / 60) * hourlyRate);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {lessonId ? 'Редактировать урок' : 'Создать новый урок'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="tutorId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.tutorId}>
                                        <InputLabel>Репетитор *</InputLabel>
                                        <Select
                                            {...field}
                                            label="Репетитор *"
                                            value={field.value || ''}
                                        >
                                            {tutors.map((tutor) => (
                                                <MenuItem key={tutor.id} value={tutor.id}>
                                                    {tutor.firstName} {tutor.lastName} {tutor.subjects ? `- ${tutor.subjects}` : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.tutorId && (
                                            <Typography color="error" variant="caption">
                                                {errors.tutorId.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="subject"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        options={availableSubjects.length > 0 ? availableSubjects : []}
                                        disabled={!selectedTutorId || availableSubjects.length === 0}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Предмет *"
                                                error={!!errors.subject}
                                                helperText={
                                                    errors.subject?.message ||
                                                    (!selectedTutorId ? 'Сначала выберите репетитора' : '')
                                                }
                                            />
                                        )}
                                        onChange={(_, value) => field.onChange(value || '')}
                                        value={field.value || null}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Описание урока"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="startTime"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        label="Начало урока *"
                                        value={field.value ? new Date(field.value) : null}
                                        onChange={(date) => {
                                            if (date) {
                                                field.onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.startTime,
                                                helperText: errors.startTime?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="endTime"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        label="Окончание урока *"
                                        value={field.value ? new Date(field.value) : null}
                                        onChange={(date) => {
                                            if (date) {
                                                field.onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
                                            }
                                        }}
                                        minDateTime={startTime ? new Date(startTime) : undefined}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.endTime,
                                                helperText: errors.endTime?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        label="Цена за час (руб) *"
                                        fullWidth
                                        error={!!errors.price}
                                        helperText={errors.price?.message}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Длительность:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {calculateDuration()} минут
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">
                                            Итого к оплате:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h6" color="primary" fontWeight="bold">
                                            {calculateTotal().toLocaleString('ru-RU')} ₽
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => onSubmitSuccess && onSubmitSuccess()}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    {lessonId ? 'Сохранить изменения' : 'Создать урок'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </LocalizationProvider>
    );
};

export default LessonForm;