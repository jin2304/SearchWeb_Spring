package com.web.SearchWeb.config.security;

import com.web.SearchWeb.config.jwt.JwtAuthenticationEntryPoint;
import com.web.SearchWeb.config.jwt.JwtAuthenticationFilter;
import com.web.SearchWeb.config.jwt.JwtUtils;
import com.web.SearchWeb.config.jwt.OAuth2FailureHandler;
import com.web.SearchWeb.config.jwt.OAuth2SuccessHandler;
import com.web.SearchWeb.member.service.CustomOAuth2MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2MemberService customOAuth2MemberService;
    private final JwtUtils jwtUtils;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String oauth2RedirectUri;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // JWT 기반 Stateless 인증 — 서버 세션을 사용하지 않는다.
        http
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // CSRF: Stateless + 쿠키 SameSite=Lax 조합이므로 비활성화
        http
                .csrf(csrf -> csrf.disable());

        // HTTP Basic 인증 비활성화
        http
                .httpBasic(basic -> basic.disable());

        // Form 로그인 비활성화 (JWT + OAuth2 로 대체)
        http
                .formLogin(form -> form.disable());

        // 로컬 개발에서 프론트(3000)가 백엔드(8080)로 직접 인증 요청을 보낼 때, refreshToken 쿠키를 함께 전송할 수 있도록 CORS 를 활성화.
        // 운영에서 Nginx 단일 origin 구성 시 CORS 는 불필요해진다 (Phase 3).
        http
                .cors(Customizer.withDefaults());

        // 페이지 별 권한 설정 (Whitelist 기반)
        http
                .authorizeHttpRequests(auth -> auth
                        // 1. 인증 없이 접근 가능한 엔드포인트 (WhiteList)
                        .requestMatchers("/api/auth/refresh", "/api/auth/logout").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        
                        // 2. 관리자 전용 엔드포인트
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        // 3. 그 외 모든 요청 (기본 정책): 인증 필요 (보안 강화)
                        .anyRequest().authenticated()
                );

        // 인증 실패(401) 시 JSON 에러 응답을 반환하는 EntryPoint
        http
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint));

        // OAuth2 소셜 로그인 설정
        http
                .oauth2Login(oauth2 -> oauth2
                        // 소셜 로그인 시작 시 인증 요청 정보를 쿠키에 임시 저장할 저장소 설정
                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository))
                        // 로그인 성공 후 사용자 정보(이름, 이메일 등)를 가져와서 처리할 서비스 설정
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2MemberService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler));

        // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 삽입
        http
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtils);
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS 설정
     * - 프론트엔드에서 우리 서버로 데이터를 요청해도 되는지를 설정하는 CORS 설정
     * - credentials: true 이므로 allowedOrigins 에 와일드카드(*) 사용 불가
     * - app.oauth2.redirect-uri 에서 origin 을 추출하여 환경별로 자동 적용
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true); // 쿠키 및 인증 헤더 허용
        configuration.setAllowedOrigins(List.of(extractOrigin(oauth2RedirectUri)));                   // 허용할 프론트엔드 도메인 설정
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // 어떤 HTTP 메서드를 허용할지 설정
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cookie"));          // 어떤 헤더를 포함해야되는 설정

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // CORS 규칙을 적용할 경로 지정
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/oauth2/**", configuration);
        source.registerCorsConfiguration("/login/oauth2/**", configuration);
        return source;
    }

    // 전체 주소에서 도메인(Origin)만 추출하는 도우미 메서드 (예: http://localhost:3000)
    private String extractOrigin(String uriString) {
        URI uri = URI.create(uriString);
        StringBuilder origin = new StringBuilder(uri.getScheme())
                .append("://")
                .append(uri.getHost());
        if (uri.getPort() != -1) {
            origin.append(":").append(uri.getPort());
        }
        return origin.toString();
    }
}
