package com.web.SearchWeb.folder.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Folder {
    private int folderId;
    private int member_memberId;
    private String name;
    private String tag;
    private String created_date;
    private String modified_date;
}