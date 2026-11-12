// 防犯カメラ（写真素材）＋ AI検知枠 ＋ ヒートマップ重ね表示
// 人物はプライバシー保護のためシルエットで匿名化して表示する
(function () {
  const SIL = '<svg viewBox="0 0 20 40" preserveAspectRatio="none"><circle cx="10" cy="7" r="6"/><path d="M1 40 Q1 15 10 15 Q19 15 19 40Z"/></svg>';
  // 写真ごとの「床」の範囲（%）と遠近
  const FLOOR = {
    cafe: [8, 92, 58, 92], class1: [6, 94, 52, 96], class2: [6, 94, 55, 95], gym: [10, 90, 50, 92],
    studio: [8, 92, 52, 90], music: [10, 70, 55, 92], club1: [10, 90, 55, 92], club2: [10, 80, 52, 92], elevator: [20, 80, 50, 90],
  };
  function people(photo, n, seed) {
    const [x0, x1, y0, y1] = FLOOR[photo] || [10, 90, 50, 92];
    const out = [];
    for (let i = 0; i < n; i++) {
      const r1 = CF.hash(seed + 'x' + i), r2 = CF.hash(seed + 'y' + i);
      const y = y0 + (y1 - y0) * r2;
      const s = 0.5 + (y - y0) / (y1 - y0) * 0.9; // 手前ほど大きく
      out.push({ x: x0 + (x1 - x0) * r1, y, w: 5.2 * s, h: 15 * s });
    }
    return out.sort((a, b) => a.y - b.y);
  }
  // opts: {photo, n, seed, id, heat:true, boxes:true, pos:'50% 50%', time}
  function html(o) {
    const ppl = people(o.photo, Math.min(o.n, 26), o.seed || o.id);
    const heat = ppl.length && o.heat !== false
      ? ppl.map(p => `radial-gradient(circle at ${p.x}% ${p.y - p.h * 0.3}%, rgba(11,63,110,.55) 0, rgba(18,143,201,.42) 4%, rgba(47,205,234,.25) 8%, rgba(117,214,255,0) 13%)`).join(',')
      : 'none';
    const boxes = o.boxes === false ? '' : ppl.map(p => `<i class="pbox" style="left:${(p.x - p.w / 2).toFixed(1)}%;top:${(p.y - p.h).toFixed(1)}%;width:${p.w.toFixed(1)}%;height:${p.h.toFixed(1)}%">${SIL}</i>`).join('');
    return `<div class="cam ${o.cls || ''}">
      <img src="assets/cam/${o.photo}.jpg" alt="" style="object-position:${o.pos || '50% 50%'}" loading="lazy">
      <div class="cheat" style="background:${heat}"></div>
      <div class="cboxes">${boxes}</div>
      <div class="ctop"><span class="rec">● REC</span><span>${o.id}</span></div>
      <div class="cbot"><span>${o.time || '2030-04-17 12:40:' + String(10 + Math.floor(CF.hash(o.id) * 49)).padStart(2, '0')}</span><span class="cnt">${o.n ? '検知 ' + o.n + '人' : '無人'}</span></div>
    </div>`;
  }
  window.CAM = { html };
})();
