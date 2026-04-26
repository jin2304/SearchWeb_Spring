package com.web.SearchWeb.bookmark.controller.dto;

import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Bookmark controller request DTOs.
 */
public class BookmarkRequests {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDto {
        private Long bookmarkId;
        private Long memberFolderId;
        private String displayTitle;
        private String url;
        private String note;
        private Long primaryCategoryId;
        private Long createdByMemberId;
        private String tags;
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
