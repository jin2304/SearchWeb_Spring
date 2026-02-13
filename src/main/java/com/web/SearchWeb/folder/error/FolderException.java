package com.web.SearchWeb.folder.error;

import com.web.SearchWeb.config.BusinessException;
import com.web.SearchWeb.config.ErrorCode;
import lombok.Getter;

@Getter
public class FolderException extends BusinessException {

    private FolderException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static class NotFound extends FolderException {
        public NotFound() {
            super(FolderErrorCode.FOLDER_NOT_FOUND);
        }
    }
}
