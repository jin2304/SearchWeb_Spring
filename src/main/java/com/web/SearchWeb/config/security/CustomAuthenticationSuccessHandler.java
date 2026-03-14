package com.web.SearchWeb.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        // 리다이렉트 URL 설정
        String redirectUrl = request.getParameter("redirect");

        if (redirectUrl != null && !redirectUrl.isEmpty()) {
            // 리디렉트 파라미터가 있을 경우 그 URL로 리다이렉트
            response.sendRedirect(redirectUrl);
        } else {
            // 없을 경우 기본 페이지로 이동
            response.sendRedirect("/mainList");
        }
    }
}