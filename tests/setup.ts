/**
 * Test setup file
 */

// Mock crypto for Node.js environment
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    subtle: {
      digest: async (_algorithm: string, data: Uint8Array) => {
        // Simple hash mock for testing
        const hash = Array.from(data)
          .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
        return new TextEncoder().encode(hash);
      },
    },
  } as any;
}
