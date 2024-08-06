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
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Book;
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
        model.addAttribute("member", member);

        return "mypage/myPage";
    }
    


    /**
     * 웹사이트 북마크 추가 (사용자 직접 추가)
     */
    @PostMapping(value ="/myPage/{memberId}/bookmark")
    public ResponseEntity<BookmarkDto> insertBookmark(@PathVariable final int memberId, @RequestBody BookmarkDto bookmarkdto){
        String name = bookmarkdto.getName();
        String description = bookmarkdto.getDescription();
        String url = bookmarkdto.getUrl();
        String tag = bookmarkdto.getTag();
        bookmarkService.insertBookmarkForUser(new BookmarkDto(memberId, 0, name, description, url, tag));
        return ResponseEntity.ok(bookmarkdto);
    }



    /**
     *  마이페이지 북마크 목록 조회
     */
    @GetMapping(value ="/myPage/{memberId}/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@PathVariable final int memberId,
                                                       @RequestParam(required = false) String query,
                                                       @RequestParam(defaultValue = "All") String tag,
                                                       @RequestParam(defaultValue = "Oldest") String sort) {
        System.out.println("query: " + query);
        System.out.println("tag: " + tag);
        System.out.println("sort: " + sort);

        List<Bookmark> bookmarks;
        if ((query == null || query.isEmpty()) && ("All".equals(tag) || tag == null)) {
            // 1. 전체 북마크 조회 (태그x, 검색어x)
            bookmarks = bookmarkService.selectBookmarkList(memberId, sort);
        } else if (query != null && !query.isEmpty()) { //검색어가 있는 경우
            // 2. 검색어로 북마크 조회 (태그x, 검색어o),
            // 3. 검색어와 특정 태그로 북마크 조회 (태그o, 검색어o)
            bookmarks = bookmarkService.selectBookmarkListByQuery(memberId, tag, sort, query);
        } else {
            // 4. 특정 태그로 북마크 조회 (태그o, 검색어x)
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


    /**
     *  마이페이지 북마크 단일 조회
     */
    @GetMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    public ResponseEntity<Bookmark> getBookmark(@PathVariable final int memberId, @PathVariable final int bookmarkId) {
        Bookmark bookmark = bookmarkService.selectBookmark(memberId, bookmarkId);
        System.out.println("Bookmark:" + bookmark);
        return ResponseEntity.ok(bookmark);
    }


    /**
     *  마이페이지 북마크 수정
     */
    @PutMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    public ResponseEntity<Integer> updateBookmark(@PathVariable final int memberId,
                                                  @PathVariable final int bookmarkId,
                                                  @RequestBody BookmarkDto bookmarkDto) {
        System.out.println("bookmarkDto" + bookmarkDto);
        int result = bookmarkService.updateBookmark(bookmarkDto, bookmarkId);
        System.out.println("result:  " + result);
        return ResponseEntity.ok(result);
    }


    /**
     *  마이페이지 북마크 삭제
     */
    @DeleteMapping("/myPage/{memberId}/bookmark/{bookmarkId}")
    public ResponseEntity<Integer> deleteBookmark(@PathVariable final int memberId, @PathVariable final int bookmarkId) {
        System.out.println("memberId" + memberId);
        int result = bookmarkService.deleteBookmarkMyPage(memberId, bookmarkId);
        System.out.println("result:  " + result);
        return ResponseEntity.ok(result);
    }
}
