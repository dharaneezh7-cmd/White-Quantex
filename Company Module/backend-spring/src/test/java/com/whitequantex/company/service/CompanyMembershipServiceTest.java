package com.whitequantex.company.service;

import com.whitequantex.company.dto.AddMemberRequestDto;
import com.whitequantex.company.dto.TransferOwnershipRequestDto;
import com.whitequantex.company.entity.CompanyEntity;
import com.whitequantex.company.entity.CompanyMembershipEntity;
import com.whitequantex.company.entity.CompanyMembershipEntity.CompanyRole;
import com.whitequantex.company.exception.ConflictException;
import com.whitequantex.company.exception.ForbiddenException;
import com.whitequantex.company.repository.CompanyMembershipRepository;
import com.whitequantex.company.repository.CompanyRepository;
import com.whitequantex.company.repository.VentureRepository;
import com.whitequantex.company.user.UserEntity;
import com.whitequantex.company.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyMembershipServiceTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private VentureRepository ventureRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyAuditService auditService;

    @Mock
    private CompanyService companyService;

    @InjectMocks
    private CompanyMembershipService membershipService;

    private UUID companyId;
    private UUID ownerId;
    private UUID targetUserId;

    @BeforeEach
    void setUp() {
        companyId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        targetUserId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Scenario 2: Reject concurrent duplicate membership addition")
    void testAddDuplicateMemberThrowsConflict() {
        AddMemberRequestDto request = AddMemberRequestDto.builder()
                .userId(targetUserId)
                .role(CompanyRole.MEMBER)
                .title("Software Engineer")
                .build();

        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(UserEntity.builder().id(targetUserId).build()));
        when(membershipRepository.existsByCompanyIdAndUserId(companyId, targetUserId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> membershipService.addMember(companyId, request, ownerId));
        verify(membershipRepository, never()).save(any());
    }

    @Test
    @DisplayName("Scenario 4: Transfer ownership enforces that only current registered owner can transfer")
    void testTransferOwnershipUnauthorizedCallerThrowsForbidden() {
        UUID attackerId = UUID.randomUUID();
        TransferOwnershipRequestDto request = TransferOwnershipRequestDto.builder()
                .newOwnerUserId(targetUserId)
                .reason("Hostile takeover attempt")
                .build();

        CompanyEntity company = CompanyEntity.builder()
                .id(companyId)
                .ownerUserId(ownerId) // true owner
                .build();

        when(companyRepository.findByIdWithPessimisticLock(companyId)).thenReturn(Optional.of(company));

        assertThrows(ForbiddenException.class, () -> membershipService.transferOwnership(companyId, request, attackerId));
        verify(companyRepository, never()).save(any());
    }
}
