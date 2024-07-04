package com.web.SearchWeb.main.dao;

import com.web.SearchWeb.main.domain.Website;

import java.util.List;

public interface MainDao {
    //웹사이트 목록조회
    List<Website> getList();

    //웹사이트 상세보기
    Website getDetail();
}
