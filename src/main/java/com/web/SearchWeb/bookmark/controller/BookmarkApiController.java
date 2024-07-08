package com.web.SearchWeb.bookmark.controller;


import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
/*@RequestMapping("/mainList")*/
public class BookmarkApiController {

    private BookmarkService bookmarkService;

    @Autowired
    public BookmarkApiController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }


    /**
     *  북마크 확인
     */
    @GetMapping("/mainList/bookmark/check/{websiteId}")
    public ResponseEntity<Integer> checkBookmark(@PathVariable final int websiteId){

        /** 사용자 로그인 확인 **/
        //현재 사용자의 Authentication 객체 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("authentication = " + authentication);

        //사용자가 로그인되어 있는지 확인
        if (authentication instanceof AnonymousAuthenticationToken) {
            //사용자가 로그인되지 않은 경우, 로그인 페이지로 리디렉션
            System.out.println("로그인 되지 않았습니다");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(0); // 로그인되지 않음을 클라이언트에 반환
        }


        // 사용자의 ID 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        int MemberId = userDetails.getMemberId();

        // 해당 유저가 해당 가게를 북마크했는지 여부를 서비스에서 확인하여 반환
        BookmarkCheckDto bookmarkCheckDto = new BookmarkCheckDto(MemberId, websiteId);
        System.out.println("bookmarkCheckDto = " + bookmarkCheckDto);

        int result = bookmarkService.checkBookmark(bookmarkCheckDto);
        System.out.println("result = " + result);

        return ResponseEntity.ok(result);
    }


    /**
     *  북마크 목록 조회
     **/
    @GetMapping("/mainList/{memberId}/bookmarks")
    public List<Bookmark> selectBookmarkList(@PathVariable final int memberId){
        System.out.println("ㅡㅡㅡ 북마크 목록 조회 ㅡㅡㅡ");
        System.out.println("memberId = " + memberId);
        List<Bookmark> bookmarks = bookmarkService.selectBookmarkList(memberId);
        System.out.println("bookmarks" + bookmarks);
        return bookmarks; //JSON 형태로 객체 리스트 반환
        //return ResponseEntity.ok(1);
    }

}
