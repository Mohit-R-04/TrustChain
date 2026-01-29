package com.trustchain.backend.service;

import com.trustchain.backend.dto.VendorBudgetAllocationRequest;
import com.trustchain.backend.model.KycRecord;
import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.model.Manage;
import com.trustchain.backend.model.PanRecord;
import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.KycRecordRepository;
import com.trustchain.backend.repository.ManageRepository;
import com.trustchain.backend.repository.NgoVendorRepository;
import com.trustchain.backend.repository.PanRecordRepository;
import com.trustchain.backend.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NgoVendorService {

    @Autowired
    private NgoVendorRepository ngoVendorRepository;

    @Autowired
    private ManageRepository manageRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private KycRecordRepository kycRecordRepository;

    @Autowired
    private PanRecordRepository panRecordRepository;

    public List<NgoVendor> getAllNgoVendors() {
        return ngoVendorRepository.findAll();
    }

    public List<NgoVendor> getNgoVendorsByVendorUserId(String userId) {
        return ngoVendorRepository.findByVendor_UserId(userId);
    }

    public List<NgoVendor> getNgoVendorsByManageId(UUID manageId, String currentUserId) {
        Manage manage = manageRepository.findById(manageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manage record not found"));
        requireNgoOwnership(manage, currentUserId);
        return ngoVendorRepository.findByManage_ManageId(manageId);
    }

    public Optional<NgoVendor> getNgoVendorById(UUID id) {
        return ngoVendorRepository.findById(id);
    }

    public NgoVendor createNgoVendor(NgoVendor ngoVendor) {
        if (ngoVendor.getCreatedAt() == null) {
            ngoVendor.setCreatedAt(LocalDateTime.now());
        }
        if (ngoVendor.getStatus() == null || ngoVendor.getStatus().isBlank()) {
            ngoVendor.setStatus("PENDING");
        }
        return ngoVendorRepository.save(ngoVendor);
    }

    public List<NgoVendor> assignVendorsToManage(UUID manageId, List<UUID> vendorIds, String currentUserId) {
        if (vendorIds == null || vendorIds.isEmpty()) {
            return List.of();
        }

        Manage manage = manageRepository.findById(manageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manage record not found"));
        requireNgoOwnership(manage, currentUserId);

        List<NgoVendor> created = new ArrayList<>();
        for (UUID vendorId : vendorIds) {
            if (!vendorRepository.existsById(vendorId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found: " + vendorId);
            }
            NgoVendor existing = ngoVendorRepository.findByManage_ManageIdAndVendor_VendorId(manageId, vendorId)
                    .orElse(null);
            if (existing != null && !isRejected(existing.getStatus())) {
                continue;
            }

            if (existing != null) {
                existing.setStatus("PENDING");
                existing.setCreatedAt(LocalDateTime.now());
                created.add(ngoVendorRepository.save(existing));
            } else {
                Vendor vendor = new Vendor();
                vendor.setVendorId(vendorId);

                NgoVendor ngoVendor = new NgoVendor();
                ngoVendor.setManage(manage);
                ngoVendor.setVendor(vendor);
                ngoVendor.setStatus("PENDING");
                ngoVendor.setCreatedAt(LocalDateTime.now());

                created.add(ngoVendorRepository.save(ngoVendor));
            }
        }

        return created;
    }

    public List<NgoVendor> assignVendorsWithBudget(UUID manageId, List<VendorBudgetAllocationRequest> vendors, String currentUserId) {
        if (vendors == null || vendors.isEmpty()) {
            return List.of();
        }

        Manage manage = manageRepository.findById(manageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manage record not found"));
        requireNgoOwnership(manage, currentUserId);

        if (manage.getScheme() == null || manage.getScheme().getBudget() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scheme budget not configured");
        }

        BigDecimal schemeBudget = BigDecimal.valueOf(manage.getScheme().getBudget());
        BigDecimal currentReserved = BigDecimal.valueOf(ngoVendorRepository.sumAllocatedBudgetExcludingRejected(manageId));

        BigDecimal delta = BigDecimal.ZERO;
        for (VendorBudgetAllocationRequest req : vendors) {
            if (req == null || req.getVendorId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vendorId is required");
            }
            if (req.getAllocatedBudget() == null || req.getAllocatedBudget() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "allocatedBudget must be >= 0");
            }

            NgoVendor existing = ngoVendorRepository.findByManage_ManageIdAndVendor_VendorId(manageId, req.getVendorId())
                    .orElse(null);

            BigDecimal existingCounted = BigDecimal.ZERO;
            if (existing != null && !isRejected(existing.getStatus()) && existing.getAllocatedBudget() != null) {
                existingCounted = BigDecimal.valueOf(existing.getAllocatedBudget());
            }

            BigDecimal newBudget = BigDecimal.valueOf(req.getAllocatedBudget());
            delta = delta.add(newBudget.subtract(existingCounted));
        }

        if (currentReserved.add(delta).compareTo(schemeBudget) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Allocated vendor budgets exceed scheme budget");
        }

        List<NgoVendor> saved = new ArrayList<>();
        for (VendorBudgetAllocationRequest req : vendors) {
            Vendor vendor = vendorRepository.findById(req.getVendorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found: " + req.getVendorId()));

            NgoVendor existing = ngoVendorRepository.findByManage_ManageIdAndVendor_VendorId(manageId, req.getVendorId())
                    .orElse(null);

            if (existing != null) {
                if (isRejected(existing.getStatus())) {
                    existing.setStatus("PENDING");
                    existing.setCreatedAt(LocalDateTime.now());
                }
                existing.setAllocatedBudget(req.getAllocatedBudget());
                saved.add(ngoVendorRepository.save(existing));
                continue;
            }

            NgoVendor ngoVendor = new NgoVendor();
            ngoVendor.setManage(manage);
            ngoVendor.setVendor(vendor);
            ngoVendor.setAllocatedBudget(req.getAllocatedBudget());
            ngoVendor.setStatus("PENDING");
            ngoVendor.setCreatedAt(LocalDateTime.now());

            saved.add(ngoVendorRepository.save(ngoVendor));
        }

        return saved;
    }

    public NgoVendor updateAllocatedBudget(UUID ngoVendorId, Double allocatedBudget, String currentUserId) {
        if (allocatedBudget == null || allocatedBudget < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "allocatedBudget must be >= 0");
        }

        NgoVendor ngoVendor = ngoVendorRepository.findById(ngoVendorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        Manage manage = ngoVendor.getManage();
        if (manage == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manage record not found for order");
        }
        requireNgoOwnership(manage, currentUserId);

        if (manage.getScheme() == null || manage.getScheme().getBudget() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scheme budget not configured");
        }

        BigDecimal schemeBudget = BigDecimal.valueOf(manage.getScheme().getBudget());
        BigDecimal currentReserved = BigDecimal.valueOf(ngoVendorRepository.sumAllocatedBudgetExcludingRejected(manage.getManageId()));

        BigDecimal oldCounted = BigDecimal.ZERO;
        if (!isRejected(ngoVendor.getStatus()) && ngoVendor.getAllocatedBudget() != null) {
            oldCounted = BigDecimal.valueOf(ngoVendor.getAllocatedBudget());
        }

        BigDecimal newBudget = BigDecimal.valueOf(allocatedBudget);
        BigDecimal newReserved = currentReserved.subtract(oldCounted).add(newBudget);
        if (newReserved.compareTo(schemeBudget) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Allocated vendor budgets exceed scheme budget");
        }

        ngoVendor.setAllocatedBudget(allocatedBudget);
        return ngoVendorRepository.save(ngoVendor);
    }

    public NgoVendor updateNgoVendor(UUID id, NgoVendor ngoVendor) {
        if (ngoVendorRepository.existsById(id)) {
            ngoVendor.setNgoVendorId(id);
            return ngoVendorRepository.save(ngoVendor);
        }
        return null;
    }

    public NgoVendor updateStatus(UUID id, String status, String currentUserId) {
        return ngoVendorRepository.findById(id).map(ngoVendor -> {
            if (ngoVendor.getVendor() == null || ngoVendor.getVendor().getUserId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor not set on order");
            }
            if (!ngoVendor.getVendor().getUserId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this order");
            }
            if (status == null || status.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
            }

            String normalized = status.trim().toUpperCase();
            if (!normalized.equals("ACCEPTED") && !normalized.equals("REJECTED")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be ACCEPTED or REJECTED");
            }

            if (normalized.equals("ACCEPTED")) {
                boolean aadhaarVerified = kycRecordRepository.existsByVendorIdAndStatus(currentUserId, KycRecord.VerificationStatus.VERIFIED);
                boolean panVerified = panRecordRepository.existsByVendorIdAndStatus(currentUserId, PanRecord.VerificationStatus.VERIFIED);
                if (!aadhaarVerified || !panVerified) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "KYC not verified");
                }
            }

            ngoVendor.setStatus(normalized);
            return ngoVendorRepository.save(ngoVendor);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    public void deleteNgoVendor(UUID id) {
        ngoVendorRepository.deleteById(id);
    }

    private void requireNgoOwnership(Manage manage, String currentUserId) {
        if (manage.getNgo() == null || manage.getNgo().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NGO not set on manage record");
        }
        if (!manage.getNgo().getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to modify this project");
        }
    }

    private boolean isRejected(String status) {
        return status != null && status.equalsIgnoreCase("REJECTED");
    }
}
