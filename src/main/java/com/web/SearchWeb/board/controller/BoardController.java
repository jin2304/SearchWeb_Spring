package com.web.SearchWeb.board.controller;

import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.board.service.BoardService;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


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
}
