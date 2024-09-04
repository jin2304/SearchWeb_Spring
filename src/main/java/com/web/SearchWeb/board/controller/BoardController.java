package com.web.SearchWeb.board.controller;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.board.service.BoardService;
import com.web.SearchWeb.board.service.LikeBookmarkService;
import com.web.SearchWeb.bookmark.dto.BoardBookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import com.web.SearchWeb.bookmark.service.BookmarkService;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


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
     *  게시글 등록(
     */
    @PostMapping("/board/{memberId}/post")
    public String insertBoard(@PathVariable int memberId, BoardDto boardDto){

        System.out.println("memberId: " + memberId);
        System.out.println("boardDto: " + boardDto);

        int result = boardservice.insertBoard(memberId, boardDto);
        return "redirect:/board";
    }



    /**
     *  게시글 목록 조회(검색어, 최신순/인기순)
     */
    @GetMapping("/board")
    public String board(@RequestParam(defaultValue = "Newest") String sort,
                        @RequestParam(value = "query", required = false) String query,
                        @AuthenticationPrincipal UserDetails userDetails,
                        Model model){

        // 로그인된 사용자 정보를 Model에 추가
        if (userDetails != null) {
            String username = userDetails.getUsername();
            Member member = memberservice.findByUserName(username);
            model.addAttribute("member", member);
        }


        Map<String, Object> boardData = boardservice.selectBoardList(sort, query);
        List<Board> boards = (List<Board>) boardData.get("boards");
        List<String[]> hashtagsList = (List<String[]>) boardData.get("hashtagsList");


        model.addAttribute("boards", boards);
        model.addAttribute("hashtagsList", hashtagsList);
        return "board/board";
    }


    /**
     *  게시글 단일 조회
     */
    @GetMapping("/board/{boardId}")
    public String boardDetail(@PathVariable int boardId,@AuthenticationPrincipal UserDetails userDetails, Model model){
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");
        String[] hashtagsList = (String[]) boardData.get("hashtagsList");

        model.addAttribute("board", board);
        model.addAttribute("hashtagsList", hashtagsList);

        // 사용자가 로그인된 상태라면, 좋아요 여부를 확인하여 모델에 추가
        if (userDetails != null) {
            String username = userDetails.getUsername();
            Member loggedInMember = memberservice.findByUserName(username);

            boolean isLiked = likebookmarkservice.isLiked(boardId, loggedInMember.getMemberId());
            int isBookmarked = bookmarkService.isBookmarked(boardId, loggedInMember.getMemberId());
            model.addAttribute("isLiked", isLiked);
            model.addAttribute("isBookmarked", isBookmarked);
        }


        return "board/boardDetail";
    }


    /**
     *  게시글 수정
     */
    @PostMapping("/board/{boardId}/update")
    public String updateBoard(@PathVariable int boardId, BoardDto boardDto, @AuthenticationPrincipal UserDetails userDetails){

        // 현재 로그인한 사용자의 정보 가져오기
        String username = userDetails.getUsername();
        Member loggedInMember = memberservice.findByUserName(username);

        // 수정하려는 게시글의 정보 가져오기
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");

        // 게시글이 존재하지 않거나, 로그인한 사용자가 작성자가 아닌 경우 접근 거부
        if (board == null || board.getMember_memberId() != loggedInMember.getMemberId()) {
            return "redirect:/access-denied";
        }

        boardservice.updateBoard(loggedInMember.getMemberId(), boardId, boardDto);

        return "redirect:/board/{boardId}";
    }


    /**
     *  게시글 삭제
     */
    @PostMapping("/board/{boardId}/delete")
    public String deleteBoard(@PathVariable int boardId, @AuthenticationPrincipal UserDetails userDetails) {

        // 현재 로그인한 사용자의 정보 가져오기
        String username = userDetails.getUsername();
        Member loggedInMember = memberservice.findByUserName(username);

        // 삭제하려는 게시글의 정보 가져오기
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");

        // 게시글이 존재하지 않거나, 로그인한 사용자가 작성자가 아닌 경우 접근 거부
        if (board == null || board.getMember_memberId() != loggedInMember.getMemberId()) {
            return "redirect:/access-denied";
        }

        // 게시글 삭제 수행
        boardservice.deleteBoard(loggedInMember.getMemberId(), boardId);

        return "redirect:/board";
    }


    /**
     *  게시글 좋아요
     */
    @PostMapping("/board/{boardId}/like")
    @ResponseBody
    public Map<String, Object> toggleLike(@PathVariable int boardId, @AuthenticationPrincipal UserDetails userDetails) {

        //사용자 로그인 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        if (authentication instanceof AnonymousAuthenticationToken) {
            //사용자가 로그인되지 않은 경우, 로그인 페이지로 리디렉션
            System.out.println("로그인 되지 않았습니다");
            response.put("error", true);
            response.put("redirectUrl", "/login");
            return response;
        }

        // 현재 로그인한 사용자의 정보 가져오기
        String username = userDetails.getUsername();
        Member loggedInMember = memberservice.findByUserName(username);

        boolean isLiked = likebookmarkservice.toggleLike(boardId, loggedInMember.getMemberId());
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
                                                      @AuthenticationPrincipal UserDetails userDetails){
        Map<String, Object> response = new HashMap<>();

        // 사용자가 로그인되어 있는지 확인
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized 응답
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
