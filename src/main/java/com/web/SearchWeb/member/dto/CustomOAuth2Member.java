package com.web.SearchWeb.member.dto;


import com.web.SearchWeb.member.dto.Response.OAuth2Response;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;



/**
 * CustomOAuth2Member 클래스
 *
 * 코드 작성자:
 *      - 서진영(jin2304)
 *
 * 코드 설명:
 *      - 소셜 로그인 시 사용자 정보를 담아 Spring Security 인증 과정에서 사용되는 클래스.
 *      - OAuth2User 인터페이스를 구현하여 각 소셜 서비스의 사용자 정보 규격화.
 *      - 인증 후 SecurityContext 내에 저장되어 사용자 상태 관리에 사용됨.
 *
 * 코드 주요 기능:
 *      -getAttributes(): 현재 비어 있음 -> OAuth2User 인터페이스의 요구사항을 충족하기 위해 메서드가 존재하지만, 실제 사용하지 않으므로 빈 맵 반환
 *      -getAuthorities(): 사용자 권한 반환.
 *      -getName(): 소셜 서비스에서 제공한 사용자 이름 반환.
 *      -getMemberId(): 데이터베이스에 저장된 사용자 고유 ID 반환.
 *      -getLoginId(): 소셜 서비스 이름과 사용자 ID를 조합한 고유 식별값 반환.
 *
 * 주요 필드:
 *      - oAuth2Response: 소셜 서비스별 사용자 정보 (naver, google, kakao 등).
 *      - role: 서비스 내에서 부여된 권한.
 *      - memberId: DB 저장용 고유 ID.
 */
public class CustomOAuth2Member implements OAuth2User {

    private final OAuth2Response oAuth2Response;
    private final String role;
    private final Long memberId;
    private final boolean newMember;

    public CustomOAuth2Member(OAuth2Response oAuth2Response, String role, Long memberId) {
        this(oAuth2Response, role, memberId, false);
    }

    public CustomOAuth2Member(OAuth2Response oAuth2Response, String role, Long memberId, boolean newMember) {
        this.oAuth2Response = oAuth2Response;
        this.role = role;
        this.memberId = memberId;
        this.newMember = newMember;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return Map.of();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();
        // 람다식을 사용하여 권한 반환 로직 간소화
        collection.add(() -> role);
        return collection;
    }

    @Override
    public String getName() {
        return oAuth2Response.getName();
    }


    public Long getMemberId() {
        return memberId;
    }

    public boolean isNewMember() {
        return newMember;
    }

    public String getProvider() {
        return oAuth2Response.getProvider();
    }

    public String getLoginId() {
        return oAuth2Response.getProvider() + oAuth2Response.getProviderId();
    }


}