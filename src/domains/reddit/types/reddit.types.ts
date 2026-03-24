/**
 * Reddit-specific types
 */

export interface RedditUser {
  id: string;
  name: string;
  link_karma: number;
  comment_karma: number;
  created: number;
  subreddit?: {
    title: string;
    public_description: string;
    subscribers: number;
  };
}

export interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  author: string;
  subreddit: string;
  permalink: string;
  url?: string;
  created: number;
  ups: number;
  num_comments: number;
  is_self: boolean;
}

export interface RedditSubreddit {
  id: string;
  display_name: string;
  title: string;
  public_description: string;
  subscribers: number;
  over18: boolean;
}

export interface RedditSubmitResponse {
  json: {
    data: {
      url: string;
      name: string;
      id: string;
    };
  };
}

export interface RedditError {
  error: number;
  message: string;
}
export interface redditError {
  error: string | { message: string; code?: number };
}

/**
 * Reddit OAuth/API Error
 */
export class RedditError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'RedditError';
  }
}
