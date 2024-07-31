package com.web.SearchWeb.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@AllArgsConstructor
public class BookmarkDto {
    private int member_memberId;
    private int website_websiteId;
    private String name;
    private String description;
    private String url;
    private String tag;
}
