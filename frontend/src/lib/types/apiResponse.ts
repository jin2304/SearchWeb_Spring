// 백엔드 공통 응답 래퍼 (ApiResponse<T>)
// 성공과 실패 케이스를 명확히 분리하여 타입 안정성을 높입니다.
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
      };
    };
