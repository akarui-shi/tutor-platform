package ru.tutorplatform.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {
    private String eventId;
    private String type; // EMAIL, SMS, PUSH
    private String recipient;
    private String templateId;
    private Map<String, Object> parameters;
    private LocalDateTime eventTime;
}
