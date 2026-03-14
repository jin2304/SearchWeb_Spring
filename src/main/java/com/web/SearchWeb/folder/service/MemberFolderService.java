package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.List;
import java.util.Optional;

public interface MemberFolderService {

    Long create(Long loginId, Long parentFolderId, String folderName, String description);

    MemberFolder get(Long loginId, Long memberFolderId);

    List<MemberFolder> listRootFolders(Long loginId, Long ownerMemberId);

    List<MemberFolder> listChildren(Long loginId, Long ownerMemberId, Long parentFolderId);

    void update(Long loginId, Long memberFolderId, String folderName, String description);

    void move(Long loginId, Long memberFolderId, Long newParentFolderId);

    void delete(Long loginId, Long memberFolderId);
}
