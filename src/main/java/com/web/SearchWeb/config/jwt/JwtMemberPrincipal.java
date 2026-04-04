package com.web.SearchWeb.config.jwt;

import java.security.Principal;

/**
 * JWT에서 추출한 사용자 정보를 담는 Principal 구현체.
 * 
 * @param memberId 사용자의 고유 식별자 (ID)
 * @param role 사용자의 권한 정보
 */
public record JwtMemberPrincipal(Long memberId, String role) implements Principal {
    
    /**
     * principal의 식별자 이름을 반환.
     * 여기서는 memberId를 문자열로 반환하여 식별자로 사용.
     */
    @Override
    public String getName() {
        return String.valueOf(memberId);
    }
}
