package com.web.SearchWeb.comment.controller;

import com.web.SearchWeb.comment.dto.CommentDto;
import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

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
        Member member = memberService.findByUserName(username);


        commentService.insertComment(boardId, member.getMemberId(), commentDto);

        response.put("success", true);
        return ResponseEntity.ok(response);  // 200 OK 응답
    }
}
