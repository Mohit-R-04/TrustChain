package com.trustchain.backend.service;

import com.trustchain.backend.event.ActivityLogEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Default Implementation of LoggingQueueService using Spring Events.
 * This can be swapped with a Kafka implementation later.
 */
@Service
public class SpringLoggingQueueService implements LoggingQueueService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public void enqueueEvent(ActivityLogEvent event) {
        eventPublisher.publishEvent(event);
    }
}
