"use strict";
(function () {
var KEY = "omnistat.v1", DAY = 86400000;
var MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
var MONF = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
var STATUS = ["Menunggu", "Lunas", "Dikirim", "Selesai", "Batal", "Refund"];
var PAID = { Lunas: 1, Dikirim: 1, Selesai: 1 }, RANK = { Menunggu: 0, Lunas: 1, Dikirim: 2, Selesai: 3 };
var CHANNELS = [{ n: "Toko online", c: "#4756d6" }, { n: "Marketplace", c: "#0f9d8a" }, { n: "Kasir toko", c: "#c77d0a" }, { n: "Reseller", c: "#d6409f" }];
var REGIONS = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan", "Makassar", "Denpasar"];
var AVC = ["#4756d6", "#0f9d8a", "#c77d0a", "#d6409f", "#0284c7"];

/* ---------- util ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
var nf = new Intl.NumberFormat("id-ID");
function rp(n) { return "Rp" + nf.format(Math.round(n)); }
function compact(n) { if (n >= 1e9) return (n / 1e9).toFixed(1).replace(".0", "").replace(".", ",") + " M"; if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "").replace(".", ",") + " jt"; if (n >= 1e3) return Math.round(n / 1e3) + " rb"; return String(Math.round(n)); }
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function sod(ts) { var d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
function addDays(ts, n) { var d = new Date(ts); d.setDate(d.getDate() + n); return d.getTime(); }
function dkey(ts) { var d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function mkey(ts) { return dkey(ts).slice(0, 7); }
function parseKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }
function fdate(ts) { var d = new Date(ts); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
function fshort(ts) { var d = new Date(ts); return d.getDate() + " " + MON[d.getMonth()]; }
function ftime(ts) { var d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function ago(ts) { var m = Math.floor((Date.now() - ts) / 60000); if (m < 1) return "baru saja"; if (m < 60) return m + " menit lalu"; var h = Math.floor(m / 60); if (h < 24) return h + " jam lalu"; return Math.floor(h / 24) + " hari lalu"; }
function mlabel(k) { var p = k.split("-"); return MONF[+p[1] - 1] + " " + p[0]; }
function initials(n) { return n.split(" ").slice(0, 2).map(function (x) { return x[0]; }).join("").toUpperCase(); }
function hue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
function isInt(v) { return /^\d+$/.test(String(v).trim()); }

/* ---------- seed deterministik ---------- */
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seed(keepDark) {
  var r = rng(20260), now = Date.now(), today = sod(now);
  var P = [
    ["Espresso", "espresso.jpg", 18000, 82, 20, 10], ["Cafe Latte", "latte.jpg", 28000, 46, 20, 9], ["Kopi Susu Gula Aren", "kopi-susu.jpg", 25000, 64, 20, 9],
    ["Cold Brew", "cold-brew.jpg", 30000, 21, 20, 5], ["Matcha Latte", "matcha.jpg", 30000, 12, 15, 5], ["Croissant Mentega", "croissant.jpg", 22000, 9, 15, 5],
    ["Biji Kopi House Blend 250 g", "", 85000, 38, 10, 3], ["Biji Kopi Single Origin 250 g", "", 110000, 24, 10, 2], ["Tumbler Stainless 450 ml", "", 95000, 0, 5, 2],
    ["Brownies Cokelat", "", 24000, 57, 15, 4], ["Teh Tarik Dingin", "", 20000, 71, 20, 5], ["Paket Hampers Kopi", "", 175000, 14, 5, 1]];
  var products = P.map(function (p, i) { return { id: "p" + (i + 1), name: p[0], sku: "OMS-" + pad(i + 1) + "0", img: p[1], price: p[2], stock: p[3], min: p[4], w: p[5], archived: false }; });
  var FN = ["Andi", "Siti", "Budi", "Dewi", "Rizky", "Maya", "Hendra", "Lina", "Agus", "Nadia"];
  var LN = ["Pratama", "Rahma", "Santoso", "Lestari", "Fauzan", "Putri", "Wijaya", "Marlina", "Salim", "Karim", "Nugroho", "Oktavia"];
  var RG = ["Jakarta", "Jakarta", "Bandung", "Surabaya", "Jakarta", "Yogyakarta", "Semarang", "Medan", "Makassar", "Denpasar"];
  var customers = [];
  for (var i = 0; i < 40; i++) customers.push({ id: "c" + (i + 1), name: FN[i % 10] + " " + LN[(7 * (i % 10) + 11 * Math.floor(i / 10)) % 12], phone: "0812-0000-" + pad(i) + pad((i * 7) % 100), region: RG[i % 10] });
  var tw = sum(products.map(function (p) { return p.w; })), raw = [];
  function pick() { var x = r() * tw; for (var k = 0; k < products.length; k++) { x -= products[k].w; if (x < 0) return products[k]; } return products[0]; }
  for (var off = 89; off >= 0; off--) {
    var day = addDays(today, -off), dow = new Date(day).getDay();
    var n = Math.round(5 + 4 * (1 - off / 89) + (dow === 5 || dow === 6 || dow === 0 ? 2 : 0) + r() * 3);
    for (var j = 0; j < n; j++) {
      var ts = day + Math.floor((8 + r() * 13) * 3600000);
      if (ts > now) ts = now - (j + 1) * 600000;
      var cust = customers[Math.floor(r() * r() * 40)], ch = CHANNELS[(function () { var x = r(); return x < .42 ? 0 : x < .68 ? 1 : x < .9 ? 2 : 3; })()].n;
      var lines = 1 + Math.floor(r() * 3), items = [], seen = {};
      for (var l = 0; l < lines; l++) { var p = pick(); if (seen[p.id]) continue; seen[p.id] = 1; items.push({ pid: p.id, name: p.name, qty: 1 + Math.floor(r() * (p.price > 80000 ? 2 : 3)), price: p.price }); }
      var st, x2 = r();
      if (off >= 6) st = x2 < .05 ? "Batal" : x2 < .08 ? "Refund" : "Selesai";
      else if (off >= 2) st = x2 < .1 ? "Menunggu" : x2 < .3 ? "Lunas" : x2 < .65 ? "Dikirim" : x2 < .93 ? "Selesai" : "Batal";
      else st = x2 < .3 ? "Menunggu" : x2 < .65 ? "Lunas" : x2 < .9 ? "Dikirim" : "Batal";
      raw.push({ ts: ts, cid: cust.id, region: cust.region, ch: ch, status: st, items: items, note: "" });
    }
  }
  raw.sort(function (a, b) { return a.ts - b.ts; });
  var orders = raw.map(function (o, i) { o.id = "INV-" + ("0000" + (i + 1)).slice(-5); o.total = sum(o.items.map(function (it) { return it.qty * it.price; })); o.log = [{ ts: o.ts, t: "Pesanan dibuat" }]; return o; });
  var stockLog = products.map(function (p) { return { id: "s" + p.id, pid: p.id, ts: today - 89 * DAY + 3600000, delta: p.stock, after: p.stock, note: "Stok awal data contoh" }; });
  return { v: 1, seq: orders.length, settings: { shop: "Kopi Contoh Nusantara", dark: !!keepDark }, products: products, customers: customers, orders: orders, stockLog: stockLog };
}
var S;
function load() {
  try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1 && Array.isArray(s.orders) && Array.isArray(s.products) && Array.isArray(s.customers) && s.settings) return s; } catch (e) {}
  return seed(false);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { toast("Penyimpanan penuh atau diblokir, data tidak tersimpan"); return false; } }
function prodMap() { var m = {}; S.products.forEach(function (p) { m[p.id] = p; }); return m; }
function custMap() { var m = {}; S.customers.forEach(function (c) { m[c.id] = c; }); return m; }
function cname(id) { var c = custMap()[id]; return c ? c.name : "(tidak diketahui)"; }

/* ---------- state UI ---------- */
var ui = {
  r: "30", cr: null, cfrom: "", cto: "", rerr: "", metric: "rev", ctype: "line",
  o: { q: "", status: "", ch: "", from: "", to: "", sort: "ts", dir: -1, page: 1, sel: {} },
  p: { q: "", f: "", sort: "name", dir: 1, page: 1 },
  c: { q: "", sort: "total", dir: -1, page: 1 },
  rep: { m: "" }
};
var cur = "ringkasan", sheetCtx = null, lastFocus = null, armed = null, armT = null;

/* ---------- toast, csv, arm ---------- */
function toast(m) { var t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("on"); }, 2600); }
function csvCell(v) { var s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s) && isNaN(Number(s))) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function download(name, rows) {
  var text = "﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); toast("File " + name + " diunduh");
}
function arm(key) { if (armed === key) { armed = null; clearTimeout(armT); return true; } armed = key; clearTimeout(armT); armT = setTimeout(function () { armed = null; refresh(); }, 4000); refresh(); return false; }
function refresh() { render(true); if (sheetCtx) renderSheet(true); }

