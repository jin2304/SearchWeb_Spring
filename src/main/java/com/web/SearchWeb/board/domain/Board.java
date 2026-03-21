// package com.web.SearchWeb.board.domain;

// import lombok.Getter;
// import lombok.Setter;
// import lombok.ToString;

// /**
//  * Board 도메인 (Legacy)
//  * - Member 테이블과 FK 관계 (member_id BIGINT)
//  */
// @Getter
// @Setter
// @ToString
// public class Board {
//     private Long boardId;           // 게시글 ID (PK)
//     private Long memberMemberId;    // 작성자 ID (FK to member - BIGINT)
//     private String nickname;        // 작성자 닉네임
//     private String job;             // 직업
//     private String major;           // 전공
//     private String url;             // 참조 URL (선택)
//     private String title;           // 제목
//     private String summary;         // 요약
//     private String description;     // 본문 내용
//     private String hashtags;        // 해시태그
//     private int likesCount;         // 좋아요 수
//     private int commentsCount;      // 댓글 수
//     private int bookmarksCount;     // 북마크 수
//     private int viewsCount;         // 조회수
//     private String createdDate;     // 작성일
// }
