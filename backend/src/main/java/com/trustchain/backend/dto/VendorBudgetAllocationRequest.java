package com.trustchain.backend.dto;

import java.util.UUID;

public class VendorBudgetAllocationRequest {
    private UUID vendorId;
    private Double allocatedBudget;

    public VendorBudgetAllocationRequest() {
    }

    public UUID getVendorId() {
        return vendorId;
    }

    public void setVendorId(UUID vendorId) {
        this.vendorId = vendorId;
    }

    public Double getAllocatedBudget() {
        return allocatedBudget;
    }

    public void setAllocatedBudget(Double allocatedBudget) {
        this.allocatedBudget = allocatedBudget;
    }
}
