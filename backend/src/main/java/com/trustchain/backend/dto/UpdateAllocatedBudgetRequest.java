package com.trustchain.backend.dto;

public class UpdateAllocatedBudgetRequest {
    private Double allocatedBudget;

    public UpdateAllocatedBudgetRequest() {
    }

    public Double getAllocatedBudget() {
        return allocatedBudget;
    }

    public void setAllocatedBudget(Double allocatedBudget) {
        this.allocatedBudget = allocatedBudget;
    }
}
