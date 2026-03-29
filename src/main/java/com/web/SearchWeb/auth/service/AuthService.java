package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.controller.dto.AuthResponses;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스 인터페이스.
 * - JWT 토큰 발급, 갱신, 로그아웃 및 사용자 정보 조회 처리
 */
public interface AuthService {

    // 토큰 발급 (Access + Refresh)
    AuthResponses.TokenPair issueTokens(Long memberId, String role);

    // OAuth2 로그인 성공 후 Refresh Token만 발급 (Access Token은 이후 /refresh로 발급)
    String issueRefreshToken(Long memberId);

    // 토큰 갱신
    AuthResponses.TokenPair refresh(String refreshToken);

    // 로그아웃
    void logout(String refreshToken);

    // 인증된 회원 정보 조회
    AuthResponses.MemberInfo getAuthenticatedMemberInfo(Long memberId);
}
