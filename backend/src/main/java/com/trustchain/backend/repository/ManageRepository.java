package com.trustchain.backend.repository;

import com.trustchain.backend.model.Manage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ManageRepository extends JpaRepository<Manage, UUID> {
    List<Manage> findByNgo_NgoId(UUID ngoId);

    boolean existsByScheme_SchemeId(UUID schemeId);

    boolean existsByScheme_SchemeIdAndManageIdNot(UUID schemeId, UUID manageId);

    boolean existsByNgo_NgoIdAndScheme_SchemeId(UUID ngoId, UUID schemeId);

    boolean existsByNgo_NgoIdAndScheme_SchemeIdAndManageIdNot(UUID ngoId, UUID schemeId, UUID manageId);
}
