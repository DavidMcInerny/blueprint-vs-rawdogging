import { expect, it } from 'vitest';
import { createPreferencesStore, defaultPreferences } from '../src/theme/preferences';
import { singleFlight, withDeadline } from '../src/lib/asyncWork';

it('preserves durable and current preferences on failed save, then retries', async () => {
  let durable: string | null = null;
  let fail = true;
  const store = createPreferencesStore({
    read: async () => durable,
    write: async (value) => {
      if (fail) throw new Error('Storage unavailable');
      durable = value;
    },
  });
  await store.load();
  await expect(store.update({ appearance: 'dark' })).rejects.toThrow('Storage unavailable');
  expect(store.current()).toEqual(defaultPreferences);
  expect(durable).toBeNull();
  fail = false;
  await store.update({ appearance: 'dark' });
  expect(store.current().appearance).toBe('dark');
  expect(JSON.parse(durable!)).toMatchObject({ appearance: 'dark' });
});

it('preserves unreadable preference data and blocks writes until a successful load', async () => {
  const durable = '{"version":999,"appearance":"future"}';
  let writes = 0;
  const store = createPreferencesStore({
    read: async () => durable,
    write: async () => {
      writes++;
    },
  });
  await expect(store.load()).rejects.toThrow();
  await expect(store.update({ appearance: 'light' })).rejects.toThrow('Load preferences');
  expect(writes).toBe(0);
});

it('propagates injected network failure, coalesces requests, and permits retry', async () => {
  let calls = 0;
  const request = singleFlight(() =>
    withDeadline(async () => {
      if (++calls === 1) throw new TypeError('Network unavailable');
      return { ok: true };
    }, 1000),
  );
  const first = request();
  expect(request()).toBe(first);
  await expect(first).rejects.toThrow('Network unavailable');
  await expect(request()).resolves.toEqual({ ok: true });
  expect(calls).toBe(2);
});
