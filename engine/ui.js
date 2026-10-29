// Screen elements from the viral models (research/analisi/, pipeline/formati/): the resources bar, a phone and its apps,
// an emergency alert on TV with numbered rules, a security monitor, a peephole, a countdown, a red tint, a name caption,
// the two-choice end card and the "Part 2" card. All driven by script.json (whole film) and its lines; HTML over the canvas.
const CSS = `
#ui { position: absolute; inset: 0; pointer-events: none; font-family: Anton; color: #fbf3e4; }
#ui > div { position: absolute; opacity: 0; }
#ui .bar { left: 50px; right: 50px; top: 120px; display: flex; gap: 10px; }
#ui .bar div { flex: 1; padding: 8px 10px 6px; background: rgba(12,14,22,.82); border: 2px solid rgba(255,255,255,.12); text-align: center; }
#ui .bar small { display: block; font-size: 20px; letter-spacing: .08em; color: #9aa6c4; }
#ui .bar b { display: block; font-weight: 400; font-size: 38px; color: #7fd0ff; }
#ui .bar .alert b { color: #ff4d3d; }
#ui .phone { left: 290px; top: 300px; width: 500px; height: 900px; border-radius: 60px; background: #0d0f16; border: 12px solid #1c1f2a;
  box-shadow: 0 30px 80px rgba(0,0,0,.65), 0 0 0 3px #2c3040; font-family: -apple-system, "Segoe UI", Arial, sans-serif; overflow: hidden; }
#ui .phone .notch { position: absolute; left: 50%; top: 14px; width: 130px; height: 32px; margin-left: -65px; border-radius: 16px; background: #000; }
#ui .phone .scr { position: absolute; inset: 70px 30px 40px; }
#ui .phone .app { font-size: 26px; letter-spacing: .08em; text-transform: uppercase; color: #8a93ad; font-weight: 700; }
#ui .phone .big { font-size: 150px; font-weight: 800; line-height: 1; margin-top: 30px; letter-spacing: -.02em; }
#ui .phone .red { color: #ff4d4d; }
#ui .phone .sub { font-size: 30px; color: #b9c0d4; margin-top: 18px; }
#ui .phone .time { font-size: 140px; font-weight: 300; text-align: center; margin-top: 40px; }
#ui .phone .date { font-size: 30px; text-align: center; color: #c9cfdf; }
#ui .phone .note { margin-top: 26px; padding: 18px 20px; border-radius: 26px; background: rgba(255,255,255,.1); font-size: 28px; }
#ui .phone .note b { display: block; font-size: 22px; color: #9aa3bb; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 4px; }
#ui .phone .bubble { margin-top: 26px; max-width: 80%; padding: 18px 22px; border-radius: 28px; font-size: 32px; }
#ui .phone .bubble.them { background: #2a2d38; }
#ui .phone .bubble.me { background: #2f6df6; margin-left: auto; }
#ui .phone svg { display: block; width: 100%; margin-top: 30px; }
#ui .tv { left: 70px; right: 70px; top: 380px; height: 520px; background: #12080a; border: 14px solid #262a33; box-shadow: 0 30px 80px rgba(0,0,0,.6); overflow: hidden; }
#ui .tv .head { background: #d4231f; padding: 14px 24px; font-size: 40px; letter-spacing: .04em; }
#ui .tv .rule { text-align: center; margin-top: 36px; font-size: 44px; color: #ffd84a; letter-spacing: .06em; }
#ui .tv .txt { text-align: center; font-size: 96px; line-height: 1.02; padding: 6px 40px 0; text-transform: uppercase; }
#ui .tv .ticker { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 0; background: #fbf3e4; color: #12080a; font-size: 30px; white-space: nowrap; }
#ui .cctv { inset: 0; background: repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 2px, transparent 2px 5px); box-shadow: inset 0 0 220px rgba(0,0,0,.85);
  font-family: "Courier New", monospace; font-size: 34px; }
#ui .cctv .rec { position: absolute; left: 70px; top: 300px; color: #ff4d4d; }
#ui .cctv .cam { position: absolute; right: 70px; top: 300px; }
#ui .cctv .ts { position: absolute; left: 70px; top: 950px; }
#ui .peep { inset: 0; background: radial-gradient(circle 430px at 540px 680px, transparent 0 88%, rgba(0,0,0,.6) 93%, #050507 97%); }
#ui .timer { left: 340px; top: 470px; width: 400px; height: 400px; border-radius: 50%; display: grid; place-items: center; text-align: center;
  background: rgba(10,10,14,.85); }
#ui .timer svg { position: absolute; inset: 0; }
#ui .timer b { font-weight: 400; font-size: 96px; }
#ui .timer small { display: block; font-size: 26px; letter-spacing: .1em; color: #ffcf4a; }
#ui .tint { inset: 0; background: radial-gradient(circle at 50% 40%, rgba(200,24,20,.25), rgba(120,0,0,.6)); mix-blend-mode: multiply; }
#ui .name { left: 70px; top: 905px; padding-left: 14px; border-left: 6px solid #ff8a3d; }
#ui .name b { display: block; font-weight: 400; font-size: 46px; letter-spacing: .04em; }
#ui .name small { font-family: Cormorant; font-size: 32px; font-style: italic; color: #d9cbb4; }
#ui .choice { inset: 0; background: rgba(6,8,14,.72); display: flex; flex-direction: column; align-items: center; padding-top: 430px; }
#ui .choice .q { font-size: 84px; line-height: 1.02; text-align: center; padding: 0 80px; text-transform: uppercase; }
#ui .choice .opts { display: flex; gap: 40px; margin-top: 70px; }
#ui .choice .opt { width: 400px; padding: 30px 20px; text-align: center; border: 4px solid #ffb862; background: rgba(255,184,98,.08); }
#ui .choice .opt b { display: block; font-weight: 400; font-size: 78px; color: #ffb862; }
#ui .choice .opt:last-child { border-color: #7fd0ff; background: rgba(127,208,255,.08); }
#ui .choice .opt:last-child b { color: #7fd0ff; }
#ui .choice .opt small { font-family: Cormorant; font-size: 34px; font-style: italic; color: #d9cbb4; }
#ui .choice .n { margin-top: 50px; font-size: 40px; letter-spacing: .06em; color: #ffcf4a; }
#ui .next { inset: 0; background: #07080d; display: flex; flex-direction: column; align-items: center; justify-content: center; }
#ui .next b { font-weight: 400; font-size: 190px; color: #ff4d3d; line-height: 1; }
#ui .next small { font-size: 44px; letter-spacing: .08em; margin-top: 20px; padding: 10px 26px; border: 3px solid #fbf3e4; }
#ui .next i { font-family: Cormorant; font-style: normal; font-size: 40px; margin-top: 40px; color: #ffb862; }
#pop.quote { color: #ff6b5b; font-style: italic; }
`;

