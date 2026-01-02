package com.web.SearchWeb.folder.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderSearchRequestDto {
    private int memberId;
    private String tag;
    private String sort;
}