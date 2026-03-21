// package com.web.SearchWeb.comment.controller;

// import com.web.SearchWeb.aop.OwnerCheck;
// import com.web.SearchWeb.comment.domain.Comment;
// import com.web.SearchWeb.comment.dto.CommentDto;
// import com.web.SearchWeb.comment.service.CommentService;
// import com.web.SearchWeb.config.jwt.JwtMemberPrincipal;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.ui.Model;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// /**
//  * CommentApiController (Legacy - PostgreSQL)
//  */
// @RestController
// public class CommentApiController {

//     private final CommentService commentService;

//     @Autowired
//     public CommentApiController(CommentService commentService) {
//         this.commentService = commentService;
//     }



//     /**
//      *  게시글 댓글 생성
//      */
//     @PostMapping("board/{boardId}/comment")
//     public ResponseEntity<Map<String, Object>> insertComment(@PathVariable Long boardId,
//                                                              @AuthenticationPrincipal JwtMemberPrincipal principal,
//                                                              @RequestBody CommentDto commentDto){
//         Map<String, Object> response = new HashMap<>();

//         // 로그인 되지 않은 경우
//         if (principal == null) {
//             return ResponseEntity
//                     .status(HttpStatus.UNAUTHORIZED)
//                     .body(response); // 401 Unauthorized 응답
//         }

//         commentService.insertComment(boardId, principal.memberId(), commentDto);

//         response.put("success", true);
//         return ResponseEntity.ok(response);  // 200 OK 응답
//     }


//     /**
//      *  게시글 댓글 목록 조회
//      */
//     @GetMapping("board/{boardId}/comments")
//     public ResponseEntity<List<Comment>> selectComments(@PathVariable Long boardId, Model model){
//         List<Comment> comments = commentService.selectComments(boardId);
//         return ResponseEntity.ok(comments);
//     }


//     /**
//      *  게시글 댓글 단일 조회
//      */
//     @GetMapping("board/{boardId}/comment/{commentId}")
//     @OwnerCheck(idParam = "commentId", service = "commentService")
//     public ResponseEntity<Comment> selectComment(@PathVariable Long commentId){
//         Comment comment = commentService.selectComment(commentId);
//         return ResponseEntity.ok(comment);
//     }


//     /**
//      *  게시글 댓글 수정
//      */
//     @PutMapping("board/{boardId}/comments/{commentId}")
//     @OwnerCheck(idParam = "commentId", service = "commentService")
//     public ResponseEntity<Map<String, Object>> updateComment(@PathVariable Long boardId,
//                                                              @PathVariable Long commentId,
//                                                              @RequestBody CommentDto commentDto){
//         Map<String, Object> response = new HashMap<>();
//         commentService.updateComment(commentId, commentDto);
//         response.put("success", true);
//         return ResponseEntity.ok(response);  // 200 OK 응답
//     }


//     /**
//      *  게시글 댓글 삭제
//      */
//     @DeleteMapping("board/{boardId}/comments/{commentId}")
//     @OwnerCheck(idParam = "commentId", service = "commentService")
//     public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable Long boardId,
//                                                              @PathVariable Long commentId){
//         Map<String, Object> response = new HashMap<>();
//         commentService.deleteComment(boardId, commentId);
//         response.put("success", true);
//         return ResponseEntity.ok(response);  // 200 OK 응답
//     }
// }
