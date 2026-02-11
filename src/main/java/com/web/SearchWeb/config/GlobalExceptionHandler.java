package com.web.SearchWeb.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // FolderException, MemberException 등 모든 비즈니스 예외가 이 메서드 하나로 들어옵니다.
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        ErrorCode errorCode = e.getErrorCode();

        // 로그에는 어떤 도메인에서 예외가 났는지 클래스명과 메시지를 찍어줍니다.
        log.warn("BusinessException [{}]: {}", e.getClass().getSimpleName(), errorCode.getMessage());

        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.fail(errorCode));
    }

    // 그 외 예상치 못한 서버 에러(500) 처리
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Internal Server Error", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(CommonErrorCode.INTERNAL_SERVER_ERROR));
    }
}
