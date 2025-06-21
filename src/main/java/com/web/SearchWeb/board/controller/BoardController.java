package com.web.SearchWeb.board.controller;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.board.service.BoardService;
import com.web.SearchWeb.board.service.LikeBookmarkService;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
 *  - BoardController는 게시판 및 게시글 관련 기능을 처리하는 컨트롤러
 *
 * 코드 주요 기능:
 *  - 게시글 등록, 게시글 목록 조회(검색어, 최신순/인기순), 게시글 단일(상세) 조회, 게시글 수정, 게시글 삭제
 *  - 게시글 좋아요/북마크 추가 및 취소
 *
 * 코드 작성일:
 *  - 2024.08.24 ~ 2024.09.05
 */
@Controller
public class BoardController {

    private final BoardService boardservice;
    private final MemberService memberservice;
    private final LikeBookmarkService likebookmarkservice;
    private final BookmarkService bookmarkService;

    @Autowired
    public BoardController(BoardService boardservice, MemberService memberservice, LikeBookmarkService likebookmarkservice, BookmarkService bookmarkService) {
        this.boardservice = boardservice;
        this.memberservice = memberservice;
        this.likebookmarkservice = likebookmarkservice;
        this.bookmarkService = bookmarkService;
    }


    /**
     *  게시글 생성
     */
    @PostMapping("/board/{memberId}/post")
    public String insertBoard(@PathVariable int memberId, BoardDto boardDto){
        int result = boardservice.insertBoard(memberId, boardDto);
        return "redirect:/board";
    }



    /**
     *  게시글 페이지
     */
    @GetMapping("/board")
    public String boardPage() {
        return "board/board";  // HTML 껍데기만 반환 (JS가 데이터 로딩)
    }


    /**
     *  페이징된 게시글 목록 조회
     *  - 검색어, 최신순/인기순, 게시글타입
     *  - 스크롤 방식으로 페이징 지원
     *  - 클라이언트(JS)에서 스크롤 이벤트 발생 시 요청
     */
    @ResponseBody
    @GetMapping("api/boards")
    public Map<String, Object> getBoards(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(defaultValue = "newest") String sort,
                                         @RequestParam(required = false) String query,
                                         @RequestParam(defaultValue = "all") String postType) {
        return boardservice.selectBoardPage(page, size, sort, query, postType);
    }


    /**
     *  게시글 단일 조회
     */
    @GetMapping("/board/{boardId}")
    public String boardDetail(@PathVariable int boardId,@AuthenticationPrincipal Object currentUser, Model model){
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");
        String[] hashtagsList = (String[]) boardData.get("hashtagsList");

        model.addAttribute("board", board);
        model.addAttribute("hashtagsList", hashtagsList);

        // 사용자가 로그인된 상태라면, 좋아요 여부를 확인하여 모델에 추가
        if (currentUser != null && !"anonymousUser".equals(currentUser)) {
            int memberId;
            if(currentUser instanceof UserDetails) {
                // 일반 로그인 사용자 처리
                memberId = ((CustomUserDetails) currentUser).getMemberId();
            }
            else if(currentUser instanceof OAuth2User) {
                // 소셜 로그인 사용자 처리
                memberId = ((CustomOAuth2User) currentUser).getMemberId();
            } else {
                return "redirect:/error";
            }

            boolean isLiked = likebookmarkservice.isLiked(boardId, memberId);
            int isBookmarked = bookmarkService.isBookmarked(boardId, memberId);
            model.addAttribute("isLiked", isLiked);
            model.addAttribute("isBookmarked", isBookmarked);
        }


        return "board/boardDetail";
    }


