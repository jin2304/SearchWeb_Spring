package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;


import java.util.List;


public interface BookmarkService {
    //북마크 확인
    int checkBookmark(BookmarkCheckDto bookmark);
    //북마크 단일 조회
    Bookmark selectBookmark(int memberId, int bookmarkId);
    //북마크 목록 조회 (시간)
    List<Bookmark> selectBookmarkList(int memberId, String sort);
    //북마크 목록 조회 (시간, 태그)
    List<Bookmark> selectBookmarkListByTag(int memberId, String tag, String sort);
    //북마크 추가
    int insertBookmark(BookmarkDto bookmark);
    //북마크 추가 (사용자 직접 추가)
    int insertBookmarkForUser(BookmarkDto bookmarkDto);
    //북마크 수정
    int updateBookmark(BookmarkDto bookmarkDto, int bookmarkId);
    //북마크 삭제
    int deleteBookmark(BookmarkCheckDto bookmark);
    //북마크-웹사이트 조회
    List<BookmarkWebsite> selectBookmarkWebsite(int memberId);
    //사용자 태그 목록 조회
    List<String> selectTags(int memberId);
}
