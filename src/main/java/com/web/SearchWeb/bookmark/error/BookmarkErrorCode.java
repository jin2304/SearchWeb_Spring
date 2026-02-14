package com.web.SearchWeb.bookmark.error;

import com.web.SearchWeb.config.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookmarkErrorCode implements ErrorCode {
    DUPLICATE_BOOKMARK(HttpStatus.CONFLICT, "B001", "이미 존재하는 북마크입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
