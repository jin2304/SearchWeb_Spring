package com.web.SearchWeb.comment.dao;

import com.web.SearchWeb.comment.domain.Comment;

import java.util.List;

public interface CommentDao {
    //게시글 댓글 생성
    int insertComment(Comment comment);

    //게시글 댓글 목록 조회
    List<Comment> selectComments(int boardId);
}