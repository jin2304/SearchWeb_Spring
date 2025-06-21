package com.web.SearchWeb.board.service;

import com.web.SearchWeb.board.dao.BoardDao;
import com.web.SearchWeb.board.domain.Board;
import com.web.SearchWeb.board.dto.BoardDto;
import com.web.SearchWeb.comment.service.CommentService;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BoardService {

    private final BoardDao boardDao;
    private final MemberService memberService;
    private final LikeBookmarkService likeBookmarkService;
    private final CommentService commentService;

    @Autowired
    public BoardService(BoardDao boardDao, MemberService memberService, LikeBookmarkService likeBookmarkService, CommentService commentService) {
        this.boardDao = boardDao;
        this.memberService = memberService;
        this.likeBookmarkService = likeBookmarkService;
        this.commentService = commentService;
    }


    /**
     *  게시글 생성
     */
    public int insertBoard(int memberId, BoardDto boardDto) {
        return boardDao.insertBoard(memberId, boardDto);
    }


    /**
     *  페이징된 게시글 목록 조회
     */
    public Map<String, Object> selectBoardPage(int page, int size, String sort, String query, String postType) {
        int offset = page * size;
        int totalCount = boardDao.countBoardList(query, postType);
        List<Board> boards = boardDao.selectBoardPage(offset, size, sort, query, postType);

        List<String[]> hashtagsList = new ArrayList<>();
        for (Board board : boards) {
            //해시태그 추가
            String[] hashtagsArray = board.getHashtags() != null ? board.getHashtags().split(" ") : new String[0];
            hashtagsList.add(hashtagsArray);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("boards", boards);
        result.put("hashtagsList", hashtagsList);
        result.put("hasNext", offset + size < totalCount);
        return result;
    }



    /**
     * 게시글 단일 조회
     */
    public Map<String, Object> selectBoard(int boardId) {

        // 조회수 증가
        boardDao.incrementViewCount(boardId);

        Board board = boardDao.selectBoard(boardId);  // 단일 Board 객체를 가져옵니다.

        // 해시태그를 분리하여 리스트에 추가합니다.
        String[] hashtagsList = board.getHashtags() != null ? board.getHashtags().split(" ") : new String[0];

        Map<String, Object> result = new HashMap<>();
        result.put("board", board);
        result.put("hashtagsList", hashtagsList);

        return result;
    }


    /**
     *  게시글 수정
     */
    public int updateBoard(int boardId, BoardDto boardDto){
        return boardDao.updateBoard(boardId, boardDto);
    }


    /**
     *  게시글 삭제
     */
    public int deleteBoard(int boardId) {
        return boardDao.deleteBoard(boardId);
    }


    /**
     *  게시글 북마크 수 증가
     */
    public void incrementBookmarkCount(int boardId) {
        Board board = boardDao.selectBoard(boardId);
        if (board != null) {
            board.setBookmarks_count(board.getBookmarks_count() + 1);
            boardDao.updateBookmarkCount(boardId, board.getBookmarks_count());
        } else {
            throw new IllegalArgumentException("Invalid board ID");
        }
    }


    /**
     *  게시글 북마크 수 감소
     */
    public void decrementBookmarkCount(int boardId) {
        Board board = boardDao.selectBoard(boardId);
        if (board != null) {
            board.setBookmarks_count(board.getBookmarks_count() - 1);
            boardDao.updateBookmarkCount(boardId, board.getBookmarks_count());
        } else {
            throw new IllegalArgumentException("Invalid board ID");
        }
    }


    // 게시글 소유자(작성자) 조회
    public int findMemberIdByBoardId(int boardId) {
        Board board = boardDao.selectBoard(boardId);
        if (board == null) throw new IllegalArgumentException("게시글이 존재하지 않습니다.");
        return board.getMember_memberId();
    }
}
