package com.web.SearchWeb.linkanalysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.SearchWeb.linkanalysis.domain.PageContent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 링크 콘텐츠 추출기
 * - Jsoup 기반 크롤링으로 제목/설명/본문/파비콘 추출
 * - 유튜브 URL은 oEmbed API로 별도 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LinkMetadataExtractor {

    private final ObjectMapper objectMapper;
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"; // 봇 차단 회피용
    private static final int TIMEOUT_MS = 5000;          // HTTP 연결 타임아웃 (ms)
    private static final int MAX_BODY_SIZE = 512 * 1024; // 크롤링 본문 최대 크기 (512KB)
    private static final int MAX_TEXT_LENGTH = 1500;     // AI 전달용 본문 최대 길이


    /**
     * URL → 페이지 콘텐츠 추출
     * - 유튜브면 oEmbed API, 일반 URL이면 Jsoup 크롤링
     * - 실패 시 도메인명만 담은 최소 결과 반환 (예외 미발생)
     */
    public PageContent extract(String url) {
        log.info("\n┌──────── [콘텐츠 추출 시작] ────────\n│ URL: {}\n└────────────────────────────────", url);

        String domain = extractDomain(url); // 도메인 추출

        // 유튜브 전용 처리 (oEmbed API)
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            PageContent youtubeContent = extractYoutubeContent(url, domain);
            if (youtubeContent != null) return youtubeContent;
        }

        try {
            // Jsoup 크롤링
            Document doc = Jsoup.connect(url)
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .maxBodySize(MAX_BODY_SIZE)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7") // 한국어 우선
                    .referrer("https://www.google.com/")
                    .get();

            String title = extractTitle(doc, domain);          // 제목 추출
            String description = extractDescription(doc);      // 설명(Description) 추출
            String mainText = extractMainText(doc);            // 본문 텍스트 추출
            String contentType = extractContentType(doc);      // 콘텐츠 유형 추출
            List<String> keywords = extractKeywords(doc);      // 메타 키워드 추출
            List<String> headings = extractHeadings(doc);      // 주요 헤딩(H1, H2) 추출

            log.info("\n┌─────── [콘텐츠 추출 완료] ───────\n│ Title:      {}\n│ Desc:       {}\n│ SnippetLen: {}\n│ Type:       {}\n│ Keywords:   {}\n│ Headings:   {}\n└────────────────────────────────",
                    title,
                    description != null ? (description.length() > 30 ? description.substring(0, 30) + "..." : description) : "null",
                    mainText != null ? mainText.length() : 0,
                    contentType != null ? contentType : "none",
                    keywords,
                    headings);

            // 링크 크롤링 결과
            return PageContent.builder()
                    .title(title)
                    .description(description)
                    .mainTextSnippet(mainText)
                    .domain(domain)
                    .url(url)
                    .contentType(contentType)
                    .keywords(keywords)
                    .headings(headings)
                    .build();

        } catch (Exception e) {
            // 크롤링 실패 → 도메인 정보만으로 최소 결과 반환 (Graceful Degradation)
            log.warn("\n┌─────── [콘텐츠 추출 실패] ───────\n│ URL:  {}\n│ 사유: {}\n└────────────────────────────────", url, e.getMessage());
            return PageContent.builder()
                    .title(domain)
                    .domain(domain)
                    .url(url)
                    .build();
        }
    }


    /** 
     * URL에서 도메인(호스트) 추출, 실패 시 원본 URL 반환 
     */
    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            return host != null ? host : url;
        } catch (Exception e) {
            return url;
        }
    }


    /**
     * 유튜브 콘텐츠 추출 (oEmbed API, API 키 불필요)
     * -실패 시 null 반환 → 일반 Jsoup 크롤링으로 폴백
     */
    private PageContent extractYoutubeContent(String url, String domain) {
        try {
            String encodedUrl = URLEncoder.encode(url, StandardCharsets.UTF_8);
            String oEmbedUrl = "https://www.youtube.com/oembed?url=" + encodedUrl + "&format=json";
            Document doc = Jsoup.connect(oEmbedUrl)
                    .ignoreContentType(true)  // JSON 응답 수신용
                    .timeout(3000)
                    .get();

            // JSON 파싱
            JsonNode root = objectMapper.readTree(doc.text());
            String title = root.path("title").asText();
            String author = root.path("author_name").asText("");

            log.info("\n┌─────── [유튜브 콘텐츠 추출 성공] ───────\n│ Title:  {}\n│ Author: {}\n└────────────────────────────────────────", title, author);
            return PageContent.builder()
                    .title(title)
                    .description(author.isBlank() ? null : "YouTube - " + author)
                    .domain(domain)
                    .url(url)
                    .build();
        } catch (Exception e) {
            log.warn("\n┌─────── [유튜브 oEmbed 추출 실패] ───────\n│ URL:  {}\n│ 사유: {}\n└────────────────────────────────────────", url, e.getMessage());
            return null;
        }
    }


    /**
     * 제목 추출
     * 1. og:title
     * 2. twitter:title
     * 3. title 태그
     * 4. 도메인명 (fallback)
     */
    private String extractTitle(Document doc, String domain) {
        String ogTitle = doc.select("meta[property=og:title]").attr("content").trim();
        String twitterTitle = doc.select("meta[name=twitter:title]").attr("content").trim();
        String pageTitle = doc.title().trim();

        log.debug("\n│ ┌── [메타데이터 후보 - Title] ──\n│ │ og:      {}\n│ │ twitter: {}\n│ │ title:   {}\n│ │ domain:  {}\n│ └──────────────────────────────", 
                ogTitle.isEmpty() ? "none" : ogTitle, 
                twitterTitle.isEmpty() ? "none" : twitterTitle, 
                pageTitle.isEmpty() ? "none" : pageTitle, 
                domain);

        if (!ogTitle.isEmpty()) return ogTitle;
        if (!twitterTitle.isEmpty()) return twitterTitle;
        if (!pageTitle.isEmpty()) return pageTitle;

        return domain;
    }


    /**
     * 설명 추출
     * 1. og:description
     * 2. meta description
     * 3. twitter:description
     */
    private String extractDescription(Document doc) {
        String ogDesc = doc.select("meta[property=og:description]").attr("content").trim();
        String metaDesc = doc.select("meta[name=description]").attr("content").trim();
        String twitterDesc = doc.select("meta[name=twitter:description]").attr("content").trim();

        log.debug("\n│ ┌── [메타데이터 후보 - Desc] ───\n│ │ og:      {}\n│ │ meta:    {}\n│ │ twitter: {}\n│ └──────────────────────────────", 
                ogDesc.isEmpty() ? "none" : ogDesc, 
                metaDesc.isEmpty() ? "none" : metaDesc, 
                twitterDesc.isEmpty() ? "none" : twitterDesc);

        if (!ogDesc.isEmpty()) return ogDesc;
        if (!metaDesc.isEmpty()) return metaDesc;
        if (!twitterDesc.isEmpty()) return twitterDesc;

        return null;
    }


    /**
     * 본문 텍스트 추출 (노이즈 제거, 최대 MAX_TEXT_LENGTH자)
     * - nav, footer, header, aside 등 비본문 영역 제거 후 추출
     * - article, main 태그가 있으면 해당 영역만 우선 사용
     */
    private String extractMainText(Document doc) {
        if (doc.body() == null) return null;

        int rawLength = doc.body().text().length();

        // 원본 훼손 방지용 복사본 생성
        Document clone = doc.clone();

        // 노이즈 영역 제거
        clone.select("nav, footer, header, aside, script, style, noscript, iframe, svg, form, [role=navigation], [role=banner], [role=contentinfo], .nav, .navbar, .footer, .sidebar, .ad, .ads, .cookie, .popup").remove();

        int cleanedLength = clone.body().text().length();

        // 본문 영역 우선 탐색 (article → main → [role=main] → body)
        String bodyText = "";
        String usedSelector = "body (전체)";
        for (String selector : new String[]{"article", "main", "[role=main]"}) {
            Elements elements = clone.select(selector);
            if (!elements.isEmpty()) {
                bodyText = elements.first().text().trim();
                if (bodyText.length() > 100) {
                    usedSelector = selector;
                    break;
                }
            }
        }

        // 본문 영역을 못 찾으면 정제된 body 전체 사용
        if (bodyText.length() <= 100) {
            bodyText = clone.body().text().trim();
        }

        if (bodyText.length() > MAX_TEXT_LENGTH) {
            bodyText = bodyText.substring(0, MAX_TEXT_LENGTH);
        }

        log.debug("\n│ ┌── [본문 추출 상세] ──────────\n│ │ Raw 길이:     {}자\n│ │ 노이즈 제거:  {}자 ({}자 제거)\n│ │ 사용 영역:    <{}>\n│ │ 최종 길이:    {}자\n│ │ 미리보기:     {}\n│ └──────────────────────────────",
                rawLength,
                cleanedLength, rawLength - cleanedLength,
                usedSelector,
                bodyText.length(),
                bodyText.length() > 80 ? bodyText.substring(0, 80) + "..." : bodyText);

        return bodyText.isBlank() ? null : bodyText;
    }


    /**
     * 콘텐츠 유형 추출
     * -페이지가 Article, Product, Video 등인지 판별
     * 1. JSON-LD (@type)
     * 2. og:type
     */
    private String extractContentType(Document doc) {
        // 1순위: JSON-LD의 @type
        Elements jsonLdScripts = doc.select("script[type=application/ld+json]");
        for (Element script : jsonLdScripts) {
            try {
                JsonNode root = objectMapper.readTree(script.data());
                String type = root.path("@type").asText("");
                if (!type.isBlank()) {
                    log.debug("\n│ ┌── [콘텐츠 유형] ─────────────\n│ │ 출처: JSON-LD @type\n│ │ 값:   {}\n│ └──────────────────────────────", type);
                    return type;
                }
            } catch (Exception ignored) {}
        }

        // 2순위: og:type
        String ogType = doc.select("meta[property=og:type]").attr("content").trim();
        if (!ogType.isBlank()) {
            log.debug("\n│ ┌── [콘텐츠 유형] ─────────────\n│ │ 출처: og:type\n│ │ 값:   {}\n│ └──────────────────────────────", ogType);
            return ogType;
        }

        log.debug("\n│ ┌── [콘텐츠 유형] ─────────────\n│ │ 출처: 없음\n│ └──────────────────────────────");
        return null;
    }


    /**
     * 메타 키워드 추출 (최대 10개)
     * -meta keywords 태그 + article:tag 메타 태그
     */
    private List<String> extractKeywords(Document doc) {
        List<String> keywords = new ArrayList<>();

        // meta keywords 태그
        String metaKeywords = doc.select("meta[name=keywords]").attr("content").trim();
        int metaCount = 0;
        if (!metaKeywords.isBlank()) {
            List<String> parsed = Arrays.stream(metaKeywords.split(","))
                    .map(String::trim)
                    .filter(k -> !k.isBlank())
                    .toList();
            keywords.addAll(parsed);
            metaCount = parsed.size();
        }

        // article:tag 메타 태그 (뉴스/블로그에서 자주 사용)
        int articleTagCount = 0;
        for (Element el : doc.select("meta[property=article:tag]")) {
            String tag = el.attr("content").trim();
            if (!tag.isBlank() && !keywords.contains(tag)) {
                keywords.add(tag);
                articleTagCount++;
            }
        }

        List<String> result = keywords.size() > 10 ? new ArrayList<>(keywords.subList(0, 10)) : keywords;

        log.debug("\n│ ┌── [키워드 추출] ─────────────\n│ │ meta keywords: {}개 {}\n│ │ article:tag:   {}개\n│ │ 최종:          {}개 {}\n│ └──────────────────────────────",
                metaCount, metaKeywords.isEmpty() ? "" : "[" + metaKeywords + "]",
                articleTagCount,
                result.size(), result);

        return result;
    }


    /**
     * 주요 헤딩 추출 (h1 → h2, 최대 5개)
     * -페이지 콘텐츠의 주제 구조 파악용
     */
    private List<String> extractHeadings(Document doc) {
        List<String> headings = new ArrayList<>();

        for (Element h : doc.select("h1, h2")) {
            String text = h.text().trim();
            if (!text.isBlank() && text.length() <= 100) {
                headings.add(text);
                if (headings.size() >= 5) break;
            }
        }

        log.debug("\n│ ┌── [헤딩 추출] ──────────────\n│ │ 총 {}개 (h1/h2, 최대 5개)\n│ │ {}\n│ └──────────────────────────────",
                headings.size(),
                headings.isEmpty() ? "없음" : String.join("\n│ │ ", headings));

        return headings;
    }
}
