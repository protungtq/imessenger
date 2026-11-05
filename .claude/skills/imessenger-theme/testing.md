# Testing a theme in the real app

The debug app runs as the user, in the user's Messenger account. All the read-only rules from
extraction.md apply to probes too: no sending, reacting, calling, or opening unread chats.

## Setup (once per session)

```sh
S=<scratchpad from the system prompt>; APP=<app>
F="$HOME/Library/Application Support/asia.so1.imessenger/settings.json"
cp "$F" "$S/settings.backup.json"        # restore this at the end, whatever happens
cp "$(dirname "$F")/.window-state.json" "$S/window-state.backup.json"   # the debug app's 880x600 lands here
cd ~/projects/herald && npx tauri build --debug --bundles app   # only after Rust/inject.js/BUILT_IN changes
```

The debug and installed apps share a bundle id and are single-instance: a second one only
focuses the first. Always `pkill -f "iMessenger.app/Contents/MacOS/imessenger"` before launching
either.

Other agents may need the debug app too. Convention: while
`<scratchpad>/debug-app-busy` exists, don't launch the debug app, kill iMessenger or edit
settings.json; poll until it's gone. Put that check at the top of your run script.

Reusable probes and a launcher are in `~/projects/imessenger-themes/tools/` (README there):
`run.sh <probe.js> [wait-s] [--env K=V …]`, `bench.js` (frames while scrolling and opening
chats, the same script runs in Chrome), `typing.js`, `viewer.js`, `typing-dots.js`. The
Teams loop's own scripts (`mk.py`, `img.swift`…) lived in a `/tmp` scratchpad and are gone:
`/tmp` is wiped when the Mac restarts, so keep anything worth reusing in the workspace.
There is no PIL: crop with `sips -c <h> <w> --cropOffset <y> <x>`, shrink with `sips -Z`.

zsh doesn't split an unquoted variable: `open $E …` with `E="--env A=1"` fails. Write each
`--env K=V` as its own argument.

## Launch with a probe

`src-tauri/src/probe.rs` (debug builds only):

- `IMESSENGER_PROBE=<file.js>`: the file is the body of an async function (`await` is fine,
  it must `return`). It runs in the main window after `IMESSENGER_PROBE_DELAY` s (default 15)
  and prints `[probe] <json>` to stderr. It gives up after `IMESSENGER_PROBE_WAIT` s (default
  60, "no result"). A probe that waits for something only a person does (someone typing,
  the user pasting) sets it higher and keeps its own wait loop time-based. To chain two,
  wrap each in `await (async () => { … })()`.
- `IMESSENGER_NO_INJECT=1` leaves iMessenger's page script out (WebKit and Facebook alone), to tell
  whether a cost is iMessenger's or WebKit's.
- `IMESSENGER_WINDOW_SIZE=880x600` sizes the window first (logical px). The site shots and the
  Chrome reference use 880×600.
- `IMESSENGER_SNAPSHOT=<file.png>` (macOS) saves the page as the probe left it, through WebKit
  (no Screen Recording permission needed), at screen scale (1760×1200 on Retina).

```sh
pkill -f "iMessenger.app/Contents/MacOS/imessenger"; sleep 1
# zoom 1 to compare with the target at 100%, and no theme of its own (the probe brings one)
python3 -c 'import json,sys; p=sys.argv[1]; d=json.load(open(p)); d["zoom"]=1; d["theme"]=None; json.dump(d, open(p,"w"), indent=2)' "$F"
rm -f $S/probe.log
open --env IMESSENGER_PROBE=$S/apply.js --env IMESSENGER_PROBE_DELAY=12 --env IMESSENGER_WINDOW_SIZE=880x600 \
     --env IMESSENGER_SNAPSHOT=$S/$APP-light.png --stderr $S/probe.log \
     ~/projects/herald/src-tauri/target/debug/bundle/macos/iMessenger.app
# then wait until the log has "[snapshot]" or "no result" (Monitor, or shoot.sh's polling loop)
grep '\[probe\]\|\[snapshot\]' $S/probe.log | cut -c1-2000
```

