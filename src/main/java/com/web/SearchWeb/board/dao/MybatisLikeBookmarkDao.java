package com.web.SearchWeb.board.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class MybatisLikeBookmarkDao implements LikeBookmarkDao{

    private final LikeBookmarkDao mapper;

    @Autowired
    public MybatisLikeBookmarkDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(LikeBookmarkDao.class);
    }

    /**
     *  게시글 좋아요 상태 확인
     */
    @Override
    public Boolean isLikedByMember(int boardId, int memberId) {
        return mapper.isLikedByMember(boardId, memberId);
    }


    /**
     *  게시글 좋아요 추가
     */
    @Override
    public int likeBoard(int boardId, int memberId) {
        return mapper.likeBoard(boardId, memberId);
    }


    /**
     *  게시글 좋아요 취소
     */
    @Override
    public int unlikeBoard(int boardId, int memberId) {
        return mapper.unlikeBoard(boardId, memberId);
    }


    /**
     *  게시글 좋아요 수 조회
     */
    @Override
    public int countLikes(int boardId) {
        return mapper.countLikes(boardId);
    }
}