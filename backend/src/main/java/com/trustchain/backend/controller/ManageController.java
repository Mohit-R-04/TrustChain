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
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manage> getManageById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Manage> createManage(@RequestBody Manage manage) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manage> updateManage(@PathVariable UUID id, @RequestBody Manage manage) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManage(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