/* ---------- logika data ---------- */
function curRange() {
  var today = sod(Date.now()), to, from, n;
  if (ui.r === "custom" && ui.cr) { from = ui.cr.from; to = addDays(ui.cr.to, 1); n = Math.round((to - from) / DAY); }
  else { n = +ui.r || 30; to = addDays(today, 1); from = addDays(to, -n); }
  return { from: from, to: to, n: n, pf: addDays(from, -n) };
}
function dayKeys(from, to) { var a = []; for (var d = from; d < to; d = addDays(d, 1)) a.push(dkey(d)); return a; }
function stats(from, to) {
  var keys = dayKeys(from, to), days = {}, cs = {}, res = { rev: 0, paidN: 0, validN: 0, keys: keys, days: days, ch: {}, rg: {}, pr: {} };
  keys.forEach(function (k) { days[k] = { rev: 0, n: 0, cust: {} }; });
  S.orders.forEach(function (o) {
    if (o.ts < from || o.ts >= to) return;
    var d = days[dkey(o.ts)]; if (!d) return;
    if (o.status === "Batal" || o.status === "Refund") return;
    res.validN++; d.n++; d.cust[o.cid] = 1; cs[o.cid] = 1;
    if (PAID[o.status]) {
      res.rev += o.total; res.paidN++; d.rev += o.total;
      res.ch[o.ch] = (res.ch[o.ch] || 0) + o.total; res.rg[o.region] = (res.rg[o.region] || 0) + o.total;
      o.items.forEach(function (it) { var p = res.pr[it.pid] || (res.pr[it.pid] = { name: it.name, qty: 0, rev: 0 }); p.qty += it.qty; p.rev += it.qty * it.price; });
    }
  });
  res.cust = Object.keys(cs).length; res.avg = res.paidN ? res.rev / res.paidN : 0;
  return res;
}
function canMove(from, to) {
  if (from === "Batal" || from === "Refund") return false;
  if (to === "Batal") return from === "Menunggu";
  if (to === "Refund") return from !== "Menunggu";
  return RANK[to] > RANK[from];
}
function logStock(pid, delta, after, note) { S.stockLog.push({ id: "s" + Date.now().toString(36) + Math.floor(Math.random() * 1e4), pid: pid, ts: Date.now(), delta: delta, after: after, note: note }); }
function moveStatus(o, to) {
  if (!canMove(o.status, to)) return false;
  var from = o.status, pm = prodMap();
  if (to === "Batal" || to === "Refund") o.items.forEach(function (it) { var p = pm[it.pid]; if (p) { p.stock += it.qty; logStock(p.id, it.qty, p.stock, (to === "Batal" ? "Pembatalan " : "Refund ") + o.id); } });
  o.status = to; o.log.push({ ts: Date.now(), t: "Status " + from + " ke " + to + ((to === "Batal" || to === "Refund") ? ", stok dikembalikan" : "") });
  return true;
}
function stockState(p) { return p.stock <= 0 ? "Habis" : p.stock <= p.min ? "Menipis" : "OK"; }
function lowCount() { return S.products.filter(function (p) { return !p.archived && p.stock <= p.min; }).length; }

/* ---------- komponen ---------- */
function tag(s) { return '<span class="tag t-' + esc(s) + '">' + esc(s) + "</span>"; }
function thumb(p) { return p.img ? '<img class="th" src="img/' + esc(p.img) + '" alt="" loading="lazy">' : '<span class="th" aria-hidden="true" style="background:hsl(' + hue(p.name) + ',45%,38%)">' + esc(initials(p.name)) + "</span>"; }
function pager(total, page, per, k) {
  var pages = Math.max(1, Math.ceil(total / per)), nums = [], i;
  for (i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  var h = '<div class="pg"><span>' + (total ? ((page - 1) * per + 1) + "-" + Math.min(total, page * per) + " dari " + total : "0 data") + "</span><div>";
  h += '<button class="pb" data-act="pg" data-k="' + k + '" data-v="' + (page - 1) + '" aria-label="Halaman sebelumnya"' + (page < 2 ? " disabled" : "") + ">&lsaquo;</button>";
  var last = 0; nums.forEach(function (n) { if (last && n - last > 1) h += '<span aria-hidden="true">&hellip;</span>'; h += '<button class="pb' + (n === page ? " on" : "") + '" data-act="pg" data-k="' + k + '" data-v="' + n + '"' + (n === page ? ' aria-current="page"' : "") + ' aria-label="Halaman ' + n + '">' + n + "</button>"; last = n; });
  return h + '<button class="pb" data-act="pg" data-k="' + k + '" data-v="' + (page + 1) + '" aria-label="Halaman berikutnya"' + (page >= pages ? " disabled" : "") + ">&rsaquo;</button></div></div>";
}
function th(label, k, st, key, cls) {
  var on = st.sort === k;
  return '<th class="' + (cls || "") + '"' + (on ? ' aria-sort="' + (st.dir > 0 ? "ascending" : "descending") + '"' : "") + '><button data-act="sort" data-k="' + key + '" data-v="' + k + '">' + label + (on ? (st.dir > 0 ? " &uarr;" : " &darr;") : "") + "</button></th>";
}
function fld(id, label, control, hint) { return '<div class="fld"><label for="' + id + '">' + label + "</label>" + control + (hint ? '<small class="hint">' + hint + "</small>" : "") + '<div class="err" id="e-' + id + '" role="alert"></div></div>'; }
function setErr(id, msg) { var e = $("#e-" + id), i = $("#" + id); if (e) e.textContent = msg || ""; if (i) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); } return !msg; }
function opt(v, l, sel) { return '<option value="' + esc(v) + '"' + (sel ? " selected" : "") + ">" + esc(l) + "</option>"; }
function lineChartPoints(arr) { var mx = Math.max.apply(null, arr.concat([1])), mn = Math.min.apply(null, arr); return arr.map(function (v, i) { return (arr.length > 1 ? i / (arr.length - 1) * 100 : 50).toFixed(1) + "," + (30 - (v - mn) / ((mx - mn) || 1) * 26).toFixed(1); }).join(" "); }
function pct(c, p) { if (!p) return c ? null : 0; return (c - p) / p * 100; }

