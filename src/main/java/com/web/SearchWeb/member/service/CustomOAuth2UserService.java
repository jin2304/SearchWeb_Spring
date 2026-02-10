package com.web.SearchWeb.member.service;

import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.Response.GoogleResponse;
import com.web.SearchWeb.member.dto.Response.KakaoResponse;
import com.web.SearchWeb.member.dto.Response.NaverResponse;
import com.web.SearchWeb.member.dto.Response.OAuth2Response;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;


/**
 * CustomOAuth2UserService 클래스
 *
 * 코드 작성자:
 *      -서진영(jin2304)
 *
 * 코드 설명:
 *      -소셜 로그인 요청 시, Spring Security의 DefaultOAuth2UserService를 상속받아 사용자 정보를 로드하고,
 *       회원가입 및 로그인 로직을 처리하는 서비스 클래스.
 *      -loadUser() 메서드를 재정의하여 소셜 서비스(naver, google, kakao 등)에 맞는 사용자 정보 처리 및 인증 수행.
        -소셜 서비스에서 가져온 사용자 정보를 반환하여 Spring Security가 이 정보를 기반으로 로그인 검증(Authentication) 수행.
 *      -로그인 검증에 성공하면, 인증 객체(Authentication)를 생성하고 SecurityContext에 저장하여 로그인 상태를 유지.
 *
 * 코드 주요 기능:
 *      -loadUser(): 소셜 로그인 시 호출되며, 사용자 정보를 로드하고 회원가입 및 로그인을 처리.
 *      -회원가입 및 로그인 처리:
 *           1) 새로운 사용자: 데이터베이스에 사용자 정보 삽입 및 고유 ID 생성.
 *           2) 기존 사용자: 사용자 정보를 업데이트.
 *
 * 소셜 서비스 지원 플랫폼:
 *       -naver, google, kakao
 *
 * 예외 처리:
 *      -지원하지 않는 소셜 플랫폼 요청 시 null 반환.
 *
 * 코드 작성일:
 *      -2024.12.26 ~ 2024.12.26
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberDao memberDao;

    public CustomOAuth2UserService(MemberDao memberDao) {
        this.memberDao = memberDao;
    }



    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 부모 클래스의 메서드를 호출하여 소셜 서비스에서 사용자 정보 로드
        OAuth2User oAuth2User = super.loadUser(userRequest);
        // 요청한 소셜 서비스 이름 추출
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2Response oAuth2Response = null;

        //소셜 서비스에 따라 응답 객체 처리
        if(registrationId.equals("naver")){
            oAuth2Response = new NaverResponse(oAuth2User.getAttributes());
        }
        else if(registrationId.equals("google")){
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
        }
        else if(registrationId.equals("kakao")){
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
        }
        else{
            return null;
        }


        /* 회원가입 및 로그인 로직 */
        // 사용자 고유 식별값 생성 (소셜 서비스 이름 + 소셜 서비스 사용자 ID)
        String loginId = oAuth2Response.getProvider() + oAuth2Response.getProviderId();
        // 기존 사용자 정보 조회
        Member existMember = memberDao.findByLoginId(loginId);
        // 기본 사용자 역할 설정
        String role = "ROLE_USER";
        Long memberId;
        
        // 사용자가 존재하지않으면 회원가입
        if(existMember == null) {
            Member member = new Member();
            member.setLoginId(loginId);
            member.setPasswordHash("1111");  // 소셜 로그인은 비밀번호 불필요하지만 NOT NULL 제약 대응
            member.setMemberName(oAuth2Response.getName() != null ? oAuth2Response.getName() : "Unknown");  // member_name (NOT NULL)
            member.setNickName("닉네임"); // 닉네임 임시 설정
            member.setEmail(oAuth2Response.getEmail());
            member.setRole(role);
            memberDao.SocialjoinProcess(member);
            memberId = member.getMemberId();
        }// 사용자가 이미 존재한다면 업데이트
        else{
            existMember.setLoginId(loginId);
            existMember.setEmail(oAuth2Response.getEmail());
            role = existMember.getRole();
            memberId = existMember.getMemberId();
            memberDao.updateSocialMember(memberId, existMember);
        }

        // 반환된 CustomOAuth2User는 Spring Security가 인증 객체 생성 및 로그인 검증에 사용
        return new CustomOAuth2User(oAuth2Response, role, memberId);
    }


}
