package ru.tutorplatform.common.constants;


public class Constants {
    public static class QueueNames {
        public static final String PAYMENT_QUEUE = "payment.queue";
        public static final String NOTIFICATION_QUEUE = "notification.queue";
        public static final String INTEGRATION_QUEUE = "integration.queue";
        public static final String DEAD_LETTER_QUEUE = "dead.letter.queue";
    }

    public static class LessonStatus {
        public static final String SCHEDULED = "SCHEDULED";
        public static final String IN_PROGRESS = "IN_PROGRESS";
        public static final String COMPLETED = "COMPLETED";
        public static final String CANCELLED = "CANCELLED";
    }

    public static class PaymentStatus {
        public static final String PENDING = "PENDING";
        public static final String PROCESSING = "PROCESSING";
        public static final String COMPLETED = "COMPLETED";
        public static final String FAILED = "FAILED";
        public static final String REFUNDED = "REFUNDED";
    }
}