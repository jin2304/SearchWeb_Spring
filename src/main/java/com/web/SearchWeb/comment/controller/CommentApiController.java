package com.web.SearchWeb.comment.controller;

import com.web.SearchWeb.aop.OwnerCheck;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CommentApiController {

    private final CommentService commentService;

    @Autowired
    public CommentApiController(CommentService commentService) {
        this.commentService = commentService;
    }



    /**
     *  게시글 댓글 생성
     */
    @PostMapping("board/{boardId}/comment")
    public ResponseEntity<Map<String, Object>> insertComment(@PathVariable int boardId,
                                                             @AuthenticationPrincipal Object currentUser,
                                                             @RequestBody CommentDto commentDto){
        Map<String, Object> response = new HashMap<>();
        
        // 로그인 되지 않은 경우
        if (currentUser == null || "anonymousUser".equals(currentUser)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response); // 401 Unauthorized 응답
        }

        // 로그인 된 경우
        String username;
        if(currentUser instanceof UserDetails) {
            // 일반 로그인 사용자 처리
            username = ((CustomUserDetails) currentUser).getUsername();
        }
        else if(currentUser instanceof OAuth2User) {
            // 소셜 로그인 사용자 처리
            username = ((CustomOAuth2User) currentUser).getUsername();
        } else {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(response);  // 403 Forbidden 응답
        }

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
    @OwnerCheck(idParam = "commentId", service = "commentService")
    public ResponseEntity<Comment> selectComment(@PathVariable int commentId){
        Comment comment = commentService.selectComment(commentId);
        return ResponseEntity.ok(comment);
    }


    /**
     *  게시글 댓글 수정
     */
    @PutMapping("board/{boardId}/comments/{commentId}")
    @OwnerCheck(idParam = "commentId", service = "commentService")
    public ResponseEntity<Map<String, Object>> updateComment(@PathVariable int boardId,
                                                             @PathVariable int commentId,
                                                             @RequestBody CommentDto commentDto){
        Map<String, Object> response = new HashMap<>();
        commentService.updateComment(commentId, commentDto);
        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }


    /**
     *  게시글 댓글 삭제
     */
    @DeleteMapping("board/{boardId}/comments/{commentId}")
    @OwnerCheck(idParam = "commentId", service = "commentService")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable int boardId,
                                                             @PathVariable int commentId){
        Map<String, Object> response = new HashMap<>();
        commentService.deleteComment(boardId, commentId);
        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }
}
