package com.web.SearchWeb.main.controller;


import com.web.SearchWeb.main.domain.Website;
import com.web.SearchWeb.main.service.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
/*@RequestMapping("/customer")*/
public class MainController {

    private final MainService mainService;

    @Autowired
    public MainController(MainService mainService) {
        this.mainService = mainService;
    }


    /**
     *  메인 페이지
     */
    @GetMapping("/mainList")
    public String mainList(@RequestParam(value = "category", defaultValue = "All") String category, Model model){
        List<Website> list = mainService.getListByCategory(category);
        model.addAttribute("list", list);
        return "main/mainList";
    }



}
