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
    public Website selectWebsite(int websiteId) {
        return  mapper.selectWebsite(websiteId);
    }

    @Override
    public List<Website> getListByCategory(String category) {
        return mapper.getListByCategory(category);
    }

    @Override
    public List<Website> getListByQuery(String query) {
        return mapper.getListByQuery(query);
    }

    @Override
    public Website getDetail() {
        return null;
    }
}
