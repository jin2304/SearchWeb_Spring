package com.web.SearchWeb.board.dao;

import com.web.SearchWeb.board.dto.BoardDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;


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
}

