package com.web.SearchWeb.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@AllArgsConstructor
public class BoardBookmarkCheckDto {
    private int memberId;
    private int boardId;
}