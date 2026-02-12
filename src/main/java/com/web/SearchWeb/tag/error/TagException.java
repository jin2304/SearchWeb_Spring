package com.web.SearchWeb.tag.error;

import com.web.SearchWeb.config.BusinessException;
import com.web.SearchWeb.config.ErrorCode;
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
