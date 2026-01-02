package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.dto.request.FolderCreateRequestDto;
import com.web.SearchWeb.folder.dto.response.FolderResponseDto;
import com.web.SearchWeb.folder.dto.request.FolderUpdateRequestDto;

import java.util.List;

public interface FolderService {
    // 폴더 생성
    int insertFolder(int memberId, FolderCreateRequestDto folderCreateRequestDto);
    // 폴더 단일 조회
    FolderResponseDto selectFolder(int memberId, int folderId);
    // 폴더 목록 조회 
    List<FolderResponseDto> selectFolderList(int memberId, String tag, String sort);
    // 폴더 수정
    int updateFolder(int memberId, int folderId, FolderUpdateRequestDto folderUpdateRequestDto);
    // 폴더 삭제
    int deleteFolder(int memberId, int folderId);
    // 폴더 태그 목록 조회
    List<String> selectFolderTags(int memberId);
}