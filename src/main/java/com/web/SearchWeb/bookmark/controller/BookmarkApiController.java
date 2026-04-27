package com.web.SearchWeb.bookmark.controller;


import com.web.SearchWeb.bookmark.controller.dto.BookmarkRequests;
import com.web.SearchWeb.bookmark.controller.dto.BookmarkSearchResponse;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.config.security.CurrentMemberId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @CurrentMemberId Long memberId,
            @RequestBody BookmarkRequests.CreateDto request) {
        
        Long bookmarkId = bookmarkService.insertBookmark(
            memberId, 
            request.getUrl(),
            request.getMemberFolderId(),
            request.getDisplayTitle(),
            request.getNote(),
            request.getPrimaryCategoryId(),
            request.getTags()
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
            @CurrentMemberId Long memberId,
            @PathVariable Long bookmarkId) {

        Bookmark bookmark = bookmarkService.selectBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(ApiResponse.success(bookmark));
    }


    /**
     *  북마크 목록 조회 (검색 결과 및 매칭 폴더 포함)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<BookmarkSearchResponse>> selectBookmarkList(
            @CurrentMemberId Long memberId,
            @ModelAttribute BookmarkRequests.SearchDto searchDto) {
        
        BookmarkSearchResponse results = bookmarkService.selectBookmarkList(searchDto.toCommand(memberId));
        return ResponseEntity.ok(ApiResponse.success(results));
    }


    /**
     *  북마크 수정
     */
    @PutMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Long>> updateBookmark(
            @CurrentMemberId Long memberId,
            @PathVariable Long bookmarkId,
            @RequestBody BookmarkRequests.UpdateDto request) {
        
        Long updatedBookmarkId = bookmarkService.updateBookmark(
            memberId, 
            bookmarkId, 
            request.getMemberFolderId(),
            request.getDisplayTitle(),
            request.getNote(),
            request.getPrimaryCategoryId(),
            request.getTags()
        );
        return ResponseEntity.ok(ApiResponse.success(updatedBookmarkId));
    }


    /**
     *  북마크 삭제
     */
    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Long>> deleteBookmark(
            @CurrentMemberId Long memberId,
            @PathVariable Long bookmarkId) {

        Long deletedId = bookmarkService.deleteBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(ApiResponse.success(deletedId));
    }


    /**
     *  북마크 조회 기록
     */
    @PatchMapping("/{bookmarkId}/read")
    public ResponseEntity<ApiResponse<Bookmark>> recordView(
            @CurrentMemberId Long memberId,
            @PathVariable Long bookmarkId) {

        Bookmark updatedBookmark = bookmarkService.recordView(memberId, bookmarkId);
        return ResponseEntity.ok(ApiResponse.success(updatedBookmark));
    }


    /**
     *  북마크 확인
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBookmark(@CurrentMemberId Long memberId, @RequestParam String url) {

        // 북마크 존재 여부 확인
        boolean exists = bookmarkService.checkBookmarkExistsByUrl(memberId, url);
        return ResponseEntity.ok(exists);
    }

    /**
     *  URL 분석 (제목 추출)
     */
    @GetMapping("/analyze")
    public ResponseEntity<ApiResponse<String>> analyzeUrl(@RequestParam String url) {
        String title = bookmarkService.extractTitle(url);
        return ResponseEntity.ok(ApiResponse.success(title));
    }


}
