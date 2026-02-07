package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;

import java.util.List;


public interface BookmarkService {
    //북마크 추가
    int insertBookmark(BookmarkDto bookmarkDto, String url);
    
    //북마크 단일 조회
    Bookmark selectBookmark(Long memberId, Long bookmarkId);
    
    //북마크 목록 조회
    List<Bookmark> selectBookmarkList(Long memberId, Long folderId, String sort, String query, Long categoryId);
    
    //북마크 수정
    int updateBookmark(BookmarkDto bookmarkDto, Long bookmarkId);

    //북마크 삭제
    int deleteBookmark(Long memberId, Long bookmarkId);

    // 링크 조회 또는 생성 (URL 정규화)
    Link getOrCreateLink(String url, Long createdByMemberId);
    
    // 북마크 존재 여부 확인 (URL 기반)
    boolean checkBookmarkExistsByUrl(Long memberId, String url);
    
    // ========== Legacy Board-Bookmark Methods ==========
    
    //게시글 북마크 확인
    int checkBoardBookmark(BoardBookmarkCheckDto checkDto);
    
    //게시글 북마크 여부 확인 (for boardDetail)
    int isBookmarked(Long boardId, Long memberId);
    
    //게시글 북마크 추가
    int insertBookmarkForBoard(Long boardId, BookmarkDto bookmarkDto);
    
    //게시글 북마크 삭제
    int deleteBookmarkBoard(BoardBookmarkCheckDto checkDto);
}
