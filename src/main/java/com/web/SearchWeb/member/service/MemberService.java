package com.web.SearchWeb.member.service;


import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberUpdateDto;

public interface MemberService {

    //회원번호로 찾기
    public Member findByMemberId(Long memberId);

    //로그인 아이디로 찾기
    public Member findByLoginId(String loginId);


    //회원 수정
    public int updateMember(Long memberId, MemberUpdateDto memberUpdateDto);
}
