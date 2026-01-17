package com.web.SearchWeb.bookmark.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkSearchRequestDto {
    private int memberId;
    private String tag;
    private String sort;
    private String query;
    private Long folderId;
}