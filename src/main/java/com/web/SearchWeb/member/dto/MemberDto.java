package com.web.SearchWeb.member.dto;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberDto {
    private String username;
    private String password;
    private String nickname;
    private String role;
}
