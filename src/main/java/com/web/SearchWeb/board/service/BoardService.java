package com.web.SearchWeb.board.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardService {

    private final BoardDao boardDao;
    private final MemberService memberService;

    @Autowired
    public BoardService(BoardDao boardDao, MemberService memberService) {
        this.boardDao = boardDao;
        this.memberService = memberService;
    }


    /**
     *  게시글 생성
     */
    public int insertBoard(int memberId, BoardDto boardDto) {
        Member member = memberService.findByMemberId(memberId);
        boardDto.setNickname(member.getNickname());
        boardDto.setJob(member.getJob());
        boardDto.setMajor(member.getMajor());
        return boardDao.insertBoard(memberId, boardDto);
    }
}
