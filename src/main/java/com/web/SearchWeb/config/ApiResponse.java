package com.web.SearchWeb.config;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final ErrorResponse error; // 여기서 ErrorResponse는 JSON 포장지 역할

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    // Enum을 인자로 받음으로써 타입 안정성 확보
    public static ApiResponse<Void> fail(ErrorCode errorCode) {
        return new ApiResponse<>(
            false,
            null,
            new ErrorResponse(errorCode) // Enum을 생성자로 넘겨서 변환
        );
    }

    @Getter
    public static class ErrorResponse {
        private final String code;
        private final String message;

        // Enum에서 필요한 정보만 추출하여 세팅
        private ErrorResponse(ErrorCode errorCode) {
            this.code = errorCode.getCode();
            this.message = errorCode.getMessage();
        }
    }
}
