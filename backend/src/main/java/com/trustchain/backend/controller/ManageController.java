package com.trustchain.backend.controller;

import com.trustchain.backend.model.Manage;
import com.trustchain.backend.service.ManageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manage")
public class ManageController {

    @Autowired
    private ManageService manageService;

    @GetMapping
    public ResponseEntity<List<Manage>> getAllManages() {
        return ResponseEntity.ok(manageService.getAllManages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manage> getManageById(@PathVariable UUID id) {
        return manageService.getManageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Manage> createManage(@RequestBody Manage manage) {
        return ResponseEntity.ok(manageService.createManage(manage));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manage> updateManage(@PathVariable UUID id, @RequestBody Manage manage) {
        Manage updated = manageService.updateManage(id, manage);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManage(@PathVariable UUID id) {
        manageService.deleteManage(id);
        return ResponseEntity.ok().build();
    }
}
