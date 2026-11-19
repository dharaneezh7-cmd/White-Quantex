package com.whitequantex.company.repository;

import com.whitequantex.company.entity.BusinessLifecycleHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessLifecycleHistoryRepository extends JpaRepository<BusinessLifecycleHistoryEntity, UUID> {
    List<BusinessLifecycleHistoryEntity> findAllByBusinessIdOrderByEffectiveAtDesc(UUID businessId);
}
