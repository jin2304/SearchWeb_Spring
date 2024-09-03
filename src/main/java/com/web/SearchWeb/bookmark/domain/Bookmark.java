package com.web.SearchWeb.bookmark.domain;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Bookmark {
    private int bookmarkId;
    private int member_memberId;
    private int website_websiteId;
    private int board_boardId;
    private String name;
    private String description;
    private String url;
    private String modified_date;
    private String tag;
}
