package com.web.SearchWeb.bookmark.controller;


import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * BookmarkApiController
 * - 북마크 API (member_saved_link + link 테이블 기반)
 */
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkApiController {

    private final BookmarkService bookmarkService;

    @Autowired
    public BookmarkApiController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    /**
     *  북마크 확인
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBookmark(@AuthenticationPrincipal Object currentUser, @RequestParam String url) {
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = getMemberId(currentUser);

        // 북마크 존재 여부 확인
        boolean exists = bookmarkService.checkBookmarkExistsByUrl(memberId, url);
        return ResponseEntity.ok(exists);
    }


    /**
     *  북마크 추가
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> insertBookmark(
            @AuthenticationPrincipal Object currentUser,
            @RequestBody BookmarkDto bookmarkDto,
            @RequestParam String url) {
        
        Map<String, Object> response = new HashMap<>();
        
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        bookmarkDto.setCreatedByMemberId(memberId);
        int result = bookmarkService.insertBookmark(bookmarkDto, url);
        response.put("success", result > 0);
        return ResponseEntity.ok(response);
    }


    /**
     *  북마크 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<Bookmark>> selectBookmarkList(
            @AuthenticationPrincipal Object currentUser,
            @RequestParam(required = false) Long folderId,
            @RequestParam(defaultValue = "Newest") String sort,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId) {
        
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<Bookmark> bookmarks = bookmarkService.selectBookmarkList(memberId, folderId, sort, query, categoryId);
        return ResponseEntity.ok(bookmarks);
    }


    /**
     *  북마크 단일 조회
     */
    @GetMapping("/{bookmarkId}")
    public ResponseEntity<Bookmark> selectBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId) {

        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Bookmark bookmark = bookmarkService.selectBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(bookmark);
    }


    /**
     *  북마크 수정
     */
    @PutMapping("/{bookmarkId}")
    public ResponseEntity<Map<String, Object>> updateBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId,
            @RequestBody BookmarkDto bookmarkDto) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        bookmarkDto.setCreatedByMemberId(memberId);
        int result = bookmarkService.updateBookmark(bookmarkDto, bookmarkId);
        response.put("success", result > 0);
        return ResponseEntity.ok(response);
    }


    /**
     *  북마크 삭제
     */
    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<Map<String, Object>> deleteBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        int result = bookmarkService.deleteBookmark(memberId, bookmarkId);
        response.put("success", result > 0);
        return ResponseEntity.ok(response);
    }


    /**
     * 현재 사용자의 memberId 추출
     */
    private Long getMemberId(Object currentUser) {
        if (currentUser instanceof UserDetails) {
            return ((CustomUserDetails) currentUser).getMemberId();
        } else if (currentUser instanceof OAuth2User) {
            return ((CustomOAuth2User) currentUser).getMemberId();
        }
        return null;
    }
}
