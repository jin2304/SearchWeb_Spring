package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class MybatisBookmarkDao implements BookmarkDao {

    private final BookmarkDao mapper;

    @Autowired
    public MybatisBookmarkDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(BookmarkDao.class);
    }


    /**
     *  북마크 목록 조회 (시간)
     */
    @Override
    public List<Bookmark> selectBookmarkList(int memberId, String sort) {
        return mapper.selectBookmarkList(memberId, sort);
    }


    /**
     *  //북마크 목록 조회 (시간, 태그)
     */
    @Override
    public List<Bookmark> selectBookmarkListByTag(Map<String, Object> params) {
        return mapper.selectBookmarkListByTag(params);
    }


    /**
     *  북마크 확인
     */
    @Override
    public int checkBookmark(BookmarkCheckDto bookmark) {
        return mapper.checkBookmark(bookmark);
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(int memberId, int bookmarkId) {
        return mapper.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 추가
     */
    @Override
    public int insertBookmark(BookmarkDto bookmark) {
        return mapper.insertBookmark(bookmark);
    }


    /**
     *  북마크 추가 (사용자 직접 추가)
     */
    @Override
    public int insertBookmarkForUser(BookmarkDto bookmarkDto) {
        return mapper.insertBookmarkForUser(bookmarkDto);
    }


    /**
     *  북마크 수정
     */
    @Override
    public int updateBookmark(BookmarkDto bookmarkDto, int bookmarkId) {
        return mapper.updateBookmark(bookmarkDto, bookmarkId);
    }


    /**
     *  북마크 삭제
     */
    @Override
    public int deleteBookmark(BookmarkCheckDto bookmark) {
        return mapper.deleteBookmark(bookmark);
    }


    /**
     *  마이페이지 북마크 삭제
     */
    @Override
    public int deleteBookmarkMyPage(int memberId, int bookmarkId) {
        return mapper.deleteBookmarkMyPage(memberId, bookmarkId);
    }


    /**
     *  북마크-웹사이트 조회
     */
    @Override
    public List<BookmarkWebsite> selectBookmarkWebsite(int memberId) {
        return mapper.selectBookmarkWebsite(memberId);
    }


    /**
     *  사용자 태그 목록 조회
     */
    @Override
    public List<String> selectTags(int memberId) {
        return mapper.selectTags(memberId);
    }
}
