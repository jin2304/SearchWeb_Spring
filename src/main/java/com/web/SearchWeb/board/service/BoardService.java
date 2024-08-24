package com.web.SearchWeb.board.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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


    /**
     *  게시글 목록 조회(검색어, 최신순/인기순)
     */
    public Map<String, Object> selectBoardList(String sort, String query) {
        List<Board> boards = boardDao.selectBoardList(query, sort);
        List<String[]> hashtagsList = new ArrayList<>();

        // 각 Board 객체의 해시태그를 배열로 변환하고, 리스트에 추가
        for (Board board : boards) {
            String[] hashtagsArray = board.getHashtags() != null ? board.getHashtags().split(" ") : new String[0];
            hashtagsList.add(hashtagsArray);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("boards", boards);
        result.put("hashtagsList", hashtagsList);

        return result;
    }
}
