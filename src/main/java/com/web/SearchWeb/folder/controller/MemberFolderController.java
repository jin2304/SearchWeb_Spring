package com.web.SearchWeb.folder.controller;

import com.web.SearchWeb.config.common.ApiResponse;
import com.web.SearchWeb.config.security.SecurityUtils;
import com.web.SearchWeb.folder.controller.dto.MemberFolderRequests;
import com.web.SearchWeb.folder.controller.dto.MemberFolderResponses;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.service.MemberFolderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/folders")
public class MemberFolderController {

    private final MemberFolderService memberFolderService;

    // 생성 (201 Created 응답)
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(Authentication authentication, @Valid @RequestBody MemberFolderRequests.Create req) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        Long folderId = memberFolderService.create(
            loginId,
            req.parentFolderId,
            req.folderName,
            req.description
        );
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(folderId));
    }

    // 폴더 정보 단건 조회
    @GetMapping("/{folderId}")
    public ResponseEntity<ApiResponse<MemberFolderResponses>> get(Authentication authentication, @PathVariable Long folderId) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        MemberFolder folder = memberFolderService.get(loginId, folderId);
        return ResponseEntity.ok(ApiResponse.success(MemberFolderResponses.from(folder)));
    }

    // 루트 폴더 조회
    @GetMapping("/owners/{ownerMemberId}/root")
    public ResponseEntity<ApiResponse<List<MemberFolderResponses>>> listRoot(
        Authentication authentication,
        @PathVariable Long ownerMemberId
    ) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        List<MemberFolderResponses> responses = memberFolderService.listRootFolders(loginId, ownerMemberId)
            .stream()
            .map(MemberFolderResponses::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 하위 폴더 조회
    @GetMapping("/owners/{ownerMemberId}/children/{parentFolderId}")
    public ResponseEntity<ApiResponse<List<MemberFolderResponses>>> listChildren(
        Authentication authentication,
        @PathVariable Long ownerMemberId,
        @PathVariable Long parentFolderId
    ) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        List<MemberFolderResponses> responses = memberFolderService.listChildren(loginId, ownerMemberId, parentFolderId)
            .stream()
            .map(MemberFolderResponses::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 수정 (200 OK)
    @PutMapping("/{folderId}")
    public ResponseEntity<ApiResponse<Void>> update(Authentication authentication, @PathVariable Long folderId,
        @Valid @RequestBody MemberFolderRequests.Update req) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        memberFolderService.update(loginId, folderId, req.folderName, req.description);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 이동(부모 변경)
    @PutMapping("/{folderId}/move")
    public ResponseEntity<ApiResponse<Void>> move(Authentication authentication, @PathVariable Long folderId,
        @Valid @RequestBody MemberFolderRequests.Move req) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        memberFolderService.move(loginId, folderId, req.newParentFolderId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 삭제
    @DeleteMapping("/{folderId}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication authentication, @PathVariable Long folderId) {
        Long loginId = SecurityUtils.extractMemberId(authentication);
        memberFolderService.delete(loginId, folderId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
