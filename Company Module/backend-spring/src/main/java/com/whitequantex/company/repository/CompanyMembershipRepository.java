package com.whitequantex.company.repository;

import com.whitequantex.company.entity.CompanyMembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyMembershipRepository extends JpaRepository<CompanyMembershipEntity, UUID> {

    Optional<CompanyMembershipEntity> findByCompanyIdAndUserId(UUID companyId, UUID userId);

    List<CompanyMembershipEntity> findAllByCompanyId(UUID companyId);

    List<CompanyMembershipEntity> findAllByUserId(UUID userId);

    boolean existsByCompanyIdAndUserId(UUID companyId, UUID userId);

    @Query("SELECT COUNT(m) > 0 FROM CompanyMembershipEntity m WHERE m.companyId = :companyId AND m.userId = :userId AND m.role IN :roles AND m.isActive = true")
    boolean hasAnyRole(@Param("companyId") UUID companyId, @Param("userId") UUID userId, @Param("roles") List<CompanyMembershipEntity.CompanyRole> roles);

    long countByCompanyIdAndRoleAndIsActiveTrue(UUID companyId, CompanyMembershipEntity.CompanyRole role);
}
