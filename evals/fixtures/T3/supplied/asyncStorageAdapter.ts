import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValuePort } from './port';

export const asyncStorageAdapter: KeyValuePort = {
  kind: 'async-storage',
  get: (key: string) => AsyncStorage.getItem(key),
  set: (key: string, value: string) => AsyncStorage.setItem(key, value),
};
