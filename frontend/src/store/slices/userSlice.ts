import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { User } from '../../types';

interface UserState {
    tutors: User[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    tutors: [],
    selectedUser: null,
    loading: false,
    error: null,
};

export const fetchTutors = createAsyncThunk(
    'users/fetchTutors',
    async (params: { subject?: string; minRating?: number } | undefined, { rejectWithValue }) => {
        try {
            const response = await api.users.getTutors(params);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить репетиторов');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.users.getById(id);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить пользователя');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTutors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTutors.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.tutors = action.payload || [];
            })
            .addCase(fetchTutors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;

