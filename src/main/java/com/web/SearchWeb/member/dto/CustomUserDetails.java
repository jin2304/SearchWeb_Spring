package com.web.SearchWeb.member.dto;


import com.web.SearchWeb.member.domain.Member;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;



//로그인 검증 로직
public class CustomUserDetails implements UserDetails {

    private Member findUser;

    public CustomUserDetails(Member findUser) {
        this.findUser = findUser;
    }


    /**
     *  사용자의 특정 권한 확인
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return findUser.getRole();
            }
        });

        return collection;
    }

    /**
     * 아이디 찾기
     */
    @Override
    public String getUsername() {
        return findUser.getUsername();
    }

    /**
     * 비밀번호 찾기
     */
    @Override
    public String getPassword() {
        return findUser.getPassword();
    }


    public int getMemberId() {
        return findUser.getMemberId();
    }



    //임시 설정
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
