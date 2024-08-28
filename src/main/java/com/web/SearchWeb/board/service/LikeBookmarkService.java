package com.web.SearchWeb.board.service;

import com.web.SearchWeb.board.dao.LikeBookmarkDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeBookmarkService {

    private final LikeBookmarkDao likeBookmarkDao;

    @Autowired
    public LikeBookmarkService(LikeBookmarkDao likeBookmarkDao) {
        this.likeBookmarkDao = likeBookmarkDao;
    }



    /**
     *  게시글 좋아요 상태 확인
     */
    public boolean isLiked(int boardId, int memberId) {
        Boolean isLiked = likeBookmarkDao.isLikedByMember(boardId, memberId);
        return Boolean.TRUE.equals(isLiked);
    }


    /**
     *  게시글 좋아요 추가/취소
     */
    public boolean toggleLike(int boardId, int memberId) {
        //게시글 좋아요 상태 확인
        Boolean isLiked = likeBookmarkDao.isLikedByMember(boardId, memberId);

        if (isLiked != null && isLiked) {
            // 좋아요가 이미 되어 있다면, 좋아요 취소
            likeBookmarkDao.unlikeBoard(boardId, memberId);
            return false;
        } else {
            // 좋아요가 안 되어 있다면, 좋아요 추가
            likeBookmarkDao.likeBoard(boardId, memberId);
            return true;
        }
    }


    /**
     *  게시글 좋아요 수 조회
     */
    public int getLikeCount(int boardId) {
        return likeBookmarkDao.countLikes(boardId);
    }

}