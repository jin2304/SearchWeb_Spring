package com.web.SearchWeb.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.config.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 프로젝트 내 권한이 부족한 자원에 접근하려 할 때(403 Forbidden) 호출되는 핸들러.
 * ApiResponse 형식의 JSON 응답을 반환하여 프론트엔드 에러 처리를 지원합니다.
 */
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.fail(AuthErrorCode.AUTH_ACCESS_DENIED);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
