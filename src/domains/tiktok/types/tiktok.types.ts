/**
 * TikTok-specific types
 */

export interface TikTokUser {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  display_name?: string;
  bio_description?: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

export interface TikTokVideo {
  id: string;
  video_description?: string;
  video_url?: string;
  cover_image_url?: string;
  create_time: number;
  duration: number;
  width: number;
  height: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

export interface TikTokPublishResponse {
  data: {
    publish_id: string;
    video_id?: string;
  };
}

export interface TikTokError {
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}
export interface tiktokError {
  error: string | { message: string; code?: number };
}
