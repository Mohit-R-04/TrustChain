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
        return vendorRepository.findAll();
    }

    public Optional<Vendor> getVendorById(UUID id) {
        return vendorRepository.findById(id);
    }

    public Optional<Vendor> getVendorByUserId(String userId) {
        return vendorRepository.findByUserId(userId);
    }

    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(UUID id, Vendor vendor) {
        if (vendorRepository.existsById(id)) {
            vendor.setVendorId(id);
            return vendorRepository.save(vendor);
        }
        return null;
    }

    public void deleteVendor(UUID id) {
        vendorRepository.deleteById(id);
    }
}
