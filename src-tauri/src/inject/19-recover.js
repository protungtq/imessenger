  // Getting Messenger back by itself. Three things left it stuck until the
  // page was reloaded by hand, and iMessenger now reloads it then:
  //  - Sleep: while the computer sleeps, the page's connections to Facebook
  //    die without the page noticing. After a night's sleep, messages sent in
  //    the morning sat at "Sending". Sleep shows as a jump in the clock between
  //    two ticks of a timer, since timers don't run while the computer
  //    sleeps; a hidden page's timers can run late, but by about a minute
  //    (Chromium's), well under SLEPT_MS. As Ferdium does (reloadAfterResume).
  //  - A connection that stays down: Messenger keeps four WebSockets to
  //    gateway.facebook.com (lightspeed: messages; realtime; rpsignaling:
  //    calls; streamcontroller). After five minutes offline it took 77 s to
  //    bring messages back once the network was, and it had given up on the
  //    calls one for good (live checks, tests/app/live-check.sh). So once
  //    Facebook answers again, a socket that has worked before and is still
  //    down DOWN_MS later gets the page reloaded.
  //  - "Couldn't load chats": the encrypted chats' worker died and couldn't
  //    start again (#24: in the background, on macOS 27). Messenger offers
  //    Reload; iMessenger reloads once by itself. Should the screen come back
  //    soon after, it stays, for Messenger's own Reload (which can also clear
  //    and fetch again the encrypted chats stored on this computer).
  // A reload waits for an empty message box (a message being typed is let be
  // until it's sent) and for Facebook to answer, and comes at most every
  // AGAIN_MS. Messages left waiting go out after it.
  const RECOVER = {
    tickMs: 15_000,
    sleptMs: 5 * 60_000,
    downMs: 30_000,
    retryMs: 3_000,
    againMs: 2 * 60_000,
    chatsErrorAgainMs: 10 * 60_000,
  };
  // Debug builds: what happened, for live checks (with the time, in ms).
  const recoverNote = (text) => window.__imessengerErrors?.push(`recover: ${text} @${Date.now()}`);
  const lastRecovery = () => {
    try {
      return JSON.parse(sessionStorage.getItem('imessenger.recovered') || 'null');
    } catch {
      return null;
    }
  };

  // Messenger's WebSockets to Facebook, by kind (the path after /ws/): the
  // newest of each is the one in use (Messenger leaves a dead one behind
  // without closing it, and opens another).
  const gatewaySockets = new Map();
  if (!window.opener) {
    const Native = window.WebSocket;
    window.WebSocket = new Proxy(Native, {
      construct(target, args, newTarget) {
        const socket = Reflect.construct(target, args, newTarget);
        try {
          const url = new URL(String(args[0]));
          const kind = url.hostname.endsWith('facebook.com') && url.pathname.startsWith('/ws/') ? url.pathname.slice(4) : null;
          if (kind) {
            const entry = { socket, since: Date.now(), open: false, worked: gatewaySockets.get(kind)?.worked ?? false };
            gatewaySockets.set(kind, entry);
            socket.addEventListener('open', () => {
              entry.open = true;
              entry.worked = true;
              entry.since = Date.now();
            });
            socket.addEventListener('close', () => {
              entry.open = false;
              entry.since = Date.now();
            });
          }
        } catch {}
        return socket;
      },
    });
  }
  // Kinds that have worked and have been down for DOWN_MS.
  const deadSockets = (now) =>
    [...gatewaySockets]
      .filter(([, entry]) => entry.worked && !entry.open && now - entry.since >= RECOVER.downMs)
      .map(([kind]) => kind);

  let recovering = false;
  const typing = () => {
    const box = document.activeElement;
    return Boolean(box?.isContentEditable && box.textContent.trim());
  };
  // Whether Facebook answers. On a network that's still dead a request gets
  // no answer at all, hence the timeout. And after one, WebKit kept sending
  // requests to www.facebook.com down its old, dead connection until it gave
  // up on it, 44 s later (live checks): m.facebook.com, which the page
  // doesn't use, is asked at the same time on a connection of its own (no
  // CORS there, so only whether it answers counts).
  const answering = () => {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 5_000);
    const ask = { cache: 'no-store', credentials: 'omit', signal: timeout.signal };
    return Promise.any([
      fetch('/favicon.ico', ask).then((response) => response.ok || Promise.reject(new Error(`HTTP ${response.status}`))),
      fetch('https://m.facebook.com/favicon.ico', { ...ask, mode: 'no-cors' }),
    ])
      .then(
        () => true,
        () => false,
      )
      .finally(() => clearTimeout(timer));
  };
  // Reloads for `reason` as soon as it may.
  const recover = (reason) => {
    if (recovering || window.opener) return;
    const last = lastRecovery();
    const again = reason === 'chats error' ? RECOVER.chatsErrorAgainMs : RECOVER.againMs;
    if (last && Date.now() - last.at < again && (reason !== 'chats error' || last.reason === reason)) {
      recoverNote(`not again so soon: ${reason}`);
      return;
    }
    recovering = true;
    recoverNote(reason);
    const attempt = async () => {
      if (!typing() && navigator.onLine !== false && (await answering())) {
        recoverNote('reloading');
        try {
          sessionStorage.setItem('imessenger.recovered', JSON.stringify({ at: Date.now(), reason }));
        } catch {}
        location.reload();
        return;
      }
      setTimeout(attempt, RECOVER.retryMs);
    };
    attempt();
  };
  if (!window.opener) {
    const last = lastRecovery();
    // At the time of the reload: a note made just before it is lost with the page.
    if (last && Date.now() - last.at < 60_000) window.__imessengerErrors?.push(`recover: reloaded (${last.reason}) @${last.at}`);
    let lastTick = Date.now();
    // Since when Facebook has answered while a socket was down.
    let answeringSince = 0;
    const tick = async (now = Date.now()) => {
      const slept = now - lastTick - RECOVER.tickMs;
      lastTick = now;
      if (recovering) return;
      if (slept >= RECOVER.sleptMs) return recover(`slept ${Math.round(slept / 1000)} s`);
      const dead = deadSockets(now);
      if (!dead.length || !(await answering())) {
        answeringSince = 0;
        return;
      }
      answeringSince ||= now;
      if (now - answeringSince >= RECOVER.downMs) recover(`down: ${dead.join(', ')}`);
    };
    setInterval(tick, RECOVER.tickMs);
    // Probes: a tick as if the computer had slept, and the sockets' state.
    if (window.__imessengerDebug) {
      window.__imessengerCheckAwake = tick;
      window.__imessengerGatewaySockets = () => Object.fromEntries([...gatewaySockets].map(([kind, entry]) => [kind, { open: entry.open, worked: entry.worked, since: entry.since }]));
    }
  }

