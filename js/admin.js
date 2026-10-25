const root = $('#root');
let tab = 'biz', editId = null;
const PASS_KEY = 'pass';
const getPass = () => DB.get(PASS_KEY, 'admin123');

function login() {
  root.innerHTML = `<div class="login"><div><img src="assets/logo.png" alt=""><h2 style="font-family:var(--d);font-size:36px;font-weight:400;margin:10px 0 20px">ВХОД В ПАНЕЛЬ</h2>
    <form class="f" id="lf"><input type="password" name="p" placeholder="Пароль" required autofocus><button class="btn">Войти</button></form>
    <p style="color:#8a8a8a;margin-top:14px;font-size:13px">Пароль по умолчанию: admin123 (смени в разделе «Настройки»)</p><p style="margin-top:20px"><a href="index.html" style="text-decoration:underline">← на сайт</a></p></div></div>`;
  $('#lf').onsubmit = e => { e.preventDefault(); if (new FormData(e.target).get('p') === getPass()) { sessionStorage.setItem('pth_admin', 1); panel(); } else toast('Неверный пароль'); };
}

const orders = () => DB.get('orders', []);
const products = () => DB.get('products', []);
const reviews = () => DB.get('reviews', []);

function panel() {
  const nav = [['biz', 'Бизнес-центр'], ['prod', 'Товары'], ['ord', 'Заказы'], ['rev', 'Отзывы'], ['set', 'Настройки']];
  root.innerHTML = `<div class="adm"><aside class="side"><a class="brand" href="index.html">PHANTOM.TROUPE.HATE</a>
    ${nav.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}
    <button id="out" style="margin-top:20px">Выйти</button></aside><div class="am" id="am"></div></div>`;
  $$('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; editId = null; panel(); });
  $('#out').onclick = () => { sessionStorage.removeItem('pth_admin'); login(); };
  ({ biz, prod, ord, rev, set })[tab]();
}

function biz() {
  const os = orders(), live = os.filter(o => o.status !== 'Отменён'), rev = live.reduce((a, o) => a + o.total, 0);
  const units = live.reduce((a, o) => a + o.items.reduce((b, i) => b + i.qty, 0), 0);
  const ps = products(), low = ps.filter(p => p.stock <= 3);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
  const sums = days.map(d => live.filter(o => new Date(o.date).toDateString() === d.toDateString()).reduce((a, o) => a + o.total, 0));
  const mx = Math.max(...sums, 1);
  const sold = {}; live.forEach(o => o.items.forEach(i => sold[i.name] = (sold[i.name] || 0) + i.qty));
  const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5);
  $('#am').innerHTML = `<h2>Бизнес-центр</h2>
    <div class="kpis">
      <div class="kpi"><b>${money(rev)}</b><span>Выручка</span></div>
      <div class="kpi"><b>${os.length}</b><span>Заказов всего</span></div>
      <div class="kpi"><b>${os.filter(o => o.status === 'Новый').length}</b><span>Новых заказов</span></div>
      <div class="kpi"><b>${live.length ? money(Math.round(rev / live.length)) : '—'}</b><span>Средний чек</span></div>
      <div class="kpi"><b>${units}</b><span>Продано единиц</span></div>
      <div class="kpi"><b>${reviews().length}</b><span>Отзывов</span></div></div>
    <div class="two"><div class="box"><h3>Выручка за 7 дней</h3><div class="bars" style="margin-bottom:30px">${sums.map((s, i) => `<div style="height:${s / mx * 100}%" title="${money(s)}"><i>${days[i].getDate()}.${days[i].getMonth() + 1}</i></div>`).join('')}</div></div>
    <div class="box"><h3>Топ товаров</h3>${top.map(([n, q]) => `<div class="row" style="padding:8px 0"><span class="g">${esc(n)}</span><b>${q} шт</b></div>`).join('') || '<p style="color:#8a8a8a">Продаж пока нет.</p>'}</div></div>
    <div class="box"><h3>Заканчивается на складе</h3>${low.map(p => `<div class="row" style="padding:8px 0"><span class="g">${esc(p.name)}</span><b>${p.stock} шт</b></div>`).join('') || '<p style="color:#8a8a8a">Всё в порядке.</p>'}</div>`;
}

