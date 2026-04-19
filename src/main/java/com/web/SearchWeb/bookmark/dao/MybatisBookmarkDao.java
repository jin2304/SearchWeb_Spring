package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;
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
     *  북마크 추가
     */
    @Override
    public int insertBookmark(Bookmark bookmark) {
        return mapper.insertBookmark(bookmark);
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(Long memberId, Long bookmarkId) {
        return mapper.selectBookmark(memberId, bookmarkId);
    }


    @Override
    public List<Bookmark> selectBookmarkList(BookmarkSearchCommand searchCommand) {
        return mapper.selectBookmarkList(searchCommand);
    }


    /**
     *  매칭 폴더 ID 목록 조회
     */
    @Override
    public List<Long> selectMatchingFolderIds(BookmarkSearchCommand searchCommand) {
        return mapper.selectMatchingFolderIds(searchCommand);
    }


    /**
     *  북마크 수정
     */
    @Override
    public int updateBookmark(Bookmark bookmark) {
        return mapper.updateBookmark(bookmark);
    }


    /**
     *  북마크 삭제 (soft delete)
     */
    @Override
    public int deleteBookmark(Long memberId, Long bookmarkId) {
        return mapper.deleteBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 태그 연결 삭제
     */
    @Override
    public int deleteBookmarkTags(Long bookmarkId, Long memberId) {
        return mapper.deleteBookmarkTags(bookmarkId, memberId);
    }


    /**
     *  북마크 삭제 (Link ID 기반 - soft delete)
     */
    @Override
    public int deleteBookmarkByLink(Long memberId, Long linkId) {
        return mapper.deleteBookmarkByLink(memberId, linkId);
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
     *  링크 조회 (canonical_url로)
     */
    @Override
    public Link selectLinkByCanonicalUrl(String url) {
        return mapper.selectLinkByCanonicalUrl(url);
    }


    /**
     *  링크 추가
     */
    @Override
    public int insertLink(Link link) {
        return mapper.insertLink(link);
    }


    /**
     *  태그 등록 및 조회 (Insert & Select)
     */
    @Override
    public List<MemberTagResultDto> insertAndSelectTags(Long memberId, List<String> tagNames) {
        return mapper.insertAndSelectTags(memberId, tagNames);
    }


    /**
     *  북마크-태그 연결 일괄 추가 (Bulk Insert)
     */
    @Override
    public int insertBookmarkTags(Long bookmarkId, List<Long> tagIds) {
        return mapper.insertBookmarkTags(bookmarkId, tagIds);
    }

    @Override
    public boolean existsActiveBookmarkInFolder(Long memberFolderId) {
        return mapper.existsActiveBookmarkInFolder(memberFolderId);
    }
}
