package com.web.SearchWeb.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 리프레시 토큰(Refresh Token) 도메인 클래스
 * - 사용자 인증 유지를 위한 리프레시 토큰의 정보를 관리.
 * - 세션 ID와 버전 번호를 이용해 토큰 로테이션(Rotation) 계보를 추적.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor 
public class RefreshToken {
    private Long id;                  // 고유 식별자 (PK)
    private Long memberId;            // 이 토큰을 소유한 회원의 ID
    private String sessionId;         // 같은 리프레시 토큰 계열을 식별하는 세션 ID (중복 로그인 구분)
    private Integer version;          // 동일 세션 내에서 토큰이 회전된 순서 (1부터 시작)
    private String tokenHash;         // 보안을 위해 해싱된 토큰 값 (DB 저장용)
    private Instant expiresAt;        // 토큰의 전체 만료 일시
    private Instant createdAt;        // 토큰이 최초로 생성된 일시
    private Instant rotatedAt;        // 토큰이 재발급(Rotation)되어 상태가 바뀐 일시
    private Integer replacedByVersion;// 현재 토큰을 대체하여 발급된 후속 토큰의 버전 번호
    private Instant graceUntil;       // 중복 요청 구제를 위한 유예 기간(Grace Period) 종료 시각
}
