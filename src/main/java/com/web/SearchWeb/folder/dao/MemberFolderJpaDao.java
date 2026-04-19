package com.web.SearchWeb.folder.dao;

import com.web.SearchWeb.folder.domain.FolderType;
import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberFolderJpaDao extends JpaRepository<MemberFolder, Long> {

    // 루트 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderIdIsNull(Long ownerMemberId);

    // 직계 하위 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderId(Long ownerMemberId, Long parentFolderId);

    // 사용자 전체 폴더
    List<MemberFolder> findAllByOwnerMemberId(Long ownerMemberId);

    boolean existsByParentFolderId(Long parentFolderId);

    boolean existsByOwnerMemberIdAndParentFolderIdAndFolderName(Long ownerMemberId, Long parentFolderId, String normalizedFolderName);

    boolean existsByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(Long ownerMemberId, String normalizedFolderName);

    // 시스템 폴더(UNORGANIZED) 조회 — 한 사용자당 최대 1개 (partial unique index 로 보장)
    Optional<MemberFolder> findFirstByOwnerMemberIdAndFolderType(Long ownerMemberId, FolderType folderType);

    // 루트에 같은 이름 폴더가 이미 있는지 조회 (흡수(absorb) 처리에 사용)
    Optional<MemberFolder> findFirstByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(Long ownerMemberId, String folderName);
}
