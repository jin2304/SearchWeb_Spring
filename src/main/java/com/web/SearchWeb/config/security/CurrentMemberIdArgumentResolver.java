package com.web.SearchWeb.config.security;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @CurrentMemberId가 붙은 컨트롤러 파라미터를 처리하는 resolver.
 * - SecurityContext에서 인증 정보를 꺼내 현재 로그인 사용자 ID를 만들어 넣어준다.
 */
public class CurrentMemberIdArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        // 1. 해당 파라미터 지원 여부 확인
        // @CurrentMemberId가 붙은 Long/long 타입 파라미터만 처리
        return parameter.hasParameterAnnotation(CurrentMemberId.class)
                && (Long.class.equals(parameter.getParameterType()) || long.class.equals(parameter.getParameterType()));
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        // 2. 파라미터에 주입할 값 생성
        // SecurityContext에서 현재 로그인한 사용자의 ID(memberId) 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return SecurityUtils.extractMemberId(authentication);
    }
}
