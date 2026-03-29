package com.web.SearchWeb.auth.domain;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

/**
 * 리프레시 토큰(Refresh Token) 도메인 클래스
 * - 사용자 인증 유지를 위한 리프레시 토큰의 정보를 관리.
 */
@Getter
@Builder
public class RefreshToken {
    private Long id;            // 고유 식별자 (PK)
    private Long memberId;      // 이 토큰을 소유한 회원의 ID
    private String tokenHash;   // 보안을 위해 해싱된 토큰 값
    private Instant expiresAt;  // 토큰의 만료 일시
    private Instant createdAt;  // 토큰이 최초로 생성된 일시
    private Instant rotatedAt;  // 토큰이 재발급(Rotation)된 일시
}
