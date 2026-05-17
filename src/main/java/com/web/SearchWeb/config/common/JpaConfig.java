package com.web.SearchWeb.config.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * JPA 설정 클래스
 * - JPA Auditing 활성화
 * - OffsetDateTime 지원을 위한 DateTimeProvider 설정
 */
@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "dateTimeProvider")
public class JpaConfig {

    @Bean
    public DateTimeProvider dateTimeProvider() {
        // Spring Data JPA Auditing이 OffsetDateTime 형식을 지원하도록 현재 시간을 반환함
        return () -> Optional.of(OffsetDateTime.now());
    }
}
