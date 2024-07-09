package com.web.SearchWeb.mypage.controller;

import com.web.SearchWeb.bookmark.domain.BookmarkWebsite;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class MyPageController {

    private final BookmarkService bookmarkService;

    @Autowired
    public MyPageController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping("/myPage")
    public String myPage(Model model){
        // 현재 사용자의 Authentication 객체 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 사용자가 로그인되어 있는지 확인
        if (authentication instanceof AnonymousAuthenticationToken) {
            return "redirect:/login"; // 사용자가 로그인되지 않은 경우, 로그인 페이지로 리디렉션
        }
        // 사용자의 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        int memberId = userDetails.getMemberId();


        // 조인된 북마크 가져오기(Bookmark-Website)
        List<BookmarkWebsite> bookmarkWebsites =  bookmarkService.selectBookmarkWebsite(memberId);

        model.addAttribute("memberId", memberId);
        model.addAttribute("bookmarkWebsites", bookmarkWebsites);
        return "mypage/myPage";
    }
}
