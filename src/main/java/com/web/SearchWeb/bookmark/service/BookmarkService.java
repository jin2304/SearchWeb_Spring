package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.controller.dto.BookmarkSearchResponse;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;
import com.web.SearchWeb.bookmark.service.command.BookmarkFolderTarget;


public interface BookmarkService {
    //북마크 추가
    Long insertBookmark(Long memberId, String url, String displayTitle, String note,
                        Long primaryCategoryId, String tags, BookmarkFolderTarget folderTarget);
    
    //북마크 단일 조회
    Bookmark selectBookmark(Long memberId, Long bookmarkId);
    
    //북마크 목록 조회 (검색 결과 및 매칭 폴더 포함)
    BookmarkSearchResponse selectBookmarkList(BookmarkSearchCommand command);
    
    //북마크 수정
    Long updateBookmark(Long memberId, Long bookmarkId, Long memberFolderId, String displayTitle,
                       String note, Long primaryCategoryId, String tags);

    //북마크 삭제
    Long deleteBookmark(Long memberId, Long bookmarkId);

    //북마크 조회 기록
    Bookmark recordView(Long memberId, Long bookmarkId);

    // 링크 조회 또는 생성 (URL 정규화)
    Link getOrCreateLink(String url, Long createdByMemberId);
    
    // 북마크 존재 여부 확인 (URL 기반)
    boolean checkBookmarkExistsByUrl(Long memberId, String url);

    // URL로부터 페이지 제목 추출
    String extractTitle(String url);
}
