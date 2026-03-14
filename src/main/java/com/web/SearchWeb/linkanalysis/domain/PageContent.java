package com.web.SearchWeb.linkanalysis.domain;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 링크 크롤링 결과 도메인 객체
 * - Jsoup으로 추출한 페이지 메타데이터를 담는 용도
 * - AI 프롬프트 구성 및 폴백 응답에 사용
 */
@Getter
@Builder
public class PageContent {

    /** 페이지 제목 (og:title → twitter:title → title 태그 순) */
    private final String title;

    /** 페이지 설명 (og:description → meta description 순) */
    private final String description;

    /** 본문 텍스트 일부 (최대 1500자, AI 컨텍스트용) */
    private final String mainTextSnippet;

    /** 도메인명 (예: "www.example.com") */
    private final String domain;

    /** 콘텐츠 유형 (JSON-LD @type 또는 og:type, 예: "Article", "Product") */
    private final String contentType;

    /** 페이지 메타 키워드 (최대 10개) */
    @Builder.Default
    private final List<String> keywords = List.of();

    /** 주요 헤딩 텍스트 - h1, h2 (최대 5개) */
    @Builder.Default
    private final List<String> headings = List.of();
}
