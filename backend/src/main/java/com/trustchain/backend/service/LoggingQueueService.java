package com.trustchain.backend.service;

import com.trustchain.backend.event.ActivityLogEvent;

/**
 * Queue Abstraction for Activity Logging.
 * Future-ready for Kafka or RabbitMQ.
 */
public interface LoggingQueueService {
    void enqueueEvent(ActivityLogEvent event);
}
