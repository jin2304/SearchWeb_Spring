package com.web.SearchWeb.member.dao;


import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberUpdateDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;


@Repository
public class MybatisMemberDao implements MemberDao {


    private MemberDao mapper;

    @Autowired
    public MybatisMemberDao(SqlSession sqlSession) {
        mapper = sqlSession.getMapper(MemberDao.class);
    }


    /**
     *  소셜 회원가입
     */
    @Override
    public void insertSocialMember(Member member) {
        mapper.insertSocialMember(member);
    }

    @Override
    public Member findByMemberId(Long memberId) {
        return mapper.findByMemberId(memberId);
    }

    /**
     *  회원번호로 비관적 락(FOR UPDATE) 조회
     */
    @Override
    public Member findByMemberIdForUpdate(Long memberId) {
        return mapper.findByMemberIdForUpdate(memberId);
    }

    /**
     *  로그인 아이디로 찾기
     */
    @Override
    public Member findByLoginId(String loginId) {
        return mapper.findByLoginId(loginId);
    }


    /**
     *  회원 수정
     */
    @Override
    public int updateMember(Long memberId, MemberUpdateDto memberUpdateDto) {
        return mapper.updateMember(memberId, memberUpdateDto);
    }


    /**
     *  소셜 회원 수정
     */
    @Override
    public int updateSocialIdentity(Long memberId, Member member) {
        return mapper.updateSocialIdentity(memberId, member);
    }
}
