package com.web.SearchWeb.member.dto;


import com.web.SearchWeb.member.dto.Response.OAuth2Response;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;



/**
 * CustomOAuth2User 클래스
 *
 * 코드 작성자:
 *      - 서진영(jin2304)
 *
 * 코드 설명:
 *      -CustomOAuth2User는 소셜 로그인 요청 시, 사용자 정보를 담아 Spring Security가 인증 과정에서 사용할 수 있도록 제공하는 클래스.
 *      -Spring Security의 OAuth2User 인터페이스를 구현하여 소셜 서비스에서 가져온 사용자 정보를 표현.
 *      -반환된 CustomOAuth2User 객체는 인증 객체(Authentication)를 생성하고, SecurityContext에 저장하여 인증 상태를 관리하는 데 사용됨.
 *
 * 코드 주요 기능:
 *      -getAttributes(): 현재 비어 있음 -> OAuth2User 인터페이스의 요구사항을 충족하기 위해 메서드가 존재하지만, 실제 사용하지 않으므로 빈 맵 반환
 *      -getAuthorities(): 사용자 권한 반환.
 *      -getName(): 소셜 서비스에서 제공한 사용자 이름 반환.
 *      -getMemberId(): 데이터베이스에 저장된 사용자 고유 ID 반환.
 *      -getLoginId(): 소셜 서비스 이름과 사용자 ID를 조합한 고유 식별값 반환.
 *
 * 클래스 주요 필드:
 *      -OAuth2Response oAuth2Response: 소셜 서비스에서 가져온 사용자 정보.
 *      -String role: Searchweb 서비스에 부여한 사용자 권한(Role).
 *      -Long memberId: 데이터베이스에 저장된 사용자 고유 ID.
 *
 * 소셜 서비스 지원 플랫폼:
 *      -naver, google, kakao
 *
 * 코드 작성일:
 *      -2024.12.27 ~ 2024.12.27
 */

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2Response oAuth2Response;
    private final String role;
    private final Long memberId;

    public CustomOAuth2User(OAuth2Response oAuth2Response, String role, Long memberId) {
        this.oAuth2Response = oAuth2Response;
        this.role = role;
        this.memberId = memberId;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return Map.of();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return role;
            }
        });
        return collection;
    }

    @Override
    public String getName() {
        return oAuth2Response.getName();
    }


    public Long getMemberId() {
        return memberId;
    }


    public String getLoginId() {
        return oAuth2Response.getProvider() + oAuth2Response.getProviderId();
    }


}