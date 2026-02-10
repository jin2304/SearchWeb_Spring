package com.web.SearchWeb.bookmark.domain;

import com.web.SearchWeb.common.domain.BaseEntity;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Link 도메인 클래스
 * - URL의 메타데이터를 저장하는 테이블
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Link extends BaseEntity {
    private Long linkId;               // 링크 ID
    private String canonicalUrl;       // 표준 URL (Canonical URL)
    private String originalUrl;        // 원본 URL
    private String domain;             // 도메인
    private String title;              // 제목
    private String description;        // 설명
    private String thumbnailUrl;       // 썸네일 URL
    private String faviconUrl;         // 파비콘 URL
    private String contentType;        // 콘텐츠 타입 (기본: link)
    private Long primaryCategoryId;    // 대표 카테고리 ID
    private BigDecimal categoryScore;  // 카테고리 점수
    private String classifierVersion;  // 분류기 버전
    private OffsetDateTime categorizedAt; // 분류 일시
}
