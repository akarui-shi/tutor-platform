package ru.tutorplatform.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import ru.tutorplatform.common.constants.Constants;
import ru.tutorplatform.common.event.NotificationEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    @RabbitListener(queues = Constants.QueueNames.NOTIFICATION_QUEUE)
    public void handleNotification(NotificationEvent event) {
        // Заглушка отправки уведомлений
        log.info("Send notification: {}", event);
    }
}

