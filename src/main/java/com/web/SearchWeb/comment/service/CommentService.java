// package com.web.SearchWeb.comment.service;

// import com.web.SearchWeb.board.dao.BoardDao;
// import com.web.SearchWeb.comment.dao.CommentDao;
// import com.web.SearchWeb.comment.domain.Comment;
// import com.web.SearchWeb.comment.dto.CommentDto;
// import com.web.SearchWeb.member.domain.Member;
// import com.web.SearchWeb.member.service.MemberService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.List;

// /**
//  * CommentService (Legacy - PostgreSQL)
//  */
// @Service
// public class CommentService {

//     private final CommentDao commentdao;
//     private final MemberService memberService;
//     private final BoardDao boardDao;

//     @Autowired
//     public CommentService(CommentDao commentdao, MemberService memberService, BoardDao boardDao) {
//         this.commentdao = commentdao;
//         this.memberService = memberService;
//         this.boardDao = boardDao;
//     }


//     /**
//      *  게시글 댓글 생성
//      */
//     @Transactional
//     public int insertComment(Long boardId, Long memberId, CommentDto commentDto){
//         // 댓글 추가
//         Member member = memberService.findByMemberId(memberId);
//         Comment comment = new Comment();
//         comment.setBoardBoardId(boardId);
//         comment.setMemberMemberId(memberId);
//         comment.setMemberNickname(member.getNickName());
//         comment.setMemberJob(member.getJob());
//         comment.setMemberMajor(member.getMajor());
//         comment.setContent(commentDto.getContent());
//         int result = commentdao.insertComment(comment);

//         //게시글 댓글 수 증가
//         boardDao.incrementCommentCount(boardId);

//         return result;
//     }


//     /**
//      *  게시글 댓글 목록 조회
//      */
//     public List<Comment> selectComments(Long boardId){
//         return commentdao.selectComments(boardId);
//     }


//     /**
//      *  게시글 댓글 단일 조회
//      */
//     public Comment selectComment(Long commentId){
//         return commentdao.selectComment(commentId);
//     }


//     /**
//      *  게시글 댓글 수정
//      */
//     public int updateComment(Long commentId, CommentDto commentDto){
//         return commentdao.updateComment(commentId, commentDto);
//     }


//     /**
//      *  게시글 댓글 삭제
//      */
//     @Transactional
//     public int deleteComment(Long boardId, Long commentId){
//         // 댓글 삭제
//         int result = commentdao.deleteComment(commentId);

//         //게시글 댓글 수 감소
//         boardDao.decrementCommentCount(boardId);
//         return result;
//     }


//     /**
//      *  게시글 댓글 수 조회
//      */
//     public int getCommentCount(Long boardId) {
//         return commentdao.countComments(boardId);
//     }


//     /**
//      * 댓글 소유자(작성자) 조회
//      */
//     public Long findMemberIdByCommentId(Long commentId) {
//         Comment comment = commentdao.selectComment(commentId);
//         if (comment == null) throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
//         return comment.getMemberMemberId();
//     }
// }
