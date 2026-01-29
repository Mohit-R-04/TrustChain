package com.trustchain.backend.controller;

import com.trustchain.backend.dto.AssignVendorsRequest;
import com.trustchain.backend.dto.AssignVendorsWithBudgetRequest;
import com.trustchain.backend.dto.UpdateAllocatedBudgetRequest;
import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.service.NgoVendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo-vendor")
public class NgoVendorController {

    @Autowired
    private NgoVendorService ngoVendorService;

    @GetMapping
    public ResponseEntity<List<NgoVendor>> getAllNgoVendors() {
        return ResponseEntity.ok(ngoVendorService.getAllNgoVendors());
    }

    @GetMapping("/manage/{manageId}")
    public ResponseEntity<List<NgoVendor>> getNgoVendorsByManageId(@PathVariable UUID manageId, Authentication authentication) {
        return ResponseEntity.ok(ngoVendorService.getNgoVendorsByManageId(manageId, authentication.getName()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NgoVendor>> getNgoVendorsByVendorUserId(@PathVariable String userId, Authentication authentication) {
        return ResponseEntity.ok(ngoVendorService.getNgoVendorsByVendorUserId(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NgoVendor> getNgoVendorById(@PathVariable UUID id) {
        return ngoVendorService.getNgoVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NgoVendor> createNgoVendor(@RequestBody NgoVendor ngoVendor) {
        return ResponseEntity.ok(ngoVendorService.createNgoVendor(ngoVendor));
    }

    @PostMapping("/manage/{manageId}/vendors")
    public ResponseEntity<List<NgoVendor>> assignVendorsToManage(
            @PathVariable UUID manageId,
            @RequestBody AssignVendorsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ngoVendorService.assignVendorsToManage(manageId, request.getVendorIds(), authentication.getName()));
    }

    @PostMapping("/manage/{manageId}/vendors/allocate")
    public ResponseEntity<List<NgoVendor>> assignVendorsWithBudget(
            @PathVariable UUID manageId,
            @RequestBody AssignVendorsWithBudgetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ngoVendorService.assignVendorsWithBudget(manageId, request.getVendors(), authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NgoVendor> updateNgoVendor(@PathVariable UUID id, @RequestBody NgoVendor ngoVendor) {
        NgoVendor updatedNgoVendor = ngoVendorService.updateNgoVendor(id, ngoVendor);
        return updatedNgoVendor != null ? ResponseEntity.ok(updatedNgoVendor) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/budget")
    public ResponseEntity<NgoVendor> updateAllocatedBudget(
            @PathVariable UUID id,
            @RequestBody UpdateAllocatedBudgetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ngoVendorService.updateAllocatedBudget(id, request.getAllocatedBudget(), authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<NgoVendor> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> statusUpdate, Authentication authentication) {
        String status = statusUpdate.get("status");
        return ResponseEntity.ok(ngoVendorService.updateStatus(id, status, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgoVendor(@PathVariable UUID id) {
        ngoVendorService.deleteNgoVendor(id);
        return ResponseEntity.noContent().build();
    }
}
