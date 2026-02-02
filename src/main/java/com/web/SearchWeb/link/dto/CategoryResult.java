package com.web.SearchWeb.link.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 카테고리 분류 결과를 담는 내부 DTO
 */
@Getter
@AllArgsConstructor
public class CategoryResult {
    private String category; // 분류된 카테고리명
    private Long folderId; // 매칭된 폴더 ID (없으면 null)
    private double confidence; // 분류 신뢰도 (0.0 ~ 1.0)
}
