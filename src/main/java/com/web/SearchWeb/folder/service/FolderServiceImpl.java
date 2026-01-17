package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.dao.FolderDao;
import com.web.SearchWeb.folder.domain.Folder;
import com.web.SearchWeb.folder.dto.request.FolderCreateRequestDto;
import com.web.SearchWeb.folder.dto.request.FolderSearchRequestDto;
import com.web.SearchWeb.folder.dto.response.FolderResponseDto;
import com.web.SearchWeb.folder.dto.request.FolderUpdateRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FolderServiceImpl implements FolderService {

    private final FolderDao folderDao;

    @Autowired
    public FolderServiceImpl(FolderDao folderDao) {
        this.folderDao = folderDao;
    }

    @Override
    public FolderResponseDto insertFolder(int memberId, FolderCreateRequestDto folderCreateRequestDto) {
        LocalDateTime now = LocalDateTime.now();
        Folder folder = Folder.builder()
                .member_memberId(memberId)
                .name(folderCreateRequestDto.getName())
                .tag(folderCreateRequestDto.getTag())
                .created_date(now)
                .modified_date(now)
                .build();
        folderDao.insertFolder(folder);
        // useGeneratedKeys로 생성된 folderId가 folder 객체에 자동 설정됨
        return FolderResponseDto.from(folder);
    }

    @Override
    public FolderResponseDto selectFolder(int memberId, int folderId) {
        Folder folder = folderDao.selectFolder(memberId, folderId);
        return FolderResponseDto.from(folder);
    }

    @Override
    public List<FolderResponseDto> selectFolderList(int memberId, String tag, String sort) {
        FolderSearchRequestDto searchRequest = FolderSearchRequestDto.builder()
                .memberId(memberId)
                .tag(tag)
                .sort(sort)
                .build();
        List<Folder> folders = folderDao.selectFolderList(searchRequest);
        return FolderResponseDto.fromList(folders);
    }

    @Override
    public int updateFolder(int memberId, int folderId, FolderUpdateRequestDto folderUpdateRequestDto) {
        Folder folder = Folder.builder()
                .folderId(folderId)
                .member_memberId(memberId)
                .name(folderUpdateRequestDto.getName())
                .tag(folderUpdateRequestDto.getTag())
                .build();
        return folderDao.updateFolder(folder);
    }

    @Override
    public int deleteFolder(int memberId, int folderId) {
        return folderDao.deleteFolder(memberId, folderId);
    }

    @Override
    public List<String> selectFolderTags(int memberId) {
        return folderDao.selectFolderTags(memberId);
    }
}