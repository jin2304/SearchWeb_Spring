package com.web.SearchWeb.bookmark.dto;

import lombok.Data;

/**
 * 북마크 태그 등록 및 조회(insertAndSelectTags) 결과를 담는 DTO
 * - 새로 생성된 태그 또는 기존에 존재하는 태그의 ID와 이름을 다 포함
 */
@Data
public class MemberTagResultDto {
    private Long memberTagId;
    private String tagName;
}
