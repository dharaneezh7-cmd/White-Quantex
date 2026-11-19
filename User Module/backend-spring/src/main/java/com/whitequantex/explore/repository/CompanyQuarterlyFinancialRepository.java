package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CompanyQuarterlyFinancialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyQuarterlyFinancialRepository extends JpaRepository<CompanyQuarterlyFinancialEntity, UUID> {
    List<CompanyQuarterlyFinancialEntity> findByCompanyIdOrderByFiscalYearAscQuarterNumberAsc(UUID companyId);
    List<CompanyQuarterlyFinancialEntity> findByTickerIgnoreCaseOrderByFiscalYearAscQuarterNumberAsc(String ticker);
    Optional<CompanyQuarterlyFinancialEntity> findByCompanyIdAndQuarter(UUID companyId, String quarter);
    Optional<CompanyQuarterlyFinancialEntity> findByTickerIgnoreCaseAndQuarter(String ticker, String quarter);
}
