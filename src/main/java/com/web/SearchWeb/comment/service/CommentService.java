package com.web.SearchWeb.comment.service;

import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentDao commentdao;
    private final MemberService memberService;

    @Autowired
    public CommentService(CommentDao commentdao, MemberService memberService) {
        this.commentdao = commentdao;
        this.memberService = memberService;
    }


    /**
     *  게시글 댓글 생성
     */
    public int insertComment(int boardId, String username, CommentDto commentDto){
        Member member = memberService.findByUserName(username);
        Comment comment = new Comment();
        comment.setBoard_boardId(boardId);
        comment.setMember_memberId(member.getMemberId());
        comment.setMember_nickname(member.getNickname());
        comment.setMember_job(member.getJob());
        comment.setMember_major(member.getMajor());
        comment.setContent(commentDto.getContent());
        System.out.println("Comment: " + comment);
        return commentdao.insertComment(comment);
    }


    /**
     *  게시글 댓글 목록 조회
     */
    public List<Comment> selectComments(int boardId){
        return commentdao.selectComments(boardId);
    }
}
