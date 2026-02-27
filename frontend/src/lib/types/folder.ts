// ──────────────────────────────────────
// 백엔드 공통 응답 래퍼 (ApiResponse<T>)
// ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
  } | null;
}

// ──────────────────────────────────────
// 백엔드 MemberFolderResponses DTO 대응
// ──────────────────────────────────────
export interface FolderResponse {
  memberFolderId: number;
  ownerMemberId: number;
  parentFolderId: number | null;
  folderName: string;
  description: string | null;
}
