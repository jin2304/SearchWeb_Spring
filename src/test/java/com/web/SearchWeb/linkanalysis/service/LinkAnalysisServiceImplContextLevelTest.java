package com.web.SearchWeb.linkanalysis.service;

import com.web.SearchWeb.folder.domain.FolderType;
import com.web.SearchWeb.folder.domain.MemberFolder;
import com.web.SearchWeb.linkanalysis.domain.LinkAnalysisContextLevel;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.LongStream;

import static org.assertj.core.api.Assertions.assertThat;

class LinkAnalysisServiceImplContextLevelTest {

    private final LinkAnalysisServiceImpl service = new LinkAnalysisServiceImpl(null, null, null, null, null, null);

    @Test
    void determinesLowContextWhenCustomFoldersAreBelowThreshold() {
        LinkAnalysisContextLevel level = determineContextLevel(customFolders(6));

        assertThat(level).isEqualTo(LinkAnalysisContextLevel.LOW_CONTEXT);
    }

    @Test
    void ignoresUnorganizedFolderWhenDeterminingContextLevel() {
        List<MemberFolder> folders = new ArrayList<>(customFolders(6));
        folders.add(unorganizedFolder());

        LinkAnalysisContextLevel level = determineContextLevel(folders);

        assertThat(level).isEqualTo(LinkAnalysisContextLevel.LOW_CONTEXT);
    }

    @Test
    void determinesHighContextWhenCustomFoldersMeetThreshold() {
        LinkAnalysisContextLevel level = determineContextLevel(customFolders(7));

        assertThat(level).isEqualTo(LinkAnalysisContextLevel.HIGH_CONTEXT);
    }

    private LinkAnalysisContextLevel determineContextLevel(List<MemberFolder> folders) {
        return (LinkAnalysisContextLevel) ReflectionTestUtils.invokeMethod(
                service,
                "determineContextLevel",
                folders
        );
    }

    private List<MemberFolder> customFolders(int count) {
        return LongStream.rangeClosed(1, count)
                .<MemberFolder>mapToObj(id -> MemberFolder.builder()
                        .memberFolderId(id)
                        .folderName("폴더" + id)
                        .folderType(FolderType.CUSTOM)
                        .build())
                .toList();
    }

    private MemberFolder unorganizedFolder() {
        return MemberFolder.builder()
                .memberFolderId(100L)
                .folderName("미분류")
                .folderType(FolderType.UNORGANIZED)
                .build();
    }
}
