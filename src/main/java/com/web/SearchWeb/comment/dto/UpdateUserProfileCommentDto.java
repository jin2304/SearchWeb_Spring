package com.web.SearchWeb.comment.dto;

public record UpdateUserProfileCommentDto(
        int commentId,
        String nickname,
        String job,
        String major
) {

    public static UpdateUserProfileCommentDto of(int commentId, String nickname, String job, String major) {
        return new UpdateUserProfileCommentDto(commentId, nickname, job, major);
    }

}
