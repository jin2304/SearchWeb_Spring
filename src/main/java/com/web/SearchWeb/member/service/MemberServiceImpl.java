package com.web.SearchWeb.member.service;


import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.comment.dao.CommentDao;
import com.web.SearchWeb.comment.domain.Comment;
import com.web.SearchWeb.comment.dto.UpdateUserProfileCommentDto;
import com.web.SearchWeb.member.dao.MemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.MemberDto;
import com.web.SearchWeb.member.dto.MemberUpdateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;



@Service
public class MemberServiceImpl implements MemberService{

    private final MemberDao memberDao;
    private final BoardDao boardDao;
    private final CommentDao commentDao;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public MemberServiceImpl(MemberDao memberDao, BCryptPasswordEncoder bCryptPasswordEncoder, BoardDao boardDao, CommentDao commentDao) {
        this.memberDao = memberDao;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.boardDao = boardDao;
        this.commentDao = commentDao;

    }


    /**
     *  회원가입
     */
    public void joinProcess(MemberDto member) {
        // 비밀번호 암호화 및 사용자 저장 로직
        member.setPassword(bCryptPasswordEncoder.encode(member.getPassword()));
        member.setRole("ROLE_USER");
        memberDao.joinProcess(member);
    }


    /**
     *  회원번호로 찾기
     */
    public Member findByMemberId(Long memberId){
        return memberDao.findByMemberId(memberId);
    }


    /**
     *  로그인 아이디로 찾기
     */
    public Member findByLoginId(String loginId){
        return memberDao.findByLoginId(loginId);
    }


    /**
     *  비밀번호 확인
     */
    public boolean isPasswordMatching(MemberDto memberDto) {
        return memberDto.getPassword().equals(memberDto.getConfirmPassword());
    }


    /**
     * 회원 수정
     */
    @Override
    @Transactional
    public int updateMember(Long memberId, MemberUpdateDto memberUpdateDto) {
        int result = memberDao.updateMember(memberId, memberUpdateDto);

        // 회원 정보 수정이 성공했을 경우, 게시글 댓글의 회원정보 업데이트
        if (result == 1) {
            List<Comment> comments = commentDao.selectCommentsByMemberId(memberId);

            for (Comment comment : comments) {
                UpdateUserProfileCommentDto commentDto = UpdateUserProfileCommentDto.of(
                        comment.getCommentId(),
                        memberUpdateDto.getNickname(),
                        memberUpdateDto.getJob(),
                        memberUpdateDto.getMajor()
                );

                commentDao.updateCommentUserProfile(commentDto);
            }
        }
        return result;
    }
}