package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.controller.dto.BookmarkSearchResponse;
import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;
import com.web.SearchWeb.bookmark.service.command.BookmarkFolderTarget;
import com.web.SearchWeb.bookmark.controller.dto.BookmarkCreateResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.SearchWeb.bookmark.error.BookmarkErrorCode;
import com.web.SearchWeb.bookmark.error.BookmarkException;
import com.web.SearchWeb.config.exception.CommonErrorCode;

import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import com.web.SearchWeb.folder.service.MemberFolderService;
import com.web.SearchWeb.linkanalysis.service.LinkMetadataExtractor;
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
    private final LinkMetadataExtractor linkMetadataExtractor;
    private final MemberFolderService memberFolderService;

    @Autowired
    public BookmarkServiceImpl(BookmarkDao bookmarkDao, LinkMetadataExtractor linkMetadataExtractor, MemberFolderService memberFolderService) {
        this.bookmarkDao = bookmarkDao;
        this.linkMetadataExtractor = linkMetadataExtractor;
        this.memberFolderService = memberFolderService;
    }


    /**
     * 단일 트랜잭션에서 폴더를 확정하고 북마크를 저장합니다.
     */
    @Override
    @Transactional
    public BookmarkCreateResponse insertBookmark(Long memberId, String url, String displayTitle, String note,
                                               Long primaryCategoryId, String tags, BookmarkFolderTarget folderTarget) {
        
        // 요청으로 전달된 폴더 타겟을 바탕으로 실제 저장될 폴더 ID를 확정
        Long resolvedFolderId = resolveMemberFolderId(memberId, folderTarget);

        // 링크 조회 또는 생성
        Link link = getOrCreateLink(url, memberId);

        // Entity 생성
        Bookmark bookmark = Bookmark.builder()
                .linkId(link.getLinkId())
                .memberFolderId(resolvedFolderId)
                .displayTitle(displayTitle)
                .note(note)
                .primaryCategoryId(primaryCategoryId)
                .createdByMemberId(memberId)
                .build();

        int insertedCount = bookmarkDao.insertBookmark(bookmark);
        if (insertedCount == 0) {
            Long existingBookmarkId = bookmarkDao.selectActiveBookmarkId(
                    memberId,
                    resolvedFolderId,
                    link.getLinkId()
            );
            if (existingBookmarkId == null) {
                throw BookmarkException.of(CommonErrorCode.INTERNAL_SERVER_ERROR);
            }
            return new BookmarkCreateResponse(existingBookmarkId, false, resolvedFolderId);
        }

        Long bookmarkId = bookmark.getBookmarkId();
        if (bookmarkId == null) {
            throw BookmarkException.of(CommonErrorCode.INTERNAL_SERVER_ERROR);
        }

        if (tags != null && !tags.isEmpty()) {
            processAndCreateTags(bookmarkId, memberId, tags);
        }
        return new BookmarkCreateResponse(bookmarkId, true, resolvedFolderId);
    }

    
    private Long resolveMemberFolderId(Long memberId, BookmarkFolderTarget folderTarget) {
        if (folderTarget == null) {
            throw BookmarkException.of(BookmarkErrorCode.INVALID_FOLDER_TARGET);
        }

        return switch (folderTarget.type()) {
            case EXISTING -> memberFolderService
                    .get(memberId, folderTarget.memberFolderId())
                    .getMemberFolderId();
            case CREATE_IF_ABSENT -> memberFolderService
                    .getOrCreateRootFolderIdIgnoreCase(memberId, folderTarget.folderName());
            case UNORGANIZED -> memberFolderService.getOrCreateUnorganizedFolderId(memberId);
        };
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(Long memberId, Long bookmarkId) {
        Bookmark bookmark = bookmarkDao.selectBookmark(memberId, bookmarkId);
        if (bookmark == null) {
            // 상세 조회를 통한 원인 파악 (404 vs 403)
            validateBookmarkOwner(bookmarkId, memberId);
            // 위에서 예외가 발생하지 않았다면 (그럴 리 없지만) 기본 NotFound 처리
            throw BookmarkException.of(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }
        return bookmark;
    }


    /**
     *  북마크 목록 조회 (검색 결과 및 매칭 폴더 포함)
     */
    @Override
    public BookmarkSearchResponse selectBookmarkList(BookmarkSearchCommand command) {
        List<Bookmark> bookmarks = bookmarkDao.selectBookmarkList(command);
        List<Long> matchingFolderIds = bookmarkDao.selectMatchingFolderIds(command);
        int totalCount = bookmarkDao.countBookmarkList(command);
        
        return BookmarkSearchResponse.builder()
                .bookmarks(bookmarks)
                .matchingFolderIds(matchingFolderIds)
                .totalCount(totalCount)
                .build();
    }


    /**
     *  북마크 수정
     */
    @Override
    @Transactional
    public Long updateBookmark(Long memberId, Long bookmarkId, Long memberFolderId, String displayTitle,
                               String note, Long primaryCategoryId, String tags) {
        try {
            // 1. Entity 생성 (도메인 생성 로직을 서비스 계층으로 이동)
            Bookmark bookmark = Bookmark.builder()
                    .bookmarkId(bookmarkId)
                    .memberFolderId(memberFolderId)
                    .displayTitle(displayTitle)
                    .note(note)
                    .primaryCategoryId(primaryCategoryId)
                    .createdByMemberId(memberId)
                    .build();

            // 2. 북마크 기본 정보 수정
            int result = bookmarkDao.updateBookmark(bookmark);

            if (result == 0) {
                // 수정 실패 시 원인 파악 (404 vs 403)
                validateBookmarkOwner(bookmarkId, memberId);
                throw BookmarkException.of(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
            }

            // 3. 태그 수정
            if (tags != null) {
                // 기존 태그 관계 삭제 (Soft Delete)
                bookmarkDao.deleteBookmarkTags(bookmarkId, memberId);

                // 새 태그 등록 및 관계 생성/재활성화 (빈 문자열이면 모든 태그 제거)
                if (!tags.isBlank()) {
                    processAndCreateTags(bookmarkId, memberId, tags);
                }
            }

            return bookmarkId;
        } catch (DataIntegrityViolationException e) {
            log.error("북마크 수정 중 데이터 무결성 위반: bookmarkId={}, memberId={}", bookmarkId, memberId, e);
            throw BookmarkException.of(BookmarkErrorCode.DUPLICATE_BOOKMARK);
        }
    }


    /**
     *  북마크 조회 기록 (view_count 증가, last_viewed_at 업데이트)
     */
    @Override
    @Transactional
    public Bookmark recordView(Long memberId, Long bookmarkId) {
        int affected = bookmarkDao.incrementViewCount(bookmarkId, memberId);
        if (affected == 0) {
            // 업데이트 실패 시 원인 파악 (404 vs 403)
            validateBookmarkOwner(bookmarkId, memberId);
            throw BookmarkException.of(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }
        return bookmarkDao.selectBookmark(memberId, bookmarkId);
    }


    /**
     *  북마크 삭제 (soft delete)
     */
    @Override
    @Transactional
    public Long deleteBookmark(Long memberId, Long bookmarkId) {
        // 1. 북마크 삭제 (Soft Delete)
        int result = bookmarkDao.deleteBookmark(memberId, bookmarkId);

        if (result == 0) {
            // 삭제 실패 시 원인 파악 (404 vs 403)
            validateBookmarkOwner(bookmarkId, memberId);
            throw BookmarkException.of(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }

        // 2. 관련 태그 관계 삭제 (Soft Delete)
        bookmarkDao.deleteBookmarkTags(bookmarkId, memberId);

        return bookmarkId;
    }




    /**
     *  북마크 소유권 및 존재 여부 검증 (에러 구분용)
     */
    private void validateBookmarkOwner(Long bookmarkId, Long memberId) {
        Bookmark bookmark = bookmarkDao.findById(bookmarkId);
        if (bookmark == null || bookmark.getDeletedAt() != null) {
            throw BookmarkException.of(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }
        if (!bookmark.getCreatedByMemberId().equals(memberId)) {
            throw BookmarkException.of(BookmarkErrorCode.ACCESS_DENIED);
        }
    }


    // ========== Helper Methods ==========
    /**
     *  링크 조회 또는 생성 (URL 정규화)
     */
    @Override
    @Transactional
    public Link getOrCreateLink(String url, Long createdByMemberId) {
        // URL 정규화 (canonical URL 생성)
        String canonicalUrl = normalizeUrl(url);

        // 정규화된 URL로 기존 링크가 있는지 확인 (데이터 정합성 보장)
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
        return bookmarkDao.checkBookmarkExistsByUrl(memberId, canonicalUrl) > 0;
    }


    /**
     * URL 정규화 (canonical URL 생성)
     * 식별에 필요한 핵심 파라미터(예: 유튜브 v)는 보존하고 나머지는 제거함
     */
    private String normalizeUrl(String url) {
        if (url == null || url.isBlank()) return "";
        try {
            URI uri = new URI(url.trim()).normalize();
            
            String scheme = (uri.getScheme() != null) ? uri.getScheme().toLowerCase() : "https";
            String host = (uri.getHost() != null) ? uri.getHost().toLowerCase() : "";
            String path = uri.getPath();
            String query = uri.getQuery();

            StringBuilder sb = new StringBuilder();
            sb.append(scheme).append("://").append(host);

            if (path != null && !path.isEmpty()) {
                if (path.length() > 1 && path.endsWith("/")) {
                    path = path.substring(0, path.length() - 1);
                }
                sb.append(path);
            }

            // 식별 파라미터 처리 (Whitelisting)
            if (query != null && !query.isEmpty()) {
                String[] params = query.split("&");
                StringBuilder filteredQuery = new StringBuilder();
                
                for (String param : params) {
                    // 유튜브 동영상 고유 ID (v) 보존
                    if (param.startsWith("v=")) {
                        if (filteredQuery.length() > 0) filteredQuery.append("&");
                        filteredQuery.append(param);
                    }
                    // 추가적인 식별 파라미터가 필요하면 여기에 추가 가능
                }

                if (filteredQuery.length() > 0) {
                    sb.append("?").append(filteredQuery.toString());
                }
            }

            return sb.toString();
        } catch (Exception e) {
            return url.trim();
        }
    }

    
    /**
     *  URL 제목 분석
     */
    @Override
    public String extractTitle(String url) {
        return linkMetadataExtractor.extract(url).getTitle();
    }

    /**
     * URL에서 도메인 추출
     */
    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            return host != null ? host : url;
        } catch (Exception e) {
            return url;
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
}
