package com.web.SearchWeb.bookmark.dao;

import com.web.SearchWeb.bookmark.domain.Bookmark;
import com.web.SearchWeb.bookmark.dto.BookmarkCheckDto;
import com.web.SearchWeb.bookmark.dto.BookmarkDto;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisBookmarkDao implements BookmarkDao {

    private final BookmarkDao mapper;

    @Autowired
    public MybatisBookmarkDao(SqlSession sqlSession) {
        //세션을 통해 mapper 컨테이너에서 mapper 객체를 꺼내 씀
        mapper = sqlSession.getMapper(BookmarkDao.class);
    }


    /**
     *  북마크 조회
     */
    @Override
    public List<Bookmark> selectBookmarkList(int memberId) {
        return mapper.selectBookmarkList(memberId);
    }


    /**
     *  북마크 확인
     */
    @Override
    public int checkBookmark(BookmarkCheckDto bookmarkCheckDto) {
        return mapper.checkBookmark(bookmarkCheckDto);
    }


    /**
     *  북마크 추가
     */
    @Override
    public int insertBookmark(BookmarkDto bookmark) {
        return 0;
    }


    /**
     *  북마크 삭제
     */
    @Override
    public int deleteBookmark(BookmarkDto bookmark) {
        return 0;
    }
}
