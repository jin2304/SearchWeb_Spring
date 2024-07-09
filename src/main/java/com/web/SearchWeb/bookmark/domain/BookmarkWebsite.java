package com.web.SearchWeb.bookmark.domain;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class BookmarkWebsite {
    private int member_memberId;
    private int websiteId;
    private String name;
    private String korean_name;
    private String description;
    private String url;
    private String category;
    private String subcategory;
    private Long viewCount;
}