## apply.js: the built CSS plus a measuring body

There's no rebuild per CSS change. Build the theme, then wrap it into a probe:

```sh
python3 ~/projects/imessenger-themes/$APP/build.py ~/projects/imessenger-themes/$APP/$APP.css
python3 - "$S" ~/projects/imessenger-themes/$APP/$APP.css "$S/measure.js" <<'EOF'
import json, sys
out, css, body = sys.argv[1], open(sys.argv[2]).read(), open(sys.argv[3]).read()
open(f'{out}/apply.js', 'w').write(
    "let style = document.getElementById('imessenger-theme');\n"
    "if (!style) { style = document.createElement('style'); style.id = 'imessenger-theme'; }\n"
    f"style.textContent = {json.dumps(css)};\n"
    "document.documentElement.append(style);\n"
    "await new Promise((r) => setTimeout(r, 1500));\n" + body)
EOF
```

A probe-applied theme lacks `UNDER_EVERY_THEME` (hooks.md).

**Snapshots are not the screen.** A `position: fixed` search field moved out of the list
showed in every WebKit snapshot and passed `elementFromPoint`, yet on the user's screen
WebKit clipped it away (a transformed ancestor). For anything moved across containing
blocks, ask the user to look, or avoid the move (hooks.md, `--imessenger-search-box`).

**No focus in probes.** probe.rs calls `set_focus`, but macOS won't make a background-launched
app key: `:focus-within`, focus rings and focus events can't be checked by probes.

**Size limit:** a probe of about 800 KB (two copies of a 390 KB theme) never runs: no
result, not even from a `setTimeout` watchdog. Keep one copy of the theme per probe; to
change a few rules mid-probe, append a small `<style>` of just those rules.

**Demo text vs. moved elements:** demo-shot.js sorts a row's text by its position, so
anything the theme moves (Teams puts the row's time on the name's line) is emptied. Apply
a copy of the theme without those rules, run the demo, then add them back. That matters only for the
reply/link bar. For the final pass, test it as a built-in theme (Ship step), or prepend
that block.

`measure.js` returns the numbers to compare against the spec:

```js
const pick = (sel, props, pseudo) => {
  const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
  if (!el) return 'MISSING';
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el, pseudo);
  return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} ` +
    props.map((p) => `${p}=${cs.getPropertyValue(p)}`).join(' ');
};
return {
  dark: document.documentElement.hasAttribute('data-imessenger-dark'), size: [innerWidth, innerHeight],
  rail: pick('[role="navigation"]', ['background-color', 'width'], '::before'),
  header: pick('[data-imessenger-ui="chat-header"]', ['background-color', 'box-shadow', 'border-bottom-width']),
  bubble: pick('[role="main"] [data-message-id] [role="presentation"]', ['background-color', 'border-top-left-radius', 'padding-top', 'padding-left']),
  text: pick('[role="main"] [data-message-id] [dir="auto"]', ['font-family', 'font-size', 'line-height', 'color']),
  composer: pick('[data-imessenger-ui="composer"]', ['background-color', 'border-top-left-radius', 'height']),
};
```

## Dark mode without touching Messenger's setting

Put this before the measuring body (it's the `DEMO_DARK` block of the newer demo-shot.js).
Since 0.1.24 `data-imessenger-dark` follows Facebook's own mark on `<html>`
(`__fb-dark-mode`/`__fb-light-mode`) as it changes, so the class change below is what flips
it; it lasts until Facebook rewrites the class or the page reloads. Measure or snapshot
right away.

```js
for (const el of document.querySelectorAll('.__fb-light-mode')) el.classList.replace('__fb-light-mode', '__fb-dark-mode');
document.documentElement.classList.add('__fb-dark-mode');
document.documentElement.setAttribute('data-imessenger-dark', '');
document.documentElement.style.colorScheme = 'dark';
```

## Any language: marks, not labels

Changing the account's Facebook language is a settings change, so don't. Simulate a
translated Facebook instead: rewrite every aria-label and check that no themed style
changes (from `i18n-wa-probe.js`, 2026-11-01).

```js
const props = ['display', 'order', 'background-color', 'background-image', '-webkit-mask-image', 'border-radius', 'visibility'];
const snap = () => [...document.querySelectorAll('[data-imessenger-ui]')].flatMap((el) =>
  [el, el.querySelector('svg')].filter(Boolean).map((e, i) => `${el.getAttribute('data-imessenger-ui')}${i ? ' svg' : ''}: ` +
    props.map((p) => getComputedStyle(e).getPropertyValue(p).slice(0, 40)).join(' | ')));
