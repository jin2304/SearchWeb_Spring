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
}
