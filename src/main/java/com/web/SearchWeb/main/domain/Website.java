package com.web.SearchWeb.main.domain;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


/**
 * Website 도메인
 */
@Getter
@Setter
@ToString
public class Website {
    private Long websiteId;         // website_id
    private String name;           // name
    private String koreanName;     // korean_name
    private String description;    // description
    private String url;            // url
    private String category;       // category
    private String subcategory;    // subcategory
    private Long viewCount;        // view_count
}
