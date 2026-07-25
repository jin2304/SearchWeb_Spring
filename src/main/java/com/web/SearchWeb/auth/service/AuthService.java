package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.controller.dto.AuthResponses;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스 인터페이스.
 * - JWT 토큰 발급, 갱신, 로그아웃 및 사용자 정보 조회 처리
 */
public interface AuthService {

    // OAuth2 로그인 성공 후 리프레시 토큰만 최초 발급
    String issueRefreshToken(Long memberId);

    // 확장 로그인: 기존 웹 세션을 폐기하지 않고 토큰 쌍을 발급한다.
    AuthResponses.TokenPair issueTokenPairWithoutRevoking(Long memberId);

    // 토큰 갱신
    AuthResponses.TokenPair refresh(String refreshToken);

    // 로그아웃
    void logout(String refreshToken);

    // 인증된 회원 정보 조회
    AuthResponses.MemberInfo getAuthenticatedMemberInfo(Long memberId);
}
