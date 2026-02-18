package com.web.SearchWeb.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Bookmark 저장/수정 요청 DTO
 * 
 * member_saved_link + link 테이블에 저장
 */
@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkDto {
    private Long bookmarkId;              // bookmark_id (PK, Insert 시 생성된 키 저장용)
    private Long memberFolderId;          // member_folder_id (저장할 폴더)
    private String displayTitle;          // display_title (사용자가 지정한 제목)
    private String url;                   // original_url (link 테이블에 저장)
    private String note;                  // note (메모)
    private Long primaryCategoryId;       // primary_category_id (카테고리)
    private Long createdByMemberId;       // created_by_member_id (저장한 회원)
    private String tags;                  // Space-separated tags ex: "dev java spring"
}
