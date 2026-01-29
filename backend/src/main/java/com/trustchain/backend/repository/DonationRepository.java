package com.trustchain.backend.repository;

import com.trustchain.backend.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface DonationRepository extends JpaRepository<Donation, UUID> {
    List<Donation> findByDonor_Name(String name);
    List<Donation> findByDonor_UserId(String userId);
    List<Donation> findByGovernment_UserId(String userId);

    @Query("select coalesce(sum(d.amount), 0) from Donation d")
    Double sumAllAmounts();

    @Query("select coalesce(sum(d.amount), 0) from Donation d where d.scheme.schemeId = :schemeId")
    Double sumAmountsBySchemeId(@Param("schemeId") UUID schemeId);

    @Query("select count(distinct d.donor.userId) from Donation d where d.scheme.schemeId = :schemeId and d.donor is not null")
    long countDistinctDonorUsersBySchemeId(@Param("schemeId") UUID schemeId);

    @Query("select count(distinct d.government.userId) from Donation d where d.scheme.schemeId = :schemeId and d.government is not null")
    long countDistinctGovernmentUsersBySchemeId(@Param("schemeId") UUID schemeId);

    @Query("select s.category, coalesce(sum(d.amount), 0) from Donation d join d.scheme s group by s.category")
    List<Object[]> sumDonationsByCategory();
}
