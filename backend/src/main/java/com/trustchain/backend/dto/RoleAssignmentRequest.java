package com.trustchain.backend.dto;

public class RoleAssignmentRequest {
    private String role;
    private String name;
    private String email;

    public RoleAssignmentRequest() {
    }

    public RoleAssignmentRequest(String role, String name, String email) {
        this.role = role;
        this.name = name;
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
