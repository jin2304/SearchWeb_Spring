package com.web.SearchWeb.link.service;

import com.web.SearchWeb.link.dto.LinkMetadata;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 해시태그 자동 생성기
 * 도메인 기반 해시태그 + 메타데이터 키워드 기반 해시태그 생성
 */
@Component
public class HashtagGenerator {

    private static final int MAX_HASHTAGS = 5;

    // 도메인별 기본 해시태그
    private static final Map<String, List<String>> DOMAIN_HASHTAGS = Map.of(
            "github.com", List.of("GitHub", "오픈소스"),
            "youtube.com", List.of("YouTube"),
            "youtu.be", List.of("YouTube"),
            "medium.com", List.of("Medium", "블로그"),
            "stackoverflow.com", List.of("StackOverflow", "개발QA"),
            "velog.io", List.of("Velog", "개발블로그"),
            "tistory.com", List.of("Tistory", "블로그"));

    /**
     * 메타데이터를 기반으로 해시태그 생성
     */
    public List<String> generate(LinkMetadata metadata) {
        Set<String> hashtags = new LinkedHashSet<>(); // 순서 유지, 중복 제거

        // 1. 도메인 기반 해시태그
        addDomainHashtags(hashtags, metadata.getDomain());

        // 2. 메타 키워드 후보군에서 추출
        if (metadata.getKeywordCandidates() != null && !metadata.getKeywordCandidates().isEmpty()) {
            metadata.getKeywordCandidates().stream()
                    .limit(5) // 후보군이 많을 수 있으므로 제한
                    .map(this::normalizeHashtag)
                    .filter(tag -> !tag.isEmpty())
                    .forEach(hashtags::add);
        }

        // 3. 사이트명 추가
        if (isNotEmpty(metadata.getSiteName())) {
            hashtags.add(normalizeHashtag(metadata.getSiteName()));
        }

        // 4. 제목 후보군에서 주요 키워드 추출 (모든 후보군 탐색)
        if (metadata.getTitleCandidates() != null) {
            for (String title : metadata.getTitleCandidates()) {
                extractFromTitle(hashtags, title);
            }
        }

        return hashtags.stream()
                .filter(tag -> !tag.isEmpty())
                .limit(MAX_HASHTAGS)
                .collect(Collectors.toList());
    }

    /**
     * 도메인 기반 해시태그 추가
     */
    private void addDomainHashtags(Set<String> hashtags, String domain) {
        DOMAIN_HASHTAGS.entrySet().stream()
                .filter(e -> domain.contains(e.getKey()))
                .flatMap(e -> e.getValue().stream())
                .forEach(hashtags::add);
    }

    /**
     * 해시태그 정규화 (공백 제거, 특수문자 제거)
     */
    private String normalizeHashtag(String text) {
        if (text == null)
            return "";
        // 공백, 특수문자 제거 (영문, 한글, 숫자만 유지)
        return text.replaceAll("[^a-zA-Z가-힣0-9]", "").trim();
    }

    /**
     * 제목에서 주요 키워드 추출
     * 간단한 규칙: 대문자 단어, 한글 2글자 이상 단어
     */
    private void extractFromTitle(Set<String> hashtags, String title) {
        if (title == null || title.isEmpty())
            return;

        // 제목을 단어로 분리
        String[] words = title.split("[\\s\\-_/|:,]+");

        for (String word : words) {
            String normalized = normalizeHashtag(word);

            // 2글자 이상, 10글자 이하
            if (normalized.length() >= 2 && normalized.length() <= 10) {
                // 일반적인 불용어 제외
                if (!isStopWord(normalized.toLowerCase())) {
                    hashtags.add(normalized);
                }
            }

            // 최대 개수 제한
            if (hashtags.size() >= MAX_HASHTAGS)
                break;
        }
    }

    /**
     * 불용어 체크 (해시태그로 부적합한 일반 단어)
     */
    private boolean isStopWord(String word) {
        Set<String> stopWords = Set.of(
                "the", "a", "an", "is", "are", "was", "were", "be", "been",
                "have", "has", "had", "do", "does", "did", "will", "would",
                "could", "should", "may", "might", "must", "can", "this",
                "that", "these", "those", "for", "with", "about", "from",
                "into", "through", "during", "before", "after", "above",
                "below", "to", "of", "in", "on", "by", "at", "and", "or",
                "but", "if", "then", "else", "when", "up", "down", "out",
                "off", "over", "under", "again", "further", "once", "here",
                "there", "all", "each", "few", "more", "most", "other",
                "some", "such", "no", "nor", "not", "only", "same", "so",
                "than", "too", "very", "just", "how", "what", "which", "who",
                "its", "your", "my", "his", "her", "our", "their",
                // 한글 불용어
                "그리고", "하지만", "그러나", "또는", "그래서", "따라서",
                "이것", "저것", "그것", "여기", "저기", "거기");
        return stopWords.contains(word);
    }

    private boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
