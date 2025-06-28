package com.web.SearchWeb.comment.dto;

public record UpdateUserProfileCommentDto(
        int CommentId,
        String nickname,
        String job,
        String major
) {

    public static UpdateUserProfileCommentDto of(int CommentId, String nickname, String job, String major) {
        return new UpdateUserProfileCommentDto(CommentId, nickname, job, major);
    }

}
