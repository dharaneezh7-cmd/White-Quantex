package com.whitequantex.company.repository;

import com.whitequantex.company.entity.GraduationApplicationEntity;
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
public interface GraduationApplicationRepository extends JpaRepository<GraduationApplicationEntity, UUID> {

    List<GraduationApplicationEntity> findAllByBusinessIdOrderBySubmittedAtDesc(UUID businessId);

    Page<GraduationApplicationEntity> findAllByApplicationStatusOrderBySubmittedAtDesc(
            String status,
            Pageable pageable
    );

    @Query("SELECT g FROM GraduationApplicationEntity g WHERE g.businessId = :businessId AND g.applicationStatus IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW')")
    List<GraduationApplicationEntity> findActiveRequestsByBusinessId(@Param("businessId") UUID businessId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM GraduationApplicationEntity g WHERE g.id = :id")
    Optional<GraduationApplicationEntity> findByIdWithPessimisticLock(@Param("id") UUID id);
}
