package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(int memberId, int bookmarkId) {
        return bookmarkDao.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 목록 조회 (시간)
     */
    @Override
    public List<Bookmark> selectBookmarkList(int memberId, String sort) {
        return bookmarkDao.selectBookmarkList(memberId, sort);
    }


    /**
     *  북마크 목록 조회 (시간, 태그)
     */
    @Override
    public List<Bookmark> selectBookmarkListByTag(int memberId, String tag, String sort) {
        Map<String, Object> params = new HashMap<>();
        params.put("member_memberId", memberId);
        params.put("tag", tag);
        params.put("sort", sort);
        return bookmarkDao.selectBookmarkListByTag(params);
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
     *  북마크 수정
     */
    @Override
    public int updateBookmark(BookmarkDto bookmarkDto, int bookmarkId) {
        return bookmarkDao.updateBookmark(bookmarkDto, bookmarkId);
    }


    /**
     *  북마크 삭제
     */
    @Override
    public int deleteBookmark(BookmarkCheckDto bookmark) {
        return bookmarkDao.deleteBookmark(bookmark);
    }


    /**
     *  마이페이지 북마크 삭제
     */
    @Override
    public int deleteBookmarkMyPage(int memberId, int bookmarkId) {
        return bookmarkDao.deleteBookmarkMyPage(memberId, bookmarkId);
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
