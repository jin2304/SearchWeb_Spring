package com.web.SearchWeb.folder.error;

import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum FolderErrorCode implements ErrorCode {
    FOLDER_NOT_FOUND(HttpStatus.NOT_FOUND, "F001", "폴더를 찾을 수 없습니다."),
    DUPLICATE_FOLDER_NAME(HttpStatus.BAD_REQUEST, "F002", "이미 존재하는 폴더명입니다."),
    FOLDER_FORBIDDEN(HttpStatus.FORBIDDEN,"Foo3" ,"접근이 제한된 폴더입니다." ),
    INVALID_FOLDER_NAME(HttpStatus.BAD_REQUEST,"F004","폴더명으로 적절하지 않습니다" ),
    INVALID_FOLDER_MOVE(HttpStatus.BAD_REQUEST, "F005", "유효하지 않은 폴더 이동입니다."),
    FOLDER_NOT_EMPTY(HttpStatus.BAD_REQUEST, "F006", "하위 폴더 또는 북마크가 남아 있어 삭제할 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
