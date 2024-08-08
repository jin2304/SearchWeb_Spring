package com.web.SearchWeb.member.domain;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Member {
    private int memberId;
    private String username;
    private String password;
    private String nickname;
    private String job;
    private String major;
    private String summary;
    private String role;
}
