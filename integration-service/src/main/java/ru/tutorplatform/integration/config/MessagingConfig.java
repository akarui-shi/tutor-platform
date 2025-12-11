package ru.tutorplatform.integration.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.tutorplatform.common.constants.Constants;

@Configuration
public class MessagingConfig {

    @Bean
    public Queue integrationQueue() {
        return new Queue(Constants.QueueNames.INTEGRATION_QUEUE, true);
    }
}






