package com.whitequantex.market.repository;

import com.whitequantex.market.entity.CompanyPriceCurrentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyPriceCurrentRepository extends JpaRepository<CompanyPriceCurrentEntity, UUID> {
    Optional<CompanyPriceCurrentEntity> findBySymbolIgnoreCase(String symbol);
    Optional<CompanyPriceCurrentEntity> findByCompanyId(UUID companyId);
    boolean existsBySymbolIgnoreCase(String symbol);
}
