package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CorporatePositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CorporatePositionRepository extends JpaRepository<CorporatePositionEntity, UUID> {
    @Query("SELECT p FROM CorporatePositionEntity p JOIN FETCH p.company c ORDER BY p.currentValue DESC")
    List<CorporatePositionEntity> findAllPositions();

    @Query("SELECT p FROM CorporatePositionEntity p JOIN FETCH p.company c WHERE p.userId = :userId ORDER BY p.currentValue DESC")
    List<CorporatePositionEntity> findByUserId(@Param("userId") UUID userId);
}
