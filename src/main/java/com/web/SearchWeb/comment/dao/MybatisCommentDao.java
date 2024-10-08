package com.web.SearchWeb.comment.dao;


import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisCommentDao implements CommentDao{

    private final CommentDao mapper;

    @Autowired
    public MybatisCommentDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(CommentDao.class);
    }


    /**
     *  게시글 댓글 생성
     */
    @Override
    public int insertComment(Comment comment) {
        return mapper.insertComment(comment);
    }


    /**
     *  게시글 댓글 목록 조회
     */
    public List<Comment> selectComments(int boardId){
        return mapper.selectComments(boardId);
    }


    /**
     *  게시글 댓글 단일 조회
     */
    public Comment selectComment(int commentId){
        return mapper.selectComment(commentId);
    }


    /**
     *  게시글 댓글 수정
     */
    public int updateComment(Comment comment) {
        return mapper.updateComment(comment);
    }


    /**
     *  게시글 댓글 삭제
     */
    public int deleteComment(int commentId){
        return mapper.deleteComment(commentId);
    }


    /**
     *  게시글 댓글 수 조회
     */
    public int countComments(int boardId) {
        return mapper.countComments(boardId);
    }
}