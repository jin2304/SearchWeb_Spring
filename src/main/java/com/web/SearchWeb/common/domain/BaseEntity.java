package com.web.SearchWeb.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;

import java.io.Serializable;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * BaseEntity
 * - JPA & MyBatis Hybrid Support
 */
@Getter
@Setter
@ToString
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL") // JPA(Hibernate)에서만 적용
public abstract class BaseEntity implements Serializable {

    /* =======================
     * Audit Fields
     * ======================= */

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @CreatedBy
    @Column(name = "created_by_member_id", updatable = false)
    private Long createdByMemberId;

    @LastModifiedBy
    @Column(name = "updated_by_member_id")
    private Long updatedByMemberId;

    @Column(name = "deleted_by_member_id")
    private Long deletedByMemberId;

    
    /* =======================
     * Domain Behaviors
     * ======================= */

    /** Soft delete (logical delete) */
    public void softDelete(Long deletedByMemberId) {
        this.deletedAt = OffsetDateTime.now();
        this.deletedByMemberId = deletedByMemberId;
    }

    /** Set creation audit fields manually (MyBatis / 명시적 호출용) */
    public void markAsCreated(Long memberId, OffsetDateTime now) {
        this.createdAt = now;
        this.createdByMemberId = memberId;
    }

    /** Update audit fields manually (MyBatis / 명시적 호출용) */
    public void markAsUpdated(Long memberId, OffsetDateTime now) {
        this.updatedAt = now;
        this.updatedByMemberId = memberId;
    }

    /** Convenience method */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
