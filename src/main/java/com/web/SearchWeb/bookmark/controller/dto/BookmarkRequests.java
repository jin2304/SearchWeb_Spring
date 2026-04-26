package com.web.SearchWeb.bookmark.controller.dto;

import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Bookmark Controller 전용 Request DTO
 * - Controller에서만 사용하며, Service 계층에는 개별 파라미터로 전달
 */
public class BookmarkRequests {

    /**
     * 북마크 생성 요청 Dto
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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchDto {
        private static final int DEFAULT_LIMIT = 100;
        private static final int MAX_LIMIT = 200;

        private Long folderId;
        private String sort = "Newest";
        private String query;
        private Long categoryId;
        private Boolean unreadOnly;
        private Boolean savedTodayOnly;
        private Integer limit;
        private Integer offset;

        public BookmarkSearchCommand toCommand(Long memberId) {
            return BookmarkSearchCommand.builder()
                    .memberId(memberId)
                    .folderId(this.folderId)
                    .sort(this.sort)
                    .query(normalizeQuery(this.query))
                    .categoryId(this.categoryId)
                    .unreadOnly(Boolean.TRUE.equals(this.unreadOnly))
                    .savedTodayOnly(Boolean.TRUE.equals(this.savedTodayOnly))
                    .limit(normalizeLimit(this.limit))
                    .offset(normalizeOffset(this.offset))
                    .build();
        }

        private static int normalizeLimit(Integer limit) {
            if (limit == null) {
                return DEFAULT_LIMIT;
            }
            return Math.max(1, Math.min(limit, MAX_LIMIT));
        }

        private static int normalizeOffset(Integer offset) {
            if (offset == null) {
                return 0;
            }
            return Math.max(0, offset);
        }

        private static String normalizeQuery(String query) {
            if (query == null) {
                return null;
            }
            String trimmed = query.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            return trimmed
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateDto {
        private Long memberFolderId;
        private String displayTitle;
        private String note;
        private Long primaryCategoryId;
        private String tags;
    }
}
