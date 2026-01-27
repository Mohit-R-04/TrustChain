package com.trustchain.backend.service;

import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        // TODO: Implement method
        return null;
    }

    public Optional<Vendor> getVendorById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Vendor createVendor(Vendor vendor) {
        // TODO: Implement method
        return null;
    }

    public Vendor updateVendor(UUID id, Vendor vendor) {
        // TODO: Implement method
        return null;
    }

    public void deleteVendor(UUID id) {
        // TODO: Implement method
    }
}
