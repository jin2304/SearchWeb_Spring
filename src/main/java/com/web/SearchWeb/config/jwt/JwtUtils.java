package com.web.SearchWeb.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * JWT(JSON Web Token) 생성 및 유효성 검증을 담당하는 컴포넌트
 */
@Slf4j
@Component
public class JwtUtils {

    private final SecretKey secretKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtUtils(JwtProperties properties) {
        // Base64로 인코딩된 시크릿 키를 디코딩하여 HMAC-SHA 키로 변환
        byte[] keyBytes = Base64.getDecoder().decode(properties.secret());
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiry = properties.accessTokenExpiry();
        this.refreshTokenExpiry = properties.refreshTokenExpiry();
    }

    /**
     * Access Token 생성
     * @param memberId 사용자 식별 ID
     * @param role 사용자 권한 (예: ROLE_USER)
     * @return 생성된 Access Token 문자열
     */
    public String generateAccessToken(Long memberId, String role) {
        Date now = new Date();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())   // 무작위 ID 추가로 동일 시간 생성 시 중복 방지
                .subject(String.valueOf(memberId))  // 토큰 제목 (사용자 ID)
                .claim("role", role)                // 사용자 권한 클레임 추가
                .issuedAt(now)                      // 발행 시간
                .expiration(new Date(now.getTime() + accessTokenExpiry)) // 만료 시간
                .signWith(secretKey)                // 서명
                .compact();
    }

    /**
     * Refresh Token 생성 (회전된 토큰을 같은 값으로 재생성하기 위한 오버로드)
     */
    public String generateRefreshToken(Long memberId, String sessionId, int version, Instant issuedAt, Instant expiresAt) {
        // 랜덤 UUID 대신 회전에 필요한 메타데이터를 고정값으로 사용해
        // 동일한 후속 refresh token을 다시 만들어낼 수 있게 한다.
        return Jwts.builder()
                .id(sessionId + ":" + version)
                .subject(String.valueOf(memberId))
                .claim("sid", sessionId)
                .claim("ver", version)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Access Token을 파싱하여 사용자 정보(Principal) 추출
     * @param token Access Token
     * @return 사용자 ID와 권한이 담긴 JwtMemberPrincipal 객체
     */
    public JwtMemberPrincipal parseAccessToken(String token) {
        return parseAccessToken(parseClaims(token));
    }

    /**
     * 이미 파싱된 Claims에서 사용자 정보(Principal) 추출
     * @param claims 파싱된 Claims
     * @return 사용자 ID와 권한이 담긴 JwtMemberPrincipal 객체
     */
    public JwtMemberPrincipal parseAccessToken(Claims claims) {
        Long memberId = Long.parseLong(claims.getSubject());
        String role = claims.get("role", String.class);

        // role 클레임 누락 시 에러 발생
        if (role == null || role.isBlank()) {
            log.error("JWT 토큰에 권한 정보(role)가 누락되었습니다. memberId: {}", memberId);
            throw new JwtException("JWT 토큰에 권한 정보가 누락되었습니다.");
        }

        return new JwtMemberPrincipal(memberId, role);
    }

    /**
     * 토큰에서 사용자 식별 ID(Subject) 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long extractMemberId(String token) {
        return extractMemberId(parseClaims(token));
    }

    /**
     * 이미 파싱된 Claims에서 사용자 식별 ID(Subject) 추출
     * @param claims 파싱된 Claims
     * @return 사용자 ID
     */
    public Long extractMemberId(Claims claims) {
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰의 유효성 검증 및 Claims 반환
     * @param token 검증할 JWT 토큰
     * @return 파싱된 Claims 객체
     * @throws ExpiredJwtException 토큰이 만료된 경우
     * @throws JwtException 토큰이 유효하지 않은 경우
     */
    public Claims validateToken(String token) {
        try {
            return parseClaims(token);
        } catch (ExpiredJwtException e) {
            log.debug("만료된 JWT 토큰: {}", e.getMessage());
            throw e;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("유효하지 않은 JWT 토큰: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * 토큰에서 Claims(데이터) 추출
     * @param token JWT 토큰
     * @return 파싱된 Claims 객체
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)    // 검증 키 설정
                .build()                  // 파서 객체 생성 (JJWT 0.12+)
                .parseSignedClaims(token) // 토큰 해석 및 검증
                .getPayload();            // 데이터 본문(Claims) 추출
    }
}