/* ---------- Ringkasan ---------- */
function deltaHtml(c, p, fmt) {
  var d = pct(c, p), cls = d === null || Math.abs(d) < .05 ? "nu" : d > 0 ? "up" : "dn", txt;
  if (d === null) txt = "Tidak ada pembanding"; else if (Math.abs(d) < .05) txt = "Sama dengan periode lalu"; else txt = (d > 0 ? "+" : "-") + Math.abs(d).toFixed(1).replace(".", ",") + "% vs periode lalu";
  return '<span class="dl ' + cls + '">' + txt + '</span><small class="pv">Sebelumnya: ' + fmt(p) + "</small>";
}
function pgRingkasan() {
  var R = curRange(), A = stats(R.from, R.to), B = stats(R.pf, R.from);
  var lbl = fshort(R.from) + " - " + fdate(R.to - 1), plbl = fshort(R.pf) + " - " + fdate(R.from - 1);
  var h = '<div class="rangebar"><div class="seg" role="group" aria-label="Rentang tanggal">';
  [["7", "7 hari"], ["30", "30 hari"], ["90", "90 hari"], ["custom", "Kustom"]].forEach(function (x) { h += '<button data-act="range" data-v="' + x[0] + '" aria-pressed="' + (ui.r === x[0]) + '" class="' + (ui.r === x[0] ? "on" : "") + '">' + x[1] + "</button>"; });
  h += "</div>";
  if (ui.r === "custom") h += '<form class="cust" data-form="range" novalidate><label for="cf">Dari<input type="date" id="cf" value="' + esc(ui.cfrom) + '"></label><label for="ct">Sampai<input type="date" id="ct" value="' + esc(ui.cto) + '"></label><button class="btn sm" type="submit">Terapkan</button></form>';
  h += '<span class="muted">' + lbl + " &middot; dibanding " + plbl + "</span></div>";
  if (ui.rerr) h += '<div class="err blk" role="alert">' + esc(ui.rerr) + "</div>";
  var k = A.keys, kp = B.keys;
  var sRev = k.map(function (x) { return A.days[x].rev; }), sN = k.map(function (x) { return A.days[x].n; }), sC = k.map(function (x) { return Object.keys(A.days[x].cust).length; }), sAvg = k.map(function (x) { return A.days[x].n ? A.days[x].rev / A.days[x].n : 0; });
  var cards = [["Pendapatan", rp(A.rev), A.rev, B.rev, rp, sRev], ["Pesanan", nf.format(A.validN), A.validN, B.validN, nf.format.bind(nf), sN], ["Pelanggan aktif", nf.format(A.cust), A.cust, B.cust, nf.format.bind(nf), sC], ["Rata-rata pesanan", rp(A.avg), A.avg, B.avg, rp, sAvg]];
  h += '<div class="kpis">' + cards.map(function (c) { var d = pct(c[2], c[3]), col = d === null || d >= 0 ? "#15803d" : "#b91c1c"; return '<div class="kpi"><small>' + c[0] + "</small><b>" + c[1] + "</b>" + deltaHtml(c[2], c[3], c[4]) + '<svg class="spark" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + lineChartPoints(c[5]) + '" fill="none" stroke="' + col + '" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></div>'; }).join("") + "</div>";
  h += '<div class="grid2"><div class="panel"><div class="ph"><div><h2>' + (ui.metric === "rev" ? "Pendapatan harian" : "Pesanan harian") + '</h2><p class="s">Arahkan kursor, sentuh, atau pakai tombol panah.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="seg" role="group" aria-label="Data grafik"><button data-act="metric" data-v="rev" class="' + (ui.metric === "rev" ? "on" : "") + '" aria-pressed="' + (ui.metric === "rev") + '">Pendapatan</button><button data-act="metric" data-v="n" class="' + (ui.metric === "n" ? "on" : "") + '" aria-pressed="' + (ui.metric === "n") + '">Pesanan</button></div><div class="seg" role="group" aria-label="Jenis grafik"><button data-act="ctype" data-v="line" class="' + (ui.ctype === "line" ? "on" : "") + '" aria-pressed="' + (ui.ctype === "line") + '">Garis</button><button data-act="ctype" data-v="bar" class="' + (ui.ctype === "bar" ? "on" : "") + '" aria-pressed="' + (ui.ctype === "bar") + '">Batang</button></div></div></div>';
  h += '<div class="chartwrap" id="cw"></div><div class="legend"><span><i></i>Periode ini</span>' + (ui.ctype === "line" ? '<span><i class="pv"></i>Periode sebelumnya</span>' : "") + "</div></div>";
  var tc = sum(Object.keys(A.ch).map(function (x) { return A.ch[x]; }));
  h += '<div class="panel"><h2>Saluran penjualan</h2><p class="s">Porsi pendapatan per saluran.</p>';
  if (!tc) h += '<div class="empty">Belum ada penjualan di rentang ini.</div>';
  else { var off = 0, segs = ""; h += '<div class="donut"><svg viewBox="0 0 42 42" role="img" aria-label="Diagram porsi saluran penjualan"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--line)" stroke-width="5"/>'; CHANNELS.forEach(function (c) { var v = A.ch[c.n] || 0, l = v / tc * 100; if (l > 0) { segs += '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="' + c.c + '" stroke-width="5" stroke-dasharray="' + l.toFixed(3) + " " + (100 - l).toFixed(3) + '" stroke-dashoffset="' + (25 - off).toFixed(3) + '"/>'; off += l; } }); h += segs + '<text x="21" y="22.6" text-anchor="middle" font-size="5" font-weight="800" fill="var(--ink)">' + compact(tc) + '</text></svg><div class="leg">' + CHANNELS.map(function (c) { var v = A.ch[c.n] || 0; return '<div><i style="background:' + c.c + '"></i>' + esc(c.n) + "<span>" + rp(v) + " &middot; " + Math.round(v / tc * 100) + "%</span></div>"; }).join("") + "</div></div>"; }
  h += "</div></div>";
  var tp = Object.keys(A.pr).map(function (x) { return { id: x, p: A.pr[x] }; }).sort(function (a, b) { return b.p.qty - a.p.qty; }).slice(0, 5), pm = prodMap(), mx = tp.length ? tp[0].p.qty : 1;
  h += '<div class="grid3"><div class="panel"><h2>Produk terlaris</h2><p class="s">Jumlah terjual di rentang ini.</p>' + (tp.length ? '<ul class="rows">' + tp.map(function (x) { var p = pm[x.id] || { name: x.p.name, img: "" }; return "<li>" + thumb(p) + "<span><b>" + esc(x.p.name) + '</b><span class="m" style="display:block"><i style="width:' + (x.p.qty / mx * 100).toFixed(1) + '%"></i></span></span><span class="v">' + x.p.qty + "<br><small>" + compact(x.p.rev) + "</small></span></li>"; }).join("") + "</ul>" : '<div class="empty">Belum ada penjualan.</div>') + "</div>";
  var rg = REGIONS.concat(Object.keys(A.rg).filter(function (x) { return REGIONS.indexOf(x) < 0; })).map(function (x) { return { n: x, v: A.rg[x] || 0 }; }).filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 6), rm = rg.length ? rg[0].v : 1;
  h += '<div class="panel"><h2>Wilayah</h2><p class="s">Pendapatan per wilayah pelanggan.</p>' + (rg.length ? '<ul class="rows nt">' + rg.map(function (x) { return "<li><span><b>" + esc(x.n) + '</b><span class="m" style="display:block"><i style="width:' + (x.v / rm * 100).toFixed(1) + '%"></i></span></span><span class="v">' + compact(x.v) + "</span></li>"; }).join("") + "</ul>" : '<div class="empty">Belum ada penjualan.</div>') + "</div>";
  var wait = S.orders.filter(function (o) { return o.status === "Menunggu"; }).length;
  h += '<div class="panel"><h2>Perlu perhatian</h2><p class="s">Dihitung dari data saat ini.</p><div class="attn"><button data-act="goWait"><span>Pesanan menunggu pembayaran</span><b>' + wait + '</b></button><button data-act="goLow"><span>Produk stok menipis atau habis</span><b>' + lowCount() + '</b></button><button data-act="newOrder"><span>Buat pesanan baru</span><b>+</b></button></div></div></div>';
  var rec = S.orders.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 5);
  h += '<div class="panel" style="margin-top:14px"><h2>Pesanan terbaru</h2><p class="s">Pilih salah satu untuk melihat detail.</p><ul class="act">' + rec.map(function (o, i) { return '<li><button data-act="openOrder" data-id="' + esc(o.id) + '"><span class="av" style="background:' + AVC[i % 5] + '">' + esc(initials(cname(o.cid))) + '</span><span style="flex:1;min-width:0"><b>' + esc(cname(o.cid)) + "</b> &middot; " + esc(o.id) + " &middot; " + rp(o.total) + "<small>" + ago(o.ts) + " &middot; " + esc(o.ch) + "</small></span>" + tag(o.status) + "</button></li>"; }).join("") + "</ul></div>";
  $("#view").innerHTML = h;
  drawChart($("#cw"), k, ui.metric === "rev" ? sRev : sN, ui.metric === "rev" ? kp.map(function (x) { return B.days[x].rev; }) : kp.map(function (x) { return B.days[x].n; }), kp);
}
var chartRes;
function niceTop(mx) { var raw = mx / 4 || 1, mag = Math.pow(10, Math.floor(Math.log10(raw))), nm = raw / mag, nice = nm <= 1 ? 1 : nm <= 2 ? 2 : nm <= 2.5 ? 2.5 : nm <= 5 ? 5 : 10; return nice * mag * 4; }
function drawChart(host, keys, cur, prev, pkeys) {
  if (!host) return;
  var W = Math.max(240, host.clientWidth || 600), H = 250, L = 46, Rr = 8, T = 10, B = 26, pw = W - L - Rr, ph = H - T - B, n = cur.length, bar = ui.ctype === "bar", isRev = ui.metric === "rev";
  var fmt = isRev ? rp : function (v) { return nf.format(v) + " pesanan"; }, axf = isRev ? compact : function (v) { return String(Math.round(v)); };
  var top = niceTop(Math.max.apply(null, cur.concat(bar ? [] : prev).concat([1])));
  function cx(i) { return bar ? L + (i + .5) * pw / n : (n > 1 ? L + i * pw / (n - 1) : L + pw / 2); }
  function cy(v) { return T + ph - v / top * ph; }
  var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" tabindex="0" aria-label="Grafik ' + (isRev ? "pendapatan" : "pesanan") + " harian, " + n + ' hari. Pakai tombol panah untuk membaca nilai.">';
  for (var g = 0; g <= 4; g++) { var yv = top / 4 * g, y = cy(yv); s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" ' + (g ? 'stroke-dasharray="4 5"' : "") + '/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="var(--mute)">' + axf(yv) + "</text>"; }
  var every = Math.ceil(n / (W < 420 ? 4 : 7));
  for (var i = 0; i < n; i += every) s += '<text x="' + cx(i) + '" y="' + (H - 7) + '" text-anchor="' + (i === 0 && !bar ? "start" : "middle") + '" font-size="11" fill="var(--mute)">' + fshort(parseKey(keys[i])) + "</text>";
  if (bar) { var bw = Math.max(1, pw / n * .72); cur.forEach(function (v, i) { var y = cy(v); s += '<rect x="' + (cx(i) - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + Math.max(0, T + ph - y) + '" rx="' + Math.min(3, bw / 2) + '" fill="#4756d6"/>'; }); }
  else {
    var pp = prev.map(function (v, i) { return (i ? "L" : "M") + cx(i).toFixed(1) + " " + cy(v).toFixed(1); }).join(" ");
    var ln = cur.map(function (v, i) { return (i ? "L" : "M") + cx(i).toFixed(1) + " " + cy(v).toFixed(1); }).join(" ");
    s += '<defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4756d6" stop-opacity=".28"/><stop offset="1" stop-color="#4756d6" stop-opacity="0"/></linearGradient></defs>';
    if (n > 1) s += '<path d="' + pp + '" fill="none" stroke="var(--mute)" stroke-width="2" stroke-dasharray="5 5" opacity=".8"/><path d="' + ln + " L" + cx(n - 1) + " " + (T + ph) + " L" + cx(0) + " " + (T + ph) + ' Z" fill="url(#ga)"/><path d="' + ln + '" fill="none" stroke="#4756d6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
    else s += '<circle cx="' + cx(0) + '" cy="' + cy(cur[0]) + '" r="4" fill="#4756d6"/>';
  }
  s += '<g id="hv" opacity="0">' + (bar ? '<rect id="hr" y="' + T + '" height="' + ph + '" fill="var(--ink)" opacity=".08"/>' : '<line id="hl" y1="' + T + '" y2="' + (T + ph) + '" stroke="var(--pri2)" stroke-dasharray="4 4"/><circle id="hd" r="5.5" fill="#fff" stroke="#4756d6" stroke-width="3"/>') + "</g></svg>";
  host.innerHTML = s + '<div class="tip" id="tip"></div>';
  var svg = $("svg", host), tip = $("#tip"), idx = -1;
  chartRes = { n: n };
  function show(i) {
    i = Math.max(0, Math.min(n - 1, i)); idx = i; var x = cx(i), y = cy(cur[i]);
    $("#hv").setAttribute("opacity", 1);
    if (bar) { var sw = pw / n; $("#hr").setAttribute("x", x - sw / 2); $("#hr").setAttribute("width", sw); } else { $("#hl").setAttribute("x1", x); $("#hl").setAttribute("x2", x); $("#hd").setAttribute("cx", x); $("#hd").setAttribute("cy", y); }
    tip.innerHTML = "<b>" + fmt(cur[i]) + "</b>" + fdate(parseKey(keys[i])) + (!bar && prev[i] != null && pkeys[i] ? "<br>Sebelumnya (" + fshort(parseKey(pkeys[i])) + "): " + fmt(prev[i]) : "");
    tip.style.opacity = 1; tip.style.left = Math.max(70, Math.min(W - 70, x)) + "px"; tip.style.top = y + "px";
  }
  function hide() { $("#hv").setAttribute("opacity", 0); tip.style.opacity = 0; idx = -1; }
  function at(e) { var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width); return bar ? Math.floor((x - L) / (pw / n)) : Math.round((x - L) / (pw / Math.max(1, n - 1))); }
  svg.addEventListener("pointermove", function (e) { show(at(e)); });
  svg.addEventListener("pointerdown", function (e) { show(at(e)); });
  svg.addEventListener("pointerleave", function () { if (document.activeElement !== svg) hide(); });
  svg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { show(idx < 0 ? n - 1 : idx - 1); e.preventDefault(); } else if (e.key === "ArrowRight") { show(idx < 0 ? 0 : idx + 1); e.preventDefault(); } else if (e.key === "Escape") hide(); });
  svg.addEventListener("blur", hide);
  chartRes.show = show;
}

