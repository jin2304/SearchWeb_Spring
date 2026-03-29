package com.web.SearchWeb.auth.controller.dto;

import lombok.Builder;
import lombok.Getter;

public class AuthResponses {

    @Getter
    @Builder
    public static class TokenPair {
        private final String accessToken;
        private final String refreshToken;
    }

    @Getter
    @Builder
    public static class AccessToken {
        private final String accessToken;
    }

    @Getter
    @Builder
    public static class MemberInfo {
        private final Long memberId;
        private final String name;
        private final String email;
        private final String role;
    }
}
