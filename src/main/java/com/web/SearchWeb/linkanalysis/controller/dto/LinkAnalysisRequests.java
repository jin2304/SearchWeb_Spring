package com.web.SearchWeb.linkanalysis.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 링크 분석 API 요청 DTO
 */
public class LinkAnalysisRequests {

    @Getter
    @NoArgsConstructor
    public static class Analyze {
        @NotBlank(message = "URL은 필수입니다.")
        public String url; // 분석 대상 URL
    }
}