const english = snap();
for (const el of document.querySelectorAll('[aria-label]')) el.setAttribute('aria-label', `xx ${el.getAttribute('aria-label')}`);
await new Promise((r) => setTimeout(r, 300));
const translated = snap();
return { marks: [...new Set(english.map((l) => l.split(':')[0]))], changed: english.filter((l, i) => l !== translated[i]) };
```

`changed` must be empty. Open the details first if they're themed. Also grep the source for
aria-label selectors without a mark beside them:
`grep -n 'aria-label' $APP.src.css | grep -v 'data-imessenger-ui'`. Each one is English-only.

## Snapshots of states that must be undone (reply bar, viewer, menus)

The snapshot is taken when probe.rs reads a result. To photograph a state and still undo
it in the same probe, hand over a result early and carry on:

```js
replyButton.click(); await sleep(1200);
window.__imessengerProbe = JSON.stringify({ open: true });   // probe.rs snapshots now
await sleep(4000);
cancelButton.click();                                      // then undo
return 'done';
```

**Photo viewer.** A chat's photo opens in a layer over the page at the same address, with
no dialog role (2026-11-02); `/messenger_media` is no longer the way in. Click the photo's
`[role="button"]` wrapper in a message (`img` 100px or wider inside `[data-message-id]`),
not other links: shared posts and link cards open in the system browser (links.rs). iMessenger
finds the layer by the download link in its top bar (`a[download]` outside `[role="main"]`).
Escape closes it (Facebook's own), or the last button of that bar. `tools/viewer.js` does
the whole check: flag set, the theme's title and badge hidden, double-click zoom, Escape
unzooms then closes.

## States only people cause: the typing dots

Nobody can make the other side type. Run `tools/typing-dots.js` with
`IMESSENGER_PROBE_WAIT=1500` and ask the user to keep a busy chat open in the debug app; it
returns when the dots show. Don't type to trigger them: the dots are the other person's.

## Typing in a test

Typing in a message box shows "typing…" to the people in that chat. Turn on `blockTyping`
in settings.json for the test (iMessenger then sends "not typing"), use a read chat, never press
Enter, insert with `document.execCommand('insertText', false, ch)`, and empty the box after
with `execCommand('selectAll')` + `execCommand('delete')` (works in WebKit; in Chrome it may
not: use real keys there). Return `boxEmptyAfter` and check it.

## Hover, tooltips, the reply bar

Facebook reacts to synthetic pointer events, so a probe can show hover states and tooltips:

```js
const at = (el) => { const b = el.getBoundingClientRect(); return { bubbles: true, cancelable: true, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 }; };
const hover = (el) => { for (const t of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove'])
  el.dispatchEvent(new (t.startsWith('pointer') ? PointerEvent : MouseEvent)(t, at(el))); };
hover(document.querySelector('[data-imessenger-ui="audio-call"]'));   // never click it
await new Promise((r) => setTimeout(r, 1500));
const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) => t.getBoundingClientRect().width > 0);
```

Then read the tooltip's text colour and the nearest drawn background, in light and in dark.
For the reply bar (`composer-bar`), hover the last message, click its button whose
aria-label starts with "Reply", measure, then click "Cancel reply" in the same probe and
return whether the bar is gone. English labels: check them first on a non-English
Facebook. A reply bar left open stays in that chat for the user.

## Performance

- `grep -n ':has(' $APP.src.css`: no `:has()` left of a combinator, none nested (hooks.md).
- Scroll speed with and without the theme (scrolling up loads older messages, which is
  harmless):
  ```js
  const log = document.querySelector('[role="main"] [role="log"]');
  let box = log; while (box && !(box.scrollHeight > box.clientHeight + 10 && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
  let frames = 0; const t0 = performance.now();
  await new Promise((done) => { const step = () => { frames++; box.scrollTop -= 40; performance.now() - t0 < 2000 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  return { fps: Math.round(frames / 2) };
  ```
  It should be about the same as with no theme. A big drop means a full-chat mask or
  background, or a broad `:has()`.
- `tools/bench.js` measures more (rest, opening six read chats, scrolling the list and the
  messages): run it with the theme, with `theme: null`, and with `IMESSENGER_NO_INJECT=1` for
  WebKit alone. Same window size each time.

## Side by side

- Reference: the target in your Chrome tab at 880×600 CSS px, 100% zoom, light and dark,
  `save_to_disk` into `spec/ref/`. iMessenger: `$S/$APP-light.png` / `-dark.png`.
- **Reference at 880×600 when Chrome won't resize** (the user's window is fullscreen): in
  your tab add a style `html, body { width: 880px !important; height: 600px !important;
  overflow: hidden !important } html { background: #ff00ff !important }` (keep the body's
  own colour), hide banners, then `computer zoom` a region a bit larger than the page and
  crop away the magenta (`img box`, `img crop`). `zoom`/`screenshot` regions are in the
  screenshot's frame (e.g. 1400×865 for a 1864×1152 viewport), not CSS px. Popups
  (menus) are still placed against the real viewport and may overflow the 880 edge.
- Check the composer's last button in a chat whose quick reaction is the default 👍: it
  must not look like a working send button (hooks.md, like/send).
- Read both images and compare region by region, top-left to bottom-right: rail, list
  header, search, filters, rows, chat header, background, bubbles, dates, composer, details.
  Then compare the probe's numbers with the spec tables. Numbers decide; the picture only
  shows where to look.
- Also look at: a tooltip, the ⋯ list menu, the reaction picker, the photo viewer
  (a layer; every decoration and iMessenger-drawn control hidden), the call buttons (look only: calls have no
  theme), the reply bar, a chat with a link preview, a group chat, the details pane open,
  the Windows/Linux case (`--imessenger-title-bar: 0`: nothing drawn over the top of the page).
- Optional quick look in Chrome: apply the CSS to facebook.com/messages in a tab (memory
  note `imessenger-fast-iteration`). There's no inject.js there, so no marks: only the
  English-label fallbacks get tested.

## Site screenshots (when shipping)

`~/projects/imessenger-themes/shoot.sh <theme|none> <out.png>` writes `theme` and `zoom: 1` into
the **real settings.json**, kills iMessenger, and runs `demo-shot.js` (made-up names, pictures
and lines; nothing real left visible). Before using it:

- Its `S=` line points at an old session's scratchpad. Copy shoot.sh and the probe into
  your scratchpad and set `S` to it.
- Variants: prepend `const DEMO_LANG = 'vi';` and/or `const DEMO_DARK = true;` to a copy and
  pass `DEMO=<that file>`. If `grep -c DEMO_DARK demo-shot.js` is 0, that copy predates dark
  support: add the dark block above before its final `await sleep(800)`.
- The theme must be known to the debug build (built-in after the Ship step), or pass `none`
  and prepend the apply snippet.
- Four shots per theme: `shot-<app>.webp`, `-vi`, `-dark`, `-vi-dark`, at 1760×1200 WebP like
  the others (`sips` can read WebP but not write it).

## Restore (always, also after a failure)

```sh
pkill -f "iMessenger.app/Contents/MacOS/imessenger"; sleep 1
cp "$S/settings.backup.json" "$HOME/Library/Application Support/asia.so1.imessenger/settings.json"
cp "$S/window-state.backup.json" "$HOME/Library/Application Support/asia.so1.imessenger/.window-state.json"
open -a /Applications/iMessenger.app
```

Restore while no iMessenger runs: a running iMessenger writes its settings back on changes. Remove
any theme file you put in `~/Library/Application Support/asia.so1.imessenger/themes/`.
Close your Chrome tabs.
