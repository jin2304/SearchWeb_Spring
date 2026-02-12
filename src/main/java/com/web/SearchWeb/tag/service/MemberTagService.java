package com.web.SearchWeb.tag.service;

import com.web.SearchWeb.tag.domain.MemberTag;
import java.util.List;

public interface MemberTagService {

    Long create(Long ownerMemberId, String tagName);

    MemberTag get(Long memberTagId);

    List<MemberTag> listByOwner(Long ownerMemberId);

    void update(Long memberTagId, String tagName);

    void delete(Long memberTagId);
}
