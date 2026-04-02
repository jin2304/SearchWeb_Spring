package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.controller.dto.AuthResponses;
import com.web.SearchWeb.auth.dao.RefreshTokenDao;
import com.web.SearchWeb.auth.domain.RefreshToken;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.config.jwt.JwtUtils;
import com.web.SearchWeb.config.security.SecurityUtils;
import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스 구현체.
 * - JWT(Access/Refresh Token) 발급 및 로테이션 관리.
 * - 세션 ID와 버전 번호를 이용해 토큰 재사용 및 복제(Cloning) 방지.
 * - Grace Period(유예 기간)를 통한 안정적인 토큰 갱신 보장.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final long REFRESH_TOKEN_GRACE_SECONDS = 10L; // 토큰 로테이션 시 중복 요청(Race Condition)을 허용할 유예 시간 (초 단위)
    private final JwtUtils jwtUtils;
    private final RefreshTokenDao refreshTokenDao;
    private final MemberDao memberDao;
    private final com.web.SearchWeb.config.jwt.JwtProperties jwtProperties;


    /**
     * OAuth2 로그인 성공 후 Refresh Token 최초 발급
     * - 보안을 위해 동일 회원의 기존 모든 토큰을 무효화(삭제)한 뒤 새로 발급.
     */
    @Override
    public String issueRefreshToken(Long memberId) {
        // 신규 로그인 시도 - 기존 토큰 정리 후 새 세션 시
        refreshTokenDao.deleteByMemberId(memberId);
        return createAndSaveNewSessionRefreshToken(memberId);
    }


    /**
     * Refresh Token 갱신
     * 1. 토큰 유효성 검증
     * 2. DB 존재 여부 및 만료 확인
     * 3. 이미 회전된 토큰인 경우 Grace Period 내 멱등성 응답 처리
     * 4. 처음 갱신 시도인 경우 로테이션 수행 및 상태 기록
     */
    @Override
    public AuthResponses.TokenPair refresh(String refreshToken) {
        // 1. 토큰 서명 및 유효성 검증
        try {
            jwtUtils.validateToken(refreshToken);
        } catch (ExpiredJwtException e) {
            log.warn("[Refresh] 만료된 리프레시 토큰");
            throw AuthException.of(AuthErrorCode.AUTH_TOKEN_EXPIRED);
        } catch (JwtException e) {
            log.warn("[Refresh] 유효하지 않은 리프레시 토큰: {}", e.getMessage());
            throw AuthException.of(AuthErrorCode.AUTH_INVALID_TOKEN);
        }

        // 2. DB에서 토큰 해시로 조회 (비관적 락을 통한 동시성 확보)
        String hashedToken = SecurityUtils.hashToken(refreshToken);
        RefreshToken storedRefreshToken = refreshTokenDao.findByTokenHashForUpdate(hashedToken);
        if (storedRefreshToken == null) {
            log.warn("[Refresh] 존재하지 않거나 무효화된 토큰 요청. 해시: {}", shortHash(hashedToken));
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        Instant now = Instant.now();
        // 3. 만료 시간 체크
        if (storedRefreshToken.getExpiresAt().isBefore(now)) {
            log.warn("[Refresh] 기간 만료된 토큰. 해시: {}", shortHash(hashedToken));
            refreshTokenDao.deleteByTokenHash(hashedToken);
            throw AuthException.of(AuthErrorCode.AUTH_TOKEN_EXPIRED);
        }

        // 4. 로테이션 이력 확인 (Grace Period 처리)
        if (storedRefreshToken.getReplacedByVersion() != null) {
            // [분기 A] 이미 한 번 사용되어 회전된 토큰인 경우 (중복 요청 상황)
            if (storedRefreshToken.getGraceUntil() != null && !storedRefreshToken.getGraceUntil().isBefore(now)) {
                log.debug("[Refresh] Grace Period 감지 - 기존 발급된 후속 토큰을 재전달합니다.");
                
                if (!hasText(storedRefreshToken.getSessionId())) {
                    log.error("[Refresh] 크리티컬: 세션 식별 정보가 손실되었습니다.");
                    throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
                }

                // 부모 토큰 기록을 토대로 이미 발급되었던 후속 토큰(Successor)을 다시 찾아 반환
                RefreshToken successor = refreshTokenDao.findBySessionIdAndVersion(
                        storedRefreshToken.getSessionId(),
                        storedRefreshToken.getReplacedByVersion()
                );

                if (successor == null) {
                    log.warn("[Refresh] 재전달할 후속 토큰을 찾지 못했습니다.");
                    throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
                }

                return buildTokenPair(successor);
            }

            // 유예 기간을 초과한 재사용 시도는 실제 보안 위협으로 간주
            log.warn("[Refresh] 유효하지 않은 재사용 시도(중복갱신 시도) 거절. (ID: {})", storedRefreshToken.getId());
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        // [분기 B] 처음으로 수행되는 정상적인 로테이션
        // 5. 새 버전의 후속 토큰 생성
        String sessionId = hasText(storedRefreshToken.getSessionId())
                ? storedRefreshToken.getSessionId()
                : UUID.randomUUID().toString(); // 하위 호환을 위한 폴백
        int currentVersion = storedRefreshToken.getVersion() != null ? storedRefreshToken.getVersion() : 1;

        // 다음 버전(Successor) 발급
        RefreshToken successor = createAndSaveRefreshToken(
                storedRefreshToken.getMemberId(),
                sessionId,
                currentVersion + 1
        );

        // 6. DB의 부모 토큰 상태를 '회전됨'으로 원자적 업데이트
        // WHERE replaced_by_version IS NULL 조건을 통해 최초 요청자만 성공함 보장
        int updatedCount = refreshTokenDao.markRotated(RefreshToken.builder()
                .tokenHash(hashedToken)
                .sessionId(sessionId)
                .rotatedAt(now)
                .replacedByVersion(successor.getVersion()) // "내 다음 버전은 이거야" 라고 기록
                .graceUntil(now.plusSeconds(REFRESH_TOKEN_GRACE_SECONDS)) // 유예 기간 설정
                .build());

        if (updatedCount == 0) {
            // 동시에 여러 요청이 왔으나 간발의 차로 첫 번째 요청이 아닌 경우
            log.warn("[Refresh] 동시성 충돌 감지 - 이미 상태가 업데이트되었습니다.");
            throw AuthException.of(AuthErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND);
        }

        return buildTokenPair(successor);
    }

    
    /**
     * 로그아웃 처리 (해당 리프레시 토큰 즉시 무효화)
     */
    @Override
    public void logout(String refreshToken) {
        String hashedToken = SecurityUtils.hashToken(refreshToken);
        refreshTokenDao.deleteByTokenHash(hashedToken);
    }


    /**
     * 인증된 사용자의 프로필 정보 조회
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




    // ==========================================
    // 내부 헬퍼 메서드 (Private Helper Methods)
    // ==========================================

    /**
     * 새로운 세션 ID와 버전 1로 리프레시 토큰 생성 및 저장
     */
    private String createAndSaveNewSessionRefreshToken(Long memberId) {
        RefreshToken refreshToken = createAndSaveRefreshToken(memberId, UUID.randomUUID().toString(), 1);
        return toRefreshTokenValue(refreshToken);
    }

    /**
     * Refresh Token 생성 및 DB에 저장하고 JWT 문자열을 생성하는 핵심 로직
     */
    private RefreshToken createAndSaveRefreshToken(Long memberId, String sessionId, int version) {
        // 하위 밀리초를 절삭하여 JWT 서명 생성 시 일관성 유지
        Instant issuedAt = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        Instant expiresAt = issuedAt.plusMillis(jwtProperties.refreshTokenExpiry());

        // sessionId, version, 발급/만료 시각을 고정하여 JWT 생성 (나중에 같은 후속 토큰 값을 재발급 가능)
        String refreshTokenValue = jwtUtils.generateRefreshToken(memberId, sessionId, version, issuedAt, expiresAt);
        String tokenHash = SecurityUtils.hashToken(refreshTokenValue);

        RefreshToken refreshToken = RefreshToken.builder()
                .memberId(memberId)
                .sessionId(sessionId)
                .version(version)
                .tokenHash(tokenHash)
                .createdAt(issuedAt)
                .expiresAt(expiresAt)
                .build();

        refreshTokenDao.insertRefreshToken(refreshToken);
        return refreshToken;
    }

    /**
     * 도메인 개체(RefreshToken) 정보를 기반으로 JWT 토큰 문자열 재생성
     */
    private String toRefreshTokenValue(RefreshToken refreshToken) {
        return jwtUtils.generateRefreshToken(
                refreshToken.getMemberId(),
                refreshToken.getSessionId(),
                refreshToken.getVersion(),
                refreshToken.getCreatedAt(),
                refreshToken.getExpiresAt()
        );
    }

    /**
     * 후속 토큰 정보를 기반으로 응답용 토큰 쌍(Pair) 구성
     */
    private AuthResponses.TokenPair buildTokenPair(RefreshToken refreshToken) {
        Long memberId = refreshToken.getMemberId();
        String role = getMemberRole(memberId);

        return AuthResponses.TokenPair.builder()
                .accessToken(jwtUtils.generateAccessToken(memberId, role))
                .refreshToken(toRefreshTokenValue(refreshToken))
                .build();
    }

    /**
     * 회원의 권한(Role) 조회
     */
    private String getMemberRole(Long memberId) {
        Member member = memberDao.findByMemberId(memberId);
        if (member == null) {
            throw AuthException.of(AuthErrorCode.AUTH_UNAUTHORIZED);
        }
        return member.getRole();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String shortHash(String hashedToken) {
        return hashedToken.substring(0, Math.min(8, hashedToken.length()));
    }
}
