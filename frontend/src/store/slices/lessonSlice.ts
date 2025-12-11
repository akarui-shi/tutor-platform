import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Lesson, CreateLessonRequest, UpdateLessonRequest } from '../../types';

interface LessonState {
    lessons: Lesson[];
    currentLesson: Lesson | null;
    loading: boolean;
    error: string | null;
    filters: {
        status?: string;
        date?: string;
        tutorId?: number;
        studentId?: number;
    };
}

const initialState: LessonState = {
    lessons: [],
    currentLesson: null,
    loading: false,
    error: null,
    filters: {},
};

// Async thunks
export const fetchLessons = createAsyncThunk(
    'lessons/fetchAll',
    async (params: any | undefined, { rejectWithValue }) => {
        try {
            const response = await api.lessons.getAll(params);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки уроков');
        }
    }
);

export const createLesson = createAsyncThunk(
    'lessons/create',
    async (data: CreateLessonRequest, { rejectWithValue }) => {
        try {
            const response = await api.lessons.create(data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка создания урока');
        }
    }
);

export const updateLesson = createAsyncThunk(
    'lessons/update',
    async ({ id, data }: { id: number; data: UpdateLessonRequest }, { rejectWithValue }) => {
        try {
            const response = await api.lessons.update(id, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка обновления урока');
        }
    }
);

export const completeLesson = createAsyncThunk(
    'lessons/complete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.lessons.complete(id);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка завершения урока');
        }
    }
);

export const cancelLesson = createAsyncThunk(
    'lessons/cancel',
    async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await api.lessons.cancel(id, reason);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка отмены урока');
        }
    }
);

const lessonSlice = createSlice({
    name: 'lessons',
    initialState,
    reducers: {
        setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
            state.currentLesson = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<LessonState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLessons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLessons.fulfilled, (state, action) => {
                state.loading = false;
                state.lessons = action.payload;
            })
            .addCase(fetchLessons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createLesson.fulfilled, (state, action) => {
                state.lessons.push(action.payload);
            })
            .addCase(updateLesson.fulfilled, (state, action) => {
                const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
                if (index !== -1) {
                    state.lessons[index] = action.payload;
                }
                if (state.currentLesson?.id === action.payload.id) {
                    state.currentLesson = action.payload;
                }
            })
            .addCase(completeLesson.fulfilled, (state, action) => {
                const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
                if (index !== -1) {
                    state.lessons[index] = action.payload;
                }
            })
            .addCase(cancelLesson.fulfilled, (state, action) => {
                const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
                if (index !== -1) {
                    state.lessons[index] = action.payload;
                }
            });
    },
});

export const { setCurrentLesson, setFilters, clearError } = lessonSlice.actions;
export default lessonSlice.reducer;