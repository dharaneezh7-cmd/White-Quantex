package com.whitequantex.company.service;

import com.whitequantex.company.entity.IdempotencyKeyEntity;
import com.whitequantex.company.repository.IdempotencyKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Transactional(readOnly = true)
    public Optional<IdempotencyKeyEntity> getRecordedResponse(String key, UUID userId) {
        if (key == null || key.isBlank()) return Optional.empty();
        return idempotencyKeyRepository.findByKeyAndUserId(key, userId);
    }

    @Transactional
    public void recordResponse(String key, UUID userId, String endpoint, Integer status, String responseBody) {
        if (key == null || key.isBlank()) return;
        try {
            IdempotencyKeyEntity entity = IdempotencyKeyEntity.builder()
                    .key(key)
                    .userId(userId)
                    .endpoint(endpoint)
                    .responseStatus(status)
                    .responseBody(responseBody)
                    .createdAt(Instant.now())
                    .build();
            idempotencyKeyRepository.save(entity);
        } catch (Exception e) {
            log.warn("Failed to store idempotency record for key {}: {}", key, e.getMessage());
        }
    }
}
