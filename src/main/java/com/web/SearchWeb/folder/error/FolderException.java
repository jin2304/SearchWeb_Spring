package com.web.SearchWeb.folder.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;

@Getter
public class FolderException extends BusinessException {

    public FolderException(ErrorCode errorCode) {
        super(errorCode);
    }
}
