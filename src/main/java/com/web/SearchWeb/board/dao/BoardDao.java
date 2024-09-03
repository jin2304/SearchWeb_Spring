package com.web.SearchWeb.board.dao;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BoardDao {
    //게시글 생성
    public int insertBoard(int memberId, BoardDto boardDto);

    //게시글 목록 조회(최신순, 인기순)
    List<Board> selectBoardList(@Param("query") String query, @Param("sort") String sort);

    //게시글 단일 조회
    Board selectBoard(int boardId);

    //게시글 수정
    int updateBoard(int boardId, BoardDto boardDto);

     //게시글 삭제
    int deleteBoard(int memberId, int boardId);

    //게시글 북마크 수 수정
    int updateBookmarkCount(int boardId, int bookmarkCount);
}