package com.web.SearchWeb.main.controller;


import com.web.SearchWeb.main.domain.Website;
import com.web.SearchWeb.main.service.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;


/**
 *
 *  코드 작성자:
 *   -서진영(jin2304)
 *
 *  코드 설명:
 *   -MainController는 카테로리별로 웹사이트 목록을 보여주거나, 검색을 통해 특정 웹사이트 검색이 가능하다.
 *
 *  코드 주요 기능:
 *   -카테고리별 웹사이트 목록 조회, 검색어 기반으로 웹사이트 목록 조회
 *
 *  코드 작성일:
 *   -2024.07.05 ~ 2024.07.29
 *
 */

@Controller
public class MainController {

    private final MainService mainService;

    @Autowired
    public MainController(MainService mainService) {
        this.mainService = mainService;
    }



    /**
     *  카테고리별 웹사이트 목록 조회 및 검색 기능
     */
    @GetMapping("/mainList")
    public String mainList(@RequestParam(value = "category", defaultValue = "All") String category,
                           @RequestParam(value = "query", required = false) String query, Model model) {

        List<Website> list;
        if (query != null && !query.isEmpty()) { //검색쿼리가 존재한다면
            list = mainService.getListByQuery(query);
            model.addAttribute("list", list);
            model.addAttribute("query", query);
            model.addAttribute("resultCount", list.size());
        } else { //카테고리가 존재한다면
            list = mainService.getListByCategory(category);
            model.addAttribute("list", list);
        }
        return "main/mainList";
    }



}
