package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyAuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CompanyAuditLogRepository extends JpaRepository<CompanyAuditLogEntity, UUID> {
    Page<CompanyAuditLogEntity> findAllByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);
}
