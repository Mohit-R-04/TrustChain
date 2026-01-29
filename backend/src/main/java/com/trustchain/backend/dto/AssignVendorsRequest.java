package com.trustchain.backend.dto;

import java.util.List;
import java.util.UUID;

public class AssignVendorsRequest {
    private List<UUID> vendorIds;

    public AssignVendorsRequest() {
    }

    public List<UUID> getVendorIds() {
        return vendorIds;
    }

    public void setVendorIds(List<UUID> vendorIds) {
        this.vendorIds = vendorIds;
    }
}
