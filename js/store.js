const app = $('#app');
const products = () => DB.get('products', []);
const cart = () => DB.get('cart', []);
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

function updCart() { $('#cc').textContent = cart().reduce((a, i) => a + i.qty, 0); }

function card(p) {
  const out = p.stock <= 0;
  return `<a class="card" href="#/product/${p.id}">
    ${out ? '<span class="tag out">нет в наличии</span>' : p.col === 'limited' ? '<span class="tag">LIMITED</span>' : ''}
    <div class="im"><img src="${p.img}" alt="${esc(p.name)}"></div>
    <div class="in"><b>${esc(p.name)}</b><span class="pr">${money(p.price)}</span></div></a>`;
}
function bindTilt() { $$('.card').forEach(c => tilt(c, 6)); }

const pages = {
  home() {
    const lim = products().filter(p => p.col === 'limited').slice(0, 3);
    const all = products().filter(p => p.col === 'main').slice(0, 4);
    const word = 'PHANTOM TROUPE HATE · ';
    return `<div class="hero">
      <div><h1>PHANTOM<span>TROUPE</span>HATE</h1>
      <p>Одежда для тех, кто не ищет одобрения. Чёрное, тяжёлое, без лишних слов.</p>
      <a class="btn" href="#/shop">В магазин</a> <a class="btn ghost" href="#/limited">Лимитка</a></div>
      <div class="scene" id="scene"><div class="logo3d" id="logo">${'<img src="assets/logo.png" alt="">'.repeat(5)}</div></div>
    </div>
    <div class="marq"><div>${word.repeat(10)}</div></div>
    <section class="pg"><h2 class="t">Лимитированная коллекция</h2><p class="sub">Малые серии. Когда номера заканчиваются, вещь не возвращается.</p>
      <div class="grid">${lim.map(card).join('') || '<div class="empty">Скоро</div>'}</div></section>
    <section class="pg"><h2 class="t">Основная линия</h2><div class="grid">${all.map(card).join('')}</div>
      <p style="margin-top:30px"><a class="btn ghost" href="#/shop">Весь каталог</a></p></section>`;
  },
  shop(cat) {
    const list = products().filter(p => p.col === 'main');
    const cats = ['Все', ...new Set(list.map(p => p.cat))];
    const cur = cat || 'Все';
    return `<section class="pg"><h2 class="t">Магазин</h2>
      <div class="filters">${cats.map(c => `<button class="chip ${c === cur ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="grid">${list.filter(p => cur === 'Все' || p.cat === cur).map(card).join('') || '<div class="empty">Здесь пока пусто.</div>'}</div></section>`;
  },
  limited() {
    return `<section class="pg"><h2 class="t">Лимитированная коллекция</h2><p class="sub">Каждая вещь выходит ограниченным тиражом. Смотри остаток в карточке.</p>
      <div class="grid">${products().filter(p => p.col === 'limited').map(card).join('') || '<div class="empty">Следующий дроп скоро.</div>'}</div></section>`;
  },
  about() {
    return `<section class="pg"><h2 class="t">О бренде</h2>
      <div class="man"><div style="padding-top:30px"><h3 style="font-size:34px">Мы не просим любить нас.</h3></div>
      <div style="padding-top:30px"><p>Phantom.troupe.hate — независимый бренд одежды. Мы делаем вещи в чёрном и белом, с одним красным пятном — как на нашем логотипе.</p><br><p>Малые тиражи, плотные ткани, принты, которые не стираются. Заказ можно отследить по номеру на странице «Заказ».</p></div></div></section>`;
  },
  product(id) {
    const p = products().find(x => x.id === id);
    if (!p) return `<section class="pg"><div class="empty">Товар не найден. <a href="#/shop" style="text-decoration:underline">В каталог</a></div></section>`;
    const revs = DB.get('reviews', []).filter(r => r.pid === id).reverse();
    const avg = revs.length ? (revs.reduce((a, r) => a + r.rating, 0) / revs.length).toFixed(1) : null;
    return `<section class="pg"><div class="prod">
      <div><div class="pimg"><div id="pi"><img id="mi" src="${p.img}" alt="${esc(p.name)}"></div></div>
        ${(p.gallery || []).length ? `<div class="thumbs">${[p.img, ...p.gallery].map((g, i) => `<button class="th ${i ? '' : 'on'}" data-i="${i}" aria-label="Фото ${i + 1}"><img src="${g}" alt=""></button>`).join('')}</div>` : ''}</div>
      <div><h1>${esc(p.name)}</h1>
        <div class="stars">${avg ? stars(Math.round(avg)) + ' <small style="color:#8a8a8a">' + avg + ' · ' + revs.length + ' отзывов</small>' : '<small style="color:#8a8a8a">Пока без отзывов</small>'}</div>
        <div class="price">${money(p.price)}</div><p style="color:#8a8a8a">${esc(p.desc)}</p>
        ${p.col === 'limited' ? `<p style="margin-top:10px"><b>Лимитка · осталось ${p.stock}</b></p>` : ''}
        ${p.stock > 0 ? `<div class="sizes" id="szs">${p.sizes.map((s, i) => `<button class="sz ${i ? '' : 'on'}" data-s="${s}">${s}</button>`).join('')}</div>
        <button class="btn" id="add">В корзину</button>` : '<p style="margin:20px 0"><b>Нет в наличии</b></p>'}
      </div></div>
      <h2 class="t" style="margin-top:80px;font-size:44px">Отзывы</h2>
      <div class="prod"><div>${revs.map(r => `<div class="rev"><b>${esc(r.name)}</b> <span class="stars">${stars(r.rating)}</span><p>${esc(r.text)}</p><small>${new Date(r.date).toLocaleDateString('ru-RU')}</small></div>`).join('') || '<div class="empty">Будь первым.</div>'}</div>
      <form class="f" id="rf"><h3 style="font-size:26px">Оставить отзыв</h3>
        <input name="name" placeholder="Имя" required maxlength="40">
        <select name="rating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select>
        <textarea name="text" rows="4" placeholder="Что думаешь о вещи?" required maxlength="600"></textarea>
        <button class="btn">Отправить отзыв</button></form></div></section>`;
  },
  cart() {
    const items = cart().map(i => ({ ...i, p: products().find(p => p.id === i.id) })).filter(i => i.p);
    const total = items.reduce((a, i) => a + i.p.price * i.qty, 0);
    if (!items.length) return `<section class="pg"><h2 class="t">Корзина</h2><div class="empty">Пока пусто. <a href="#/shop" style="text-decoration:underline">Выбрать вещи</a></div></section>`;
    return `<section class="pg"><h2 class="t">Корзина</h2><div class="prod"><div>
      ${items.map((i, n) => `<div class="row"><img src="${i.p.img}" alt=""><div class="g"><b>${esc(i.p.name)}</b><br><small style="color:#8a8a8a">Размер ${i.size} · ${money(i.p.price)}</small></div>
        <input type="number" min="1" max="${i.p.stock}" value="${i.qty}" data-q="${n}" class="in2" style="width:70px"><button class="btn ghost sm" data-rm="${n}">×</button></div>`).join('')}
      <h3 style="font-size:34px;margin-top:20px">Итого: ${money(total)}</h3></div>
      <form class="f" id="of"><h3 style="font-size:26px">Оформление</h3>
        <input name="name" placeholder="Имя и фамилия" required><input name="phone" placeholder="Телефон" required>
        <input name="address" placeholder="Город, адрес / отделение доставки" required>
        <textarea name="note" rows="2" placeholder="Комментарий (необязательно)"></textarea>
        <button class="btn">Оформить заказ</button></form></div></section>`;
  },
  track(code) {
    let res = '';
    if (code) {
      const o = DB.get('orders', []).find(x => x.id.toLowerCase() === code.trim().toLowerCase());
      if (!o) res = '<div class="empty" style="margin-top:30px">Заказ с таким номером не найден. Проверь номер.</div>';
      else {
        const flow = ['Новый', 'Оплачен', 'Собирается', 'Отправлен', 'В пути', 'Доставлен'];
        const idx = flow.indexOf(o.status);
        res = `<div style="margin-top:34px"><h3 style="font-size:30px">${esc(o.id)} · ${esc(o.status)}</h3><p style="color:#8a8a8a">${o.items.map(i => esc(i.name) + ' (' + i.size + ') ×' + i.qty).join(', ')} — ${money(o.total)}</p>
        ${o.status === 'Отменён' ? '<p style="margin-top:20px"><b>Заказ отменён.</b></p>' : `<div class="tl">${flow.map((s, i) => `<div class="${i <= idx ? 'done' : ''} ${i === idx ? 'cur' : ''}">${s}${(o.history.find(h => h.s === s) || {}).d ? ' <small>· ' + new Date(o.history.find(h => h.s === s).d).toLocaleString('ru-RU') + '</small>' : ''}</div>`).join('')}</div>`}</div>`;
      }
    }
    return `<section class="pg"><h2 class="t">Отследить заказ</h2><p class="sub">Введи номер, который получил после оформления (например, PTH-4821).</p>
      <form class="f" id="tf" style="grid-template-columns:1fr auto;max-width:520px"><input name="c" placeholder="PTH-0000" value="${esc(code || '')}" required><button class="btn">Найти</button></form>${res}</section>`;
  }
};

