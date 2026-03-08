package com.web.SearchWeb.bookmark.controller;


import com.web.SearchWeb.bookmark.controller.dto.BookmarkRequests;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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
     *  북마크 추가
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> insertBookmark(
            @AuthenticationPrincipal Object currentUser,
            @RequestBody BookmarkRequests.CreateDto request) {

        // TODO: AOP 처리
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Long bookmarkId = bookmarkService.insertBookmark(
            memberId, 
            request.url, 
            request.memberFolderId,
            request.displayTitle, 
            request.note, 
            request.primaryCategoryId, 
            request.tags
        );
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(bookmarkId));
    }


    /**
     *  북마크 단일 조회
     */
    @GetMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Bookmark>> selectBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId) {

        // TODO: AOP 처리
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Bookmark bookmark = bookmarkService.selectBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(ApiResponse.success(bookmark));
    }


    /**
     *  북마크 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Bookmark>>> selectBookmarkList(
            @AuthenticationPrincipal Object currentUser,
            @ModelAttribute BookmarkRequests.SearchDto searchDto) {
        
        // TODO: AOP 처리
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<Bookmark> bookmarks = bookmarkService.selectBookmarkList(searchDto.toCommand(memberId));
        return ResponseEntity.ok(ApiResponse.success(bookmarks));
    }


    /**
     *  북마크 수정
     */
    @PutMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Long>> updateBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId,
            @RequestBody BookmarkRequests.UpdateDto request) {
        
        // TODO: AOP 처리
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Long updatedBookmarkId = bookmarkService.updateBookmark(
            memberId, 
            bookmarkId, 
            request.memberFolderId, 
            request.displayTitle, 
            request.note, 
            request.primaryCategoryId, 
            request.tags
        );
        return ResponseEntity.ok(ApiResponse.success(updatedBookmarkId));
    }


    /**
     *  북마크 삭제
     */
    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Long>> deleteBookmark(
            @AuthenticationPrincipal Object currentUser,
            @PathVariable Long bookmarkId) {
        
        // TODO: AOP 처리
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = getMemberId(currentUser);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Long deletedId = bookmarkService.deleteBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(ApiResponse.success(deletedId));
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
