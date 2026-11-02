"""Restore the binary files (app icons) that are kept in this repo as base64.

The iMessenger repository stores its icon PNG/ICO/ICNS files encoded in
branding/b64/*.json so the whole tree stays text. Run this once after
cloning, before building (the Release workflow runs it automatically):

    python3 branding/restore-binaries.py
"""
import base64, json, pathlib

ROOT = pathlib.Path(__file__).parent.parent

def main():
    total = 0
    for manifest in sorted((ROOT / "branding" / "b64").glob("*.json")):
        for rel, b64 in json.loads(manifest.read_text()).items():
            dest = ROOT / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(base64.b64decode(b64))
            total += 1
    print(f"Restored {total} binary files.")

if __name__ == "__main__":
    main()
