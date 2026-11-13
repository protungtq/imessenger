#!/bin/zsh
# run.sh <probe.js> [wait-seconds] [extra open args…]          (macOS, debug build)
# Relaunches the debug app with a probe and prints its result. Extra args go to
# `open`, each --env as its own argument (zsh doesn't split a variable):
#   run.sh typing-dots.js 1500 --env IMESSENGER_WINDOW_SIZE=1744x1078
#   run.sh bench.js 200 --env IMESSENGER_NO_INJECT=1
# Files that define window.__imessenger…() (bench.js, typing.js) get the call appended.
# IMESSENGER_APP=<path to iMessenger.app> runs another build. On Windows and Linux, run the
# debug binary with the same IMESSENGER_* variables instead (testing.md).
HERE=${0:A:h}
APP=${IMESSENGER_APP:-$HERE/../../src-tauri/target/debug/bundle/macos/iMessenger.app}
[[ -d $APP ]] || { echo "no debug build at $APP: run npx tauri build --debug --bundles app first" >&2; exit 1; }
P=${1:?usage: run.sh <probe.js> [wait-seconds] [open args…]}; W=${2:-60}
shift $(( $# < 2 ? $# : 2 ))
D=${TMPDIR:-/tmp}/imessenger-probe; mkdir -p $D; L=$D/probe.log; J=$D/probe.js
cp $P $J
grep -q 'window.__imessengerBench = ' $P && echo 'return await window.__imessengerBench();' >> $J
grep -q 'window.__imessengerTyping = ' $P && echo 'return await window.__imessengerTyping();' >> $J
pkill -f "iMessenger.app/Contents/MacOS/imessenger"; sleep 1; rm -f $L
open --env IMESSENGER_PROBE=$J --env IMESSENGER_PROBE_DELAY=${IMESSENGER_PROBE_DELAY:-14} --env IMESSENGER_PROBE_WAIT=$W "$@" \
     --stderr $L $APP
until grep -q '\[probe\]' $L 2>/dev/null || ! pgrep -f "target/debug/bundle/macos/iMessenger.app/Contents/MacOS/imessenger" >/dev/null; do sleep 2; done
grep '\[probe\]' $L | tail -1 | cut -c9- | python3 -c "import json,sys; d=json.loads(sys.stdin.read()); d=json.loads(d) if isinstance(d,str) and d[:1] in '[{\"' else d; print(json.dumps(d, ensure_ascii=False, indent=1))"
