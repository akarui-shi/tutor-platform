import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import lessonReducer from './slices/lessonSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        lessons: lessonReducer,
        users: userReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;