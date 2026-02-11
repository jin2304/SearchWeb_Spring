package com.web.SearchWeb.folder.domain;

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

    public void changeInfo(String folderName, String description) {
        if (folderName == null || folderName.isBlank()) {
            throw new IllegalArgumentException("folderName must not be blank");
        }
        this.folderName = folderName;
        this.description = description;
    }

    public void changeParent(Long newParentFolderId) {
        this.parentFolderId = newParentFolderId;
    }
}
