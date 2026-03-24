/**
 * Facebook-specific types
 */

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks: string[];
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookPost {
  id: string;
  message?: string;
  permalink_url: string;
  created_time: string;
  full_picture?: string;
  attachments?: {
    data: Array<{
      type: string;
      url?: string;
    }>;
  };
}

export interface FacebookPublishResponse {
  id: string;
  success: boolean;
}

export interface FacebookError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}
export interface facebookError {
  error: string | { message: string; code?: number };
}

/**
 * Facebook OAuth/API Error
 */
export class FacebookError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'FacebookError';
  }
}
