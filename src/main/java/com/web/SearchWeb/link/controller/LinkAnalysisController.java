package com.web.SearchWeb.link.controller;

import com.web.SearchWeb.link.dto.LinkAnalysisRequest;
import com.web.SearchWeb.link.dto.LinkAnalysisResponse;
import com.web.SearchWeb.link.service.LinkAnalysisService;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 링크 분석 REST API 컨트롤러
 * URL을 분석하여 카테고리와 해시태그를 추천
 */
@RestController
@RequestMapping("/api/link")
@RequiredArgsConstructor
public class LinkAnalysisController {

    private final LinkAnalysisService linkAnalysisService;

    /**
     * URL 분석 API
     * 
     * POST /api/link/analyze
     * Request Body: { "url": "https://github.com/..." }
     * Response: {
     * "metadata": { "title": "...", "description": "...", ... },
     * "suggestedCategory": "IT/개발",
     * "suggestedFolderId": 5,
     * "suggestedHashtags": ["GitHub", "오픈소스", "Java"],
     * "confidence": 0.95
     * }
     */
    @PostMapping("/analyze")
    public ResponseEntity<LinkAnalysisResponse> analyzeLink(@RequestBody LinkAnalysisRequest request) {
        // 링크 분석 수행
        LinkAnalysisResponse result = linkAnalysisService.analyzeLink(request.getUrl(), getCurrentMemberId());
        return ResponseEntity.ok(result);
    }

    
    /**
     * 현재 로그인한 사용자의 memberId 조회
     * 로그인하지 않은 경우 0 반환 (기존 폴더 매칭 안됨)
     */
    private int getCurrentMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof CustomUserDetails) {
                return ((CustomUserDetails) principal).getMemberId();
            }
        }

        return 0;
    }
}
