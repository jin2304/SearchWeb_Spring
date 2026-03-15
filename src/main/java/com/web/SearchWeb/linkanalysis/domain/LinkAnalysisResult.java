package com.web.SearchWeb.linkanalysis.domain;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 링크 분석 최종 결과 도메인 객체
 * - AI 분석 또는 폴백 처리를 통해 생성
 * - 컨트롤러에서 응답 DTO로 변환
 */
@Getter
@Builder
public class LinkAnalysisResult {

    /** AI 요약 제목 */
    private final String title;

    /** AI 생성 설명 (2~3문장) */
    private final String description;

    /** 추천 태그 목록 */
    private final List<SuggestedTag> suggestedTags;

    /** 추천 폴더 정보 */
    private final SuggestedFolder suggestedFolder;

    /**
     * 추천 태그 정보
     * - AI 제안 태그명 + 기존 태그 존재 여부
     */
    @Getter
    @Builder
    public static class SuggestedTag {
        /** 태그명 */
        private final String tagName;

        /** 기존 태그 존재 여부 (true: 기존, false: 신규) */
        private final boolean isExisting;
    }

    /**
     * 추천 폴더 정보
     * - AI 제안 폴더명 + 기존 폴더 매칭 결과
     */
    @Getter
    @Builder
    public static class SuggestedFolder {
        /** 매칭된 기존 폴더 ID (신규 제안이면 null) */
        private final Long memberFolderId;

        /** 폴더명 */
        private final String folderName;

        /** 기존 폴더 존재 여부 (true: 기존, false: 신규) */
        private final boolean isExisting;
    }
}
