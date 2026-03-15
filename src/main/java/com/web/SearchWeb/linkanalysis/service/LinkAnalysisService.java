package com.web.SearchWeb.linkanalysis.service;

import com.web.SearchWeb.linkanalysis.domain.LinkAnalysisResult;

/**
 * 링크 분석 서비스 인터페이스
 */
public interface LinkAnalysisService {

    /**
     * URL 분석 → 제목/설명/태그/폴더 추천 결과 반환
     */
    LinkAnalysisResult analyze(Long memberId, String url);
}
