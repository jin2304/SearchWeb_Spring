package com.web.SearchWeb.tag.error;

import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum TagErrorCode implements ErrorCode {
    Tag_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "태그를 찾을 수 없습니다.");
    private final HttpStatus status;
    private final String code;
    private final String message;
}
