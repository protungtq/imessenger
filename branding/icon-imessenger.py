"""iMessenger icon: a white i (dot + stem, drawn as strokes like iMessenger's f) on a
cyan-to-blue-to-violet gradient, in Apple's rounded square, drawn per size.

    python3 branding/icon-imessenger.py OUT_DIR   # icon-16.svg ... icon-1024.svg

Render each SVG at its own size with cairosvg, copy icon-1024.png to
app-icon.png and run `npx tauri icon app-icon.png` for the platform icon set.
Based on branding/icon.py from iMessenger (MIT)."""
import math, pathlib, sys

def superellipse(cx, cy, w, h, n, steps=720):
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        c, s = math.cos(t), math.sin(t)
        pts.append(f"{cx + (w/2) * math.copysign(abs(c) ** (2/n), c):.2f},{cy + (h/2) * math.copysign(abs(s) ** (2/n), s):.2f}")
    return "M" + " L".join(pts) + " Z"

SQUIRCLE = superellipse(512, 512, 824, 824, 5.0)

# iMessenger's own gradient, top left to bottom right (cyan -> blue -> violet).
INK = [("0", "#22D3EE"), ("0.5", "#3B82F6"), ("1", "#8B5CF6")]
INK_FROM, INK_TO = (180, 150), (850, 880)

def gradient(id_, a, b):
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in INK)
    return f'<linearGradient id="{id_}" gradientUnits="userSpaceOnUse" x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}">{stops}</linearGradient>'

def svg(size):
    small = size <= 32
    square = superellipse(512, 512, 920, 920, 5.0) if small else SQUIRCLE
    scale, stem = (1.7, 66) if small else (1.55, 62)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">
<defs>
  {gradient("ink", INK_FROM, INK_TO)}
  <radialGradient id="toplight" cx="0.5" cy="-0.1" r="0.8"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  <clipPath id="body"><path d="{square}"/></clipPath>
</defs>
<path d="{square}" fill="url(#ink)"/>
<g clip-path="url(#body)"><rect width="1024" height="1024" fill="url(#toplight)"/></g>
<g transform="translate(512,512) scale({scale})">
  <circle cx="0" cy="-102" r="34" fill="#FFFFFF"/>
  <path d="M0,150 V-28" fill="none" stroke="#FFFFFF" stroke-width="{stem}" stroke-linecap="round"/>
</g>
</svg>'''

if __name__ == "__main__":
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 64, 128, 256, 512, 1024):
        (out / f"icon-{size}.svg").write_text(svg(size))
