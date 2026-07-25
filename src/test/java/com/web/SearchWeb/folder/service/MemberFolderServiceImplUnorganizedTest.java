package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.folder.dao.MemberFolderJpaDao;
import com.web.SearchWeb.folder.domain.FolderType;
import com.web.SearchWeb.folder.domain.MemberFolder;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberFolderServiceImplUnorganizedTest {

    @Mock
    private MemberFolderJpaDao memberFolderJpaRepository;

    @Mock
    private BookmarkDao bookmarkDao;

    private MemberFolderServiceImpl memberFolderService;

    @BeforeEach
    void setUp() {
        memberFolderService = new MemberFolderServiceImpl(memberFolderJpaRepository, bookmarkDao);
    }

    @Test
    void locksMemberFolderNamespaceBeforeCheckingForExistingFolder() {
        Long memberId = 1L;
        MemberFolder existingFolder = MemberFolder.builder()
            .memberFolderId(10L)
            .ownerMemberId(memberId)
            .folderName("미분류")
            .folderType(FolderType.UNORGANIZED)
            .build();

        when(memberFolderJpaRepository.findFirstByOwnerMemberIdAndFolderType(
            memberId,
            FolderType.UNORGANIZED
        )).thenReturn(Optional.of(existingFolder));

        Long result = memberFolderService.getOrCreateUnorganizedFolderId(memberId);

        assertThat(result).isEqualTo(existingFolder.getMemberFolderId());
        InOrder inOrder = inOrder(memberFolderJpaRepository);
        inOrder.verify(memberFolderJpaRepository).lockRootFolderNamespace(memberId);
        inOrder.verify(memberFolderJpaRepository)
            .findFirstByOwnerMemberIdAndFolderType(memberId, FolderType.UNORGANIZED);
        verify(memberFolderJpaRepository, never()).save(any(MemberFolder.class));
    }

    @Test
    void createsUnorganizedFolderAfterLockedRecheckFindsNothing() {
        Long memberId = 1L;
        MemberFolder savedFolder = MemberFolder.builder()
            .memberFolderId(20L)
            .ownerMemberId(memberId)
            .folderName("미분류")
            .folderType(FolderType.UNORGANIZED)
            .build();

        when(memberFolderJpaRepository.findFirstByOwnerMemberIdAndFolderType(
            memberId,
            FolderType.UNORGANIZED
        )).thenReturn(Optional.empty());
        when(memberFolderJpaRepository
            .findFirstByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(memberId, "미분류"))
            .thenReturn(Optional.empty());
        when(memberFolderJpaRepository.save(any(MemberFolder.class))).thenReturn(savedFolder);

        Long result = memberFolderService.getOrCreateUnorganizedFolderId(memberId);

        assertThat(result).isEqualTo(savedFolder.getMemberFolderId());
        InOrder inOrder = inOrder(memberFolderJpaRepository);
        inOrder.verify(memberFolderJpaRepository).lockRootFolderNamespace(memberId);
        inOrder.verify(memberFolderJpaRepository)
            .findFirstByOwnerMemberIdAndFolderType(memberId, FolderType.UNORGANIZED);
        inOrder.verify(memberFolderJpaRepository)
            .findFirstByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(memberId, "미분류");
        inOrder.verify(memberFolderJpaRepository).save(any(MemberFolder.class));
    }
}
