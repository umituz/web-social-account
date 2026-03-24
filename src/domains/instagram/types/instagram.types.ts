/**
 * Instagram-specific types
 */

export interface InstagramUser {
  id: string;
  username: string;
  account_type?: "MEDIA_CREATOR" | "BUSINESS" | "PERSONAL";
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
  biography?: string;
  profile_picture_url?: string;
  website?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO";
  media_url: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
}

export interface InstagramContainer {
  id: string;
  status: "FINISHED" | "ERROR" | "IN_PROGRESS" | "EXPIRED";
}

export interface InstagramPublishResponse {
  id: string;
  status: "FINISHED" | "ERROR" | "IN_PROGRESS";
}

export interface InstagramError {
  error: {
    type: string;
    message: string;
    code: number;
    error_subcode?: number;
  };
}
