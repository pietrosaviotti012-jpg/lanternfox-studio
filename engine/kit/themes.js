// Lantern Fox kit: colour themes. One theme per format, each with three moods (notte, alba, allarme).
// Every theme follows the same grammar, so the channel stays recognisable:
//   - dark, cool sheets at the back and warm light through the holes (warm against cool is what makes the lightbox glow);
//   - three values only: sky (darkest to mid), far → mid → near sheets stepping darker towards the camera;
//   - one accent for the object of the story; the fox keeps her orange in every theme, so no sheet is ever orange;
//   - em is the highlighted word of the captions: it must read on any frame (tools/themes_check.mjs measures it).
// In a shot:  import { theme } from './engine/kit/themes.js';  const T = theme('misteri', 'notte');
//             sky: { stops: T.sky }, lightCol: T.light, layers drawn with T.far / T.mid / T.near, glowCol: T.glow
// In script.json: "theme": "misteri/notte" (captions and series tag follow it).
export const FOX = '#e8743b';

const t = (sky, far, mid, near, light, glow, accent, em, tag) => ({ sky, far, mid, near, light, glow, accent, em, tag });

export const THEMES = {
  // Your Call: the night outside your window. Sodium street lamps on blue-black; red when the choice closes in.
  'your-call': {
    notte: t([[0, '#070b1c'], [.6, '#101a3a'], [1, '#26345f']], '#2b3a68', '#18234a', '#0b1024', '#ffd9a0', '#ffc27a', '#ffd34d', '#ffd34d', '#c8342b'),
    alba: t([[0, '#161a3a'], [.5, '#4a4570'], [.8, '#b0707a'], [1, '#f0b08a']], '#6a5a84', '#352f5c', '#15142e', '#ffe2b8', '#ffd08a', '#ffe08a', '#ffe08a', '#c8342b'),
    allarme: t([[0, '#0d0508'], [.6, '#2a0b12'], [1, '#5c1420']], '#4a1822', '#2a0e16', '#10060a', '#ff9a7a', '#ff6a4d', '#ffe9c0', '#ff6a55', '#ffffff'),
  },
  // What if: the sky and science. Deep space teal and violet, cold clean light, a clear yellow idea.
  'what-if': {
    notte: t([[0, '#030712'], [.6, '#0a1f33'], [1, '#14465c']], '#1d5266', '#0f3144', '#06141f', '#d8f4ff', '#9fe4ff', '#ffe066', '#ffe066', '#0f8f8a'),
    alba: t([[0, '#0a1b33'], [.45, '#1f5a73'], [.75, '#7fb8a8'], [1, '#f5dca0']], '#3e8088', '#1c4a5c', '#0a2233', '#fff1c8', '#ffe39a', '#fff0a0', '#fff0a0', '#0f8f8a'),
    allarme: t([[0, '#07060f'], [.6, '#1f0f2e'], [1, '#4a1a4a']], '#4a2352', '#29143a', '#0e0818', '#ffb0d0', '#ff7ab0', '#9fe4ff', '#9fe4ff', '#c2185b'),
  },
  // Misteri veri: old photographs and fog. Grey-green sea, sepia lamp, the colour of a document.
  misteri: {
    notte: t([[0, '#080c0e'], [.6, '#16242a'], [1, '#33474c']], '#3c5052', '#20302f', '#0a1110', '#f2dfb0', '#e8c787', '#e8c787', '#f0d28a', '#7a5a2a'),
    alba: t([[0, '#1a2226'], [.5, '#55666a'], [.8, '#a79c88'], [1, '#dcc9a0']], '#6f7c78', '#3d4a48', '#171e1d', '#fff0cf', '#f2d8a0', '#fff0cf', '#ffe9b8', '#7a5a2a'),
    allarme: t([[0, '#0c0808'], [.6, '#2a1512'], [1, '#54281c']], '#4e2a1e', '#2c1712', '#100807', '#ffc48a', '#ff9c54', '#ffe2b0', '#ffb36b', '#a3301e'),
  },
  // Regole dell'emergenza: the broadcast. Black, screen green, a warning red that means stop.
  regole: {
    notte: t([[0, '#040605'], [.6, '#0b1a12'], [1, '#17382a']], '#1f4a38', '#102a20', '#050c09', '#c8ffd8', '#8affb5', '#8affb5', '#8affb5', '#c8342b'),
    alba: t([[0, '#0a0f12'], [.5, '#2c3f3f'], [.8, '#7c8f76'], [1, '#d6d2a0']], '#4d6358', '#26362f', '#0d1512', '#f0ffd8', '#d8f5a0', '#d8f5a0', '#e6ffb0', '#c8342b'),
    allarme: t([[0, '#080303'], [.6, '#260606'], [1, '#600a0a']], '#520d0d', '#2e0808', '#0e0303', '#ff8a7a', '#ff4d3d', '#ffffff', '#ff5b4d', '#ffffff'),
  },
  // Telefono: a dark room lit only by the screen. Ink blue, screen white, the blue dot.
  telefono: {
    notte: t([[0, '#05060d'], [.7, '#0c1022'], [1, '#1a2140']], '#222b52', '#131830', '#07080f', '#cfe0ff', '#a8c8ff', '#7fd0ff', '#7fd0ff', '#2a5bd7'),
    alba: t([[0, '#0f1226'], [.5, '#3a3f66'], [.8, '#8e7f96'], [1, '#e6bfa6']], '#54537c', '#2c2d50', '#0f1022', '#ffe8d0', '#ffd9b8', '#ffe8d0', '#ffe8d0', '#2a5bd7'),
    allarme: t([[0, '#0a0507'], [.7, '#1c0a14'], [1, '#3a1026']], '#3a1530', '#1f0c1c', '#0b0509', '#ffb0c0', '#ff6a88', '#ffd0d8', '#ff7a95', '#d7263d'),
  },
  // Conto alla rovescia: a clock against you. Amber on charcoal, turning hot as the time runs out.
  'conto-alla-rovescia': {
    notte: t([[0, '#08080a'], [.6, '#16161c'], [1, '#2e2c34']], '#3a3640', '#201e26', '#0a0a0d', '#ffdf9a', '#ffbf4a', '#ffbf4a', '#ffcf4a', '#c8342b'),
    alba: t([[0, '#16161e'], [.5, '#4c4656'], [.8, '#a58a6a'], [1, '#efc98a']], '#6a5e66', '#3a3440', '#141218', '#ffeec0', '#ffd98a', '#ffeec0', '#ffe08a', '#c8342b'),
    allarme: t([[0, '#0c0504'], [.6, '#2e0e08'], [1, '#6a1e0c']], '#5a2010', '#32120a', '#110604', '#ffb46a', '#ff7a2e', '#fff0c0', '#ffc24a', '#d7261e'),
  },
  // Favole: the channel's original paper night. Blue, moonlit, kind.
  fiaba: {
    notte: t([[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']], '#6a86c2', '#3f5a92', '#0e1532', '#ffe2ae', '#ffb862', '#ffb862', '#ffb862', '#3f5a92'),
    alba: t([[0, '#1c2348'], [.45, '#5a5f92'], [.75, '#d59a8e'], [1, '#fbd0a0']], '#9a8fb0', '#5f5a8a', '#232349', '#fff0cc', '#ffd493', '#ffe2ae', '#ffd493', '#8a5a9a'),
    allarme: t([[0, '#0e0c24'], [.6, '#241a4a'], [1, '#4c2a6a']], '#54397a', '#2e2354', '#100c26', '#ffc8e0', '#ff9ac8', '#ffe2ae', '#ffc0dc', '#8a3a8a'),
  },
};

// Format names as they appear in meta.json ("your-call", "what-if", "mystery", "legend", "rules", "phone", "countdown", "fable")
const ALIAS = { mystery: 'misteri', legend: 'misteri', rules: 'regole', phone: 'telefono', countdown: 'conto-alla-rovescia', fable: 'fiaba' };

export function theme(format = 'fiaba', mood = 'notte') {
  const set = THEMES[format] || THEMES[ALIAS[format]] || THEMES.fiaba;
  return { ...(set[mood] || set.notte), fox: FOX };
}
