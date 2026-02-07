package com.web.SearchWeb.member.dao;


import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberDto;
import com.web.SearchWeb.member.dto.MemberUpdateDto;

public interface MemberDao {
    //회원가입
    public void joinProcess(MemberDto member);

    //소셜 회원가입
    public void SocialjoinProcess(Member member);

    //회원번호로 찾기
    public Member findByMemberId(Long memberId);

    //로그인 아이디로 찾기
    public Member findByLoginId(String loginId);

    //회원 수정
    public int updateMember(Long memberId, MemberUpdateDto memberUpdateDto);

    //소셜 회원 수정
    public int updateSocialMember(Long memberId, Member member);
}
