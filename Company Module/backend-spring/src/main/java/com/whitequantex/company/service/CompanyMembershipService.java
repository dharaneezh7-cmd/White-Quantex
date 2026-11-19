package com.whitequantex.company.service;

import com.whitequantex.company.dto.*;
import com.whitequantex.company.entity.*;
import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import com.whitequantex.company.exception.*;
import com.whitequantex.company.repository.*;
import com.whitequantex.company.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyMembershipService {

    private final CompanyMembershipRepository membershipRepository;
    private final CompanyRepository companyRepository;
    private final VentureRepository ventureRepository;
    private final UserRepository userRepository;
    private final CompanyAuditService auditService;
    private final CompanyService companyService;

    @Transactional
    public CompanyMembershipResponseDto addMember(UUID companyId, AddMemberRequestDto request, UUID actorUserId) {
        // Enforce authorization
        companyService.assertIsAdminOrOwner(companyId, actorUserId);

        // Validate target user exists in shared User table
        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Scenario 2: Prevent concurrent duplicate memberships
        if (membershipRepository.existsByCompanyIdAndUserId(companyId, request.getUserId())) {
            throw new ConflictException("User is already a member of this corporate entity");
        }

        CompanyMembershipEntity membership = CompanyMembershipEntity.builder()
                .id(UUID.randomUUID())
                .companyId(companyId)
                .userId(request.getUserId())
                .role(request.getRole() != null ? request.getRole() : CompanyRole.MEMBER)
                .title(request.getTitle())
                .isActive(true)
                .invitedBy(actorUserId)
                .joinedAt(Instant.now())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        CompanyMembershipEntity saved = membershipRepository.save(membership);

        auditService.logAction(
                companyId,
                actorUserId,
                "MEMBER_ADDED",
                null,
                "Added user " + request.getUserId() + " as " + saved.getRole(),
                null,
                null
        );

        return CompanyMembershipResponseDto.fromEntity(saved);
    }

    @Transactional
    public CompanyMembershipResponseDto updateMemberRole(UUID companyId, UUID memberId, UpdateMemberRoleRequestDto request, UUID actorUserId) {
        companyService.assertIsAdminOrOwner(companyId, actorUserId);

        CompanyMembershipEntity member = membershipRepository.findById(memberId)
                .filter(m -> m.getCompanyId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found for company " + companyId));

        if (member.getRole() == CompanyRole.OWNER && request.getRole() != CompanyRole.OWNER) {
            long ownerCount = membershipRepository.countByCompanyIdAndRoleAndIsActiveTrue(companyId, CompanyRole.OWNER);
            if (ownerCount <= 1) {
                throw new ConflictException("Cannot demote the sole active owner. Use ownership transfer instead.");
            }
        }

        String prev = "Role: " + member.getRole() + ", Title: " + member.getTitle() + ", Active: " + member.getIsActive();

        member.setRole(request.getRole());
        if (request.getTitle() != null) member.setTitle(request.getTitle());
        if (request.getIsActive() != null) member.setIsActive(request.getIsActive());

        CompanyMembershipEntity updated = membershipRepository.save(member);

        String next = "Role: " + updated.getRole() + ", Title: " + updated.getTitle() + ", Active: " + updated.getIsActive();
        auditService.logAction(companyId, actorUserId, "MEMBER_ROLE_UPDATED", prev, next, null, null);

        return CompanyMembershipResponseDto.fromEntity(updated);
    }

    @Transactional
    public void removeMember(UUID companyId, UUID memberId, UUID actorUserId) {
        companyService.assertIsAdminOrOwner(companyId, actorUserId);

        CompanyMembershipEntity member = membershipRepository.findById(memberId)
                .filter(m -> m.getCompanyId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found"));

        if (member.getRole() == CompanyRole.OWNER) {
            long ownerCount = membershipRepository.countByCompanyIdAndRoleAndIsActiveTrue(companyId, CompanyRole.OWNER);
            if (ownerCount <= 1) {
                throw new ConflictException("Cannot remove the sole owner of a corporate entity.");
            }
        }

        membershipRepository.delete(member);
        auditService.logAction(companyId, actorUserId, "MEMBER_REMOVED", "UserId: " + member.getUserId(), null, null, null);
    }

    /**
     * Scenario 4: Concurrent Ownership Transfer with Pessimistic Write Locking.
     */
    @Transactional
    public void transferOwnership(UUID companyId, TransferOwnershipRequestDto request, UUID currentOwnerUserId) {
        // 1. Acquire pessimistic write lock on the target business entity
        CompanyEntity company = companyRepository.findByIdWithPessimisticLock(companyId).orElse(null);
        VentureEntity venture = null;

        if (company == null) {
            venture = ventureRepository.findByIdWithPessimisticLock(companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company or Venture not found: " + companyId));
        }

        // 2. Validate current owner credentials
        UUID registeredOwnerId = (company != null) ? company.getOwnerUserId() : venture.getOwnerUserId();
        if (registeredOwnerId == null || !registeredOwnerId.equals(currentOwnerUserId)) {
            throw new ForbiddenException("Only the currently registered owner can transfer entity ownership.");
        }

        // 3. Validate new owner exists
        userRepository.findById(request.getNewOwnerUserId())
                .orElseThrow(() -> new ResourceNotFoundException("New owner user not found: " + request.getNewOwnerUserId()));

        if (currentOwnerUserId.equals(request.getNewOwnerUserId())) {
            throw new ConflictException("Cannot transfer ownership to the existing owner.");
        }

        // 4. Update Business Record
        if (company != null) {
            company.setOwnerUserId(request.getNewOwnerUserId());
            companyRepository.save(company);
        } else {
            venture.setOwnerUserId(request.getNewOwnerUserId());
            ventureRepository.save(venture);
        }

        // 5. Demote current owner to ADMIN in membership roster
        membershipRepository.findByCompanyIdAndUserId(companyId, currentOwnerUserId)
                .ifPresent(m -> {
                    m.setRole(CompanyRole.ADMIN);
                    membershipRepository.save(m);
                });

        // 6. Elevate or insert new owner in membership roster
        CompanyMembershipEntity newOwnerMember = membershipRepository.findByCompanyIdAndUserId(companyId, request.getNewOwnerUserId())
                .orElseGet(() -> CompanyMembershipEntity.builder()
                        .id(UUID.randomUUID())
                        .companyId(companyId)
                        .userId(request.getNewOwnerUserId())
                        .joinedAt(Instant.now())
                        .build());

        newOwnerMember.setRole(CompanyRole.OWNER);
        newOwnerMember.setIsActive(true);
        membershipRepository.save(newOwnerMember);

        // 7. Audit Log
        auditService.logAction(
                companyId,
                currentOwnerUserId,
                "OWNERSHIP_TRANSFERRED",
                "Owner: " + currentOwnerUserId,
                "New Owner: " + request.getNewOwnerUserId() + " Reason: " + request.getReason(),
                null,
                null
        );
    }

    @Transactional(readOnly = true)
    public List<CompanyMembershipResponseDto> getCompanyMembers(UUID companyId) {
        return membershipRepository.findAllByCompanyId(companyId)
                .stream().map(CompanyMembershipResponseDto::fromEntity).toList();
    }
}
