import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Chip,
} from '@mui/material';
import {
    Add,
    ChevronLeft,
    ChevronRight,
    Today,
    FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppSelector } from '../../hooks/redux';
import { Lesson } from '../../types';

const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
    const navigate = useNavigate();
    const { lessons } = useAppSelector((state) => state.lessons);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<View>('month');
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const events = lessons.map((lesson: Lesson) => ({
        id: lesson.id,
        title: `${lesson.subject}${lesson.tutorId ? ` (Репетитор: ${lesson.tutorId})` : ''}`,
        start: new Date(lesson.startTime),
        end: new Date(lesson.endTime),
        resource: lesson,
    }));

    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        setSelectedSlot(slotInfo);
        setOpenDialog(true);
    }, []);

    const handleSelectEvent = useCallback((event: any) => {
        navigate(`/lessons/${event.id}`);
    }, [navigate]);

    const viewToUnit = (view: View): moment.unitOfTime.DurationConstructor => {
        switch (view) {
            case 'month':
                return 'month';
            case 'week':
            case 'work_week':
                return 'week';
            case 'day':
            case 'agenda':
                return 'day';
            default:
                return 'day';
        }
    };

    const handleCreateLesson = () => {
        if (selectedSlot) {
            navigate('/lessons/create', {
                state: {
                    startTime: format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"),
                },
            });
        } else {
            navigate('/lessons/create');
        }
        setOpenDialog(false);
    };

    const getEventStyle = (event: any) => {
        const lesson: Lesson = event.resource;
        let backgroundColor = '#3174ad';

        switch (lesson.status) {
            case 'COMPLETED':
                backgroundColor = '#4caf50';
                break;
            case 'CANCELLED':
                backgroundColor = '#f44336';
                break;
            case 'IN_PROGRESS':
                backgroundColor = '#ff9800';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    return (
        <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Календарь уроков</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Today />}
                        onClick={() => setCurrentDate(new Date())}
                        sx={{ mr: 1 }}
                    >
                        Сегодня
                    </Button>
                    <IconButton onClick={() => setCurrentDate(moment(currentDate).subtract(1, viewToUnit(currentView)).toDate())}>
                        <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={() => setCurrentDate(moment(currentDate).add(1, viewToUnit(currentView)).toDate())}>
                        <ChevronRight />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ ml: 1 }}
                    >
                        Создать урок
                    </Button>
                </Box>
            </Box>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                date={currentDate}
                onNavigate={setCurrentDate}
                view={currentView}
                onView={setCurrentView}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                eventPropGetter={getEventStyle}
                messages={{
                    next: 'Следующий',
                    previous: 'Предыдущий',
                    today: 'Сегодня',
                    month: 'Месяц',
                    week: 'Неделя',
                    day: 'День',
                    agenda: 'Повестка',
                    date: 'Дата',
                    time: 'Время',
                    event: 'Событие',
                    noEventsInRange: 'Нет уроков в выбранном периоде',
                }}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {selectedSlot ? 'Создать урок на выбранное время' : 'Создать новый урок'}
                </DialogTitle>
                <DialogContent>
                    {selectedSlot && (
                        <Box mb={2}>
                            <Typography variant="subtitle2">Выбранное время:</Typography>
                            <Box display="flex" gap={1} mt={1}>
                                <Chip
                                    label={format(selectedSlot.start, 'dd.MM.yyyy HH:mm')}
                                    size="small"
                                />
                                <Typography>-</Typography>
                                <Chip
                                    label={format(selectedSlot.end, 'dd.MM.yyyy HH:mm')}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    )}
                    <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                        <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                        <Button variant="contained" onClick={handleCreateLesson}>
                            Создать урок
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default CalendarView;