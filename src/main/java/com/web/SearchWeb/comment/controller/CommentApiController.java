package com.web.SearchWeb.comment.controller;

import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CommentApiController {

    private final CommentService commentService;
    private final MemberService memberService;

    @Autowired
    public CommentApiController(CommentService commentService, MemberService memberService) {
        this.commentService = commentService;
        this.memberService = memberService;
    }



    /**
     *  게시글 댓글 생성
     */
    @PostMapping("board/{boardId}/comment")
    public ResponseEntity<Map<String, Object>> insertComment(@PathVariable int boardId,
                                             @AuthenticationPrincipal UserDetails userDetails,
                                             @RequestBody CommentDto commentDto){

        Map<String, Object> response = new HashMap<>();

        if (userDetails == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }
        String username = userDetails.getUsername();
        commentService.insertComment(boardId, username, commentDto);

        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }


    /**
     *  게시글 댓글 목록 조회
     */
    @GetMapping("board/{boardId}/comments")
    public ResponseEntity<List<Comment>> selectComments(@PathVariable int boardId, Model model){
        List<Comment> comments = commentService.selectComments(boardId);
        return ResponseEntity.ok(comments);
    }


    /**
     *  게시글 댓글 단일 조회
     */
    @GetMapping("board/{boardId}/comment/{commentId}")
    public ResponseEntity<Comment> selectComment(@PathVariable int commentId){
        Comment comment = commentService.selectComment(commentId);
        return ResponseEntity.ok(comment);
    }


    /**
     *  게시글 댓글 수정
     */
    @PutMapping("board/{boardId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> updateComment(@PathVariable int boardId,
                                                             @PathVariable int commentId,
                                                             @AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody CommentDto commentDto){

        Map<String, Object> response = new HashMap<>();

        if (userDetails == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }
        String username = userDetails.getUsername();
        Member loggedInMember = memberService.findByUserName(username);
        Comment comment = commentService.selectComment(commentId);

        if(comment.getMember_memberId() != loggedInMember.getMemberId()){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }

        commentService.updateComment(commentId, loggedInMember, commentDto);

        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }


    /**
     *  게시글 댓글 삭제
     */
    @DeleteMapping("board/{boardId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable int boardId,
                                                             @PathVariable int commentId,
                                                             @AuthenticationPrincipal UserDetails userDetails){

        Map<String, Object> response = new HashMap<>();

        if (userDetails == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }
        String username = userDetails.getUsername();
        Member loggedInMember = memberService.findByUserName(username);
        Comment comment = commentService.selectComment(commentId);

        if(comment.getMember_memberId() != loggedInMember.getMemberId()){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }

        commentService.deleteComment(commentId);

        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }

}
