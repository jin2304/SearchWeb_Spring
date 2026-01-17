package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;
import com.web.SearchWeb.bookmark.dto.request.BookmarkSearchRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkDao bookmarkDao;

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
     *  게시판 북마크 확인
     */
    @Override
    public int checkBoardBookmark(BoardBookmarkCheckDto checkDto) {
        return bookmarkDao.checkBoardBookmark(checkDto);
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(int memberId, int bookmarkId) {
        return bookmarkDao.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 목록 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(int memberId, String tag, String sort, String query, Long folderId) {
        BookmarkSearchRequestDto searchRequest = BookmarkSearchRequestDto.builder()
                .memberId(memberId)
                .tag(tag)
                .sort(sort)
                .query(query)
                .folderId(folderId)
                .build();
        return bookmarkDao.selectBookmarkList(searchRequest);
    }


    /**
     *  북마크 추가 (메인리스트에서 추가)
     */
    @Override
    public int insertBookmark(BookmarkDto bookmark) {
        return bookmarkDao.insertBookmark(bookmark);
    }


    /**
     *  북마크 추가 (마이페이지에서 추가)
     */
    @Override
    public int insertBookmarkForUser(BookmarkDto bookmarkDto) {
        return bookmarkDao.insertBookmarkForUser(bookmarkDto);
    }


    /**
     *  북마크 추가 (게시판에서 추가)
     */
    @Override
    public int insertBookmarkForBoard(BookmarkDto bookmarkDto) {
        return bookmarkDao.insertBookmarkBoard(bookmarkDto);
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
     *  게시판 북마크 삭제
     */
    @Override
    public int deleteBookmarkBoard(BoardBookmarkCheckDto bookmark) {
        return bookmarkDao.deleteBookmarkBoard(bookmark);
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
    public List<String> selectTags(int memberId, Long folderId) {
        return bookmarkDao.selectTags(memberId, folderId);
    }


    /**
     *  게시글 북마크 여부 확인
     */
    public int isBookmarked(int boardId, int memberId) {
        return bookmarkDao.isBookmarked(boardId, memberId);
    }
}
