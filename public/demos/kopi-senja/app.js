/* Kopi Senja: toko online contoh. Semua data di localStorage (kunci kopi-senja.v1). */
var KEY = "kopi-senja.v1", ADMKEY = "kopi-senja.admin";
var SZ = [["Reguler", 0], ["Besar", 6000]];
var AD = [["Extra shot", 5000], ["Susu oat", 7000], ["Less sugar", 0]];
var ZONES = [["Zona 1: sekitar toko (0-3 km)", 8000], ["Zona 2: 3-8 km", 15000], ["Zona 3: 8-15 km", 25000]];
var FREE_SHIP = 100000;
var SLOTS = ["Secepatnya", "16.00 - 17.00", "17.00 - 18.00", "18.00 - 19.00"];
var PAYS = [["transfer", "Transfer bank", "Rekening contoh, bukan rekening asli"], ["qris", "QRIS", "Kode contoh, tidak bisa dipindai"], ["cod", "Bayar di tempat", "Tunai saat pesanan tiba"]];
var STATUS = ["baru", "diproses", "dikirim", "selesai", "batal"];
var IMGS = ["espresso.jpg", "latte.jpg", "kopi-susu.jpg", "cold-brew.jpg", "matcha.jpg", "cokelat.jpg", "croissant.jpg", "biji-kopi.jpg"];

var db, fcat = "Semua", fq = "", fsort = "", trk = null, editP = null, editR = null, armed = null;
var ofs = "", ofq = "";

function $(i) { return document.getElementById(i); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function rp(n) { return "Rp" + Math.round(n).toLocaleString("id-ID"); }
function digits(s) { return String(s || "").replace(/\D/g, ""); }
function pad(n, l) { n = String(n); while (n.length < l) n = "0" + n; return n; }
function fdate(iso) { return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function dkey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2); }
function toast(m) { var t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("on"); }, 2800); }

