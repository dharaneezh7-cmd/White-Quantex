package com.whitequantex.explore.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateNewsDto {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private String ticker;
    private String logoColor;
    private String category;
    private String title;
    private String snippet;
    private String sentiment;
    private String impactMetric;
    private String source;
    private String readTime;
    private String urgency;
    private String dueDate;
    private Boolean isActionRequired;
    private String actionLabel;
    private String actionType;
    private Instant publishedAt;
}