    /**
     *  게시글 수정
     */
    @PostMapping("/board/{boardId}/update")
    public String updateBoard(@PathVariable int boardId, BoardDto boardDto, @AuthenticationPrincipal Object currentUser){


        // 로그인 된 경우
        int memberId;
        if(currentUser instanceof UserDetails) {
            // 일반 로그인 사용자 처리
            memberId = ((CustomUserDetails) currentUser).getMemberId();
        }
        else if(currentUser instanceof OAuth2User) {
            // 소셜 로그인 사용자 처리
            memberId = ((CustomOAuth2User) currentUser).getMemberId();
        } else {
            return "redirect:/error";
        }


        // 수정하려는 게시글의 정보 가져오기
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");

        // 게시글이 존재하지 않거나, 로그인한 사용자가 작성자가 아닌 경우 접근 거부
        if (board == null || (board.getMember_memberId() != memberId)) {
            return "redirect:/access-denied";
        }

        boardservice.updateBoard(boardId, boardDto);

        return "redirect:/board/{boardId}";
    }


    /**
     *  게시글 삭제
     */
    @PostMapping("/board/{boardId}/delete")
    public String deleteBoard(@PathVariable int boardId, @AuthenticationPrincipal Object currentUser) {

        // 로그인 된 경우
        int memberId;
        if(currentUser instanceof UserDetails) {
            // 일반 로그인 사용자 처리
            memberId = ((CustomUserDetails) currentUser).getMemberId();
        }
        else if(currentUser instanceof OAuth2User) {
            // 소셜 로그인 사용자 처리
            memberId = ((CustomOAuth2User) currentUser).getMemberId();
        } else {
            return "redirect:/error";
        }

        // 삭제하려는 게시글의 정보 가져오기
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");

        // 게시글이 존재하지 않거나, 로그인한 사용자가 작성자가 아닌 경우 접근 거부
        if (board == null || (board.getMember_memberId() != memberId)) {
            return "redirect:/access-denied";
        }

        // 게시글 삭제 수행
        boardservice.deleteBoard(memberId, boardId);

        return "redirect:/board";
    }


    /**
     *  게시글 좋아요
     */
    @PostMapping("/board/{boardId}/like")
    @ResponseBody
    public Map<String, Object> toggleLike(@PathVariable int boardId, @AuthenticationPrincipal Object currentUser) {

        Map<String, Object> response = new HashMap<>();

        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            response.put("error", true);
            response.put("redirectUrl", "/login");
            return response;
        }

        // 로그인 된 경우
        int memberId;
        if(currentUser instanceof UserDetails) {
            // 일반 로그인 사용자 처리
            memberId = ((CustomUserDetails) currentUser).getMemberId();
        }
        else if(currentUser instanceof OAuth2User) {
            // 소셜 로그인 사용자 처리
            memberId = ((CustomOAuth2User) currentUser).getMemberId();
        } else {
            response.put("error", true);
            return response;
        }

        boolean isLiked = likebookmarkservice.toggleLike(boardId, memberId);
        response.put("isLiked", isLiked);
        return response;
    }


    /**
     *  북마크 추가 (게시글에서 추가)
     */
    @PostMapping(value ="/board/{boardId}/bookmark/{memberId}")
    public ResponseEntity<Map<String, Object>> toggleBookmark(
                                                      @PathVariable final int boardId,
                                                      @PathVariable final int memberId,
                                                      @RequestBody BookmarkDto bookmarkDto,
                                                      @AuthenticationPrincipal Object currentUser){
        Map<String, Object> response = new HashMap<>();

        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }

        // 사용자가 이미 해당 게시글을 북마크했는지 확인
        BoardBookmarkCheckDto checkDto = new BoardBookmarkCheckDto(memberId, boardId);
        int bookmarkExists = bookmarkService.checkBoardBookmark(checkDto);

        if (bookmarkExists == 0) {
            // 북마크가 안 되어 있으면 북마크 추가
            bookmarkService.insertBookmarkForBoard(bookmarkDto);
            boardservice.incrementBookmarkCount(boardId); // 북마크 추가 시 게시글의 북마크 수 증가
            response.put("action", "bookmarked");
        } else {
            // 이미 북마크가 되어 있으면 북마크 해제
            bookmarkService.deleteBookmarkBoard(checkDto);
            boardservice.decrementBookmarkCount(boardId); // 북마크 해제 시 게시글의 북마크 수 감소
            response.put("action", "unbookmarked");
        }
        return ResponseEntity.ok(response);
    }

}
