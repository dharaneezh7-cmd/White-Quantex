package com.whitequantex.company.repository;

import com.whitequantex.company.entity.VentureEntity;
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
public interface VentureRepository extends JpaRepository<VentureEntity, UUID> {

    Optional<VentureEntity> findByTicker(String ticker);

    Optional<VentureEntity> findByCik(String cik);

    boolean existsByTicker(String ticker);

    boolean existsByCik(String cik);

    boolean existsByNameIgnoreCase(String name);

    List<VentureEntity> findAllByOwnerUserId(UUID ownerUserId);

    @Query("SELECT v FROM VentureEntity v WHERE " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.ticker) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.sector) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<VentureEntity> searchVentures(@Param("query") String query, Pageable pageable);

    /**
     * Pessimistic lock for graduation workflow (Scenario 6) and ownership transfer (Scenario 4).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM VentureEntity v WHERE v.id = :id")
    Optional<VentureEntity> findByIdWithPessimisticLock(@Param("id") UUID id);
}
