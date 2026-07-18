package com.web.SearchWeb.bookmark.service.command;

import com.web.SearchWeb.bookmark.error.BookmarkErrorCode;
import com.web.SearchWeb.bookmark.error.BookmarkException;
import java.util.Locale;

/**
 * 북마크 저장 요청 시 대상 폴더의 처리 방식을 정의하고 검증하는 도메인 Value Object(VO).
 */
public record BookmarkFolderTarget(Type type, Long memberFolderId, String folderName) {

    private static final int MAX_FOLDER_NAME_LENGTH = 50;


    /**
     * 폴더 처리 유형 정의
     */
    public enum Type {
        EXISTING,          // 기존에 존재하는 폴더 사용
        CREATE_IF_ABSENT,  // 대소문자 무시 동일한 폴더가 없으면 새로 생성 후 사용
        UNORGANIZED        // 사용자의 '미분류' 시스템 폴더 사용
    }


    // 컴팩트 생성자를 사용하여 폴더 생성/지정 유형별 데이터 정합성을 검증.
    public BookmarkFolderTarget {
        if (type == null) {
            throw invalidTarget();
        }

        switch (type) {
            case EXISTING -> {
                // 기존 폴더 지정 시: 폴더 ID는 필수이며 0보다 커야 하고, 새 폴더 이름은 없어야 한다.
                if (memberFolderId == null || memberFolderId <= 0 || folderName != null) {
                    throw invalidTarget();
                }
            }
            case CREATE_IF_ABSENT -> {
                // 신규 폴더 생성 시: 폴더 ID는 없어야 하며, 생성할 폴더 이름은 필수입니다. (최대 50자 제한)
                if (memberFolderId != null || folderName == null) {
                    throw invalidTarget();
                }
                folderName = folderName.trim();
                if (folderName.isEmpty() || folderName.length() > MAX_FOLDER_NAME_LENGTH) {
                    throw invalidTarget();
                }
            }
            case UNORGANIZED -> {
                // 미분류 폴더 저장 시: 폴더 ID와 폴더 이름 모두 존재하지 않아야 합니다.
                if (memberFolderId != null || folderName != null) {
                    throw invalidTarget();
                }
            }
        }
    }


    /**
     * 문자열 파라미터 기반 팩토리 메서드
     */
    public static BookmarkFolderTarget from(String rawType, Long memberFolderId, String folderName) {
        Type type = parseType(rawType);
        return new BookmarkFolderTarget(type, memberFolderId, folderName);
    }



    
    // =========================================================================
    // 내부 헬퍼 메서드 (Helper Methods)
    // =========================================================================
    private static Type parseType(String rawType) {
        if (rawType == null || rawType.isBlank()) {
            throw invalidTarget();
        }

        try {
            // 앞뒤 공백을 제거하고, 서버 국가 설정(Locale)에 상관없이 안전하게 대문자로 변경하여 Enum을 찾아서 반환
            return Type.valueOf(rawType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw invalidTarget();
        }
    }

    private static BookmarkException invalidTarget() {
        return BookmarkException.of(BookmarkErrorCode.INVALID_FOLDER_TARGET);
    }
}