function prod() {
  const p = editId ? products().find(x => x.id === editId) : null;
  const sizes = p ? p.sizes.join(',') : 'S,M,L,XL';
  $('#am').innerHTML = `<h2>Товары</h2><div class="box"><h3>${p ? 'Редактировать: ' + esc(p.name) : 'Новый товар'}</h3>
    <form class="f" id="pf" style="max-width:640px">
      <input name="name" placeholder="Название" required value="${p ? esc(p.name) : ''}">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><input name="price" type="number" min="0" placeholder="Цена" required value="${p ? p.price : ''}"><input name="stock" type="number" min="0" placeholder="Остаток" required value="${p ? p.stock : ''}"><input name="cat" placeholder="Категория" required value="${p ? esc(p.cat) : ''}"></div>
      <select name="col"><option value="main" ${p && p.col === 'main' ? 'selected' : ''}>Основная коллекция</option><option value="limited" ${p && p.col === 'limited' ? 'selected' : ''}>Лимитированная коллекция</option></select>
      <input name="sizes" placeholder="Размеры через запятую" value="${esc(sizes)}">
      <textarea name="desc" rows="3" placeholder="Описание">${p ? esc(p.desc) : ''}</textarea>
      <label style="color:#8a8a8a">Главное фото <input type="file" id="pfile" accept="image/*"></label>
      <label style="color:#8a8a8a">Галерея — можно выбрать сразу несколько фото (до 8) <input type="file" id="gfile" accept="image/*" multiple></label>
      <div id="gprev" class="gprev"></div>
      <div><button class="btn">${p ? 'Сохранить' : 'Добавить товар'}</button> ${p ? '<button type="button" class="btn ghost" id="cn">Отмена</button>' : ''}</div></form></div>
    <div class="box"><table><tr><th></th><th>Название</th><th>Коллекция</th><th>Цена</th><th>Остаток</th><th></th></tr>
    ${products().map(x => `<tr><td><img src="${x.img}" alt=""></td><td>${esc(x.name)}<br><small style="color:#8a8a8a">${esc(x.cat)}</small></td><td>${x.col === 'limited' ? 'Лимитка' : 'Основная'}</td><td>${money(x.price)}</td><td>${x.stock}</td>
    <td><button class="btn ghost sm" data-e="${x.id}">Изменить</button> <button class="btn red sm" data-d="${x.id}">Удалить</button></td></tr>`).join('')}</table></div>`;
  let img = p ? p.img : null, gal = p ? [...(p.gallery || [])] : [];
  const shrink = f => new Promise(ok => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 700 / im.width), c = document.createElement('canvas'); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .8)); }; im.src = r.result; }; r.readAsDataURL(f); });
  const drawG = () => {
    $('#gprev').innerHTML = gal.map((g, i) => `<div class="gth"><img src="${g}" alt=""><button type="button" data-gx="${i}" title="Убрать">×</button></div>`).join('') || '<small style="color:#8a8a8a">Дополнительных фото пока нет.</small>';
    $$('[data-gx]').forEach(b => b.onclick = () => { gal.splice(+b.dataset.gx, 1); drawG(); });
  }; drawG();
  $('#pfile').onchange = async e => { const f = e.target.files[0]; if (f) { img = await shrink(f); toast('Главное фото загружено'); } };
  $('#gfile').onchange = async e => {
    const fs = [...e.target.files].slice(0, 8 - gal.length);
    for (const f of fs) gal.push(await shrink(f));
    e.target.value = ''; drawG(); toast('Фото добавлены в галерею');
  };
  $('#pf').onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target), list = products();
    const data = { name: f.get('name').trim(), price: +f.get('price'), stock: +f.get('stock'), cat: f.get('cat').trim(), col: f.get('col'), sizes: f.get('sizes').split(',').map(s => s.trim()).filter(Boolean), desc: f.get('desc').trim(), gallery: gal, img: img || ph(f.get('name').toUpperCase().slice(0, 14)) };
    if (p) Object.assign(list.find(x => x.id === p.id), data); else list.push({ id: 'p' + uid(), ...data });
    DB.set('products', list); editId = null; toast(p ? 'Сохранено' : 'Товар добавлен'); panel();
  };
  if (p) $('#cn').onclick = () => { editId = null; panel(); };
  $$('[data-e]').forEach(b => b.onclick = () => { editId = b.dataset.e; panel(); scrollTo(0, 0); });
  $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('Удалить товар?')) { DB.set('products', products().filter(x => x.id !== b.dataset.d)); panel(); } });
}

