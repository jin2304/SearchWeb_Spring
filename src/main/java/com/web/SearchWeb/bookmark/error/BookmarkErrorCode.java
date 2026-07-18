package com.web.SearchWeb.bookmark.error;

import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookmarkErrorCode implements ErrorCode {
    DUPLICATE_BOOKMARK(HttpStatus.CONFLICT, "B001", "이미 존재하는 북마크입니다."),
    BOOKMARK_NOT_FOUND(HttpStatus.NOT_FOUND, "B002", "북마크를 찾을 수 없습니다."),
    INVALID_FOLDER_TARGET(HttpStatus.BAD_REQUEST, "B004", "유효하지 않은 북마크 폴더 대상입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "B003", "해당 북마크에 대한 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
