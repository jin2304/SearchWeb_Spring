package com.web.SearchWeb.config.jwt;

import com.web.SearchWeb.config.security.HttpCookieOAuth2AuthorizationRequestRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 인증 실패 처리를 담당하는 핸들러 클래스.
 * 예외 발생 시 사용자를 프론트엔드 로그인 페이지로 리다이렉트하고 에러 메시지를 전달함.
 */
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    // 인증 요청 시 생성된 쿠키(State 등) 관리 및 삭제를 위한 저장소
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    // 프론트엔드 리다이렉트 기본 URI (application.yml 설정 값)
    @Value("${app.oauth2.redirect-uri}")
    private String oauth2RedirectUri;

    /**
     * OAuth2 인증 실패 시 호출되는 메서드.
     * 
     * @param request       HTTP 요청
     * @param response      HTTP 응답
     * @param exception     발생한 인증 예외
     * @throws IOException  입출력 예외
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        // 예외 객체에서 에러 메시지 추출
        String errorMessage = exception.getLocalizedMessage();
        
        // 특정 에러(쿠키 만료/실종) 발생 시 사용자 친화적인 메시지로 변환
        // 주로 소셜 로그인 창을 장시간 방치한 뒤 시도할 때 발생함
        if (errorMessage.contains("authorization_request_not_found")) {
            errorMessage = "인증 요청 정보가 만료되었습니다. 다시 로그인해주세요.";
        }

        // 실패 후 이동할 대상 URL 생성
        // 프론트엔드 /login 페이지로 에러 정보와 함께 리다이렉트
        String targetUrl = UriComponentsBuilder.fromUriString(oauth2RedirectUri)
                .replacePath("/login")
                .queryParam("error", true)
                .queryParam("message", errorMessage)
                .encode()
                .build().toUriString();

        // 인증 과정에서 사용된 임시 쿠키(State, Redirect URI 등) 삭제
        authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        // 설정된 타겟 URL로 리다이렉트 수행
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}