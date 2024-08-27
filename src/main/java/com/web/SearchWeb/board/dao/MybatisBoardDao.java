package com.web.SearchWeb.board.dao;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisBoardDao implements BoardDao{

    private final BoardDao mapper;

    @Autowired
    public MybatisBoardDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(BoardDao.class);
    }


    /**
     *  게시글 생성
     */
    public int insertBoard(int memberId, BoardDto boardDto) {
        return mapper.insertBoard(memberId, boardDto);
    }


    /**
     *  게시글 목록 조회(검색어, 최신순/인기순)
     */
    public List<Board> selectBoardList(String query, String sort) {
        return mapper.selectBoardList(query, sort);
    }


    /**
     *  게시글 단일 조회
     */
    public Board selectBoard(int boardId) {
        return mapper.selectBoard(boardId);
    }


    /**
     *  게시글 수정
     */
    public int updateBoard(int boardId, BoardDto boardDto){
        return mapper.updateBoard(boardId, boardDto);
    }


    /**
     *  게시글 삭제
     */
    public int deleteBoard(int memberId, int boardId) {
        return mapper.deleteBoard(memberId, boardId);
    }
}

