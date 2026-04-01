package com.web.SearchWeb.config.jwt;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.auth.service.AuthService;
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

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Optional;

/**
 * OAuth2 로그인 성공 시 호출되는 핸들러.
 * 인증 성공 후 JWT 리프레시 토큰을 발급하고 쿠키에 저장한 뒤, 프론트엔드로 리다이렉트합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtProperties jwtProperties;
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String oauth2RedirectUri;

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
        } finally {
            // 2. 성공/실패 여부와 상관없이 무조건 임시 쿠키 삭제 (보안 강화)
            authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        }

        // 3. 검증 통과 시에만 토큰 발급 (실패 시 이 아래는 실행되지 않음)
        CustomOAuth2Member oAuth2Member = (CustomOAuth2Member) authentication.getPrincipal();
        Long memberId = oAuth2Member.getMemberId();
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
     * 쿠키에 저장된 redirect_uri를 읽어오고 검증합니다.
     */
    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // 1. 쿠키에서 redirect_uri를 찾음
        Optional<String> redirectUri = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue);

        // 2. 만약 쿠키(redirect_uri)가 존재한다면 검증 후 반환
        if (redirectUri.isPresent()) {
            String url = redirectUri.get();
            if (isAuthorizedRedirectUri(url)) {
                return url;
            }
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_REDIRECT_URI);
        }

        // 3. 쿠키가 아예 존재하지 않는 경우 기본 주소(프론트엔드 콜백)로 이동
        return oauth2RedirectUri;
    }

    /**
     * 리다이렉트 URI가 허용된 도메인인지 확인합니다. (Open Redirect 방지)
     */
    private boolean isAuthorizedRedirectUri(String uri) {
        if (!StringUtils.hasText(uri)) {
            return false;
        }

        // 상대 경로는 같은 도메인이므로 허용
        if (uri.startsWith("/") && !uri.startsWith("//")) {
            return true;
        }

        // 절대 경로인 경우 설정된 프론트엔드 URI와 호스트/포트가 같은지 확인
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
}
