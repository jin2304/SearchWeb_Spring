// 백엔드 Tag 응답 타입
export interface TagResponse {
  tagId: number;
  ownerMemberId: number;
  tagName: string;
}

// POST /api/tags 요청 바디
export interface CreateTagRequest {
  ownerMemberId: number;
  tagName: string;
}
