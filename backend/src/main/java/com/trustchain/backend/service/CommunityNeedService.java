package com.trustchain.backend.service;

import com.trustchain.backend.model.CommunityNeed;
import com.trustchain.backend.model.CommunityNeedVote;
import com.trustchain.backend.repository.CommunityNeedRepository;
import com.trustchain.backend.repository.CommunityNeedVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CommunityNeedService {

    @Autowired
    private CommunityNeedRepository communityNeedRepository;

    @Autowired
    private CommunityNeedVoteRepository communityNeedVoteRepository;

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

