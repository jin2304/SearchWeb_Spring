package com.web.SearchWeb.member.service;


import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberDto;

public interface MemberService {
    //회원가입
    public void joinProcess(MemberDto member);

    //회원번호로 찾기
    public Member findByMemberId(int memberId);

    //로그인 아이디로 찾기
    public Member findByUserName(String username);
}
