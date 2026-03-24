/**
 * Threads-specific types
 */

export interface ThreadsUser {
  id: string;
  username: string;
  threads_username?: string;
  threads_profile_picture_url?: string;
  biography?: string;
}

export interface ThreadsPost {
  id: string;
  text: string;
  media_type: "TEXT_POST" | "IMAGE_POST" | "VIDEO_POST";
  permalink: string;
  timestamp: string;
  media?: {
    image_url?: string;
    video_url?: string;
  };
  quoted_post_id?: string;
  reply_post_id?: string;
}

export interface ThreadsContainer {
  id: string;
  status: "QUEUED" | "PUBLISHING" | "SUCCEEDED" | "FAILED";
}

export interface ThreadsMediaContainer {
  id: string;
  status: "EXPIRED" | "FINISHED" | "ERROR" | "IN_PROGRESS";
}

export interface ThreadsError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}
export interface threadsError {
  error: string | { message: string; code?: number };
}