/* ---------- Pesanan ---------- */
function fOrders() {
  var f = ui.o, q = f.q.trim().toLowerCase(), cm = custMap(), dateOk = !f.from || !f.to || f.from <= f.to;
  var list = S.orders.filter(function (o) {
    if (f.status && o.status !== f.status) return false; if (f.ch && o.ch !== f.ch) return false;
    var dk = dkey(o.ts); if (dateOk && ((f.from && dk < f.from) || (f.to && dk > f.to))) return false;
    if (q && (o.id + " " + (cm[o.cid] ? cm[o.cid].name : "")).toLowerCase().indexOf(q) < 0) return false; return true;
  });
  var key = { ts: function (o) { return o.ts; }, name: function (o) { return cname(o.cid).toLowerCase(); }, ch: function (o) { return o.ch; }, total: function (o) { return o.total; }, status: function (o) { return STATUS.indexOf(o.status); } }[f.sort];
  return list.sort(function (a, b) { var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : a.ts - b.ts) * f.dir; });
}
function pgPesanan() {
  var f = ui.o;
  $("#view").innerHTML = '<div class="panel"><div class="filters"><label class="q">Cari<input id="of-q" data-f="o.q" type="search" placeholder="Nama pelanggan atau nomor" value="' + esc(f.q) + '"></label><label>Status<select data-f="o.status" id="of-s"><option value="">Semua</option>' + STATUS.map(function (s) { return opt(s, s, f.status === s); }).join("") + '</select></label><label>Saluran<select data-f="o.ch" id="of-c"><option value="">Semua</option>' + CHANNELS.map(function (c) { return opt(c.n, c.n, f.ch === c.n); }).join("") + '</select></label><label>Dari<input type="date" data-f="o.from" id="of-f" value="' + esc(f.from) + '"></label><label>Sampai<input type="date" data-f="o.to" id="of-t" value="' + esc(f.to) + '"></label><button class="btn g" data-act="clearO">Hapus filter</button><button class="btn g" data-act="csvO">Unduh CSV</button></div><div id="oerr"></div><div id="tb"></div></div>';
  bodyO();
}
function bodyO() {
  var f = ui.o, list = fOrders(), per = 10, pages = Math.max(1, Math.ceil(list.length / per)); if (f.page > pages) f.page = pages;
  var rows = list.slice((f.page - 1) * per, f.page * per), cm = custMap(), nsel = Object.keys(f.sel).length;
  $("#oerr").innerHTML = f.from && f.to && f.from > f.to ? '<div class="err blk" role="alert">Tanggal awal setelah tanggal akhir. Filter tanggal diabaikan.</div>' : "";
  var allOn = rows.length && rows.every(function (o) { return f.sel[o.id]; });
  var h = "";
  if (nsel) h += '<div class="bulk" role="region" aria-label="Aksi massal"><b>' + nsel + ' dipilih</b><label for="bulk-s" class="sr" style="position:absolute;left:-999px">Status baru</label><select id="bulk-s" aria-label="Status baru">' + ["Lunas", "Dikirim", "Selesai", "Batal", "Refund"].map(function (s) { return opt(s, "Ubah ke " + s); }).join("") + '</select><button class="btn sm" data-act="bulk">Terapkan</button><button class="btn g sm" data-act="selClear">Batal pilih</button></div>';
  if (!rows.length) h += '<div class="empty">Tidak ada pesanan yang cocok dengan filter.</div>';
  else h += '<table class="tbl"><thead><tr><th class="cb"><input type="checkbox" data-act="selPage" aria-label="Pilih semua di halaman ini"' + (allOn ? " checked" : "") + ">" + "</th>" + th("Pesanan", "ts", f, "o") + th("Pelanggan", "name", f, "o") + th("Saluran", "ch", f, "o") + th("Total", "total", f, "o", "r") + th("Status", "status", f, "o") + "</tr></thead><tbody>" + rows.map(function (o) {
    return "<tr><td class=\"cb\" data-l=\"Pilih\"><input type=\"checkbox\" data-sel=\"" + esc(o.id) + '" aria-label="Pilih ' + esc(o.id) + '"' + (f.sel[o.id] ? " checked" : "") + '></td><td data-l="Pesanan"><button class="link" data-act="openOrder" data-id="' + esc(o.id) + '">' + esc(o.id) + "</button><br><small class=\"note\">" + fdate(o.ts) + " " + ftime(o.ts) + '</small></td><td data-l="Pelanggan">' + esc(cm[o.cid] ? cm[o.cid].name : "-") + '</td><td data-l="Saluran">' + esc(o.ch) + '</td><td class="r" data-l="Total">' + rp(o.total) + '</td><td data-l="Status">' + tag(o.status) + "</td></tr>";
  }).join("") + "</tbody></table>";
  $("#tb").innerHTML = h + pager(list.length, f.page, per, "o");
}

/* ---------- Produk ---------- */
function fProducts() {
  var f = ui.p, q = f.q.trim().toLowerCase();
  var list = S.products.filter(function (p) {
    if (q && (p.name + " " + p.sku).toLowerCase().indexOf(q) < 0) return false;
    if (f.f === "arsip") return p.archived; if (p.archived) return f.f === "all";
    if (f.f === "low") return p.stock <= p.min; if (f.f === "out") return p.stock <= 0; return true;
  });
  var key = { name: function (p) { return p.name.toLowerCase(); }, price: function (p) { return p.price; }, stock: function (p) { return p.stock; }, min: function (p) { return p.min; } }[f.sort];
  return list.sort(function (a, b) { var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * f.dir; });
}
function pgProduk() {
  var f = ui.p, low = lowCount();
  $("#view").innerHTML = (low ? '<div class="panel" style="margin-bottom:14px;border-color:var(--warn)" role="status"><b>' + low + " produk perlu diisi ulang.</b> <button class=\"link\" data-act=\"goLow\">Tampilkan</button></div>" : "") + '<div class="panel"><div class="filters"><label class="q">Cari<input id="pf-q" data-f="p.q" type="search" placeholder="Nama atau SKU" value="' + esc(f.q) + '"></label><label>Tampilkan<select data-f="p.f" id="pf-f">' + [["", "Produk aktif"], ["low", "Stok menipis"], ["out", "Stok habis"], ["arsip", "Diarsipkan"], ["all", "Semua"]].map(function (x) { return opt(x[0], x[1], f.f === x[0]); }).join("") + '</select></label></div><div id="tb"></div></div>';
  bodyP();
}
function bodyP() {
  var f = ui.p, list = fProducts(), per = 8, pages = Math.max(1, Math.ceil(list.length / per)); if (f.page > pages) f.page = pages;
  var rows = list.slice((f.page - 1) * per, f.page * per), h;
  if (!rows.length) h = '<div class="empty">Tidak ada produk yang cocok.</div>';
  else h = '<table class="tbl"><thead><tr>' + th("Produk", "name", f, "p") + th("Harga", "price", f, "p", "r") + th("Stok", "stock", f, "p", "r") + th("Minimum", "min", f, "p", "r") + "<th>Status</th><th>Aksi</th></tr></thead><tbody>" + rows.map(function (p) {
    var st = p.archived ? "Arsip" : stockState(p);
    return '<tr><td data-l="Produk"><span class="pc">' + thumb(p) + "<span><b>" + esc(p.name) + "</b><small>" + esc(p.sku) + '</small></span></span></td><td class="r" data-l="Harga">' + rp(p.price) + '</td><td class="r" data-l="Stok"><b>' + p.stock + '</b></td><td class="r" data-l="Minimum">' + p.min + '</td><td data-l="Status">' + tag(st) + '</td><td data-l="Aksi"><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn g sm" data-act="editP" data-id="' + esc(p.id) + '">Ubah</button><button class="btn g sm" data-act="stockP" data-id="' + esc(p.id) + '">Stok</button><button class="btn g sm" data-act="archP" data-id="' + esc(p.id) + '">' + (p.archived ? "Aktifkan" : "Arsipkan") + "</button></span></td></tr>";
  }).join("") + "</tbody></table>";
  $("#tb").innerHTML = h + pager(list.length, f.page, per, "p");
}

/* ---------- Pelanggan ---------- */
function custStats() {
  var m = {}; S.customers.forEach(function (c) { m[c.id] = { total: 0, n: 0, last: 0 }; });
  S.orders.forEach(function (o) { var s = m[o.cid]; if (!s) return; s.n++; if (PAID[o.status]) s.total += o.total; if (o.ts > s.last) s.last = o.ts; });
  return m;
}
function pgPelanggan() {
  $("#view").innerHTML = '<div class="panel"><div class="filters"><label class="q">Cari<input id="cf-q" data-f="c.q" type="search" placeholder="Nama, kota, atau telepon" value="' + esc(ui.c.q) + '"></label></div><div id="tb"></div></div>';
  bodyC();
}
function bodyC() {
  var f = ui.c, q = f.q.trim().toLowerCase(), st = custStats();
  var list = S.customers.filter(function (c) { return !q || (c.name + " " + c.region + " " + c.phone).toLowerCase().indexOf(q) > -1; });
  var key = { name: function (c) { return c.name.toLowerCase(); }, region: function (c) { return c.region; }, n: function (c) { return st[c.id].n; }, total: function (c) { return st[c.id].total; }, last: function (c) { return st[c.id].last; } }[f.sort];
  list.sort(function (a, b) { var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * f.dir; });
  var per = 10, pages = Math.max(1, Math.ceil(list.length / per)); if (f.page > pages) f.page = pages;
  var rows = list.slice((f.page - 1) * per, f.page * per), h;
  if (!rows.length) h = '<div class="empty">Tidak ada pelanggan yang cocok.</div>';
  else h = '<table class="tbl"><thead><tr>' + th("Nama", "name", f, "c") + th("Kota", "region", f, "c") + th("Pesanan", "n", f, "c", "r") + th("Total belanja", "total", f, "c", "r") + th("Terakhir", "last", f, "c") + "</tr></thead><tbody>" + rows.map(function (c) {
    var s = st[c.id]; return '<tr><td data-l="Nama"><button class="link" data-act="openCust" data-id="' + esc(c.id) + '">' + esc(c.name) + '</button></td><td data-l="Kota">' + esc(c.region) + '</td><td class="r" data-l="Pesanan">' + s.n + '</td><td class="r" data-l="Total belanja">' + rp(s.total) + '</td><td data-l="Terakhir">' + (s.last ? fdate(s.last) : "-") + "</td></tr>";
  }).join("") + "</tbody></table>";
  $("#tb").innerHTML = h + pager(list.length, f.page, per, "c");
}

