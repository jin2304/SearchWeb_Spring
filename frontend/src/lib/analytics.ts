"use client";

import { sendGTMEvent } from "@next/third-parties/google";

export const ANALYTICS_EVENTS = {
  LOGIN: "login",
  SIGN_UP: "sign_up",
  SEARCH: "search",
  BOOKMARK_SAVE_STARTED: "bookmark_save_started",
  BOOKMARK_SAVED: "bookmark_saved",
  LINK_ANALYSIS_STARTED: "link_analysis_started",
  LINK_ANALYSIS_COMPLETED: "link_analysis_completed",
  LINK_ANALYSIS_FAILED: "link_analysis_failed",
} as const;

type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type AnalyticsEventParameter = string | number | boolean;

export function trackAnalyticsEvent(
  event: AnalyticsEventName,
  parameters: Record<string, AnalyticsEventParameter> = {},
) {
  if (!process.env.NEXT_PUBLIC_GTM_ID) return;

  sendGTMEvent({
    event,
    ...parameters,
  });
}
