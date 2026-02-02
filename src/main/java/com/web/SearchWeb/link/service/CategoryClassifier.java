package com.web.SearchWeb.link.service;

import com.web.SearchWeb.folder.domain.Folder;
import com.web.SearchWeb.link.dto.CategoryResult;
import com.web.SearchWeb.link.dto.LinkMetadata;
import org.springframework.stereotype.Component;

import java.util.*;

import static java.util.Map.entry;

/**
 * 2-Tier 카테고리 분류기
 * 1. 전문 도메인: 도메인만으로 분류
 * 2. 범용 플랫폼: 콘텐츠(제목/설명) 기반 세부 분류
 */
@Component
public class CategoryClassifier {

    // ========================================
    // 1. 범용 플랫폼 (콘텐츠 기반 분류 필요)
    // ========================================
    private static final Set<String> GENERIC_PLATFORMS = Set.of(
            "youtube.com", "youtu.be",
            "medium.com", "velog.io",
            "tistory.com", "naver.com",
            "instagram.com", "twitter.com", "x.coCategoryClassifierm"
    );


    // ========================================
    // 2. 전문 도메인 (도메인만으로 분류 가능)
    // ========================================
    private static final Map<String, String> SPECIALIZED_DOMAINS = Map.ofEntries(
            // 개발/IT
            entry("github.com", "IT/개발"),
            entry("stackoverflow.com", "IT/개발"),
            entry("gitlab.com", "IT/개발"),
            entry("developer.mozilla.org", "IT/개발"),
            entry("npmjs.com", "IT/개발"),

            // 쇼핑
            entry("coupang.com", "쇼핑"),
            entry("amazon.com", "쇼핑"),
            entry("11st.co.kr", "쇼핑"),
            entry("gmarket.co.kr", "쇼핑"),

            // 음악
            entry("spotify.com", "음악"),
            entry("music.apple.com", "음악"),
            entry("soundcloud.com", "음악")
    );

            
    // ========================================
    // 3. 세부 카테고리 키워드 규칙
    // ========================================
    private static final Map<String, List<String>> CONTENT_KEYWORDS = Map.ofEntries(
            // IT/개발
            entry("IT/개발", List.of(
                    "java", "python", "javascript", "react", "spring", "node",
                    "프로그래밍", "코딩", "개발", "api", "backend", "frontend",
                    "database", "algorithm", "tutorial", "강의", "배우기",
                    "typescript", "vue", "angular", "docker", "kubernetes")),

            // 스포츠 - 세분화
            entry("스포츠/축구", List.of(
                    "축구", "football", "soccer", "월드컵", "프리미어리그",
                    "라리가", "손흥민", "메시", "호날두", "epl", "k리그")),
            entry("스포츠/야구", List.of(
                    "야구", "baseball", "mlb", "kbo", "홈런", "투수", "타자")),
            entry("스포츠/농구", List.of(
                    "농구", "basketball", "nba", "kbl")),

            // 패션/뷰티
            entry("패션/뷰티", List.of(
                    "패션", "fashion", "스타일", "옷", "코디", "outfit",
                    "메이크업", "makeup", "화장", "스킨케어", "뷰티", "beauty",
                    "헤어", "네일", "향수")),

            // 맛집/요리
            entry("맛집/요리", List.of(
                    "맛집", "레시피", "recipe", "요리", "cooking", "먹방",
                    "mukbang", "음식", "food", "restaurant", "카페", "베이킹")),

            // 게임
            entry("게임", List.of(
                    "게임", "game", "롤", "lol", "발로란트", "valorant",
                    "오버워치", "마인크래프트", "스팀", "플레이스테이션", "닌텐도")),

            // 음악
            entry("음악", List.of(
                    "음악", "music", "노래", "song", "앨범", "album",
                    "콘서트", "concert", "아이돌", "kpop", "힙합", "락")),

            // 영화/드라마
            entry("영화/드라마", List.of(
                    "영화", "movie", "film", "드라마", "drama", "넷플릭스",
                    "netflix", "시리즈", "series", "리뷰", "예고편", "trailer")),

            // 여행
            entry("여행", List.of(
                    "여행", "travel", "trip", "관광", "tour", "호텔",
                    "항공", "비행기", "휴가", "vacation", "배낭여행")),

            // 경제/재테크
            entry("경제/재테크", List.of(
                    "주식", "stock", "투자", "investment", "코인", "crypto",
                    "비트코인", "부동산", "재테크", "금융", "finance")),

            // 교육/학습
            entry("교육/학습", List.of(
                    "강의", "lecture", "교육", "education", "학습", "공부",
                    "시험", "자격증", "인강", "온라인강의")),

            // 뉴스/시사
            entry("뉴스/시사", List.of(
                    "뉴스", "news", "속보", "breaking", "정치", "경제",
                    "사회", "국제", "기사", "article"))
    );



