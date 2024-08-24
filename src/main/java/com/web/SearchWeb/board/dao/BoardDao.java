package com.web.SearchWeb.board.dao;


import com.web.SearchWeb.board.dto.BoardDto;


public interface BoardDao {
    //게시글 생성
    public int insertBoard(int memberId, BoardDto boardDto);
}