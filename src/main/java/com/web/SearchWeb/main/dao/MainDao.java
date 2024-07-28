package com.web.SearchWeb.main.dao;

import com.web.SearchWeb.main.domain.Website;

import java.util.List;

public interface MainDao {
    //카테고리별 웹사이트 목록 조회
    List<Website> getListByCategory(String category);

    //검색어 기반으로 웹사이트 목록 조회
    List<Website> getListByQuery(String query);

    //웹사이트 상세보기
    Website getDetail();
}
