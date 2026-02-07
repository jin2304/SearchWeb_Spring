package com.web.SearchWeb.bookmark.domain;

import java.math.BigDecimal;

import com.web.SearchWeb.common.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Bookmark 도메인 클래스 (MemberSavedLink)
 *
 * PostgreSQL member_saved_link 테이블과 매핑
 * 사용자가 저장한 링크 정보
 */
@Getter
@Setter
@ToString
public class Bookmark extends BaseEntity {
    private Long bookmarkId;              // 북마크 고유 ID (PK, member_saved_link_id)
    private Long linkId;                  // 링크 ID (FK to link, 필수)
    private Long linkEnrichmentId;        // 링크 분석 정보 ID (FK to link_enrichment, 선택)
    private Long memberFolderId;          // 소유 폴더 ID (FK to member_folder, 필수)
    private String displayTitle;          // 표시 제목 (사용자 지정 또는 원본 제목)
    private String note;                  // 메모 (선택 사항)
    private Long primaryCategoryId;       // 주 카테고리 ID (선택, AI 분류 또는 사용자 지정)
    private String categorySource;        // 카테고리 출처 ('system', 'member', default 'system')
    private BigDecimal categoryScore;     // 카테고리 정확도 점수 (0.0 ~ 1.0)

    // Link 객체 (Association)
    private Link link;            // Link 테이블과 조인된 객체
}
