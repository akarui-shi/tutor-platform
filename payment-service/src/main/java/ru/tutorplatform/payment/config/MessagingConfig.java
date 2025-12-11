package ru.tutorplatform.payment.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.tutorplatform.common.constants.Constants;

@Configuration
public class MessagingConfig {

    @Bean
    public Queue paymentQueue() {
        return new Queue(Constants.QueueNames.PAYMENT_QUEUE, true);
    }
}





