package com.web.SearchWeb.linkanalysis.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;

import lombok.Getter;

@Getter
public class LinkAnalysisException extends BusinessException {

    private LinkAnalysisException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static LinkAnalysisException of(LinkAnalysisErrorCode errorCode) {
        return new LinkAnalysisException(errorCode);
    }
}
