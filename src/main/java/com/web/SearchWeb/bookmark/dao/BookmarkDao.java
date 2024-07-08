package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;

import java.util.List;

public interface BookmarkDao {
    //북마크 확인
    int checkBookmark(BookmarkCheckDto bookmarkCheckDto);
    //북마크 조회
    List<Bookmark> selectBookmarkList(int userId);
    //북마크 추가
    int insertBookmark(BookmarkDto bookmark);
    //북마크 삭제
    int deleteBookmark(BookmarkDto bookmark);
}
