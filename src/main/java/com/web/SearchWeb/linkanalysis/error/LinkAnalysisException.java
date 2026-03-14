package com.web.SearchWeb.linkanalysis.error;

import com.web.SearchWeb.config.BusinessException;
import lombok.Getter;

@Getter
public class LinkAnalysisException extends BusinessException {

    private LinkAnalysisException(LinkAnalysisErrorCode errorCode) {
        super(errorCode);
    }

    public static LinkAnalysisException of(LinkAnalysisErrorCode errorCode) {
        return new LinkAnalysisException(errorCode);
    }
}
