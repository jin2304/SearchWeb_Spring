package com.web.SearchWeb.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 리소스 소유자 검증을 위한 AOP 어노테이션
 *  -메서드 실행 전에 현재 사용자가 해당 리소스의 소유자인지 확인
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OwnerCheck {
    String idParam();
    String service();
}
