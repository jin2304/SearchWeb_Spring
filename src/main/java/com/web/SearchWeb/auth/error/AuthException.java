package com.web.SearchWeb.auth.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;

/**
 * 인증 도메인에서 발생하는 예외를 처리하는 클래스입니다.
 */
@Getter
public class AuthException extends BusinessException {

    private AuthException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static AuthException of(ErrorCode errorCode) {
        return new AuthException(errorCode);
    }
}
