package com.web.SearchWeb.folder.dao;

import com.web.SearchWeb.folder.domain.Folder;
import com.web.SearchWeb.folder.dto.request.FolderSearchRequestDto;

import java.util.List;

public interface FolderDao {
    // 폴더 생성
    int insertFolder(Folder folder);
    // 폴더 단일 조회
    Folder selectFolder(int memberId, int folderId);
    // 폴더 목록 조회
    List<Folder> selectFolderList(FolderSearchRequestDto searchRequest);
    // 폴더 수정
    int updateFolder(Folder folder);
    // 폴더 삭제
    int deleteFolder(int memberId, int folderId);
    // 폴더 태그 목록 조회
    List<String> selectFolderTags(int memberId);
}