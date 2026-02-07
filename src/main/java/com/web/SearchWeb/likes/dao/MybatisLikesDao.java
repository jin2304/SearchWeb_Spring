package com.web.SearchWeb.likes.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class MybatisLikesDao implements LikesDao {

    private final LikesDao mapper;

    @Autowired
    public MybatisLikesDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(LikesDao.class);
    }

    /**
     *  게시글 좋아요 상태 확인
     */
    @Override
    public Boolean isLikedByMember(Long boardId, Long memberId) {
        return mapper.isLikedByMember(boardId, memberId);
    }


    /**
     *  게시글 좋아요 추가
     */
    @Override
    public int likeBoard(Long boardId, Long memberId) {
        return mapper.likeBoard(boardId, memberId);
    }


    /**
     *  게시글 좋아요 취소
     */
    @Override
    public int unlikeBoard(Long boardId, Long memberId) {
        return mapper.unlikeBoard(boardId, memberId);
    }


    /**
     *  게시글 좋아요 수 조회
     */
    @Override
    public int countLikes(Long boardId) {
        return mapper.countLikes(boardId);
    }
}