package ru.tutorplatform.payment.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import ru.tutorplatform.common.constants.Constants;
import ru.tutorplatform.common.event.PaymentEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    @RabbitListener(queues = Constants.QueueNames.PAYMENT_QUEUE)
    public void handlePayment(PaymentEvent event) {
        // Заглушка обработки платежа
        log.info("Обрабатываю событие платежа: {}", event);
        // Здесь можно добавить имитацию запроса к платежному провайдеру
    }
}

