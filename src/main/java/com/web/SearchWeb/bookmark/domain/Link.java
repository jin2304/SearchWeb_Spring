package com.web.SearchWeb.bookmark.domain;

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
@ToString
public class Link extends com.web.SearchWeb.common.domain.BaseEntity {
    private Long linkId;               // link_id (BIGINT)
    private String canonicalUrl;       // canonical_url (TEXT, UNIQUE, NOT NULL)
    private String originalUrl;        // original_url (TEXT, NOT NULL)
    private String domain;             // domain (VARCHAR 255)
    private String title;              // title (VARCHAR 255)
    private String description;        // description (TEXT)
    private String thumbnailUrl;       // thumbnail_url (TEXT)
    private String faviconUrl;         // favicon_url (TEXT)
    private String contentType;        // content_type (VARCHAR 30, default 'link')
    private Long primaryCategoryId;    // primary_category_id (INT, NOT NULL)
    private BigDecimal categoryScore;  // category_score (NUMERIC 5,4)
    private String classifierVersion;  // classifier_version (VARCHAR 50)
    private OffsetDateTime categorizedAt; // categorized_at (TIMESTAMPTZ)
}
