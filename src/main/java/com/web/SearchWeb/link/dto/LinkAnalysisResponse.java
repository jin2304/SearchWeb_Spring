package com.web.SearchWeb.link.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 링크 분석 결과를 담는 DTO
 */
@Getter
@Builder
public class LinkAnalysisResponse {
    private LinkMetadata metadata; // 추출된 메타데이터
    private String suggestedCategory; // 추천 카테고리명
    private Long suggestedFolderId; // 추천 폴더 ID (기존 폴더 매칭 시)
    private List<String> suggestedHashtags; // 추천 해시태그 목록
    private double confidence; // 분류 신뢰도 (0.0 ~ 1.0)
}
