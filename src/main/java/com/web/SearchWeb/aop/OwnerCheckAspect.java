package com.web.SearchWeb.aop;

// import com.web.SearchWeb.board.service.BoardService;
// import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.auth.error.AuthErrorCode;
import com.web.SearchWeb.auth.error.AuthException;
import com.web.SearchWeb.config.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
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

//    private final BoardService boardService;
//    private final CommentService commentService;

    /**
     * @OwnerCheck 어노테이션이 붙은 메서드 실행 전,
     * 요청한 사용자가 해당 리소스의 소유자인지 검사
     */
    @Before("@annotation(ownerCheck)")
    public void validateOwner(JoinPoint joinPoint, OwnerCheck ownerCheck) {
        // 접근 검증 대상 리소스의 ID 추출
        Long targetId = extractTargetIdFromParams(joinPoint, ownerCheck.idParam());

        // 현재 로그인한 사용자의 memberId 추출 (SecurityUtils를 통한 인증 확인 및 ID 추출 통합)
        Long currentUserId = SecurityUtils.extractMemberId(SecurityContextHolder.getContext().getAuthentication());

        // 서비스 이름에 따라 리소스 작성자 memberId 조회
        Long ownerId = findOwnerIdByServiceName(ownerCheck.service(), targetId);

        // 현재 사용자와 리소스 소유자 검증
        if (!Objects.equals(currentUserId, ownerId)) {
            log.warn("접근 거부: 사용자 ID {} ≠ 소유자 ID {}", currentUserId, ownerId);
            throw AuthException.of(AuthErrorCode.AUTH_ACCESS_DENIED);
        }
    }




    /**
     * 접근 검증 대상이 되는 리소스의 ID를 파라미터 이름(idParam)을 통해 찾아 Long으로 반환
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


    // 서비스 이름에 따라 해당 리소스의 작성자 조회
    private Long findOwnerIdByServiceName(String service, Long targetId) {
        return switch (service) {
//            case "boardService"  -> boardService.findMemberIdByBoardId(targetId);
//            case "commentService" -> commentService.findMemberIdByCommentId(targetId);
            case "memberService" -> targetId;
            default -> {
                log.error("지원하지 않는 서비스명 '{}'", service);
                throw new IllegalArgumentException("지원하지 않는 서비스명입니다.");
            }
        };
    }

}
