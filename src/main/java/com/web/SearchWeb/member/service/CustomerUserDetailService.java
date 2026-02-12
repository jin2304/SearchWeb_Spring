package com.web.SearchWeb.member.service;


import com.web.SearchWeb.member.dao.MybatisMemberDao;
import com.web.SearchWeb.member.domain.Member;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * CustomerUserDetailService
 * 
 * Spring Security 사용자 인증 서비스
 */
@Service
public class CustomerUserDetailService implements UserDetailsService {

    MybatisMemberDao mybatisMemberDao;

    @Autowired
    public CustomerUserDetailService(MybatisMemberDao mybatisMemberDao) {
        this.mybatisMemberDao = mybatisMemberDao;
    }

    
    
    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        Member findUser = mybatisMemberDao.findByLoginId(loginId);
        if(findUser != null){
            //spring security에 전달해서 검증
            return new CustomUserDetails(findUser);
        }
        return null;
    }
}
