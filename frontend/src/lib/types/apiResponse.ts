// 백엔드 공통 응답 래퍼 (ApiResponse<T>)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
  } | null;
}
