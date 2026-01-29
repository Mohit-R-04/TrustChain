package com.trustchain.backend.repository;

import com.trustchain.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID>, JpaSpecificationExecutor<ActivityLog> {

    // Kept for backward compatibility if needed, but Specification is preferred
    List<ActivityLog> findByActorIdOrderByTimestampDesc(String actorId);

    List<ActivityLog> findByActorRoleOrderByTimestampDesc(String actorRole);

    List<ActivityLog> findByTargetEntityIdOrderByTimestampDesc(String targetEntityId);
}
