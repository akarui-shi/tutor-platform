import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { CreateLessonRequest, UpdateLessonRequest, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type CustomRequestConfig = AxiosRequestConfig & { _retry?: boolean };

class ApiService {
    private api: AxiosInstance;
    private isRefreshing = false;
    private failedRequests: Array<{
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
        config: AxiosRequestConfig;
    }> = [];

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                config.headers = (config.headers || {}) as any;
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Добавляем заголовки из контекста пользователя
                const userId = localStorage.getItem('userId');
                const userRole = localStorage.getItem('userRole');
                const username = localStorage.getItem('username');

                if (userId) {
                    config.headers['X-User-Id'] = userId;
                }
                if (userRole) {
                    config.headers['X-User-Role'] = userRole;
                }
                if (username) {
                    config.headers['X-Username'] = username;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config as CustomRequestConfig;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedRequests.push({ resolve, reject, config: originalRequest });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshTokenValue = localStorage.getItem('refreshToken');
                        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                            refreshToken: refreshTokenValue,
                        });

                        const { accessToken } = response.data;
                        localStorage.setItem('accessToken', accessToken);

                        if (!originalRequest.headers) {
                            originalRequest.headers = {};
                        }

                        this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                        this.failedRequests.forEach((request) => {
                            request.config.headers = request.config.headers || {};
                            request.config.headers['Authorization'] = `Bearer ${accessToken}`;
                            request.resolve(this.api(request.config));
                        });

                        this.failedRequests = [];

                        return this.api(originalRequest);
                    } catch (refreshError) {
                        this.failedRequests.forEach((request) => request.reject(refreshError));
                        this.failedRequests = [];

                        store.dispatch(logout());
                        window.location.href = '/login';

                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Lessons API
    public lessons = {
        create: (data: CreateLessonRequest) =>
            this.api.post('/api/lessons', data),

        getById: (id: number) =>
            this.api.get(`/api/lessons/${id}`),

        getAll: (params?: {
            studentId?: number;
            tutorId?: number;
            status?: string;
            date?: string;
        }) => this.api.get('/api/lessons', { params }),

        update: (id: number, data: UpdateLessonRequest) =>
            this.api.put(`/api/lessons/${id}`, data),

        complete: (id: number) =>
            this.api.post(`/api/lessons/${id}/complete`),

        cancel: (id: number, reason?: string) =>
            this.api.post(`/api/lessons/${id}/cancel`, { reason }),

        getJoinUrl: (id: number) =>
            this.api.get(`/api/lessons/${id}/join-url`),
    };

    // Users API
    public users = {
        getById: (id: number) =>
            this.api.get(`/api/users/${id}`),

        update: (id: number, data: Partial<User>) =>
            this.api.put(`/api/users/${id}`, data),

        getTutors: (params?: { subject?: string; minRating?: number }) =>
            this.api.get('/api/users/tutors', { params }),
    };

    // Payments API
    public payments = {
        create: (lessonId: number, amount: number) =>
            this.api.post('/api/payments', { lessonId, amount }),

        getByLesson: (lessonId: number) =>
            this.api.get(`/api/payments/lesson/${lessonId}`),

        confirm: (paymentId: string) =>
            this.api.post(`/api/payments/${paymentId}/confirm`),
    };

    // Calendar API
    public calendar = {
        getEvents: (start: string, end: string) =>
            this.api.get(`/api/calendar/events?start=${start}&end=${end}`),

        createEvent: (data: any) =>
            this.api.post('/api/calendar/events', data),
    };

    // Auth API
    public auth = {
        login: (email: string, password: string) =>
            this.api.post('/api/auth/login', { email, password }),

        register: (data: any) =>
            this.api.post('/api/auth/register', data),

        logout: () =>
            this.api.post('/api/auth/logout'),

        me: () =>
            this.api.get('/api/auth/me'),
    };
}

export default new ApiService();