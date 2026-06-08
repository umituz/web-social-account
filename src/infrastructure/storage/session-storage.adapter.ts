/**
 * SessionStorage Adapter for OAuth State and Session Data
 */

import { BaseStorageAdapter, StorageLike } from "./base-storage.adapter";

export class SessionStorageAdapter extends BaseStorageAdapter {
  protected storage(): StorageLike {
    if (typeof window === "undefined") {
      throw new Error("sessionStorage is not available in this environment");
    }
    return window.sessionStorage;
  }
}
