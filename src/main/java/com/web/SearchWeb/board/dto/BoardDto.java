package com.web.SearchWeb.board.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardDto {
    private String nickname;       // 작성자 닉네임
    private String job;            // 직업
    private String major;          // 전공
    private String url;            // 참조 URL
    private String title;          // 제목
    private String summary;        // 요약
    private String description;    // 본문 내용
    private String hashtags;       // 해시태그
}
