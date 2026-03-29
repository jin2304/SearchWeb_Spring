package com.web.SearchWeb.config.jwt;

import com.web.SearchWeb.auth.error.AuthErrorCode;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 모든 요청마다 JWT 토큰을 검사하는 필터
 *  - 토큰이 유효하면 → SecurityContext에 인증 정보 저장 (이후 컨트롤러에서 사용자 식별 가능)
 *  - 토큰이 없으면 → 아무것도 안 하고 통과 (공개 API는 정상, 보호 API는 EntryPoint에서 401 처리)
 *  - 토큰이 만료/위변조면 → 에러코드를 request에 심어서 EntryPoint에 전달
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 1. 요청 헤더에서 토큰 추출 (없으면 null)
        String token = extractToken(request);

        try {
            // 2. 토큰이 있고 유효하면 → 인증 정보를 SecurityContext에 저장, 없으면 아무것도 안 하고 통과
            if (token != null) {
                jwtUtils.validateToken(token);
                JwtMemberPrincipal principal = jwtUtils.parseAccessToken(token);
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(principal.role()));
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (ExpiredJwtException e) {
            // 3-1. 토큰 만료 → Context 클리어 후 에러코드 저장
            SecurityContextHolder.clearContext();
            request.setAttribute("exception", AuthErrorCode.AUTH_TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException e) {
            // 3-2. 토큰 위변조/파싱 실패 → Context 클리어 후 에러코드 저장
            SecurityContextHolder.clearContext();
            request.setAttribute("exception", AuthErrorCode.AUTH_INVALID_TOKEN);
        }

        // 4. 다음 필터로 진행 (인증 성공/실패 관계없이 항상 호출, 토큰이 없거나 유효하지 않아도 다음 필터로 넘김)
        // permitAll() 설정된 공개 API의 접근을 보장하고, 보호된 API는 뒷단의 AuthorizationFilter에서 차단하기 위함
        filterChain.doFilter(request, response);
    }

    /**
     * "Authorization: Bearer {token}" 헤더에서 토큰 문자열만 추출
     */
    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
