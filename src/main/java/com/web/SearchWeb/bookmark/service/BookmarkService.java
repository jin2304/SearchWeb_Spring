package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;


import java.util.List;


public interface BookmarkService {
    //북마크 확인
    int checkBookmark(BookmarkCheckDto bookmark);
    //북마크 조회
    List<Bookmark> selectBookmarkList(int memberId);
    //북마크 태그 조회
    List<Bookmark> selectBookmarkListByTag(int memberId, String tag);
    //북마크 추가
    int insertBookmark(BookmarkDto bookmark);
    //북마크 추가 (사용자 직접 추가)
    int insertBookmarkForUser(BookmarkDto bookmarkDto);
    //북마크 삭제
    int deleteBookmark(BookmarkCheckDto bookmark);
    //북마크-웹사이트 조회
    List<BookmarkWebsite> selectBookmarkWebsite(int memberId);
    //사용자 태그 목록 조회
    List<String> selectTags(int memberId);
}
