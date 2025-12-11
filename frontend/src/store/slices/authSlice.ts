import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: Boolean(localStorage.getItem('accessToken')),
};

type AuthResponse = {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    data?: User;
};

type ApiResponseWrapper<T> = {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.auth.login(credentials.email, credentials.password);
            const apiResponse = response.data as ApiResponseWrapper<{
                accessToken: string;
                refreshToken: string;
                user: User;
            }>;
            // Извлекаем данные из обертки ApiResponse
            if (apiResponse.data) {
                return {
                    accessToken: apiResponse.data.accessToken,
                    refreshToken: apiResponse.data.refreshToken,
                    user: apiResponse.data.user,
                } as AuthResponse;
            }
            // Fallback на случай, если структура другая
            return response.data as unknown as AuthResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Не удалось войти');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: { email: string; password: string; firstName?: string; lastName?: string }, { rejectWithValue }) => {
        try {
            const username = data.email?.split('@')[0] || data.email;
            const response = await api.auth.register({
                ...data,
                username,
                role: 'STUDENT',
            });
            const apiResponse = response.data as ApiResponseWrapper<User>;
            // После регистрации автоматически логиним пользователя
            if (apiResponse.data) {
                const loginResponse = await api.auth.login(data.email, data.password);
                const loginApiResponse = loginResponse.data as ApiResponseWrapper<{
                    accessToken: string;
                    refreshToken: string;
                    user: User;
                }>;
                if (loginApiResponse.data) {
                    return {
                        accessToken: loginApiResponse.data.accessToken,
                        refreshToken: loginApiResponse.data.refreshToken,
                        user: loginApiResponse.data.user,
                    } as AuthResponse;
                }
            }
            // Fallback - возвращаем только пользователя без токенов
            return { user: apiResponse.data || apiResponse as unknown as User } as AuthResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Не удалось зарегистрироваться');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.auth.me();
            const apiResponse = response.data as ApiResponseWrapper<User>;
            // Для /me эндпоинта возвращается User, а не LoginResponse
            return { user: apiResponse.data || apiResponse as unknown as User } as AuthResponse;
        } catch (error: any) {
            // Если токен невалидный, просто возвращаем ошибку без выброса исключения
            return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить пользователя');
        }
    }
);

const applyAuthData = (state: AuthState, payload: AuthResponse) => {
    const accessToken = payload.accessToken;
    const refreshToken = payload.refreshToken;
    const user = payload.user || payload.data || null;

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }

    // Сохраняем данные пользователя в localStorage для использования в API
    if (user) {
        if (user.id) {
            localStorage.setItem('userId', user.id.toString());
        }
        if (user.role) {
            localStorage.setItem('userRole', user.role);
        }
        if (user.username) {
            localStorage.setItem('username', user.username);
        }
    }

    state.user = user;
    state.isAuthenticated = Boolean(accessToken || state.isAuthenticated || user);
    state.error = null;
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = Boolean(action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                applyAuthData(state, action.payload as AuthResponse);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                applyAuthData(state, action.payload as AuthResponse);
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                applyAuthData(state, action.payload as AuthResponse);
            })
            .addCase(loadUser.rejected, (state, action) => {
                state.loading = false;
                state.error = null; // Не показываем ошибку при загрузке пользователя
                state.isAuthenticated = false;
                state.user = null;
                // Очищаем невалидный токен и связанные данные
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
            });
    },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;


