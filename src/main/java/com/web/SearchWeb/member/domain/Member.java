package com.web.SearchWeb.member.domain;


import com.web.SearchWeb.common.domain.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true, exclude = {"passwordHash"})
public class Member extends BaseEntity {
    private Long memberId;           // 회원 고유 ID (PK)
    private String email;            // 이메일 (로그인/알림용, Unique)
    private String loginId;          // 로그인 ID (구 username, Unique)
    private String passwordHash;     // 비밀번호 (BCrypt 암호화)
    private String memberName;       // 사용자 실명
    private String nickName;         // 닉네임 (화면 표시용)
    private String job;              // 직업
    private String major;            // 전공/관심분야
    private String summary;          // 자기소개 요약
    private String status;           // 계정 상태 (active, blocked 등)
    private String role;             // 권한 (ROLE_USER, ROLE_ADMIN 등)
}
