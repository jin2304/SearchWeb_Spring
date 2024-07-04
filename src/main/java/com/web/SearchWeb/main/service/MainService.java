package com.web.SearchWeb.main.service;

import com.web.SearchWeb.main.domain.Website;

import java.util.List;

public interface MainService {
    //웹사이트 목록조회
    List<Website> getList();

    //웹사이트 상세보기
    Website getDetail();
}
