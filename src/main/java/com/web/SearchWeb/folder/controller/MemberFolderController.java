package com.web.SearchWeb.folder.controller;

import com.web.SearchWeb.config.ApiResponse;
import com.web.SearchWeb.folder.controller.dto.MemberFolderRequests;
import com.web.SearchWeb.folder.controller.dto.MemberFolderResponses;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.service.MemberFolderService;
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
@RequestMapping("/api/folders")
public class MemberFolderController {

    private final MemberFolderService memberFolderService;

    // 생성 (201 Created 응답)
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(@RequestBody MemberFolderRequests.Create req) {
        Long folderId = memberFolderService.create(
            req.ownerMemberId,
            req.parentFolderId,
            req.folderName,
            req.description
        );
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(folderId));
    }

    // 단건 조회
    @GetMapping("/{folderId}")
    public ResponseEntity<ApiResponse<MemberFolderResponses>> get(@PathVariable Long folderId) {
        MemberFolder folder = memberFolderService.get(folderId);
        return ResponseEntity.ok(ApiResponse.success(MemberFolderResponses.from(folder)));
    }

    // 루트 폴더 조회
    @GetMapping("/owners/{ownerMemberId}/root")
    public ResponseEntity<ApiResponse<List<MemberFolderResponses>>> listRoot(@PathVariable Long ownerMemberId) {
        List<MemberFolderResponses> responses = memberFolderService.listRootFolders(ownerMemberId)
            .stream()
            .map(MemberFolderResponses::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 하위 폴더 조회
    @GetMapping("/owners/{ownerMemberId}/children/{parentFolderId}")
    public ResponseEntity<ApiResponse<List<MemberFolderResponses>>> listChildren(
        @PathVariable Long ownerMemberId,
        @PathVariable Long parentFolderId
    ) {
        List<MemberFolderResponses> responses = memberFolderService.listChildren(ownerMemberId, parentFolderId)
            .stream()
            .map(MemberFolderResponses::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 수정 (200 OK)
    @PutMapping("/{folderId}")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long folderId, @RequestBody MemberFolderRequests.Update req) {
        memberFolderService.update(folderId, req.folderName, req.description);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 이동(부모 변경)
    @PutMapping("/{folderId}/move")
    public ResponseEntity<ApiResponse<Void>> move(@PathVariable Long folderId, @RequestBody MemberFolderRequests.Move req) {
        memberFolderService.move(folderId, req.newParentFolderId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 삭제
    @DeleteMapping("/{folderId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long folderId) {
        memberFolderService.delete(folderId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}