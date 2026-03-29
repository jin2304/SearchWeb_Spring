package com.web.SearchWeb.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.config.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 사용자가 인증 없이 보호된 리소스에 접근하려 할 때(401 Unauthorized) 호출되는 엔트리 포인트
 *  -JWT 토큰이 없거나 유효하지 않은 경우의 처리를 담당
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 인증 예외가 발생했을 때 실행되는 메서드
     *   -클라이언트에게 401 상태 코드와 함께 JSON 형태의 에러 메시지를 반환
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        // Filter에서 설정한 예외 코드가 있는지 확인
        ErrorCode errorCode = (ErrorCode) request.getAttribute("exception");

        // 예외 코드가 없으면 기본 인증 실패 코드 사용 (토큰이 아예 없는 경우 등)
        if (errorCode == null) {
            errorCode = AuthErrorCode.AUTH_UNAUTHORIZED;
        }

        response.setStatus(errorCode.getStatus().value());         // 에러 코드에 정의된 상태 코드 설정
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> errorResponse = ApiResponse.fail(errorCode);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
