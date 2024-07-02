package com.web.SearchWeb.member.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberDto {
    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    @Size(min = 4, max = 30, message = "아이디는 4자 이상 30자 이하로 입력해주세요.")
    private String username;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Size(min = 4, max = 30, message = "비밀번호는 4자 이상 30자 이하로 입력해주세요.")
    private String password;

    @NotBlank(message = "비밀번호 확인은 필수 입력 값입니다.")
    private String confirmPassword;

    private String nickname;
    private String role;
}
