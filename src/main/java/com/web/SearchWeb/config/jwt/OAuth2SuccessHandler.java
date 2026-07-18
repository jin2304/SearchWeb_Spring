package com.web.SearchWeb.config.jwt;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.auth.service.AuthService;
import com.web.SearchWeb.auth.service.ExtensionAuthCodeService;
import com.web.SearchWeb.config.security.CookieUtils;
import com.web.SearchWeb.config.security.HttpCookieOAuth2AuthorizationRequestRepository;
import com.web.SearchWeb.member.dto.CustomOAuth2Member;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Arrays;

/**
 * OAuth2 로그인 성공 시 호출되는 핸들러.
 * 인증 성공 후 JWT 리프레시 토큰을 발급하고 쿠키에 저장한 뒤, 프론트엔드로 리다이렉트합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final ExtensionAuthCodeService extensionAuthCodeService;
    private final JwtProperties jwtProperties;
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String oauth2RedirectUri;

    @Value("${app.extension.allowed-redirect-uris:}")
    private String extensionAllowedRedirectUris;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    /**
     * OAuth2 인증 성공 시 실행되는 메서드
     * 1. 회원 ID 추출
     * 2. Refresh Token 생성 및 해시화하여 DB 저장
     * 3. Refresh Token을 쿠키에 설정
     * 4. 프론트엔드 콜백 URL로 리다이렉트
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String targetUrl;
        try {
            // 1. 리다이렉트 URI 결정 및 검증 (실패 시 예외 발생)
            targetUrl = determineTargetUrl(request, response, authentication);
        } catch (AuthException e) {
            // [개선] 검증 실패 시 서버 에러(500) 대신 안전한 실패 경로로 리다이렉트 (Controlled Auth Failure Redirect)
            log.warn("OAuth2 Success Handler - 허용되지 않은 리다이렉트 URI: {}", e.getMessage());
            targetUrl = UriComponentsBuilder.fromUriString(oauth2RedirectUri)
                    .queryParam("error", "invalid_redirect_uri")
                    .build().toUriString();
            
            // 토큰 발급 없이 에러 URL로 즉시 리다이렉트
            response.sendRedirect(targetUrl);
            return;
        } finally {
            // 2. 성공/실패 여부와 상관없이 무조건 임시 쿠키 삭제 (보안 강화)
            authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        }

        // 3. 검증 통과 시에만 토큰 발급 (실패 시 이 아래는 실행되지 않음)
        CustomOAuth2Member oAuth2Member = (CustomOAuth2Member) authentication.getPrincipal();
        Long memberId = oAuth2Member.getMemberId();
        String authEvent = oAuth2Member.isNewMember() ? "sign_up" : "login";
        String method = oAuth2Member.getProvider();
        targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .replaceQueryParam("auth_event", authEvent)
                .replaceQueryParam("method", method)
                .build()
                .toUriString();
        if (isAuthorizedExtensionRedirectUri(targetUrl)) {
            String code = extensionAuthCodeService.issueCode(memberId);
            targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                    .replaceQueryParam("code", code)
                    .build()
                    .toUriString();
            response.sendRedirect(targetUrl);
            return;
        }

        String refreshToken = authService.issueRefreshToken(memberId);

        // 보안: 원본 토큰 노출 방지를 위해 마스킹 처리된 로그만 남김
        if (log.isDebugEnabled()) {
            log.debug("OAuth2 인증 성공: memberId={}, Refresh Token(일부)={}...", 
                      memberId, refreshToken.substring(0, 10));
        }

        // 4. Refresh Token Cookie 설정
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(jwtProperties.refreshTokenPath())
                .maxAge(Duration.ofMillis(jwtProperties.refreshTokenExpiry()))
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        // 5. 프론트엔드 콜백 URL로 redirect
        response.sendRedirect(targetUrl);
    }

    /**
     * 쿠키에 저장된 redirect_uri를 읽어오고 로직에 따라 정규화 및 검증을 수행
     * 상대 경로(/...)가 들어오면 설정된 프론트엔드 오리진(oauth2RedirectUri)을 기준으로 절대 URL로 변환
     */
    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // 1. 쿠키에서 전송된 리다이렉트 URI를 가져오거나, 없으면 기본 설정된 URI 사용
        String targetUrl = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse(oauth2RedirectUri);

        // 2. 상대 경로(/...)인 경우, 프론트엔드 기본 리다이렉트 URI(origin)를 기준으로 절대 URL로 정규화
        // 백엔드 도메인에서 실행되더라도 프론트엔드 origin으로 정확히 리다이렉트되도록 합니다.
        if (targetUrl.startsWith("/") && !targetUrl.startsWith("//")) {
            targetUrl = URI.create(oauth2RedirectUri).resolve(targetUrl).toString();
        }

        // 3. 최종 검증 (Open Redirect 방지 및 허용된 도메인 체크)
        if (!isAuthorizedRedirectUri(targetUrl)) {
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_REDIRECT_URI);
        }

        return targetUrl;
    }

    /**
     * 리다이렉트 URI가 허용된 도메인인지 확인합니다. (Open Redirect 방지)
     */
    private boolean isAuthorizedRedirectUri(String uri) {
        if (!StringUtils.hasText(uri)) {
            return false;
        }

        if (isAuthorizedExtensionRedirectUri(uri)) {
            return true;
        }
        // 모든 경로는 determineTargetUrl에서 절대 URL로 정규화되었으므로, 호스트와 포트를 엄격하게 비교합니다.
        try {
            URI clientRedirectUri = URI.create(oauth2RedirectUri);
            URI targetUri = URI.create(uri);

            return clientRedirectUri.getScheme().equalsIgnoreCase(targetUri.getScheme()) &&
                    clientRedirectUri.getHost().equalsIgnoreCase(targetUri.getHost()) &&
                    clientRedirectUri.getPort() == targetUri.getPort();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isAuthorizedExtensionRedirectUri(String uri) {
        if (!StringUtils.hasText(uri) || !StringUtils.hasText(extensionAllowedRedirectUris)) {
            return false;
        }

        URI targetUri;
        try {
            targetUri = URI.create(uri);
        } catch (Exception e) {
            return false;
        }

        return Arrays.stream(extensionAllowedRedirectUris.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(this::safeCreateUri)
                .anyMatch(allowedUri -> allowedUri != null && isSameRedirectUri(allowedUri, targetUri));
    }

    private URI safeCreateUri(String uri) {
        try {
            return URI.create(uri);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isSameRedirectUri(URI allowedUri, URI targetUri) {
        return equalsIgnoreCase(allowedUri.getScheme(), targetUri.getScheme())
                && equalsIgnoreCase(allowedUri.getHost(), targetUri.getHost())
                && allowedUri.getPort() == targetUri.getPort()
                && normalizePath(allowedUri).equals(normalizePath(targetUri));
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private String normalizePath(URI uri) {
        String path = uri.getPath();
        return path == null || path.isBlank() ? "/" : path;
    }
}
