package com.web.SearchWeb.link.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

/**
 * URL에서 추출한 메타데이터를 담는 DTO
 * 사용자의 요구에 따라 모든 후보군(1~4순위)을 리스트 형태로 보존함
 */
@Getter
@Builder
public class LinkMetadata {
    private String url;                         // 수집 대상 원본 URL
    private String domain;                      // 도메인
    private String siteName;                    // 웹사이트 이름 
    private List<String> titleCandidates;       // 제목 후보군
    private List<String> descriptionCandidates; // 설명 후보군 
    private List<String> keywordCandidates;     // 키워드 후보군
    private List<String> headingStructure;      // 문서 계층 구조
    private String mainContent;                 // 본문 텍스트
}

