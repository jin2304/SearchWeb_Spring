package com.web.SearchWeb.member.controller;



import com.web.SearchWeb.member.dto.MemberDto;
import com.web.SearchWeb.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;


@Controller
public class MemberController {

    MemberService memberService;

    @Autowired
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }



    /**
     *  회원가입 페이지
     */
    @GetMapping("/join")
    public String join() {
        return "/member/join";
    }

    /**
     *  회원가입
     */
    @PostMapping("/joinProc")
    public String joinProcess(MemberDto member) {
        memberService.joinProcess(member);
        return "redirect:/login";
    }


    /**
     *  로그인 페이지
     */
    @GetMapping("/login")
    public String login() {
        return "/member/login";
    }


}