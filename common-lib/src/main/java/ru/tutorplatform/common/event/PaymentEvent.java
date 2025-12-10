package ru.tutorplatform.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent implements Serializable {
    private String eventId;
    private Long lessonId;
    private Long studentId;
    private Long tutorId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime eventTime;
    private String paymentMethod;
}