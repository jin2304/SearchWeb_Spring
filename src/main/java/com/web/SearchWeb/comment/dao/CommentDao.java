package com.web.SearchWeb.comment.dao;

import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;

import java.util.List;

public interface CommentDao {
    //게시글 댓글 생성
    int insertComment(CommentDto commentDto);
}