    /**
     * 링크 메타데이터와 사용자 폴더 목록을 기반으로 카테고리 분류
     */
    public CategoryResult classify(LinkMetadata metadata, List<Folder> userFolders) {
        String domain = metadata.getDomain();

        // 1. 전문 도메인이면 바로 분류
        for (Map.Entry<String, String> entry : SPECIALIZED_DOMAINS.entrySet()) {
            if (domain.contains(entry.getKey())) {
                String category = entry.getValue();
                return new CategoryResult(category, findMatchingFolder(category, userFolders), 0.95);
            }
        }

        // 2. 범용 플랫폼이면 콘텐츠 기반 분류
        if (isGenericPlatform(domain)) {
            return classifyByContent(metadata, userFolders);
        }

        // 3. 알 수 없는 도메인도 콘텐츠 기반 분류 시도
        return classifyByContent(metadata, userFolders);
    }



    
    /**
     * 범용 플랫폼 여부 확인
     */
    private boolean isGenericPlatform(String domain) {
        return GENERIC_PLATFORMS.stream().anyMatch(domain::contains);
    }

    /**
     * 콘텐츠 기반 분류 (제목, 설명, 키워드에서 매칭)
     */
    private CategoryResult classifyByContent(LinkMetadata metadata, List<Folder> userFolders) {
        String content = buildSearchableContent(metadata);

        // 각 카테고리별 매칭 점수 계산
        Map<String, Integer> scores = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : CONTENT_KEYWORDS.entrySet()) {
            String category = entry.getKey();
            List<String> keywords = entry.getValue();

            int matchCount = 0;
            for (String keyword : keywords) {
                if (content.contains(keyword.toLowerCase())) {
                    matchCount++;
                }
            }

            if (matchCount > 0) {
                scores.put(category, matchCount);
            }
        }

        // 가장 높은 점수의 카테고리 선택
        if (!scores.isEmpty()) {
            String bestCategory = Collections.max(scores.entrySet(),
                    Map.Entry.comparingByValue()).getKey();
            int maxScore = scores.get(bestCategory);
            double confidence = Math.min(0.9, 0.5 + (maxScore * 0.1));

            return new CategoryResult(bestCategory,
                    findMatchingFolder(bestCategory, userFolders), confidence);
        }

        return new CategoryResult("기타", null, 0.3);
    }

    /**
     * 검색 가능한 콘텐츠 문자열 생성
     */
    private String buildSearchableContent(LinkMetadata metadata) {
        StringBuilder sb = new StringBuilder();

        // 제목 후보군 추가
        if (metadata.getTitleCandidates() != null) {
            sb.append(String.join(" ", metadata.getTitleCandidates())).append(" ");
        }

        // 설명 후보군 추가
        if (metadata.getDescriptionCandidates() != null) {
            sb.append(String.join(" ", metadata.getDescriptionCandidates())).append(" ");
        }

        // 키워드 후보군 추가
        if (metadata.getKeywordCandidates() != null) {
            sb.append(String.join(" ", metadata.getKeywordCandidates()));
        }

        return sb.toString().toLowerCase();
    }

    /**
     * 사용자 폴더 중 카테고리와 매칭되는 폴더 찾기
     * 예: category="스포츠/축구" → 폴더 "축구" 또는 "스포츠" 매칭
     */
    private Long findMatchingFolder(String category, List<Folder> userFolders) {
        if (userFolders == null || userFolders.isEmpty()) {
            return null;
        }

        String[] categoryParts = category.split("/");

        for (Folder folder : userFolders) {
            String folderName = folder.getName().toLowerCase();
            for (String part : categoryParts) {
                if (folderName.contains(part.toLowerCase()) || part.toLowerCase().contains(folderName)) {
                    return (long) folder.getFolderId();
                }
            }
        }
        return null;
    }
}
