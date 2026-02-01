package com.web.SearchWeb.link.service;

import com.web.SearchWeb.link.dto.LinkMetadata;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * URL에서 메타데이터를 추출하는 컴포넌트
 */
@Component
public class LinkMetadataExtractor {

    private static final int TIMEOUT_MS = 10000;
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

    public LinkMetadata extract(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();

            // 메타데이터 정제 
            List<String> jsonLd = extractJsonLd(doc);                                    // JSON-LD(Linked Data) 데이터 추출
            List<String> titleCandidates = extractTitleCandidates(doc, jsonLd);          // 제목 후보군 추출
            List<String> descCandidates = extractDescriptionCandidates(doc, jsonLd);     // 설명 후보군 추출
            List<String> keywordCandidates = extractKeywordCandidates(doc, url, jsonLd); // 키워드 후보군 추출
            List<String> headingStructure = extractHeadingStructure(doc);                // 문서 계층 구조 추출
            String mainContent = "";
      
            //if (descCandidates.isEmpty()) { // 설명이 비어있으면 본문 요약으로 대체
                mainContent = extractMainContent(doc);   
                if (!mainContent.isEmpty()) {
                     descCandidates.add(mainContent.length() > 1000 ? mainContent.substring(0, 1000) : mainContent);
                }
            //}

            return LinkMetadata.builder()
                    .url(url)
                    .domain(extractDomain(url))
                    .titleCandidates(titleCandidates)
                    .descriptionCandidates(descCandidates)
                    .keywordCandidates(keywordCandidates)
                    .mainContent(mainContent)
                    .headingStructure(headingStructure)
                    .siteName(getMetaProperty(doc, "og:site_name"))
                    .build();

        } catch (Exception e) {
            return fallbackFromUrl(url);
        }
    }

    
    /**
     * JSON-LD(Linked Data) 데이터 추출
     */
    private List<String> extractJsonLd(Document doc) {
        List<String> jsonLdList = new ArrayList<>();
        Elements scripts = doc.select("script[type=application/ld+json]");

        for (Element script : scripts) {
            String json = script.data().trim();
            if (!json.isEmpty()) {
                jsonLdList.add(json);
            }
        }
        return jsonLdList;
    }


    /**
     * 제목 후보군 추출
     * 1. JSON-LD (headline, name)
     * 2. og:title
     * 3. twitter:title
     * 4. <title>
     * 5. <h1>
     */
    private List<String> extractTitleCandidates(Document doc, List<String> jsonLd) {
        List<String> jsonLdTitles = extractFieldsFromJsonLd(jsonLd, "headline", "name");
        List<String> candidates = new ArrayList<>();
        for (String jsonLdTitle : jsonLdTitles) {
            addIfNotEmpty(candidates, jsonLdTitle);
        }
        addIfNotEmpty(candidates, getMetaProperty(doc, "og:title"));
        addIfNotEmpty(candidates, getMetaName(doc, "twitter:title"));
        addIfNotEmpty(candidates, doc.title());
        addIfNotEmpty(candidates, getFirstElementText(doc, "h1"));

        return candidates;
    }


    /**
     * 설명 후보군 추출
     * 1. JSON-LD (description)
     * 2. og:description
     * 3. description
     */
    private List<String> extractDescriptionCandidates(Document doc, List<String> jsonLd) {
        List<String> jsonLdDescriptions = extractFieldsFromJsonLd(jsonLd, "description");
        List<String> candidates = new ArrayList<>();
        for (String jsonLdDescription : jsonLdDescriptions) {
            addIfNotEmpty(candidates, jsonLdDescription);
        }
        addIfNotEmpty(candidates, getMetaProperty(doc, "og:description"));
        addIfNotEmpty(candidates, getMetaName(doc, "description"));
        
        return candidates;
    }


    /**
     * 본문 텍스트 추출 (노이즈 제거)
     */
    private String extractMainContent(Document doc) {
        // 노이즈 태그 제거
        doc.select("script, style, nav, footer, iframe, noscript, .hidden, [aria-hidden=true]").remove();

        // 메인 콘텐츠 영역 우선 탐색
        Element main = doc.selectFirst("main, article, #content, .content");
        Element target = (main != null) ? main : doc.body();
        String text = (target != null) ? target.text() : "";
        
        // 길이 제한 (토큰 비용 절약)
        return text.length() > 500 ? text.substring(0, 500) : text;
    }


    /**
     * 키워드 후보군 추출
     */
    private List<String> extractKeywordCandidates(Document doc, String url, List<String> jsonLd) {
        Set<String> keywords = new LinkedHashSet<>();

        // JSON-LD Collection
        keywords.addAll(extractFieldsFromJsonLd(jsonLd, "keywords"));

        // meta keywords
        String metaKeywords = getMetaName(doc, "keywords");
        if (isNotEmpty(metaKeywords)) {
            Arrays.stream(metaKeywords.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(keywords::add);
        }

        // article:tag
        Elements articleTags = doc.select("meta[property=article:tag]");
        for (Element tag : articleTags) {
            String content = tag.attr("content");
            if (isNotEmpty(content))
                keywords.add(content.trim());
        }

        // 해시태그 링크 (소셜미디어 등)
        doc.select("a[href*=hashtag], a[href*=tag]").forEach(a -> {
            String text = a.text().replaceAll("#", "").trim();
            if (!text.isEmpty())
                keywords.add(text);
        });

        // URL 경로
        extractFromUrlPath(url, keywords);

        return new ArrayList<>(keywords);
    }

    
    /**
     * 문서 계층 구조 추출 (H1 ~ H3)
     */
    private List<String> extractHeadingStructure(Document doc) {
        List<String> headings = new ArrayList<>();
        // 문서 순서대로 H1, H2, H3 추출
        Elements headers = doc.select("h1, h2, h3");

        for (Element header : headers) {
            String text = header.text().trim();
            if (!text.isEmpty()) {
                headings.add(header.tagName() + ": " + text);
            }
        }
        return headings;
    }




    // ========================================
    // Helper Methods
    // ========================================
    private void addIfNotEmpty(List<String> list, String value) {
        if (value != null && !value.trim().isEmpty()) {
            String trimmed = value.trim();
            // 중복 제거 (이미 상위 우선순위로 들어간 값과 같으면 스킵)
            if (!list.contains(trimmed)) {
                list.add(trimmed);
            }
        }
    }

    private String getBodySnippet(Document doc) {
        Element body = doc.body();
        if (body != null) {
            String text = body.text();
            return text.length() > 1500 ? text.substring(0, 1500) : text;
        }
        return "";
    }

    private String getFirstElementText(Document doc, String selector) {
        Element el = doc.selectFirst(selector);
        return el != null ? el.text() : "";
    }

    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null)
                return "";
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (Exception e) {
            return "";
        }
    }

    private void extractFromUrlPath(String url, Set<String> keywords) {
        try {
            URI uri = new URI(url);
            String path = uri.getPath();
            if (path != null && !path.isEmpty()) {
                Arrays.stream(path.split("[/-]"))
                        .map(String::trim)
                        .filter(s -> s.length() > 2)
                        .filter(s -> !s.matches("\\d+"))
                        .limit(5)
                        .forEach(keywords::add);
            }
        } catch (Exception e) {
        }
    }

    private LinkMetadata fallbackFromUrl(String url) {
        String domain = extractDomain(url);
        List<String> pathKeywords = new ArrayList<>();
        extractFromUrlPath(url, new LinkedHashSet<>(pathKeywords));

        return LinkMetadata.builder()
                .url(url)
                .domain(domain)
                .titleCandidates(new ArrayList<>())
                .descriptionCandidates(new ArrayList<>())
                .keywordCandidates(pathKeywords)
                .mainContent("")
                .headingStructure(new ArrayList<>())
                .build();
    }

    private String getMetaProperty(Document doc, String property) {
        Element meta = doc.selectFirst("meta[property=" + property + "]");
        return meta != null ? meta.attr("content") : "";
    }

    private String getMetaName(Document doc, String name) {
        Element meta = doc.selectFirst("meta[name=" + name + "]");
        return meta != null ? meta.attr("content") : "";
    }

    private boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }



    
    // ========================================
    // JSON-LD Extraction Helpers
    // ========================================
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * [Active Collection] JSON-LD에서 특정 키(headline, description 등)의 값을 재귀적으로 추출.
     * 이를 통해 Meta 태그 정보가 부족한 경우, 보완적으로 활용하여 메타데이터 후보군을 확보.
     *
     * @param jsonLdList JSON-LD 문자열 리스트
     * @param targetKeys 추출 대상 JSON Key
     * @return 추출된 텍스트 리스트
     */
    private List<String> extractFieldsFromJsonLd(List<String> jsonLdList, String... targetKeys) {
        
        if (jsonLdList == null || jsonLdList.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> results = new ArrayList<>();
        Set<String> keys = new HashSet<>(Arrays.asList(targetKeys));

        for (String json : jsonLdList) {
            try {
                JsonNode root = objectMapper.readTree(json);
                recursiveSearch(root, keys, results);
            } catch (Exception e) {
                // JSON 파싱 실패 시 무시 (비정형 데이터 등)
            }
        }
        return results;
    }

    /**
     * JSON 트리를 재귀적으로 순회하며 타겟 Key에 해당하는 값을 찾습니다.
     * - Object 구조: Key가 일치하고 값이 텍스트면 수집. 그 외엔 값 내부로 재귀 진입.
     * - Array 구조: 배열 요소 각각에 대해 재귀 진입.
     */
    private void recursiveSearch(JsonNode node, Set<String> keys, List<String> results) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                JsonNode value = field.getValue();

                // 1. 타겟 키와 일치하고, 값이 텍스트인 경우 -> 수집 성공
                if (keys.contains(key) && value.isTextual()) {
                    String text = value.asText().trim();
                    if (!text.isEmpty()) {
                        results.add(text);
                    }
                }
                // 2. 값 내부를 더 깊이 탐색 (Nested Object/Array 고려)
                recursiveSearch(value, keys, results);
            }
        } else if (node.isArray()) {
            for (JsonNode item : node) {
                recursiveSearch(item, keys, results);
            }
        }
    }
}
