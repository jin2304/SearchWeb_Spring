package com.web.SearchWeb.folder.error;

import com.web.SearchWeb.config.BusinessException;
import com.web.SearchWeb.config.ErrorCode;
import lombok.Getter;

@Getter
public class FolderException extends BusinessException {

    public FolderException(ErrorCode errorCode) {
        super(errorCode);
    }
}
