package com.trustchain.backend.dto;

import java.util.List;

public class AssignVendorsWithBudgetRequest {
    private List<VendorBudgetAllocationRequest> vendors;

    public AssignVendorsWithBudgetRequest() {
    }

    public List<VendorBudgetAllocationRequest> getVendors() {
        return vendors;
    }

    public void setVendors(List<VendorBudgetAllocationRequest> vendors) {
        this.vendors = vendors;
    }
}
