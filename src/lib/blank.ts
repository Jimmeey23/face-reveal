// Shown on reveal when a baby has no grown-up photo: a cartoon grown-up in a silly disguise.
const MYSTERY_ADULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe3ec"/>
      <stop offset="1" stop-color="#ffd6a8"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>
  <g fill="#fff" opacity=".7">
    <circle cx="40" cy="50" r="5"/><circle cx="262" cy="80" r="7"/><circle cx="250" cy="300" r="4"/><circle cx="30" cy="260" r="6"/>
  </g>
  <text x="58" y="88" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-size="34" font-weight="700" fill="#ff6b8b" transform="rotate(-14 58 88)">?</text>
  <text x="232" y="64" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-size="44" font-weight="700" fill="#ffb347" transform="rotate(12 232 64)">?</text>
  <text x="246" y="180" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-size="26" font-weight="700" fill="#c084fc" transform="rotate(18 246 180)">?</text>

  <!-- body + tie -->
  <path d="M60 330 Q60 262 150 256 Q240 262 240 330 L240 400 L60 400 Z" fill="#6c8cff"/>
  <path d="M138 258 L162 258 L156 276 L168 330 L150 348 L132 330 L144 276 Z" fill="#ff6b8b"/>
  <!-- neck -->
  <rect x="132" y="232" width="36" height="30" rx="10" fill="#f2b98f"/>
  <!-- head -->
  <ellipse cx="150" cy="170" rx="68" ry="74" fill="#f6c6a0"/>
  <ellipse cx="82" cy="176" rx="12" ry="18" fill="#f2b98f"/>
  <ellipse cx="218" cy="176" rx="12" ry="18" fill="#f2b98f"/>
  <!-- hair -->
  <path d="M84 150 Q78 92 150 90 Q222 92 216 150 Q200 118 168 126 Q150 106 120 124 Q98 120 84 150 Z" fill="#3b2a24"/>
  <!-- blush -->
  <ellipse cx="106" cy="200" rx="13" ry="8" fill="#ff8fab" opacity=".55"/>
  <ellipse cx="194" cy="200" rx="13" ry="8" fill="#ff8fab" opacity=".55"/>
  <!-- disguise glasses -->
  <g stroke="#1f1b2e" stroke-width="6" fill="#fff">
    <circle cx="122" cy="166" r="20"/><circle cx="178" cy="166" r="20"/>
    <path d="M142 166 L158 166" fill="none"/>
  </g>
  <circle cx="126" cy="168" r="6" fill="#1f1b2e"/><circle cx="182" cy="168" r="6" fill="#1f1b2e"/>
  <path d="M100 140 Q122 128 140 140" stroke="#3b2a24" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 140 Q178 128 200 140" stroke="#3b2a24" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- big nose -->
  <ellipse cx="150" cy="196" rx="14" ry="12" fill="#f0a882"/>
  <!-- moustache -->
  <path d="M150 210 Q132 200 112 214 Q120 226 136 220 Q146 216 150 214 Q154 216 164 220 Q180 226 188 214 Q168 200 150 210 Z" fill="#3b2a24"/>
  <!-- smile -->
  <path d="M134 230 Q150 242 166 230" stroke="#b5544a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- coffee mug -->
  <g transform="translate(196 300) rotate(-8)">
    <rect x="0" y="0" width="40" height="46" rx="8" fill="#fff" stroke="#1f1b2e" stroke-width="4"/>
    <path d="M40 12 Q56 12 56 24 Q56 36 40 36" stroke="#1f1b2e" stroke-width="4" fill="none"/>
    <text x="20" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#ff6b8b">#1</text>
    <path d="M10 -8 Q14 -16 10 -24 M24 -8 Q28 -16 24 -24" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <!-- caption -->
  <rect x="34" y="358" width="232" height="30" rx="15" fill="#fff" opacity=".9"/>
  <text x="150" y="379" text-anchor="middle" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-size="15" font-weight="700" fill="#ff6b8b">Grown-up version loading… ☕</text>
</svg>`;

export const BLANK_ADULT = `data:image/svg+xml,${encodeURIComponent(MYSTERY_ADULT_SVG)}`;
