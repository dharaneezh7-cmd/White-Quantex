package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyDocumentRepository extends JpaRepository<CompanyDocumentEntity, UUID> {
    List<CompanyDocumentEntity> findAllByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
