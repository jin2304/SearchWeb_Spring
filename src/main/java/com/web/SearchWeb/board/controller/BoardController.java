package com.web.SearchWeb.board.controller;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.board.service.BoardService;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;


@Controller
public class BoardController {

    private final BoardService boardservice;
    private final MemberService memberservice;

    @Autowired
    public BoardController(BoardService boardservice, MemberService memberservice) {
        this.boardservice = boardservice;
        this.memberservice = memberservice;
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
    public String boardDetail(@PathVariable int boardId, Model model){
        Map<String, Object> boardData = boardservice.selectBoard(boardId);
        Board board = (Board) boardData.get("board");
        String[] hashtagsList = (String[]) boardData.get("hashtagsList");

        model.addAttribute("board", board);
        model.addAttribute("hashtagsList", hashtagsList);
        return "board/boardDetail";
    }

}
