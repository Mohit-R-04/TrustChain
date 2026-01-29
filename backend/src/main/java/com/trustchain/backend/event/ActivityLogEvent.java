package com.trustchain.backend.event;

import org.springframework.context.ApplicationEvent;

public class ActivityLogEvent extends ApplicationEvent {
    private final String actorId;
    private final String actorRole;
    private final String actionType;
    private final String targetEntityType;
    private final String targetEntityId;
    private final String metadata;
    private final String ipAddress;
    private final String userAgent;
    private final String severityLevel;
    private final String tenantId;

    public ActivityLogEvent(Object source, String actorId, String actorRole, String actionType, 
                            String targetEntityType, String targetEntityId, String metadata, 
                            String ipAddress, String userAgent, String severityLevel, String tenantId) {
        super(source);
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.actionType = actionType;
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
        this.metadata = metadata;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.severityLevel = severityLevel;
        this.tenantId = tenantId;
    }

    public String getActorId() { return actorId; }
    public String getActorRole() { return actorRole; }
    public String getActionType() { return actionType; }
    public String getTargetEntityType() { return targetEntityType; }
    public String getTargetEntityId() { return targetEntityId; }
    public String getMetadata() { return metadata; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getSeverityLevel() { return severityLevel; }
    public String getTenantId() { return tenantId; }
}
