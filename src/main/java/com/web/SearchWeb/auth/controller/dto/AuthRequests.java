package com.web.SearchWeb.auth.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AuthRequests {

    @Getter
    @NoArgsConstructor
    public static class ExtensionCodeExchange {
        @NotBlank
        private String code;
    }

    @Getter
    @NoArgsConstructor
    public static class ExtensionRefresh {
        @NotBlank
        private String refreshToken;
    }
}
