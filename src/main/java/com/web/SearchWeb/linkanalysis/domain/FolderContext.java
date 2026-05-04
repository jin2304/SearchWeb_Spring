package com.web.SearchWeb.linkanalysis.domain;

import lombok.Builder;
import lombok.Getter;

import java.sql.Array;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 폴더 컨텍스트 도메인 객체 (LLM 폴더 추천용)
 * - BookmarkDao.selectFolderContexts() 결과 행을 변환한 불변 DTO
 * - 폴더당 북마크 수, 최근 저장일, 샘플 제목 목록, 자주 쓰인 태그(빈도) 목록을 포함
 */
@Getter
@Builder
public class FolderContext {

    /** 폴더 ID */
    private final Long memberFolderId;

    /** 폴더명 */
    private final String folderName;

    /** 폴더 설명 (용도) */
    private final String description;

    /** 폴더 유형 ("CUSTOM" / "UNORGANIZED") */
    private final String folderType;

    /** 활성 북마크 개수 */
    private final long bookmarkCount;

    /** 최근 북마크 저장 일자 (UNORGANIZED 또는 빈 폴더는 null) */
    private final LocalDate lastCreatedAt;

    /** 샘플 북마크 제목 목록 (최신순 최대 sampleLimit개) */
    @Builder.Default
    private final List<String> sampleTitles = List.of();

    /** 폴더 안의 저장 링크에서 자주 쓰인 태그(빈도) 목록. 예: AI(12) */
    @Builder.Default
    private final List<String> topTags = List.of();


    /**
     * MyBatis가 반환한 Map row 한 건을 FolderContext로 변환한다.
     * - PostgreSQL ARRAY → java.sql.Array → List<String> 변환 처리
     * - timestamp → LocalDate 변환 처리
     */
    public static FolderContext fromRow(Map<String, Object> row) {
        return FolderContext.builder()
                .memberFolderId(toLong(row.get("memberFolderId")))
                .folderName(asString(row.get("folderName")))
                .description(asString(row.get("description")))
                .folderType(asString(row.get("folderType")))
                .bookmarkCount(toLong(row.get("bookmarkCount")))
                .lastCreatedAt(toLocalDate(row.get("lastCreatedAt")))
                .sampleTitles(toStringList(row.get("sampleTitles")))
                .topTags(toStringList(row.get("topTags")))
                .build();
    }


    private static String asString(Object value) {
        return value != null ? value.toString() : null;
    }

    private static long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private static LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate ld) return ld;
        if (value instanceof LocalDateTime ldt) return ldt.toLocalDate();
        if (value instanceof java.sql.Date sqlDate) return sqlDate.toLocalDate();
        if (value instanceof java.sql.Timestamp ts) return ts.toLocalDateTime().toLocalDate();
        if (value instanceof java.util.Date d) {
            return new java.sql.Timestamp(d.getTime()).toLocalDateTime().toLocalDate();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static List<String> toStringList(Object value) {
        if (value == null) return List.of();
        if (value instanceof List<?> list) {
            List<String> out = new ArrayList<>(list.size());
            for (Object o : list) {
                if (o != null) out.add(o.toString());
            }
            return Collections.unmodifiableList(out);
        }
        if (value instanceof Object[] arr) {
            List<String> out = new ArrayList<>(arr.length);
            for (Object o : arr) {
                if (o != null) out.add(o.toString());
            }
            return Collections.unmodifiableList(out);
        }
        if (value instanceof Array sqlArr) {
            try {
                Object inner = sqlArr.getArray();
                if (inner instanceof Object[] objArr) {
                    List<String> out = new ArrayList<>(objArr.length);
                    for (Object o : objArr) {
                        if (o != null) out.add(o.toString());
                    }
                    return Collections.unmodifiableList(out);
                }
            } catch (SQLException ignored) {
                // fall through to empty
            }
        }
        return List.of();
    }
}
