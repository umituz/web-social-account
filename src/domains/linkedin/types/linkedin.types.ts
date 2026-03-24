/**
 * LinkedIn-specific types
 */

import {
  LINKEDIN_API_ENDPOINTS,
  LINKEDIN_SHARE_CONTENT,
  LINKEDIN_MEMBER_NETWORK_VISIBILITY,
  LINKEDIN_MEDIA_CATEGORY,
  LINKEDIN_VISIBILITY,
  type LinkedInVisibility,
  type LinkedInMediaCategory,
} from "../constants/linkedin.constants";

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
    [LINKEDIN_SHARE_CONTENT]?: {
      shareCommentary?: {
        text: string;
      };
      shareMediaCategory: LinkedInMediaCategory;
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
    [LINKEDIN_MEMBER_NETWORK_VISIBILITY]: LinkedInVisibility;
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
