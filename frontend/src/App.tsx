import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from './store';
import { loadUser } from './store/slices/authSlice';
import { useAppSelector } from './hooks/redux';

// Layout
import Dashboard from './components/layout/Dashboard';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import LessonDetailsPage from './pages/LessonDetailsPage';
import CreateLessonPage from './pages/CreateLessonPage';
import EditLessonPage from './pages/EditLessonPage';
import CalendarPage from './pages/CalendarPage';
import TutorsPage from './pages/TutorsPage';
import ProfilePage from './pages/ProfilePage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

// Protected Route Component (должен быть внутри Provider)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    // Если нет токена, редиректим на логин
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Если идет загрузка, показываем содержимое (чтобы избежать мигания)
    // Если токен невалидный, loadUser очистит его и произойдет редирект
    return <>{children}</>;
};

// Внутренний компонент с роутингом (находится внутри Provider)
const AppRoutes: React.FC = () => {
    useEffect(() => {
        // Загружаем пользователя только если есть токен и мы не на странице логина/регистрации
        const token = localStorage.getItem('accessToken');
        const currentPath = window.location.pathname;
        if (token && !currentPath.includes('/login') && !currentPath.includes('/register')) {
            store.dispatch(loadUser());
        }
    }, []);

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="lessons" element={<LessonsPage />} />
                                <Route path="lessons/create" element={<CreateLessonPage />} />
                                <Route path="lessons/:id" element={<LessonDetailsPage />} />
                                <Route path="lessons/:id/edit" element={<EditLessonPage />} />
                                <Route path="calendar" element={<CalendarPage />} />
                                <Route path="tutors" element={<TutorsPage />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="payments" element={<PaymentsPage />} />
                                <Route path="settings" element={<SettingsPage />} />
                                <Route path="messages" element={<div>Сообщения</div>} />
                                <Route path="reports" element={<div>Отчеты</div>} />
                            </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarProvider maxSnack={3}>
                    <AppRoutes />
                </SnackbarProvider>
            </ThemeProvider>
        </Provider>
    );
};

export default App;