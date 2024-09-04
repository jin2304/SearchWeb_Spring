package com.web.SearchWeb.comment.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentDao commentdao;
    private final MemberService memberService;
    private final BoardDao boardDao;

    @Autowired
    public CommentService(CommentDao commentdao, MemberService memberService, BoardDao boardDao) {
        this.commentdao = commentdao;
        this.memberService = memberService;
        this.boardDao = boardDao;
    }


    /**
     *  게시글 댓글 생성
     */
    @Transactional
    public int insertComment(int boardId, String username, CommentDto commentDto){
        // 댓글 추가
        Member member = memberService.findByUserName(username);
        Comment comment = new Comment();
        comment.setBoard_boardId(boardId);
        comment.setMember_memberId(member.getMemberId());
        comment.setMember_nickname(member.getNickname());
        comment.setMember_job(member.getJob());
        comment.setMember_major(member.getMajor());
        comment.setContent(commentDto.getContent());
        int result = commentdao.insertComment(comment);

        //게시글 댓글 수 증가
        boardDao.incrementCommentCount(boardId);

        return result;
    }


    /**
     *  게시글 댓글 목록 조회
     */
    public List<Comment> selectComments(int boardId){
        return commentdao.selectComments(boardId);
    }


    /**
     *  게시글 댓글 단일 조회
     */
    public Comment selectComment(int commentId){
        return commentdao.selectComment(commentId);
    }


    /**
     *  게시글 댓글 수정
     */
    public int updateComment(int commentId, Member member, CommentDto commentDto){
        Comment comment = new Comment();
        comment.setCommentId(commentId);
        comment.setBoard_boardId(commentDto.getBoard_boardId());
        comment.setMember_memberId(member.getMemberId());
        comment.setMember_nickname(member.getNickname());
        comment.setMember_job(member.getJob());
        comment.setMember_major(member.getMajor());
        comment.setContent(commentDto.getContent());
        return commentdao.updateComment(comment);
    }


    /**
     *  게시글 댓글 삭제
     */
    @Transactional
    public int deleteComment(int boardId, int commentId){
        // 댓글 삭제
        int result = commentdao.deleteComment(commentId);

        //게시글 댓글 수 감소
        boardDao.decrementCommentCount(boardId);
        return result;
    }


    /**
     *  게시글 댓글 수 조회
     */
    public int getCommentCount(int boardId) {
        return commentdao.countComments(boardId);
    }
}