/* ---------- Laporan ---------- */
function monthList() { var m = {}; S.orders.forEach(function (o) { m[mkey(o.ts)] = 1; }); m[mkey(Date.now())] = 1; return Object.keys(m).sort().reverse(); }
function monthStats(k) {
  var r = { k: k, n: 0, rev: 0, paidN: 0, batal: 0, refund: 0, cs: {}, ch: {}, pr: {} };
  S.orders.forEach(function (o) {
    if (mkey(o.ts) !== k) return;
    if (o.status === "Batal") { r.batal++; return; } if (o.status === "Refund") { r.refund++; return; }
    r.n++; r.cs[o.cid] = 1;
    if (PAID[o.status]) { r.rev += o.total; r.paidN++; var c = r.ch[o.ch] || (r.ch[o.ch] = { n: 0, rev: 0 }); c.n++; c.rev += o.total; o.items.forEach(function (it) { var p = r.pr[it.pid] || (r.pr[it.pid] = { name: it.name, qty: 0, rev: 0 }); p.qty += it.qty; p.rev += it.qty * it.price; }); }
  });
  r.cust = Object.keys(r.cs).length; r.avg = r.paidN ? r.rev / r.paidN : 0; return r;
}
function pgLaporan() {
  var ms = monthList(); if (ms.indexOf(ui.rep.m) < 0) ui.rep.m = ms[0];
  var all = ms.map(monthStats), sel = monthStats(ui.rep.m), nowk = mkey(Date.now()), first = ms[ms.length - 1];
  var h = '<div class="panel"><div class="ph"><div><h2>Ringkasan bulanan</h2><p class="s">Pesanan batal dan refund tidak dihitung ke pendapatan.</p></div><button class="btn g" data-act="csvRep">Ekspor ringkasan (CSV)</button></div><table class="tbl"><thead><tr><th>Bulan</th><th class="r">Pesanan</th><th class="r">Pendapatan</th><th class="r">Rata-rata</th><th class="r">Pelanggan aktif</th><th class="r">Batal</th><th class="r">Refund</th></tr></thead><tbody>' + all.map(function (m) { return '<tr><td data-l="Bulan"><button class="link" data-act="repM" data-v="' + m.k + '"' + (m.k === ui.rep.m ? ' aria-current="true"' : "") + ">" + mlabel(m.k) + "</button>" + (m.k === nowk ? ' <small class="note">(sampai hari ini)</small>' : m.k === first ? ' <small class="note">(sebagian)</small>' : "") + '</td><td class="r" data-l="Pesanan">' + m.n + '</td><td class="r" data-l="Pendapatan">' + rp(m.rev) + '</td><td class="r" data-l="Rata-rata">' + rp(m.avg) + '</td><td class="r" data-l="Pelanggan aktif">' + m.cust + '</td><td class="r" data-l="Batal">' + m.batal + '</td><td class="r" data-l="Refund">' + m.refund + "</td></tr>"; }).join("") + "</tbody></table></div>";
  var chs = CHANNELS.map(function (c) { var x = sel.ch[c.n] || { n: 0, rev: 0 }; return { n: c.n, o: x.n, rev: x.rev }; });
  var tp = Object.keys(sel.pr).map(function (x) { return sel.pr[x]; }).sort(function (a, b) { return b.qty - a.qty; }).slice(0, 5);
  h += '<div class="grid2" style="margin-top:14px"><div class="panel"><div class="ph"><div><h2>Detail ' + mlabel(sel.k) + '</h2><p class="s">Pendapatan per saluran.</p></div><button class="btn g" data-act="csvMonth">Ekspor pesanan bulan ini</button></div><table class="tbl"><thead><tr><th>Saluran</th><th class="r">Pesanan lunas</th><th class="r">Pendapatan</th><th class="r">Porsi</th></tr></thead><tbody>' + chs.map(function (c) { return '<tr><td data-l="Saluran">' + esc(c.n) + '</td><td class="r" data-l="Pesanan lunas">' + c.o + '</td><td class="r" data-l="Pendapatan">' + rp(c.rev) + '</td><td class="r" data-l="Porsi">' + (sel.rev ? Math.round(c.rev / sel.rev * 100) : 0) + "%</td></tr>"; }).join("") + '</tbody></table></div><div class="panel"><h2>Produk terlaris bulan ini</h2><p class="s">Berdasarkan jumlah terjual.</p>' + (tp.length ? '<ul class="rows nt">' + tp.map(function (p) { return "<li><span><b>" + esc(p.name) + '</b></span><span class="v">' + p.qty + " &middot; " + compact(p.rev) + "</span></li>"; }).join("") + "</ul>" : '<div class="empty">Belum ada penjualan.</div>') + "</div></div>";
  $("#view").innerHTML = h;
}

/* ---------- Pengaturan ---------- */
function pgPengaturan() {
  var h = '<div class="setgrid"><form class="panel" data-form="shop" novalidate><h2>Toko</h2><p class="s">Nama tampil di menu dan invoice.</p>' + fld("st-name", "Nama toko", '<input id="st-name" maxlength="40" autocomplete="off" value="' + esc(S.settings.shop) + '">') + '<button class="btn" type="submit">Simpan</button></form>';
  h += '<div class="panel"><h2>Tampilan</h2><p class="s">Pilihan ini tersimpan di perangkat ini.</p><label class="sw"><input type="checkbox" role="switch" data-act="darkSw" id="dk"' + (S.settings.dark ? " checked" : "") + "> Mode gelap</label></div>";
  h += '<div class="panel"><h2>Data demo</h2><p class="s">' + S.orders.length + " pesanan, " + S.products.length + " produk, " + S.customers.length + ' pelanggan, semuanya tersimpan di browser ini. Mengembalikan data awal 90 hari menghapus perubahanmu.</p><button class="btn ' + (armed === "reset" ? "d" : "g") + '" data-act="reset">' + (armed === "reset" ? "Tekan lagi untuk reset" : "Reset data demo") + "</button></div></div>";
  $("#view").innerHTML = h;
}

