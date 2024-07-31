package com.web.SearchWeb.bookmark.controller;


import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.main.domain.Website;
import com.web.SearchWeb.main.service.MainService;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 *
 *  코드 작성자: 서진영(jin2304)
 *  코드 설명 :CommentApiController는 맛집의 댓글과 관련된 기능을 담당하며, Rest API방식으로 설계했음.
 *  코드 주요 기능: 댓글 등록, 댓글 조회, 댓글 삭제, 댓글 수정
 *  코드 작성일: 2024.07.07 ~ 2024.07.31
 *
 */

@RestController
@RequestMapping("/mainList")
public class BookmarkApiController {

    private final BookmarkService bookmarkService;
    private final MainService mainService;

    @Autowired
    public BookmarkApiController(BookmarkService bookmarkService, MainService mainService) {
        this.bookmarkService = bookmarkService;
        this.mainService = mainService;
    }

    /**
     *  북마크 확인
     */
    @GetMapping("/bookmark/status/{websiteId}")
    public ResponseEntity<Integer> checkBookmark(@PathVariable final int websiteId){

        //사용자 로그인 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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
        BookmarkCheckDto bookmark = new BookmarkCheckDto(MemberId, websiteId);
        int result = bookmarkService.checkBookmark(bookmark);

        return ResponseEntity.ok(result);
    }


    /**
     *  북마크 목록 조회
     **/
    @GetMapping("/{memberId}/bookmarks")
    public List<Bookmark> selectBookmarkList(@PathVariable final int memberId){
        return bookmarkService.selectBookmarkList(memberId); //JSON 형태로 객체 리스트 반환
    }


    /**
     * 웹사이트 북마크 추가
     **/
    @PostMapping(value ="/{memberId}/bookmark/{websiteId}")
    public ResponseEntity<Integer> insertBookmark(@PathVariable final int memberId, @PathVariable final int websiteId){

        Website website = mainService.selectWebsite(websiteId);
        String name = website.getName();
        String description = website.getDescription();
        String url = website.getUrl();

        int result = bookmarkService.insertBookmark(new BookmarkDto(memberId, websiteId, name, description, url, null));
        return ResponseEntity.ok(result);
    }


    /**
     * 웹사이트 북마크 삭제
     **/
    @DeleteMapping(value = "/{memberId}/bookmark/{websiteId}")
    public ResponseEntity<Integer> deleteBookmark(@PathVariable final int memberId, @PathVariable final int websiteId) {
        int result = bookmarkService.deleteBookmark(new BookmarkCheckDto(memberId, websiteId));
        return ResponseEntity.ok(result);
    }
}
