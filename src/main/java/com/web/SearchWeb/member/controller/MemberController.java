package com.web.SearchWeb.member.controller;



import com.web.SearchWeb.member.dto.MemberDto;
import com.web.SearchWeb.member.service.MemberService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 *
 *  코드 작성자: 서진영(jin2304)
 *  코드 설명 :회원가입 및 로그인 기능을 담당하는 컨트롤러
 *  코드 주요 기능: 회원가입, 로그인
 *  코드 작성일: 2024.06.30 ~ 2024.07.04
 *
 */

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
    public String join(Model model) {
        if (!model.containsAttribute("memberDto")) { // RedirectAttributes를 통해 전달된 "memberDto"가 모델에 포함되어 있는지 확인
            model.addAttribute("memberDto", new MemberDto());
        }
        return "member/join";
    }


    /**
     *  회원가입
     */
    @PostMapping("/joinProc")
    public String joinProcess(@Valid MemberDto member, BindingResult bindingResult, RedirectAttributes redirectAttributes) {

        /** 유효성 검사 **/
        // 빈 문자열 검사, 사이즈 체크 등 MemberDto에 정의된 유효성 검사 수행
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.memberDto", bindingResult);
            redirectAttributes.addFlashAttribute("memberDto", member);
            return "redirect:/join"; // (PRG 패턴 적용)유효성 검사에 실패하면 회원가입 페이지로 다시 이동
        }

        // 사용자 아이디 중복 확인
        if (memberService.findByUserName(member.getUsername()) != null) {
            bindingResult.rejectValue("username", "error.member", "이미 존재하는 아이디입니다.");
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.memberDto", bindingResult);
            redirectAttributes.addFlashAttribute("memberDto", member);
            return "redirect:/join";
        }

        //비밀번호 확인
        if (!memberService.isPasswordMatching(member)) {
            bindingResult.rejectValue("confirmPassword", "error.member", "입력된 비밀번호와 일치하지 않습니다.");
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.memberDto", bindingResult);
            redirectAttributes.addFlashAttribute("memberDto", member);
            return "redirect:/join";
        }

        memberService.joinProcess(member);
        return "redirect:/login";
    }


    /**
     *  로그인 페이지
     */
    @GetMapping("/login")
    public String login() {
        return "member/login";
    }


}