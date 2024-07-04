package com.web.SearchWeb.main.domain;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class Website {
    private int id;
    private String name;
    private String korean_name;
    private String description;
    private String url;
    private String category;
    private String subcategory;
    private Long viewCount;
}
