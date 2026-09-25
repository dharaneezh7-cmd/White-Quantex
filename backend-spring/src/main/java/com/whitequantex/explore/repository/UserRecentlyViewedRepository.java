package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.UserRecentlyViewedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRecentlyViewedRepository extends JpaRepository<UserRecentlyViewedEntity, UUID> {
    
    @Query("SELECT r FROM UserRecentlyViewedEntity r JOIN FETCH r.company c WHERE r.userId = :userId ORDER BY r.viewedAt DESC")
    List<UserRecentlyViewedEntity> findByUserIdOrderByViewedAtDesc(@Param("userId") UUID userId);

    Optional<UserRecentlyViewedEntity> findByUserIdAndCompanyId(UUID userId, UUID companyId);
}
