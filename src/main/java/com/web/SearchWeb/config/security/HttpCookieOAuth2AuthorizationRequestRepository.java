package com.web.SearchWeb.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * OAuth2 인증 요청 정보를 세션 대신 쿠키에 저장하는 클래스
 * - STATELESS 정책 유지를 위해 서버 메모리(세션) 사용 배제
 * - 로그인 요청 시 생성되는 정보(state, redirect_uri 등)를 브라우저 쿠키에 보관
 */
@Component
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request"; // 인증 요청 정보 보관 쿠키명
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";                  // 로그인 후 이동할 리다이렉트 경로 쿠키명
    private static final int COOKIE_EXPIRE_SECONDS = 180;                                        // 쿠키 유효 기간 (3분, 인증 과정용)

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    /**
     * [인증 요청 정보 저장]
     * - 시점: 사용자가 "소셜 로그인" 버튼 클릭 직후 (구글/네이버 등으로 리다이렉트 되기 전)
     * - 역할: 보안 검증을 위한 state 값 등을 쿠키에 저장
     */
    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            CookieUtils.deleteCookie(request, response, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
            CookieUtils.deleteCookie(request, response, REDIRECT_URI_PARAM_COOKIE_NAME);
            return;
        }

        // 인증 요청 정보 쿠키에 저장
        CookieUtils.addCookie(response, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, CookieUtils.serialize(authorizationRequest), COOKIE_EXPIRE_SECONDS, cookieSecure);
        
        // 로그인 성공 후 최종 이동할 경로(redirect_uri)가 파라미터로 넘어왔다면 별도 쿠키에 보관
        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (StringUtils.hasText(redirectUriAfterLogin)) {
            CookieUtils.addCookie(response, REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin, COOKIE_EXPIRE_SECONDS, cookieSecure);
        }
    }

    /**
     * [쿠키에서 정보 읽기]
     * - 시점: 사용자가 소셜 인증을 마치고 우리 서버(콜백 주소)로 돌아왔을 때
     * - 역할: 쿠키에 저장했던 정보를 읽어와 현재 응답의 state 값과 비교 검증
     */
    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return CookieUtils.getCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(cookie -> CookieUtils.deserialize(cookie, OAuth2AuthorizationRequest.class))
                .orElse(null);
    }

    /**
     * [인증 요청 정보 삭제 준비]
     * - 시점: 시큐리티 내부에서 인증 처리가 완료되기 직전
     * - 역할: 저장소에서 정보를 꺼내오는 용도로 사용됨
     */
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        return this.loadAuthorizationRequest(request);
    }

    /**
     * [임시 쿠키 최종 삭제]
     * - 시점: 성공 핸들러(SuccessHandler) 또는 실패 핸들러(FailureHandler) 가 실행될 때
     * - 역할: 인증이 완전히 끝났으므로 브라우저에 남은 임시 쿠키들을 삭제
     */
    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        CookieUtils.deleteCookie(request, response, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
        CookieUtils.deleteCookie(request, response, REDIRECT_URI_PARAM_COOKIE_NAME);
    }
}
