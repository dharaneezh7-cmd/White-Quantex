package com.whitequantex.explore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldingsResponseDto {
    private HoldingsSummaryDto summary;
    private List<HoldingItemDto> companies;
    private List<HoldingItemDto> ventures;
    private List<HoldingItemDto> stocks;
    private List<HoldingItemDto> all;
}
