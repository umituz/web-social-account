/**
 * LinkedIn-specific types
 */

export interface LinkedInProfile {
  id: string;
  firstName?: {
    localized: Record<string, string>;
  };
  lastName?: {
    localized: Record<string, string>;
  };
  profilePicture?: {
    displayImageContent: {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
  emailAddress?: string;
}

export interface LinkedInPost {
  id: string;
  author: string;
  lifecycleState: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  specificContent?: {
    com.linkedin.ugc.ShareContent?: {
      shareCommentary?: {
        text: string;
      };
      shareMediaCategory: "NONE" | "ARTICLE" | "IMAGE";
      media?: Array<{
        status: "READY" | "PROCESSING" | "ERROR";
        description?: {
          text: string;
        };
        mediaType: "ARTICLE" | "IMAGE";
        title?: {
          text: string;
        };
      }>;
    };
  };
  visibility?: {
    com.linkedin.ugc.MemberNetworkVisibility: "PUBLIC" | "CONNECTIONS" | "LOGGED_IN";
  };
}

export interface LinkedInResponse<T> {
  id: string;
  status?: number;
}

export interface LinkedInError {
  serviceErrorCode: number;
    message: string;
    status: number;
}
