package com.web.SearchWeb.comment.service;

import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentDao commentdao;

    @Autowired
    public CommentService(CommentDao commentdao) {
        this.commentdao = commentdao;
    }


    /**
     *  게시글 댓글 생성
     */
    public int insertComment(int boardId, int memberId, String nickname, CommentDto commentDto){
        commentDto.setBoard_boardId(boardId);
        commentDto.setMember_memberId(memberId);
        commentDto.setMember_nickname(nickname);
        return commentdao.insertComment(commentDto);
    }


    /**
     *  게시글 댓글 목록 조회
     */
    public List<Comment> selectComments(int boardId){
        return commentdao.selectComments(boardId);
    }
}
