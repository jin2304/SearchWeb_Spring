package com.web.SearchWeb.config.security;
import lombok.extern.slf4j.Slf4j;


import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.jackson2.SecurityJackson2Modules;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * 쿠키 조작 유틸리티 클래스
 */
@Slf4j
public class CookieUtils {

    // JSON 처리를 위한 Jackson ObjectMapper (Thread-safe 하여 정적 필드로 공유 가능)
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * [정적 초기화 블록] 클래스 로딩 시 단 한 번 실행됨
     * Spring Security의 복잡한 객체(OAuth2AuthorizationRequest 등)를 JSON으로 올바르게 변환하기 위해 필요한 모듈들을 자동으로 찾아 등록함
     */
    static {
        objectMapper.registerModules(SecurityJackson2Modules.getModules(CookieUtils.class.getClassLoader()));
    }

    // 쿠키 조회 (이름 기준)
    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }
        return Optional.empty();
    }

    // 쿠키 추가 (HttpOnly, SameSite=Lax 적용)
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        addCookie(response, name, value, maxAge, false);
    }

    // 쿠키 추가 (Secure 속성 선택 가능)
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    // 쿠키 삭제 (만료시간 0 설정)
    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    ResponseCookie deleteCookie = ResponseCookie.from(name, "")
                            .path("/")
                            .maxAge(0)
                            .httpOnly(true)
                            .build();
                    response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
                }
            }
        }
    }

    // 객체 -> JSON 문자열 -> Base64 URL Safe 인코딩 (쿠키에 저장 가능한 문자열로 변환)
    public static Optional<String> serialize(Object object) {
        try {
            // Jackson을 사용하여 객체를 JSON 문자열로 변환
            String json = objectMapper.writeValueAsString(object);
            // 해당 JSON을 UTF-8 바이트로 변환 후 Base64로 인코딩하여 바이너리 데이터를 텍스트화함
            return Optional.of(Base64.getUrlEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("직렬화 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }


    // Base64 문자열 -> JSON 데이터 -> 자바 객체 (쿠키 값을 다시 객체로 복원)
    public static <T> Optional<T> deserialize(Cookie cookie, Class<T> cls) {
        try {
            // 1. Base64 디코딩 수행
            byte[] data = Base64.getUrlDecoder().decode(cookie.getValue());
            // 2. 디코딩된 JSON 데이터를 Jackson으로 읽어서 클래스 객체로 변환
            return Optional.ofNullable(objectMapper.readValue(data, cls));
        } catch (Exception e) {
            // 역직렬화 도중 에러가 나더라도 서비스를 중단시키지 않고 empty를 반환
            log.error("쿠키 역직렬화 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
