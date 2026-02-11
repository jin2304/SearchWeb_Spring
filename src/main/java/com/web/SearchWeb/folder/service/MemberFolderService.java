package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.List;
import java.util.Optional;

public interface MemberFolderService {

    Long create(Long ownerMemberId, Long parentFolderId, String folderName, String description);

    MemberFolder get(Long memberFolderId);

    List<MemberFolder> listRootFolders(Long ownerMemberId);

    List<MemberFolder> listChildren(Long ownerMemberId, Long parentFolderId);

    void update(Long memberFolderId, String folderName, String description);

    void move(Long memberFolderId, Long newParentFolderId);

    void delete(Long memberFolderId);
}
