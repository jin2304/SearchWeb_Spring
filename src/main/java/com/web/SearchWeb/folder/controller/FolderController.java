package com.web.SearchWeb.folder.controller;

import com.web.SearchWeb.aop.OwnerCheck;
import com.web.SearchWeb.folder.dto.request.FolderCreateRequestDto;
import com.web.SearchWeb.folder.dto.request.FolderUpdateRequestDto;
import com.web.SearchWeb.folder.dto.response.FolderResponseDto;
import com.web.SearchWeb.folder.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * 코드 작성자:
 *  - 서진영(jin2304)
 *
 * 코드 설명:
 *  - 사용자의 폴더 관리 API (CRUD + 태그 조회).
 *  - 모든 요청은 OwnerCheck AOP를 통해 권한을 검증.
 *
 * 코드 주요 기능:
 *  - 폴더 생성
 *  - 폴더 단일 조회
 *  - 폴더 목록 조회
 *  - 폴더 수정
 *  - 폴더 삭제
 *  - 폴더 태그 목록 조회
 *
 * 코드 작성일:
 *  - 2025.12.31 ~ 2026.01.02
 */
@Controller
public class FolderController {

    private final FolderService folderService;

    @Autowired
    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }


    /**
     *  폴더 생성
     */
    @PostMapping("/myPage/{memberId}/folder")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<FolderResponseDto> insertFolder(@PathVariable final int memberId,
                                                          @RequestBody FolderCreateRequestDto folderCreateRequestDto) {
        int folderId = folderService.insertFolder(memberId, folderCreateRequestDto);
        return ResponseEntity.ok(folderService.selectFolder(memberId, folderId));
    }


    /**
     *  폴더 단일 조회
     */
    @GetMapping("/myPage/{memberId}/folder/{folderId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<FolderResponseDto> getFolder(@PathVariable final int memberId,
                                                       @PathVariable final int folderId) {
        FolderResponseDto folder = folderService.selectFolder(memberId, folderId);
        return ResponseEntity.ok(folder);
    }


    /**
     *  폴더 목록 조회
     */
    @GetMapping("/myPage/{memberId}/folders")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<List<FolderResponseDto>> getFolders(@PathVariable final int memberId,
                                                              @RequestParam(required = false, defaultValue = "All") String tag,
                                                              @RequestParam(required = false, defaultValue = "Newest") String sort) {
        List<FolderResponseDto> folders = folderService.selectFolderList(memberId, tag, sort);
        return ResponseEntity.ok(folders);
    }


    /**
     *  폴더 수정
     */
    @PutMapping("/myPage/{memberId}/folder/{folderId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Integer> updateFolder(@PathVariable final int memberId,
                                                @PathVariable final int folderId,
                                                @RequestBody FolderUpdateRequestDto folderUpdateRequestDto) {
        int result = folderService.updateFolder(memberId, folderId, folderUpdateRequestDto);
        return ResponseEntity.ok(result);
    }


    /**
     *  폴더 삭제
     */
    @DeleteMapping("/myPage/{memberId}/folder/{folderId}")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<Integer> deleteFolder(@PathVariable final int memberId,
                                                @PathVariable final int folderId) {
        int result = folderService.deleteFolder(memberId, folderId);
        return ResponseEntity.ok(result);
    }


    /**
     *  폴더 태그 목록 조회
     */
    @GetMapping("/myPage/{memberId}/folderTags")
    @OwnerCheck(idParam = "memberId", service = "memberService")
    public ResponseEntity<List<String>> getFolderTags(@PathVariable final int memberId) {
        List<String> tags = folderService.selectFolderTags(memberId);
        return ResponseEntity.ok(tags);
    }
}
