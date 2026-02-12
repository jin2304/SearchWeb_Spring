package com.web.SearchWeb.folder.controller.dto;

public class MemberFolderRequests {

    /**
     * 폴더 생성 요청
     */
    public static class Create {
        public Long ownerMemberId;
        public Long parentFolderId; // null이면 루트
        public String folderName;
        public String description;
    }

    /**
     * 폴더 수정 요청
     */
    public static class Update {
        public String folderName;
        public String description;
    }

    /**
     * 폴더 이동 요청
     */
    public static class Move {
        public Long newParentFolderId; // null이면 루트로 이동
    }
}
