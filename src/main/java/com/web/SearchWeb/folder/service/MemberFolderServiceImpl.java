package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.folder.dao.MemberFolderJpaDao;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.error.FolderException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberFolderServiceImpl implements MemberFolderService {

    private final MemberFolderJpaDao memberFolderJpaRepository;

    @Override
    @Transactional
    public Long create(Long ownerMemberId, Long parentFolderId, String folderName, String description) {
        validateFolderName(folderName);

        MemberFolder folder = MemberFolder.builder()
            .ownerMemberId(ownerMemberId)
            .parentFolderId(parentFolderId)
            .folderName(folderName)
            .description(description)
            .build();

        return memberFolderJpaRepository.save(folder).getMemberFolderId();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberFolder get(Long memberFolderId) {
        return memberFolderJpaRepository.findById(memberFolderId)
            .orElseThrow(FolderException.NotFound::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberFolder> listRootFolders(Long ownerMemberId) {
        return memberFolderJpaRepository.findAllByOwnerMemberIdAndParentFolderIdIsNull(ownerMemberId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberFolder> listChildren(Long ownerMemberId, Long parentFolderId) {
        return memberFolderJpaRepository.findAllByOwnerMemberIdAndParentFolderId(ownerMemberId, parentFolderId);
    }

    @Override
    @Transactional
    public void update(Long memberFolderId, String folderName, String description) {
        validateFolderName(folderName);

        MemberFolder folder = memberFolderJpaRepository.findById(memberFolderId)
            .orElseThrow(FolderException.NotFound::new);

        folder.changeInfo(folderName,description);
        // TODO : 수정 로직 좀 더 생각해보기
    }

    @Override
    @Transactional
    public void move(Long memberFolderId, Long newParentFolderId) {
        MemberFolder folder = memberFolderJpaRepository.findById(memberFolderId)
            .orElseThrow(FolderException.NotFound::new);
        folder.changeParent(newParentFolderId);
    }

    @Override
    @Transactional
    public void delete(Long memberFolderId) {
        if (!memberFolderJpaRepository.existsById(memberFolderId)) {
            return; // 멱등 삭제
        }
        memberFolderJpaRepository.deleteById(memberFolderId);
    }

    private void validateFolderName(String folderName) {
        if (folderName == null || folderName.isBlank()) {
            throw new IllegalArgumentException("folderName must not be blank");
        }

    }
}