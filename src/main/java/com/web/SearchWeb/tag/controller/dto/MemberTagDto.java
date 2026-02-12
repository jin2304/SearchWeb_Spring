package com.web.SearchWeb.tag.controller.dto;

import com.web.SearchWeb.tag.domain.MemberTag;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class MemberTagDto {

    @Getter
    @NoArgsConstructor
    public static class CreateRequest {
        private Long ownerMemberId;
        private String tagName;
    }

    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        private String tagName;
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class Response {
        private Long tagId;
        private Long ownerMemberId;
        private String tagName;

        @Builder
        private Response(Long tagId, Long ownerMemberId, String tagName) {
            this.tagId = tagId;
            this.ownerMemberId = ownerMemberId;
            this.tagName = tagName;
        }

        public static Response from(MemberTag tag) {
            return Response.builder()
                .tagId(tag.getMemberTagId())
                .ownerMemberId(tag.getOwnerMemberId())
                .tagName(tag.getTagName())
                .build();
        }
    }
}
