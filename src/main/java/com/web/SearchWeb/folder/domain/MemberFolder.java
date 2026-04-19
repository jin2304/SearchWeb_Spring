package com.web.SearchWeb.folder.domain;

import com.web.SearchWeb.folder.error.FolderErrorCode;
import com.web.SearchWeb.folder.error.FolderException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "member_folder")
public class MemberFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_folder_id")
    private Long memberFolderId;
    @Column(name = "owner_member_id", nullable = false)
    private Long ownerMemberId;
    @Column(name = "parent_folder_id")
    private Long parentFolderId;
    @Column(name = "folder_name", nullable = false, length = 100)
    private String folderName;
    @Column(name = "description", length = 500)
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(name = "folder_type", nullable = false, length = 20)
    @Builder.Default
    private FolderType folderType = FolderType.CUSTOM;

    public boolean isUnorganized() {
        return FolderType.UNORGANIZED.equals(this.folderType);
    }

    /** 기존 폴더를 시스템 폴더(UNORGANIZED)로 마킹. 이름 충돌 흡수(absorb) 경로에서 사용. */
    public void markAsUnorganized() {
        this.folderType = FolderType.UNORGANIZED;
    }

    public void changeInfo(String folderName, String description) {
        if (folderName == null || folderName.isBlank()) {
            throw new IllegalArgumentException("folderName must not be blank");
        }
        this.folderName = folderName;
        this.description = description;
    }

    public void changeParent(Long newParentFolderId) {
        if (isUnorganized()) {
            throw new FolderException(FolderErrorCode.SYSTEM_FOLDER_IMMUTABLE);
        }
        this.parentFolderId = newParentFolderId;
    }
}
