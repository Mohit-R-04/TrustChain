package com.trustchain.backend.dto;

public class RoleAssignmentResponse {
    private boolean success;
    private String userId;
    private String assignedRole;
    private String message;

    public RoleAssignmentResponse() {
    }

    public RoleAssignmentResponse(boolean success, String userId, String assignedRole, String message) {
        this.success = success;
        this.userId = userId;
        this.assignedRole = assignedRole;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAssignedRole() {
        return assignedRole;
    }

    public void setAssignedRole(String assignedRole) {
        this.assignedRole = assignedRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
