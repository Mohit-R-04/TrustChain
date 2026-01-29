package com.trustchain.backend.controller;

import com.trustchain.backend.dto.CreateCommunityNeedRequest;
import com.trustchain.backend.model.CommunityNeed;
import com.trustchain.backend.service.CommunityNeedService;
import com.trustchain.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/community-needs")
public class CommunityNeedController {

    @Autowired
    private CommunityNeedService communityNeedService;

    @Autowired
    private OtpService otpService;

    @GetMapping
    public ResponseEntity<List<CommunityNeed>> getAllNeeds() {
        return ResponseEntity.ok(communityNeedService.listNeeds());
    }

    @PostMapping
    public ResponseEntity<?> createNeed(@Valid @RequestBody CreateCommunityNeedRequest request) {
        boolean ok = otpService.consumeVerificationToken(request.getEmail(), request.getOtpVerificationToken());
        if (!ok) {
            return ResponseEntity.status(401).body("Email OTP verification is required");
        }

        CommunityNeed communityNeed = new CommunityNeed();
        communityNeed.setTitle(request.getTitle());
        communityNeed.setCategory(request.getCategory());
        communityNeed.setLocation(request.getLocation());
        communityNeed.setDescription(request.getDescription());
        communityNeed.setEmail(request.getEmail());

        return ResponseEntity.ok(communityNeedService.createNeed(communityNeed));
    }

    @PostMapping("/{needId}/vote")
    public ResponseEntity<CommunityNeed> vote(@PathVariable UUID needId, @RequestBody Map<String, Object> body) {
        String voter = body.get("email") != null ? body.get("email").toString() : "";
        int value = body.get("value") instanceof Number ? ((Number) body.get("value")).intValue() : 0;
        return ResponseEntity.ok(communityNeedService.vote(needId, voter, value));
    }
}
