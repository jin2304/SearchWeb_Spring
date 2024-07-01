package com.web.SearchWeb.member.service;


import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


//서비스 로직, 트랜잭션 처리
@Service
public class MemberServiceImpl implements MemberService{

    private final MemberDao memberDao;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public MemberServiceImpl(MemberDao memberDao, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.memberDao = memberDao;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }


    /**
     *  회원가입
     */
    public void joinProcess(MemberDto member) {
        member.setPassword(bCryptPasswordEncoder.encode(member.getPassword()));
        member.setRole("ROLE_ADMIN");
        memberDao.joinProcess(member);
    }


    /**
     *  회원번호로 찾기
     */
    public Member findByMemberId(int memberId){
        return memberDao.findByMemberId(memberId);
    }


    /**
     *  로그인 아이디로 찾기
     */
    public Member findByUserName(String username){
        return memberDao.findByUserName(username);
    }



}