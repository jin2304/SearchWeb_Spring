package com.web.SearchWeb.aop;

import com.web.SearchWeb.board.service.BoardService;
import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.member.dto.CustomOAuth2User;
import com.web.SearchWeb.member.dto.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Objects;

/**
 * OwnerCheckAspect
 * 
 * 리소스 소유자 검증 AOP
 */
@Aspect
@Slf4j(topic = "[OwnerCheckAspect]")
@Component
@RequiredArgsConstructor
public class OwnerCheckAspect {

    private final BoardService boardService;
    private final CommentService commentService;

    /**
     * @OwnerCheck 어노테이션이 붙은 메서드 실행 전,
     * 요청한 사용자가 해당 리소스의 소유자인지 검사
     */
    @Before("@annotation(ownerCheck)")
    public void validateOwner(JoinPoint joinPoint, OwnerCheck ownerCheck) {
        // 접근 검증 대상 리소스의 ID 추출
        Long targetId = extractTargetIdFromParams(joinPoint, ownerCheck.idParam());

        // 현재 로그인한 사용자의 memberId 추출
        Authentication auth = validateAuthenticatedUser();
        Long currentUserId = extractMemberId(auth);

        // 서비스 이름에 따라 리소스 작성자 memberId 조회
        Long ownerId = findOwnerIdByServiceName(ownerCheck.service(), targetId);

        // 현재 사용자와 리소스 소유자 검증
        if (!Objects.equals(currentUserId, ownerId)) {
            log.warn("접근 거부: 사용자 ID {} ≠ 소유자 ID {}", currentUserId, ownerId);
            throw new SecurityException("소유자만 접근 가능합니다.");
        }
    }




    /**
     * 접근 검증 대상이 되는 리소스의 ID를 파라미터 이름(idParam)을 통해 찾아 Long으로 반환
     *  ex) @OwnerCheck(idParam = "boardId", ...) -> 메서드의 boardId 값을 찾아 사용
     *
     * @param joinPoint 현재 실행된 메서드의 실행 정보
     * @param idParam   검증 대상 리소스 ID의 파라미터 이름 (예: "boardId" 문자열)
     * @return 접근 검증 대상이 되는 리소스의 ID 값
     */
    private Long extractTargetIdFromParams(JoinPoint joinPoint, String idParam) {
        Object[] args = joinPoint.getArgs(); // 메서드 실제 인자 값 배열
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames(); // 메서드 파라미터 이름 배열

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(idParam)) {
                // Integer나 Long 모두 지원하도록 String으로 변환 후 parse
                return Long.parseLong(args[i].toString());
            }
        }
        log.error("{}' 파라미터를 찾을 수 없음. 실제 파라미터: {}", idParam, Arrays.toString(paramNames));
        throw new IllegalArgumentException("요청 파라미터에서 ID를 찾을 수 없습니다.");
    }


    // SecurityContext 에서 인증된 사용자 반환
    private Authentication validateAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            log.error("인증 실패: SecurityContext에 인증된 사용자가 없습니다.");
            throw new SecurityException("로그인된 사용자만 접근 가능합니다.");
        }
        return auth;
    }


    // 인증 객체에서 현재 로그인한 사용자 memberId 추출 (Long 반환)
    private Long extractMemberId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails u) return u.getMemberId();
        if (principal instanceof CustomOAuth2User u) return u.getMemberId();
        log.error("인증 실패: 사용자 객체 타입이 예상과 다름. principal = {}", principal.getClass().getName());
        throw new SecurityException("인증 정보가 없습니다.");
    }


    // 서비스 이름에 따라 해당 리소스의 작성자 조회
    private Long findOwnerIdByServiceName(String service, Long targetId) {
        return switch (service) {
            case "boardService"  -> boardService.findMemberIdByBoardId(targetId);
            case "commentService" -> commentService.findMemberIdByCommentId(targetId);
            case "memberService" -> targetId; // memberService의 경우 targetId가 곧 memberId
            default -> {
                log.error("지원하지 않는 서비스명 '{}'", service);
                throw new IllegalArgumentException("지원하지 않는 서비스명입니다.");
            }
        };
    }

}
