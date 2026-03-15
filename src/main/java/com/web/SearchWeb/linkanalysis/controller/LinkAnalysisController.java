package com.web.SearchWeb.linkanalysis.controller;

import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.linkanalysis.controller.dto.LinkAnalysisRequests;
import com.web.SearchWeb.linkanalysis.controller.dto.LinkAnalysisResponses;
import com.web.SearchWeb.linkanalysis.domain.LinkAnalysisResult;
import com.web.SearchWeb.linkanalysis.service.LinkAnalysisService;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

/**
 * 링크 분석 API 컨트롤러
 * - POST /api/link-analysis/analyze
 * - URL 전달 → AI 분석 → 제목/설명/태그/폴더 추천 응답
 */
@RestController
@RequestMapping("/api/link-analysis")
@RequiredArgsConstructor
public class LinkAnalysisController {

    private final LinkAnalysisService linkAnalysisService;

    /**
     * 링크 분석 요청 처리
     * - 인증 사용자 ID 추출 → 분석 서비스 호출 → 응답 DTO 변환
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<LinkAnalysisResponses.Result>> analyze(
            @AuthenticationPrincipal Object currentUser,
            @Valid @RequestBody LinkAnalysisRequests.Analyze request) {

        Long memberId = getMemberId(currentUser);  // 인증 사용자 ID 추출
        LinkAnalysisResult result = linkAnalysisService.analyze(memberId, request.url);

        LinkAnalysisResponses.Result response = toResponse(result);  // 도메인 → DTO 변환
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /** 도메인 결과 → 응답 DTO 변환 */
    private LinkAnalysisResponses.Result toResponse(LinkAnalysisResult result) {
        return LinkAnalysisResponses.Result.builder()
                .title(result.getTitle())
                .description(result.getDescription())
                .suggestedTags(result.getSuggestedTags() != null  // 추천 태그 변환
                        ? result.getSuggestedTags().stream()
                        .map(t -> LinkAnalysisResponses.Result.TagSuggestion.builder()
                                .tagName(t.getTagName())
                                .isExisting(t.isExisting())
                                .build())
                        .collect(Collectors.toList())
                        : null)
                .suggestedFolder(result.getSuggestedFolder() != null  // 추천 폴더 변환
                        ? LinkAnalysisResponses.Result.FolderSuggestion.builder()
                        .memberFolderId(result.getSuggestedFolder().getMemberFolderId())
                        .folderName(result.getSuggestedFolder().getFolderName())
                        .isExisting(result.getSuggestedFolder().isExisting())
                        .build()
                        : null)
                .build();
    }

    /**
     * 인증 사용자 객체에서 회원 ID 추출
     * - UserDetails: 일반 로그인
     * - OAuth2User: 소셜 로그인
     */
    private Long getMemberId(Object currentUser) {
        if (currentUser instanceof UserDetails) {
            return ((CustomUserDetails) currentUser).getMemberId();
        } else if (currentUser instanceof OAuth2User) {
            return ((CustomOAuth2User) currentUser).getMemberId();
        }
        
        // SecurityUtils의 정책과 동일하게 1L 반환 (테스트용)
        return 1L;
    }
}
