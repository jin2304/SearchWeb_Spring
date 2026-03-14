package com.web.SearchWeb.folder.service;

import com.web.SearchWeb.bookmark.dao.BookmarkDao;
import com.web.SearchWeb.folder.dao.MemberFolderJpaDao;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.folder.error.FolderErrorCode;
import com.web.SearchWeb.folder.error.FolderException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberFolderServiceImpl implements MemberFolderService {

    private final MemberFolderJpaDao memberFolderJpaRepository;
    private final BookmarkDao bookmarkDao;

    @Override
    @Transactional
    public Long create(Long loginId, Long parentFolderId, String folderName, String description) {
        String normalizedFolderName = normalizeFolderName(folderName);
        String normalizedDescription = normalizeDescription(description);

        // 1. 부모 폴더가 있는 경우 검증
        if (parentFolderId != null) {
            MemberFolder parentFolder = memberFolderJpaRepository
                .findById(parentFolderId)
                .orElseThrow(() -> new FolderException(FolderErrorCode.FOLDER_NOT_FOUND));

            // 2. 부모 폴더 소유자 검증
            if (!parentFolder.getOwnerMemberId().equals(loginId)) {
                throw new FolderException(FolderErrorCode.FOLDER_FORBIDDEN);
            }

            // 3. 같은 부모 아래 동일 이름 폴더 중복 검증
            boolean exists = memberFolderJpaRepository
                .existsByOwnerMemberIdAndParentFolderIdAndFolderName(
                    loginId, parentFolderId, normalizedFolderName
                );

            if (exists) {
                throw new FolderException(FolderErrorCode.DUPLICATE_FOLDER_NAME);
            }
        } else {
            // 4. 루트 폴더일 때 동일 이름 중복 검증
            boolean exists = memberFolderJpaRepository
                .existsByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(
                    loginId, normalizedFolderName
                );

            if (exists) {
                throw new FolderException(FolderErrorCode.DUPLICATE_FOLDER_NAME);
            }
        }

        MemberFolder folder = MemberFolder.builder()
            .ownerMemberId(loginId)
            .parentFolderId(parentFolderId)
            .folderName(normalizedFolderName)
            .description(normalizedDescription)
            .build();

        return memberFolderJpaRepository.save(folder).getMemberFolderId();
    }

    private String normalizeFolderName(String folderName) {
        if (folderName == null) {
            throw new FolderException(FolderErrorCode.INVALID_FOLDER_NAME);
        }

        String normalizedFolderName = folderName.trim();
        if (normalizedFolderName.isEmpty() || normalizedFolderName.length() > 50) {
            throw new FolderException(FolderErrorCode.INVALID_FOLDER_NAME);
        }
        return normalizedFolderName;
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String normalizedDescription = description.trim();
        if (normalizedDescription.isEmpty()) {
            return null;
        }

        return normalizedDescription;
    }

    @Override
    @Transactional(readOnly = true)
    public MemberFolder get(Long loginId, Long memberFolderId) {
        return getOwnedFolder(loginId, memberFolderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberFolder> listRootFolders(Long loginId, Long ownerMemberId) {
        validateOwner(loginId, ownerMemberId);
        return memberFolderJpaRepository.findAllByOwnerMemberIdAndParentFolderIdIsNull(ownerMemberId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberFolder> listChildren(Long loginId, Long ownerMemberId, Long parentFolderId) {
        validateOwner(loginId, ownerMemberId);
        MemberFolder parentFolder = getOwnedFolder(loginId, parentFolderId);
        if (!parentFolder.getOwnerMemberId().equals(ownerMemberId)) {
            throw new FolderException(FolderErrorCode.FOLDER_FORBIDDEN);
        }
        return memberFolderJpaRepository.findAllByOwnerMemberIdAndParentFolderId(ownerMemberId, parentFolderId);
    }

    @Override
    @Transactional
    public void update(Long loginId, Long memberFolderId, String folderName, String description) {
        MemberFolder folder = getOwnedFolder(loginId, memberFolderId);

        String resolvedFolderName = folderName == null
            ? folder.getFolderName()
            : normalizeFolderName(folderName);
        String resolvedDescription = description == null
            ? folder.getDescription()
            : normalizeDescription(description);

        if (!folder.getFolderName().equals(resolvedFolderName)) {
            boolean exists = folder.getParentFolderId() == null
                ? memberFolderJpaRepository.existsByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(
                    folder.getOwnerMemberId(),
                    resolvedFolderName
                )
                : memberFolderJpaRepository.existsByOwnerMemberIdAndParentFolderIdAndFolderName(
                    folder.getOwnerMemberId(),
                    folder.getParentFolderId(),
                    resolvedFolderName
                );

            if (exists) {
                throw new FolderException(FolderErrorCode.DUPLICATE_FOLDER_NAME);
            }
        }

        folder.changeInfo(resolvedFolderName, resolvedDescription);
    }

    @Override
    @Transactional
    public void move(Long loginId, Long memberFolderId, Long newParentFolderId) {
        MemberFolder folder = getOwnedFolder(loginId, memberFolderId);

        if ((folder.getParentFolderId() == null && newParentFolderId == null)
            || (folder.getParentFolderId() != null && folder.getParentFolderId().equals(newParentFolderId))) {
            return;
        }

        if (newParentFolderId != null) {
            if (memberFolderId.equals(newParentFolderId)) {
                throw new FolderException(FolderErrorCode.INVALID_FOLDER_MOVE);
            }

            MemberFolder newParentFolder = getOwnedFolder(loginId, newParentFolderId);

            if (!newParentFolder.getOwnerMemberId().equals(folder.getOwnerMemberId())) {
                throw new FolderException(FolderErrorCode.FOLDER_FORBIDDEN);
            }

            validateNoCycle(folder.getMemberFolderId(), newParentFolder);

            boolean exists = memberFolderJpaRepository.existsByOwnerMemberIdAndParentFolderIdAndFolderName(
                folder.getOwnerMemberId(),
                newParentFolderId,
                folder.getFolderName()
            );
            if (exists) {
                throw new FolderException(FolderErrorCode.DUPLICATE_FOLDER_NAME);
            }
        } else {
            boolean exists = memberFolderJpaRepository.existsByOwnerMemberIdAndParentFolderIdIsNullAndFolderName(
                folder.getOwnerMemberId(),
                folder.getFolderName()
            );
            if (exists) {
                throw new FolderException(FolderErrorCode.DUPLICATE_FOLDER_NAME);
            }
        }

        folder.changeParent(newParentFolderId);
    }

    @Override
    @Transactional
    public void delete(Long loginId, Long memberFolderId) {
        getOwnedFolder(loginId, memberFolderId);

        if (memberFolderJpaRepository.existsByParentFolderId(memberFolderId)
            || bookmarkDao.existsActiveBookmarkInFolder(memberFolderId)) {
            throw new FolderException(FolderErrorCode.FOLDER_NOT_EMPTY);
        }

        memberFolderJpaRepository.deleteById(memberFolderId);
    }

    private MemberFolder getOwnedFolder(Long loginId, Long memberFolderId) {
        MemberFolder folder = memberFolderJpaRepository.findById(memberFolderId)
            .orElseThrow(() -> new FolderException(FolderErrorCode.FOLDER_NOT_FOUND));

        validateOwner(loginId, folder.getOwnerMemberId());
        return folder;
    }

    private void validateOwner(Long loginId, Long ownerMemberId) {
        if (!ownerMemberId.equals(loginId)) {
            throw new FolderException(FolderErrorCode.FOLDER_FORBIDDEN);
        }
    }

    private void validateNoCycle(Long folderId, MemberFolder parentFolder) {
        MemberFolder current = parentFolder;
        while (current != null) {
            if (current.getMemberFolderId().equals(folderId)) {
                throw new FolderException(FolderErrorCode.INVALID_FOLDER_MOVE);
            }

            Long nextParentId = current.getParentFolderId();
            if (nextParentId == null) {
                return;
            }

            current = memberFolderJpaRepository.findById(nextParentId)
                .orElseThrow(() -> new FolderException(FolderErrorCode.FOLDER_NOT_FOUND));
        }
    }
}
