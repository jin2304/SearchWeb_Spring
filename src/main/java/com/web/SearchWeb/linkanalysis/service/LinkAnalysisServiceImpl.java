package com.web.SearchWeb.linkanalysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.service.MemberFolderService;
import com.web.SearchWeb.linkanalysis.domain.FolderContext;
import com.web.SearchWeb.linkanalysis.domain.LinkAnalysisResult;
import com.web.SearchWeb.linkanalysis.domain.PageContent;
import com.web.SearchWeb.linkanalysis.error.LinkAnalysisErrorCode;
import com.web.SearchWeb.linkanalysis.error.LinkAnalysisException;
import com.web.SearchWeb.tag.domain.MemberTag;
import com.web.SearchWeb.tag.service.MemberTagService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 링크 분석 서비스 구현체
 *
 * 처리 흐름:
 * 1. LinkMetadataExtractor로 페이지 크롤링 (Jsoup)
 * 2. 사용자 기존 폴더/태그 조회 (DB)
 * 3. 폴더 컨텍스트 enrichment (LATERAL 쿼리, 실패 시 빈 List → fallback)
 * 4. AI 분석 요청 → 제목/설명/태그/폴더 추천
 * - AI 실패 시 크롤링 데이터만으로 폴백 응답 (Graceful Degradation)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LinkAnalysisServiceImpl implements LinkAnalysisService {

    /** 폴더당 샘플 제목 최대 개수 */
    private static final int FOLDER_SAMPLE_LIMIT = 3;
    /** 폴더별 컨텍스트에 포함할 대표 태그 최대 개수 */
    private static final int FOLDER_TAG_LIMIT = 8;
    /** 폴더 컨텍스트 조회 소프트 타임아웃 (ms) — 초과 시 log.warn, 하드 컷오프는 JDBC 1s timeout */
    private static final long ENRICH_SOFT_TIMEOUT_MS = 300L;
    /** 샘플 제목 최대 길이 (초과 시 절단 + 말줄임) */
    private static final int MAX_SAMPLE_TITLE_LENGTH = 60;
    /** 컨텍스트 태그(빈도) 최대 길이 */
    private static final int MAX_CONTEXT_TAG_LENGTH = 80;
    @Qualifier("chatClient")
    private final ChatClient chatClient;                         // LLM 모델 호출 (AiConfig의 기본 provider 사용)
    private final LinkMetadataExtractor linkMetadataExtractor;   // 페이지 크롤링
    private final MemberFolderService folderService;             // 기존 폴더 조회
    private final MemberTagService tagService;                   // 기존 태그 조회
    private final BookmarkDao bookmarkDao;                       // 폴더 컨텍스트 조회 (LATERAL aggregation)
    private final ObjectMapper objectMapper;                     // JSON 파싱

    // properties에서 파일 경로를 읽어 Resource로 주입 (예: classpath:prompts/system.txt)
    // 프롬프트 수정 시 txt 파일만 변경
    @Value("${app.ai.prompt.system}")
    private Resource systemPromptResource;

    // [Main] 폴더 상세 정보(최근 저장 제목 등)가 포함된 최신 프롬프트 리소스
    @Value("${app.ai.prompt.user.enriched}")
    private Resource enrichedUserPromptResource;

    // [Fallback] 데이터 조회 실패 시 사용하는 비상용 기본 프롬프트 리소스
    @Value("${app.ai.prompt.user.basic}")
    private Resource basicUserPromptResource;

    // 기동 시 1회 로딩 후 필드에 캐싱 → 매 요청마다 파일 I/O 없음
    private String systemPrompt;                       // 변수 치환 없음 → String으로 충분
    private PromptTemplate basicUserPromptTemplate;    // [Fallback] 폴더 이름만 사용하는 기본 템플릿 (조회 실패 시 사용)
    private PromptTemplate enrichedUserPromptTemplate; // [Main] 폴더 상세 정보 {folderContext} 가 포함된 최신 템플릿

    @PostConstruct
    void init() throws IOException {
        this.systemPrompt = systemPromptResource.getContentAsString(StandardCharsets.UTF_8);
        this.enrichedUserPromptTemplate = new PromptTemplate(enrichedUserPromptResource.getContentAsString(StandardCharsets.UTF_8));
        this.basicUserPromptTemplate = new PromptTemplate(basicUserPromptResource.getContentAsString(StandardCharsets.UTF_8));
    }


    /**
     * 링크 분석 메인 로직
     * - URL 검증 → 크롤링 → 기존 데이터 조회 → 폴더 컨텍스트 enrichment → AI 분석 (실패 시 폴백)
     */
    @Override
    public LinkAnalysisResult analyze(Long memberId, String url) {
        validateUrl(url);  // URL 유효성 검사

        // 1. 페이지 크롤링
        PageContent page = linkMetadataExtractor.extract(url);

        // 2. 사용자 기존 폴더/태그 조회 (AI 프롬프트에 포함하여 기존 데이터와 매칭)
        List<MemberFolder> folders = folderService.listRootFolders(memberId, memberId);
        List<MemberTag> tags = tagService.listByOwner(memberId);

        // 3. 폴더 컨텍스트 enrichment — 실패 시 빈 List 반환 → fallback 경로
        List<FolderContext> folderContexts = enrichFolderContext(memberId);

        // 4. AI 분석 (실패 시 크롤링 데이터만으로 폴백)
        try {
            String userPrompt = buildPrompt(page, folders, tags, folderContexts);

            // 로그용으로 폴더 컨텍스트 블록 미리 생성
            boolean hasFolderContext = folderContexts != null && !folderContexts.isEmpty();
            String folderContextLog = hasFolderContext ? "\n" + buildFolderContextBlock(folderContexts) : "없음";
            String tagDictionaryText = renderTagDictionary(tags);
            int tagCount = tags != null ? tags.size() : 0;
            String tagDictionaryLog = tagCount + "개: [" + tagDictionaryText + "]";

            log.debug("""
                    \n┌─────── [AI 분석 요청] ────────
                    │ Prompt 길이: {}자
                    │ ┌── 페이지 정보 ──
                    │ │ Title:    {}
                    │ │ Desc:     {}
                    │ │ Keywords: {}
                    │ │ Headings: {}
                    │ │ Snippet:  {}자
                    │ └────────────────
                    │ ┌── 사용자 데이터 ──
                    │ │ 폴더 {}개: [{}]
                    │ │ 태그 사전: {}
                    │ └────────────────────
                    │ ┌── 폴더 컨텍스트 상세 (폴더별 해시태그 빈도 + 대표 링크) ──
                    {}
                    │ └──────────────────────
                    └──────────────────────────────""",
                    userPrompt.length(),
                    page.getTitle(),
                    page.getDescription() != null ? (page.getDescription().length() > 50 ? page.getDescription().substring(0, 50) + "..." : page.getDescription()) : "null",
                    page.getKeywords().isEmpty() ? "none" : String.join(", ", page.getKeywords()),
                    page.getHeadings().isEmpty() ? "none" : String.join(" | ", page.getHeadings()),
                    page.getMainTextSnippet() != null ? page.getMainTextSnippet().length() : 0,
                    folders.size(), folders.stream().map(MemberFolder::getFolderName).collect(Collectors.joining(", ")),
                    tagDictionaryLog,
                    folderContextLog);

            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            log.debug("\n========== [AI 분석 응답] ==========\n{}\n====================================", aiResponse);
            return parseAndEnrich(aiResponse, folders, tags, page);  // AI 응답 파싱 + 기존 데이터 매칭
        } catch (Exception e) {
            log.warn("\n========== [AI 분석 실패] ==========\n  Graceful degradation 적용\n  사유: {}\n====================================", e.getMessage());
            return buildFallbackResult(page);
        }
    }


    /**
     * URL 유효성 검증
     * - null/빈값 체크
     * - 스킴이 정확히 http 또는 https인지 확인 (startsWith 대신 equals 사용)
     * - 호스트 null/blank 체크
     * - DNS 해석 후 loopback·link-local·private 대역 차단 (SSRF 방어)
     */
    private void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw LinkAnalysisException.of(LinkAnalysisErrorCode.INVALID_URL);
        }
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            if (!"http".equals(scheme) && !"https".equals(scheme)) {
                throw LinkAnalysisException.of(LinkAnalysisErrorCode.INVALID_URL);
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                throw LinkAnalysisException.of(LinkAnalysisErrorCode.INVALID_URL);
            }

            // InetAddress: DNS 해석(도메인 → IP) + IP 주소 유형 판별 유틸리티
            // getByName()이 실제 DNS 조회를 수행하므로 존재하지 않는 호스트는 여기서 예외 발생
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress()           // 127.x.x.x, ::1
                    || address.isLinkLocalAddress()   // 169.254.x.x (AWS/GCP 메타데이터), fe80::/10
                    || address.isSiteLocalAddress()   // 10.x.x.x, 172.16-31.x.x, 192.168.x.x
                    || address.isAnyLocalAddress()) { // 0.0.0.0, ::
                throw LinkAnalysisException.of(LinkAnalysisErrorCode.BLOCKED_HOST);
            }
        } catch (LinkAnalysisException e) {
            throw e;
        } catch (Exception e) {
            throw LinkAnalysisException.of(LinkAnalysisErrorCode.INVALID_URL);
        }
    }


    /**
     * 폴더 컨텍스트 enrichment
     * - BookmarkDao.selectFolderContexts() 호출 → FolderContext 리스트 변환
     * - 실패(SQLException, 매퍼 예외 등) 시 빈 List 반환 → 호출부에서 fallback 경로로 분기
     * - 300ms 초과 시 log.warn (소프트 시그널, 하드 컷오프는 JDBC timeout="1")
     */
    private List<FolderContext> enrichFolderContext(Long memberId) {
        long t0 = System.currentTimeMillis();
        try {
            List<Map<String, Object>> rows = bookmarkDao.selectFolderContexts(memberId, FOLDER_SAMPLE_LIMIT, FOLDER_TAG_LIMIT);
            long elapsedMs = System.currentTimeMillis() - t0;
            if (elapsedMs > ENRICH_SOFT_TIMEOUT_MS) {
                log.warn("[folder-context] slow query: {}ms (soft threshold {}ms)", elapsedMs, ENRICH_SOFT_TIMEOUT_MS);
            }
            if (rows == null || rows.isEmpty()) {
                return List.of();
            }
            return rows.stream().map(FolderContext::fromRow).toList();
        } catch (Exception e) {  // SQLException(JDBC timeout), MyBatisException, NPE 등
            log.warn("[folder-context] query failed; falling back to names only: {}", e.getMessage());
            return List.of();
        }
    }


    /**
     * 샘플 제목 sanitization
     * - ASCII 제어 문자 제거 (프롬프트 인젝션 / 파싱 깨짐 방어)
     * - 템플릿 변수 marker 치환: '{' → '(', '}' → ')'
     * - 60자 초과 시 절단 + 말줄임표
     */
    private String sanitizeTitle(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String cleaned = raw.replaceAll("[\\x00-\\x1F\\x7F]", " ")
                .replace("{", "(")
                .replace("}", ")")
                .strip();
        if (cleaned.length() > MAX_SAMPLE_TITLE_LENGTH) {
            cleaned = cleaned.substring(0, MAX_SAMPLE_TITLE_LENGTH) + "…";
        }
        return cleaned;
    }

    /**
     * 태그 sanitization
     * - 프롬프트 구조를 깨뜨릴 수 있는 제어 문자와 템플릿 marker를 제거/치환
     * - 긴 태그(빈도)는 컨텍스트 가독성을 위해 절단
     */
    private String sanitizeTag(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String cleaned = raw.replaceAll("[\\x00-\\x1F\\x7F]", " ")
                .replace("{", "(")
                .replace("}", ")")
                .strip();
        if (cleaned.length() > MAX_CONTEXT_TAG_LENGTH) {
            cleaned = cleaned.substring(0, MAX_CONTEXT_TAG_LENGTH) + "…";
        }
        return cleaned;
    }

    private String renderTagDictionary(List<MemberTag> tags) {
        if (tags == null || tags.isEmpty()) return "";

        return tags.stream()
                .map(MemberTag::getTagName)
                .map(this::sanitizeTag)
                .filter(tagName -> !tagName.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
    }


    /**
     * 폴더 컨텍스트 블록 렌더링
     * - 포맷: "- 폴더명: 설명\n  해시태그(빈도): [tag1(12), tag2(7)]\n  대표 링크: title1, title2"
     * - UNORGANIZED는 "(시스템 폴더 - 분석 불가 시에만)" 마커 부착
     * - description/태그/샘플이 없으면 폴더명만 표시
     */
    private String buildFolderContextBlock(List<FolderContext> folderContexts) {
        StringBuilder sb = new StringBuilder();
        for (FolderContext folderContext : folderContexts) {
            String name = folderContext.getFolderName() != null ? folderContext.getFolderName() : "";
            boolean unorganized = "UNORGANIZED".equalsIgnoreCase(folderContext.getFolderType());
            sb.append("- ").append(name);
            if (unorganized) {
                sb.append(" (시스템 폴더 - 분석 불가 시에만)");
            }

            String desc = folderContext.getDescription();
            List<String> samples = folderContext.getSampleTitles();
            List<String> tags = folderContext.getTopTags();
            List<String> sanitized = new ArrayList<>();
            if (samples != null) {
                for (String s : samples) {
                    String cleaned = sanitizeTitle(s);
                    if (!cleaned.isEmpty()) sanitized.add(cleaned);
                }
            }
            List<String> sanitizedTags = new ArrayList<>();
            if (tags != null) {
                for (String tag : tags) {
                    String cleaned = sanitizeTag(tag);
                    if (!cleaned.isEmpty()) sanitizedTags.add(cleaned);
                }
            }

            boolean hasDesc = desc != null && !desc.isBlank();
            boolean hasSamples = !sanitized.isEmpty();
            boolean hasTags = !sanitizedTags.isEmpty();

            if (hasDesc || hasTags || hasSamples) {
                if (hasDesc) {
                    sb.append(": ");
                    String stripped = desc.strip();
                    sb.append(stripped);
                    if (!stripped.endsWith(".")) sb.append(".");
                }
                if (hasTags) {
                    sb.append("\n  해시태그(빈도): [").append(String.join(", ", sanitizedTags)).append("]");
                }
                if (hasSamples) {
                    sb.append("\n  대표 링크: ").append(String.join(", ", sanitized));
                }
            }

            sb.append("\n");
        }
        // 끝 개행 정리
        if (sb.length() > 0 && sb.charAt(sb.length() - 1) == '\n') {
            sb.setLength(sb.length() - 1);
        }
        return sb.toString();
    }


    /**
     * user prompt 생성
     * - fallback 경로 (folderContexts 비어있음): basic template 렌더링 (byte-identical)
     * - success 경로 (folderContexts 있음): enriched template 렌더링 ({folderContext} 포함)
     *
     * 값 준비: Map.of()는 null 허용 안 하므로, 모든 placeholder를 빈 문자열/기본값으로 가드.
     */
    private String buildPrompt(PageContent page,
                               List<MemberFolder> folders,
                               List<MemberTag> tags,
                               List<FolderContext> folderContexts) {

        String folderNamesText = folders.stream()
                .map(MemberFolder::getFolderName)
                .collect(Collectors.joining(", "));

        String tagNamesText = renderTagDictionary(tags);

        // ----- 값 준비 (모든 템플릿 렌더링 전에 적용 — Map.of()의 null 금지 + byte-identical 보장) -----
        String title = page.getTitle() != null ? page.getTitle() : "";
        String description = page.getDescription() != null ? page.getDescription() : "";
        String keywords = page.getKeywords().isEmpty() ? "없음" : String.join(", ", page.getKeywords());
        String headings = page.getHeadings().isEmpty() ? "없음" : String.join(" | ", page.getHeadings());
        String snippet = page.getMainTextSnippet() != null ? page.getMainTextSnippet() : "";
        if (snippet.length() > 1000) {
            snippet = snippet.substring(0, 1000) + "...";
        }
        String url = page.getUrl() != null ? page.getUrl() : "";

        // ----- 공통 변수 준비 (두 템플릿이 공유하는 데이터) -----
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("url", url);
        variables.put("title", title);
        variables.put("description", description);
        variables.put("keywords", keywords);
        variables.put("headings", headings);
        variables.put("mainTextSnippet", snippet);

        // ----- Fallback 경로: 폴더 컨텍스트 정보가 없을 때 (기본형 템플릿 렌더링) -----
        if (folderContexts == null || folderContexts.isEmpty()) {
            variables.put("tags", tagNamesText);
            variables.put("folders", folderNamesText.isBlank() ? "미분류" : folderNamesText);
            return basicUserPromptTemplate.render(variables);
        }

        // ----- Success 경로: 폴더 컨텍스트 정보가 있을 때 (강화형 템플릿 렌더링) -----
        variables.put("tags", tagNamesText);
        variables.put("folderContext", buildFolderContextBlock(folderContexts));
        return enrichedUserPromptTemplate.render(variables);
    }


    /**
     * AI 응답 파싱 + 기존 폴더/태그 매칭
     * - 마크다운 코드블록 제거 → JSON 파싱
     * - 추천 태그/폴더를 기존 데이터와 대조하여 isExisting 설정
     * - 파싱 실패 시 폴백 결과 반환
     */
    private LinkAnalysisResult parseAndEnrich(String aiResponse, List<MemberFolder> folders, List<MemberTag> tags, PageContent page) {
        try {
            // 마크다운 코드블록 제거 (```json ... ``` 대비)
            String json = aiResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            JsonNode root = objectMapper.readTree(json);

            String title = root.path("title").asText(page.getTitle());         // 없으면 크롤링 데이터 사용
            String description = root.path("description").asText(page.getDescription());

            // 추천 태그 → 기존 태그와 매칭 (대소문자 무시), 2~5개 범위 강제
            List<LinkAnalysisResult.SuggestedTag> suggestedTags = new ArrayList<>();
            JsonNode tagsNode = root.path("suggestedTags");
            if (tagsNode.isArray()) {
                final int minTags = 2;
                final int maxTags = 5;

                for (JsonNode tagNode : tagsNode) {
                    if (suggestedTags.size() >= maxTags) break;  // 최대 5개 제한
                    String rawTagName = tagNode.asText().trim();  // 앞뒤 공백 제거
                    if (rawTagName.isBlank()) continue;           // 빈 값 스킵
                    MemberTag matchedTag = findMatchingTag(tags, rawTagName);
                    String tagName = matchedTag != null ? matchedTag.getTagName() : rawTagName;
                    boolean isDuplicate = suggestedTags.stream()
                            .anyMatch(t -> t.getTagName().equalsIgnoreCase(tagName));
                    if (isDuplicate) continue;                 // 중복 스킵
                    boolean isExisting = matchedTag != null;

                    suggestedTags.add(LinkAnalysisResult.SuggestedTag.builder()
                            .tagName(tagName)
                            .isExisting(isExisting)
                            .build());
                }

                // 최소 2개 미만이면 경고 로그 (AI가 규칙 위반)
                if (suggestedTags.size() < minTags) {
                    log.warn("[Tag Count Violation] AI generated {} tags (expected 2~5): {}",
                        suggestedTags.size(), suggestedTags.stream().map(LinkAnalysisResult.SuggestedTag::getTagName).toList());
                }
            }

            // 추천 폴더 → 기존 폴더와 매칭 (대소문자 무시)
            String suggestedFolderName = root.path("suggestedFolder").asText("").trim();  // 앞뒤 공백 제거
            LinkAnalysisResult.SuggestedFolder suggestedFolder = null;
            if (!suggestedFolderName.isBlank()) {
                MemberFolder matchedFolder = findMatchingFolder(folders, suggestedFolderName);

                // 미분류 추천 시 태그 기반 폴더명으로 보정
                if (isUnorganizedSuggestion(suggestedFolderName, matchedFolder)) {
                    String tagBasedFolderName = pickFolderNameFromTags(suggestedTags);
                    if (tagBasedFolderName != null) {
                        suggestedFolderName = tagBasedFolderName;
                        matchedFolder = findMatchingFolder(folders, suggestedFolderName);
                    }
                }

                suggestedFolder = LinkAnalysisResult.SuggestedFolder.builder()
                        .memberFolderId(matchedFolder != null ? matchedFolder.getMemberFolderId() : null)
                        .folderName(suggestedFolderName)
                        .isExisting(matchedFolder != null)
                        .build();
            }

            return LinkAnalysisResult.builder()
                    .title(title)
                    .description(description)
                    .suggestedTags(suggestedTags)
                    .suggestedFolder(suggestedFolder)
                    .build();
        } catch (Exception e) {
            log.warn("\n========== [AI 응답 파싱 실패] ==========\n  사유: {}\n==========================================", e.getMessage());
            return buildFallbackResult(page);
        }
    }

    /** 기존 폴더명 정확 매칭 */
    private MemberFolder findMatchingFolder(List<MemberFolder> folders, String folderName) {
        return folders.stream()
                .filter(f -> f.getFolderName().equalsIgnoreCase(folderName))
                .findFirst()
                .orElse(null);
    }

    private MemberTag findMatchingTag(List<MemberTag> tags, String tagName) {
        if (tags == null || tagName == null || tagName.isBlank()) return null;

        return tags.stream()
                .filter(t -> t.getTagName() != null)
                .filter(t -> t.getTagName().equalsIgnoreCase(tagName))
                .findFirst()
                .orElse(null);
    }

    /** 시스템 기본 폴더 추천 여부 */
    private boolean isUnorganizedSuggestion(String suggestedFolderName, MemberFolder matchedFolder) {
        return (matchedFolder != null && matchedFolder.isUnorganized())
                || "미분류".equalsIgnoreCase(suggestedFolderName)
                || "기본 폴더".equalsIgnoreCase(suggestedFolderName);
    }

    /** 미분류 보정용 폴더명: 첫 유효 태그 */
    private String pickFolderNameFromTags(List<LinkAnalysisResult.SuggestedTag> suggestedTags) {
        if (suggestedTags == null || suggestedTags.isEmpty()) return null;

        return suggestedTags.stream()
                .map(LinkAnalysisResult.SuggestedTag::getTagName)
                .filter(tagName -> tagName != null && !tagName.isBlank())
                .findFirst()
                .orElse(null);
    }


    /**
     * 폴백 결과 생성 (AI 실패 시 크롤링 데이터만 사용, 태그/폴더 추천 없음)
     */
    private LinkAnalysisResult buildFallbackResult(PageContent page) {
        return LinkAnalysisResult.builder()
                .title(page.getTitle())
                .description(page.getDescription())
                .suggestedTags(List.of())
                .suggestedFolder(null)
                .build();
    }
}
