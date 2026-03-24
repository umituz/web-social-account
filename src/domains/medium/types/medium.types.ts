/**
 * Medium-specific types
 */

export interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface MediumPublication {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
}

export interface MediumPost {
  id: string;
  title: string;
  authorId: string;
  tags: string[];
  url: string;
  imageUrl: string;
  publishStatus: "draft" | "public" | "unlisted";
  publishedAt: number;
  updatedAt: number;
}

export interface MediumCreatePostResponse {
  data: {
    id: string;
    title: string;
    authorId: string;
    tags: string[];
    url: string;
    publishStatus: "draft" | "public" | "unlisted";
    publishedAt: number;
    updatedAt: number;
  };
}

export interface MediumError {
  errors: Array<{
    message: string;
    code: number;
  };
}
