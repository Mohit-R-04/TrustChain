package com.trustchain.backend.controller;

import com.trustchain.backend.service.CitizenPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public endpoints accessible to all users (citizens)
 */
@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    @Autowired
    private CitizenPublicService citizenPublicService;

    @GetMapping("/transparency")
    public ResponseEntity<Map<String, Object>> getTransparencyData() {
        return ResponseEntity.ok(citizenPublicService.getTransparencyData());
    }

    @GetMapping("/projects")
    public ResponseEntity<Map<String, Object>> getPublicProjects() {
        return ResponseEntity.ok(citizenPublicService.getPublicProjects());
    }

    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getPublicTransactions() {
        return ResponseEntity.ok(Map.of("transactions", new Object[] {}, "total", 0));
    }
}
