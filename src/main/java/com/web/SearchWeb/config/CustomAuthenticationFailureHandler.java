package com.web.SearchWeb.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // 기본 오류 메시지 설정
        String errorMessage = "아이디 또는 비밀번호가 잘못되었습니다.";

        //세션에 에러 메시지 저장
        request.getSession().setAttribute("error", errorMessage);

        // 로그인 페이지로 리다이렉트하며, 쿼리 파라미터로 오류를 표시
        response.sendRedirect("/login?error=true");
    }
}
