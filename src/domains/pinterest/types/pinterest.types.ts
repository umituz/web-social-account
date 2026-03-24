/**
 * Pinterest-specific types
 */

export interface PinterestUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_image: string;
  website_url?: string;
  account_type: "OTHER" | "BUSINESS" | "RESTRICTED";
  follower_count: number;
  following_count: number;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
  url: string;
  pin_count: number;
}

export interface PinterestPin {
  id: string;
  link?: string;
  title?: string;
  description?: string;
  dominant_color?: string;
  alt_text?: string;
  board_id: string;
  media: {
    type: "image" | "video";
    images: {
      "150x150": { url: string; width: number; height: number };
      "236x": { url: string; width: number; height: number };
      "474x": { url: string; width: number; height: number };
      original: { url: string; width: number; height: number };
    };
  };
}

export interface PinterestCreatePinResponse {
  id: string;
  url: string;
}

export interface PinterestError {
  code: number;
  message: string;
}
export interface pinterestError {
  error: string | { message: string; code?: number };
}
