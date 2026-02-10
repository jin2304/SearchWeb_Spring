package com.web.SearchWeb.bookmark.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Bookmark 검색 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkSearchRequestDto {
    private Long memberId;                // created_by_member_id로 필터
    private Long folderId;                // member_folder_id로 필터
    private String sort;                  // 정렬 기준 (Newest, Oldest)
    private String query;                 // 검색어 (display_title 검색)
    private Long categoryId;              // primary_category_id로 필터 (태그 대체)
}