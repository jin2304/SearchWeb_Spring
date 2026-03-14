package com.web.SearchWeb.tag.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;

@Getter
public class TagException extends BusinessException {

    public TagException(ErrorCode errorCode) {
        super(errorCode);
    }
    public static class NotFound extends TagException {
        public NotFound() {
            super(TagErrorCode.Tag_NOT_FOUND);
        }
    }

}
