package com.web.SearchWeb.config.jwt;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * JWT 관련 설정 값을 관리하는 프로퍼티 클래스
 *  -application.properties에서 'jwt' 접두어로 시작하는 설정값들을 매핑받습니다.
 */
@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
    @NotBlank
    @Size(min = 44, message = "jwt.secret은 최소 44자 이상이어야 합니다. (32바이트 이상의 키를 Base64로 인코딩한 값)")
    String secret,                        // JWT 서명에 사용할 비밀 키 (HS256: 32바이트 -> Base64 44자)

    @Positive long accessTokenExpiry,     // Access Token  만료 시간 (밀리초 단위)
    @Positive long refreshTokenExpiry,    // Refresh Token 만료 시간 (밀리초 단위)

    @NotBlank
    @Pattern(regexp = "^/.*", message = "jwt.refresh-token-path는 반드시 '/'로 시작해야 합니다.")
    String refreshTokenPath               // Refresh Token 쿠키 경로 (보안을 위해 /api/auth로 한정)
) {}
