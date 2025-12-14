export interface Lesson {
    id: number;
    studentId: number;
    tutorId: number;
    subjectId: number;
    scheduledTime: string;  // ← изменено с startTime
    durationMinutes: number;  // ← изменено с duration
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    price: number;
    meetingUrl?: string;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    // Опциональные поля для совместимости с фронтендом
    subject?: string;
    description?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
    startTime: string;
    endTime: string;
    duration?: number;
    materials?: string[];
}


export interface CreateLessonRequest {
    studentId: number;
    tutorId: number;
    subjectId: number;
    scheduledTime: string; // ISO 8601 format: "2024-01-01T10:00:00"
    durationMinutes: number;
    price: number;
}

export interface UpdateLessonRequest {
    subject?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    price?: number;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'TUTOR' | 'ADMIN';
    avatar?: string;
    bio?: string;
    subjects?: string[];
    rating?: number;
    hourlyRate?: number;
}

export interface Payment {
    id: number;
    lessonId: number;
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    paymentMethod: string;
    transactionId?: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Notification {
    id: number;
    userId: number;
    type: 'LESSON_CREATED' | 'LESSON_UPDATED' | 'LESSON_CANCELLED' | 'PAYMENT_SUCCESS' | 'REMINDER';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}