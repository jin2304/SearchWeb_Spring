package com.web.SearchWeb.auth.controller;

import com.web.SearchWeb.auth.controller.dto.AuthRequests;
import com.web.SearchWeb.auth.controller.dto.AuthResponses;
import com.web.SearchWeb.auth.service.AuthService;
import com.web.SearchWeb.auth.service.ExtensionAuthCodeService;
import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.config.security.CurrentMemberId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/extension")
@RequiredArgsConstructor
public class ExtensionAuthController {

    private final AuthService authService;
    private final ExtensionAuthCodeService extensionAuthCodeService;

    @PostMapping("/exchange")
    public ResponseEntity<ApiResponse<AuthResponses.TokenPair>> exchange(
            @Valid @RequestBody AuthRequests.ExtensionCodeExchange request) {

        Long memberId = extensionAuthCodeService.consumeCode(request.getCode());
        AuthResponses.TokenPair tokenPair = authService.issueTokenPairWithoutRevoking(memberId);
        return ResponseEntity.ok(ApiResponse.success(tokenPair));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponses.TokenPair>> refresh(
            @Valid @RequestBody AuthRequests.ExtensionRefresh request) {

        AuthResponses.TokenPair tokenPair = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokenPair));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody AuthRequests.ExtensionRefresh request) {

        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/member")
    public ResponseEntity<ApiResponse<AuthResponses.MemberInfo>> member(@CurrentMemberId Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(authService.getAuthenticatedMemberInfo(memberId)));
    }
}
