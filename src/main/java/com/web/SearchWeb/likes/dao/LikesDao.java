package com.web.SearchWeb.likes.dao;


public interface LikesDao {
    // 게시글 좋아요 상태 확인
    Boolean isLikedByMember( int boardId, int memberId);

    // 게시글 좋아요 추가
    int likeBoard(int boardId, int memberId);

    // 게시글 좋아요 취소
    int unlikeBoard(int boardId, int memberId);

    // 게시글 좋아요 수 조회
    int countLikes(int boardId);
}
