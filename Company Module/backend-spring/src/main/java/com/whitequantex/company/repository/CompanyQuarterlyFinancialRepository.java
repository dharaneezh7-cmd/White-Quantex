package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyQuarterlyFinancialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyQuarterlyFinancialRepository extends JpaRepository<CompanyQuarterlyFinancialEntity, UUID> {

    List<CompanyQuarterlyFinancialEntity> findAllByTickerOrderByFiscalYearDescQuarterNumberDesc(String ticker);

    List<CompanyQuarterlyFinancialEntity> findAllByCompanyIdOrderByFiscalYearDescQuarterNumberDesc(UUID companyId);

    Optional<CompanyQuarterlyFinancialEntity> findByCompanyIdAndQuarter(UUID companyId, String quarter);
}
