package com.web.SearchWeb.linkanalysis.controller.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 링크 분석 API 응답 DTO
 */
public class LinkAnalysisResponses {

    /** 분석 응답 */
    @Getter
    @Builder
    public static class Result {
        public String title;                      // AI 요약 제목
        public String description;                // AI 생성 설명
        public List<TagSuggestion> suggestedTags; // 추천 태그 목록
        public FolderSuggestion suggestedFolder;  // 추천 폴더 정보

        /** 태그 추천 정보 */
        @Getter
        @Builder
        public static class TagSuggestion {
            public String tagName;       // 태그명
            public boolean isExisting;   // 기존 태그 여부
        }

        /** 폴더 추천 정보 */
        @Getter
        @Builder
        public static class FolderSuggestion {
            public Long memberFolderId;  // 매칭된 기존 폴더 ID
            public String folderName;    // 폴더명
            public boolean isExisting;   // 기존 폴더 여부
        }
    }
}
