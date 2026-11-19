package com.whitequantex.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordActivityRequest {
    private String activityType;
    private String activityName;
    private String path;
    private String metadata;
}
