package com.web.SearchWeb.auth.dao;

import com.web.SearchWeb.auth.domain.RefreshToken;

// 리프레시 토큰 데이터 접근 객체(DAO) 인터페이스
public interface RefreshTokenDao {
    // 새로운 리프레시 토큰 저장
    void insertRefreshToken(RefreshToken refreshToken);

    // 토큰 해시값으로 리프레시 토큰 조회
    RefreshToken findByTokenHash(String tokenHash);

    // 토큰 해시값으로 리프레시 토큰 조회 (비관적 락 적용)
    RefreshToken findByTokenHashForUpdate(String tokenHash);

    // 세션 ID + 버전으로 후속 토큰 조회
    RefreshToken findBySessionIdAndVersion(String sessionId, int version);

    // 특정 토큰 해시값 삭제
    void deleteByTokenHash(String tokenHash);

    // 특정 회원 ID의 모든 토큰 삭제 (로그아웃 등)
    void deleteByMemberId(Long memberId);

    // 만료된 토큰 일괄 삭제
    int deleteExpired();

    // 토큰 로테이션 시 후속 버전 / grace 정보 저장
    int markRotated(RefreshToken refreshToken);
}
