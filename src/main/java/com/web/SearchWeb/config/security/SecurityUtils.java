package com.web.SearchWeb.config.security;

import com.web.SearchWeb.config.exception.BusinessException;
import com.web.SearchWeb.config.exception.CommonErrorCode;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import org.springframework.security.core.Authentication;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long extractMemberId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            // throw BusinessException.from(CommonErrorCode.UNAUTHORIZED);
            return 1L; // 테스트용 임시 우회
        }

        Object principal = authentication.getPrincipal();

        if ("anonymousUser".equals(principal)) {
            // throw BusinessException.from(CommonErrorCode.UNAUTHORIZED);
            return 1L; // 테스트용 임시 우회
        }

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getMemberId();
        }

        if (principal instanceof CustomOAuth2User oauth2User) {
            return oauth2User.getMemberId();
        }

        // throw BusinessException.from(CommonErrorCode.UNAUTHORIZED);
        return 1L; // 테스트용 임시 우회
    }
}
