package com.trustchain.backend.service;

import com.trustchain.backend.model.CommunityNeed;
import com.trustchain.backend.model.CommunityNeedVote;
import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.repository.CommunityNeedRepository;
import com.trustchain.backend.repository.CommunityNeedVoteRepository;
import com.trustchain.backend.repository.SchemeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CommunityNeedService {

    @Autowired
    private CommunityNeedRepository communityNeedRepository;

    @Autowired
    private CommunityNeedVoteRepository communityNeedVoteRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    public List<CommunityNeed> listNeeds() {
        return communityNeedRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public CommunityNeed createNeed(CommunityNeed need) {
        need.setStatus("open");
        need.setCreatedAt(LocalDateTime.now());
        need.setUpvotes(0);
        need.setDownvotes(0);
        return communityNeedRepository.save(need);
    }

    @Transactional
    public CommunityNeed vote(UUID needId, String voterRaw, int value) {
        if (value != 1 && value != -1) {
            throw new IllegalArgumentException("Vote value must be 1 or -1");
        }
        String voter = normalizeVoter(voterRaw);
        if (voter.isEmpty()) {
            throw new IllegalArgumentException("Voter is required");
        }

        CommunityNeed need = communityNeedRepository.findById(needId)
                .orElseThrow(() -> new IllegalArgumentException("Need not found"));
        if (need.getUpvotes() == null) need.setUpvotes(0);
        if (need.getDownvotes() == null) need.setDownvotes(0);

        CommunityNeedVote existing = communityNeedVoteRepository.findByNeed_NeedIdAndVoter(needId, voter).orElse(null);
        if (existing == null) {
            CommunityNeedVote v = new CommunityNeedVote();
            v.setNeed(need);
            v.setVoter(voter);
            v.setValue(value);
            v.setCreatedAt(LocalDateTime.now());
            communityNeedVoteRepository.save(v);
            applyDelta(need, value, 1);
        } else if (existing.getValue() != null && existing.getValue() == value) {
            return need;
        } else {
            int prev = existing.getValue() != null ? existing.getValue() : 0;
            existing.setValue(value);
            communityNeedVoteRepository.save(existing);
            if (prev == 1) applyDelta(need, 1, -1);
            if (prev == -1) applyDelta(need, -1, -1);
            applyDelta(need, value, 1);
        }

        return communityNeedRepository.save(need);
    }

    @Transactional
    public Scheme implementNeed(UUID needId, Government government, String implementedByUserId) {
        if (government == null) {
            throw new IllegalArgumentException("Government is required");
        }
        CommunityNeed need = communityNeedRepository.findById(needId)
                .orElseThrow(() -> new IllegalArgumentException("Need not found"));

        if (need.getImplementedSchemeId() != null) {
            return schemeRepository.findById(need.getImplementedSchemeId())
                    .orElseThrow(() -> new IllegalStateException("Implemented scheme not found"));
        }

        Scheme scheme = new Scheme();
        scheme.setSchemeName(need.getTitle());
        scheme.setCategory(need.getCategory());
        scheme.setRegion(need.getLocation());
        scheme.setDescription(need.getDescription());
        scheme.setBudget(0d);
        scheme.setExpectedBeneficiaries(0);
        scheme.setMilestoneCount(1);
        scheme.setStartDate(LocalDate.now());
        scheme.setEndDate(LocalDate.now().plusMonths(6));
        scheme.setIsFinished(false);
        if (scheme.getCreatedAt() == null) {
            scheme.setCreatedAt(LocalDateTime.now());
        }
        scheme.setGovernment(government);
        scheme = schemeRepository.save(scheme);

        need.setImplementedSchemeId(scheme.getSchemeId());
        need.setImplementedAt(LocalDateTime.now());
        need.setImplementedByUserId(implementedByUserId);
        need.setStatus("implemented");
        communityNeedRepository.save(need);

        return scheme;
    }

    private static void applyDelta(CommunityNeed need, int voteValue, int delta) {
        if (voteValue == 1) {
            need.setUpvotes(Math.max(0, (need.getUpvotes() != null ? need.getUpvotes() : 0) + delta));
        } else if (voteValue == -1) {
            need.setDownvotes(Math.max(0, (need.getDownvotes() != null ? need.getDownvotes() : 0) + delta));
        }
    }

    private static String normalizeVoter(String voterRaw) {
        if (voterRaw == null) return "";
        return voterRaw.trim().toLowerCase();
    }
}
