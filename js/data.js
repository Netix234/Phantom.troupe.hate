/* Phantom.troupe.hate — общий слой данных (localStorage). Валюта и пароль админа меняются здесь/в админке. */
const CUR = '₴';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => Number(n).toLocaleString('ru-RU') + ' ' + CUR;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DB = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('pth_' + k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pth_' + k, JSON.stringify(v)); } catch (e) { alert('Память браузера заполнена — используй фото поменьше.'); } }
};
const uid = () => Math.random().toString(36).slice(2, 9);
const STATUSES = ['Новый', 'Оплачен', 'Собирается', 'Отправлен', 'В пути', 'Доставлен', 'Отменён'];

function ph(name, dark) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${dark ? '#111' : '#1b1b1b'}"/><path d="M120 90l50-20q30 28 60 0l50 20 70 60-40 50-30-20v230H120V190l-30 20-40-50z" fill="${dark ? '#000' : '#050505'}" stroke="#fff" stroke-width="3"/><path d="M165 250l35-30 35 30-35 40z" fill="#8b0000"/><text x="200" y="450" fill="#fff" font-family="Impact,sans-serif" font-size="22" text-anchor="middle" letter-spacing="3">${name}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function seed() {
  if (DB.get('seeded')) return;
  DB.set('products', [
    { id: 'p1', name: 'WINGS OF HATE Hoodie', price: 2400, cat: 'Худи', col: 'main', stock: 14, sizes: ['S', 'M', 'L', 'XL'], desc: 'Тяжёлое чёрное худи, оверсайз. Принт крыльев на спине.', img: ph('WINGS HOODIE') },
    { id: 'p2', name: 'Troupe Tee', price: 950, cat: 'Футболки', col: 'main', stock: 30, sizes: ['S', 'M', 'L', 'XL'], desc: 'Плотный хлопок 240 г. Белый принт, мелкая надпись на груди.', img: ph('TROUPE TEE', 1) },
    { id: 'p3', name: 'Phantom Cargo', price: 1900, cat: 'Штаны', col: 'main', stock: 9, sizes: ['M', 'L', 'XL'], desc: 'Карго свободного кроя, чёрный нейлон.', img: ph('PHANTOM CARGO') },
    { id: 'p4', name: 'Bloodline Longsleeve', price: 1300, cat: 'Футболки', col: 'main', stock: 18, sizes: ['S', 'M', 'L'], desc: 'Лонгслив с красной вышивкой на рукаве.', img: ph('BLOODLINE', 1) },
    { id: 'p5', name: 'No.001 Crimson Wings Jacket', price: 4800, cat: 'Куртки', col: 'limited', stock: 3, sizes: ['M', 'L'], desc: 'Лимитированная серия — 20 штук. Номерная бирка, красная подкладка.', img: ph('No.001 JACKET') },
    { id: 'p6', name: 'No.002 Ash Hoodie', price: 3200, cat: 'Худи', col: 'limited', stock: 6, sizes: ['S', 'M', 'L', 'XL'], desc: 'Выбеленное худи, ручная обработка. Серия 30 штук.', img: ph('No.002 ASH', 1) }
  ]);
  DB.set('orders', []); DB.set('reviews', [
    { id: uid(), pid: 'p1', name: 'Данил', rating: 5, text: 'Плотное, сидит как надо. Принт не трескается.', date: new Date().toISOString() }
  ]);
  DB.set('seeded', 1);
}
seed();

/* пепел на фоне */
function ash() {
  const c = document.getElementById('ash'); if (!c || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const x = c.getContext('2d'); let w, h; const P = [];
  const rs = () => { w = c.width = innerWidth; h = c.height = innerHeight; }; rs(); addEventListener('resize', rs);
  for (let i = 0; i < 70; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .3, v: Math.random() * .5 + .15, a: Math.random() * .5 + .1, red: Math.random() < .12 });
  (function f() { x.clearRect(0, 0, w, h); P.forEach(p => { p.y += p.v; p.x += Math.sin(p.y / 60) * .3; if (p.y > h) { p.y = -5; p.x = Math.random() * w; } x.fillStyle = p.red ? `rgba(139,0,0,${p.a + .2})` : `rgba(255,255,255,${p.a})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.3); x.fill(); }); requestAnimationFrame(f); })();
}
ash();

/* 3D-наклон по курсору */
function tilt(el, max = 10, inner) {
  el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; (inner || el).style.transform = `rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg)`; });
  el.addEventListener('mouseleave', () => (inner || el).style.transform = '');
  el.addEventListener('touchmove', e => { const t = e.touches[0], r = el.getBoundingClientRect(), px = (t.clientX - r.left) / r.width - .5, py = (t.clientY - r.top) / r.height - .5; (inner || el).style.transform = `rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg)`; }, { passive: true });
  el.addEventListener('touchend', () => (inner || el).style.transform = '');
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 2200); }
