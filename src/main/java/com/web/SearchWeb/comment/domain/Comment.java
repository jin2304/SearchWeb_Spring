package com.web.SearchWeb.comment.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Comment {
    private int commentId;
    private int board_boardId;
    private int member_memberId;
    private String member_nickname;
    private String member_job;
    private String member_major;
    private String content;
    private String created_date;
}
