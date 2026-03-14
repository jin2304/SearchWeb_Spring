package com.web.SearchWeb.tag.controller;

import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.tag.controller.dto.MemberTagDto;
import com.web.SearchWeb.tag.domain.MemberTag;
import com.web.SearchWeb.tag.service.MemberTagService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
public class MemberTagController {

    private final MemberTagService memberTagService;

    // 생성
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(@RequestBody MemberTagDto.CreateRequest req) {
        Long tagId = memberTagService.create(req.getOwnerMemberId(), req.getTagName());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(tagId));
    }

    // 단건 조회
    @GetMapping("/{tagId}")
    public ResponseEntity<ApiResponse<MemberTagDto.Response>> get(@PathVariable Long tagId) {
        MemberTag tag = memberTagService.get(tagId);
        return ResponseEntity.ok(ApiResponse.success(MemberTagDto.Response.from(tag)));
    }

    // 목록 조회
    @GetMapping("/owners/{ownerMemberId}")
    public ResponseEntity<ApiResponse<List<MemberTagDto.Response>>> list(@PathVariable Long ownerMemberId) {
        List<MemberTagDto.Response> responses = memberTagService.listByOwner(ownerMemberId)
            .stream()
            .map(MemberTagDto.Response::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 수정
    @PutMapping("/{tagId}")
    public ResponseEntity<ApiResponse<Void>> update(
        @PathVariable Long tagId,
        @RequestBody MemberTagDto.UpdateRequest req
    ) {
        memberTagService.update(tagId, req.getTagName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 삭제
    @DeleteMapping("/{tagId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long tagId) {
        memberTagService.delete(tagId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
