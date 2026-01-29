package com.trustchain.backend.repository;

import com.trustchain.backend.model.NgoVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NgoVendorRepository extends JpaRepository<NgoVendor, UUID> {
    List<NgoVendor> findByVendor_UserId(String userId);

    List<NgoVendor> findByManage_ManageId(UUID manageId);

    boolean existsByManage_ManageIdAndVendor_VendorId(UUID manageId, UUID vendorId);

    Optional<NgoVendor> findByManage_ManageIdAndVendor_VendorId(UUID manageId, UUID vendorId);

    @Query("""
            select coalesce(sum(coalesce(nv.allocatedBudget, 0)), 0)
            from NgoVendor nv
            where nv.manage.manageId = :manageId
              and upper(coalesce(nv.status, '')) <> 'REJECTED'
            """)
    Double sumAllocatedBudgetExcludingRejected(@Param("manageId") UUID manageId);
}
