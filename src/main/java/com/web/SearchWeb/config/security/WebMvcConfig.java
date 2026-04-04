package com.web.SearchWeb.config.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;


/**
 * Spring MVC 확장 설정.
 * - 컨트롤러 파라미터를 커스텀 방식으로 해석하는 resolver를 등록.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        // @CurrentMemberId가 붙은 파라미터를 만나면 현재 로그인 사용자 ID를 주입.
        resolvers.add(new CurrentMemberIdArgumentResolver());
    }
}
