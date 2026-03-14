package com.web.SearchWeb.bookmark.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;

@Getter
public class BookmarkException extends BusinessException {

    private BookmarkException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static BookmarkException of(ErrorCode errorCode) {
        return new BookmarkException(errorCode);
    }
}
