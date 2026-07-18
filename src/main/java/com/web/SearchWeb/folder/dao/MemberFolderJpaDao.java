package com.web.SearchWeb.folder.dao;

import com.web.SearchWeb.folder.domain.FolderType;
import com.web.SearchWeb.folder.domain.MemberFolder;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberFolderJpaDao extends JpaRepository<MemberFolder, Long> {

    /**
     * PostgreSQL Advisory Lock을 활용하여 특정 회원의 폴더 생성 네임스페이스를 잠급니다.
     * 동시성 환경에서 동일한 이름의 폴더가 중복 생성되는 현상을 차단합니다.
     */
    @Query(
        value = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(CAST(:ownerMemberId AS bigint))) AS folder_lock",
        nativeQuery = true
    )
    Integer lockRootFolderNamespace(@Param("ownerMemberId") Long ownerMemberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from MemberFolder f where f.memberFolderId = :id")
    Optional<MemberFolder> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from MemberFolder f where f.ownerMemberId = :ownerMemberId and f.parentFolderId = :parentFolderId")
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderIdForUpdate(
        @Param("ownerMemberId") Long ownerMemberId,
        @Param("parentFolderId") Long parentFolderId
    );

    // 루트 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderIdIsNull(Long ownerMemberId);

    // 직계 하위 폴더
    List<MemberFolder> findAllByOwnerMemberIdAndParentFolderId(Long ownerMemberId, Long parentFolderId);

    // 사용자 전체 폴더
    List<MemberFolder> findAllByOwnerMemberId(Long ownerMemberId);

    boolean existsByParentFolderId(Long parentFolderId);

    boolean existsByOwnerMemberIdAndParentFolderIdAndFolderName(Long ownerMemberId, Long parentFolderId, String normalizedFolderName);


    boolean existsByOwnerMemberIdAndFolderType(Long ownerMemberId, FolderType folderType);
    
    // 시스템 폴더(UNORGANIZED) 조회 — 한 사용자당 최대 1개 (partial unique index 로 보장)
    Optional<MemberFolder> findFirstByOwnerMemberIdAndFolderType(Long ownerMemberId, FolderType folderType);

    // 루트에 같은 이름 폴더가 이미 있는지 조회 (흡수(absorb) 처리에 사용)
    Optional<MemberFolder> findFirstByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(Long ownerMemberId, String normalizedFolderName);

    // 대소문자 구분 없이 특정 회원의 활성화된(삭제되지 않은) 루트 폴더를 조회합니다.
    Optional<MemberFolder> findFirstByOwnerMemberIdAndParentFolderIdIsNullAndFolderNameIgnoreCaseAndDeletedAtIsNull(
        Long ownerMemberId,
        String normalizedFolderName
    );

    // 현재 폴더를 제외하고 대소문자 구분 없이 활성 루트 폴더 이름 중복 여부를 확인합니다.
    @Query("""
        select case when count(f) > 0 then true else false end
        from MemberFolder f
        where f.ownerMemberId = :ownerMemberId
          and f.parentFolderId is null
          and lower(f.folderName) = lower(:folderName)
          and f.deletedAt is null
          and f.memberFolderId <> :excludedMemberFolderId
        """)
    boolean existsActiveRootFolderNameIgnoreCaseExcludingId(
        @Param("ownerMemberId") Long ownerMemberId,
        @Param("folderName") String normalizedFolderName,
        @Param("excludedMemberFolderId") Long excludedMemberFolderId
    );
}
