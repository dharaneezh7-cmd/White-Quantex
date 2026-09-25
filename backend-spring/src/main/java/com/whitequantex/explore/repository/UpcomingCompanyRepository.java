package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.UpcomingCompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UpcomingCompanyRepository extends JpaRepository<UpcomingCompanyEntity, UUID> {
    List<UpcomingCompanyEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<UpcomingCompanyEntity> findByTickerIgnoreCase(String ticker);
}
