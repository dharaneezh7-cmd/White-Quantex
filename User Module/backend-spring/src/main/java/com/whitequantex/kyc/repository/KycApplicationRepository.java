package com.whitequantex.kyc.repository;

import com.whitequantex.kyc.entity.KycApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycApplicationRepository extends JpaRepository<KycApplicationEntity, UUID> {
    Optional<KycApplicationEntity> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
    List<KycApplicationEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<KycApplicationEntity> findByApplicationId(String applicationId);
    List<KycApplicationEntity> findAllByOrderByCreatedAtDesc();
    List<KycApplicationEntity> findByStatusOrderByCreatedAtDesc(String status);
}
