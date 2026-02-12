package com.web.SearchWeb.likes.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.likes.dao.LikesDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikesService {

    private final LikesDao likesDao;
    private final BoardDao boardDao;

    @Autowired
    public LikesService(LikesDao likesDao, BoardDao boardDao) {
        this.likesDao = likesDao;
        this.boardDao = boardDao;
    }


    /**
     *  게시글 좋아요 상태 확인
     */
    public boolean isLiked(Long boardId, Long memberId) {
        Boolean isLiked = likesDao.isLikedByMember(boardId, memberId);
        return Boolean.TRUE.equals(isLiked);
    }


    /**
     *  게시글 좋아요 추가/취소
     */
    @Transactional
    public boolean toggleLike(Long boardId, Long memberId) {
        //게시글 좋아요 상태 확인
        Boolean isLiked = likesDao.isLikedByMember(boardId, memberId);

        if (isLiked == null || Boolean.FALSE.equals(isLiked)) {
            // 좋아요가 안 되어 있다면, 좋아요 추가
            likesDao.likeBoard(boardId, memberId);
            boardDao.incrementLikeCount(boardId);  // likes_count + 1
            return true;
        } else {
            // 좋아요가 이미 되어 있다면, 좋아요 취소
            likesDao.unlikeBoard(boardId, memberId);
            boardDao.decrementLikeCount(boardId);  // likes_count - 1
            return false;
        }
    }


    /**
     *  게시글 좋아요 수 조회
     */
    public int getLikeCount(Long boardId) {
        return likesDao.countLikes(boardId);
    }

}