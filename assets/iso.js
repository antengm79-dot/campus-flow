// 立体（アイソメ）ヒートマップ：間取り＋ヒート＋人の流れ
(function () {
  const STOPS = [[0, [217, 243, 252, 0]], [.15, [217, 243, 252, 150]], [.35, [117, 214, 255, 190]], [.55, [47, 205, 234, 210]], [.75, [18, 143, 201, 225]], [1, [11, 63, 110, 235]]];
  const PAL = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255; let k = 0; while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
    const [t0, c0] = STOPS[k], [t1, c1] = STOPS[k + 1], u = (t - t0) / (t1 - t0);
    for (let j = 0; j < 4; j++) PAL[i * 4 + j] = c0[j] + (c1[j] - c0[j]) * Math.max(0, Math.min(1, u));
  }
  const h = (s) => CF.hash(s);

  // 廊下の上下に部屋が並ぶ間取りを作る
  function corridorPlan(o) {
    const rooms = [], walls = [[0, 0, 520, 0], [520, 0, 520, 340], [0, 0, 0, 340], [0, 340, 520, 340]];
    const hot = [], tags = [];
    const CY0 = o.cy0 || 150, CY1 = o.cy1 || 190;
    rooms.push({ n: o.corridor || '廊下', r: [0, CY0, 520, CY1 - CY0], f: '#F4F7FA', label: false });
    const row = (list, y0, y1, top) => {
      let x = 0;
      list.forEach((rm, i) => {
        const w = rm.w;
        rooms.push({ n: rm.n, r: [x, y0, w, y1 - y0], f: rm.v > 0.05 ? '#E8EEF3' : '#EEF2F5', kind: rm.kind || o.furn });
        const dy = top ? y1 : y0;
        const d0 = x + w / 2 - 14, d1 = x + w / 2 + 14;
        walls.push([x, dy, d0, dy], [d1, dy, x + w, dy]);
        if (i > 0) walls.push([x, y0, x, y1]);
        if (rm.v > 0.05) {
          const k = Math.max(1, Math.round(rm.v * 4));
          for (let j = 0; j < k; j++) hot.push([x + w * (0.25 + 0.5 * h(rm.n + j)), y0 + (y1 - y0) * (0.25 + 0.5 * h(rm.n + 'y' + j)), Math.min(1, rm.v + 0.1)]);
        }
        if (rm.tag) tags.push([x + w / 2, (y0 + y1) / 2, rm.tag, rm.v > 0.6 ? 'hot' : rm.v < 0.1 ? 'cool' : '']);
        x += w;
      });
    };
    row(o.top, 0, CY0, true);
    row(o.bottom, CY1, 340, false);
    (o.corrHot || []).forEach(p => hot.push(p));
    return {
      label: o.label, stats: o.stats, foot: o.foot, rooms, walls, hot, tags,
      flows: o.flows || ['M8,170 L510,170'],
      furn: fc => rooms.forEach(rm => furnish(fc, rm)),
    };
  }
  function furnish(fc, rm) {
    const [x, y, w, hh] = rm.r;
    fc.fillStyle = '#D3DDE5';
    if (rm.kind === 'desk') for (let i = 0; i < Math.floor((hh - 30) / 22); i++) fc.fillRect(x + 12, y + 14 + i * 22, w - 24, 7);
    if (rm.kind === 'table') { fc.fillRect(x + w * 0.25, y + hh * 0.35, w * 0.5, hh * 0.3); }
    if (rm.kind === 'piano') { fc.fillStyle = '#B7C6D2'; fc.fillRect(x + 10, y + 12, w * 0.45, 18); }
    if (rm.kind === 'mirror') { fc.fillStyle = '#C6D8E6'; fc.fillRect(x + 6, y + 6, w - 12, 6); }
  }

  const PLANS = {
    cafe: {
      label: '学食（リバティタワー）',
      stats: [['いま店内', '463人'], ['受取の行列', '18人']],
      foot: '混雑：受取カウンター・中央の客席　／　空いている：窓側の席',
      rooms: [{ n: '客席ホール', r: [0, 0, 370, 340], f: '#EEF3F6' }, { n: '厨房', r: [370, 0, 150, 150], f: '#E1E8EE' }, { n: '券売機・受取', r: [370, 150, 150, 100], f: '#E9EFF4' }, { n: '入口', r: [370, 250, 150, 90], f: '#F3F6F9' }],
      walls: [[0, 0, 520, 0], [520, 0, 520, 340], [0, 0, 0, 340], [0, 340, 430, 340], [490, 340, 520, 340], [370, 0, 370, 30], [370, 130, 370, 150], [370, 150, 520, 150], [370, 150, 370, 170], [370, 320, 370, 340], [450, 250, 520, 250]],
      furn: fc => {
        fc.fillStyle = '#D3DDE5';
        for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) fc.fillRect(18 + i * 56, 22 + j * 62, 36, 22);
        fc.fillStyle = '#B7C6D2'; fc.fillRect(380, 20, 120, 16); fc.fillRect(380, 60, 50, 60); fc.fillRect(450, 60, 50, 60);
        fc.fillStyle = '#7F93A3'; for (let i = 0; i < 6; i++) fc.fillRect(382 + i * 22, 160, 14, 14);
        fc.fillStyle = '#9FB1BF'; fc.fillRect(372, 40, 8, 80);
      },
      hot: [[330, 80, 1], [345, 120, .9], [300, 60, .85], [240, 90, .9], [180, 120, .95], [120, 90, .8], [200, 200, .85], [260, 230, .8], [140, 230, .7], [60, 60, .45], [40, 290, .3], [100, 300, .35], [400, 200, .9], [450, 195, .75], [460, 300, .55]],
      flows: ['M460,336 L460,205 L410,205', 'M395,190 L355,95', 'M340,80 L210,110 L130,170'],
      tags: [[340, 70, '受取カウンター 行列18人', 'hot'], [190, 150, '客席 89%', 'hot'], [440, 185, '券売機 待ち6人', ''], [50, 300, '窓側の席 42%', 'cool']],
    },
    class: corridorPlan({
      label: '教室（リバティタワー 10階）', furn: 'desk',
      stats: [['使用中', '3 / 8室'], ['空調 自動OFF', '5室']],
      foot: '使用中：1101・1103・1106　／　無人：5室は空調・照明を自動OFF',
      top: [{ n: '1101', w: 130, v: .85, tag: '1101 ゼミ 28人' }, { n: '1102', w: 130, v: 0, tag: '1102 無人→空調OFF' }, { n: '1103', w: 130, v: .6 }, { n: '1104', w: 130, v: 0 }],
      bottom: [{ n: '1105', w: 130, v: 0 }, { n: '1106', w: 130, v: .45, tag: '1106 自習 9人' }, { n: '1107', w: 130, v: 0, tag: '1107 無人→空調OFF' }, { n: '1108', w: 130, v: 0 }],
      corrHot: [[60, 170, .5], [250, 170, .6], [460, 170, .7]],
      flows: ['M500,170 L300,170 L65,140', 'M300,170 L195,195'],
    }),
    gym: {
      label: '体育館（猿楽町）',
      stats: [['いま館内', '46人'], ['空調 自動OFF', '2 / 6エリア']],
      foot: '使用中：アリーナ（バスケ部 昼練）・トレーニング室　／　無人：器具庫・更衣室B',
      rooms: [{ n: 'アリーナ', r: [0, 0, 380, 340], f: '#EFE9DF' }, { n: '更衣室', r: [380, 0, 140, 110], f: '#E8EEF3' }, { n: '器具庫', r: [380, 110, 140, 90], f: '#EEF2F5' }, { n: 'トレーニング', r: [380, 200, 140, 140], f: '#E8EEF3' }],
      walls: [[0, 0, 520, 0], [520, 0, 520, 340], [0, 0, 0, 340], [0, 340, 300, 340], [350, 340, 520, 340], [380, 0, 380, 40], [380, 80, 380, 130], [380, 170, 380, 230], [380, 280, 380, 340], [380, 110, 520, 110], [380, 200, 520, 200]],
      furn: fc => {
        fc.strokeStyle = '#C9B89A'; fc.lineWidth = 2; fc.strokeRect(30, 30, 320, 280); fc.beginPath(); fc.moveTo(190, 30); fc.lineTo(190, 310); fc.stroke();
        fc.beginPath(); fc.arc(190, 170, 36, 0, Math.PI * 2); fc.stroke();
        fc.fillStyle = '#B7C6D2'; for (let i = 0; i < 4; i++) fc.fillRect(395 + (i % 2) * 60, 225 + Math.floor(i / 2) * 50, 40, 22);
      },
      hot: [[120, 120, .9], [150, 200, .85], [90, 230, .7], [230, 150, .75], [260, 220, .6], [430, 260, .7], [470, 300, .55], [440, 50, .3]],
      flows: ['M325,336 L325,250 L250,190', 'M330,250 L400,255'],
      tags: [[150, 160, 'アリーナ 38人', 'hot'], [450, 270, 'トレーニング 8人', ''], [450, 150, '器具庫 無人→OFF', 'cool']],
    },
    club: corridorPlan({
      label: '部室（アカデミーコモン 3階）', furn: 'table',
      stats: [['使用中', '6 / 10室'], ['空調 自動OFF', '4室']],
      foot: '使用中：軽音・写真・放送など6室　／　無人：4室は空調を自動OFF',
      top: [{ n: '3F-01', w: 104, v: .8, tag: '軽音部 12人' }, { n: '3F-02', w: 104, v: .5 }, { n: '3F-03', w: 104, v: 0 }, { n: '3F-04', w: 104, v: .7 }, { n: '3F-05', w: 104, v: 0, tag: '3F-05 無人→OFF' }],
      bottom: [{ n: '3F-06', w: 104, v: .4 }, { n: '3F-07', w: 104, v: 0 }, { n: '3F-08', w: 104, v: .9, tag: '放送部 15人' }, { n: '3F-09', w: 104, v: .3 }, { n: '3F-10', w: 104, v: 0 }],
      corrHot: [[150, 170, .4], [380, 170, .5]],
      flows: ['M10,170 L260,170 L260,205', 'M260,170 L360,130'],
    }),
    studio: corridorPlan({
      label: 'スタジオ・音楽練習室（14号館）',
      stats: [['使用中', '5 / 8室'], ['空調 自動OFF', '3室']],
      foot: '使用中：ダンススタジオA・練習室1/2/4/6　／　無人：3室は空調を自動OFF',
      top: [{ n: 'ダンススタジオA', w: 260, v: .85, kind: 'mirror', tag: 'スタジオA 22人' }, { n: 'ダンススタジオB', w: 260, v: 0, kind: 'mirror', tag: 'スタジオB 無人→OFF' }],
      bottom: [{ n: '練習室1', w: 87, v: .5, kind: 'piano' }, { n: '練習室2', w: 87, v: .4, kind: 'piano' }, { n: '練習室3', w: 87, v: 0, kind: 'piano' }, { n: '練習室4', w: 87, v: .6, kind: 'piano', tag: '練習室4 3人' }, { n: '練習室5', w: 86, v: 0, kind: 'piano' }, { n: '練習室6', w: 86, v: .45, kind: 'piano' }],
      flows: ['M10,170 L130,170 L130,120', 'M130,170 L300,170 L300,205'],
    }),
    elv: corridorPlan({
      label: 'エレベーターホール（リバティタワー 1階）', corridor: 'エレベーターホール', cy0: 90, cy1: 250,
      stats: [['待っている人', '34人'], ['稼働', '4 / 6基']],
      foot: '3限前の13:10〜13:30は1階の上りが集中。空いている時間帯は2基を停止',
      top: [{ n: '1号機', w: 87, v: 0 }, { n: '2号機', w: 87, v: 0 }, { n: '3号機', w: 87, v: 0 }, { n: '4号機', w: 87, v: 0 }, { n: '5号機', w: 86, v: 0, tag: '5号機 停止中' }, { n: '6号機', w: 86, v: 0 }],
      bottom: [{ n: 'エントランス', w: 520, v: .3 }],
      corrHot: [[90, 130, 1], [180, 140, .95], [270, 130, .9], [140, 200, .85], [240, 200, .8], [360, 150, .6], [430, 130, .4]],
      flows: ['M260,330 L260,220 L180,140', 'M260,220 L330,140'],
    }),
  };
  PLANS.elv.tags.push([200, 170, '待ち 34人', 'hot']);

  function create(host, key) {
    host.innerHTML = `<div class="iso-stats"></div><div class="iso-stage"><div class="iso"><canvas class="f" width="1040" height="680"></canvas><canvas class="h" width="1040" height="680"></canvas><svg viewBox="0 0 520 340"></svg></div><div class="iso-tags"></div></div>`;
    const stage = host.querySelector('.iso-stage'), iso = host.querySelector('.iso');
    const fc = host.querySelector('canvas.f').getContext('2d'); fc.scale(2, 2);
    const hx = host.querySelector('canvas.h').getContext('2d');
    const tmp = document.createElement('canvas'); tmp.width = 520; tmp.height = 340; const tx = tmp.getContext('2d');
    let plan = PLANS[key];
    function drawFloor() {
      fc.clearRect(0, 0, 520, 340);
      fc.fillStyle = '#F4F7FA'; fc.fillRect(0, 0, 520, 340);
      plan.rooms.forEach(rm => { const [x, y, w, hh] = rm.r; fc.fillStyle = rm.f; fc.fillRect(x, y, w, hh); });
      plan.furn(fc);
      fc.fillStyle = '#4A4545'; fc.textAlign = 'center';
      plan.rooms.forEach(rm => {
        if (rm.label === false) return;
        const [x, y, w, hh] = rm.r;
        fc.font = `900 ${w < 100 ? 11 : 13}px "Noto Sans JP"`;
        fc.fillText(rm.n, x + w / 2, y + (hh > 150 ? hh - 14 : hh / 2 + 4));
      });
    }
    function drawHeat(tm) {
      tx.clearRect(0, 0, 520, 340);
      plan.hot.forEach(([x, y, v], i) => {
        const vv = Math.max(.05, Math.min(1, v + Math.sin(tm / 900 + i * 1.7) * 0.08));
        const r = 30 + vv * 22;
        const g = tx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(0,0,0,${vv * 0.8})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        tx.fillStyle = g; tx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      const img = tx.getImageData(0, 0, 520, 340), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const a = Math.min(255, d[i + 3] * 1.25) | 0; d[i] = PAL[a * 4]; d[i + 1] = PAL[a * 4 + 1]; d[i + 2] = PAL[a * 4 + 2]; d[i + 3] = PAL[a * 4 + 3]; }
      tx.putImageData(img, 0, 0);
      hx.clearRect(0, 0, 1040, 680); hx.drawImage(tmp, 0, 0, 1040, 680);
    }
    function placeTags() {
      const st = stage.getBoundingClientRect(); if (!st.width) return;
      const el = host.querySelector('.iso-tags'); el.innerHTML = '';
      plan.tags.forEach(([x, y, t, c]) => {
        const m = document.createElement('i'); m.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:1px;height:1px;`;
        iso.appendChild(m); const r = m.getBoundingClientRect(); m.remove();
        const d = document.createElement('div'); d.className = 'itag ' + c; d.textContent = t;
        d.style.left = (r.left - st.left) + 'px'; d.style.top = (r.top - st.top - 14) + 'px';
        el.appendChild(d);
      });
    }
    function setPlan(k) {
      plan = PLANS[k];
      iso.querySelectorAll('.wall').forEach(w => w.remove());
      plan.walls.forEach(([x1, y1, x2, y2]) => {
        const len = Math.hypot(x2 - x1, y2 - y1); if (len < 1) return;
        const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const w = document.createElement('div'); w.className = 'wall' + (x1 === x2 ? ' v' : '');
        w.style.cssText = `left:${x1}px;top:${y1}px;width:${len}px;transform:rotateZ(${ang}deg) rotateX(90deg);`;
        iso.appendChild(w);
      });
      drawFloor(); document.fonts.ready.then(drawFloor);
      let svg = `<defs><marker id="ah-${key}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0B3F6E"/></marker></defs>`;
      plan.flows.forEach((d, i) => {
        svg += `<path d="${d}" fill="none" stroke="#0B3F6E" stroke-width="3" stroke-linejoin="round" stroke-dasharray="7 5" marker-end="url(#ah-${key})" opacity=".85"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite"/></path>`;
        for (let k = 0; k < 3; k++) svg += `<circle r="4" fill="#fff" stroke="#0B3F6E" stroke-width="2"><animateMotion dur="${4 + i}s" begin="${-k * (4 + i) / 3}s" repeatCount="indefinite" path="${d}"/></circle>`;
      });
      host.querySelector('svg').innerHTML = svg;
      host.querySelector('.iso-stats').innerHTML = `<div><span>${plan.label}</span></div>` + plan.stats.map(([a, b]) => `<div><span>${a}</span><b class="num">${b}</b></div>`).join('');
      drawHeat(performance.now());
      requestAnimationFrame(placeTags);
      return plan;
    }
    setInterval(() => drawHeat(performance.now()), 700);
    window.addEventListener('resize', placeTags);
    setPlan(key);
    return { setPlan, placeTags, get plan() { return plan; } };
  }
  window.ISO = { create, PLANS };
})();
