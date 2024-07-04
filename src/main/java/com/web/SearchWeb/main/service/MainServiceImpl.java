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
     *  웹사이트 목록조회
     */
    @Override
    public List<Website> getList() {
        List<Website> list = mainDao.getList();
        return list;
    }


    /**
     *  웹사이트 상세보기
     */
    @Override
    public Website getDetail() {
        return null;
    }
}
