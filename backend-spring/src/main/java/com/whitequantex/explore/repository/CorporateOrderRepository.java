package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CorporateOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CorporateOrderRepository extends JpaRepository<CorporateOrderEntity, UUID> {
    @Query("SELECT o FROM CorporateOrderEntity o JOIN FETCH o.company c ORDER BY o.executedAt DESC")
    List<CorporateOrderEntity> findAllOrders();

    @Query("SELECT o FROM CorporateOrderEntity o JOIN FETCH o.company c WHERE o.status = :status ORDER BY o.executedAt DESC")
    List<CorporateOrderEntity> findByStatus(@Param("status") String status);

    @Query("SELECT o FROM CorporateOrderEntity o JOIN FETCH o.company c WHERE o.userId = :userId ORDER BY o.executedAt DESC")
    List<CorporateOrderEntity> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT o FROM CorporateOrderEntity o JOIN FETCH o.company c WHERE o.userId = :userId AND o.status = :status ORDER BY o.executedAt DESC")
    List<CorporateOrderEntity> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
}
