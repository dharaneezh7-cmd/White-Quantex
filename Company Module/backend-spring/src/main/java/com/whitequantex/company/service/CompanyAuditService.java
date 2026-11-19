package com.whitequantex.company.service;

import com.whitequantex.company.entity.CompanyAuditLogEntity;
import com.whitequantex.company.repository.CompanyAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyAuditService {

    private final CompanyAuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(
            UUID companyId,
            UUID actorUserId,
            String action,
            String previousState,
            String newState,
            String ipAddress,
            String correlationId
    ) {
        try {
            CompanyAuditLogEntity entry = CompanyAuditLogEntity.builder()
                    .id(UUID.randomUUID())
                    .companyId(companyId)
                    .actorUserId(actorUserId)
                    .action(action)
                    .previousState(previousState)
                    .newState(newState)
                    .ipAddress(ipAddress)
                    .correlationId(correlationId)
                    .createdAt(Instant.now())
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to write company audit log for company: {}", companyId, e);
        }
    }
}
