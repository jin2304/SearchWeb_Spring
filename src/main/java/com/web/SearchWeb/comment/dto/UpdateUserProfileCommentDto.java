package com.web.SearchWeb.comment.dto;

/**
 * 사용자 프로필 변경 시 댓글 정보 업데이트용 DTO
 * 
 * PostgreSQL 호환 - Long commentId
 */
public record UpdateUserProfileCommentDto(
        Long commentId,
        String nickname,
        String job,
        String major
) {

    public static UpdateUserProfileCommentDto of(Long commentId, String nickname, String job, String major) {
        return new UpdateUserProfileCommentDto(commentId, nickname, job, major);
    }

}
