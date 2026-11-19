package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyEntity;
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
public interface CompanyRepository extends JpaRepository<CompanyEntity, UUID> {

    Optional<CompanyEntity> findByTicker(String ticker);

    Optional<CompanyEntity> findByCik(String cik);

    boolean existsByTicker(String ticker);

    boolean existsByCik(String cik);

    boolean existsByNameIgnoreCase(String name);

    List<CompanyEntity> findAllByOwnerUserId(UUID ownerUserId);

    @Query("SELECT c FROM CompanyEntity c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.ticker) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.sector) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CompanyEntity> searchCompanies(@Param("query") String query, Pageable pageable);

    /**
     * Pessimistic write lock for critical ownership transfer and graduation workflows (Scenario 4 & 6).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CompanyEntity c WHERE c.id = :id")
    Optional<CompanyEntity> findByIdWithPessimisticLock(@Param("id") UUID id);
}
