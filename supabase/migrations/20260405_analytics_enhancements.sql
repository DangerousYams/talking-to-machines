-- Analytics Enhancements: paid/free segmentation, paywall tracking
-- Run against your Supabase project via the SQL editor or CLI.

-- 1. Add is_paid flag to analytics tables for paid/free segmentation
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS is_paid boolean;
ALTER TABLE scroll_depth ADD COLUMN IF NOT EXISTS is_paid boolean;
ALTER TABLE widget_interactions ADD COLUMN IF NOT EXISTS is_paid boolean;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS is_paid boolean;

-- 2. Index for efficient paid/free filtering
CREATE INDEX IF NOT EXISTS idx_page_views_is_paid ON page_views(is_paid);
CREATE INDEX IF NOT EXISTS idx_scroll_depth_is_paid ON scroll_depth(is_paid);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_is_paid ON widget_interactions(is_paid);

-- 3. Index scroll_depth by session for cross-chapter funnel queries
CREATE INDEX IF NOT EXISTS idx_scroll_depth_session ON scroll_depth(session_id);

-- 4. Index widget_interactions by session+chapter for correlation queries
CREATE INDEX IF NOT EXISTS idx_widget_interactions_session ON widget_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_widget_interactions_chapter ON widget_interactions(chapter_slug);