/* ---------- Sheet ---------- */
function openSheet(ctx) {
  var wasOpen = $("#sheet").classList.contains("on"); if (!wasOpen) lastFocus = document.activeElement;
  sheetCtx = ctx; renderSheet(); $("#sheet").hidden = false;
  $("#sheet").classList.add("on"); $("#shade").classList.add("on");
}
function closeSheet() {
  if (!sheetCtx) return; sheetCtx = null; $("#sheet").classList.remove("on"); $("#shade").classList.remove("on");
  setTimeout(function () { if (!sheetCtx) { $("#sheet").hidden = true; $("#sheet").innerHTML = ""; } }, 320);
  if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
}
function shell(title, sub, body, foot) { return '<div class="sh-h"><div><h2 id="sheetT">' + esc(title) + "</h2>" + (sub || "") + '</div><button class="ic" data-act="closeSheet" aria-label="Tutup panel">&times;</button></div><div class="sh-b">' + body + "</div>" + (foot ? '<div class="sh-f">' + foot + "</div>" : ""); }
function renderSheet(keep) {
  var c = sheetCtx, el = $("#sheet"), st = el.querySelector(".sh-b") ? el.querySelector(".sh-b").scrollTop : 0;
  if (c.t === "order") {
    var o = S.orders.filter(function (x) { return x.id === c.id; })[0];
    if (!o) { closeSheet(); return; }
    var cu = custMap()[o.cid], acts = "";
    if (o.status === "Menunggu") acts += '<button class="btn" data-act="st" data-id="' + o.id + '" data-s="Lunas">Tandai lunas</button><button class="btn ' + (armed === o.id + "Batal" ? "d" : "g") + '" data-act="st" data-id="' + o.id + '" data-s="Batal">' + (armed === o.id + "Batal" ? "Tekan lagi untuk batalkan" : "Batalkan") + "</button>";
    if (o.status === "Lunas") acts += '<button class="btn" data-act="st" data-id="' + o.id + '" data-s="Dikirim">Kirim pesanan</button>';
    if (o.status === "Dikirim") acts += '<button class="btn" data-act="st" data-id="' + o.id + '" data-s="Selesai">Tandai selesai</button>';
    if (canMove(o.status, "Refund")) acts += '<button class="btn ' + (armed === o.id + "Refund" ? "d" : "g") + '" data-act="st" data-id="' + o.id + '" data-s="Refund">' + (armed === o.id + "Refund" ? "Tekan lagi untuk refund" : "Refund") + "</button>";
    acts += '<button class="btn g" data-act="print" data-id="' + o.id + '">Cetak invoice</button>';
    var body = '<dl class="kv"><dt>Tanggal</dt><dd>' + fdate(o.ts) + " " + ftime(o.ts) + '</dd><dt>Pelanggan</dt><dd><button class="link" data-act="openCust" data-id="' + esc(o.cid) + '">' + esc(cu ? cu.name : "-") + "</button></dd><dt>Saluran</dt><dd>" + esc(o.ch) + "</dd><dt>Wilayah</dt><dd>" + esc(o.region) + "</dd>" + (o.note ? "<dt>Catatan</dt><dd>" + esc(o.note) + "</dd>" : "") + "</dl>" + o.items.map(function (l) { return '<div class="ln"><span>' + l.qty + " &times; " + esc(l.name) + "<br><small class=\"note\">" + rp(l.price) + '</small></span><b>' + rp(l.qty * l.price) + "</b></div>"; }).join("") + '<div class="ln tot"><span>Total</span><span>' + rp(o.total) + "</span></div>" + ((o.status === "Batal" || o.status === "Refund") ? '<p class="note">Pesanan ini ' + (o.status === "Batal" ? "dibatalkan" : "direfund") + ", stoknya sudah dikembalikan. Status tidak bisa diubah lagi.</p>" : "") + '<h3>Riwayat</h3><ul class="hist">' + o.log.slice().reverse().map(function (l) { return "<li>" + esc(l.t) + "<span>" + fdate(l.ts) + " " + ftime(l.ts) + "</span></li>"; }).join("") + "</ul>";
    el.innerHTML = shell(o.id, tag(o.status), body, acts);
  } else if (c.t === "neworder") el.innerHTML = orderForm(c.d);
  else if (c.t === "product") el.innerHTML = productForm(c.id);
  else if (c.t === "stock") el.innerHTML = stockForm(c.id);
  else if (c.t === "customer") {
    var cs = custMap()[c.id]; if (!cs) { closeSheet(); return; }
    var os = S.orders.filter(function (x) { return x.cid === c.id; }).sort(function (a, b) { return b.ts - a.ts; }), s = custStats()[c.id];
    el.innerHTML = shell(cs.name, "", '<dl class="kv"><dt>Telepon</dt><dd>' + esc(cs.phone || "-") + "</dd><dt>Kota</dt><dd>" + esc(cs.region) + "</dd><dt>Pesanan</dt><dd>" + s.n + "</dd><dt>Total belanja</dt><dd><b>" + rp(s.total) + '</b></dd></dl><h3>Riwayat pesanan</h3>' + (os.length ? os.map(function (o) { return '<div class="ln"><span><button class="link" data-act="openOrder" data-id="' + esc(o.id) + '">' + esc(o.id) + "</button><br><small class=\"note\">" + fdate(o.ts) + "</small></span><span style=\"text-align:right\">" + rp(o.total) + "<br>" + tag(o.status) + "</span></div>"; }).join("") : '<div class="empty">Belum ada pesanan.</div>'));
  } else if (c.t === "newcust") el.innerHTML = custForm();
  var b = el.querySelector(".sh-b"); if (b && keep) b.scrollTop = st;
  if (!keep) { var f = el.querySelector("input:not([type=hidden]),select,textarea") || el.querySelector("button"); setTimeout(function () { if (sheetCtx) (f || el).focus(); }, 30); }
}
function orderForm(d) {
  var act = S.products.filter(function (p) { return !p.archived; });
  var sel = '<select id="of-cid" data-calc><option value="">Pilih pelanggan</option>' + S.customers.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) { return opt(c.id, c.name + " (" + c.region + ")", d.cid === c.id); }).join("") + opt("__new", "+ Pelanggan baru", d.cid === "__new") + "</select>";
  var nw = d.cid === "__new" ? '<div class="two">' + fld("of-nn", "Nama pelanggan baru", '<input id="of-nn" maxlength="40" value="' + esc(d.nn) + '">') + fld("of-nr", "Kota", '<select id="of-nr">' + REGIONS.map(function (r) { return opt(r, r, d.nr === r); }).join("") + "</select>") + "</div>" : "";
  var lines = d.lines.map(function (l, i) {
    var p = S.products.filter(function (x) { return x.id === l.pid; })[0];
    return '<div class="lrow" data-line="' + i + '"><div><label class="note" for="ol-p' + i + '">Produk</label><select id="ol-p' + i + '" data-calc><option value="">Pilih produk</option>' + act.filter(function (x) { return x.stock > 0 || x.id === l.pid; }).map(function (x) { return opt(x.id, x.name + " (stok " + x.stock + ")", x.id === l.pid); }).join("") + '</select></div><div><label class="note" for="ol-q' + i + '">Jumlah</label><input id="ol-q' + i + '" data-calc inputmode="numeric" value="' + esc(l.qty) + '"></div><button class="ic" type="button" data-act="delLine" data-v="' + i + '" aria-label="Hapus item ' + (i + 1) + '"' + (d.lines.length < 2 ? " disabled" : "") + " style=\"margin-top:22px\">&times;</button><span class=\"sub\" id=\"ol-s" + i + '">' + (p && isInt(l.qty) ? rp(p.price * +l.qty) : "") + '</span><div class="err" id="e-ol-p' + i + '" role="alert"></div><div class="err" id="e-ol-q' + i + '" role="alert"></div></div>';
  }).join("");
  var body = '<form id="oform" data-form="order" novalidate>' + fld("of-cid", "Pelanggan", sel) + nw + '<div class="two">' + fld("of-ch", "Saluran", '<select id="of-ch">' + CHANNELS.map(function (c) { return opt(c.n, c.n, d.ch === c.n); }).join("") + "</select>") + fld("of-st", "Status awal", '<select id="of-st">' + opt("Menunggu", "Menunggu pembayaran", d.st === "Menunggu") + opt("Lunas", "Sudah lunas", d.st === "Lunas") + "</select>") + '</div><h3 style="margin:4px 0 8px">Item</h3><div class="lines">' + lines + '</div><div class="err blk" id="e-lines" role="alert"></div><button class="btn g sm" type="button" data-act="addLine">+ Tambah item</button>' + '<div style="margin-top:12px">' + fld("of-note", "Catatan (opsional)", '<textarea id="of-note" maxlength="120">' + esc(d.note) + "</textarea>") + '</div><div class="totbar"><span>Total</span><span id="otot">' + rp(orderTotal(d)) + "</span></div></form>";
  return shell("Buat pesanan", "", body, '<button class="btn" type="submit" form="oform">Simpan pesanan</button><button class="btn g" data-act="closeSheet">Batal</button>');
}
function orderTotal(d) { var pm = prodMap(); return sum(d.lines.map(function (l) { var p = pm[l.pid]; return p && isInt(l.qty) ? p.price * +l.qty : 0; })); }
function readOrder(d) {
  d.cid = $("#of-cid").value; d.nn = $("#of-nn") ? $("#of-nn").value : d.nn; d.nr = $("#of-nr") ? $("#of-nr").value : d.nr; d.ch = $("#of-ch").value; d.st = $("#of-st").value; d.note = $("#of-note").value;
  d.lines = $$("[data-line]").map(function (r) { var i = r.dataset.line; return { pid: $("#ol-p" + i).value, qty: $("#ol-q" + i).value }; });
}
function productForm(id) {
  var p = id ? prodMap()[id] : null;
  return shell(p ? "Ubah produk" : "Tambah produk", "", '<form id="pform" data-form="product" novalidate>' + fld("pf-name", "Nama produk", '<input id="pf-name" maxlength="60" value="' + esc(p ? p.name : "") + '">') + '<div class="two">' + fld("pf-price", "Harga (Rp)", '<input id="pf-price" inputmode="numeric" value="' + (p ? p.price : "") + '">') + fld("pf-min", "Stok minimum", '<input id="pf-min" inputmode="numeric" value="' + (p ? p.min : 5) + '">', "Peringatan muncul bila stok sama atau di bawah ini.") + "</div>" + (p ? '<p class="note">Stok saat ini ' + p.stock + ". Ubah stok lewat tombol Stok agar tercatat di riwayat.</p>" : fld("pf-stock", "Stok awal", '<input id="pf-stock" inputmode="numeric" value="0">')) + "</form>", '<button class="btn" type="submit" form="pform">Simpan</button><button class="btn g" data-act="closeSheet">Batal</button>');
}
function stockForm(id) {
  var p = prodMap()[id], hist = S.stockLog.filter(function (x) { return x.pid === id; }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 8);
  return shell("Stok " + p.name, tag(stockState(p)), '<p>Stok saat ini <b>' + p.stock + "</b>, minimum " + p.min + '.</p><form id="sform" data-form="stock" novalidate><div class="two">' + fld("sf-mode", "Jenis", '<select id="sf-mode">' + opt("add", "Tambah stok") + opt("sub", "Kurangi stok") + "</select>") + fld("sf-qty", "Jumlah", '<input id="sf-qty" inputmode="numeric">') + "</div>" + fld("sf-note", "Catatan", '<input id="sf-note" maxlength="80" placeholder="Contoh: barang datang, rusak, hitung ulang">', "Wajib diisi, masuk ke riwayat.") + '</form><h3>Riwayat stok</h3><ul class="hist">' + (hist.length ? hist.map(function (x) { return "<li><span style=\"color:var(--ink)\">" + (x.delta > 0 ? "+" : "") + x.delta + " &middot; " + esc(x.note) + " (jadi " + x.after + ")</span><span>" + fdate(x.ts) + "</span></li>"; }).join("") : "<li>Belum ada catatan.</li>") + "</ul>", '<button class="btn" type="submit" form="sform">Simpan penyesuaian</button><button class="btn g" data-act="closeSheet">Tutup</button>');
}
function custForm() {
  return shell("Tambah pelanggan", "", '<form id="cform" data-form="cust" novalidate>' + fld("cu-name", "Nama", '<input id="cu-name" maxlength="40">') + fld("cu-phone", "Telepon (opsional)", '<input id="cu-phone" inputmode="tel" maxlength="16" placeholder="0812-0000-0000">') + fld("cu-reg", "Kota", '<select id="cu-reg">' + REGIONS.map(function (r) { return opt(r, r); }).join("") + "</select>") + "</form>", '<button class="btn" type="submit" form="cform">Simpan</button><button class="btn g" data-act="closeSheet">Batal</button>');
}

