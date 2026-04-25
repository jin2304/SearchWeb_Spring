package com.web.SearchWeb.bookmark.controller.dto;

import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    
    /**
     * 북마크 목록 조회 요청 Dto (Search Params)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchDto {
        public Long folderId;
        public String sort = "Newest"; // 기본값 설정
        public String query;
        public Long categoryId;
        public Boolean unreadOnly;

        public BookmarkSearchCommand toCommand(Long memberId) {
            return BookmarkSearchCommand.builder()
                .memberId(memberId)
                .folderId(this.folderId)
                .sort(this.sort)
                .query(this.query)
                .categoryId(this.categoryId)
                .unreadOnly(this.unreadOnly)
                .build();
        }
    }


    /**
     * 북마크 수정 요청 Dto
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateDto {
        public Long memberFolderId;       // 폴더 ID
        public String displayTitle;       // 표시 제목
        public String note;               // 메모
        public Long primaryCategoryId;    // 카테고리 ID
        public String tags;               // 태그 문자열 (공백/콤마 구분)
    }

}
