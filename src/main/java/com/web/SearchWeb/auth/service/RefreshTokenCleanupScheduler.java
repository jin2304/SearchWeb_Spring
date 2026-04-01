package com.web.SearchWeb.auth.service;

import com.web.SearchWeb.auth.dao.RefreshTokenDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 만료된 Refresh Token을 주기적으로 DB에서 정리하는 스케줄러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupScheduler {

    private final RefreshTokenDao refreshTokenDao;

    /**
     * 매일 새벽 3시에 만료된 Refresh Token 삭제
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    public void cleanupExpiredTokens() {
        log.info("[Scheduler] 만료된 Refresh Token 정리 시작");
        refreshTokenDao.deleteExpired();
        log.info("[Scheduler] 만료된 Refresh Token 정리 완료");
    }
}
