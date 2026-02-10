package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.dto.request.BookmarkSearchRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;

@Service
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
        Link existingLink = bookmarkDao.selectLinkByCanonicalUrl(canonicalUrl);
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
        Link link = bookmarkDao.selectLinkByCanonicalUrl(canonicalUrl);
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
    public int insertBookmark(BookmarkDto bookmarkDto, String url) {
        // 링크 조회 또는 생성
        Link link = getOrCreateLink(url, bookmarkDto.getCreatedByMemberId());
        
        // 중복 확인 (기본 폴더 등에서)
        int exists = bookmarkDao.checkBookmarkExists(bookmarkDto.getCreatedByMemberId(), bookmarkDto.getMemberFolderId(), link.getLinkId());
        if (exists > 0) {
            return 0; // 이미 존재함
        }
        
        // 북마크 추가
        return bookmarkDao.insertBookmark(bookmarkDto, link.getLinkId());
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
