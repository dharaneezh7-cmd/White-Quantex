package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.MutualSchemeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MutualSchemeRepository extends JpaRepository<MutualSchemeEntity, UUID> {
    List<MutualSchemeEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<MutualSchemeEntity> findByCodeIgnoreCase(String code);
}
