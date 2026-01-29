package com.trustchain.backend.dto;

public class RoleAssignmentRequest {
    private String role;
    private String name;
    private String email;
    private String phoneNumber;

    public RoleAssignmentRequest() {
    }

    public RoleAssignmentRequest(String role, String name, String email, String phoneNumber) {
        this.role = role;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
