package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.dto.request.BookmarkSearchRequestDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisBookmarkDao implements BookmarkDao {

    private final BookmarkDao mapper;

    @Autowired
    public MybatisBookmarkDao(SqlSession sqlSession) {
        mapper = sqlSession.getMapper(BookmarkDao.class);
    }


    /**
     *  북마크 중복 확인
     */
    @Override
    public int checkBookmarkExists(Long memberId, Long folderId, Long linkId) {
        return mapper.checkBookmarkExists(memberId, folderId, linkId);
    }


    /**
     *  URL 기반 북마크 존재 여부 확인 (Board Bridge용)
     */
    @Override
    public int checkBookmarkExistsByUrl(Long memberId, String url) {
        return mapper.checkBookmarkExistsByUrl(memberId, url);
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(Long memberId, Long bookmarkId) {
        return mapper.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 목록 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(BookmarkSearchRequestDto searchRequest) {
        return mapper.selectBookmarkList(searchRequest);
    }


    /**
     *  링크 조회 (canonical_url로)
     */
    @Override
    public Link selectLinkByCanonicalUrl(String canonicalUrl) {
        return mapper.selectLinkByCanonicalUrl(canonicalUrl);
    }


    /**
     *  링크 추가
     */
    @Override
    public int insertLink(Link link) {
        return mapper.insertLink(link);
    }


    /**
     *  북마크 추가
     */
    @Override
    public int insertBookmark(BookmarkDto bookmark, Long linkId) {
        return mapper.insertBookmark(bookmark, linkId);
    }


    /**
     *  북마크 수정
     */
    @Override
    public int updateBookmark(BookmarkDto bookmarkDto, Long bookmarkId) {
        return mapper.updateBookmark(bookmarkDto, bookmarkId);
    }


    /**
     *  북마크 삭제 (soft delete)
     */
    @Override
    public int deleteBookmark(Long memberId, Long bookmarkId) {
        return mapper.deleteBookmark(memberId, bookmarkId);
    }

    /**
     *  북마크 삭제 (Link ID 기반 - soft delete)
     */
    @Override
    public int deleteBookmarkByLink(Long memberId, Long linkId) {
        return mapper.deleteBookmarkByLink(memberId, linkId);
    }
}
