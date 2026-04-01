package com.web.SearchWeb.auth.controller;

import com.web.SearchWeb.auth.controller.dto.AuthResponses;
import com.web.SearchWeb.auth.service.AuthService;
import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.config.jwt.JwtProperties;
import com.web.SearchWeb.config.security.CurrentMemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

/**
 * 인증 관련 API를 처리하는 컨트롤러.
 * - Refresh Token을 이용한 토큰 재발급
 * - 로그아웃 처리
 * - 현재 로그인된 사용자 정보 조회 등의 기능을 제공
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    /**
     * Refresh Token으로 새 Access Token 발급
     * - Cookie에서 refreshToken 읽기
     * - 새 토큰 쌍 발급 (rotation)
     * - 새 refreshToken을 쿠키로, accessToken을 body로 반환
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponses.AccessToken>> refresh(
            HttpServletRequest request,
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        Cookie[] cookies = request.getCookies();
        int cookieCount = cookies == null ? 0 : cookies.length;
        log.debug("[RefreshController] request cookies count: {}", cookieCount);

        if (refreshToken == null || refreshToken.isBlank()) {
            log.warn("[RefreshController] refreshToken cookie missing or blank");
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        log.debug("[RefreshController] refreshToken cookie received");

        AuthResponses.TokenPair tokenPair = authService.refresh(refreshToken);

        ResponseCookie cookie = createRefreshTokenCookie(
                tokenPair.getRefreshToken(),
                Duration.ofMillis(jwtProperties.refreshTokenExpiry()).getSeconds());

        AuthResponses.AccessToken response = AuthResponses.AccessToken.builder()
                .accessToken(tokenPair.getAccessToken())
                .build();

        return ResponseEntity.ok()
                // 보안 조치: Access Token이 포함된 응답이 브라우저나 중간 프록시(CDN 등)에 저장되지 않도록 설정
                .header("Cache-Control", "no-store, no-cache, must-revalidate")
                .header("Pragma", "no-cache") // HTTP 1.0 하위 호환성 (구형 브라우저 대응)
                .header("Set-Cookie", cookie.toString())
                .body(ApiResponse.success(response));
    }

    
    /**
     * 로그아웃
     * - Cookie에서 refreshToken 읽기
     * - DB에서 삭제
     * - 쿠키 삭제
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        ResponseCookie clearCookie = createRefreshTokenCookie("", 0);

        return ResponseEntity.ok()
                .header("Set-Cookie", clearCookie.toString())
                .body(ApiResponse.success(null));
    }


    /**
     * 현재 인증된 사용자 정보 조회
     * - Bearer Access Token에서 memberId 추출
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/member")
    public ResponseEntity<ApiResponse<AuthResponses.MemberInfo>> getAuthenticatedMemberInfo(@CurrentMemberId Long memberId) {
        AuthResponses.MemberInfo memberInfo = authService.getAuthenticatedMemberInfo(memberId);
        return ResponseEntity.ok(ApiResponse.success(memberInfo));
    }


    /**
     * Refresh Token 쿠키 생성
     */
    private ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)                // 자바스크립트 접근 방지 (XSS 보호)
                .secure(cookieSecure)          // 프로필별 설정 (local=false, prod=true)
                .sameSite("Lax")               // CSRF 보호
                .path(jwtProperties.refreshTokenPath()) // 쿠키 사용 범위 제한
                .maxAge(maxAgeSeconds)         // 쿠키 만료 시간
                .build();
    }
}