/* ---------- data ---------- */
function seedProducts() {
  return [
    { id: 1, n: "Espresso", c: "Kopi", p: 18000, i: "espresso.jpg", d: "Dua shot pekat dengan crema tebal.", b: "Terlaris", stock: 40, show: true, opt: true },
    { id: 2, n: "Cafe Latte", c: "Kopi", p: 28000, i: "latte.jpg", d: "Espresso dan susu hangat dengan seni latte.", b: "", stock: 30, show: true, opt: true },
    { id: 3, n: "Kopi Susu Gula Aren", c: "Kopi", p: 25000, i: "kopi-susu.jpg", d: "Kopi susu dingin dengan gula aren.", b: "Favorit", stock: 25, show: true, opt: true },
    { id: 4, n: "Cold Brew", c: "Kopi", p: 30000, i: "cold-brew.jpg", d: "Diseduh dingin 16 jam, rasa lembut.", b: "", stock: 12, show: true, opt: true },
    { id: 5, n: "Matcha Latte", c: "Non-kopi", p: 30000, i: "matcha.jpg", d: "Matcha pekat dengan susu.", b: "", stock: 18, show: true, opt: true },
    { id: 6, n: "Churros dan Cokelat", c: "Non-kopi", p: 32000, i: "cokelat.jpg", d: "Churros hangat dengan cokelat pekat.", b: "Baru", stock: 10, show: true, opt: false },
    { id: 7, n: "Croissant Mentega", c: "Camilan", p: 22000, i: "croissant.jpg", d: "Dipanggang pagi, renyah di luar.", b: "", stock: 3, show: true, opt: false },
    { id: 8, n: "Biji Kopi 250 g", c: "Biji kopi", p: 78000, i: "biji-kopi.jpg", d: "Sangrai medium, cocok untuk semua metode seduh.", b: "", stock: 20, show: true, opt: false }
  ];
}
function seedPromos() {
  return [
    { code: "SENJA10", type: "pct", val: 10, max: 20000, min: 0, on: true, used: 2 },
    { code: "HEMAT20", type: "flat", val: 20000, max: 0, min: 150000, on: true, used: 1 },
    { code: "ONGKIR0", type: "ship", val: 0, max: 0, min: 60000, on: true, used: 0 },
    { code: "LEBARAN", type: "pct", val: 15, max: 0, min: 0, on: false, used: 0 }
  ];
}
function newDb() {
  var d = { v: 1, products: seedProducts(), promos: seedPromos(), orders: [], cart: [], wish: [], promo: "", draft: {}, last: null, seq: 0, pid: 9, pin: "1234" };
  db = d;
  var seeds = [
    [[[2, 1, [0], 2], [7, 0, [], 1]], "Rina Contoh", "0812-0000-0001", "antar", 0, "SENJA10", "selesai", 6 * 24],
    [[[8, 0, [], 2]], "Budi Contoh", "0812-0000-0002", "ambil", 0, "", "selesai", 5 * 24 + 3],
    [[[4, 0, [], 3], [1, 0, [], 2], [6, 0, [], 1]], "Sari Contoh", "0812-0000-0003", "antar", 1, "HEMAT20", "selesai", 3 * 24],
    [[[3, 1, [2], 2]], "Dimas Contoh", "0812-0000-0004", "antar", 2, "", "batal", 2 * 24],
    [[[5, 0, [1], 1], [3, 0, [], 1]], "Lestari Contoh", "0812-0000-0005", "ambil", 0, "", "dikirim", 20],
    [[[2, 0, [0, 1], 1]], "Agus Contoh", "0812-0000-0006", "antar", 0, "", "diproses", 5],
    [[[1, 1, [], 2], [7, 0, [], 2]], "Wulan Contoh", "0812-0000-0007", "antar", 1, "SENJA10", "baru", 1]
  ];
  seeds.forEach(function (s) {
    var lines = s[0].map(function (l) { return { pid: l[0], s: l[1], a: l[2], note: "", q: l[3] }; });
    var o = buildOrder(lines, { name: s[1], phone: s[2], mode: s[3], zone: s[4], addr: s[3] === "antar" ? "Jl. Contoh No. 10, Kota Contoh" : "", slot: SLOTS[0], pay: "transfer", note: "" }, s[5]);
    var t = new Date(Date.now() - s[7] * 3600000).toISOString();
    o.t = t; o.no = orderNo(new Date(t)); o.status = s[6];
    o.log = [{ s: "baru", t: t }];
    if (s[6] !== "baru") o.log.push({ s: s[6], t: new Date(new Date(t).getTime() + 1800000).toISOString() });
    db.orders.push(o);
  });
  return d;
}
function load() {
  try { var r = localStorage.getItem(KEY); if (r) { var d = JSON.parse(r); if (d && d.v === 1 && d.products) { db = d; return d; } } } catch (e) { }
  var d2 = newDb(); db = d2; save(); return d2;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
function prod(id) { for (var i = 0; i < db.products.length; i++) if (db.products[i].id === +id) return db.products[i]; return null; }
function shown() { return db.products.filter(function (p) { return p.show; }); }

/* ---------- harga, stok, promo ---------- */
function unit(p, l) {
  var u = p.p;
  if (p.opt) { u += (SZ[l.s] || SZ[0])[1]; (l.a || []).forEach(function (i) { if (AD[i]) u += AD[i][1]; }); }
  return u;
}
function optText(p, l) {
  if (!p.opt) return "";
  return [(SZ[l.s] || SZ[0])[0]].concat((l.a || []).filter(function (i) { return AD[i]; }).map(function (i) { return AD[i][0]; })).join(", ");
}
function inCart(pid, skipIdx) { var n = 0; db.cart.forEach(function (l, k) { if (l.pid === +pid && k !== skipIdx) n += l.q; }); return n; }
function cartCount() { return db.cart.reduce(function (a, l) { return a + l.q; }, 0); }
function cleanCart() {
  var before = db.cart.length;
  db.cart = db.cart.filter(function (l) { var p = prod(l.pid); return p && p.show; });
  if (db.cart.length !== before) { save(); toast("Item yang tidak tersedia dihapus dari keranjang."); }
}
function evalPromo(code, sub, mode) {
  code = String(code || "").trim().toUpperCase();
  if (!code) return { ok: false, msg: "Masukkan kode promo dulu." };
  var pr = null; db.promos.forEach(function (x) { if (x.code === code) pr = x; });
  if (!pr) return { ok: false, msg: "Kode \"" + code + "\" tidak dikenal. Periksa ejaannya." };
  if (!pr.on) return { ok: false, msg: "Kode " + code + " sedang tidak aktif." };
  if (sub < pr.min) return { ok: false, msg: "Kode " + code + " berlaku untuk belanja minimal " + rp(pr.min) + ". Tambah " + rp(pr.min - sub) + " lagi." };
  if (pr.type === "ship" && mode === "ambil") return { ok: false, msg: "Kode " + code + " hanya untuk pesanan antar." };
  var disc = 0, fs = false;
  if (pr.type === "pct") { disc = Math.round(sub * pr.val / 100); if (pr.max) disc = Math.min(disc, pr.max); }
  else if (pr.type === "flat") disc = Math.min(pr.val, sub);
  else fs = true;
  return { ok: true, disc: disc, freeShip: fs, code: code, msg: "Kode " + code + " dipakai" + (fs ? ": gratis ongkir." : ": hemat " + rp(disc) + ".") };
}
function totals(lines, mode, zone, code) {
  var sub = 0; lines.forEach(function (l) { var p = prod(l.pid); if (p) sub += unit(p, l) * l.q; });
  var pr = code ? evalPromo(code, sub, mode) : null, disc = pr && pr.ok ? pr.disc : 0;
  var ship = 0;
  if (mode === "antar") { ship = (ZONES[zone] || ZONES[0])[1]; if (sub - disc >= FREE_SHIP || (pr && pr.ok && pr.freeShip)) ship = 0; }
  return { sub: sub, disc: disc, ship: ship, total: sub - disc + ship, promo: pr };
}
function orderNo(d) { db.seq++; return "KS-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2) + "-" + pad(db.seq, 3); }
function buildOrder(lines, f, code) {
  var t = totals(lines, f.mode, f.zone, code), ok = t.promo && t.promo.ok;
  return {
    no: "", t: new Date().toISOString(), name: f.name, phone: f.phone, mode: f.mode, zone: f.mode === "antar" ? f.zone : -1, addr: f.mode === "antar" ? f.addr : "", slot: f.slot, pay: f.pay, note: f.note,
    lines: lines.map(function (l) { var p = prod(l.pid); return { pid: l.pid, n: p.n, o: optText(p, l), note: l.note || "", q: l.q, u: unit(p, l) }; }),
    sub: t.sub, disc: t.disc, code: ok ? t.promo.code : "", ship: t.ship, total: t.total, status: "baru", log: [{ s: "baru", t: new Date().toISOString() }]
  };
}
function findOrder(no) { for (var i = 0; i < db.orders.length; i++) if (db.orders[i].no === no) return db.orders[i]; return null; }
function stLabel(s, o) { return { baru: "Pesanan baru", diproses: "Diproses", dikirim: o && o.mode === "ambil" ? "Siap diambil" : "Dikirim", selesai: "Selesai", batal: "Dibatalkan" }[s] || s; }
function pill(o) { return '<span class="pill ' + esc(o.status) + '">' + esc(stLabel(o.status, o)) + "</span>"; }
function modeText(o) { return o.mode === "antar" ? "Antar (" + (ZONES[o.zone] ? ZONES[o.zone][0].split(":")[0] : "") + ")" : "Ambil di toko"; }

/* ---------- gambar kecil ---------- */
var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z"/></svg>';
function stockHTML(p) {
  if (p.stock <= 0) return '<span class="stock">Stok habis</span>';
  if (p.stock <= 5) return '<span class="stock">Sisa ' + p.stock + "</span>";
  return '<span class="stock ok">Stok tersedia</span>';
}
function card(p) {
  var on = db.wish.indexOf(p.id) > -1, out = p.stock <= 0;
  return '<article class="card"><a class="ph" href="#/produk/' + p.id + '" aria-label="Lihat ' + esc(p.n) + '"><img src="img/' + esc(p.i) + '" alt="' + esc(p.n) + '" loading="lazy">' +
    (out ? '<span class="badge out">Habis</span>' : p.b ? '<span class="badge">' + esc(p.b) + "</span>" : "") + "</a>" +
    '<button class="fav' + (on ? " on" : "") + '" type="button" data-act="fav" data-id="' + p.id + '" aria-pressed="' + on + '" aria-label="' + (on ? "Hapus " : "Tambah ") + esc(p.n) + (on ? " dari favorit" : " ke favorit") + '">' + HEART + "</button>" +
    '<div class="info"><small>' + esc(p.c) + '</small><h3><a href="#/produk/' + p.id + '">' + esc(p.n) + "</a></h3><p>" + esc(p.d) + "</p>" + stockHTML(p) +
    '<div class="row"><span class="price">' + rp(p.p) + "</span>" +
    (out ? '<button class="btn sm line" disabled>Habis</button>' : p.opt ? '<a class="btn sm line" href="#/produk/' + p.id + '">Pilih</a>' : '<button class="btn sm line" type="button" data-act="add" data-id="' + p.id + '">Tambah</button>') +
    "</div></div></article>";
}

/* ---------- tampilan toko ---------- */
function vHome() {
  var feat = shown().filter(function (p) { return p.b && p.stock > 0; }).slice(0, 4);
  if (feat.length < 4) feat = feat.concat(shown().filter(function (p) { return feat.indexOf(p) < 0 && p.stock > 0; })).slice(0, 4);
  return '<div class="hero"><img src="img/hero.jpg" alt="Kopi espresso mengalir dari mesin"><div class="in"><span class="kick">Sangrai harian, seduh dengan teliti</span><h1>Secangkir kopi yang layak ditunggu sore hari.</h1><p>Pilih menu, atur ukuran dan tambahan, pakai kode promo, lalu pesan untuk diantar atau diambil.</p><div class="cta"><a class="btn" href="#/menu">Pesan sekarang</a><a class="btn ghost" href="#/lacak">Lacak pesanan</a></div></div></div>' +
    '<div class="perks"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg><span><b>Antar atau ambil</b><small>Ongkir sesuai zona, gratis di atas ' + rp(FREE_SHIP) + '</small></span></div><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10z"/></svg><span><b>Disangrai setiap pagi</b><small>Biji segar, tidak disimpan lama</small></span></div><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg><span><b>Bayar dengan mudah</b><small>Transfer, QRIS, atau bayar di tempat</small></span></div></div>' +
    '<section class="home-menu"><h2>Menu favorit</h2><p class="lead">Harga dan produk di halaman ini hanya contoh.</p><div class="grid" style="margin-top:22px">' + feat.map(card).join("") + '</div><p style="text-align:center;margin-top:26px"><a class="btn line" href="#/menu">Lihat semua menu</a></p></section>' +
    '<section class="story"><div><span class="kick" style="color:var(--accent-d)">Cerita kami</span><h2 style="margin-top:8px">Dari biji sampai cangkir, kami kerjakan sendiri.</h2><p>Setiap pagi kami menyangrai biji dalam jumlah kecil supaya rasanya terjaga. Pesanan yang masuk sebelum pukul 15.00 diantar sore itu juga.</p><div class="steps"><div><b>01</b>Sangrai<br><small>Dini hari</small></div><div><b>02</b>Seduh<br><small>Saat dipesan</small></div><div><b>03</b>Antar<br><small>Hari yang sama</small></div></div></div><img src="img/sangrai.jpg" alt="Petugas menyangrai biji kopi dengan mesin" loading="lazy"></section>';
}
function catList() {
  var q = fq.toLowerCase().trim();
  var l = shown().filter(function (p) { return (fcat === "Semua" || p.c === fcat) && (!q || (p.n + " " + p.d + " " + p.c).toLowerCase().indexOf(q) > -1); });
  if (fsort === "lo") l.sort(function (a, b) { return a.p - b.p; });
  if (fsort === "hi") l.sort(function (a, b) { return b.p - a.p; });
  if (fsort === "az") l.sort(function (a, b) { return a.n.localeCompare(b.n); });
  return l;
}
function tabsHTML() {
  var c = ["Semua"]; shown().forEach(function (p) { if (c.indexOf(p.c) < 0) c.push(p.c); });
  if (c.indexOf(fcat) < 0) fcat = "Semua";
  return c.map(function (x) { return '<button type="button" class="' + (x === fcat ? "on" : "") + '" data-act="cat" data-c="' + esc(x) + '" aria-pressed="' + (x === fcat) + '">' + esc(x) + "</button>"; }).join("");
}
function gridHTML() {
  var l = catList();
  return l.length ? l.map(card).join("") : '<p class="empty">Menu tidak ditemukan. Coba kata kunci atau kategori lain.</p>';
}
function vMenu() {
  return '<div class="wrap"><h2>Menu</h2><p class="lead">Harga dan produk hanya contoh.</p><div class="bar"><div class="tabs" id="tabs">' + tabsHTML() + '</div><div class="tools"><input id="q" type="search" placeholder="Cari menu" aria-label="Cari menu" value="' + esc(fq) + '"><select id="sort" aria-label="Urutkan"><option value="">Urutkan</option><option value="lo"' + (fsort === "lo" ? " selected" : "") + '>Harga terendah</option><option value="hi"' + (fsort === "hi" ? " selected" : "") + '>Harga tertinggi</option><option value="az"' + (fsort === "az" ? " selected" : "") + '>Nama A-Z</option></select></div></div><div class="grid" id="grid">' + gridHTML() + "</div></div>";
}
function vFav() {
  var l = db.wish.map(prod).filter(function (p) { return p && p.show; });
  return '<div class="wrap"><h2>Favorit</h2><p class="lead">Menu yang kamu tandai, tersimpan di peramban ini.</p><div class="grid" style="margin-top:22px">' + (l.length ? l.map(card).join("") : '<p class="empty">Belum ada favorit. Tekan ikon hati pada menu untuk menyimpannya.<br><br><a class="btn" href="#/menu">Lihat menu</a></p>') + "</div></div>";
}
function vDetail(id) {
  var p = prod(id);
  if (!p || !p.show) return '<div class="wrap"><p class="crumb"><a href="#/menu">Menu</a></p><h2>Menu tidak ditemukan</h2><p class="lead">Menu ini tidak ada atau sedang disembunyikan.</p><p><a class="btn" href="#/menu">Kembali ke menu</a></p></div>';
  var avail = Math.max(0, p.stock - inCart(p.id)), on = db.wish.indexOf(p.id) > -1;
  return '<div class="wrap"><p class="crumb"><a href="#/menu">Menu</a> / ' + esc(p.c) + " / " + esc(p.n) + '</p><div class="pd"><div class="pic"><img src="img/' + esc(p.i) + '" alt="' + esc(p.n) + '">' +
    '<button class="fav' + (on ? " on" : "") + '" type="button" data-act="fav" data-id="' + p.id + '" aria-pressed="' + on + '" aria-label="' + (on ? "Hapus dari favorit" : "Tambah ke favorit") + '">' + HEART + "</button></div>" +
    '<form id="pf" data-id="' + p.id + '" novalidate><span class="kick" style="color:var(--accent-d)">' + esc(p.c) + "</span><h1>" + esc(p.n) + '</h1><p style="margin:0;color:#5a4332">' + esc(p.d) + '</p><p style="margin:10px 0 0"><b class="price" style="font-size:1.5rem">' + rp(p.p) + "</b> &nbsp; " + stockHTML(p) + "</p>" +
    (p.opt ? '<fieldset><h5>Ukuran</h5><div class="opt">' + SZ.map(function (s, i) { return '<label><input type="radio" name="s" value="' + i + '"' + (i === 0 ? " checked" : "") + "><span>" + s[0] + (s[1] ? " +" + rp(s[1]) : "") + "</span></label>"; }).join("") + '</div></fieldset><fieldset><h5>Tambahan</h5><div class="opt">' + AD.map(function (a, i) { return '<label><input type="checkbox" name="a" value="' + i + '"><span>' + a[0] + (a[1] ? " +" + rp(a[1]) : "") + "</span></label>"; }).join("") + "</div></fieldset>" : "") +
    '<h5>Catatan</h5><label class="sr" for="note">Catatan untuk pesanan</label><textarea id="note" name="note" rows="2" maxlength="80" placeholder="Misalnya: tanpa es"></textarea>' +
    '<div class="buyrow"><div class="qty" role="group" aria-label="Jumlah"><button type="button" data-act="dqm" aria-label="Kurangi">&minus;</button><span id="qn" aria-live="polite">1</span><button type="button" data-act="dqp" aria-label="Tambah">+</button></div><b class="price" id="qp">' + rp(p.p) + '</b></div>' +
    '<p class="msg no" id="pmsg" role="alert">' + (p.stock <= 0 ? "Stok habis." : avail <= 0 ? "Semua stok sudah ada di keranjangmu." : "") + "</p>" +
    '<div class="buyrow" style="margin-top:0"><button class="btn" type="submit"' + (avail <= 0 ? " disabled" : "") + '>Masukkan ke keranjang</button><a class="btn line" href="#/keranjang">Lihat keranjang</a></div></form></div></div>';
}
function detailPrice() {
  var f = $("pf"); if (!f) return;
  var p = prod(f.dataset.id), l = { s: 0, a: [] };
  var r = f.querySelector('input[name="s"]:checked'); if (r) l.s = +r.value;
  [].forEach.call(f.querySelectorAll('input[name="a"]:checked'), function (c) { l.a.push(+c.value); });
  $("qp").textContent = rp(unit(p, l) * (+$("qn").textContent || 1));
}
function addToCart(p, l) {
  var avail = p.stock - inCart(p.id);
  if (p.stock <= 0) return "Stok habis.";
  if (l.q > avail) return avail <= 0 ? "Semua stok sudah ada di keranjangmu." : "Stok tinggal " + p.stock + ", di keranjang sudah " + inCart(p.id) + ". Kamu bisa tambah " + avail + " lagi.";
  var a = (l.a || []).slice().sort().join(",");
  for (var i = 0; i < db.cart.length; i++) { var c = db.cart[i]; if (c.pid === l.pid && c.s === l.s && c.a.slice().sort().join(",") === a && (c.note || "") === (l.note || "")) { c.q += l.q; save(); return ""; } }
  db.cart.push(l); save(); return "";
}

/* keranjang */
function vCart() {
  cleanCart();
  var mode = db.draft.mode || "antar", t = totals(db.cart, mode, +db.draft.zone || 0, db.promo);
  var h = '<div class="wrap"><h2>Keranjang</h2>';
  if (!db.cart.length) return h + '<p class="lead">Keranjang masih kosong.</p><p><a class="btn" href="#/menu">Pilih menu</a></p></div>';
  h += '<div class="cols2" style="margin-top:22px"><div class="panel">' + db.cart.map(function (l, k) {
    var p = prod(l.pid), over = inCart(l.pid) > p.stock;
    return '<div class="it"><img src="img/' + esc(p.i) + '" alt=""><div><b>' + esc(p.n) + "</b><small>" + esc(optText(p, l)) + (l.note ? (optText(p, l) ? " &middot; " : "") + "Catatan: " + esc(l.note) : "") + "</small><small>" + rp(unit(p, l)) + ' per item</small>' +
      (over ? '<small class="stock">Stok tinggal ' + p.stock + ", kurangi jumlah.</small>" : "") +
      '<div class="qty"><button type="button" data-act="cm" data-k="' + k + '" aria-label="Kurangi ' + esc(p.n) + '">&minus;</button><span>' + l.q + '</span><button type="button" data-act="cp" data-k="' + k + '" aria-label="Tambah ' + esc(p.n) + '">+</button><button type="button" class="rm" data-act="rm" data-k="' + k + '">Hapus</button></div></div><b>' + rp(unit(p, l) * l.q) + "</b></div>";
  }).join("") + '</div><aside class="panel"><h3>Ringkasan</h3><form class="promoin" id="promof" novalidate><label class="sr" for="code">Kode promo</label><input id="code" placeholder="Kode promo" autocomplete="off" maxlength="14" value="' + esc(db.promo) + '"><button class="btn sm dark" type="submit">Pakai</button></form>' +
    '<p class="msg ' + (db.promo ? (t.promo && t.promo.ok ? "ok" : "no") : "") + '" id="pmsg" role="status">' + (db.promo ? esc(t.promo.msg) : "") + "</p>" + (db.promo ? '<p style="margin:-4px 0 8px"><button class="linkbtn" type="button" data-act="unpromo" style="color:var(--accent-d);min-height:40px">Lepas kode</button></p>' : "") +
    '<p class="hint" style="margin:-4px 0 12px">Coba: SENJA10, HEMAT20 (min. ' + rp(150000) + "), ONGKIR0 (min. " + rp(60000) + ", antar).</p>" +
    '<div class="sum"><div><span>Subtotal</span><span>' + rp(t.sub) + "</span></div>" + (t.disc ? '<div class="g"><span>Diskon</span><span>-' + rp(t.disc) + "</span></div>" : "") + '<div><span>Ongkir</span><span>Dihitung di checkout</span></div><div class="t"><span>Total sementara</span><span>' + rp(t.sub - t.disc) + "</span></div></div>" +
    '<a class="btn block" style="margin-top:14px" href="#/checkout">Lanjut ke checkout</a><a class="btn line block sm" style="margin-top:10px" href="#/menu">Tambah menu</a></aside></div></div>';
  return h;
}

/* checkout */
function sumHTML(t, mode) {
  return '<div class="sum"><div><span>Subtotal</span><span>' + rp(t.sub) + "</span></div>" + (t.disc ? '<div class="g"><span>Diskon (' + esc(db.promo) + ")</span><span>-" + rp(t.disc) + "</span></div>" : "") +
    "<div><span>Ongkir</span><span>" + (mode === "ambil" ? "Ambil di toko" : t.ship ? rp(t.ship) : "Gratis") + '</span></div><div class="t"><span>Total</span><span>' + rp(t.total) + "</span></div></div>";
}
function vCheckout() {
  cleanCart();
  if (!db.cart.length) return '<div class="wrap"><h2>Checkout</h2><p class="lead">Keranjang masih kosong.</p><p><a class="btn" href="#/menu">Pilih menu</a></p></div>';
  var d = db.draft, mode = d.mode || "antar", z = +d.zone || 0, t = totals(db.cart, mode, z, db.promo), pay = d.pay || "transfer";
  return '<div class="wrap"><p class="crumb"><a href="#/keranjang">Keranjang</a> / Checkout</p><h2>Checkout</h2><form id="cof" class="cols2" style="margin-top:22px" novalidate><div class="panel f">' +
    '<p class="msg no" id="cerr" role="alert" tabindex="-1"></p>' +
    '<div class="two"><label for="c-name">Nama<input id="c-name" name="name" autocomplete="name" maxlength="40" value="' + esc(d.name || "") + '"><span class="err" id="e-name"></span></label><label for="c-phone">Telepon (WhatsApp)<input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="0812-0000-0000" value="' + esc(d.phone || "") + '"><span class="err" id="e-phone"></span></label></div>' +
    '<fieldset><legend>Cara terima</legend><div class="choice"><label><input type="radio" name="mode" value="antar"' + (mode === "antar" ? " checked" : "") + "><span>Antar<small>Ongkir sesuai zona</small></span></label><label><input type=\"radio\" name=\"mode\" value=\"ambil\"" + (mode === "ambil" ? " checked" : "") + "><span>Ambil di toko<small>Tanpa ongkir</small></span></label></div></fieldset>" +
    '<div id="antar"' + (mode === "antar" ? "" : " hidden") + ' class="f"><fieldset><legend>Zona antar</legend><div class="choice" style="grid-template-columns:1fr">' + ZONES.map(function (zn, i) { return '<label><input type="radio" name="zone" value="' + i + '"' + (i === z ? " checked" : "") + "><span>" + esc(zn[0]) + "<small>" + rp(zn[1]) + "</small></span></label>"; }).join("") + '</div></fieldset>' +
    '<label for="c-addr">Alamat lengkap<textarea id="c-addr" name="addr" rows="2" maxlength="140" placeholder="Jalan, nomor, patokan">' + esc(d.addr || "") + '</textarea><span class="err" id="e-addr"></span></label></div>' +
    '<label for="c-slot">' + (mode === "ambil" ? "Jam ambil" : "Jam antar") + '<select id="c-slot" name="slot">' + SLOTS.map(function (s) { return "<option" + (d.slot === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></label>" +
    '<fieldset><legend>Pembayaran</legend><div class="choice" style="grid-template-columns:1fr">' + PAYS.map(function (p) { return '<label><input type="radio" name="pay" value="' + p[0] + '"' + (pay === p[0] ? " checked" : "") + "><span>" + p[1] + "<small>" + p[2] + "</small></span></label>"; }).join("") + "</div></fieldset>" +
    '<label for="c-note">Catatan pesanan (opsional)<textarea id="c-note" name="note" rows="2" maxlength="100">' + esc(d.note || "") + "</textarea></label></div>" +
    '<aside class="panel"><h3>Pesananmu</h3>' + db.cart.map(function (l) { var p = prod(l.pid); return '<div class="row" style="align-items:flex-start;padding:4px 0"><span>' + l.q + " x " + esc(p.n) + "<br><small style=\"color:var(--mute)\">" + esc(optText(p, l)) + "</small></span><b>" + rp(unit(p, l) * l.q) + "</b></div>"; }).join("") +
    '<div id="sumbox" style="margin-top:10px">' + sumHTML(t, mode) + '</div>' + (db.promo ? '<p class="msg ' + (t.promo.ok ? "ok" : "no") + '" id="cpm">' + esc(t.promo.msg) + "</p>" : "") +
    '<button class="btn block" type="submit" style="margin-top:12px">Buat pesanan</button><p class="hint">Ini demo. Tidak ada pembayaran sungguhan.</p></aside></form></div>';
}
function updCheckout() {
  var f = $("cof"); if (!f) return;
  var mode = f.mode.value, z = +(f.zone.value || 0);
  db.draft.mode = mode; db.draft.zone = z;
  $("antar").hidden = mode !== "antar";
  $("sumbox").innerHTML = sumHTML(totals(db.cart, mode, z, db.promo), mode);
  var pm = $("cpm"); if (pm && db.promo) { var e = evalPromo(db.promo, totals(db.cart, mode, z, "").sub, mode); pm.textContent = e.msg; pm.className = "msg " + (e.ok ? "ok" : "no"); }
}
function fieldErr(id, msg) { var e = $("e-" + id), inp = $("c-" + id) || $(id); if (e) e.textContent = msg || ""; if (inp) { inp.classList.toggle("invalid", !!msg); if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); } return msg; }
function submitCheckout() {
  var f = $("cof"), v = { name: f.name.value.trim(), phone: f.phone.value.trim(), mode: f.mode.value, zone: +(f.zone.value || 0), addr: f.addr.value.trim(), slot: f.slot.value, pay: f.pay.value, note: f.note.value.trim() };
  var first = null, bad = function (id, m) { fieldErr(id, m); if (!first) first = id; };
  fieldErr("name", ""); fieldErr("phone", ""); fieldErr("addr", ""); $("cerr").textContent = "";
  if (v.name.length < 3) bad("name", "Isi nama minimal 3 huruf.");
  var dg = digits(v.phone);
  if (!/^08\d{8,12}$/.test(dg)) bad("phone", "Nomor telepon harus diawali 08 dan 10 sampai 14 angka.");
  if (v.mode === "antar" && v.addr.length < 10) bad("addr", "Alamat antar minimal 10 karakter.");
  if (first) { $("c-" + first).focus(); return; }
  cleanCart();
  if (!db.cart.length) { location.hash = "#/keranjang"; return; }
  for (var i = 0; i < db.cart.length; i++) { var p = prod(db.cart[i].pid); if (inCart(p.id) > p.stock) { return cerr("Stok " + p.n + " tinggal " + p.stock + ". Kurangi jumlah di keranjang."); } }
  if (db.promo) { var e = evalPromo(db.promo, totals(db.cart, v.mode, v.zone, "").sub, v.mode); if (!e.ok) return cerr(e.msg + " Ubah pesanan atau lepas kode di keranjang."); }
  var o = buildOrder(db.cart, { name: v.name, phone: v.phone, mode: v.mode, zone: v.zone, addr: v.addr, slot: v.slot, pay: v.pay, note: v.note }, db.promo);
  o.no = orderNo(new Date());
  db.cart.forEach(function (l) { prod(l.pid).stock -= l.q; });
  if (o.code) db.promos.forEach(function (x) { if (x.code === o.code) x.used++; });
  db.orders.unshift(o); db.cart = []; db.promo = ""; db.draft = { name: v.name, phone: v.phone }; db.last = { no: o.no, phone: v.phone };
  save(); location.hash = "#/sukses/" + o.no;
}
function cerr(m) { var e = $("cerr"); e.textContent = m; e.focus(); }
function vDone(no) {
  var o = findOrder(no);
  if (!o) return '<div class="wrap"><h2>Pesanan tidak ditemukan</h2><p><a class="btn" href="#/menu">Ke menu</a></p></div>';
  var pay = PAYS.filter(function (p) { return p[0] === o.pay; })[0];
  return '<div class="wrap"><div class="done"><div class="tick" aria-hidden="true">&#10003;</div><h2>Pesanan diterima</h2><p>Nomor pesananmu</p><p><span class="code">' + esc(o.no) + "</span></p><p class=\"lead\">Simpan nomor ini dan nomor teleponmu untuk melacak pesanan.</p>" +
    '<div class="panel" style="text-align:left;margin:18px 0">' + orderBody(o) + '<p class="hint">Pembayaran: ' + esc(pay ? pay[1] : "") + ". " + (o.pay === "transfer" ? "Transfer ke rekening contoh 0000-0000-00 a.n. Kopi Senja (contoh)." : o.pay === "qris" ? "Kode QRIS contoh, tidak bisa dipindai." : "Siapkan uang pas saat pesanan tiba.") + '</p></div><div class="cta" style="justify-content:center"><a class="btn" href="#/lacak/' + esc(o.no) + '">Lacak pesanan</a><a class="btn line" href="#/menu">Belanja lagi</a></div></div></div>';
}
function orderBody(o) {
  return o.lines.map(function (l) { return '<div class="row" style="align-items:flex-start;padding:4px 0"><span>' + l.q + " x " + esc(l.n) + (l.o || l.note ? '<br><small style="color:var(--mute)">' + esc(l.o) + (l.note ? (l.o ? " &middot; " : "") + "Catatan: " + esc(l.note) : "") + "</small>" : "") + "</span><b>" + rp(l.u * l.q) + "</b></div>"; }).join("") +
    '<div class="sum" style="margin-top:8px"><div><span>Subtotal</span><span>' + rp(o.sub) + "</span></div>" + (o.disc ? '<div class="g"><span>Diskon ' + esc(o.code) + "</span><span>-" + rp(o.disc) + "</span></div>" : o.code ? '<div class="g"><span>Kode ' + esc(o.code) + "</span><span>Gratis ongkir</span></div>" : "") + "<div><span>Ongkir</span><span>" + (o.mode === "ambil" ? "Ambil di toko" : o.ship ? rp(o.ship) : "Gratis") + '</span></div><div class="t"><span>Total</span><span>' + rp(o.total) + "</span></div></div>";
}

/* lacak */
function vTrack(no) {
  if (no && !trk) trk = { no: no, ph: db.last && db.last.no === no ? db.last.phone : "" , auto: !!(db.last && db.last.no === no) };
  var ex = db.orders.filter(function (o) { return /^0812-0000-0001$/.test(o.phone); })[0];
  return '<div class="wrap" style="max-width:760px"><h2>Lacak pesanan</h2><p class="lead">Masukkan nomor pesanan dan nomor telepon saat memesan.</p><form id="trf" class="panel f" style="margin-top:20px" novalidate><div class="two"><label for="t-no">Nomor pesanan<input id="t-no" placeholder="KS-251125-001" autocomplete="off" maxlength="20" value="' + esc(trk ? trk.no : "") + '"></label><label for="t-ph">Nomor telepon<input id="t-ph" type="tel" inputmode="tel" placeholder="0812-0000-0000" maxlength="16" value="' + esc(trk ? trk.ph : "") + '"></label></div><p class="msg no" id="terr" role="alert"></p><button class="btn" type="submit">Cari pesanan</button>' +
    (ex ? '<p class="hint">Contoh pesanan demo: ' + esc(ex.no) + ", telepon " + esc(ex.phone) + ".</p>" : "") + '</form><div id="res" style="margin-top:20px"></div></div>';
}
function trackResult() {
  var box = $("res"); if (!box) return;
  if (!trk) { box.innerHTML = ""; return; }
  var o = findOrder(String(trk.no).trim().toUpperCase());
  if (!o || digits(o.phone) !== digits(trk.ph)) { box.innerHTML = ""; $("terr").textContent = trk.auto ? "" : "Pesanan tidak ditemukan. Periksa nomor pesanan dan nomor telepon."; return; }
  $("terr").textContent = "";
  var steps = [["baru", "Pesanan diterima"], ["diproses", "Diproses"], ["dikirim", o.mode === "ambil" ? "Siap diambil" : "Dikirim"], ["selesai", "Selesai"]], idx = STATUS.indexOf(o.status);
  var h = '<div class="panel"><div class="row" style="flex-wrap:wrap"><div><b class="code">' + esc(o.no) + "</b><br><small style=\"color:var(--mute)\">" + fdate(o.t) + " &middot; " + esc(modeText(o)) + "</small></div>" + pill(o) + "</div>";
  if (o.status === "batal") h += '<p class="msg no" style="margin:16px 0 0">Pesanan ini dibatalkan. Stok sudah dikembalikan.</p>';
  else h += '<ol class="stepper" aria-label="Status pesanan">' + steps.map(function (s, i) { return '<li class="' + (i < idx || o.status === "selesai" ? "done-s" : i === idx ? "now" : "") + '"' + (i === idx ? ' aria-current="step"' : "") + ">" + s[1] + "</li>"; }).join("") + "</ol>";
  h += '<h3 style="margin:18px 0 8px">Isi pesanan</h3>' + orderBody(o) + '<h3 style="margin:18px 0 0">Riwayat</h3><ul class="log">' + o.log.slice().reverse().map(function (g) { return "<li>" + fdate(g.t) + " &middot; " + esc(stLabel(g.s, o)) + "</li>"; }).join("") + "</ul></div>";
  box.innerHTML = h;
}

/* ---------- panel pemilik ---------- */
function isAdmin() { try { return sessionStorage.getItem(ADMKEY) === "1"; } catch (e) { return false; } }
function aTabs(cur) {
  var n = db.orders.filter(function (o) { return o.status === "baru"; }).length;
  return '<div class="adm-tabs" role="navigation" aria-label="Panel pemilik">' + [["", "Ringkasan"], ["pesanan", "Pesanan" + (n ? " (" + n + " baru)" : "")], ["produk", "Produk"], ["promo", "Kode promo"]].map(function (t) { return '<a href="#/admin' + (t[0] ? "/" + t[0] : "") + '" class="' + (t[0] === cur ? "on" : "") + '">' + t[1] + "</a>"; }).join("") + '<button class="btn sm line" type="button" data-act="logout">Keluar</button></div>';
}
function vAdminLogin() {
  return '<div class="wrap"><div class="panel pin"><h2>Panel pemilik</h2><p class="lead">Masukkan PIN untuk mengelola toko.</p><form id="pinf" class="f" style="margin-top:16px;text-align:left" novalidate><label for="pin">PIN<input id="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label><p class="msg no" id="perr" role="alert"></p><button class="btn" type="submit">Masuk</button><p class="hint">PIN demo: ' + esc(db.pin) + "</p></form></div></div>";
}
function vAdmin(parts) {
  if (!isAdmin()) return vAdminLogin();
  var s = parts[1] || "";
  if (s === "pesanan") return parts[2] ? vAOrder(parts.slice(2).join("/")) : vAOrders();
  if (s === "produk") return vAProducts();
  if (s === "promo") return vAPromos();
  return vASummary();
}
function liveOrders() { return db.orders.filter(function (o) { return o.status !== "batal"; }); }
function vASummary() {
  var lo = liveOrders(), rev = lo.reduce(function (a, o) { return a + o.total; }, 0), nb = db.orders.filter(function (o) { return o.status === "baru"; }).length;
  var low = db.products.filter(function (p) { return p.stock <= 5; });
  var days = [], i; for (i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); days.push({ k: dkey(d), l: d.toLocaleDateString("id-ID", { weekday: "short" }), v: 0 }); }
  lo.forEach(function (o) { var k = dkey(new Date(o.t)); days.forEach(function (x) { if (x.k === k) x.v += o.total; }); });
  var mx = Math.max.apply(null, days.map(function (x) { return x.v; }).concat([1]));
  var tp = {}; lo.forEach(function (o) { o.lines.forEach(function (l) { var t = tp[l.n] || (tp[l.n] = { n: l.n, q: 0, v: 0 }); t.q += l.q; t.v += l.u * l.q; }); });
  var top = Object.keys(tp).map(function (k) { return tp[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
  var sc = {}; STATUS.forEach(function (x) { sc[x] = 0; }); db.orders.forEach(function (o) { sc[o.status]++; });
  return '<div class="wrap"><h2>Panel pemilik</h2>' + aTabs("") +
    '<div class="stats"><div class="stat"><small>Penjualan (tanpa batal)</small><b>' + rp(rev) + '</b></div><div class="stat"><small>Pesanan</small><b>' + lo.length + '</b></div><div class="stat"><small>Pesanan baru</small><b>' + nb + '</b></div><div class="stat"><small>Rata-rata per pesanan</small><b>' + rp(lo.length ? rev / lo.length : 0) + '</b></div><div class="stat"><small>Stok menipis (5 atau kurang)</small><b>' + low.length + "</b></div></div>" +
    '<div class="cols2"><div class="panel"><h3>Penjualan 7 hari terakhir</h3><div class="chart" role="img" aria-label="Grafik penjualan 7 hari">' + days.map(function (x) { return "<div><em>" + (x.v ? Math.round(x.v / 1000) + "rb" : "") + '</em><i style="height:' + Math.round(x.v / mx * 100) + '%"></i><small>' + esc(x.l) + "</small></div>"; }).join("") + '</div></div>' +
    '<div class="panel"><h3>Status pesanan</h3>' + STATUS.map(function (x) { return '<div class="row" style="padding:4px 0"><span class="pill ' + x + '">' + stLabel(x) + "</span><b>" + sc[x] + "</b></div>"; }).join("") + "</div></div>" +
    '<div class="cols2" style="margin-top:22px"><div class="panel"><h3>Menu terlaris</h3>' + (top.length ? top.map(function (t) { return '<div class="row" style="padding:4px 0"><span>' + esc(t.n) + " <small style=\"color:var(--mute)\">" + t.q + " terjual</small></span><b>" + rp(t.v) + "</b></div>"; }).join("") : '<p class="hint">Belum ada penjualan.</p>') + '</div><div class="panel"><h3>Stok menipis</h3>' + (low.length ? low.map(function (p) { return '<div class="row" style="padding:4px 0"><span>' + esc(p.n) + '</span><b class="stock">' + (p.stock <= 0 ? "Habis" : "Sisa " + p.stock) + "</b></div>"; }).join("") : '<p class="hint">Semua stok aman.</p>') + "</div></div>" +
    '<p style="margin-top:22px;display:flex;flex-wrap:wrap;gap:10px"><button class="btn dark sm" type="button" data-act="csvo">Ekspor pesanan (CSV)</button><button class="btn line sm" type="button" data-act="csvp">Ekspor produk (CSV)</button><button class="btn line sm" type="button" data-reset>Reset data demo</button></p></div>';
}
function filteredOrders() {
  var q = ofq.toLowerCase().trim();
  return db.orders.filter(function (o) { return (!ofs || o.status === ofs) && (!q || (o.no + " " + o.name + " " + o.phone).toLowerCase().indexOf(q) > -1); }).sort(function (a, b) { return a.t < b.t ? 1 : -1; });
}
function ordersListHTML() {
  var l = filteredOrders();
  return l.length ? l.map(function (o) { return '<div class="rowc"><div><b>' + esc(o.no) + "</b> " + pill(o) + "<br><small>" + esc(o.name) + " &middot; " + fdate(o.t) + " &middot; " + esc(modeText(o)) + '</small></div><div class="acts"><b>' + rp(o.total) + '</b><a class="btn sm line" href="#/admin/pesanan/' + esc(o.no) + '">Buka</a></div></div>'; }).join("") : '<p class="empty" style="padding:30px 0">Tidak ada pesanan yang cocok.</p>';
}
function vAOrders() {
  return '<div class="wrap"><h2>Pesanan</h2>' + aTabs("pesanan") + '<div class="filters"><label class="sr" for="of-s">Status</label><select id="of-s"><option value="">Semua status</option>' + STATUS.map(function (s) { return '<option value="' + s + '"' + (ofs === s ? " selected" : "") + ">" + stLabel(s) + "</option>"; }).join("") + '</select><label class="sr" for="of-q">Cari</label><input id="of-q" type="search" placeholder="Cari nomor, nama, telepon" value="' + esc(ofq) + '" style="min-width:230px"><button class="btn sm dark" type="button" data-act="csvo">Ekspor CSV</button></div><div class="lst" id="olist">' + ordersListHTML() + "</div></div>";
}
function waLink(o) {
  var p = digits(o.phone); if (p.charAt(0) === "0") p = "62" + p.slice(1);
  var t = "Halo " + o.name + ", pesanan " + o.no + " di Kopi Senja (" + stLabel(o.status, o) + "):\n" + o.lines.map(function (l) { return l.q + " x " + l.n + (l.o ? " (" + l.o + ")" : ""); }).join("\n") + "\n" + (o.mode === "antar" ? "Antar ke: " + o.addr + "\n" : "Ambil di toko\n") + "Total: " + rp(o.total) + ". Terima kasih!";
  return "https://wa.me/" + p + "?text=" + encodeURIComponent(t);
}
function vAOrder(no) {
  var o = findOrder(no);
  if (!o) return '<div class="wrap"><h2>Pesanan</h2>' + aTabs("pesanan") + '<p class="lead">Pesanan tidak ditemukan.</p><p><a class="btn" href="#/admin/pesanan">Kembali ke daftar</a></p></div>';
  var i = STATUS.indexOf(o.status), nx = i < 3 ? STATUS[i + 1] : "";
  return '<div class="wrap"><p class="crumb"><a href="#/admin/pesanan">Semua pesanan</a> / ' + esc(o.no) + "</p><h2>" + esc(o.no) + " " + pill(o) + "</h2>" + aTabs("pesanan") +
    '<div class="cols2"><div class="panel"><h3>Isi pesanan</h3>' + orderBody(o) + '</div><div class="panel"><h3>Pelanggan</h3><p style="margin:0">' + esc(o.name) + "<br>" + esc(o.phone) + "<br>" + esc(modeText(o)) + (o.addr ? "<br>" + esc(o.addr) : "") + "<br>Jam: " + esc(o.slot) + "<br>Bayar: " + esc((PAYS.filter(function (p) { return p[0] === o.pay; })[0] || ["", o.pay])[1]) + (o.note ? "<br>Catatan: " + esc(o.note) : "") + "</p>" +
    '<h3 style="margin-top:18px">Ubah status</h3><label class="sr" for="ost">Status</label><select id="ost" data-no="' + esc(o.no) + '">' + STATUS.map(function (s) { return '<option value="' + s + '"' + (s === o.status ? " selected" : "") + ">" + stLabel(s, o) + "</option>"; }).join("") + "</select>" +
    '<p style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:0">' + (nx ? '<button class="btn sm" type="button" data-act="nextst" data-no="' + esc(o.no) + '">Lanjut: ' + stLabel(nx, o) + "</button>" : "") + '<a class="btn sm dark" href="' + esc(waLink(o)) + '" target="_blank" rel="noopener">Kirim ringkasan ke WhatsApp</a></p><p class="hint">Status tampil di halaman Lacak pesanan. Dibatalkan: stok kembali.</p>' +
    '<h3 style="margin-top:18px">Riwayat</h3><ul class="log">' + o.log.slice().reverse().map(function (g) { return "<li>" + fdate(g.t) + " &middot; " + esc(stLabel(g.s, o)) + "</li>"; }).join("") + "</ul></div></div></div>";
}
function setStatus(no, s) {
  var o = findOrder(no); if (!o || o.status === s) return true;
  if (o.status === "batal") {
    for (var i = 0; i < o.lines.length; i++) { var p = prod(o.lines[i].pid); if (p && p.stock < o.lines[i].q) { toast("Stok " + p.n + " tidak cukup untuk mengaktifkan lagi pesanan ini."); return false; } }
    o.lines.forEach(function (l) { var p = prod(l.pid); if (p) p.stock -= l.q; });
  }
  if (s === "batal") o.lines.forEach(function (l) { var p = prod(l.pid); if (p) p.stock += l.q; });
  o.status = s; o.log.push({ s: s, t: new Date().toISOString() }); save();
  toast("Status " + o.no + ": " + stLabel(s, o)); return true;
}
function vAProducts() {
  var e = editP === "new" ? { n: "", c: "", p: "", stock: "", i: IMGS[0], d: "", b: "", show: true, opt: false } : editP ? prod(editP) : null;
  var cats = []; db.products.forEach(function (p) { if (cats.indexOf(p.c) < 0) cats.push(p.c); });
  var h = '<div class="wrap"><h2>Produk</h2>' + aTabs("produk");
  if (e) h += '<form id="prodf" class="panel f" style="margin-bottom:22px" novalidate><h3>' + (editP === "new" ? "Tambah produk" : "Ubah produk") + '</h3><div class="two"><label for="pn">Nama<input id="pn" maxlength="40" value="' + esc(e.n) + '"><span class="err" id="e-pn"></span></label><label for="pc">Kategori<input id="pc" list="cats" maxlength="20" value="' + esc(e.c) + '"><span class="err" id="e-pc"></span></label></div><datalist id="cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("") + '</datalist>' +
    '<div class="two"><label for="pp">Harga (Rp)<input id="pp" type="number" inputmode="numeric" min="1000" step="500" value="' + esc(e.p) + '"><span class="err" id="e-pp"></span></label><label for="ps">Stok<input id="ps" type="number" inputmode="numeric" min="0" value="' + esc(e.stock) + '"><span class="err" id="e-ps"></span></label></div>' +
    '<div class="two"><label for="pi">Foto<select id="pi">' + IMGS.map(function (m) { return '<option value="' + m + '"' + (m === e.i ? " selected" : "") + ">" + m.replace(".jpg", "") + "</option>"; }).join("") + '</select></label><label for="pb">Label (opsional)<input id="pb" maxlength="12" value="' + esc(e.b) + '" placeholder="Baru, Favorit"></label></div>' +
    '<label for="pd">Deskripsi<textarea id="pd" rows="2" maxlength="120">' + esc(e.d) + '</textarea></label><div><label class="sw"><input type="checkbox" id="po"' + (e.opt ? " checked" : "") + '>Minuman (punya ukuran dan tambahan)</label><br><label class="sw"><input type="checkbox" id="psh"' + (e.show ? " checked" : "") + '>Tampil di toko</label></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="submit">Simpan</button><button class="btn line" type="button" data-act="pcancel">Batal</button></div></form>';
  else h += '<p><button class="btn sm" type="button" data-act="pnew">Tambah produk</button> <button class="btn sm line" type="button" data-act="csvp">Ekspor CSV</button></p>';
  h += '<div class="lst">' + db.products.map(function (p) {
    return '<div class="rowc' + (p.show ? "" : " off") + '"><div class="th"><img src="img/' + esc(p.i) + '" alt=""><div><b>' + esc(p.n) + "</b> " + (p.show ? "" : '<span class="pill">Disembunyikan</span>') + "<br><small>" + esc(p.c) + " &middot; " + rp(p.p) + '</small></div></div><div class="acts"><label class="fl" style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:.85rem" for="st' + p.id + '">Stok <input class="stk" id="st' + p.id + '" type="number" min="0" value="' + p.stock + '" data-stk="' + p.id + '"></label><label class="sw"><input type="checkbox" data-shw="' + p.id + '"' + (p.show ? " checked" : "") + '>Tampil</label><button class="btn sm line" type="button" data-act="pedit" data-id="' + p.id + '">Ubah</button><button class="btn sm ' + (armed === "p" + p.id ? "danger" : "line") + '" type="button" data-act="pdel" data-id="' + p.id + '">' + (armed === "p" + p.id ? "Tekan lagi" : "Hapus") + "</button></div></div>";
  }).join("") + "</div></div>";
  return h;
}
function ruleText(r) { return (r.type === "pct" ? "Diskon " + r.val + "%" + (r.max ? " (maks " + rp(r.max) + ")" : "") : r.type === "flat" ? "Potongan " + rp(r.val) : "Gratis ongkir (antar)") + (r.min ? ", min. belanja " + rp(r.min) : ", tanpa minimal"); }
function vAPromos() {
  var e = editR === "new" ? { code: "", type: "pct", val: 10, max: 0, min: 0, on: true } : editR ? db.promos.filter(function (x) { return x.code === editR; })[0] : null;
  var h = '<div class="wrap"><h2>Kode promo</h2>' + aTabs("promo");
  if (e) h += '<form id="promoef" class="panel f" style="margin-bottom:22px" novalidate><h3>' + (editR === "new" ? "Tambah kode" : "Ubah kode " + esc(e.code)) + '</h3><div class="two"><label for="rc">Kode (huruf dan angka, 3-12)<input id="rc" maxlength="12" style="text-transform:uppercase" value="' + esc(e.code) + '"' + (editR === "new" ? "" : " readonly") + '><span class="err" id="e-rc"></span></label><label for="rt">Jenis<select id="rt"><option value="pct"' + (e.type === "pct" ? " selected" : "") + '>Diskon persen</option><option value="flat"' + (e.type === "flat" ? " selected" : "") + '>Potongan rupiah</option><option value="ship"' + (e.type === "ship" ? " selected" : "") + '>Gratis ongkir</option></select></label></div>' +
    '<div class="two"><label for="rv">Nilai (persen atau rupiah)<input id="rv" type="number" inputmode="numeric" min="0" value="' + e.val + '"><span class="err" id="e-rv"></span></label><label for="rm">Maks diskon (Rp, 0 = tanpa batas)<input id="rm" type="number" inputmode="numeric" min="0" value="' + e.max + '"></label></div>' +
    '<label for="rn">Minimal belanja (Rp)<input id="rn" type="number" inputmode="numeric" min="0" value="' + e.min + '"><span class="err" id="e-rn"></span></label><label class="sw"><input type="checkbox" id="ron"' + (e.on ? " checked" : "") + '>Aktif</label><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="submit">Simpan</button><button class="btn line" type="button" data-act="rcancel">Batal</button></div></form>';
  else h += '<p><button class="btn sm" type="button" data-act="rnew">Tambah kode</button></p>';
  h += '<div class="lst">' + (db.promos.length ? db.promos.map(function (r) {
    return '<div class="rowc' + (r.on ? "" : " off") + '"><div><b class="code" style="padding:2px 10px">' + esc(r.code) + "</b> " + (r.on ? "" : '<span class="pill">Nonaktif</span>') + "<br><small>" + esc(ruleText(r)) + " &middot; dipakai " + r.used + 'x</small></div><div class="acts"><label class="sw"><input type="checkbox" data-ron="' + esc(r.code) + '"' + (r.on ? " checked" : "") + '>Aktif</label><button class="btn sm line" type="button" data-act="redit" data-c="' + esc(r.code) + '">Ubah</button><button class="btn sm ' + (armed === "r" + r.code ? "danger" : "line") + '" type="button" data-act="rdel" data-c="' + esc(r.code) + '">' + (armed === "r" + r.code ? "Tekan lagi" : "Hapus") + "</button></div></div>";
  }).join("") : '<p class="empty">Belum ada kode promo.</p>') + "</div></div>";
  return h;
}
function saveProduct() {
  var n = $("pn").value.trim(), c = $("pc").value.trim(), p = $("pp").value, s = $("ps").value, bad = false;
  function er(id, m) { $("e-" + id).textContent = m; if (m) { if (!bad) $(id).focus(); bad = true; } }
  er("pn", n.length < 2 ? "Nama minimal 2 huruf." : ""); er("pc", c ? "" : "Isi kategori.");
  er("pp", !/^\d+$/.test(p) || +p < 1000 || +p > 5000000 ? "Harga 1.000 sampai 5.000.000, angka bulat." : "");
  er("ps", !/^\d+$/.test(s) || +s > 9999 ? "Stok angka bulat 0 sampai 9999." : "");
  if (bad) return;
  var o = editP === "new" ? { id: db.pid++ } : prod(editP);
  o.n = n; o.c = c; o.p = +p; o.stock = +s; o.i = $("pi").value; o.b = $("pb").value.trim(); o.d = $("pd").value.trim(); o.opt = $("po").checked; o.show = $("psh").checked;
  if (editP === "new") db.products.push(o);
  editP = null; save(); toast("Produk disimpan."); route();
}
function saveRule() {
  var code = $("rc").value.trim().toUpperCase(), type = $("rt").value, val = $("rv").value, mx = $("rm").value || "0", mn = $("rn").value || "0", bad = false;
  function er(id, m) { $("e-" + id).textContent = m; if (m) { if (!bad) $(id).focus(); bad = true; } }
  er("rc", !/^[A-Z0-9]{3,12}$/.test(code) ? "Kode 3 sampai 12 huruf atau angka." : editR === "new" && db.promos.some(function (x) { return x.code === code; }) ? "Kode ini sudah ada." : "");
  er("rv", type === "ship" ? "" : !/^\d+$/.test(val) || +val < 1 ? "Isi nilai lebih dari 0." : type === "pct" && +val > 100 ? "Persen maksimal 100." : "");
  er("rn", !/^\d+$/.test(mn) ? "Isi angka 0 atau lebih." : "");
  if (bad) return;
  var r = editR === "new" ? { code: code, used: 0 } : db.promos.filter(function (x) { return x.code === editR; })[0];
  r.type = type; r.val = type === "ship" ? 0 : +val; r.max = type === "pct" && /^\d+$/.test(mx) ? +mx : 0; r.min = +mn; r.on = $("ron").checked;
  if (editR === "new") db.promos.push(r);
  editR = null; save(); toast("Kode promo disimpan."); route();
}

/* CSV */
function cv(v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
function download(name, rows) {
  var b = new Blob(["﻿" + rows.map(function (r) { return r.map(cv).join(","); }).join("\r\n")], { type: "text/csv;charset=utf-8" });
  var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function csvOrders() {
  var rows = [["Nomor", "Tanggal", "Nama", "Telepon", "Cara terima", "Alamat", "Item", "Subtotal", "Diskon", "Kode", "Ongkir", "Total", "Status", "Pembayaran"]];
  db.orders.slice().sort(function (a, b) { return a.t < b.t ? -1 : 1; }).forEach(function (o) { rows.push([o.no, o.t, o.name, o.phone, o.mode, o.addr, o.lines.map(function (l) { return l.q + "x " + l.n + (l.o ? " (" + l.o + ")" : ""); }).join("; "), o.sub, o.disc, o.code, o.ship, o.total, stLabel(o.status, o), o.pay]); });
  download("pesanan-kopi-senja.csv", rows); return rows;
}
function csvProducts() {
  var rows = [["ID", "Nama", "Kategori", "Harga", "Stok", "Tampil"]]; db.products.forEach(function (p) { rows.push([p.id, p.n, p.c, p.p, p.stock, p.show ? "ya" : "tidak"]); });
  download("produk-kopi-senja.csv", rows); return rows;
}

/* ---------- router ---------- */
function route() {
  var h = location.hash.replace(/^#/, "") || "/", parts = h.split("?")[0].split("/").slice(1), v = parts[0] || "", html, title = "Kopi Senja", nav = "";
  if (v === "") html = vHome();
  else if (v === "menu") { html = vMenu(); nav = "menu"; title = "Menu"; }
  else if (v === "produk") { html = vDetail(parts[1]); var pp = prod(parts[1]); title = pp ? pp.n : "Menu"; }
  else if (v === "favorit") { html = vFav(); nav = "favorit"; title = "Favorit"; }
  else if (v === "keranjang") { html = vCart(); title = "Keranjang"; }
  else if (v === "checkout") { html = vCheckout(); title = "Checkout"; }
  else if (v === "sukses") { html = vDone(parts[1]); title = "Pesanan diterima"; }
  else if (v === "lacak") { if (!parts[1]) { trk = trk && trk.keep ? trk : null; } else if (!trk || trk.no !== parts[1]) trk = null; html = vTrack(parts[1]); nav = "lacak"; title = "Lacak pesanan"; }
  else if (v === "admin") { html = vAdmin(parts); title = "Panel pemilik"; }
  else html = '<div class="wrap"><h2>Halaman tidak ditemukan</h2><p><a class="btn" href="#/">Ke beranda</a></p></div>';
  $("app").innerHTML = html;
  document.title = title + " | Kopi Senja";
  [].forEach.call(document.querySelectorAll("[data-nav]"), function (a) { a.classList.toggle("on", a.dataset.nav === nav); });
  if (v === "lacak") trackResult();
  chrome();
}
function chrome() {
  var n = cartCount(); $("count").textContent = n; $("cartbtn").setAttribute("aria-label", "Keranjang, " + n + " item");
  $("favn").textContent = db.wish.length ? "(" + db.wish.length + ")" : "";
}
var lastHash = null;
function onHash() {
  armed = null; if (location.hash.indexOf("#/admin") !== 0) { editP = null; editR = null; }
  route();
  if (lastHash !== null) { window.scrollTo(0, 0); $("app").focus({ preventScroll: true }); }
  lastHash = location.hash;
}

/* ---------- peristiwa ---------- */
document.addEventListener("click", function (ev) {
  var t = ev.target.closest ? ev.target.closest("[data-act],[data-reset]") : null; if (!t) return;
  if (t.hasAttribute("data-reset")) {
    if (armed !== "reset") { armed = "reset"; t.textContent = "Tekan lagi untuk reset"; return; }
    localStorage.removeItem(KEY); try { sessionStorage.removeItem(ADMKEY); } catch (e) { } armed = null; trk = null; editP = null; editR = null; fcat = "Semua"; fq = ""; fsort = ""; ofs = ""; ofq = "";
    db = null; load(); toast("Data demo dikembalikan."); if (location.hash === "#/" || !location.hash) route(); else location.hash = "#/"; return;
  }
  var a = t.dataset.act, id = +t.dataset.id, k = +t.dataset.k, p;
  if (a !== "pdel" && a !== "rdel" && armed && armed !== "reset") armed = null;
  if (a === "fav") { var i = db.wish.indexOf(id); if (i > -1) db.wish.splice(i, 1); else db.wish.push(id); save(); toast(i > -1 ? "Dihapus dari favorit." : "Ditambah ke favorit."); if (location.hash === "#/favorit") { route(); return; } var on = i < 0; t.classList.toggle("on", on); t.setAttribute("aria-pressed", on); chrome(); return; }
  if (a === "add") { p = prod(id); var m = addToCart(p, { pid: id, s: 0, a: [], note: "", q: 1 }); if (m) toast(m); else { toast(p.n + " masuk keranjang."); bump(); } chrome(); return; }
  if (a === "cat") { fcat = t.dataset.c; $("tabs").innerHTML = tabsHTML(); $("grid").innerHTML = gridHTML(); return; }
  if (a === "dqm") { var q = +$("qn").textContent; if (q > 1) $("qn").textContent = q - 1; detailPrice(); return; }
  if (a === "dqp") { var f = $("pf"), pr = prod(f.dataset.id), q2 = +$("qn").textContent, av = pr.stock - inCart(pr.id); if (q2 >= av) { $("pmsg").textContent = av <= 0 ? "Stok habis." : "Stok tersedia tinggal " + av + "."; return; } $("pmsg").textContent = ""; $("qn").textContent = q2 + 1; detailPrice(); return; }
  if (a === "cm" || a === "cp") {
    var l = db.cart[k]; if (!l) return; p = prod(l.pid);
    if (a === "cm") { if (l.q > 1) l.q--; else db.cart.splice(k, 1); }
    else { if (inCart(l.pid) >= p.stock) { toast("Stok " + p.n + " tinggal " + p.stock + "."); return; } l.q++; }
    save(); route(); return;
  }
  if (a === "rm") { db.cart.splice(k, 1); save(); toast("Item dihapus."); route(); return; }
  if (a === "unpromo") { db.promo = ""; save(); route(); return; }
  if (a === "logout") { try { sessionStorage.removeItem(ADMKEY); } catch (e) { } route(); return; }
  if (a === "csvo") { csvOrders(); toast("CSV pesanan diunduh."); return; }
  if (a === "csvp") { csvProducts(); toast("CSV produk diunduh."); return; }
  if (a === "nextst") { var o = findOrder(t.dataset.no); setStatus(o.no, STATUS[STATUS.indexOf(o.status) + 1]); route(); return; }
  if (a === "pnew") { editP = "new"; route(); $("pn").focus(); return; }
  if (a === "pedit") { editP = id; route(); $("pn").focus(); window.scrollTo(0, 0); return; }
  if (a === "pcancel") { editP = null; route(); return; }
  if (a === "pdel") {
    if (armed !== "p" + id) { armed = "p" + id; route(); return; }
    armed = null; db.products = db.products.filter(function (x) { return x.id !== id; }); db.cart = db.cart.filter(function (x) { return x.pid !== id; }); db.wish = db.wish.filter(function (x) { return x !== id; }); save(); toast("Produk dihapus."); route(); return;
  }
  if (a === "rnew") { editR = "new"; route(); $("rc").focus(); return; }
  if (a === "redit") { editR = t.dataset.c; route(); $("rv").focus(); return; }
  if (a === "rcancel") { editR = null; route(); return; }
  if (a === "rdel") {
    var c = t.dataset.c; if (armed !== "r" + c) { armed = "r" + c; route(); return; }
    armed = null; db.promos = db.promos.filter(function (x) { return x.code !== c; }); if (db.promo === c) db.promo = ""; save(); toast("Kode dihapus."); route(); return;
  }
});
function bump() { var b = $("cartbtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
document.addEventListener("submit", function (ev) {
  var f = ev.target; ev.preventDefault();
  if (f.id === "pf") {
    var p = prod(f.dataset.id), l = { pid: p.id, s: 0, a: [], note: $("note").value.trim(), q: +$("qn").textContent || 1 };
    var r = f.querySelector('input[name="s"]:checked'); if (r) l.s = +r.value;
    [].forEach.call(f.querySelectorAll('input[name="a"]:checked'), function (c) { l.a.push(+c.value); });
    var m = addToCart(p, l); if (m) { $("pmsg").textContent = m; return; }
    toast(p.n + " masuk keranjang."); bump(); var q = $("qn"), keep = f.querySelector('input[name="s"]:checked'); route(); chrome();
  } else if (f.id === "promof") {
    var code = $("code").value.trim().toUpperCase(), t = totals(db.cart, db.draft.mode || "antar", 0, "").sub, e = evalPromo(code, t, db.draft.mode || "antar");
    if (e.ok) { db.promo = code; save(); route(); var pm = $("pmsg"); pm.textContent = e.msg; } else { $("pmsg").textContent = e.msg; $("pmsg").className = "msg no"; }
  } else if (f.id === "cof") submitCheckout();
  else if (f.id === "trf") { trk = { no: $("t-no").value.trim(), ph: $("t-ph").value.trim(), keep: true }; if (!trk.no || !digits(trk.ph)) { $("terr").textContent = "Isi nomor pesanan dan nomor telepon."; $("res").innerHTML = ""; return; } trackResult(); }
  else if (f.id === "pinf") { if ($("pin").value === db.pin) { try { sessionStorage.setItem(ADMKEY, "1"); } catch (e2) { } route(); } else { $("perr").textContent = "PIN salah. Coba lagi."; $("pin").value = ""; $("pin").focus(); } }
  else if (f.id === "prodf") saveProduct();
  else if (f.id === "promoef") saveRule();
});
document.addEventListener("change", function (ev) {
  var t = ev.target;
  if (t.closest && t.closest("#pf")) detailPrice();
  if (t.id === "sort") { fsort = t.value; $("grid").innerHTML = gridHTML(); }
  else if (t.closest && t.closest("#cof")) { updCheckout(); storeDraft(); }
  else if (t.id === "of-s") { ofs = t.value; $("olist").innerHTML = ordersListHTML(); }
  else if (t.id === "ost") { var ok = setStatus(t.dataset.no, t.value); route(); }
  else if (t.dataset && t.dataset.stk) { var p = prod(t.dataset.stk), v = t.value; if (!/^\d+$/.test(v) || +v > 9999) { toast("Stok harus angka bulat 0 sampai 9999."); t.value = p.stock; return; } p.stock = +v; save(); toast("Stok " + p.n + ": " + v); }
  else if (t.dataset && t.dataset.shw) { var p2 = prod(t.dataset.shw); p2.show = t.checked; save(); toast(p2.n + (p2.show ? " tampil di toko." : " disembunyikan.")); route(); }
  else if (t.dataset && t.dataset.ron) { db.promos.forEach(function (r) { if (r.code === t.dataset.ron) r.on = t.checked; }); save(); toast("Kode " + t.dataset.ron + (t.checked ? " aktif." : " nonaktif.")); route(); }
});
function storeDraft() {
  var f = $("cof"); if (!f) return;
  db.draft = { name: f.name.value, phone: f.phone.value, mode: f.mode.value, zone: +(f.zone.value || 0), addr: f.addr.value, slot: f.slot.value, pay: f.pay.value, note: f.note.value }; save();
}
document.addEventListener("input", function (ev) {
  var t = ev.target;
  if (t.id === "q") { fq = t.value; $("grid").innerHTML = gridHTML(); }
  else if (t.id === "of-q") { ofq = t.value; $("olist").innerHTML = ordersListHTML(); }
  else if (t.closest && t.closest("#cof")) storeDraft();
});
window.addEventListener("hashchange", onHash);
window.addEventListener("storage", function (e) {
  if (e.key !== KEY) return; try { db = JSON.parse(e.newValue); } catch (x) { return; }
  if (!db) { load(); }
  var h = location.hash; if (h.indexOf("#/lacak") === 0 || h.indexOf("#/admin/pesanan") === 0) { var ae = document.activeElement; if (!ae || ae.tagName !== "INPUT") route(); } else chrome();
});
load();
onHash();
fetch("credits.json").then(function (r) { return r.json(); }).then(function (c) { $("credit").textContent = "Foto dari Wikimedia Commons: " + c.map(function (x) { return x.author + " (" + x.license + ")"; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join("; ") + "."; }).catch(function () { });
