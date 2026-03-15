package com.web.SearchWeb.linkanalysis.error;

import com.web.SearchWeb.config.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 링크 분석 모듈 에러 코드 (코드 체계: LA + 3자리)
 */
@Getter
@RequiredArgsConstructor
public enum LinkAnalysisErrorCode implements ErrorCode {

    /** URL null/빈값/http(s) 아닌 경우 */
    INVALID_URL(HttpStatus.BAD_REQUEST, "LA001", "유효하지 않은 URL입니다."),

    /** 내부망(loopback/link-local/private) 주소 접근 차단 */
    BLOCKED_HOST(HttpStatus.BAD_REQUEST, "LA005", "접근이 허용되지 않는 호스트입니다."),

    /** 페이지 크롤링 실패 (타임아웃, 접근 거부 등) */
    URL_FETCH_FAILED(HttpStatus.BAD_GATEWAY, "LA002", "URL 콘텐츠를 가져올 수 없습니다."),

    /** AI 서비스 호출 실패 (네트워크, API 키 만료 등) */
    AI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "LA003", "AI 분석 서비스를 사용할 수 없습니다."),

    /** AI 응답 JSON 파싱 실패 */
    AI_RESPONSE_PARSE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "LA004", "AI 응답을 처리할 수 없습니다.");

    private final HttpStatus status;  // HTTP 상태 코드
    private final String code;        // 에러 식별 코드
    private final String message;     // 사용자 노출 메시지
}
