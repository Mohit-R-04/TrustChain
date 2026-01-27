package com.trustchain.backend.service;

import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.repository.NgoVendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NgoVendorService {

    @Autowired
    private NgoVendorRepository ngoVendorRepository;

    public List<NgoVendor> getAllNgoVendors() {
        // TODO: Implement method
        return null;
    }

    public Optional<NgoVendor> getNgoVendorById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public NgoVendor createNgoVendor(NgoVendor ngoVendor) {
        // TODO: Implement method
        return null;
    }

    public NgoVendor updateNgoVendor(UUID id, NgoVendor ngoVendor) {
        // TODO: Implement method
        return null;
    }

    public void deleteNgoVendor(UUID id) {
        // TODO: Implement method
    }
}
