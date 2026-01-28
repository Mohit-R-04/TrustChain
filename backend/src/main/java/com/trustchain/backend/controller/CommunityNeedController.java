package com.trustchain.backend.controller;

import com.trustchain.backend.model.CommunityNeed;
import com.trustchain.backend.repository.CommunityNeedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/community-needs")
public class CommunityNeedController {

    @Autowired
    private CommunityNeedRepository communityNeedRepository;

    @GetMapping
    public ResponseEntity<List<CommunityNeed>> getAllNeeds() {
        List<CommunityNeed> needs = communityNeedRepository.findAll();
        return ResponseEntity.ok(needs);
    }

    @PostMapping
    public ResponseEntity<CommunityNeed> createNeed(@RequestBody CommunityNeed communityNeed) {
        communityNeed.setStatus("open");
        communityNeed.setCreatedAt(LocalDateTime.now());
        CommunityNeed saved = communityNeedRepository.save(communityNeed);
        return ResponseEntity.ok(saved);
    }
}

