package com.web.SearchWeb.comment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommentDto {
    private int board_boardId;
    private int member_memberId;
    private String member_nickname;
    private String content;
}
