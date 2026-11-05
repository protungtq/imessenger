// Runs iMessenger's handling of Messenger's sounds (SoundPlayer's sounds through Web
// Audio, so WebKit doesn't make iMessenger Now Playing) against fake media
// elements and a fake Web Audio. `node tests/sounds.mjs`
import { readdirSync, readFileSync } from 'node:fs';

// The page script's parts, joined in file-name order as build.rs does.
// Windows checkouts may have CRLF line ends.
const parts = new URL('../src-tauri/src/inject/', import.meta.url);
const src = readdirSync(parts)
  .filter((name) => name.endsWith('.js'))
  .sort()
  .map((name) => readFileSync(new URL(name, parts), 'utf8'))
  .join('')
  .replace(/\r\n/g, '\n');
const patch = src.match(/    SoundPlayer\(exports\) \{[\s\S]*?\n    \},\n/)[0];
const sounds = src.match(/  const nativePlay = HTMLMediaElement\.prototype\.play;[\s\S]*?\n  HTMLMediaElement\.prototype\.pause = [\s\S]*?\n  };\n/)[0];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function world({ fetchFails = false, fetchDelay = 0 } = {}) {
  const w = { muted: false, sources: [] };
  class HTMLMediaElement {
    play() {
      this.nativePlays = (this.nativePlays ?? 0) + 1;
      return Promise.resolve();
    }
    pause() {}
  }
  class HTMLAudioElement extends HTMLMediaElement {
    constructor(url) {
      super();
      Object.assign(this, { src: url, currentSrc: url, loop: false, srcObject: null, muted: false, volume: 1 });
    }
  }
  class AudioContext {
    state = 'suspended';
    destination = {};
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    suspend() {
      this.state = 'suspended';
      return Promise.resolve();
    }
    decodeAudioData(data) {
      return Promise.resolve({ data });
    }
    createGain() {
      return { gain: { value: 1 }, connect: (next) => next };
    }
    createBufferSource() {
      const source = {
        connect: (next) => next,
        start() {
          source.started = true;
          w.sources.push(source);
        },
        stop() {
          source.stopped = true;
          source.onended?.();
        },
      };
      return source;
    }
  }
  const fetch = async () => {
    await sleep(fetchDelay);
    if (fetchFails) throw new Error('offline');
    return { ok: true, arrayBuffer: async () => 'bytes' };
  };
  const env = { HTMLMediaElement, HTMLAudioElement, AudioContext, fetch, isMuted: () => w.muted };
  const run = new Function(...Object.keys(env), `let soundPlayerCalls = 0;\n${sounds}return ({ ${patch} });`);
  // Messenger's SoundPlayer: play() plays one of its elements, at once.
  const exports = {
    play(element, options = {}) {
      if (options.loop) element.loop = true;
      return element.play();
    },
  };
  run(...Object.values(env)).SoundPlayer(exports);
  w.soundPlayer = exports;
  w.audio = (url = 'https://static.xx.fbcdn.net/rsrc.php/x.ogg') => new HTMLAudioElement(url);
  return w;
}

const results = [];
const check = (name, ok, detail) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `: ${JSON.stringify(detail)}`}`);

{
  const w = world();
  const sound = w.audio();
  await w.soundPlayer.play(sound);
  check("Messenger's sound plays through Web Audio", w.sources.length === 1 && !sound.nativePlays, { sources: w.sources.length, native: sound.nativePlays });
}
{
  const w = world();
  const voice = w.audio('blob:https://www.facebook.com/voice');
  await voice.play();
  check('other audio (a voice message) stays a media element', w.sources.length === 0 && voice.nativePlays === 1, voice);
}
{
  const w = world();
  const ring = w.audio();
  await w.soundPlayer.play(ring, { loop: true });
  check('a looping sound (a call ringing) stays a media element', w.sources.length === 0 && ring.nativePlays === 1, ring);
}
{
  const w = world();
  const sound = w.audio();
  await w.soundPlayer.play(sound);
  sound.pause();
  check('pause() stops the sound', w.sources[0]?.stopped === true, w.sources);
}
{
  const w = world({ fetchDelay: 30 });
  const sound = w.audio();
  const playing = w.soundPlayer.play(sound);
  sound.pause();
  await playing;
  check('pause() while the sound loads: it never starts', w.sources.length === 0 && !sound.nativePlays, { sources: w.sources.length, native: sound.nativePlays });
}
{
  const w = world();
  w.muted = true;
  const sound = w.audio();
  const voice = w.audio('blob:https://www.facebook.com/voice');
  await w.soundPlayer.play(sound);
  await voice.play();
  check("Do Not Disturb quiets Messenger's sounds only", w.sources.length === 0 && !sound.nativePlays && voice.nativePlays === 1, { sound, voice });
}
{
  const w = world({ fetchFails: true });
  const sound = w.audio();
  await w.soundPlayer.play(sound);
  check('if Web Audio fails, the element plays as before', w.sources.length === 0 && sound.nativePlays === 1, sound);
}

console.log(results.join('\n'));
if (results.some((line) => line.startsWith('FAIL'))) process.exit(1);
