package com.web.SearchWeb.folder.dao;

import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberFolderJpaDao extends JpaRepository<MemberFolder, Long> {

    // 루트 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderIdIsNull(Long ownerMemberId);

    // 직계 하위 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderId(Long ownerMemberId, Long parentFolderId);

    // 사용자 전체 폴더
    List<MemberFolder> findAllByOwnerMemberId(Long ownerMemberId);

    boolean existsByParentFolderId(Long parentFolderId);

    boolean existsByOwnerMemberIdAndParentFolderIdAndFolderName(Long loginId, Long parentFolderId, String normalizedFolderName);

    boolean existsByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(Long loginId, String normalizedFolderName);
}
