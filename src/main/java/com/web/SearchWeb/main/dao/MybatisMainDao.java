package com.web.SearchWeb.main.dao;

import com.web.SearchWeb.main.domain.Website;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MybatisMainDao implements MainDao {

    private MainDao mapper;

    @Autowired
    public MybatisMainDao(SqlSession sqlSession) {
        mapper = sqlSession.getMapper(MainDao.class);
    }

    @Override
    public List<Website> getList() {
        return mapper.getList();
    }

    @Override
    public Website getDetail() {
        return null;
    }
}
