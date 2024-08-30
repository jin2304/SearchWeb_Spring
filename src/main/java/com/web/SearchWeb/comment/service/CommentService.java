package com.web.SearchWeb.comment.service;

import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.dto.CommentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;



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
    public int insertComment(int boardId, int memberId, CommentDto commentDto){
        commentDto.setBoard_boardId(boardId);
        commentDto.setMember_memberId(memberId);
        return commentdao.insertComment(commentDto);
    }
}
