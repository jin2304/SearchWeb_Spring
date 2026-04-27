package com.web.SearchWeb.bookmark.controller.dto;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 북마크 검색 결과 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkSearchResponse {
    
    // 검색된 북마크 목록
    private List<Bookmark> bookmarks;
    
    // 검색 조건(쿼리)에 매칭되는 링크가 하나라도 포함된 폴더 ID 목록
    private List<Long> matchingFolderIds;

    // 전체 검색 결과 개수
    private int totalCount;
}