function route() {
  const [, r, a] = location.hash.split('/');
  const name = r || 'home';
  app.innerHTML = (pages[name] || pages.home)(a ? decodeURIComponent(a) : undefined);
  $$('nav.links a').forEach(l => l.classList.toggle('on', l.dataset.r === name));
  scrollTo(0, 0); updCart(); bind(name, a);
}

function bind(name, arg) {
  bindTilt();
  if (name === 'home' || !name) {
    const sc = $('#scene'), lg = $('#logo');
    if (sc) { sc.addEventListener('mousemove', e => { const r = sc.getBoundingClientRect(); lg.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * 40}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 30}deg)`; }); sc.addEventListener('mouseleave', () => lg.style.transform = '');
      sc.addEventListener('touchmove', e => { const t = e.touches[0], r = sc.getBoundingClientRect(); lg.style.transform = `rotateY(${((t.clientX - r.left) / r.width - .5) * 50}deg) rotateX(${-((t.clientY - r.top) / r.height - .5) * 36}deg)`; }, { passive: true });
      sc.addEventListener('touchend', () => lg.style.transform = ''); }
  }
  if (name === 'shop') $$('[data-cat]').forEach(b => b.onclick = () => { app.innerHTML = pages.shop(b.dataset.cat); bind('shop'); });
  if (name === 'product') {
    tilt($('.pimg'), 12, $('#pi'));
    const cur = products().find(p => p.id === arg), imgs = cur ? [cur.img, ...(cur.gallery || [])] : [];
    let gi = 0; const show = i => { gi = (i + imgs.length) % imgs.length; $('#mi').src = imgs[gi]; $$('.th').forEach((t, n) => t.classList.toggle('on', n === gi)); };
    $$('.th').forEach(t => t.onclick = () => show(+t.dataset.i));
    if (imgs.length > 1) { let x0; const pi = $('#pi'); pi.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); pi.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(gi + (dx < 0 ? 1 : -1)); }); pi.addEventListener('click', () => show(gi + 1)); pi.style.cursor = 'pointer'; }
    let size = (products().find(p => p.id === arg) || {}).sizes?.[0];
    $$('.sz').forEach(b => b.onclick = () => { $$('.sz').forEach(x => x.classList.remove('on')); b.classList.add('on'); size = b.dataset.s; });
    const add = $('#add'); if (add) add.onclick = () => {
      const c = cart(), f = c.find(i => i.id === arg && i.size === size);
      f ? f.qty++ : c.push({ id: arg, size, qty: 1 }); DB.set('cart', c); updCart(); toast('Добавлено в корзину');
    };
    $('#rf').onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target), rv = DB.get('reviews', []);
      rv.push({ id: uid(), pid: arg, name: f.get('name').trim(), rating: +f.get('rating'), text: f.get('text').trim(), date: new Date().toISOString() });
      DB.set('reviews', rv); toast('Отзыв опубликован'); route();
    };
  }
  if (name === 'cart') {
    $$('[data-rm]').forEach(b => b.onclick = () => { const c = cart(); c.splice(+b.dataset.rm, 1); DB.set('cart', c); route(); });
    $$('[data-q]').forEach(i => i.onchange = () => { const c = cart(); c[+i.dataset.q].qty = Math.max(1, +i.value || 1); DB.set('cart', c); route(); });
    const of = $('#of'); if (of) of.onsubmit = e => {
      e.preventDefault(); const f = new FormData(of), ps = products();
      const items = cart().map(i => { const p = ps.find(x => x.id === i.id); return p && { id: p.id, name: p.name, size: i.size, qty: i.qty, price: p.price }; }).filter(Boolean);
      const bad = items.find(i => ps.find(p => p.id === i.id).stock < i.qty);
      if (bad) return toast('Недостаточно остатка: ' + bad.name);
      items.forEach(i => ps.find(p => p.id === i.id).stock -= i.qty); DB.set('products', ps);
      const orders = DB.get('orders', []), id = 'PTH-' + Math.floor(1000 + Math.random() * 9000), now = new Date().toISOString();
      orders.push({ id, date: now, name: f.get('name'), phone: f.get('phone'), address: f.get('address'), note: f.get('note'), items, total: items.reduce((a, i) => a + i.price * i.qty, 0), status: 'Новый', history: [{ s: 'Новый', d: now }] });
      DB.set('orders', orders); DB.set('cart', []); updCart();
      app.innerHTML = `<section class="pg"><h2 class="t">Заказ принят</h2><p class="sub">Твой номер заказа:</p><h1 style="font-size:90px">${id}</h1><p class="sub" style="margin-top:14px">Сохрани его — по нему можно отследить заказ.</p><a class="btn" href="#/track/${id}">Отследить</a></section>`;
    };
  }
  if (name === 'track') $('#tf').onsubmit = e => { e.preventDefault(); location.hash = '#/track/' + encodeURIComponent(new FormData(e.target).get('c').trim()); };
}

addEventListener('hashchange', route); route();
