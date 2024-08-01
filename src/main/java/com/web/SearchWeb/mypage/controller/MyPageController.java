package com.web.SearchWeb.mypage.controller;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
     * 마이페이지
     */
    @GetMapping("/myPage/{memberId}")
    public String myPage(@PathVariable int memberId, Model model){
        // 현재 사용자의 Authentication 객체 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 사용자가 로그인되어 있는지 확인
        if (authentication instanceof AnonymousAuthenticationToken) {
            return "redirect:/login"; // 사용자가 로그인되지 않은 경우, 로그인 페이지로 리디렉션
        }

        // 현재 로그인된 사용자의 정보 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        int currentUserId = userDetails.getMemberId();

        // 요청된 memberId와 현재 로그인된 사용자의 ID 비교
        if (currentUserId != memberId) {
            return "redirect:/access-denied"; // 접근이 허용되지 않은 경우, 접근 거부 페이지로 리디렉션
        }

        // 사용자의 ID로 사용자 조회
        Member member = memberService.findByMemberId(memberId);
        // 사용자 전체 북마크 목록 조회
        List<Bookmark> bookmarkWebsites =  bookmarkService.selectBookmarkList(memberId, "Oldest");

        model.addAttribute("member", member);
        model.addAttribute("bookmarkWebsites", bookmarkWebsites);
        return "mypage/myPage";
    }
    

    /**
     *  마이페이지 북마크 목록 조회
     */
    @GetMapping(value ="/myPage/{memberId}/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@PathVariable final int memberId,
                                                       @RequestParam(defaultValue = "All") String tag,
                                                       @RequestParam(defaultValue = "Oldest") String sort) {

        List<Bookmark> bookmarks;
        if("All".equals(tag) || tag == null){ // 태그가 All일 때, 북마크 전체조회
            bookmarks = bookmarkService.selectBookmarkList(memberId, sort);
        } else{ // 특정 태그로 북마크 조회
            System.out.println("tag: " + tag + ", sort: " + sort);
            bookmarks = bookmarkService.selectBookmarkListByTag(memberId, tag, sort);
        }
        return ResponseEntity.ok(bookmarks);
    }


    /**
     *  태그 조회
     */
    @GetMapping("/myPage/{memberId}/tags")
    public ResponseEntity<List<String>> getTags(@PathVariable final int memberId) {
        List<String> tags = bookmarkService.selectTags(memberId);
        return ResponseEntity.ok(tags);
    }
}
