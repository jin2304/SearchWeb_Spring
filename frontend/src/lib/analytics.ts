"use client";

import { sendGTMEvent } from "@next/third-parties/google";

/**
 * GTM 및 GA4로 전송할 핵심 사용자 행동(이벤트명) 정의
 * as const를 사용하여 각 프로퍼티의 값을 고정된 리터럴 타입으로 지정합니다.
 */
export const ANALYTICS_EVENTS = {
  LOGIN: "login",
  SIGN_UP: "sign_up",
  SEARCH: "search",
  BOOKMARK_SAVE_OPENED: "bookmark_save_opened",
  BOOKMARK_SAVED: "bookmark_saved",
  BOOKMARK_CLICK: "bookmark_click",
  TAG_CLICK: "tag_click",
  FOLDER_CLICK: "folder_click",
  LINK_ANALYSIS_STARTED: "link_analysis_started",
  LINK_ANALYSIS_COMPLETED: "link_analysis_completed",
  LINK_ANALYSIS_FAILED: "link_analysis_failed",
} as const;

/**
 * ANALYTICS_EVENTS의 실제 값들만 허용하는 이벤트명 타입
 * 예: "login" | "sign_up" | "search" | ...
 */
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * 이벤트 매개변수들을 키-값 쌍으로 담는 객체 타입 (GTM 리셋을 위해 undefined 허용)
 */
type AnalyticsEventParameters = Record<string, string | number | boolean | undefined>;

/**
 * trackEvent 호출 시 사용할 수 있는 매개변수 구조 타입.
 * 오직 event_params 객체 규격만 가지는 구조로 단순화하고 타입의 안정성을 강화.
 */
export interface TrackEventPayload {
  event_params?: AnalyticsEventParameters;
}

/**
 * GA4로 전송이 허용된 이벤트별 파라미터 화이트리스트 (PII 누출 및 불필요한 데이터 유입 방지)
 */
const GA4_ALLOWED_PARAMETERS: Record<AnalyticsEventName, readonly string[]> = {
  login: ["method"],
  sign_up: ["method", "referrer_type"],
  search: ["search_scope", "query_length", "result_count"],
  bookmark_save_opened: ["trigger"],
  bookmark_saved: ["url_domain", "has_ai_tag", "has_ai_folder", "duration_bucket"],
  bookmark_click: ["source", "days_since_save_bucket"],
  tag_click: ["result_count"],
  folder_click: ["result_count"],
  link_analysis_started: ["trigger"],
  link_analysis_completed: ["duration_bucket", "has_ai_tag", "has_ai_folder"],
  link_analysis_failed: ["duration_bucket", "failure_type"],
};

/**
 * 전송하려는 매개변수 중 GA4_ALLOWED_PARAMETERS에 정의된 허용 목록만 필터링.
 * 
 * @param event - ANALYTICS_EVENTS 중 하나
 * @param parameters - 필터링할 원본 매개변수 객체
 * @returns 허용된 매개변수만 포함된 정제된 객체
 */
function sanitizeForGA4(
  event: AnalyticsEventName,
  parameters: AnalyticsEventParameters,
): AnalyticsEventParameters {
  const allowedParameters = new Set(GA4_ALLOWED_PARAMETERS[event]);
  const sanitizedParams: AnalyticsEventParameters = {};

  // GTM dataLayer Leak(누수) 현상을 방지하기 위해 전체 파라미터 목록을 자동으로 추출
  const allKnownParameters = Array.from(
    new Set(Object.values(GA4_ALLOWED_PARAMETERS).flat())
  );

  allKnownParameters.forEach((key) => {
    if (allowedParameters.has(key)) {
      const value = parameters[key];
      if (value !== undefined && value !== null) {
        sanitizedParams[key] = value;
      }
    } else {
      // undefined를 명시적으로 할당하여 GTM 캐시는 지우되, 최종 GA4 전송 페이로드와 디버거 변수 테이블에서는 아예 생략되도록 처리.
      sanitizedParams[key] = undefined;
    }
  });

  return sanitizedParams;
}

/**
 * GTM 데이터 레이어(dataLayer)로 사용자 행동 이벤트를 전송하는 공통 헬퍼 함수.
 * - 매개변수들을 event_params 객체로 포장하여 전송하면, 이후 GTM 엔진이 이를 감지하여 최종적으로 평평하게(Flatten) 가공하여 GA4로 전달됨.
 * 
 * @param event - ANALYTICS_EVENTS 중 하나 (허용된 이벤트명만 입력 가능)
 * @param payload - 이벤트와 함께 전송할 추가 매개변수 객체 (선택 사항)
 */
export function trackEvent(
  event: AnalyticsEventName,
  payload: TrackEventPayload = {},
) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!gtmId) return;

  const rawParams = payload.event_params ?? {};
  const sanitized = sanitizeForGA4(event, rawParams);

  // GTM으로 이벤트 전송
  sendGTMEvent({
    event,
    event_params: Object.keys(sanitized).length > 0 ? sanitized : undefined,
  });
}
