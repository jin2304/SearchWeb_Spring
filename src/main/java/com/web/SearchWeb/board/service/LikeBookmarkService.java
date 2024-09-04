package com.web.SearchWeb.board.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.board.dao.LikeBookmarkDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeBookmarkService {

    private final LikeBookmarkDao likeBookmarkDao;
    private final BoardDao boardDao;

    @Autowired
    public LikeBookmarkService(LikeBookmarkDao likeBookmarkDao, BoardDao boardDao) {
        this.likeBookmarkDao = likeBookmarkDao;
        this.boardDao = boardDao;
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
    @Transactional
    public boolean toggleLike(int boardId, int memberId) {
        //게시글 좋아요 상태 확인
        Boolean isLiked = likeBookmarkDao.isLikedByMember(boardId, memberId);

        if (isLiked == null || Boolean.FALSE.equals(isLiked)) {
            // 좋아요가 안 되어 있다면, 좋아요 추가
            likeBookmarkDao.likeBoard(boardId, memberId);
            boardDao.incrementLikeCount(boardId);  // likes_count + 1
            return true;
        } else {
            // 좋아요가 이미 되어 있다면, 좋아요 취소
            likeBookmarkDao.unlikeBoard(boardId, memberId);
            boardDao.decrementLikeCount(boardId);  // likes_count - 1
            return false;
        }
    }


    /**
     *  게시글 좋아요 수 조회
     */
    public int getLikeCount(int boardId) {
        return likeBookmarkDao.countLikes(boardId);
    }

}