/**
 * LocalStorage Adapter for OAuth State and Session Data
 */

import { BaseStorageAdapter, StorageLike } from "./base-storage.adapter";

export class LocalStorageAdapter extends BaseStorageAdapter {
  protected storage(): StorageLike {
    if (typeof window === "undefined") {
      throw new Error("localStorage is not available in this environment");
    }
    return window.localStorage;
  }
}
