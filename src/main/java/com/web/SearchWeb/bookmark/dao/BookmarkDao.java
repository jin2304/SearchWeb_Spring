package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;

import java.util.List;

public interface BookmarkDao {
    //북마크 추가
    int insertBookmark(Bookmark bookmark);
    
    //북마크 단일 조회
    Bookmark selectBookmark(Long memberId, Long bookmarkId);
    
    //북마크 목록 조회
    List<Bookmark> selectBookmarkList(BookmarkSearchCommand searchCommand);

    //북마크 수정
    int updateBookmark(Bookmark bookmark);

    //북마크 삭제
    int deleteBookmark(Long memberId, Long bookmarkId);

    //북마크 태그 연결 삭제
    int deleteBookmarkTags(Long bookmarkId, Long memberId);

    //북마크 삭제 (Link ID 기반 - soft delete)
    int deleteBookmarkByLink(Long memberId, Long linkId);

    //북마크 링크 중복 확인 (동일 폴더에 동일 링크)
    int checkBookmarkExists(Long memberId, Long folderId, Long linkId);

    //상세 링크 조회 (정규화된 URL 기반)
    Link selectLinkByCanonicalUrl(String url);
    
    //링크 추가 (link 테이블)
    int insertLink(Link link);

    //URL 기반 북마크 존재 여부 확인 (Board Bridge용)
    int checkBookmarkExistsByUrl(Long memberId, String url);

    // 태그 등록 및 조회 (Insert & Select)
    List<MemberTagResultDto> insertAndSelectTags(Long memberId, List<String> tagNames);

    // 북마크-태그 연결 일괄 추가 (Bulk Insert)
    int insertBookmarkTags(Long bookmarkId, List<Long> tagIds);
}
