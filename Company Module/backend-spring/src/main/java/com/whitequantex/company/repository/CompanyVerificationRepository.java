package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyVerificationEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyVerificationRepository extends JpaRepository<CompanyVerificationEntity, UUID> {

    List<CompanyVerificationEntity> findAllByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    Page<CompanyVerificationEntity> findAllByStatusOrderBySubmittedAtDesc(
            CompanyVerificationEntity.VerificationStatus status,
            Pageable pageable
    );

    @Query("SELECT v FROM CompanyVerificationEntity v WHERE v.companyId = :companyId AND v.status IN ('PENDING', 'UNDER_REVIEW')")
    List<CompanyVerificationEntity> findActiveRequestsByCompanyId(@Param("companyId") UUID companyId);

    /**
     * Pessimistic write lock for verification decision review (Scenario 5).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM CompanyVerificationEntity v WHERE v.id = :id")
    Optional<CompanyVerificationEntity> findByIdWithPessimisticLock(@Param("id") UUID id);
}
