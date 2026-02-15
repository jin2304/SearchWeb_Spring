package com.web.SearchWeb.mypage.controller;

import com.web.SearchWeb.aop.OwnerCheck;
import com.web.SearchWeb.bookmark.controller.dto.BookmarkRequests;
import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.config.ApiResponse;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberUpdateDto;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 코드 작성자:
 *  - 서진영(jin2304)
 *
 * 코드 설명:
 *  - MyPageController는 사용자의 정보 및 사용자가 북마크한 웹사이트를 관리하는 컨트롤러
 * 
 * 코드 주요 기능:
 *  - 사용자 정보 조회, 사용자 프로필 수정
 *  - 마이페이지 북마크 추가(사용자 직접 추가), 북마크 목록 조회, 북마크 단일 조회, 태그 조회, 북마크 수정, 북마크 삭제
 *
 */
@Controller
public class MyPageController {

    private final BookmarkService bookmarkService;
    private final MemberService memberService;

    @Autowired
    public MyPageController(BookmarkService bookmarkService, MemberService memberService) {
        this.bookmarkService = bookmarkService;
        this.memberService = memberService;
    }


    /**
     * 마이페이지 (사용자 정보 조회)
     */
    @GetMapping("/myPage/{memberId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public String myPage(@PathVariable Long memberId, Model model){
        Member member = memberService.findByMemberId(memberId);
        model.addAttribute("member", member);
        return "mypage/myPage";
    }
    

    /**
     *  마이페이지 (사용자 프로필 수정)
     */
    @PutMapping("/myPage/{memberId}/profile")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Integer> updateProfile(@PathVariable final Long memberId, @RequestBody MemberUpdateDto memberUpdateDto) {
        return ResponseEntity.ok(memberService.updateMember(memberId, memberUpdateDto));
    }
    


    /**
     *  북마크 추가 (마이페이지에서 추가)
     */
    @PostMapping(value ="/myPage/{memberId}/bookmark")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Map<String, Object>> insertBookmark(@PathVariable final Long memberId,
                                                               @RequestBody BookmarkDto bookmarkDto,
                                                               @RequestParam String url){
        Map<String, Object> response = new HashMap<>();
        bookmarkDto.setCreatedByMemberId(memberId);

        Long bookmarkId = bookmarkService.insertBookmark(
            memberId,
            url,
            bookmarkDto.getMemberFolderId(),
            bookmarkDto.getDisplayTitle(),
            bookmarkDto.getNote(),
            bookmarkDto.getPrimaryCategoryId(),
            bookmarkDto.getTags()
        );

        response.put("success", bookmarkId != null && bookmarkId > 0);
        return ResponseEntity.ok(response);
    }



    /**
     *  마이페이지 북마크 목록 조회
     */
    @GetMapping(value ="/myPage/{memberId}/bookmarks")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<ApiResponse<List<Bookmark>>> getBookmarks(
            @PathVariable final Long memberId,
            @ModelAttribute BookmarkRequests.SearchDto searchDto) {
        List<Bookmark> bookmarks = bookmarkService.selectBookmarkList(searchDto.toCommand(memberId));
        return ResponseEntity.ok(ApiResponse.success(bookmarks));
    }


    /**
     *  마이페이지 북마크 단일 조회
     */
    @GetMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Bookmark> getBookmark(@PathVariable final Long memberId, @PathVariable final Long bookmarkId) {
        Bookmark bookmark = bookmarkService.selectBookmark(memberId, bookmarkId);
        return ResponseEntity.ok(bookmark);
    }


    /**
     *  마이페이지 북마크 수정
     */
    @PutMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<ApiResponse<Long>> updateBookmark(
            @PathVariable final Long memberId,
            @PathVariable final Long bookmarkId,
            @RequestBody BookmarkRequests.UpdateDto request) {
        
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
     *  마이페이지 북마크 삭제
     */
    @DeleteMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Map<String, Object>> deleteBookmark(@PathVariable final Long memberId, @PathVariable final Long bookmarkId) {
        Map<String, Object> response = new HashMap<>();
        int result = bookmarkService.deleteBookmark(memberId, bookmarkId);
        response.put("success", result > 0);
        return ResponseEntity.ok(response);
    }
}
