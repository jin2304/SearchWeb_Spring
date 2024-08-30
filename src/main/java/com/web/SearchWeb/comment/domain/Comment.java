package com.web.SearchWeb.comment.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Comment {
    private int board_boardId;
    private int member_memberId;
    private String content;
    private String created_date;
}
