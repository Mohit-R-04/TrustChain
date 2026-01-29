package com.trustchain.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "community_need_vote",
        uniqueConstraints = @UniqueConstraint(columnNames = {"need_id", "voter"})
)
public class CommunityNeedVote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vote_id")
    private UUID voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "need_id", referencedColumnName = "need_id", nullable = false)
    private CommunityNeed need;

    @Column(name = "voter", nullable = false)
    private String voter;

    @Column(name = "value", nullable = false)
    private Integer value;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public UUID getVoteId() {
        return voteId;
    }

    public void setVoteId(UUID voteId) {
        this.voteId = voteId;
    }

    public CommunityNeed getNeed() {
        return need;
    }

    public void setNeed(CommunityNeed need) {
        this.need = need;
    }

    public String getVoter() {
        return voter;
    }

    public void setVoter(String voter) {
        this.voter = voter;
    }

    public Integer getValue() {
        return value;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

