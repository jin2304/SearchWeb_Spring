package com.web.SearchWeb.auth.error;

import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 인증 관련 에러 코드를 정의하는 ENUM입니다.
 */
@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {
    AUTH_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증이 필요합니다."),
    AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "A002", "토큰이 만료되었습니다."),
    AUTH_INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A003", "유효하지 않은 토큰입니다."),
    AUTH_REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "A004", "Refresh Token이 없습니다."),
    AUTH_ACCESS_DENIED(HttpStatus.FORBIDDEN, "A005", "접근 권한이 없습니다."),
    AUTH_INVALID_REDIRECT_URI(HttpStatus.BAD_REQUEST, "A006", "유효하지 않은 리다이렉트 주소입니다."),
    AUTH_UNSUPPORTED_PROVIDER(HttpStatus.BAD_REQUEST, "A007", "지원하지 않는 소셜 로그인 제공자입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
