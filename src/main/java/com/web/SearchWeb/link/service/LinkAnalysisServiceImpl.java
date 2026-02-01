package com.web.SearchWeb.link.service;

import com.web.SearchWeb.folder.dao.FolderDao;
import com.web.SearchWeb.folder.domain.Folder;
import com.web.SearchWeb.folder.dto.request.FolderSearchRequestDto;
import com.web.SearchWeb.link.dto.CategoryResult;
import com.web.SearchWeb.link.dto.LinkAnalysisResponse;
import com.web.SearchWeb.link.dto.LinkMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 링크 분석 서비스 구현체
 * URL을 분석하여 메타데이터 추출, 카테고리 분류, 해시태그 생성을 수행
 */
@Service
@RequiredArgsConstructor
public class LinkAnalysisServiceImpl implements LinkAnalysisService {

    private final LinkMetadataExtractor metadataExtractor;
    private final CategoryClassifier categoryClassifier;
    private final HashtagGenerator hashtagGenerator;
    private final FolderDao folderDao;

    @Override
    public LinkAnalysisResponse analyzeLink(String url, int memberId) {
        // 1. URL 메타데이터 추출
        LinkMetadata metadata = metadataExtractor.extract(url);

        // 2. 사용자의 기존 폴더 목록 조회
        FolderSearchRequestDto searchRequest = FolderSearchRequestDto.builder()
                .memberId(memberId)
                .build();
                
        List<Folder> userFolders = folderDao.selectFolderList(searchRequest);

        // 3. 카테고리 분류
        CategoryResult categoryResult = categoryClassifier.classify(metadata, userFolders);

        // 4. 해시태그 생성
        List<String> hashtags = hashtagGenerator.generate(metadata);

        // 5. 결과 조합
        return LinkAnalysisResponse.builder()
                .metadata(metadata)
                .suggestedCategory(categoryResult.getCategory())
                .suggestedFolderId(categoryResult.getFolderId())
                .suggestedHashtags(hashtags)
                .confidence(categoryResult.getConfidence())
                .build();
    }
}
