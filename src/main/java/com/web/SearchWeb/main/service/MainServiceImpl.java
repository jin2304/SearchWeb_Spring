package com.web.SearchWeb.main.service;

import com.web.SearchWeb.main.dao.MainDao;
import com.web.SearchWeb.main.domain.Website;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MainServiceImpl implements MainService {

    private final MainDao mainDao;

    @Autowired
    public MainServiceImpl(MainDao mainDao) {
        this.mainDao = mainDao;
    }


    /**
     *  카테고리별 웹사이트 목록 조회
     */
    public List<Website> getListByCategory(String category) {
        return mainDao.getListByCategory(category);
    }


    /**
     *  검색어 기반으로 웹사이트 목록 조회
     */
    @Override
    public List<Website> getListByQuery(String query) {
        return  mainDao.getListByQuery(query);
    }


    /**
     *  웹사이트 상세보기
     */
    @Override
    public Website getDetail() {
        return null;
    }
}
