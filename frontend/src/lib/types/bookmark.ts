// 백엔드 Bookmark 도메인 응답 타입
export interface LinkResponse {
  linkId: number;
  canonicalUrl: string;
  originalUrl: string;
  domain: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  faviconUrl: string | null;
  contentType: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookmarkResponse {
  bookmarkId: number;
  linkId: number;
  memberFolderId: number;
  displayTitle: string;
  note: string | null;
  primaryCategoryId: number | null;
  viewCount: number;
  lastViewedAt: string | null;
  tags: string[];
  link: LinkResponse | null;
  createdAt: string;
  updatedAt: string | null;
}

// 검색 결과 응답 타입
export interface BookmarkSearchResponse {
  bookmarks: BookmarkResponse[];
  matchingFolderIds: number[];
}

// POST /api/bookmarks 요청 바디
export interface CreateBookmarkRequest {
  memberFolderId?: number | null;
  displayTitle: string;
  url: string;
  note?: string;
  primaryCategoryId?: number | null;
  tags?: string;
}

// PUT /api/bookmarks/{bookmarkId} 요청 바디
export interface UpdateBookmarkRequest {
  memberFolderId?: number | null;
  displayTitle?: string;
  note?: string;
  primaryCategoryId?: number | null;
  tags?: string;
}

// GET /api/bookmarks 쿼리 파라미터
export interface BookmarkSearchParams {
  folderId?: number | null;
  sort?: 'Newest' | 'Oldest' | 'Alphabetical';
  query?: string;
  categoryId?: number | null;
  unreadOnly?: boolean;
}
