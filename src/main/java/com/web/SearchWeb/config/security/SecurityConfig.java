package com.web.SearchWeb.config.security;

import com.web.SearchWeb.member.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }



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
                        .loginProcessingUrl("/loginProc") //Spring Security가 제공하는 기본 인증 필터(UsernamePasswordAuthenticationFilter)를 통해 자동으로 로그인 요청을 처리
                        .usernameParameter("loginId") // 로그인 폼에서 아이디 입력 필드의 name 속성값 (기본: username -> loginId로 변경)
                        .successHandler(customAuthenticationSuccessHandler()) // 커스텀 성공 핸들러 추가
                        .failureHandler(customAuthenticationFailureHandler()) // 커스텀 실패 핸들러 추가
                        .permitAll()
                );


        /**
         *  로그아웃 설정
         */
        http
                .logout((auth)->auth
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")// 로그아웃 성공 후 메인페이지로 이동
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


        /**
         *  HTTP Basic 인증 비활성화
         */
        http
                .httpBasic((basic) -> basic.disable());


        /**
         *  소셜 로그인 설정
         */
        http
                .oauth2Login((oauth2) -> oauth2
                        .loginPage("/login") // 사용자 정의 소셜 로그인 페이지 URL 설정
                        .defaultSuccessUrl("/mainList") // 로그인 성공 후 이동할 URL
                        .userInfoEndpoint((userInfoEndpointConfig) -> userInfoEndpointConfig
                                .userService(customOAuth2UserService)));  // 소셜 로그인 인증 완료 후, 인증 서버에서 가져온 사용자 정보를 회원가입/로그인 하는 커스텀 서비스 설정.
        

        return http.build();
    }


    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CustomAuthenticationFailureHandler customAuthenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }

    @Bean
    public CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

}