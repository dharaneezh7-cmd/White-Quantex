package com.whitequantex.auth.repository;

import com.whitequantex.auth.entity.UserSessionActivityEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSessionActivityRepository extends JpaRepository<UserSessionActivityEntity, UUID> {
    List<UserSessionActivityEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<UserSessionActivityEntity> findBySessionIdOrderByCreatedAtDesc(UUID sessionId);
}
