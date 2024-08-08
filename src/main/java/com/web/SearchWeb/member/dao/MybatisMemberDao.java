package com.web.SearchWeb.member.dao;


import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberDto;
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


    @Override
    public void joinProcess(MemberDto member) {
        mapper.joinProcess(member);
    }


    @Override
    public Member findByMemberId(int memberId) {
        Member findUser = mapper.findByMemberId(memberId);
        return findUser;
    }


    @Override
    public Member findByUserName(String username) {
        Member findUser = mapper.findByUserName(username);
        return findUser;
    }


    /**
     *  회원 수정
     */
    @Override
    public int updateMember(int memberId, MemberUpdateDto memberUpdateDto) {
        return mapper.updateMember(memberId, memberUpdateDto);
    }
}
