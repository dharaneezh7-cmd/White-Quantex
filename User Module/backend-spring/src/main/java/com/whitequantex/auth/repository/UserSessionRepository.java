package com.whitequantex.auth.repository;

import com.whitequantex.auth.entity.UserSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSessionEntity, UUID> {
    Optional<UserSessionEntity> findBySessionTokenAndIsActiveTrue(String sessionToken);
    
    Optional<UserSessionEntity> findBySessionToken(String sessionToken);

    List<UserSessionEntity> findByUserIdAndIsActiveTrueOrderByLastActivityAtDesc(UUID userId);

    List<UserSessionEntity> findByUserIdOrderByLoginAtDesc(UUID userId);

    @Modifying
    @Query("DELETE FROM UserSessionEntity s WHERE s.sessionToken = :token")
    void deleteBySessionToken(@Param("token") String token);

    @Modifying
    @Query("DELETE FROM UserSessionEntity s WHERE s.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
