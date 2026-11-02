import type { KeyValuePort } from './port';

const store = new Map<string, string>();

export const memoryAdapter: KeyValuePort = {
  kind: 'memory',
  get: async (key: string) => store.get(key) ?? null,
  set: async (key: string, value: string) => {
    store.set(key, value);
  },
};
