import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface NotificationState {
    notifications: Notification[];
}

const initialState: NotificationState = {
    notifications: [
        {
            id: 1,
            userId: 1,
            type: 'LESSON_CREATED',
            title: 'Урок создан',
            message: 'Ваш урок успешно создан и ожидает подтверждения.',
            read: false,
            createdAt: new Date().toISOString(),
        },
    ],
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
        },
        markAsRead: (state, action: PayloadAction<number>) => {
            state.notifications = state.notifications.map((notification) =>
                notification.id === action.payload ? { ...notification, read: true } : notification
            );
        },
        clearAll: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, markAsRead, clearAll } = notificationSlice.actions;
export default notificationSlice.reducer;






