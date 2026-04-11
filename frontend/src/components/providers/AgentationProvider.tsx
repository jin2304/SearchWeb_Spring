"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Client Component 내에서 dynamic import (ssr: false) 사용
const Agentation = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

export function AgentationProvider() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 development 환경인지 체크
    if (process.env.NODE_ENV === "development") {
      setIsDev(true);
    }
  }, []);

  if (!isDev) return null;

  return <Agentation />;
}
