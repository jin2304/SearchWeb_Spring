package com.web.SearchWeb.comment.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Comment 도메인 (Legacy)
 * - PostgreSQL comment 테이블과 매핑
 * - Member, Board 테이블과 FK 관계
 */
@Getter
@Setter
@ToString
public class Comment {
    private Long commentId;        // comment_id (BIGINT)
    private Long boardBoardId;      // board_board_id (FK to board)
    private Long memberMemberId;   // member_member_id (FK to member - BIGINT)
    private String memberNickname; // member_nickname
    private String memberJob;      // member_job
    private String memberMajor;    // member_major
    private String content;        // content
    private String createdDate;    // created_date
}
