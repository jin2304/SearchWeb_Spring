package com.web.SearchWeb.folder.dto.response;

import com.web.SearchWeb.folder.domain.Folder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderResponseDto {
    private int folderId;
    private String name;
    private String tag;
    private String created_date;
    private String modified_date;

    /**
     * Folder Entity -> FolderResponseDto 변환 메서드
     */
    public static FolderResponseDto from(Folder folder) {
        if (folder == null) {
            return null;
        }
        return FolderResponseDto.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .tag(folder.getTag())
                .created_date(folder.getCreated_date())
                .modified_date(folder.getModified_date())
                .build();
    }

    /**
     * Folder Entity List -> FolderResponseDto List 변환 메서드
     */
    public static List<FolderResponseDto> fromList(List<Folder> folders) {
        if (folders == null) {
            return null;
        }
        return folders.stream()
                .map(FolderResponseDto::from)
                .collect(Collectors.toList());
    }
}

