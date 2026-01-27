package com.trustchain.backend.dto;

public class RoleAssignmentRequest {
    private String role;

    public RoleAssignmentRequest() {
    }

    public RoleAssignmentRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
