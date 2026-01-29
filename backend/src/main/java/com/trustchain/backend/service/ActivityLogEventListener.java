package com.trustchain.backend.service;

import com.trustchain.backend.event.ActivityLogEvent;
import com.trustchain.backend.model.ActivityLog;
import com.trustchain.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogEventListener {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    /**
     * Async Event Listener.
     * Acts as a consumer in the Event Queue architecture.
     * Can be easily swapped with a Kafka/RabbitMQ producer in the future.
     */
    @Async
    @EventListener
    public void handleActivityLogEvent(ActivityLogEvent event) {
        ActivityLog log = new ActivityLog(
            event.getActorId(),
            event.getActorRole(),
            event.getActionType(),
            event.getTargetEntityType(),
            event.getTargetEntityId(),
            event.getMetadata(),
            event.getIpAddress(),
            event.getSeverityLevel(),
            event.getUserAgent(),
            event.getTenantId()
        );
        activityLogRepository.save(log);
    }
}
