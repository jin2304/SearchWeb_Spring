package com.web.SearchWeb.bookmark.service.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Bookmark 검색 요청 Command
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkSearchCommand {
    private Long memberId;                // created_by_member_id로 필터
    private Long folderId;                // member_folder_id로 필터
    private String sort;                  // 정렬 기준 (Newest, Oldest)
    private String query;                 // 검색어 (display_title 검색)
    private Long categoryId;              // primary_category_id로 필터 (태그 대체)
    private Boolean unreadOnly;           // true이면 view_count = 0 인 북마크만 조회
    private Boolean savedTodayOnly;       // true이면 오늘 생성된 북마크만 조회
    @Builder.Default
    private Integer limit = 100;          // list query limit
    @Builder.Default
    private Integer offset = 0;           // list query offset
}