package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    private BookmarkDao bookmarkDao;

    @Autowired
    public BookmarkServiceImpl(BookmarkDao bookmarkDao) {
        this.bookmarkDao = bookmarkDao;
    }

    /**
     *  북마크 확인
     */
    @Override
    public int checkBookmark(BookmarkCheckDto bookmark) {
        return bookmarkDao.checkBookmark(bookmark);
    }


    /**
     *  북마크 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(int memberId) {
        return bookmarkDao.selectBookmarkList(memberId);
    }


    /**
     *  북마크 태그 조회
     */
    @Override
    public List<Bookmark> selectBookmarkListByTag(int memberId, String tag) {
        return bookmarkDao.selectBookmarkListByTag(memberId, tag);
    }


    /**
     *  북마크 추가
     */
    @Override
    public int insertBookmark(BookmarkDto bookmark) {
        return bookmarkDao.insertBookmark(bookmark);
    }


    /**
     *  북마크 추가 (사용자 직접 추가)
     */
    @Override
    public int insertBookmarkForUser(BookmarkDto bookmarkDto) {
        return bookmarkDao.insertBookmarkForUser(bookmarkDto);
    }

    /**
     *  북마크 삭제
     */
    @Override
    public int deleteBookmark(BookmarkCheckDto bookmark) {
        return bookmarkDao.deleteBookmark(bookmark);
    }


    /**
     *  북마크-웹사이트 조회
     */
    @Override
    public List<BookmarkWebsite> selectBookmarkWebsite(int memberId) {
        return bookmarkDao.selectBookmarkWebsite(memberId);
    }


    /**
     *  사용자 태그 목록 조회
     */
    @Override
    public List<String> selectTags(int memberId) {
        return bookmarkDao.selectTags(memberId);
    }
}
