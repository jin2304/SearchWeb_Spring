package com.web.SearchWeb.likes.dao;

public interface LikesDao {
    // 게시글 좋아요 상태 확인
    Boolean isLikedByMember(Long boardId, Long memberId);

    // 게시글 좋아요 추가
    int likeBoard(Long boardId, Long memberId);

    // 게시글 좋아요 취소
    int unlikeBoard(Long boardId, Long memberId);

    // 게시글 좋아요 수 조회
    int countLikes(Long boardId);
}
