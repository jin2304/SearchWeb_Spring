package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.List;
import java.util.Optional;

public interface MemberFolderService {

    Long create(Long memberId, Long parentFolderId, String folderName, String description);

    MemberFolder get(Long memberId, Long memberFolderId);

    List<MemberFolder> listRootFolders(Long memberId, Long ownerMemberId);

    List<MemberFolder> listChildren(Long memberId, Long ownerMemberId, Long parentFolderId);

    void update(Long memberId, Long memberFolderId, String folderName, String description);

    void move(Long memberId, Long memberFolderId, Long newParentFolderId);

    void delete(Long memberId, Long memberFolderId);
}
