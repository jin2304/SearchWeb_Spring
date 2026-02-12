package com.web.SearchWeb.tag.dao;

import com.web.SearchWeb.tag.domain.MemberTag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberTagJpaDao extends JpaRepository<MemberTag, Long> {

    List<MemberTag> findAllByOwnerMemberId(Long ownerMemberId);

    Optional<MemberTag> findByOwnerMemberIdAndTagName(Long ownerMemberId, String tagName);

    boolean existsByOwnerMemberIdAndTagName(Long ownerMemberId, String tagName);
}
