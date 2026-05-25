package com.web.SearchWeb.config.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.Clock;
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
    public Clock clock() {
        // 감사 시각의 타임존 일관성을 보장하고, 테스트 시 시간 모킹(Mocking)을 용이하게 하기 위해 UTC 기준의 Clock을 Bean으로 등록합니다.
        return Clock.systemUTC();
    }

    @Bean
    public DateTimeProvider dateTimeProvider(Clock clock) {
        // Spring Data JPA Auditing이 OffsetDateTime 형식을 지원하도록 현재 시간을 UTC 기준으로 반환함
        return () -> Optional.of(OffsetDateTime.now(clock));
    }
}