export function makeUI({ script, C, esc, ss, seg, COVER }) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const root = document.createElement('div'); root.id = 'ui';
  document.getElementById('sub').before(root);
  const lines = script.lines;
  const box = (cls) => { const d = document.createElement('div'); d.className = cls; root.append(d); return d; };
  const els = { bar: box('bar'), tint: box('tint'), peep: box('peep'), cctv: box('cctv'), tv: box('tv'), phone: box('phone'), timer: box('timer'), name: box('name'), choice: box('choice'), next: box('next') };
  if (script.bar) document.getElementById('hud').style.top = '250px';   // the series tag goes under the bar
  const fade = (t, a, b, k = .2) => Math.min(ss(seg(t, a, a + k)), 1 - ss(seg(t, b - k, b)));
  // a line's element lasts from its start to the next line's start (or its own `hold` seconds)
  const span = (L, i) => { const a = C[L.id].at - .1, nx = lines[i + 1]; return [a, L.hold ? a + L.hold : nx ? C[nx.id].at - .05 : C[L.id].end + 1.5]; };
  const active = (key, t) => { for (let i = lines.length - 1; i >= 0; i--) { const L = lines[i]; if (L[key] == null) continue; const [a, b] = span(L, i); if (t >= a && t < b) return { L, a, b }; } return null; };
  const memo = {};
  const set = (k, html) => { if (memo[k] !== html) { memo[k] = html; els[k].innerHTML = html; } };
  const n = (x) => Number(x).toLocaleString('en-US');

  function phoneHTML(p, t, a, b) {
    const k = ss(seg(t, a + .1, Math.min(b, a + 2.2)));
    switch (p.app) {
      case 'steps': return `<div class="app">Steps · today</div><div class="big">${n(Math.round((p.from ?? 0) + ((p.value ?? 0) - (p.from ?? 0)) * k))}</div><div class="sub">${esc(p.sub || 'You were asleep.')}</div>
        <svg viewBox="0 0 400 160">${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 16 + 4}" y="${i === 15 ? 10 : 130}" width="10" height="${i === 15 ? 150 : 30}" fill="${i === 15 ? '#ff4d4d' : '#3a4056'}"/>`).join('')}</svg>`;
      case 'health': return `<div class="app">Sleep · heart rate</div><div class="sub">${esc(p.title || '')}</div><div class="big red">${esc(String(p.value ?? ''))}</div>
        <svg viewBox="0 0 400 140"><polyline fill="none" stroke="#ff4d4d" stroke-width="5" points="${Array.from({ length: 41 }, (_, i) => `${i * 10},${70 - (i > 26 && i < 31 ? (i % 2 ? 60 : -50) : Math.sin(i) * 6) * Math.min(1, k * 1.5)}`).join(' ')}"/></svg>`;
      case 'map': return `<div class="app">${esc(p.title || 'Route')}</div><svg viewBox="0 0 400 560"><rect x="20" y="20" width="360" height="520" fill="#151826" stroke="#2c3148"/>
        ${['4A', '4B', '4C'].map((r, i) => `<rect x="${40 + i * 115}" y="60" width="100" height="120" fill="${r === p.to ? '#3a1c22' : '#1d2133'}" stroke="#2c3148"/><text x="${90 + i * 115}" y="130" fill="#8a93ad" font-size="30" text-anchor="middle">${r}</text>`).join('')}
        <path d="M200 500 L200 300 L${p.to === '4C' ? 320 : p.to === '4A' ? 90 : 205} 300 L${p.to === '4C' ? 320 : p.to === '4A' ? 90 : 205} 190" fill="none" stroke="#ff4d4d" stroke-width="8" stroke-dasharray="18 12" stroke-dashoffset="${(1 - k) * 600}" pathLength="600"/>
        <circle cx="200" cy="500" r="14" fill="#7fd0ff"/></svg>`;
      case 'messages': return `<div class="app" style="text-align:center">${esc(p.from || '')}</div>${(p.thread || [{ me: false, text: p.text }]).map((m, i, arr) => `<div class="bubble ${m.me ? 'me' : 'them'}" style="opacity:${t > a + .3 + i * .7 ? 1 : 0}">${esc(m.text || '')}</div>`).join('')}`;
      case 'lock': return `<div class="date">${esc(p.date || '')}</div><div class="time">${esc(p.time || '')}</div>${(p.notes || []).map((x, i) => `<div class="note" style="opacity:${t > a + .4 + i * .8 ? 1 : 0}"><b>${esc(x.app || '')}</b>${esc(x.text || '')}</div>`).join('')}`;
      default: return `<div class="app">${esc(p.app || '')}</div><div class="big">${esc(String(p.value ?? ''))}</div><div class="sub">${esc(p.sub || '')}</div>`;
    }
  }
  const clockTick = (from, secs) => { const [h, m, s] = String(from).split(':').map(Number); let x = Math.max(0, (h * 3600 + m * 60 + (s || 0)) - Math.floor(secs));
    return [Math.floor(x / 3600), Math.floor(x / 60) % 60, x % 60].map((v, i) => i ? String(v).padStart(2, '0') : String(v).padStart(2, '0')).join(':'); };

  return function update(t) {
    if (COVER) { root.style.display = 'none'; return; }
    const pop = document.getElementById('pop');
    // resources bar: script.bar, updated by the lines that carry a new `bar`
    if (script.bar) {
      const upd = lines.filter((L) => L.bar && t >= C[L.id].at - .1).pop();
      const items = upd ? script.bar.map((x) => ({ ...x, ...(upd.bar.find?.((y) => y.label === x.label) || {}) })) : script.bar;
      set('bar', items.map((x) => `<div class="${x.alert ? 'alert' : ''}"><small>${esc(x.label)}</small><b>${esc(x.value)}</b></div>`).join(''));
      els.bar.style.opacity = 1;
    }
    for (const [key, el] of [['tint', 'tint'], ['peephole', 'peep'], ['cctv', 'cctv'], ['tv', 'tv'], ['phone', 'phone'], ['timer', 'timer'], ['name', 'name']]) {
      const A = active(key, t);
      els[el].style.opacity = A ? fade(t, A.a, A.b) : 0;
      if (!A) continue;
      const v = A.L[key];
      if (key === 'cctv') set('cctv', `<span class="rec">● REC</span><span class="cam">${esc(v.cam || 'CAM 01')}</span><span class="ts">${esc(v.time || 'HR 07:50')}:${String(Math.floor((t - A.a) * 1) % 60).padStart(2, '0')}</span>`);
      if (key === 'tv') set('tv', `<div class="head">⚠ ${esc(v.title || 'EMERGENCY ALERT')}</div>${v.rule ? `<div class="rule">${esc(v.rule)}</div>` : ''}<div class="txt">${esc(v.text || '')}</div>${v.ticker ? `<div class="ticker" style="transform:translateX(${(-((t - A.a) * 140) % 1400).toFixed(0)}px)">${esc((v.ticker + ' · ').repeat(4))}</div>` : ''}`);
      if (key === 'phone') els.phone.innerHTML = `<div class="notch"></div><div class="scr">${phoneHTML(v, t, A.a, A.b)}</div>`;
      if (key === 'timer') { const left = clockTick(v.from || v.wait || '00:10:00', v.wait ? (t - A.a) * 60 : t - A.a), k = (t - A.a) / Math.max(1, A.b - A.a);
        els.timer.innerHTML = `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="186" fill="none" stroke="#2c3148" stroke-width="14"/><circle cx="200" cy="200" r="186" fill="none" stroke="#ff4d3d" stroke-width="14" stroke-dasharray="${(1169 * (1 - k)).toFixed(0)} 2000" transform="rotate(-90 200 200)"/></svg><div><b>${left.replace(/^00:/, '')}</b><small>${esc(v.label || (v.wait ? 'WAITING' : 'HOURS TO GO'))}</small></div>`; }
      if (key === 'name') set('name', `<b>${esc(v.name || '')}</b><small>${esc(v.role || '')}</small>`);
    }
    // a line said by another character: italic red caption
    const q = lines.find((L) => L.quote && t >= C[L.id].at - .1 && t < C[L.id].end + .25);
    pop.classList.toggle('quote', Boolean(q));
    // the end: two choices, then the "Part 2" card
    const last = lines[lines.length - 1], DUR = window.DUR;
    let hudOff = false;   // the end cards cover the screen: the series tag steps aside
    if (script.choice) {
      const c = script.choice, a = c.at ?? C[last.id].at - .2, b = script.next ? DUR - 2.6 : DUR;
      els.choice.style.opacity = t >= a ? fade(t, a, b + .2, .3) : 0;
      hudOff = hudOff || t >= a;
      set('choice', `<div class="q">${esc(c.question || '')}</div><div class="opts">${[c.a, c.b].filter(Boolean).map((o) => `<div class="opt"><b>${esc(o.word)}</b><small>${esc(o.sub || '')}</small></div>`).join('')}</div><div class="n">${esc(c.note || 'COMMENT ONE WORD')}</div>`);
      pop.style.opacity = t >= a ? 0 : 1;
    }
    if (script.next) {
      const a = DUR - 2.6;
      els.next.style.opacity = t >= a ? ss(seg(t, a, a + .3)) : 0;
      hudOff = hudOff || t >= a;
      set('next', `<b>${esc(script.next.title || 'PART 2')}</b><small>${esc((script.next.sub || 'Follow for part 2').toUpperCase())}</small><i>@lanternfox.tales</i>`);
    }
    document.getElementById('hud').style.visibility = hudOff ? 'hidden' : 'visible';
  };
}
