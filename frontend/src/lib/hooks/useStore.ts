import { useState, useEffect } from 'react';

/**
 * Next.js SSR 환경에서 Zustand의 persist 미들웨어를 안전하게 사용하기 위한 커스텀 훅입니다.
 * 클라이언트 마운트(Mount)가 완료될 때까지는 기본값을 유지하여 Hydration Mismatch를 방지합니다.
 */
export const useStore = <T, F>(
  store: (callback: (state: T) => F) => F,
  callback: (state: T) => F
): F | undefined => {
  const result = store(callback);
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
