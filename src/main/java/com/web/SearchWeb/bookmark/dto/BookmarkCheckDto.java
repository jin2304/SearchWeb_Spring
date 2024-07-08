package com.web.SearchWeb.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor //모든 필드 값을 파라미터로 받는 생성자를 생성
public class BookmarkCheckDto {
    private int memberId;
    private int websiteId;
}
