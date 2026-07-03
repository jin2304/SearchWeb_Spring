package com.web.SearchWeb.member.service;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.folder.service.MemberFolderService;
import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.CustomOAuth2Member;
import com.web.SearchWeb.member.dto.Response.GoogleResponse;
import com.web.SearchWeb.member.dto.Response.KakaoResponse;
import com.web.SearchWeb.member.dto.Response.NaverResponse;
import com.web.SearchWeb.member.dto.Response.OAuth2Response;
import com.web.SearchWeb.member.error.MemberErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

/**
 * 소셜 로그인(OAuth2) 사용자 정보 처리 및 DB 동기화 서비스.
 * -DefaultOAuth2UserService를 상속받아 소셜 서비스로부터 받은 유저 데이터를 가공함.
 */
@Slf4j
@Service
public class CustomOAuth2MemberService extends DefaultOAuth2UserService {

    private final MemberDao memberDao;
    private final MemberFolderService memberFolderService;

    public CustomOAuth2MemberService(MemberDao memberDao, MemberFolderService memberFolderService) {
        this.memberDao = memberDao;
        this.memberFolderService = memberFolderService;
    }

    
    /**
     * OAuth2 로그인 성공 시 호출되어 사용자 정보를 로드하고 DB와 동기화함.
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 부모 클래스의 메서드를 호출하여 기본적인 사용자 정보를 가져옴
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2Response oAuth2Response = null;

        if ("naver".equals(registrationId)) {
            oAuth2Response = new NaverResponse(oAuth2User.getAttributes());
        }
        else if ("google".equals(registrationId)) {
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
        }
        else if ("kakao".equals(registrationId)) {
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
        }
        else {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("unsupported_provider"), AuthErrorCode.AUTH_UNSUPPORTED_PROVIDER.getMessage()
            );
        }

        // 로그인 ID 생성 (제공자 + 소셜 고유 ID 조합)
        String loginId = oAuth2Response.getProvider() + oAuth2Response.getProviderId();
        String socialName = oAuth2Response.getName() != null ? oAuth2Response.getName() : "Unknown";
        String socialEmail = oAuth2Response.getEmail();
        
        // 기존 가입 여부 확인
        Member existMember = memberDao.findByLoginId(loginId);
        String role = "ROLE_USER";
        Long memberId;
        boolean newMember = false;

        // 사용자가 존재하지 않으면 회원가입하고, 사용자가  이미 존재한다면 업데이트
        if (existMember == null) {
            Member member = Member.builder()
                    .email(socialEmail)
                    .loginId(loginId)
                    .passwordHash(UUID.randomUUID().toString()) // 소셜 로그인이므로 더미 패스워드 설정
                    .memberName(socialName)
                    .role(role)           
                    .build();

            try {
                // 소셜 회원가입
                memberDao.insertSocialMember(member);
                existMember = member;
                newMember = true;
            } catch (DataIntegrityViolationException e) {
                // 동시 가입 시도로 인한 예외 발생 시 다시 조회
                existMember = memberDao.findByLoginId(loginId);
                if (existMember == null) {
                    throw new OAuth2AuthenticationException(
                        new OAuth2Error("social_login_failed"), MemberErrorCode.MEMBER_SOCIAL_LOGIN_FAILED.getMessage()
                    );
                }
            }

            // 신규 가입자의 미분류 폴더 보장 (실패해도 가입 흐름은 진행 — listRootFolders lazy 경로에서 재시도됨)
            try {
                memberFolderService.getOrCreateUnorganizedFolderId(existMember.getMemberId());
            } catch (Exception e) {
                log.warn("default folder creation failed on social signup (memberId={}): {}",
                    existMember.getMemberId(), e.getMessage());
            }
        }
        else {
            // 소셜 제공자 정보가 실제로 바뀐 경우에만 최소 필드만 동기화(변경감지)
            syncSocialIdentityIfChanged(existMember, socialName, socialEmail);
        }

        role = existMember.getRole();
        memberId = existMember.getMemberId();

        // 인증 객체로 사용할 CustomOAuth2Member 반환
        return new CustomOAuth2Member(oAuth2Response, role, memberId, newMember);
    }


    /**
     * 소셜 서비스의 최신 정보(이름, 이메일)와 기존 DB 정보를 비교하여 변경된 경우에만 업데이트를 수행
     */
    private void syncSocialIdentityIfChanged(Member existMember, String socialName, String socialEmail) {
        boolean memberNameChanged = !Objects.equals(existMember.getMemberName(), socialName);
        boolean emailChanged = !Objects.equals(existMember.getEmail(), socialEmail);

        if (memberNameChanged || emailChanged) {
            existMember.setMemberName(socialName);
            existMember.setEmail(socialEmail);
            // 변경된 정보 DB 반영
            memberDao.updateSocialIdentity(existMember.getMemberId(), existMember);
        }
    }
}
