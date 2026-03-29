package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.controller.dto.AuthResponses;
import com.web.SearchWeb.auth.dao.RefreshTokenDao;
import com.web.SearchWeb.auth.domain.RefreshToken;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.config.jwt.JwtUtils;
import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.config.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스.
 * - JWT 토큰 발급, 갱신, 로그아웃 및 사용자 정보 조회 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final JwtUtils jwtUtils;
    private final RefreshTokenDao refreshTokenDao;
    private final MemberDao memberDao;
    private final com.web.SearchWeb.config.jwt.JwtProperties jwtProperties;


    /**
     * 토큰 발급 (Access/Refresh Token 생성 및 저장)
     */
    @Override
    public AuthResponses.TokenPair issueTokens(Long memberId, String role) {
        String accessToken = jwtUtils.generateAccessToken(memberId, role);
        String refreshToken = createAndSaveRefreshToken(memberId);

        return AuthResponses.TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


    /**
     * OAuth2 로그인 성공 후 Refresh Token만 발급
     * - 기존 토큰 정리 후 신규 발급 (고아 토큰 방지)
     * - Access Token은 이후 프론트엔드의 /refresh 호출로 발급
     */
    @Override
    public String issueRefreshToken(Long memberId) {
        // 기존 토큰 정리 (같은 사용자가 반복 로그인 시 고아 토큰 누적 방지)
        refreshTokenDao.deleteByMemberId(memberId);
        String token = createAndSaveRefreshToken(memberId);
        return token;
    }


    /**
     * Refresh Token 생성 및 DB 저장 (공통 로직)
     */
    private String createAndSaveRefreshToken(Long memberId) {
        String refreshToken = jwtUtils.generateRefreshToken(memberId);
        String tokenHash = SecurityUtils.hashToken(refreshToken);
        refreshTokenDao.insertRefreshToken(RefreshToken.builder()
                .memberId(memberId)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusMillis(jwtProperties.refreshTokenExpiry()))
                .build());
        return refreshToken;
    }


    /**
     * 토큰 갱신 (Refresh Token 검증 및 재발급)
     */
    @Override
    public AuthResponses.TokenPair refresh(String refreshToken) {
        // 1. 토큰 유효성 검증 (실패 시 JwtException 발생)
        jwtUtils.validateToken(refreshToken);

        // 2. DB에서 해시로 조회 (비관적 락 적용하여 동시성 제어)
        String hashedToken = SecurityUtils.hashToken(refreshToken);
        RefreshToken storedRefreshToken = refreshTokenDao.findByTokenHashForUpdate(hashedToken);
        if (storedRefreshToken == null) {
            log.warn("[Refresh] DB에서 토큰을 찾을 수 없음 — 해시(앞8자리): {}", hashedToken.substring(0, 8));
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        // 3. 만료 확인
        if (storedRefreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenDao.deleteByTokenHash(hashedToken);
            throw AuthException.of(AuthErrorCode.AUTH_TOKEN_EXPIRED);
        }

        // 4. 기존 토큰 갱신/삭제 처리 (Grace Period 도입)
        if (storedRefreshToken.getRotatedAt() != null) {
            // 이미 한 번 갱신된 토큰인 경우, 유예 기간(예: 10초) 확인
            if (storedRefreshToken.getRotatedAt().plusSeconds(10).isAfter(Instant.now())) {
                // 유예 기간 내 재사용 시, 신규 토큰 발급 후 기존 rotated 토큰 즉시 삭제 (재사용 1회만 허용)
                refreshTokenDao.deleteByTokenHash(hashedToken);
                return issueTokens(storedRefreshToken.getMemberId(), getMemberRole(storedRefreshToken.getMemberId()));
            }
            // 유예 기간 지남 -> 이미 사용된 토큰으로 간주하여 에러 처리
            log.warn("[Refresh] Grace Period 초과 — rotatedAt: {}, now: {}", storedRefreshToken.getRotatedAt(), Instant.now());
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        // 처음 갱신 시도 시 rotated_at 설정 (즉시 삭제하지 않음)
        refreshTokenDao.updateRotatedAt(hashedToken);

        // 5. 새 토큰 쌍 발급
        Long memberId = storedRefreshToken.getMemberId();
        return issueTokens(memberId, getMemberRole(memberId));
    }

    /**
     * 회원의 권한(Role)을 조회하는 내부 메서드
     */
    private String getMemberRole(Long memberId) {
        Member member = memberDao.findByMemberId(memberId);
        if (member == null) {
            throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
        }
        return member.getRole();
    }


    /**
     * 로그아웃 (Refresh Token 삭제)
     */
    @Override
    public void logout(String refreshToken) {
        String hashedToken = SecurityUtils.hashToken(refreshToken);
        refreshTokenDao.deleteByTokenHash(hashedToken);
    }


    /**
     * 인증된 회원의 정보 조회
     */
    @Override
    public AuthResponses.MemberInfo getAuthenticatedMemberInfo(Long memberId) {
        Member member = memberDao.findByMemberId(memberId);
        if (member == null) {
            throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
        }
        return AuthResponses.MemberInfo.builder()
                .memberId(member.getMemberId())
                .name(member.getMemberName())
                .email(member.getEmail())
                .role(member.getRole())
                .build();
    }
}
