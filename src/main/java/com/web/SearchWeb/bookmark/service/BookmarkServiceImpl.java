package com.web.SearchWeb.bookmark.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.domain.Link;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.command.BookmarkSearchCommand;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.SearchWeb.bookmark.error.BookmarkErrorCode;
import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.CommonErrorCode;

import com.web.SearchWeb.bookmark.dto.MemberTagResultDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
            log.warn("북마크 중복 저장 시도: memberId={}, folderId={}, linkId={}", memberId, memberFolderId, (link != null ? link.getLinkId() : "null"));
            throw BusinessException.from(BookmarkErrorCode.DUPLICATE_BOOKMARK);
        }
    }


    /**
     *  북마크 단일 조회
     */
    @Override
    public Bookmark selectBookmark(Long memberId, Long bookmarkId) {
        Bookmark bookmark = bookmarkDao.selectBookmark(memberId, bookmarkId);
        if (bookmark == null) {
            throw BusinessException.from(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }
        return bookmark;
    }


    /**
     *  북마크 목록 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(BookmarkSearchCommand command) {
        return bookmarkDao.selectBookmarkList(command);
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
                throw BusinessException.from(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
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
            throw BusinessException.from(BookmarkErrorCode.DUPLICATE_BOOKMARK);
        }
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
            throw BusinessException.from(BookmarkErrorCode.BOOKMARK_NOT_FOUND);
        }

        // 2. 관련 태그 관계 삭제 (Soft Delete)
        bookmarkDao.deleteBookmarkTags(bookmarkId, memberId);

        return bookmarkId;
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
        return bookmarkDao.checkBookmarkExistsByUrl(memberId, url) > 0;
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


    @Override
    public String extractTitle(String url) {
        log.info("[제목 추출 시작] URL: {}", url);
        
        // 유튜브 전용 처리
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            String youtubeTitle = extractYoutubeTitle(url);
            if (youtubeTitle != null) {
                log.info("[유튜브 제목 추출 성공] Title: {}", youtubeTitle);
                return youtubeTitle;
            }
        }

        try {
            Document doc = Jsoup.connect(url)
                    .timeout(5000)
                    .followRedirects(true)
                    .maxBodySize(512 * 1024) // 512KB만 읽기 (title은 <head>에 있으므로 충분)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                    .referrer("https://www.google.com/")
                    .get();

            // Fallback 체인: og:title → twitter:title → <title> → 도메인
            String ogTitle = doc.select("meta[property=og:title]").attr("content");
            if (ogTitle != null && !ogTitle.isBlank()) {
                log.info("[제목 추출 성공] Source: og:title, Title: {}", ogTitle.trim());
                return ogTitle.trim();
            }

            String twitterTitle = doc.select("meta[name=twitter:title]").attr("content");
            if (twitterTitle != null && !twitterTitle.isBlank()) {
                log.info("[제목 추출 성공] Source: twitter:title, Title: {}", twitterTitle.trim());
                return twitterTitle.trim();
            }

            String pageTitle = doc.title();
            if (pageTitle != null && !pageTitle.isBlank()) {
                log.info("[제목 추출 성공] Source: <title> tag, Title: {}", pageTitle.trim());
                return pageTitle.trim();
            }

            String domain = extractDomain(url);
            log.info("[제목 추출 결과] 메타데이터 없음, 도메인 사용: {}", domain);
            return domain;
        } catch (Exception e) {
            log.warn("[제목 추출 실패] URL: {}, 사유: {}", url, e.getMessage());
            return extractDomain(url);
        }
    }

    /**
     * 유튜브 oEmbed API를 이용한 제목 추출
     */
    private String extractYoutubeTitle(String url) {
        try {
            String oEmbedUrl = "https://www.youtube.com/oembed?url=" + url + "&format=json";
            Document doc = Jsoup.connect(oEmbedUrl)
                    .ignoreContentType(true)
                    .timeout(3000)
                    .get();
            
            String json = doc.text();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            return root.path("title").asText();
        } catch (Exception e) {
            log.warn("[유튜브 oEmbed 추출 실패] URL: {}, 사유: {}", url, e.getMessage());
            return null;
        }
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
