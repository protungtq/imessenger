// Runs iMessenger's recovery (19-recover.js: reloading after sleep, when a
// connection stays down, and on Messenger's error screen) against a fake
// clock, fake WebSockets and a fake Facebook. `node tests/recover.mjs`
// The live version, against the real page: tests/app/live-check.sh.
import { readFileSync } from 'node:fs';

const part = readFileSync(new URL('../src-tauri/src/inject/19-recover.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function world({ online = true, stored = null } = {}) {
  const w = { now: 1_000_000_000, timers: [], reloads: 0, online, notes: [], typing: '' };
  const later = (fn, ms, every) => {
    const timer = { at: w.now + ms, fn, every };
    w.timers.push(timer);
    return timer;
  };
  const settle = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  };
  w.advance = async (ms) => {
    const end = w.now + ms;
    for (;;) {
      await settle();
      w.timers.sort((a, b) => a.at - b.at);
      const next = w.timers[0];
      if (!next || next.at > end) break;
      w.now = next.at;
      if (next.every) next.at += next.every;
      else w.timers.shift();
      await next.fn();
    }
    w.now = end;
    await settle();
  };
  // Sleep: no timer runs, then the clock is later.
  w.sleep = (ms) => {
    w.now += ms;
    for (const timer of w.timers) timer.at += ms;
  };
  class FakeSocket extends EventTarget {
    constructor(url) {
      super();
      this.url = url;
    }
    open() {
      this.dispatchEvent(new Event('open'));
    }
    close() {
      this.dispatchEvent(new Event('close'));
    }
  }
  const storage = new Map(stored ? [['imessenger.recovered', JSON.stringify(stored(w.now))]] : []);
  const window = { WebSocket: FakeSocket, __imessengerDebug: true, __imessengerErrors: w.notes, opener: null };
  const box = { isContentEditable: true, get textContent() { return w.typing; } };
  const env = {
    window,
    Date: { now: () => w.now },
    setTimeout: (fn, ms) => later(fn, ms),
    clearTimeout: (timer) => (w.timers = w.timers.filter((t) => t !== timer)),
    setInterval: (fn, ms) => later(fn, ms, ms),
    fetch: async () => {
      if (!w.online) throw new Error('offline');
      return { ok: true };
    },
    sessionStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    location: { reload: () => (w.reloads += 1) },
    document: { get activeElement() { return w.typing ? box : null; } },
    navigator: { onLine: true },
    AbortController,
  };
  const run = new Function(...Object.keys(env), `${part}\nreturn { recover };`);
  w.page = run(...Object.values(env));
  w.socket = (kind) => new window.WebSocket(`wss://gateway.facebook.com/ws/${kind}?x=1`);
  return w;
}

const results = [];
const check = (name, ok, detail) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `: ${JSON.stringify(detail)}`}`);
const MIN = 60_000;

{
  const w = world();
  w.sleep(6 * MIN);
  await w.advance(20_000);
  check('a 6-minute sleep reloads', w.reloads === 1, w.notes);
}
{
  const w = world();
  w.sleep(2 * MIN);
  await w.advance(60_000);
  check("a 2-minute sleep doesn't", w.reloads === 0, w.notes);
}
{
  const w = world();
  w.typing = 'hello';
  w.sleep(6 * MIN);
  await w.advance(30_000);
  const whileTyping = w.reloads;
  w.typing = '';
  await w.advance(5_000);
  check('after sleep, no reload while typing; once sent, it reloads', whileTyping === 0 && w.reloads === 1, { whileTyping, reloads: w.reloads });
}
{
  const w = world({ online: false });
  w.sleep(6 * MIN);
  await w.advance(60_000);
  const offline = w.reloads;
  w.online = true;
  await w.advance(5_000);
  check('after sleep while offline, it reloads once Facebook answers', offline === 0 && w.reloads === 1, { offline, reloads: w.reloads });
}
{
  const w = world();
  const socket = w.socket('lightspeed');
  socket.open();
  await w.advance(MIN);
  socket.close();
  await w.advance(20_000);
  const early = w.reloads;
  await w.advance(60_000);
  check('a socket that worked and stays down gets a reload (not at once)', early === 0 && w.reloads === 1, { early, reloads: w.reloads, notes: w.notes });
}
{
  const w = world();
  const socket = w.socket('lightspeed');
  socket.open();
  await w.advance(MIN);
  socket.close();
  await w.advance(15_000);
  w.socket('lightspeed').open();
  await w.advance(2 * MIN);
  check('Messenger reconnecting by itself: no reload', w.reloads === 0, w.notes);
}
{
  const w = world();
  w.socket('rpsignaling');
  await w.advance(3 * MIN);
  check("a socket that never worked (blocked): no reload", w.reloads === 0, w.notes);
}
{
  const w = world({ online: false });
  const socket = w.socket('lightspeed');
  socket.open();
  socket.close();
  await w.advance(5 * MIN);
  const offline = w.reloads;
  w.online = true;
  await w.advance(20_000);
  const justBack = w.reloads;
  await w.advance(40_000);
  check('offline: no reload; back: a grace for Messenger, then a reload', offline === 0 && justBack === 0 && w.reloads === 1, { offline, justBack, reloads: w.reloads });
}
{
  const w = world({ stored: (now) => ({ at: now, reason: 'slept 400 s' }) });
  const socket = w.socket('lightspeed');
  socket.open();
  socket.close();
  await w.advance(90_000);
  const soon = w.reloads;
  await w.advance(60_000);
  check('a connection down right after a reload: not again until two minutes have passed', soon === 0 && w.reloads === 1, { soon, reloads: w.reloads, notes: w.notes });
}
{
  const w = world();
  w.page.recover('chats error');
  await w.advance(1000);
  check("Messenger's error screen: it reloads", w.reloads === 1, w.notes);
}
{
  const w = world({ stored: (now) => ({ at: now - 5 * MIN, reason: 'chats error' }) });
  w.page.recover('chats error');
  await w.advance(MIN);
  check("the error screen again within 10 minutes: it stays", w.reloads === 0 && w.notes.some((n) => n.startsWith('recover: not again so soon: chats error')), w.notes);
}
{
  const w = world({ stored: (now) => ({ at: now - 5 * MIN, reason: 'slept 400 s' }) });
  w.page.recover('chats error');
  await w.advance(1000);
  check('the error screen after a reload for something else: it reloads', w.reloads === 1, w.notes);
}

console.log(results.join('\n'));
if (results.some((line) => line.startsWith('FAIL'))) process.exit(1);