function ord() {
  const os = orders().slice().reverse();
  $('#am').innerHTML = `<h2>Заказы</h2><div class="box">${os.length ? `<table><tr><th>Номер / дата</th><th>Клиент</th><th>Состав</th><th>Сумма</th><th>Статус</th><th></th></tr>
    ${os.map(o => `<tr><td><b>${esc(o.id)}</b><br><small style="color:#8a8a8a">${new Date(o.date).toLocaleString('ru-RU')}</small></td>
    <td>${esc(o.name)}<br>${esc(o.phone)}<br><small style="color:#8a8a8a">${esc(o.address)}${o.note ? '<br>«' + esc(o.note) + '»' : ''}</small></td>
    <td>${o.items.map(i => esc(i.name) + ' (' + i.size + ') ×' + i.qty).join('<br>')}</td><td>${money(o.total)}</td>
    <td><select class="in2" data-s="${o.id}" style="width:auto">${STATUSES.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td><button class="btn red sm" data-d="${o.id}">Удалить</button></td></tr>`).join('')}</table>` : '<div class="empty">Заказов пока нет. Они появятся здесь, когда клиент оформит покупку.</div>'}</div>`;
  $$('[data-s]').forEach(s => s.onchange = () => {
    const all = orders(), o = all.find(x => x.id === s.dataset.s); o.status = s.value; o.history.push({ s: s.value, d: new Date().toISOString() });
    if (s.value === 'Отменён') { const ps = products(); o.items.forEach(i => { const p = ps.find(x => x.id === i.id); if (p) p.stock += i.qty; }); DB.set('products', ps); }
    DB.set('orders', all); toast('Статус обновлён'); ord();
  });
  $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('Удалить заказ?')) { DB.set('orders', orders().filter(x => x.id !== b.dataset.d)); ord(); } });
}

function rev() {
  const rs = reviews().slice().reverse(), ps = products();
  $('#am').innerHTML = `<h2>Отзывы</h2><div class="box">${rs.length ? `<table><tr><th>Товар</th><th>Автор</th><th>Оценка</th><th>Текст</th><th></th></tr>
    ${rs.map(r => `<tr><td>${esc((ps.find(p => p.id === r.pid) || { name: 'удалён' }).name)}</td><td>${esc(r.name)}</td><td>${'★'.repeat(r.rating)}</td><td>${esc(r.text)}</td><td><button class="btn red sm" data-d="${r.id}">Удалить</button></td></tr>`).join('')}</table>` : '<div class="empty">Отзывов пока нет.</div>'}</div>`;
  $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('Удалить отзыв?')) { DB.set('reviews', reviews().filter(x => x.id !== b.dataset.d)); rev(); } });
}

function set() {
  $('#am').innerHTML = `<h2>Настройки</h2><div class="box"><h3>Сменить пароль</h3><form class="f" id="sf"><input type="password" name="p" placeholder="Новый пароль (от 6 символов)" minlength="6" required><button class="btn">Сохранить пароль</button></form></div>
    <div class="box"><h3>Данные</h3><p style="color:#8a8a8a;margin-bottom:12px">Всё хранится в браузере. Сбрось, чтобы вернуть демо-товары и очистить заказы.</p><button class="btn red" id="rs">Сбросить все данные</button></div>`;
  $('#sf').onsubmit = e => { e.preventDefault(); DB.set(PASS_KEY, new FormData(e.target).get('p')); toast('Пароль изменён'); e.target.reset(); };
  $('#rs').onclick = () => { if (confirm('Удалить все товары, заказы и отзывы?')) { Object.keys(localStorage).filter(k => k.startsWith('pth_') && k !== 'pth_' + PASS_KEY).forEach(k => localStorage.removeItem(k)); seed(); panel(); } };
}

sessionStorage.getItem('pth_admin') ? panel() : login();
