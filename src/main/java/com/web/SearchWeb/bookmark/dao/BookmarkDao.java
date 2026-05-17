package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface BookmarkDao {
    //북마크 추가
    int insertBookmark(Bookmark bookmark);
    
    //북마크 단일 조회
    Bookmark selectBookmark(@Param("memberId") Long memberId, @Param("bookmarkId") Long bookmarkId);

    //북마크 기본 조회 (ID 기반, 권한 체크용)
    Bookmark findById(@Param("bookmarkId") Long bookmarkId);
    
    //북마크 목록 조회
    List<Bookmark> selectBookmarkList(BookmarkSearchCommand searchCommand);

    // 검색 조건에 매칭되는 북마크들이 속한 고유 폴더 ID 목록 조회
    List<Long> selectMatchingFolderIds(BookmarkSearchCommand searchCommand);

    // 검색 조건에 맞는 전체 북마크 개수 조회
    int countBookmarkList(BookmarkSearchCommand searchCommand);

    //북마크 수정
    int updateBookmark(Bookmark bookmark);

    //북마크 삭제
    int deleteBookmark(@Param("memberId") Long memberId, @Param("bookmarkId") Long bookmarkId);

    //북마크 조회수 증가 (읽음 처리)
    int incrementViewCount(@Param("bookmarkId") Long bookmarkId, @Param("memberId") Long memberId);

    //북마크 태그 연결 삭제
    int deleteBookmarkTags(@Param("bookmarkId") Long bookmarkId, @Param("memberId") Long memberId);

    //북마크 삭제 (Link ID 기반 - soft delete)
    int deleteBookmarkByLink(@Param("memberId") Long memberId, @Param("linkId") Long linkId);

    //북마크 링크 중복 확인 (동일 폴더에 동일 링크)
    int checkBookmarkExists(@Param("memberId") Long memberId, @Param("folderId") Long folderId, @Param("linkId") Long linkId);

    //상세 링크 조회 (정규화된 URL 기반)
    Link selectLinkByCanonicalUrl(String url);
    
    //링크 추가 (link 테이블)
    int insertLink(Link link);

    //URL 기반 북마크 존재 여부 확인 (Board Bridge용)
    int checkBookmarkExistsByUrl(@Param("memberId") Long memberId, @Param("url") String url);

    // 태그 등록 및 조회 (Insert & Select)
    List<MemberTagResultDto> insertAndSelectTags(@Param("memberId") Long memberId, @Param("tagNames") List<String> tagNames);

    // 북마크-태그 연결 일괄 추가 (Bulk Insert)
    int insertBookmarkTags(@Param("bookmarkId") Long bookmarkId, @Param("tagIds") List<Long> tagIds);

    // 폴더 내 활성 북마크 존재 여부
    boolean existsActiveBookmarkInFolder(Long memberFolderId);

    // 폴더 내 모든 북마크 논리 삭제
    int deleteBookmarksInFolder(@Param("memberId") Long memberId, @Param("folderId") Long folderId);

    // 폴더 내 모든 북마크의 태그 연결 논리 삭제
    int deleteBookmarkTagsInFolder(@Param("memberId") Long memberId, @Param("folderId") Long folderId);

    // 폴더별 컨텍스트 조회 (LLM 폴더 추천용 - LATERAL aggregation)
    List<Map<String, Object>> selectFolderContexts(@Param("memberId") Long memberId,
                                                   @Param("sampleLimit") int sampleLimit,
                                                   @Param("tagLimit") int tagLimit);
}
