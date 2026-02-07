BEGIN;

-- =========================
-- DROP TABLES (의존성 고려 → CASCADE)
-- =========================

DROP TABLE IF EXISTS
    member_saved_link_tag,
    link_enrichment_feedback,
    member_saved_link,
    link_enrichment_keyword,
    folder_suggestion_rule,
    member_folder_tag,
    oauth_member,
    link_enrichment,
    team_saved_link_tag,
    team_saved_link,
    team_member,
    team_folder_permission,
    team_folder,
    team_tag,
    team,
    member_tag,
    member_folder,
    link,
    category_master,
    likes,
    comment,
    board,
    website,
    member
CASCADE;

-- =========================
-- DROP INDEXES (혹시 남아있을 경우 대비)
-- =========================

DROP INDEX IF EXISTS
    uq_category_child_name,
    uq_category_root_name,
    idx_category_parent,
    idx_category_name,
    idx_category_level,
    idx_category_active,
    idx_category_deleted_at,

    idx_link_domain,
    idx_link_title,
    idx_link_content_type,
    idx_link_primary_category,
    idx_link_categorized_at,
    idx_link_created_at,
    idx_link_deleted_at,

    idx_member_status,
    idx_member_created_at,
    idx_member_deleted_at,

    idx_member_folder_owner,
    idx_member_folder_parent,
    uq_member_folder_parent_name,
    idx_member_folder_name,
    idx_member_folder_created,
    idx_member_folder_deleted,

    idx_member_tag_owner,
    idx_member_tag_deleted_at,

    idx_team_name,
    idx_team_owner,
    idx_team_deleted,

    idx_team_folder_team,
    idx_team_folder_parent,
    uq_team_folder_parent_name,
    idx_team_folder_name,
    idx_team_folder_created_by,
    idx_team_folder_created,
    idx_team_folder_deleted,

    idx_tfp_team_folder,
    idx_tfp_user,
    idx_tfp_permission,

    idx_team_member_team,
    idx_team_member_user,
    idx_team_member_role,

    idx_team_saved_link_folder,
    uq_team_saved_link_folder_link,
    idx_team_saved_link_link,
    idx_team_saved_link_created_by,
    idx_team_saved_link_title,
    idx_team_saved_link_primary_category,
    idx_team_saved_link_categorized_at,
    idx_team_saved_link_folder_sort,
    idx_team_saved_link_created_at,
    idx_team_saved_link_deleted_at,

    idx_team_saved_link_tag_item,
    idx_team_saved_link_tag_tag,

    idx_team_tag_team,

    idx_link_enrichment_deleted_at,

    idx_oauth_member_member_id,
    idx_oauth_member_provider,
    idx_oauth_member_deleted_at,

    idx_member_folder_tag_item,
    idx_member_folder_tag_tag,

    uq_fsr_member_owner_category,
    uq_fsr_team_category,
    idx_fsr_scope,
    uq_fsr_scope_owner_team_category_active,
    idx_fsr_owner,
    idx_fsr_team,
    idx_fsr_category,
    idx_fsr_member_folder,
    idx_fsr_team_folder,
    idx_fsr_priority,
    idx_fsr_active,
    idx_folder_suggestion_rule_deleted_at,

    idx_link_enrich_kw_enrichment,
    idx_link_enrich_kw_keyword,
    idx_link_enrich_kw_created_at,

    uq_member_saved_link_folder_link,
    idx_member_saved_link_link,
    idx_member_saved_link_enrichment,
    idx_member_saved_link_folder,
    idx_member_saved_link_title,
    idx_member_saved_link_primary_category,
    idx_member_saved_link_created_at,
    idx_member_saved_link_deleted_at,

    idx_member_saved_link_tag_item,
    idx_member_saved_link_tag_tag,

    idx_website_url,
    idx_website_category,
    idx_board_member,
    idx_board_title,
    idx_board_created_date,
    idx_comment_board,
    idx_comment_member,
    idx_likes_board,
    idx_likes_member
CASCADE;

COMMIT;
