package com.web.SearchWeb.tag.service;

import com.web.SearchWeb.tag.dao.MemberTagJpaDao;
import com.web.SearchWeb.tag.domain.MemberTag;
import com.web.SearchWeb.tag.error.TagException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberTagServiceImpl implements MemberTagService {

    private final MemberTagJpaDao memberTagJpaDao;

    @Override
    @Transactional
    public Long create(Long ownerMemberId, String tagName) {
        validateTagName(tagName);

        if (memberTagJpaDao.existsByOwnerMemberIdAndTagName(ownerMemberId, tagName)) {
            throw new IllegalArgumentException("Tag already exists.");
        }

        MemberTag tag = MemberTag.builder()
            .ownerMemberId(ownerMemberId)
            .tagName(tagName)
            .build();

        return memberTagJpaDao.save(tag).getMemberTagId();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberTag get(Long memberTagId) {
        return memberTagJpaDao.findById(memberTagId)
            .orElseThrow(TagException.NotFound::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberTag> listByOwner(Long ownerMemberId) {
        return memberTagJpaDao.findAllByOwnerMemberId(ownerMemberId);
    }

    @Override
    @Transactional
    public void update(Long memberTagId, String tagName) {
        validateTagName(tagName);

        MemberTag tag = memberTagJpaDao.findById(memberTagId)
            .orElseThrow(TagException.NotFound::new);

        tag.changeName(tagName);
    }

    @Override
    @Transactional
    public void delete(Long memberTagId) {
        if (!memberTagJpaDao.existsById(memberTagId)) {
            return;
        }
        memberTagJpaDao.deleteById(memberTagId);
    }

    private void validateTagName(String tagName) {
        if (tagName == null || tagName.isBlank()) {
            throw new IllegalArgumentException("tagName must not be blank");
        }
    }
}
