package com.web.SearchWeb.comment.dao;

import com.web.SearchWeb.comment.domain.Comment;

import java.util.List;

public interface CommentDao {
    //게시글 댓글 생성
    int insertComment(Comment comment);

    //게시글 댓글 목록 조회
    List<Comment> selectComments(int boardId);

    //게시글 댓글 단일 조회
   Comment selectComment(int commentId);

    //게시글 댓글 수정
    int updateComment(Comment commentId);

    //게시글 댓글 삭제
    int deleteComment(int commentId);

    //게시글 댓글 수 조회
    int countComments(int boardId);
}