package com.web.SearchWeb.board.dao;

import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisBoardDao implements BoardDao{

    private final BoardDao mapper;

    @Autowired
    public MybatisBoardDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(BoardDao.class);
    }


    /**
     *  게시글 생성
     */
    public int insertBoard(Long memberId, BoardDto boardDto) {
        return mapper.insertBoard(memberId, boardDto);
    }


    /**
     *  페이징된 게시글 목록 조회
     */
    @Override
    public List<Board> selectBoardPage(int offset, int size, String sort, String query, String postType) {
        return mapper.selectBoardPage(offset, size, sort, query, postType);
    }

    /**
     *  게시글 총 페이지
     */
    @Override
    public int countBoardList(String query, String postType) {
        return mapper.countBoardList(query, postType);
    }


    /**
     *  게시글 목록 조회(회원번호로 조회)
     */
    public List<Board> selectBoardListByMemberId(Long memberId) {
        return mapper.selectBoardListByMemberId(memberId);
    }


    /**
     *  게시글 단일 조회
     */
    public Board selectBoard(Long boardId) {
        return mapper.selectBoard(boardId);
    }


    /**
     *  게시글 수정
     */
    public int updateBoard(Long boardId, BoardDto boardDto){
        return mapper.updateBoard(boardId, boardDto);
    }


    /**
     *  게시글 수정(회원정보 수정)
     */
    public int updateBoardProfile(Long boardId, String job, String major){
        return mapper.updateBoardProfile(boardId, job, major);
    }


    /**
     *  게시글 삭제
     */
    public int deleteBoard(Long boardId) {
        return mapper.deleteBoard(boardId);
    }


    /**
     *  게시글 북마크 수 수정
     */
    @Override
    public int updateBookmarkCount(Long boardId, int bookmarkCount) {
        return mapper.updateBookmarkCount(boardId, bookmarkCount);
    }


    /**
     *  게시글 조회수 증가
     */
    public int incrementViewCount(Long boardId) {
        return mapper.incrementViewCount(boardId);
    }


    /**
     *  게시글 좋아요 증가
     */
    @Override
    public int incrementLikeCount(Long boardId) {
        return mapper.incrementLikeCount(boardId);
    }


    /**
     *  게시글 좋아요 감소
     */
    @Override
    public int decrementLikeCount(Long boardId) {
        return mapper.decrementLikeCount(boardId);
    }


    /**
     *  게시글 댓글 수 증가
     */
    @Override
    public int incrementCommentCount(Long boardId) {
        return mapper.incrementCommentCount(boardId);
    }


    /**
     *  게시글 댓글 수 감소
     */
    @Override
    public int decrementCommentCount(Long boardId) {
        return mapper.decrementCommentCount(boardId);
    }
}
