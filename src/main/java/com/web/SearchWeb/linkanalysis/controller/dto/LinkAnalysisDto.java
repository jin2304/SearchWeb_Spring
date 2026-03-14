package com.web.SearchWeb.linkanalysis.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 링크 분석 API 요청/응답 DTO
 * - 컨트롤러 계층 전용, 도메인 객체(LinkAnalysisResult)와 분리
 */
public class LinkAnalysisDto {

    /** 분석 요청 DTO */
    @Getter
    @NoArgsConstructor
    public static class Request {
        /** 분석 대상 URL (필수) */
        @NotBlank(message = "URL은 필수입니다.")
        private String url;
    }

    /** 분석 응답 DTO */
    @Getter
    @lombok.Builder
    public static class Response {
        /** AI 요약 제목 */
        private String title;

        /** AI 생성 설명 */
        private String description;

        /** 추천 태그 목록 */
        private List<TagSuggestion> suggestedTags;

        /** 추천 폴더 정보 */
        private FolderSuggestion suggestedFolder;

        /** 태그 추천 정보 */
        @Getter
        @lombok.Builder
        public static class TagSuggestion {
            /** 태그명 */
            private String tagName;

            /** 기존 태그 여부 (true: 기존, false: 신규) */
            private boolean isExisting;
        }

        /** 폴더 추천 정보 */
        @Getter
        @lombok.Builder
        public static class FolderSuggestion {
            /** 매칭된 기존 폴더 ID (신규면 null) */
            private Long memberFolderId;

            /** 폴더명 */
            private String folderName;

            /** 기존 폴더 여부 (true: 기존, false: 신규) */
            private boolean isExisting;
        }
    }
}
