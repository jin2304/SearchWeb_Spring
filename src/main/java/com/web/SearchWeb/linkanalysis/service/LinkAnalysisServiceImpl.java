package com.web.SearchWeb.linkanalysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.service.MemberFolderService;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 링크 분석 서비스 구현체
 *
 * 처리 흐름:
 * 1. LinkMetadataExtractor로 페이지 크롤링 (Jsoup)
 * 2. 사용자 기존 폴더/태그 조회 (DB)
 * 3. AI 분석 요청 → 제목/설명/태그/폴더 추천
 * - AI 실패 시 크롤링 데이터만으로 폴백 응답 (Graceful Degradation)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LinkAnalysisServiceImpl implements LinkAnalysisService {

    @Qualifier("chatClient")
    private final ChatClient chatClient;                         // LLM 모델 호출 (AiConfig의 기본 provider 사용)
    private final LinkMetadataExtractor linkMetadataExtractor;   // 페이지 크롤링
    private final MemberFolderService folderService;             // 기존 폴더 조회
    private final MemberTagService tagService;                   // 기존 태그 조회
    private final ObjectMapper objectMapper;                     // JSON 파싱

    // properties에서 파일 경로를 읽어 Resource로 주입 (예: classpath:prompts/system.txt)
    // 프롬프트 수정 시 txt 파일만 변경
    @Value("${app.ai.prompt.system}")
    private Resource systemPromptResource;

    @Value("${app.ai.prompt.user}")
    private Resource userPromptResource;

    // 기동 시 1회 로딩 후 필드에 캐싱 → 매 요청마다 파일 I/O 없음
    private String systemPrompt;               // 변수 치환 없음 → String으로 충분
    private PromptTemplate userPromptTemplate; // {tags}, {title} 등 변수 치환 필요 → PromptTemplate

    @PostConstruct
    void init() throws IOException {
        this.systemPrompt = systemPromptResource.getContentAsString(StandardCharsets.UTF_8);
        this.userPromptTemplate = new PromptTemplate(userPromptResource.getContentAsString(StandardCharsets.UTF_8));
    }


    /**
     * 링크 분석 메인 로직
     * - URL 검증 → 크롤링 → 기존 데이터 조회 → AI 분석 (실패 시 폴백)
     */
    @Override
    public LinkAnalysisResult analyze(Long memberId, String url) {
        validateUrl(url);  // URL 유효성 검사

        // 1. 페이지 크롤링
        PageContent page = linkMetadataExtractor.extract(url);

        // 2. 사용자 기존 폴더/태그 조회 (AI 프롬프트에 포함하여 기존 데이터와 매칭)
        List<MemberFolder> folders = folderService.listRootFolders(memberId, memberId);
        List<MemberTag> tags = tagService.listByOwner(memberId);

        // 3. AI 분석 (실패 시 크롤링 데이터만으로 폴백)
        try {
            String userPrompt = buildPrompt(page, folders, tags);

            log.debug("""
                    \n┌─────── [AI 분석 요청] ────────
                    │ Prompt 길이: {}자
                    │ ┌── 페이지 정보 ──
                    │ │ Title:    {}
                    │ │ Desc:     {}
                    │ │ Type:     {}
                    │ │ Keywords: {}
                    │ │ Headings: {}
                    │ │ Snippet:  {}자
                    │ └────────────────
                    │ ┌── 사용자 기존 데이터 ──
                    │ │ 폴더 {}개: [{}]
                    │ │ 태그 {}개: [{}]
                    │ └────────────────────
                    └──────────────────────────────""",
                    userPrompt.length(),
                    page.getTitle(),
                    page.getDescription() != null ? (page.getDescription().length() > 50 ? page.getDescription().substring(0, 50) + "..." : page.getDescription()) : "null",
                    page.getContentType() != null ? page.getContentType() : "none",
                    page.getKeywords().isEmpty() ? "none" : String.join(", ", page.getKeywords()),
                    page.getHeadings().isEmpty() ? "none" : String.join(" | ", page.getHeadings()),
                    page.getMainTextSnippet() != null ? page.getMainTextSnippet().length() : 0,
                    folders.size(), folders.stream().map(MemberFolder::getFolderName).collect(Collectors.joining(", ")),
                    tags.size(), tags.stream().map(MemberTag::getTagName).collect(Collectors.joining(", ")));

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
     * user prompt 생성 
     */
    private String buildPrompt(PageContent page, List<MemberFolder> folders, List<MemberTag> tags) {
        String folderNames = folders.stream()
                .map(MemberFolder::getFolderName)
                .collect(Collectors.joining(", "));

        String tagNames = tags.stream()
                .map(MemberTag::getTagName)
                .collect(Collectors.joining(", "));

        // 본문이 너무 길면 토큰 낭비 → 1000자로 제한
        String snippet = page.getMainTextSnippet() != null ? page.getMainTextSnippet() : "";
        if (snippet.length() > 1000) {
            snippet = snippet.substring(0, 1000) + "...";
        }

        // {변수명} 플레이스홀더를 실제 값으로 치환하여 최종 user prompt 생성
        return userPromptTemplate.render(Map.of(
                "tags", tagNames,
                "folders", folderNames,
                "url", page.getUrl(),
                "title", page.getTitle() != null ? page.getTitle() : "",
                "description", page.getDescription() != null ? page.getDescription() : "",
                "contentType", page.getContentType() != null ? page.getContentType() : "알 수 없음",
                "keywords", page.getKeywords().isEmpty() ? "없음" : String.join(", ", page.getKeywords()),
                "headings", page.getHeadings().isEmpty() ? "없음" : String.join(" | ", page.getHeadings()),
                "mainTextSnippet", snippet
        ));
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

            // 추천 태그 → 기존 태그와 매칭 (대소문자 무시), 최대 5개로 제한
            List<LinkAnalysisResult.SuggestedTag> suggestedTags = new ArrayList<>();
            JsonNode tagsNode = root.path("suggestedTags");
            if (tagsNode.isArray()) {
                int maxTags = 5;
                for (JsonNode tagNode : tagsNode) {
                    if (suggestedTags.size() >= maxTags) break;
                    String tagName = tagNode.asText().trim();  // 앞뒤 공백 제거
                    if (tagName.isBlank()) continue;           // 빈 값 스킵
                    boolean isDuplicate = suggestedTags.stream()
                            .anyMatch(t -> t.getTagName().equalsIgnoreCase(tagName));
                    if (isDuplicate) continue;                 // 중복 스킵
                    boolean isExisting = tags.stream()
                            .anyMatch(t -> t.getTagName().equalsIgnoreCase(tagName));

                    suggestedTags.add(LinkAnalysisResult.SuggestedTag.builder()
                            .tagName(tagName)
                            .isExisting(isExisting)
                            .build());
                }
            }

            // 추천 폴더 → 기존 폴더와 매칭 (대소문자 무시)
            String suggestedFolderName = root.path("suggestedFolder").asText("").trim();  // 앞뒤 공백 제거
            LinkAnalysisResult.SuggestedFolder suggestedFolder = null;
            if (!suggestedFolderName.isBlank()) {
                MemberFolder matchedFolder = folders.stream()
                        .filter(f -> f.getFolderName().equalsIgnoreCase(suggestedFolderName))
                        .findFirst()
                        .orElse(null);

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
