// シンプルなSVGチャート（外部ライブラリなし）
(function () {
  const AX = '#8A8686', GRID = '#E6EDF2';

  function line(o) {
    const W = o.width, H = o.height, L = 40, R = 12, T = 12, B = 28;
    const ymax = o.ymax || Math.max(...o.series.flatMap(s => s.values));
    const x = v => L + (v - o.xmin) / (o.xmax - o.xmin) * (W - L - R);
    const y = v => T + (1 - v / ymax) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">`;
    for (let i = 0; i <= 4; i++) {
      const v = ymax * i / 4;
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${GRID}"/>`;
      s += `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${AX}">${Math.round(v)}${i === 4 ? o.unit || '' : ''}</text>`;
    }
    (o.xticks || []).forEach(t => {
      s += `<text x="${x(t)}" y="${H - 8}" text-anchor="middle" font-size="11" font-weight="700" fill="${AX}">${o.xfmt ? o.xfmt(t) : t}</text>`;
    });
    o.series.forEach(se => {
      const pts = se.values.map((v, i) => `${x(o.xs[i]).toFixed(1)},${y(v).toFixed(1)}`);
      if (se.fill) s += `<polygon points="${x(o.xs[0])},${y(0)} ${pts.join(' ')} ${x(o.xs[se.values.length - 1])},${y(0)}" fill="${se.fill}"/>`;
      s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${se.color}" stroke-width="${se.width || 2}" stroke-linejoin="round" stroke-linecap="round" ${se.dash ? 'stroke-dasharray="6 6"' : ''}/>`;
    });
    if (o.nowX != null) {
      s += `<line x1="${x(o.nowX)}" x2="${x(o.nowX)}" y1="${T}" y2="${H - B}" stroke="#211716" stroke-width="2"/>`;
      s += `<rect x="${x(o.nowX) - 22}" y="${T - 2}" width="44" height="18" rx="3" fill="#211716"/><text x="${x(o.nowX)}" y="${T + 11}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">現在</text>`;
    }
    return s + '</svg>';
  }

  function bars(o) {
    const W = o.width, H = o.height, L = 40, R = 10, T = 18, B = 28;
    const ymax = o.ymax || Math.max(...o.values) * 1.15;
    const n = o.values.length, bw = (W - L - R) / n;
    const y = v => T + (1 - v / ymax) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">`;
    for (let i = 0; i <= 4; i++) {
      const v = ymax * i / 4;
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${GRID}"/>`;
      s += `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${AX}">${Math.round(v)}</text>`;
    }
    o.values.forEach((v, i) => {
      const cx = L + bw * i + bw / 2, w = bw * 0.56;
      s += `<rect x="${cx - w / 2}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" fill="${o.colors ? o.colors[i] : '#3790C9'}"/>`;
      s += `<text x="${cx}" y="${y(v) - 5}" text-anchor="middle" font-size="12" font-weight="800" fill="#211716">${v}</text>`;
      s += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="12" font-weight="800" fill="#4A4545">${o.labels[i]}</text>`;
    });
    return s + `<text x="${L - 8}" y="10" text-anchor="end" font-size="11" font-weight="700" fill="${AX}">${o.unit || ''}</text></svg>`;
  }

  function groupedBars(o) {
    const W = o.width, H = o.height, L = 46, R = 10, T = 26, B = 28;
    const ymax = Math.ceil(Math.max(...o.series.flatMap(s => s.values)) * 1.05 / 1000) * 1000;
    const n = o.labels.length, gw = (W - L - R) / n, k = o.series.length;
    const y = v => T + (1 - v / ymax) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">`;
    for (let i = 0; i <= 4; i++) {
      const v = ymax * i / 4;
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${GRID}"/>`;
      s += `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${AX}">${Math.round(v / 100) * 100}</text>`;
    }
    o.labels.forEach((lb, i) => {
      const bw = gw * 0.3;
      o.series.forEach((se, j) => {
        const x0 = L + gw * i + gw / 2 - (bw * k) / 2 + bw * j;
        s += `<rect x="${x0}" y="${y(se.values[i])}" width="${bw - 2}" height="${y(0) - y(se.values[i])}" rx="2" fill="${se.color}"/>`;
      });
      s += `<text x="${L + gw * i + gw / 2}" y="${H - 8}" text-anchor="middle" font-size="12" font-weight="800" fill="#4A4545">${lb}</text>`;
    });
    let lx = L;
    o.series.forEach(se => {
      s += `<rect x="${lx}" y="4" width="14" height="10" rx="2" fill="${se.color}"/><text x="${lx + 20}" y="13" font-size="12" font-weight="800" fill="#4A4545">${se.name}</text>`;
      lx += 90;
    });
    return s + '</svg>';
  }

  window.Charts = { line, bars, groupedBars };
})();
