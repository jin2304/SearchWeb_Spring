package com.web.SearchWeb.auth.error;

import com.web.SearchWeb.config.exception.BusinessException;
import lombok.Getter;

/**
 * 인증 도메인에서 발생하는 예외를 처리하는 클래스입니다.
 * - AuthErrorCode 타입만 허용하여 도메인 예외 계층의 타입 안정성을 보장합니다.
 */
@Getter
public class AuthException extends BusinessException {

    private AuthException(AuthErrorCode errorCode) {
        super(errorCode);
    }

    public static AuthException of(AuthErrorCode errorCode) {
        return new AuthException(errorCode);
    }
}
