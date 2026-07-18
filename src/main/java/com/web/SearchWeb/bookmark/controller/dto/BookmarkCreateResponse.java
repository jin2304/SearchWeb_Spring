package com.web.SearchWeb.bookmark.controller.dto;

public record BookmarkCreateResponse(
        Long bookmarkId,
        boolean created,
        Long resolvedFolderId
) {
}
