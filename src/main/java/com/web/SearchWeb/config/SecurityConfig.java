package com.web.SearchWeb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{


        /**
         *  페이지 별 권한설정
         */
        http
                .authorizeHttpRequests((auth) -> auth
                        //.requestMatchers("/loginProc").permitAll()
                        //.requestMatchers("/boardEnroll").authenticated()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        //.requestMatchers("/admin").hasAuthority("ROLE_ADMIN")
                        //.requestMatchers("/my/**").hasAnyRole("ROLE_ADMIN", "ROLE_USER")
                        //.anyRequest().authenticated()
                        .anyRequest().permitAll()
                );


        /**
         *  로그인 설정
         */
        http
                .formLogin((auth) -> auth
                        .loginPage("/login")
                        .loginProcessingUrl("/loginProc")
                        .defaultSuccessUrl("/") // 로그인 성공 후 메인페이지로 이동
                        .permitAll()
                );


        /**
         *  로그아웃 설정
         */
        http
                .logout((auth)->auth
                        .logoutUrl("/logout")
                        //.logoutSuccessUrl("")// 로그아웃 성공 후 메인페이지로 이동
                );



        /**
         *  다중 로그인 설정
         */
        http
                .sessionManagement((auth) -> auth
                        .maximumSessions(1)  // 하나의 아이디에 대한 다중 로그인 허용 개수
                        .maxSessionsPreventsLogin(true)); // 다중 로그인 개수를 초과하였을 경우 처리 방법  - true : 초과시 새로운 로그인 차단,  - false : 초과시 기존 세션 하나 삭제


        /**
         *  csrf 설정
         */
        http
                .csrf((auth) -> auth.disable());


        return http.build();
    }


    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

}