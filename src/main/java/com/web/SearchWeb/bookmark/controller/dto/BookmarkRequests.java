package com.web.SearchWeb.bookmark.controller.dto;

/**
 * Bookmark Controller 전용 Request DTO
 * - Controller에서만 사용하며, Service 계층에는 개별 파라미터로 전달
 */
public class BookmarkRequests {

    /**
     * 북마크 생성 요청
     */
    public static class CreateDto { 
        public Long bookmarkId;           // 북마크 ID (PK, Insert 시 생성된 키 저장용)
        public Long memberFolderId;       // 폴더 ID (null이면 기본 폴더)
        public String displayTitle;       // 표시 제목
        public String url;                // 저장할 URL
        public String note;               // 메모
        public Long primaryCategoryId;    // 카테고리 ID
        public Long createdByMemberId;    // 저장한 회원
        public String tags;               // 태그 문자열 (공백/콤마 구분)
    }
}
