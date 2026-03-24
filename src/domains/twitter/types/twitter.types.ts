/**
 * Twitter-specific types
 */

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified?: boolean;
  created_at?: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

export interface TwitterMedia {
  media_key: string;
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
  height?: number;
  width?: number;
  duration_ms?: number;
}

export interface TwitterResponse<T> {
  data: T;
  includes?: {
    users?: TwitterUser[];
    media?: TwitterMedia[];
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface TwitterApiError {
  title: string;
  detail: string;
  type: string;
  status: number;
}
export interface twitterError {
  error: string | { message: string; code?: number };
}
