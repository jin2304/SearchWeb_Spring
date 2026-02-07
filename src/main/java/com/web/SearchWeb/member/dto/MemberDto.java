package com.web.SearchWeb.member.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 *  회원가입 요청 DTO
 */
@Getter
@Setter
@ToString
public class MemberDto {
    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    @Size(min = 4, max = 30, message = "아이디는 4자 이상 30자 이하로 입력해주세요.")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Size(min = 4, max = 30, message = "비밀번호는 4자 이상 30자 이하로 입력해주세요.")
    private String password;

    @NotBlank(message = "비밀번호 확인은 필수 입력 값입니다.")
    private String confirmPassword;

    @Size(max = 20, message = "이름은 20자 이하로 입력해주세요.")
    private String memberName;
    
    @Size(max = 20, message = "닉네임은 20자 이하로 입력해주세요.")
    private String nickName;
    
    @Email(message = "올바른 이메일 형식이어야 합니다.")
    private String email;

    private String role;
}
