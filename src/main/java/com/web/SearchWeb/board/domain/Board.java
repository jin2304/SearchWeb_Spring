package com.web.SearchWeb.board.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Board {
    private int boardId;
    private int member_memberId;
    private String nickname;
    private String job;
    private String major;
    private String url;
    private String title;
    private String description;
    private String hashtags;
    private int likes_count;
    private int comments_count;
    private int bookmarks_count;
    private int views_count;
    private String created_date;
}
