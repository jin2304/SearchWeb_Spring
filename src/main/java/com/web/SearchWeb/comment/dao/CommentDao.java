package com.web.SearchWeb.comment.dao;

import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.comment.dto.UpdateUserProfileCommentDto;

import java.util.List;

public interface CommentDao {
    //게시글 댓글 생성
    int insertComment(Comment comment);

    //게시글 댓글 목록 조회
    List<Comment> selectComments(int boardId);

    //회원번호로 게시글 댓글 목록 조회
    List<Comment> selectCommentsByMemberId(int memberId);

    //게시글 댓글 단일 조회
    Comment selectComment(int commentId);

    //게시글 댓글 수정
    int updateComment(int commentId, CommentDto commentDto);

    //게시글 댓글 사용자 프로필 수정
    int updateCommentUserProfile(UpdateUserProfileCommentDto commentDto);

    //게시글 댓글 삭제
    int deleteComment(int commentId);

    //게시글 댓글 수 조회
    int countComments(int boardId);
}