/* ---------- aksi form ---------- */
function submitOrder() {
  var d = sheetCtx.d; readOrder(d); var ok = true, first = null, pm = prodMap();
  function bad(id, m) { setErr(id, m); if (m) { ok = false; first = first || id; } }
  bad("of-cid", d.cid ? "" : "Pilih pelanggan atau buat yang baru.");
  if (d.cid === "__new") { var nm = d.nn.trim(); bad("of-nn", nm.length < 2 ? "Nama minimal 2 huruf." : custMap && S.customers.some(function (c) { return c.name.toLowerCase() === nm.toLowerCase(); }) ? "Nama sudah ada di daftar, pilih dari daftar." : ""); }
  var need = {}; d.lines.forEach(function (l, i) {
    var p = pm[l.pid], pe = "", qe = "";
    if (!l.pid) pe = "Pilih produk."; else if (!p || p.archived) pe = "Produk tidak tersedia.";
    if (!isInt(l.qty) || +l.qty < 1) qe = "Jumlah harus angka bulat 1 atau lebih."; else if (+l.qty > 999) qe = "Jumlah terlalu besar.";
    bad("ol-p" + i, pe); bad("ol-q" + i, qe);
    if (!pe && !qe) need[l.pid] = (need[l.pid] || 0) + +l.qty;
  });
  Object.keys(need).forEach(function (pid) { var p = pm[pid]; if (need[pid] > p.stock) { var idx = d.lines.map(function (l) { return l.pid; }).lastIndexOf(pid); bad("ol-q" + idx, "Stok " + p.name + " tersisa " + p.stock + (need[pid] > +d.lines[idx].qty ? ", total jumlah " + need[pid] + " melebihi stok." : ".")); } });
  if (!ok) { var f = $("#" + first); if (f) f.focus(); toast("Periksa isian yang bertanda merah"); return; }
  var cid = d.cid;
  if (cid === "__new") { cid = "c" + (S.customers.length + 1 + Math.floor(Math.random() * 1e6)); S.customers.push({ id: cid, name: d.nn.trim(), phone: "", region: d.nr }); }
  var cu = custMap()[cid], items = [], merged = {};
  d.lines.forEach(function (l) { var p = pm[l.pid]; if (merged[l.pid]) { merged[l.pid].qty += +l.qty; } else { merged[l.pid] = { pid: p.id, name: p.name, qty: +l.qty, price: p.price }; items.push(merged[l.pid]); } });
  S.seq++; var no = "INV-" + ("0000" + S.seq).slice(-5), now = Date.now();
  var o = { id: no, ts: now, cid: cid, region: cu.region, ch: d.ch, status: d.st, items: items, note: d.note.trim(), total: sum(items.map(function (i) { return i.qty * i.price; })), log: [{ ts: now, t: "Pesanan dibuat" }] };
  if (d.st === "Lunas") o.log.push({ ts: now, t: "Status Menunggu ke Lunas" });
  items.forEach(function (it) { var p = pm[it.pid]; p.stock -= it.qty; logStock(p.id, -it.qty, p.stock, "Pesanan " + no); });
  S.orders.push(o); save(); ui.o.page = 1; toast("Pesanan " + no + " dibuat, stok dikurangi"); render(true);
  sheetCtx = { t: "order", id: no }; renderSheet();
}
function submitProduct() {
  var id = sheetCtx.id, p = id ? prodMap()[id] : null, ok = true;
  var name = $("#pf-name").value.trim(), price = $("#pf-price").value.trim(), min = $("#pf-min").value.trim(), stock = p ? "0" : $("#pf-stock").value.trim();
  var dup = S.products.some(function (x) { return x.id !== id && x.name.toLowerCase() === name.toLowerCase(); });
  ok = setErr("pf-name", name.length < 2 ? "Nama minimal 2 karakter." : dup ? "Nama produk sudah dipakai." : "") && ok;
  ok = setErr("pf-price", !isInt(price) || +price < 100 ? "Harga harus angka bulat, minimal 100." : +price > 99999999 ? "Harga terlalu besar." : "") && ok;
  ok = setErr("pf-min", !isInt(min) ? "Isi angka 0 atau lebih." : "") && ok;
  if (!p) ok = setErr("pf-stock", !isInt(stock) || +stock > 99999 ? "Isi angka 0 sampai 99.999." : "") && ok;
  if (!ok) { var f = $("[aria-invalid=true]"); if (f) f.focus(); return; }
  if (p) { p.name = name; p.price = +price; p.min = +min; toast("Produk diperbarui"); }
  else { var n = S.products.length + 1; while (S.products.some(function (x) { return x.id === "p" + n; })) n++; var np = { id: "p" + n, name: name, sku: "OMS-" + pad(n) + "0", img: "", price: +price, stock: +stock, min: +min, w: 1, archived: false }; S.products.push(np); if (+stock > 0) logStock(np.id, +stock, +stock, "Stok awal"); toast("Produk ditambahkan"); }
  save(); closeSheet(); render(true);
}
function submitStock() {
  var p = prodMap()[sheetCtx.id], mode = $("#sf-mode").value, q = $("#sf-qty").value.trim(), note = $("#sf-note").value.trim(), ok = true;
  ok = setErr("sf-qty", !isInt(q) || +q < 1 ? "Isi angka bulat 1 atau lebih." : +q > 99999 ? "Jumlah terlalu besar." : mode === "sub" && +q > p.stock ? "Stok hanya " + p.stock + ", tidak bisa dikurangi " + q + "." : "") && ok;
  ok = setErr("sf-note", note.length < 3 ? "Tulis catatan singkat, minimal 3 huruf." : "") && ok;
  if (!ok) { var f = $("[aria-invalid=true]"); if (f) f.focus(); return; }
  var d = (mode === "sub" ? -1 : 1) * +q; p.stock += d; logStock(p.id, d, p.stock, note); save(); toast("Stok " + p.name + " jadi " + p.stock); render(true); renderSheet();
}
function submitCust() {
  var name = $("#cu-name").value.trim(), ph = $("#cu-phone").value.trim(), ok = true;
  ok = setErr("cu-name", name.length < 2 ? "Nama minimal 2 huruf." : S.customers.some(function (c) { return c.name.toLowerCase() === name.toLowerCase(); }) ? "Nama sudah ada." : "") && ok;
  ok = setErr("cu-phone", ph && !/^[0-9+\- ]{8,16}$/.test(ph) ? "Pakai angka, spasi, + atau -, 8 sampai 16 karakter." : "") && ok;
  if (!ok) { var f = $("[aria-invalid=true]"); if (f) f.focus(); return; }
  var n = S.customers.length + 1; while (S.customers.some(function (x) { return x.id === "c" + n; })) n++;
  S.customers.push({ id: "c" + n, name: name, phone: ph, region: $("#cu-reg").value }); save(); toast("Pelanggan ditambahkan"); closeSheet(); render(true);
}
function applyStatus(id, to) {
  var o = S.orders.filter(function (x) { return x.id === id; })[0]; if (!o) return;
  if ((to === "Batal" || to === "Refund") && !arm(id + to)) return;
  if (!moveStatus(o, to)) { toast("Status tidak bisa diubah ke " + to); return; }
  save(); toast(o.id + ": " + to); refresh();
}
function bulkApply() {
  var to = $("#bulk-s").value, ok = 0, skip = 0, ids = Object.keys(ui.o.sel);
  ids.forEach(function (id) { var o = S.orders.filter(function (x) { return x.id === id; })[0]; if (o && moveStatus(o, to)) ok++; else skip++; });
  ui.o.sel = {}; save(); toast(ok + " pesanan jadi " + to + (skip ? ", " + skip + " dilewati (status tidak bisa berpindah)" : "")); render(true);
}
function printOrder(id) {
  var o = S.orders.filter(function (x) { return x.id === id; })[0]; if (!o) return;
  $("#print").innerHTML = "<h1>" + esc(S.settings.shop) + "</h1><p>Invoice <b>" + esc(o.id) + "</b><br>Tanggal " + fdate(o.ts) + " " + ftime(o.ts) + "<br>Pelanggan: " + esc(cname(o.cid)) + " (" + esc(o.region) + ")<br>Saluran: " + esc(o.ch) + "<br>Status: " + esc(o.status) + '</p><table><thead><tr><th>Item</th><th class="r">Jumlah</th><th class="r">Harga</th><th class="r">Subtotal</th></tr></thead><tbody>' + o.items.map(function (l) { return "<tr><td>" + esc(l.name) + '</td><td class="r">' + l.qty + '</td><td class="r">' + rp(l.price) + '</td><td class="r">' + rp(l.qty * l.price) + "</td></tr>"; }).join("") + '</tbody></table><div class="tt">Total ' + rp(o.total) + '</div><p style="font-size:11px">Dokumen contoh dari demo OmniStat, bukan faktur pajak.</p>';
  try { window.print(); } catch (e) { toast("Cetak tidak tersedia di browser ini"); }
}
function resetData() {
  if (!arm("reset")) return;
  S = seed(S.settings.dark); ui.o = { q: "", status: "", ch: "", from: "", to: "", sort: "ts", dir: -1, page: 1, sel: {} }; ui.p = { q: "", f: "", sort: "name", dir: 1, page: 1 }; ui.c = { q: "", sort: "total", dir: -1, page: 1 };
  save(); closeSheet(); toast("Data demo dikembalikan ke awal"); render(true);
}
function setDark(on) { S.settings.dark = on; document.documentElement.classList.toggle("dark", on); $("#mode").setAttribute("aria-pressed", on); save(); }

