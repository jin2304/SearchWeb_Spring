package com.web.SearchWeb.config.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommonErrorCode implements ErrorCode{
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "C001", "로그인된 사용자만 접근 가능합니다."),
    // 500 Internal Server Error: 서버 내부 오류
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C006", "서버에 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

}
