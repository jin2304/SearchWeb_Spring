package com.web.SearchWeb.folder.error;

import com.web.SearchWeb.config.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum FolderErrorCode implements ErrorCode {
    FOLDER_NOT_FOUND(HttpStatus.NOT_FOUND, "F001", "폴더를 찾을 수 없습니다."),
    DUPLICATE_FOLDER_NAME(HttpStatus.BAD_REQUEST, "F002", "이미 존재하는 폴더명입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