/* ---------- router & render ---------- */
var ROUTES = {
  ringkasan: { t: "Ringkasan penjualan", f: pgRingkasan }, pesanan: { t: "Pesanan", f: pgPesanan }, produk: { t: "Produk dan stok", f: pgProduk },
  pelanggan: { t: "Pelanggan", f: pgPelanggan }, laporan: { t: "Laporan", f: pgLaporan }, pengaturan: { t: "Pengaturan", f: pgPengaturan }
};
var TOPACT = { pesanan: '<button class="btn" data-act="newOrder">+ Buat pesanan</button>', produk: '<button class="btn" data-act="newP">+ Tambah produk</button>', pelanggan: '<button class="btn" data-act="newC">+ Tambah pelanggan</button>' };
function render(soft) {
  var r = ROUTES[cur]; $("#title").textContent = r.t; document.title = r.t + " | OmniStat";
  $("#shopname").textContent = S.settings.shop;
  $$(".side a").forEach(function (a) { var on = a.dataset.nav === cur; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  $("#topact").innerHTML = TOPACT[cur] || "";
  var fo = document.activeElement && document.activeElement.id;
  r.f(); if (!soft) { $("#view").classList.remove("view-in"); void $("#view").offsetWidth; $("#view").classList.add("view-in"); window.scrollTo(0, 0); }
  if (soft && fo && $("#" + fo) && /^(of|pf|cf)-/.test(fo)) $("#" + fo).focus();
}
function route() { var h = location.hash.replace(/^#\/?/, "").split("?")[0]; cur = ROUTES[h] ? h : "ringkasan"; closeSheet(); armed = null; render(false); }

/* ---------- eventos ---------- */
var ACT = {
  mode: function () { setDark(!S.settings.dark); if (cur === "ringkasan") render(true); },
  darkSw: function (el) { setDark(el.checked); },
  closeSheet: closeSheet,
  range: function (el) { ui.rerr = ""; ui.r = el.dataset.v; if (ui.r === "custom" && !ui.cr) { var t = sod(Date.now()); ui.cr = { from: addDays(t, -13), to: t }; ui.cfrom = dkey(ui.cr.from); ui.cto = dkey(ui.cr.to); } render(true); },
  metric: function (el) { ui.metric = el.dataset.v; render(true); }, ctype: function (el) { ui.ctype = el.dataset.v; render(true); },
  goWait: function () { ui.o = { q: "", status: "Menunggu", ch: "", from: "", to: "", sort: "ts", dir: -1, page: 1, sel: {} }; location.hash = "#/pesanan"; },
  goLow: function () { ui.p.f = "low"; ui.p.page = 1; if (cur === "produk") render(true); else location.hash = "#/produk"; },
  newOrder: function () { openSheet({ t: "neworder", d: { cid: "", nn: "", nr: "Jakarta", ch: "Toko online", st: "Menunggu", note: "", lines: [{ pid: "", qty: "1" }] } }); },
  addLine: function () { var d = sheetCtx.d; readOrder(d); d.lines.push({ pid: "", qty: "1" }); renderSheet(true); },
  delLine: function (el) { var d = sheetCtx.d; readOrder(d); d.lines.splice(+el.dataset.v, 1); renderSheet(true); },
  openOrder: function (el) { openSheet({ t: "order", id: el.dataset.id }); },
  openCust: function (el) { openSheet({ t: "customer", id: el.dataset.id }); },
  st: function (el) { applyStatus(el.dataset.id, el.dataset.s); },
  print: function (el) { printOrder(el.dataset.id); },
  sort: function (el) { var st = ui[el.dataset.k], k = el.dataset.v; st.dir = st.sort === k ? -st.dir : (k === "name" || k === "ch" || k === "region" ? 1 : -1); st.sort = k; st.page = 1; body(el.dataset.k); },
  pg: function (el) { ui[el.dataset.k].page = +el.dataset.v; body(el.dataset.k); },
  clearO: function () { ui.o = { q: "", status: "", ch: "", from: "", to: "", sort: ui.o.sort, dir: ui.o.dir, page: 1, sel: ui.o.sel }; pgPesanan(); },
  csvO: function () { var cm = custMap(); download("pesanan.csv", [["No", "Tanggal", "Pelanggan", "Saluran", "Wilayah", "Item", "Total", "Status"]].concat(fOrders().map(function (o) { return [o.id, dkey(o.ts) + " " + ftime(o.ts), cm[o.cid] ? cm[o.cid].name : "", o.ch, o.region, o.items.map(function (i) { return i.qty + "x " + i.name; }).join("; "), o.total, o.status]; }))); },
  selPage: function (el) { var f = ui.o, list = fOrders(), rows = list.slice((f.page - 1) * 10, f.page * 10); rows.forEach(function (o) { if (el.checked) f.sel[o.id] = 1; else delete f.sel[o.id]; }); bodyO(); },
  selClear: function () { ui.o.sel = {}; bodyO(); }, bulk: bulkApply,
  newP: function () { openSheet({ t: "product", id: null }); }, editP: function (el) { openSheet({ t: "product", id: el.dataset.id }); }, stockP: function (el) { openSheet({ t: "stock", id: el.dataset.id }); },
  archP: function (el) { var p = prodMap()[el.dataset.id]; p.archived = !p.archived; save(); toast(p.name + (p.archived ? " diarsipkan" : " diaktifkan lagi")); render(true); },
  newC: function () { openSheet({ t: "newcust" }); },
  repM: function (el) { ui.rep.m = el.dataset.v; render(true); },
  csvRep: function () { download("ringkasan-bulanan.csv", [["Bulan", "Pesanan", "Pendapatan", "Rata-rata pesanan", "Pelanggan aktif", "Batal", "Refund"]].concat(monthList().map(monthStats).map(function (m) { return [m.k, m.n, m.rev, Math.round(m.avg), m.cust, m.batal, m.refund]; }))); },
  csvMonth: function () { var k = ui.rep.m, cm = custMap(); download("pesanan-" + k + ".csv", [["No", "Tanggal", "Pelanggan", "Saluran", "Wilayah", "Item", "Total", "Status"]].concat(S.orders.filter(function (o) { return mkey(o.ts) === k; }).sort(function (a, b) { return a.ts - b.ts; }).map(function (o) { return [o.id, dkey(o.ts) + " " + ftime(o.ts), cm[o.cid] ? cm[o.cid].name : "", o.ch, o.region, o.items.map(function (i) { return i.qty + "x " + i.name; }).join("; "), o.total, o.status]; }))); },
  reset: resetData
};
function body(k) { if (k === "o") bodyO(); else if (k === "p") bodyP(); else bodyC(); }
document.addEventListener("click", function (e) {
  var t = e.target.closest("[data-act]"); if (!t || t.disabled) return;
  if (t.type === "checkbox") return;
  var a = ACT[t.dataset.act]; if (a) a(t);
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (t.dataset.act === "darkSw" || t.dataset.act === "selPage") { ACT[t.dataset.act](t); return; }
  if (t.dataset.sel) { if (t.checked) ui.o.sel[t.dataset.sel] = 1; else delete ui.o.sel[t.dataset.sel]; bodyO(); return; }
  if (t.dataset.f) filt(t);
  if (t.id === "of-cid" && sheetCtx && sheetCtx.t === "neworder") { readOrder(sheetCtx.d); renderSheet(true); }
});
function filt(t) { var p = t.dataset.f.split("."), st = ui[p[0]]; st[p[1]] = t.value; st.page = 1; if (p[0] === "p" && t.id === "pf-f") { } body(p[0]); }
document.addEventListener("input", function (e) {
  var t = e.target;
  if (t.dataset.f && (t.type === "search" || t.type === "text")) { filt(t); return; }
  if (t.dataset.calc !== undefined && sheetCtx && sheetCtx.t === "neworder") calcOrder();
});
function calcOrder() { var d = sheetCtx.d, pm = prodMap(); readOrder(d); d.lines.forEach(function (l, i) { var p = pm[l.pid], s = $("#ol-s" + i); if (s) s.textContent = p && isInt(l.qty) ? rp(p.price * +l.qty) : ""; }); var t = $("#otot"); if (t) t.textContent = rp(orderTotal(d)); }
document.addEventListener("submit", function (e) {
  var f = e.target.dataset.form; if (!f) return; e.preventDefault();
  if (f === "order") submitOrder(); else if (f === "product") submitProduct(); else if (f === "stock") submitStock(); else if (f === "cust") submitCust();
  else if (f === "shop") { var v = $("#st-name").value.trim(); if (!setErr("st-name", v.length < 2 ? "Nama toko minimal 2 karakter." : "")) return; S.settings.shop = v; save(); toast("Nama toko disimpan"); $("#shopname").textContent = v; }
  else if (f === "range") {
    var a = $("#cf").value, b = $("#ct").value, today = dkey(Date.now());
    ui.cfrom = a; ui.cto = b;
    ui.rerr = !a || !b ? "Isi tanggal awal dan akhir." : a > b ? "Tanggal awal tidak boleh setelah tanggal akhir." : b > today ? "Tanggal akhir tidak boleh melewati hari ini." : (parseKey(b) - parseKey(a)) / DAY >= 180 ? "Rentang maksimal 180 hari." : "";
    if (!ui.rerr) ui.cr = { from: parseKey(a), to: parseKey(b) };
    render(true);
  }
});
document.addEventListener("keydown", function (e) {
  if (!sheetCtx) return;
  if (e.key === "Escape") { closeSheet(); return; }
  if (e.key === "Tab") { var f = $$("#sheet button:not([disabled]),#sheet input,#sheet select,#sheet textarea").filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return; var i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { f[0].focus(); e.preventDefault(); } }
});
var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (cur === "ringkasan") render(true); }, 150); });
window.addEventListener("hashchange", route);

/* ---------- mulai ---------- */
S = load(); save();
document.documentElement.classList.toggle("dark", !!S.settings.dark); $("#mode").setAttribute("aria-pressed", !!S.settings.dark);
fetch("credits.json").then(function (r) { return r.json(); }).then(function (c) { $("#cred").textContent = "Foto produk dari Wikimedia Commons: " + c.map(function (x) { return x.author + " (" + x.license + ")"; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join("; ") + "."; }).catch(function () {});
route();
})();
