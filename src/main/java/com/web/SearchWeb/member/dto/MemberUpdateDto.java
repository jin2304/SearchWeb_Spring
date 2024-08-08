package com.web.SearchWeb.member.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class MemberUpdateDto {
    private String job;
    private String major;
    private String summary;
}
