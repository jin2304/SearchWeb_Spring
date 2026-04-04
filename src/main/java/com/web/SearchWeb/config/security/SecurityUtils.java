package com.web.SearchWeb.config.security;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.config.jwt.JwtMemberPrincipal;
import com.web.SearchWeb.member.dto.CustomOAuth2Member;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * 보안 관련 공통 유틸리티 클래스
 * - 인증 객체에서 사용자 정보 추출 및 데이터 보안용 해싱 기능 제공
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Authentication 객체에서 현재 로그인된 사용자의 memberId 추출
     * 
     * @param authentication 인증 객체
     * @return 사용자의 고유 ID (memberId)
     * @throws AuthException 미인증 또는 유효하지 않은 사용자일 경우 발생
     */
    public static Long extractMemberId(Authentication authentication) {
        // 인증 객체 부재 또는 미인증 시 접근 거부
        if (authentication == null || !authentication.isAuthenticated()) {
            throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();

        // 익명 사용자(미로그인 상태) 접근 거부
        if ("anonymousUser".equals(principal)) {
            throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
        }

        // 일반 JWT 로그인 Principal 처리
        if (principal instanceof JwtMemberPrincipal jwt) {
            return jwt.memberId();
        }

        // OAuth2 로그인 Principal 처리
        if (principal instanceof CustomOAuth2Member oauth2Member) {
            return oauth2Member.getMemberId();
        }

        // 알 수 없는 Principal 타입일 경우
        throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
    }

    /**
     * SHA-256 알고리즘을 사용한 문자열 해싱
     * 리프레시 토큰 원본 대신 해싱값을 DB에 저장하여 보안 강화 목적으로 사용
     * 
     * @param input 해싱할 원본 문자열
     * @return SHA-256 해싱된 16진수 문자열
     */
    public static String hashToken(String input) {
        if (input == null || input.isBlank()) {
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_TOKEN);
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            // 바이트 배열을 16진수 문자열로 변환
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 알고리즘 미지원 환경일 경우 RuntimeException 래핑
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
