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
        return ngoVendorRepository.findAll();
    }

    public List<NgoVendor> getNgoVendorsByVendorUserId(String userId) {
        return ngoVendorRepository.findByVendor_UserId(userId);
    }

    public Optional<NgoVendor> getNgoVendorById(UUID id) {
        return ngoVendorRepository.findById(id);
    }

    public NgoVendor createNgoVendor(NgoVendor ngoVendor) {
        return ngoVendorRepository.save(ngoVendor);
    }

    public NgoVendor updateNgoVendor(UUID id, NgoVendor ngoVendor) {
        if (ngoVendorRepository.existsById(id)) {
            ngoVendor.setNgoVendorId(id);
            return ngoVendorRepository.save(ngoVendor);
        }
        return null;
    }

    public NgoVendor updateStatus(UUID id, String status) {
        return ngoVendorRepository.findById(id).map(ngoVendor -> {
            ngoVendor.setStatus(status);
            return ngoVendorRepository.save(ngoVendor);
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public void deleteNgoVendor(UUID id) {
        ngoVendorRepository.deleteById(id);
    }
}
