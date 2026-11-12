// Campus Flow デモデータ（明治大学 駿河台キャンパス想定・数値はすべて試算用のダミー）
(function () {
  const DAYS = ['月', '火', '水', '木', '金', '土'];
  const DAY_FACTOR = [1.0, 1.06, 0.97, 1.02, 0.9, 0.42];
  const HOURS = [];
  for (let h = 8; h <= 21; h++) HOURS.push(h);

  // 授業時限（明治大学の時間割を想定）
  const PERIODS = [
    { n: 1, s: 9.0, e: 10.67, label: '1限 9:00-10:40' },
    { n: 2, s: 10.83, e: 12.5, label: '2限 10:50-12:30' },
    { n: 3, s: 13.5, e: 15.17, label: '3限 13:30-15:10' },
    { n: 4, s: 15.33, e: 17.0, label: '4限 15:20-17:00' },
    { n: 5, s: 17.17, e: 18.83, label: '5限 17:10-18:50' },
    { n: 6, s: 19.0, e: 20.67, label: '6限 19:00-20:40' },
  ];

  // 位置はおおよそ（デモ用）
  const FACILITIES = [
    { id: 'lt-cafe', name: '学生食堂', short: '学食', place: 'リバティタワー', type: 'cafeteria', typeName: '学食', cap: 520, lat: 35.69733, lng: 139.76170 },
    { id: 'b12-cafe', name: 'カフェテリア', short: '12号館 学食', place: '12号館', type: 'cafeteria', typeName: '学食', cap: 300, lat: 35.69832, lng: 139.76222 },
    { id: 'lt-class', name: '教室フロア', short: '教室', place: 'リバティタワー', type: 'classroom', typeName: '教室', cap: 4200, lat: 35.69764, lng: 139.76136 },
    { id: 'gf-class', name: '教室', short: 'GF 教室', place: 'グローバルフロント', type: 'classroom', typeName: '教室', cap: 1500, lat: 35.69927, lng: 139.76221 },
    { id: 'lib', name: '中央図書館', short: '図書館', place: '中央図書館', type: 'library', typeName: '図書館', cap: 1400, lat: 35.69744, lng: 139.76072 },
    { id: 'ac-club', name: '部室・練習場', short: '部室・練習場', place: 'アカデミーコモン', type: 'club', typeName: '部室・練習場', cap: 400, lat: 35.69874, lng: 139.76200 },
    { id: 'b14-club', name: '練習室', short: '練習室', place: '14号館', type: 'club', typeName: '部室・練習場', cap: 160, lat: 35.69859, lng: 139.76044 },
  ];

  const CAMPUS_CENTER = [35.69830, 139.76135];

  function gauss(x, mu, s) { return Math.exp(-((x - mu) ** 2) / (2 * s * s)); }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }
  function inPeriod(h) { return PERIODS.some(p => h >= p.s && h < p.e); }

  // 混雑率 0-100
  function occupancy(f, day, h) {
    const id = typeof f === 'string' ? f : f.id;
    const fac = FACILITIES.find(x => x.id === id) || f;
    const df = DAY_FACTOR[day];
    let v;
    switch (fac.type) {
      case 'cafeteria':
        v = 8 + 92 * gauss(h, 12.85, 0.5) + 28 * gauss(h, 18.2, 0.7) + 14 * gauss(h, 15.2, 0.6);
        if (fac.id === 'b12-cafe') v *= 0.86;
        break;
      case 'classroom':
        v = inPeriod(h) ? 50 + 30 * gauss(h, 12, 3) : 12;
        if (h < 8.8 || h > 20.7) v = 3;
        break;
      case 'library':
        v = 10 + 72 * gauss(h, 15.2, 2.6) + 10 * gauss(h, 12.8, 0.5);
        if (h > 21.5) v = 2;
        break;
      case 'club':
        v = 6 + 78 * gauss(h, 18.4, 1.3) + 18 * gauss(h, 12.8, 0.6);
        if (day === 5) v = 10 + 70 * gauss(h, 14, 2.4);
        break;
      default: v = 20;
    }
    v = v * (day === 5 && fac.type === 'club' ? 1 : df);
    v += (hash(id + day + ':' + Math.round(h * 2)) - 0.5) * 8;
    return Math.max(2, Math.min(99, Math.round(v)));
  }

  function level(v) { return v < 20 ? 0 : v < 40 ? 1 : v < 60 ? 2 : v < 80 ? 3 : 4; }
  const LEVEL_LABEL = ['空いている', 'やや空き', '普通', 'やや混雑', '混雑'];
  const LEVEL_COLOR = ['#E9F6FD', '#A9DFF7', '#5BBDE8', '#128FC9', '#0B4F8A'];

  function matrix(f) {
    return DAYS.map((_, d) => HOURS.map(h => occupancy(f, d, h + 0.5)));
  }

  // 「現在」= 2030年4月17日(水) 12:40
  const NOW = { day: 2, h: 12.67, label: '2030年4月17日（水）12:40' };

  function fmtTime(h) {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return hh + ':' + String(mm).padStart(2, '0');
  }

  window.CF = { DAYS, HOURS, PERIODS, FACILITIES, CAMPUS_CENTER, occupancy, level, LEVEL_LABEL, LEVEL_COLOR, matrix, NOW, fmtTime, hash };
})();
