package com.web.SearchWeb.board.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardDto {
    private String nickname;
    private String job;
    private String major;
    private String url;
    private String title;
    private String summary;
    private String description;
    private String hashtags;
}
