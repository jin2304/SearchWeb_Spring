package com.web.SearchWeb.link.service;

import com.web.SearchWeb.link.dto.LinkAnalysisResponse;

/**
 * 링크 분석 서비스 인터페이스
 */
public interface LinkAnalysisService {

    /**
     * URL을 분석하여 카테고리와 해시태그를 추천
     * 
     * @param url      분석할 URL
     * @param memberId 사용자 ID (기존 폴더 매칭에 사용)
     * @return 분석 결과 (메타데이터, 추천 카테고리, 해시태그)
     */
    LinkAnalysisResponse analyzeLink(String url, int memberId);
}
