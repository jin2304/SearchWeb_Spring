package com.web.SearchWeb.board.dao;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import org.apache.ibatis.annotations.Param;


import java.util.List;

public interface BoardDao {
    //게시글 생성
    public int insertBoard(int memberId, BoardDto boardDto);

    // 페이징된 게시글 목록 조회
    List<Board> selectBoardPage(@Param("offset") int offset,
                                @Param("size")   int size,
                                @Param("sort")   String sort,
                                @Param("query")  String query,
                                @Param("postType") String postType);

    // 게시글 전체 개수 조회 (페이징용)
    int countBoardList(String query, String postType);

    //게시글 목록 조회(회원번호로 조회)
    List<Board> selectBoardListByMemberId(int memberId);

    //게시글 단일 조회
    Board selectBoard(int boardId);

    //게시글 수정
    int updateBoard(int boardId, BoardDto boardDto);

    //게시글 수정(회원정보 수정)
    int updateBoardProfile(int boardId, String job, String major);

     //게시글 삭제
    int deleteBoard(int memberId, int boardId);

    //게시글 북마크 수 수정
    int updateBookmarkCount(int boardId, int bookmarkCount);

    //게시글 조회수 증가
    int incrementViewCount(int boardId);

    //게시글 좋아요 증가
    int incrementLikeCount(int boardId);

    //게시글 좋아요 감소
    int decrementLikeCount(int boardId);

    //게시글 댓글 수 증가
    int incrementCommentCount(int boardId);

    //게시글 댓글 수 감소
    int decrementCommentCount(int boardId);
}