package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.dto.request.BookmarkSearchRequestDto;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.SearchWeb.bookmark.error.BookmarkErrorCode;
import com.web.SearchWeb.config.BusinessException;
import com.web.SearchWeb.config.CommonErrorCode;

import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkDao bookmarkDao;

    @Autowired
    public BookmarkServiceImpl(BookmarkDao bookmarkDao) {
        this.bookmarkDao = bookmarkDao;
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(Long memberId, Long bookmarkId) {
        return bookmarkDao.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 목록 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(Long memberId, Long folderId, String sort, String query, Long categoryId) {
        BookmarkSearchRequestDto searchRequest = BookmarkSearchRequestDto.builder()
                .memberId(memberId)
                .folderId(folderId)
                .sort(sort)
                .query(query)
                .categoryId(categoryId)
                .build();
        return bookmarkDao.selectBookmarkList(searchRequest);
    }


    /**
     *  링크 조회 또는 생성 (URL 정규화)
     */
    @Override
    @Transactional
    public Link getOrCreateLink(String url, Long createdByMemberId) {
        // URL 정규화 (canonical URL 생성)
        String canonicalUrl = normalizeUrl(url);
        
        // 기존 링크 조회
        Link existingLink = bookmarkDao.selectLinkByUrl(url);
        if (existingLink != null) {
            return existingLink;
        }
        
        // 새 링크 생성
        Link newLink = Link.builder()
                .canonicalUrl(canonicalUrl)
                .originalUrl(url)
                .domain(extractDomain(url))
                .title(url)  // 기본값, 나중에 메타데이터 추출로 업데이트
                .primaryCategoryId(1L)  // 기본 카테고리
                .createdByMemberId(createdByMemberId)
                .build();
        
        bookmarkDao.insertLink(newLink);
        return newLink;
    }


    /**
     *  북마크 존재 여부 확인 (URL 기반)
     */
    @Override
    public boolean checkBookmarkExistsByUrl(Long memberId, String url) {
        String canonicalUrl = normalizeUrl(url);
        // Link가 존재하는지 먼저 확인 (최적화)
        Link link = bookmarkDao.selectLinkByUrl(url);
        if (link == null) {
            return false;
        }
        // Link ID로 북마크 테이블 조회
        return bookmarkDao.checkBookmarkExistsByUrl(memberId, url) > 0;
    }


    /**
     *  북마크 추가
     */
    @Override
    @Transactional
    public Long insertBookmark(Long memberId, String url, Long memberFolderId, String displayTitle, 
                              String note, Long primaryCategoryId, String tags) {
        // 링크 조회 또는 생성
        Link link = getOrCreateLink(url, memberId);

        // TODO: 링크 분석 및 폴더 서비스 완성 후 제거 - 임시 기본 폴더 ID 설정
        if (memberFolderId == null) {
            memberFolderId = 1L;  // 임시 하드코딩 값
            log.warn("memberFolderId가 null이어서 임시 기본값(1)을 사용합니다. 링크 분석 및 폴더 서비스 연동 후 제거 필요.");
        }

        // Entity 생성
        Bookmark bookmark = Bookmark.builder()
                .linkId(link.getLinkId())
                .memberFolderId(memberFolderId)
                .displayTitle(displayTitle)
                .note(note)
                .primaryCategoryId(primaryCategoryId)
                .createdByMemberId(memberId)
                .build();

        // 북마크 추가
        try {
            int result = bookmarkDao.insertBookmark(bookmark);

            // 태그 처리 및 저장
            if (result > 0) {
                if (tags != null && !tags.isEmpty()) {
                     // MyBatis의 useGeneratedKeys="true" 설정에 의해 insert 성공 시, bookmark.bookmarkId에 생성된 PK가 자동으로 채워짐
                    processAndCreateTags(bookmark.getBookmarkId(), memberId, tags);
                }
                return bookmark.getBookmarkId();
            }
            throw BusinessException.from(CommonErrorCode.INTERNAL_SERVER_ERROR);
        } catch (DataIntegrityViolationException e) {
            log.warn("북마크 중복 저장 시도: memberId={}, folderId={}, linkId={}", memberId, memberFolderId, link.getLinkId());
            throw BusinessException.from(BookmarkErrorCode.DUPLICATE_BOOKMARK);
        }
    }

    /**
     *  북마크 수정
     */
    @Override
    public int updateBookmark(BookmarkDto bookmarkDto, Long bookmarkId) {
        return bookmarkDao.updateBookmark(bookmarkDto, bookmarkId);
    }


    /**
     *  북마크 삭제 (soft delete)
     */
    @Override
    public int deleteBookmark(Long memberId, Long bookmarkId) {
        return bookmarkDao.deleteBookmark(memberId, bookmarkId);
    }


     /**
     * URL 정규화 (canonical URL 생성)
     */
    private String normalizeUrl(String url) {
        try {
            URI uri = new URI(url);
            // 프로토콜 + 호스트 + 경로 (쿼리스트링, 프래그먼트 제거)
            String normalized = uri.getScheme() + "://" + uri.getHost();
            if (uri.getPath() != null && !uri.getPath().isEmpty()) {
                normalized += uri.getPath();
            }
            // 끝의 슬래시 제거
            return normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
        } catch (Exception e) {
            return url;  // 정규화 실패 시 원본 반환
        }
    }


    /**
     * URL에서 도메인 추출
     */
    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            return uri.getHost();
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 태그 문자열 처리 및 저장
     * @param bookmarkId 북마크 ID
     * @param memberId 회원 ID
     * @param tags 태그 문자열 (띄어쓰기 또는 콤마 구분)
     */
    private void processAndCreateTags(Long bookmarkId, Long memberId, String tags) {
        if (tags == null || tags.isBlank()) return;
    
        // 1. 태그 파싱 및 중복 제거
        Set<String> uniqueTags = new HashSet<>();
        String[] splitTags = tags.split("[,\\s]+");
        for (String tag : splitTags) {
            if (!tag.isBlank()) {
                uniqueTags.add(tag.trim());
            }
        }
        
        if (uniqueTags.isEmpty()) return;
        
        List<String> tagNames = new ArrayList<>(uniqueTags);

        // 2. 태그 등록 및 조회 (Insert & Select) - CTE를 사용하여 한 번의 쿼리로 처리
        // 새로운 태그는 생성하고, 기존 태그는 조회하여 모든 태그의 ID를 반환함
        List<MemberTagResultDto> allTags = bookmarkDao.insertAndSelectTags(memberId, tagNames);
        
        // 최종 태그 ID 목록 추출
        List<Long> finalTagIds = allTags.stream()
                .map(MemberTagResultDto::getMemberTagId)
                .collect(Collectors.toList());

        // 3. 북마크-태그 연결 일괄 추가 (Bulk Insert)
        if (!finalTagIds.isEmpty()) {
            bookmarkDao.insertBookmarkTags(bookmarkId, finalTagIds);
        }
    }
    
    
    // ========== Legacy Board-Bookmark Methods ==========
    
    /**
     * 게시글 북마크 확인 (Legacy)
     * TODO: 새 스키마에서는 board-bookmark 관계가 없음. 현재는 0 반환
     */
    @Override
    public int checkBoardBookmark(BoardBookmarkCheckDto checkDto) {
        // 새 스키마에 board-bookmark 테이블이 없으므로 항상 0 반환
        return 0;
    }
    
    /**
     * 게시글 북마크 여부 확인 (for boardDetail)
     * TODO: 새 스키마에서는 board-bookmark 관계가 없음. 현재는 0 반환
     */
    @Override
    public int isBookmarked(Long boardId, Long memberId) {
        // 새 스키마에 board-bookmark 테이블이 없으므로 항상 0 반환
        return 0;
    }
    
    /**
     * 게시글 북마크 추가 (Legacy)
     * TODO: 새 스키마에서는 board-bookmark 관계가 없음. 현재는 0 반환
     */
    @Override
    public int insertBookmarkForBoard(Long boardId, BookmarkDto bookmarkDto) {
        // 새 스키마에 board-bookmark 테이블이 없으므로 아무 작업 안함
        return 0;
    }
    
    /**
     * 게시글 북마크 삭제 (Legacy)
     * TODO: 새 스키마에서는 board-bookmark 관계가 없음. 현재는 0 반환
     */
    @Override
    public int deleteBookmarkBoard(BoardBookmarkCheckDto checkDto) {
        // 새 스키마에 board-bookmark 테이블이 없으므로 아무 작업 안함
        return 0;
    }


   
}
