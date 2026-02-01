package com.web.SearchWeb.link.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 링크 분석 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class LinkAnalysisRequest {
    private String url;
}
