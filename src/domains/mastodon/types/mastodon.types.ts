/**
 * Mastodon-specific types
 */

export interface MastodonAccount {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  group: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at?: string;
}

export interface MastodonStatus {
  id: string;
  uri: string;
  url: string;
  content: string;
  created_at: string;
  account: MastodonAccount;
  media_attachments: MastodonMediaAttachment[];
  sensitive: boolean;
  spoiler_text: string;
  visibility: "public" | "unlisted" | "private" | "direct";
  reblog: MastodonStatus | null;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
}

export interface MastodonMediaAttachment {
  id: string;
  type: "image" | "video" | "gifv" | "audio" | "unknown";
  url: string;
  preview_url: string;
  remote_url: string | null;
  meta: {
    original: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
  };
  description: string | null;
}

export interface MastodonApp {
  id: string;
  name: string;
  website: string | null;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  vapid_key: string;
}

export interface MastodonError {
  error: string;
}
export interface mastodonError {
  error: string | { message: string; code?: number };
}
