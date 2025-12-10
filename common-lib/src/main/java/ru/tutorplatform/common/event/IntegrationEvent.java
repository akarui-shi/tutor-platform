package ru.tutorplatform.common.event;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationEvent implements Serializable {
    private String operationId;
    private String systemName; // "1C", "CRM", "ERP"
    private String operationType; // "CREATE_INVOICE", "UPDATE_ORDER"
    private Object payload;
    private LocalDateTime timestamp;
}