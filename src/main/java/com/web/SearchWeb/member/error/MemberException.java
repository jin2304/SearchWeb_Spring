package com.web.SearchWeb.member.error;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;

@Getter
public class MemberException extends BusinessException {

    private MemberException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static MemberException of(ErrorCode errorCode) {
        return new MemberException(errorCode);
    }
}
