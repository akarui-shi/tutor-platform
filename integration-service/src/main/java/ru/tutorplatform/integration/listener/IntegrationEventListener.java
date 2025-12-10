package ru.tutorplatform.integration.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import ru.tutorplatform.common.constants.Constants;
import ru.tutorplatform.common.event.IntegrationEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class IntegrationEventListener {

    @RabbitListener(queues = Constants.QueueNames.INTEGRATION_QUEUE)
    public void handleIntegration(IntegrationEvent event) {
        // Заглушка интеграции с внешними системами
        log.info("Обрабатываю событие интеграции: {}", event);
    }
}

