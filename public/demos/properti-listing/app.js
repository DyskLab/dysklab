"use strict";
/* Naungan Properti: sisi pengunjung. Data di localStorage (kunci properti.v1). */
var KEY = "properti.v1", PIN = "2468", PER_PAGE = 9;
var S, route = { parts: [], q: {} }, F = null, rt = { menu: false, verified: {}, lbId: "", lbI: 0, amorAll: false, filtersOpen: false };
var ACT = {}, CHG = {}, INP = {}, SUB = {};

/* ---------- util ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function dot(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function short(n) {
  var v;
  if (n >= 1e9) { v = Math.round(n / 1e7) / 100; return String(v).replace(".", ",") + " M"; }
  if (n >= 1e6) { v = Math.round(n / 1e5) / 10; return String(v).replace(".", ",") + " jt"; }
  return dot(n);
}
function rp(n) { return "Rp " + dot(n); }
function rps(n) { return "Rp " + short(n); }
function price(l) { return rps(l.harga) + (l.mode === "sewa" ? " / " + l.satuan : ""); }
function parsePrice(s) {
  s = String(s == null ? "" : s).trim().toLowerCase().replace(/^rp\.?\s*/, "").replace(/\s+/g, "");
  if (!s) return NaN;
  var m = /^([\d.,]+)(miliar|m|juta|jt|ribu|rb|k)?$/.exec(s);
  if (!m) return NaN;
  var mult = { miliar: 1e9, m: 1e9, juta: 1e6, jt: 1e6, ribu: 1e3, rb: 1e3, k: 1e3 }[m[2]];
  if (mult) { var v = parseFloat(m[1].replace(",", ".")); return isNaN(v) ? NaN : Math.round(v * mult); }
  var d = m[1].replace(/[.,]/g, "");
  return d ? parseInt(d, 10) : NaN;
}
var HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"], BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
function parseYmd(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); }
function fmtTgl(s) { if (!s) return ""; var d = parseYmd(s); return HARI[d.getDay()] + ", " + d.getDate() + " " + BLN[d.getMonth()] + " " + d.getFullYear(); }
function fmtDT(iso) { var d = new Date(iso); return d.getDate() + " " + BLN[d.getMonth()] + " " + d.getFullYear() + ", " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
function toast(m) {
  var t = $("#toast"); t.textContent = m; t.className = "show";
  clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ""; }, 3200);
}
function twice(el) {
  if (el._arm) { clearTimeout(el._t); el._arm = 0; el.innerHTML = el._html; el.classList.remove("armed"); return true; }
  el._arm = 1; el._html = el.innerHTML; el.textContent = "Yakin? Klik lagi"; el.classList.add("armed");
  el._t = setTimeout(function () { el._arm = 0; el.innerHTML = el._html; el.classList.remove("armed"); }, 4000);
  return false;
}
var ICON = {
  bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M6.5 11.5h.01"/>',
  bath: '<path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2zM6 12V6.5A2.5 2.5 0 0 1 10.5 5M7 18l-1 2M17 18l1 2"/>',
  home: '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5"/>',
  land: '<path d="M3 18l5-8 4 5 3-4 6 7zM3 21h18"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.2-9.4A5 5 0 0 1 12 7.3a5 5 0 0 1 9.2 3.3C19.5 15.400 12 20 12 20z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.500 4.500"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  print: '<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6h16v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.600 0l3-3a4 4 0 0 0-5.600-5.600l-1 1M14 10a4 4 0 0 0-5.600 0l-3 3a4 4 0 0 0 5.600 5.600l1-1"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  dl: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone: '<path d="M6 4h3l1.500 4-2 1.500a10 10 0 0 0 6 6L16 13.500l4 1.500v3a2 2 0 0 1-2 2A14 14 0 0 1 4 6a2 2 0 0 1 2-2z"/>',
  logo: '<path d="M3 11.500L12 4l9 7.500"/><path d="M5.500 10v10h13V10"/><path d="M10 20v-5.500h4V20"/>'
};
function ico(n, cls) { return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[n] + "</svg>"; }

/* ---------- state ---------- */
function load() {
  try {
    var r = localStorage.getItem(KEY);
    if (r) { var o = JSON.parse(r); if (o && o.v === 1 && Array.isArray(o.listings) && Array.isArray(o.leads)) return o; }
  } catch (e) { /* abaikan, pakai seed */ }
  return makeSeed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Penyimpanan peramban penuh atau dimatikan."); } }
function getL(id) { for (var i = 0; i < S.listings.length; i++) if (S.listings[i].id === id) return S.listings[i]; return null; }
function pub(l) { return l && l.tampil; }
function isAdmin() { try { return sessionStorage.getItem("np.admin") === "1"; } catch (e) { return false; } }
function luasUtama(l) { return l.tipe === "tanah" ? l.lt : (l.lb || l.lt); }
function cicil(P, dp, rate, years) {
  var pr = P * (1 - dp / 100), r = rate / 1200, n = years * 12;
  return r === 0 ? pr / n : pr * r / (1 - Math.pow(1 + r, -n));
}
function amort(P, rate, years) {
  var r = rate / 1200, n = years * 12, pay = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)), bal = P, rows = [], tb = 0;
  for (var y = 1; y <= years; y++) {
    var bi = 0, pp = 0;
    for (var m = 0; m < 12; m++) { var i = bal * r, pr = pay - i; bi += i; pp += pr; bal -= pr; }
    tb += bi;
    rows.push({ y: y, pay: pay * 12, pokok: pp, bunga: bi, sisa: Math.max(0, bal) });
  }
  return { pay: pay, rows: rows, totalBunga: tb };
}
function leadsOf(id) { return S.leads.filter(function (x) { return x.listingId === id; }); }
function setLeadStatus(lead, st) {
  if (lead.status === st) return;
  lead.status = st; lead.riwayat.push({ t: new Date().toISOString(), s: st });
}
function nextKode() { S.seq = (S.seq || 1000) + 1; return "TKT-" + S.seq; }
function slotLeads(tgl, jam, except) {
  return S.leads.filter(function (x) { return x.jenis === "survei" && x.tgl === tgl && x.jam === jam && x.status !== "batal" && x.kode !== except; });
}
function slotState(tgl, jam, listingId, except) {
  var a = slotLeads(tgl, jam, except);
  if (a.some(function (x) { return x.listingId === listingId; })) return "listing";
  if (a.length >= 2) return "penuh";
  return "ok";
}
function surveyDates() {
  var out = [], t = new Date();
  for (var i = 1; i <= 21; i++) { var d = addDays(t, i); if (d.getDay() !== 0) out.push(ymd(d)); }
  return out;
}
function csvCell(v) {
  v = String(v == null ? "" : v);
  if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
  return '"' + v.replace(/"/g, '""') + '"';
}
function downloadCsv(name, rows) {
  var txt = "﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function waLink(agen, text) { return "https://wa.me/" + AGEN[agen || 0].wa + "?text=" + encodeURIComponent(text); }

/* ---------- komponen ---------- */
function badgeMode(l) { return '<span class="bd bd-' + l.mode + '">' + (l.mode === "jual" ? "Dijual" : "Disewa") + "</span>"; }
function badges(l) {
  var h = badgeMode(l);
  if (l.status !== "tersedia") h += '<span class="bd bd-st bd-' + l.status + '">' + STATUS_LST[l.status] + "</span>";
  if (!l.tampil) h += '<span class="bd bd-hide">Disembunyikan</span>';
  return '<span class="bds">' + h + "</span>";
}
function specList(l) {
  var a = [];
  if (l.kt) a.push('<li title="Kamar tidur">' + ico("bed") + '<span class="sr">Kamar tidur </span>' + l.kt + "</li>");
  if (l.km) a.push('<li title="Kamar mandi">' + ico("bath") + '<span class="sr">Kamar mandi </span>' + l.km + "</li>");
  if (l.lb) a.push('<li title="Luas bangunan">' + ico("home") + '<span class="sr">Bangunan </span>' + l.lb + " m²</li>");
  if (l.lt) a.push('<li title="Luas tanah">' + ico("land") + '<span class="sr">Tanah </span>' + l.lt + " m²</li>");
  return '<ul class="specs">' + a.join("") + "</ul>";
}
function photo(k) { return IMGMAP[k] || IMG[0]; }
function card(l) {
  var fav = S.favs.indexOf(l.id) > -1, cm = S.cmp.indexOf(l.id) > -1, im = photo(l.foto[0]);
  var cic = l.mode === "jual" && l.tipe !== "tanah" ? '<p class="cic">Cicilan mulai ' + rps(Math.round(cicil(l.harga, 20, 7.5, 20))) + " / bln</p>" : "";
  return '<article class="card' + (l.status !== "tersedia" ? " is-off" : "") + '" data-id="' + l.id + '">' +
    '<a class="card-img" href="#/properti/' + l.id + '" aria-label="' + esc(l.judul) + '"><img src="img/' + im.k + '.jpg" alt="' + esc(im.alt) + '" loading="lazy" width="400" height="300">' + badges(l) + "</a>" +
    '<button type="button" class="fav' + (fav ? " on" : "") + '" data-act="fav" data-id="' + l.id + '" aria-pressed="' + fav + '" aria-label="Simpan ke favorit: ' + esc(l.judul) + '">' + ico("heart") + "</button>" +
    '<div class="card-b"><p class="price">' + price(l) + "</p>" + cic +
    '<h3><a href="#/properti/' + l.id + '">' + esc(l.judul) + "</a></h3>" +
    '<p class="loc">' + ico("pin") + esc(l.area) + ", " + esc(l.kota) + "</p>" + specList(l) +
    '<label class="cmp"><input type="checkbox" data-act="cmp" data-id="' + l.id + '"' + (cm ? " checked" : "") + "> Bandingkan</label></div></article>";
}
function empty(t, p, btn) { return '<div class="empty"><h3>' + esc(t) + "</h3><p>" + esc(p) + "</p>" + (btn || "") + "</div>"; }

/* ---------- header, footer, bar ---------- */
function renderHeader() {
  var pg = route.parts[0] || "", adm = pg === "admin";
  var h;
  if (adm) {
    h = '<div class="bar"><a class="brand" href="#/" aria-label="Naungan Properti, ke beranda">' + '<span>Naungan</span><i>Properti</i><small>Panel agen</small></a>' +
      '<nav class="nav nav-adm" aria-label="Utama"><a href="#/">Lihat situs</a>' + (isAdmin() ? '<button type="button" class="btn btn-sm btn-ghost" data-act="adm-logout">Keluar</button>' : "") + "</nav></div>";
  } else {
    var cur = function (m) { return pg === m ? ' aria-current="page"' : ""; };
    var curMode = function (m) { return pg === "cari" && route.q.mode === m ? ' aria-current="page"' : ""; };
    h = '<div class="bar"><a class="brand" href="#/" aria-label="Naungan Properti, ke beranda">' + "<span>Naungan</span><i>Properti</i></a>" +
      '<button type="button" class="burger" data-act="menu" aria-expanded="' + rt.menu + '" aria-controls="nav">' + ico(rt.menu ? "x" : "menu") + '<span class="sr">Menu</span></button>' +
      '<nav id="nav" class="nav' + (rt.menu ? " open" : "") + '" aria-label="Utama">' +
      '<a href="#/"' + cur("") + ">Beranda</a>" +
      '<a href="#/cari?mode=jual"' + curMode("jual") + ">Dijual</a>" +
      '<a href="#/cari?mode=sewa"' + curMode("sewa") + ">Disewa</a>" +
      '<a href="#/kpr"' + cur("kpr") + ">Simulasi KPR</a>" +
      '<a href="#/favorit"' + cur("favorit") + ">Favorit" + (S.favs.length ? ' <span class="cnt">' + S.favs.length + "</span>" : "") + "</a>" +
      '<a href="#/bandingkan"' + cur("bandingkan") + ">Bandingkan" + (S.cmp.length ? ' <span class="cnt">' + S.cmp.length + "</span>" : "") + "</a>" +
      '<a href="#/tiket"' + cur("tiket") + ">Lacak tiket</a>" +
      '<a class="btn btn-sm nav-cta" href="#/admin">Panel agen</a></nav></div>';
  }
  $("#top").innerHTML = h;
}
function renderFoot() {
  var el = $("#foot");
  if (route.parts[0] === "admin") { el.innerHTML = ""; return; }
  el.innerHTML = '<div class="wrap"><div class="foot-in"><div><p class="brand brand-f"><span>Naungan</span><i>Properti</i></p>' +
    "<p>Agen properti contoh untuk jual dan sewa rumah, apartemen, ruko, dan tanah. Semua data, nama, dan nomor di demo ini fiktif.</p></div>" +
    "<div><h4>Kontak contoh</h4><p>0812-0000-0100<br>Jl. Contoh Raya No. 1, Jakarta<br>Senin sampai Sabtu, 09.00-17.00</p></div>" +
    '<div class="foot-l"><h4>Tautan</h4><a href="#/cari">Semua properti</a><br><a href="#/kpr">Simulasi KPR</a><br><a href="#/tiket">Lacak tiket</a><br><a href="#/admin">Panel agen</a></div></div>' +
    '<div class="foot-b"><p>Foto: Wikimedia Commons, <a href="credits.json" target="_blank" rel="noopener">lihat kredit</a>. Foto hanya ilustrasi, bukan unit yang sebenarnya.</p>' +
    '<button type="button" class="btn btn-sm btn-ghost" data-act="reset">Reset data demo</button></div></div>';
}
function renderCmpBar() {
  var el = $("#cmpbar"), pg = route.parts[0] || "";
  if (!S.cmp.length || pg === "bandingkan" || pg === "admin") { el.hidden = true; el.innerHTML = ""; return; }
  var th = S.cmp.map(function (id) { var l = getL(id); return l ? '<img src="img/' + photo(l.foto[0]).k + '.jpg" alt="" width="36" height="36">' : ""; }).join("");
  el.hidden = false;
  el.innerHTML = '<div class="cmpbar-in"><span class="cmp-th">' + th + "</span><span><b>" + S.cmp.length + "</b> dari 3 dipilih</span>" +
    '<a class="btn btn-sm" href="#/bandingkan">Bandingkan</a><button type="button" class="btn btn-sm btn-ghost" data-act="cmp-clear">Kosongkan</button></div>';
}

/* ---------- router ---------- */
function parseHash() {
  var h = location.hash.replace(/^#\/?/, ""), qi = h.indexOf("?"), path = qi > -1 ? h.slice(0, qi) : h, qs = qi > -1 ? h.slice(qi + 1) : "", q = {};
  qs.split("&").forEach(function (p) {
    if (!p) return;
    var i = p.indexOf("="), k, v;
    try { k = decodeURIComponent(p.slice(0, i < 0 ? p.length : i)); v = i < 0 ? "" : decodeURIComponent(p.slice(i + 1).replace(/\+/g, " ")); } catch (e) { return; }
    q[k] = v;
  });
  return { parts: path.split("/").filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } }), q: q };
}
function render(keepScroll) {
  route = parseHash();
  var p = route.parts, pg = p[0] || "", main = $("#main"), title = "Naungan Properti";
  rt.menu = false;
  if (pg !== "cari") rt.filtersOpen = false;
  if (!(pg === "admin")) { closeSheet(); }
  if (pg === "") { main.innerHTML = pageHome(); calcHome(); }
  else if (pg === "cari") { title = "Cari properti"; pageSearch(route.q); }
  else if (pg === "properti") title = pageDetail(p[1]);
  else if (pg === "favorit") { title = "Favorit"; main.innerHTML = pageFav(); }
  else if (pg === "bandingkan") { title = "Bandingkan"; main.innerHTML = pageCompare(); }
  else if (pg === "kpr") { title = "Simulasi KPR"; main.innerHTML = pageKpr(); calcKpr(); }
  else if (pg === "tiket") { title = "Lacak tiket"; main.innerHTML = pageTicket(p[1]); }
  else if (pg === "admin") { title = "Panel agen"; pageAdmin(p.slice(1)); }
  else { title = "Tidak ditemukan"; main.innerHTML = '<div class="wrap">' + empty("Halaman tidak ditemukan", "Alamat yang Anda buka tidak ada.", '<a class="btn" href="#/">Ke beranda</a>') + "</div>"; }
  document.title = title + " | Naungan Properti";
  renderHeader(); renderFoot(); renderCmpBar();
  if (!keepScroll) { window.scrollTo(0, 0); }
}

/* ---------- beranda ---------- */
function slidesOf(avail) {
  var seen = {}, out = [];
  avail.filter(function (l) { return l.tipe !== "tanah"; }).sort(function (a, b) { return b.dilihat - a.dilihat; }).forEach(function (l) {
    var k = l.foto[0];
    if (out.length < 4 && !seen[k] && IMGMAP[k] && IMGMAP[k].g !== "Interior") { seen[k] = 1; out.push(l); }
  });
  return out;
}
function mosaicKota(avail) {
  var by = {}, used = {};
  avail.forEach(function (l) { (by[l.kota] = by[l.kota] || []).push(l); });
  return Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length || (a < b ? -1 : 1); }).slice(0, 6).map(function (k) {
    var ph = null;
    by[k].forEach(function (l) { l.foto.forEach(function (f) { if (!ph && !used[f]) ph = f; }); });
    ph = ph || by[k][0].foto[0]; used[ph] = 1;
    return { kota: k, n: by[k].length, k: photo(ph).k };
  });
}
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function edBig(l) {
  var fav = S.favs.indexOf(l.id) > -1, cm = S.cmp.indexOf(l.id) > -1, im = photo(l.foto[0]);
  var d = [["Kamar tidur", l.kt], ["Kamar mandi", l.km], ["Bangunan", l.lb ? l.lb + " m²" : ""], ["Tanah", l.lt ? l.lt + " m²" : ""], ["Sertifikat", l.sertifikat], ["Tahun", l.tahun]].filter(function (x) { return x[1]; }).slice(0, 6);
  var txt = String(l.deskripsi || ""); if (txt.length > 170) txt = txt.slice(0, 167).replace(/\s+\S*$/, "") + "...";
  return '<article class="ed-big" data-id="' + l.id + '"><a class="ed-ph" href="#/properti/' + l.id + '" aria-label="' + esc(l.judul) + '"><img src="img/' + im.k + '.jpg" alt="' + esc(im.alt) + '" width="900" height="600" loading="lazy"><span class="mg-no">No. 01</span>' + badges(l) + "</a>" +
    '<button type="button" class="fav' + (fav ? " on" : "") + '" data-act="fav" data-id="' + l.id + '" aria-pressed="' + fav + '" aria-label="Simpan ke favorit: ' + esc(l.judul) + '">' + ico("heart") + "</button>" +
    '<div class="ed-tx"><p class="kick">' + esc(TIPE[l.tipe]) + " &middot; " + esc(l.area) + ", " + esc(l.kota) + "</p><h3><a href=\"#/properti/" + l.id + '">' + esc(l.judul) + "</a></h3>" +
    '<p class="strip-p"><b>' + price(l) + "</b><span>" + (l.mode === "jual" ? "Dijual" : "Disewa") + "</span></p>" +
    '<dl class="ed-spec">' + d.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" +
    '<p class="ed-desc">' + esc(txt) + '</p><div class="row"><a class="btn" href="#/properti/' + l.id + '">Baca selengkapnya</a>' +
    '<label class="cmp-in"><input type="checkbox" data-act="cmp" data-id="' + l.id + '"' + (cm ? " checked" : "") + "> Bandingkan</label></div></div></article>";
}
function edTall(l, n) {
  var fav = S.favs.indexOf(l.id) > -1, cm = S.cmp.indexOf(l.id) > -1, im = photo(l.foto[0]);
  var cic = l.mode === "jual" && l.tipe !== "tanah" ? '<p class="cic">Cicilan mulai ' + rps(Math.round(cicil(l.harga, 20, 7.5, 20))) + " / bln</p>" : "";
  return '<article class="tc" data-id="' + l.id + '"><p class="strip-p"><b>' + price(l) + "</b><span>" + (l.mode === "jual" ? "Dijual" : "Disewa") + "</span></p>" +
    '<a class="tc-img" href="#/properti/' + l.id + '" aria-label="' + esc(l.judul) + '"><img src="img/' + im.k + '.jpg" alt="' + esc(im.alt) + '" width="400" height="300" loading="lazy"><span class="mg-no">No. ' + pad2(n) + "</span></a>" +
    '<button type="button" class="fav' + (fav ? " on" : "") + '" data-act="fav" data-id="' + l.id + '" aria-pressed="' + fav + '" aria-label="Simpan ke favorit: ' + esc(l.judul) + '">' + ico("heart") + "</button>" +
    '<div class="tc-b"><p class="kick">' + esc(TIPE[l.tipe]) + '</p><h3><a href="#/properti/' + l.id + '">' + esc(l.judul) + "</a></h3>" +
    '<p class="loc">' + ico("pin") + esc(l.area) + ", " + esc(l.kota) + "</p>" + cic + specList(l) +
    '<label class="cmp"><input type="checkbox" data-act="cmp" data-id="' + l.id + '"' + (cm ? " checked" : "") + "> Bandingkan</label></div></article>";
}
function pageHome() {
  var vis = S.listings.filter(pub);
  var avail = vis.filter(function (l) { return l.status === "tersedia"; });
  var feat = avail.slice().sort(function (a, b) { return b.dilihat - a.dilihat; }).slice(0, 4);
  var kotas = uniqKota(), sl = slidesOf(avail), mos = mosaicKota(avail);
  var nSurvei = S.leads.filter(function (x) { return x.jenis === "survei" && x.status !== "batal" && x.tgl >= ymd(new Date()); }).length;
  var slides = (sl.length ? sl : []).map(function (l, i) {
    var im = photo(l.foto[0]);
    return '<figure class="mh-s" style="--i:' + i + '"><img src="img/' + im.k + '.jpg" alt="' + esc(im.alt) + '" width="900" height="600"' + (i ? ' loading="lazy"' : "") + '><figcaption><b>' + pad2(i + 1) + " / " + pad2(sl.length) + "</b>" + esc(TIPE[l.tipe]) + " di " + esc(l.area) + ", " + esc(l.kota) + "</figcaption></figure>";
  }).join("");
  var tiles = mos.map(function (m, i) {
    return '<a class="tile t' + (i + 1) + '" href="#/cari?kota=' + encodeURIComponent(m.kota) + '"><img src="img/' + m.k + '.jpg" alt="" width="600" height="400" loading="lazy"><em>' + pad2(i + 1) + "</em><span><b>" + esc(m.kota) + "</b><small>" + m.n + " listing</small></span></a>";
  }).join("");
  var tall = feat.slice(1).map(function (l, i) { return edTall(l, i + 2); }).join("");
  return '<section class="mh" style="--n:' + Math.max(sl.length, 1) + '"><div class="mh-ph"><div class="mh-slides">' + slides + '</div>' +
    '<button type="button" class="mh-pause" data-act="hpause" aria-pressed="false">Jeda foto</button>' +
    '<div class="mh-ov wrap"><p class="kick">Naungan Properti &middot; Jual dan sewa</p><h1>Rumah yang layak ditinggali.</h1></div></div>' +
    '<div class="mh-pw wrap"><form class="mh-panel" data-sub="home" novalidate aria-label="Cari properti"><div class="mh-tabs" role="radiogroup" aria-label="Jenis"><label><input type="radio" name="mode" value="jual" checked><span>Jual</span></label><label><input type="radio" name="mode" value="sewa"><span>Sewa</span></label></div>' +
    '<div class="mh-f"><label class="fld"><span>Tipe</span><select name="tipe"><option value="">Semua tipe</option>' + Object.keys(TIPE).map(function (k) { return '<option value="' + k + '">' + TIPE[k] + "</option>"; }).join("") + "</select></label>" +
    '<label class="fld"><span>Kota</span><select name="kota"><option value="">Semua kota</option>' + kotas.map(function (k) { return "<option>" + esc(k) + "</option>"; }).join("") + "</select></label>" +
    '<label class="fld"><span>Harga maks</span><input name="max" type="text" inputmode="text" placeholder="mis. 1,5m atau 5jt" maxlength="20" autocomplete="off"></label>' +
    '<button class="btn" type="submit">' + ico("search") + 'Cari</button><p class="err wide" id="hs-err" role="alert"></p></div></form>' +
    '<p class="mh-stat"><span><b>' + avail.length + "</b>listing aktif</span><span><b>" + kotas.length + "</b>kota</span><span><b>" + nSurvei + "</b>survei terjadwal</span></p></div></section>" +
    '<section class="wrap mg"><div class="mg-h"><h2>Pilih berdasarkan kota</h2><a href="#/cari">Semua kota</a></div><div class="mos">' + tiles + "</div></section>" +
    '<section class="wrap mg"><div class="mg-h"><h2>Listing pilihan</h2><a href="#/cari">Lihat semua</a></div>' + (feat.length ? edBig(feat[0]) + '<div class="tcs">' + tall + "</div>" : empty("Belum ada listing", "Listing yang tayang akan muncul di sini.")) + "</section>" +
    '<section class="kp"><div class="wrap kp-in"><div><p class="kick">Simulasi KPR</p><h2>Hitung cicilan sebelum bertemu agen.</h2><p>Geser harga, uang muka, tenor, dan bunga. Rumusnya sama dengan simulasi lengkap, dengan cicilan anuitas dan bunga tetap sebagai ilustrasi.</p></div>' +
    '<div class="kp-box" id="hk"><div class="kp-f">' +
    '<label class="rg"><span>Harga <output id="hk-o-h"></output></span><input type="range" name="h" min="300000000" max="5000000000" step="50000000" value="1200000000" data-inp="hkpr"></label>' +
    '<label class="rg"><span>Uang muka <output id="hk-o-d"></output></span><input type="range" name="d" min="10" max="70" step="5" value="20" data-inp="hkpr"></label>' +
    '<label class="rg"><span>Tenor <output id="hk-o-t"></output></span><input type="range" name="t" min="5" max="30" step="5" value="20" data-inp="hkpr"></label>' +
    '<label class="rg"><span>Bunga per tahun <output id="hk-o-b"></output></span><input type="range" name="b" min="3" max="15" step="0.5" value="7.5" data-inp="hkpr"></label></div>' +
    '<div class="kp-out" aria-live="polite"><span>Cicilan per bulan</span><b id="hk-pay"></b><small id="hk-sub"></small><a class="btn" id="hk-go" href="#/kpr">Buka simulasi lengkap</a></div></div></div></section>' +
    '<section class="wrap mg"><div class="mg-h"><h2>Dari cari sampai survei</h2></div><ol class="tlv"><li><b>Cari dan saring</b><span>Pilih jual atau sewa, tipe, kota, harga, kamar, dan fasilitas.</span></li><li><b>Hitung dan bandingkan</b><span>Simulasi KPR di tiap listing, lalu bandingkan sampai tiga properti.</span></li><li><b>Jadwalkan survei</b><span>Pilih tanggal dan jam yang kosong, isi formulir, dan dapat kode tiket.</span></li><li><b>Pantau tiket</b><span>Lihat status permintaan Anda dari baru, dihubungi, survei, sampai negosiasi.</span></li></ol>' +
    '<div class="tik"><div><h2>Sudah punya kode tiket?</h2><p>Cek status permintaan survei atau pertanyaan Anda tanpa perlu masuk akun.</p></div><a class="btn btn-lg" href="#/tiket">Lacak tiket</a></div></section>';
}
function calcHome() {
  var b = $("#hk"); if (!b) return;
  var g = function (n) { return parseFloat(b.querySelector("[name=" + n + "]").value); };
  var h = g("h"), d = g("d"), t = g("t"), r = g("b");
  var a = amort(h * (1 - d / 100), r, t);
  $("#hk-o-h").textContent = rps(h); $("#hk-o-d").textContent = d + "% (" + rps(h * d / 100) + ")"; $("#hk-o-t").textContent = t + " tahun"; $("#hk-o-b").textContent = String(r).replace(".", ",") + "%";
  $("#hk-pay").textContent = rp(Math.round(a.pay));
  $("#hk-sub").textContent = "Pinjaman " + rps(h * (1 - d / 100)) + ", total bunga " + rps(a.totalBunga);
  $("#hk-go").setAttribute("href", "#/kpr?h=" + h + "&dp=" + d + "&t=" + t + "&b=" + r);
}
INP.hkpr = function () { calcHome(); };
ACT.hpause = function (el) { var m = $(".mh"), p = m.classList.toggle("paused"); el.setAttribute("aria-pressed", p); el.textContent = p ? "Putar foto" : "Jeda foto"; };
function uniqKota() {
  var m = {}; S.listings.filter(pub).forEach(function (l) { m[l.kota] = 1; });
  return Object.keys(m).sort();
}
SUB.home = function (f) {
  var g = function (n) { return (f.elements[n] ? f.elements[n].value : "").trim(); };
  var mode = ($("input[name=mode]:checked", f) || {}).value || "jual";
  var mx = g("max"), er = $("#hs-err", f);
  if (mx && isNaN(parsePrice(mx))) { if (er) er.textContent = "Harga tidak terbaca. Contoh: 1,5m atau 800jt."; var mi = f.elements.max; if (mi) { mi.setAttribute("aria-invalid", "true"); mi.focus(); } return; }
  F = readF({ mode: mode, tipe: g("tipe"), kota: g("kota"), max: mx });
  location.hash = fToHash(F);
};

/* ---------- cari ---------- */
function readF(q) {
  return { mode: q.mode === "jual" || q.mode === "sewa" ? q.mode : "", tipe: TIPE[q.tipe] ? q.tipe : "", kota: q.kota || "", q: q.q || "", min: q.min || "", max: q.max || "", kt: q.kt || "", km: q.km || "", luas: q.luas || "", fas: q.fas ? q.fas.split(",").filter(function (x) { return FASMAP[x]; }) : [], urut: q.urut || "baru", semua: q.semua === "1" ? "1" : "", p: Math.max(1, parseInt(q.p, 10) || 1) };
}
function fToHash(f) {
  var a = [];
  ["mode", "tipe", "kota", "q", "min", "max", "kt", "km", "luas"].forEach(function (k) { if (f[k]) a.push(k + "=" + encodeURIComponent(f[k])); });
  if (f.fas.length) a.push("fas=" + f.fas.join(","));
  if (f.urut && f.urut !== "baru") a.push("urut=" + f.urut);
  if (f.semua) a.push("semua=1");
  if (f.p > 1) a.push("p=" + f.p);
  return "#/cari" + (a.length ? "?" + a.join("&") : "");
}
function filtered(f) {
  var min = f.min ? parsePrice(f.min) : NaN, max = f.max ? parsePrice(f.max) : NaN, toks = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  var out = S.listings.filter(function (l) {
    if (!l.tampil) return false;
    if (!f.semua && l.status !== "tersedia" && l.status !== "dipesan") return false;
    if (f.mode && l.mode !== f.mode) return false;
    if (f.tipe && l.tipe !== f.tipe) return false;
    if (f.kota && l.kota !== f.kota) return false;
    if (toks.length) { var hay = (l.judul + " " + l.area + " " + l.kota + " " + l.alamat + " " + l.kode + " " + TIPE[l.tipe]).toLowerCase(); if (!toks.every(function (t) { return hay.indexOf(t) > -1; })) return false; }
    if (!isNaN(min) && l.harga < min) return false;
    if (!isNaN(max) && l.harga > max) return false;
    if (f.kt && l.kt < +f.kt) return false;
    if (f.km && l.km < +f.km) return false;
    if (f.luas && luasUtama(l) < +f.luas) return false;
    if (f.fas.length && !f.fas.every(function (x) { return l.fas.indexOf(x) > -1; })) return false;
    return true;
  });
  var s = { baru: function (a, b) { return b.dibuat < a.dibuat ? -1 : 1; }, murah: function (a, b) { return a.harga - b.harga; }, mahal: function (a, b) { return b.harga - a.harga; }, luas: function (a, b) { return luasUtama(b) - luasUtama(a); }, populer: function (a, b) { return b.dilihat - a.dilihat; } }[f.urut] || null;
  if (s) out.sort(s);
  return out;
}
function activeChips(f) {
  var c = [];
  if (f.mode) c.push(["mode", f.mode === "jual" ? "Dijual" : "Disewa"]);
  if (f.tipe) c.push(["tipe", TIPE[f.tipe]]);
  if (f.kota) c.push(["kota", f.kota]);
  if (f.q) c.push(["q", "“" + f.q + "”"]);
  if (f.min) c.push(["min", "Min " + f.min]);
  if (f.max) c.push(["max", "Maks " + f.max]);
  if (f.kt) c.push(["kt", f.kt + "+ kamar tidur"]);
  if (f.km) c.push(["km", f.km + "+ kamar mandi"]);
  if (f.luas) c.push(["luas", "Luas " + f.luas + " m² ke atas"]);
  f.fas.forEach(function (x) { c.push(["fas:" + x, FASMAP[x]]); });
  if (f.semua) c.push(["semua", "Termasuk yang sudah laku"]);
  return c;
}
function pageSearch(q) {
  F = readF(q);
  var main = $("#main");
  var kotas = uniqKota();
  main.innerHTML = '<div class="wrap search"><div class="page-h"><h1>Cari properti</h1><button type="button" class="btn btn-ghost fbtn" data-act="filters" aria-expanded="false" aria-controls="filters">' + ico("filter") + 'Filter <span id="fcount" class="cnt"></span></button></div>' +
    '<div class="sgrid"><aside id="filters" class="filters" aria-label="Filter pencarian"><form id="ff" data-sub="f" novalidate>' +
    '<fieldset class="seg-f"><legend>Jenis</legend><div class="seg" role="radiogroup"><label><input type="radio" name="mode" value="" data-chg="f"><span>Semua</span></label><label><input type="radio" name="mode" value="jual" data-chg="f"><span>Dijual</span></label><label><input type="radio" name="mode" value="sewa" data-chg="f"><span>Disewa</span></label></div></fieldset>' +
    '<label class="fld"><span>Kata kunci</span><input name="q" type="search" placeholder="Area, nama, kode" maxlength="60" data-chg="f" data-inp="f"></label>' +
    '<label class="fld"><span>Tipe</span><select name="tipe" data-chg="f"><option value="">Semua tipe</option>' + Object.keys(TIPE).map(function (k) { return '<option value="' + k + '">' + TIPE[k] + "</option>"; }).join("") + "</select></label>" +
    '<label class="fld"><span>Kota</span><select name="kota" data-chg="f"><option value="">Semua kota</option>' + kotas.map(function (k) { return "<option>" + esc(k) + "</option>"; }).join("") + "</select></label>" +
    '<div class="two"><label class="fld"><span>Harga min</span><input name="min" inputmode="text" placeholder="500jt" data-chg="f" autocomplete="off"></label><label class="fld"><span>Harga maks</span><input name="max" inputmode="text" placeholder="2m" data-chg="f" autocomplete="off"></label></div>' +
    '<p id="priceerr" class="err" role="alert" hidden></p><p class="hint">Contoh: 500jt, 1,5m, 4,5jt. Untuk sewa, harga per periode.</p>' +
    '<div class="two"><label class="fld"><span>Kamar tidur</span><select name="kt" data-chg="f"><option value="">Semua</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>' +
    '<label class="fld"><span>Kamar mandi</span><select name="km" data-chg="f"><option value="">Semua</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label></div>' +
    '<label class="fld"><span>Luas minimum (m²)</span><input name="luas" type="number" min="0" max="100000" inputmode="numeric" placeholder="mis. 60" data-chg="f"></label><p class="hint">Luas bangunan, atau luas tanah untuk kavling.</p>' +
    '<fieldset class="fas"><legend>Fasilitas</legend>' + FAS.map(function (f) { return '<label class="chk"><input type="checkbox" name="fas" value="' + f[0] + '" data-chg="f"><span>' + f[1] + "</span></label>"; }).join("") + "</fieldset>" +
    '<label class="chk"><input type="checkbox" name="semua" value="1" data-chg="f"><span>Tampilkan yang sudah terjual / disewa</span></label>' +
    '<button type="button" class="btn btn-ghost btn-block" data-act="f-reset">Hapus semua filter</button></form></aside>' +
    '<div id="results" class="results" aria-live="polite"></div></div></div>';
  syncForm();
  renderResults();
}
function syncForm() {
  var f = $("#ff"); if (!f) return;
  $$("input[name=mode]", f).forEach(function (r) { r.checked = r.value === F.mode; });
  f.elements.q.value = F.q; f.elements.tipe.value = F.tipe; f.elements.kota.value = F.kota;
  f.elements.min.value = F.min; f.elements.max.value = F.max; f.elements.kt.value = F.kt; f.elements.km.value = F.km; f.elements.luas.value = F.luas;
  $$("input[name=fas]", f).forEach(function (c) { c.checked = F.fas.indexOf(c.value) > -1; });
  f.elements.semua.checked = !!F.semua;
}
function readFromDom() {
  var f = $("#ff"); if (!f) return;
  var keep = F.urut;
  F = readF({
    mode: ($("input[name=mode]:checked", f) || { value: "" }).value, q: f.elements.q.value.trim(), tipe: f.elements.tipe.value, kota: f.elements.kota.value,
    min: f.elements.min.value.trim(), max: f.elements.max.value.trim(), kt: f.elements.kt.value, km: f.elements.km.value, luas: f.elements.luas.value.trim(),
    fas: $$("input[name=fas]:checked", f).map(function (c) { return c.value; }).join(","), semua: f.elements.semua.checked ? "1" : "", urut: keep
  });
}
function renderResults() {
  var el = $("#results"); if (!el) return;
  var err = [];
  if (F.min && isNaN(parsePrice(F.min))) err.push("Harga minimum tidak dikenali, contoh 500jt.");
  if (F.max && isNaN(parsePrice(F.max))) err.push("Harga maksimum tidak dikenali, contoh 2m.");
  if (F.min && F.max && !isNaN(parsePrice(F.min)) && !isNaN(parsePrice(F.max)) && parsePrice(F.min) > parsePrice(F.max)) err.push("Harga minimum lebih besar dari maksimum.");
  var pe = $("#priceerr"); if (pe) { pe.hidden = !err.length; pe.textContent = err.join(" "); }
  var list = filtered(F), total = list.length, pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (F.p > pages) F.p = pages;
  var slice = list.slice((F.p - 1) * PER_PAGE, F.p * PER_PAGE), chips = activeChips(F);
  var fc = $("#fcount"); if (fc) fc.textContent = chips.length ? chips.length : "";
  var h = '<div class="res-bar"><p class="count"><b>' + total + "</b> properti ditemukan</p><div class=\"res-ctl\"><label class=\"fld inl\"><span>Urutkan</span><select data-chg=\"urut\">" +
    [["baru", "Terbaru"], ["murah", "Harga terendah"], ["mahal", "Harga tertinggi"], ["luas", "Luas terbesar"], ["populer", "Terpopuler"]].map(function (o) { return '<option value="' + o[0] + '"' + (F.urut === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
    '</select></label><div class="vt" role="group" aria-label="Tampilan"><button type="button" data-act="view" data-v="grid" aria-pressed="' + (S.view !== "list") + '">Grid</button><button type="button" data-act="view" data-v="list" aria-pressed="' + (S.view === "list") + '">Daftar</button></div></div></div>';
  if (chips.length) h += '<ul class="chips">' + chips.map(function (c) { return '<li><button type="button" data-act="chip" data-k="' + esc(c[0]) + '" aria-label="Hapus filter ' + esc(c[1]) + '">' + esc(c[1]) + " " + ico("x") + "</button></li>"; }).join("") + "</ul>";
  if (!total) h += empty("Belum ada yang cocok", "Longgarkan filter atau hapus beberapa pilihan.", '<button type="button" class="btn" data-act="f-reset">Hapus semua filter</button>');
  else h += '<div class="' + (S.view === "list" ? "list" : "grid") + '">' + slice.map(card).join("") + "</div>";
  if (pages > 1) {
    h += '<nav class="pager" aria-label="Halaman"><button type="button" class="btn btn-sm btn-ghost" data-act="page" data-p="' + (F.p - 1) + '"' + (F.p <= 1 ? " disabled" : "") + ">" + ico("left") + 'Sebelumnya</button>';
    for (var i = 1; i <= pages; i++) h += '<button type="button" class="pg' + (i === F.p ? " on" : "") + '" data-act="page" data-p="' + i + '"' + (i === F.p ? ' aria-current="page"' : "") + ">" + i + "</button>";
    h += '<button type="button" class="btn btn-sm btn-ghost" data-act="page" data-p="' + (F.p + 1) + '"' + (F.p >= pages ? " disabled" : "") + ">Berikutnya" + ico("right") + "</button></nav>";
  }
  el.innerHTML = h;
  lastSearch = fToHash(F);
  history.replaceState(null, "", lastSearch);
  route = parseHash();
}
var lastSearch = "#/cari";
function applyF() { readFromDom(); F.p = 1; renderResults(); }
CHG.f = function () { applyF(); };
var inpT;
INP.f = function () { clearTimeout(inpT); inpT = setTimeout(applyF, 280); };
SUB.f = function () { applyF(); };
CHG.urut = function (el) { F.urut = el.value; F.p = 1; renderResults(); };
ACT["f-reset"] = function () { F = readF({ urut: F.urut }); syncForm(); renderResults(); };
ACT.chip = function (el) {
  var k = el.getAttribute("data-k");
  if (k.indexOf("fas:") === 0) F.fas = F.fas.filter(function (x) { return x !== k.slice(4); });
  else F[k] = "";
  F.p = 1; syncForm(); renderResults();
};
ACT.page = function (el) { F.p = +el.getAttribute("data-p"); renderResults(); var r = $("#results"); if (r) r.scrollIntoView({ block: "start" }); };
ACT.view = function (el) { S.view = el.getAttribute("data-v"); save(); renderResults(); };
ACT.filters = function (el) {
  rt.filtersOpen = !rt.filtersOpen;
  $("#filters").classList.toggle("open", rt.filtersOpen);
  el.setAttribute("aria-expanded", rt.filtersOpen);
};

/* ---------- favorit & bandingkan ---------- */
ACT.fav = function (el) {
  var id = el.getAttribute("data-id"), i = S.favs.indexOf(id);
  if (i > -1) S.favs.splice(i, 1); else S.favs.push(id);
  save();
  var on = S.favs.indexOf(id) > -1;
  toast(on ? "Disimpan ke favorit" : "Dihapus dari favorit");
  if (route.parts[0] === "favorit") { $("#main").innerHTML = pageFav(); }
  else $$('.fav[data-id="' + id + '"]').forEach(function (b) { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  renderHeader();
};
ACT["fav-clear"] = function (el) { if (!twice(el)) return; S.favs = []; save(); $("#main").innerHTML = pageFav(); renderHeader(); toast("Favorit dikosongkan"); };
ACT.cmp = function (el) {
  var id = el.getAttribute("data-id"), i = S.cmp.indexOf(id);
  if (el.checked) {
    if (S.cmp.length >= 3 && i < 0) { el.checked = false; toast("Maksimal 3 properti. Hapus salah satu dulu."); return; }
    if (i < 0) S.cmp.push(id);
  } else if (i > -1) S.cmp.splice(i, 1);
  save();
  $$('input[data-act="cmp"][data-id="' + id + '"]').forEach(function (c) { c.checked = S.cmp.indexOf(id) > -1; });
  renderHeader(); renderCmpBar();
};
ACT["cmp-rm"] = function (el) { var i = S.cmp.indexOf(el.getAttribute("data-id")); if (i > -1) S.cmp.splice(i, 1); save(); $("#main").innerHTML = pageCompare(); renderHeader(); };
ACT["cmp-clear"] = function () { S.cmp = []; save(); if (route.parts[0] === "bandingkan") $("#main").innerHTML = pageCompare(); else $$('input[data-act="cmp"]').forEach(function (c) { c.checked = false; }); renderHeader(); renderCmpBar(); };
function pageFav() {
  var items = S.favs.map(getL).filter(function (l) { return l && (l.tampil || isAdmin()); });
  var h = '<div class="wrap"><div class="page-h"><h1>Favorit</h1>' + (items.length ? '<button type="button" class="btn btn-sm btn-ghost" data-act="fav-clear">Kosongkan favorit</button>' : "") + "</div>";
  h += items.length ? '<p class="muted">Tersimpan di peramban ini. ' + items.length + ' properti.</p><div class="grid">' + items.map(card).join("") + "</div>" : empty("Belum ada favorit", "Tekan ikon hati pada kartu properti untuk menyimpannya di sini.", '<a class="btn" href="#/cari">Cari properti</a>');
  return h + "</div>";
}
function pageCompare() {
  var items = S.cmp.map(getL).filter(function (l) { return l && l.tampil; });
  if (items.length !== S.cmp.length) { S.cmp = items.map(function (l) { return l.id; }); save(); }
  var h = '<div class="wrap"><div class="page-h"><h1>Bandingkan</h1>' + (items.length ? '<button type="button" class="btn btn-sm btn-ghost" data-act="cmp-clear">Kosongkan</button>' : "") + "</div>";
  if (items.length < 2) {
    return h + empty(items.length ? "Pilih satu lagi" : "Belum ada yang dibandingkan", "Centang \"Bandingkan\" pada kartu properti. Anda bisa memilih sampai 3.", '<a class="btn" href="#/cari">Pilih properti</a>') + (items.length ? '<div class="grid">' + items.map(card).join("") + "</div>" : "") + "</div>";
  }
  var sameMode = items.every(function (l) { return l.mode === items[0].mode; });
  function best(vals, hi) { var f = vals.filter(function (v) { return v > 0; }); if (f.length < 2) return -1; var t = hi ? Math.max.apply(null, f) : Math.min.apply(null, f); if (f.every(function (v) { return v === t; })) return -1; return vals.indexOf(t); }
  function row(label, fn, bi) { return "<tr><th scope=\"row\">" + label + "</th>" + items.map(function (l, i) { return '<td' + (bi === i ? ' class="best"' : "") + ">" + fn(l) + "</td>"; }).join("") + "</tr>"; }
  var n = function (v, u) { return v ? v + (u || "") : "-"; };
  h += '<div class="cmp-wrap"><table class="cmp-t"><caption class="sr">Perbandingan properti</caption><thead><tr><td></td>' + items.map(function (l) {
    return '<th scope="col"><a href="#/properti/' + l.id + '"><img src="img/' + photo(l.foto[0]).k + '.jpg" alt="' + esc(photo(l.foto[0]).alt) + '" width="200" height="150"><span>' + esc(l.judul) + '</span></a><button type="button" class="btn btn-sm btn-ghost" data-act="cmp-rm" data-id="' + l.id + '">Hapus</button></th>';
  }).join("") + "</tr></thead><tbody>" +
    row("Harga", function (l) { return "<b>" + price(l) + "</b>"; }, sameMode ? best(items.map(function (l) { return l.harga; }), false) : -1) +
    row("Jenis", function (l) { return (l.mode === "jual" ? "Dijual" : "Disewa") + ", " + TIPE[l.tipe]; }) +
    row("Lokasi", function (l) { return esc(l.area) + ", " + esc(l.kota); }) +
    row("Kamar tidur", function (l) { return n(l.kt); }, best(items.map(function (l) { return l.kt; }), true)) +
    row("Kamar mandi", function (l) { return n(l.km); }, best(items.map(function (l) { return l.km; }), true)) +
    row("Luas bangunan", function (l) { return n(l.lb, " m²"); }, best(items.map(function (l) { return l.lb; }), true)) +
    row("Luas tanah", function (l) { return n(l.lt, " m²"); }, best(items.map(function (l) { return l.lt; }), true)) +
    row("Sertifikat", function (l) { return esc(l.sertifikat || "-"); }) +
    row("Tahun", function (l) { return n(l.tahun); }) +
    row("Cicilan KPR / bln", function (l) { return l.mode === "jual" ? rps(Math.round(cicil(l.harga, 20, 7.5, 20))) + "<small>DP 20%, 7,5%, 20 th</small>" : "-"; }, sameMode && items[0].mode === "jual" ? best(items.map(function (l) { return cicil(l.harga, 20, 7.5, 20); }), false) : -1) +
    row("Fasilitas", function (l) { return l.fas.length ? l.fas.map(function (x) { return FASMAP[x]; }).join(", ") : "-"; }) +
    row("Status", function (l) { return STATUS_LST[l.status]; }) +
    "</tbody></table></div><p class=\"hint\">Sel bertanda hijau adalah nilai terbaik pada baris itu (harga terendah, ruang terbesar).</p></div>";
  return h;
}

/* ---------- detail ---------- */
function pageDetail(id) {
  var main = $("#main"), l = getL(id);
  if (!l || (!l.tampil && !isAdmin())) { main.innerHTML = '<div class="wrap">' + empty("Properti tidak tersedia", "Listing ini sudah dihapus atau tidak ditayangkan.", '<a class="btn" href="#/cari">Cari properti lain</a>') + "</div>"; return "Tidak tersedia"; }
  try { if (!sessionStorage.getItem("np.v." + id)) { sessionStorage.setItem("np.v." + id, "1"); l.dilihat++; save(); } } catch (e) { /* abaikan */ }
  rt.amorAll = false;
  var fav = S.favs.indexOf(id) > -1, cm = S.cmp.indexOf(id) > -1, ag = AGEN[l.agen] || AGEN[0];
  var specs = [["Tipe", TIPE[l.tipe]], l.kt ? ["Kamar tidur", l.kt] : null, l.km ? ["Kamar mandi", l.km] : null, l.lb ? ["Luas bangunan", l.lb + " m²"] : null, l.lt ? ["Luas tanah", l.lt + " m²"] : null,
    l.lantai > 1 || l.tipe === "apartemen" ? [l.tipe === "apartemen" ? "Lantai unit" : "Jumlah lantai", l.lantai] : null, l.garasi ? ["Garasi / carport", l.garasi + " mobil"] : null, l.sertifikat ? ["Sertifikat", l.sertifikat] : null, l.tahun ? ["Tahun bangun", l.tahun] : null, l.listrik ? ["Listrik", dot(l.listrik) + " VA"] : null, ["Kode", l.kode]].filter(Boolean);
  var similar = S.listings.filter(function (x) { return x.id !== id && x.tampil && x.status === "tersedia" && x.mode === l.mode && (x.tipe === l.tipe || x.kota === l.kota); }).slice(0, 3);
  var im = photo(l.foto[0]);
  main.innerHTML = '<div class="wrap detail">' +
    (!l.tampil ? '<p class="note">Pratinjau admin: listing ini disembunyikan dari pengunjung.</p>' : "") +
    '<p class="crumb"><a href="' + esc(lastSearch) + '">' + ico("left") + "Kembali ke hasil pencarian</a></p>" +
    '<div class="dgrid"><div class="dmain">' +
    '<div class="gal" id="gal" data-id="' + l.id + '" data-i="0"><button type="button" class="gal-main" data-act="lb" aria-label="Perbesar foto"><img id="galimg" src="img/' + im.k + '.jpg" alt="' + esc(im.alt) + '" width="1000" height="625">' + badges(l) + '<span class="gal-n" id="galn">1 / ' + l.foto.length + "</span></button>" +
    '<div class="thumbs">' + l.foto.map(function (k, i) { var p = photo(k); return '<button type="button" data-act="gal" data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : "") + ' aria-label="Foto ' + (i + 1) + '"><img src="img/' + p.k + '.jpg" alt="" loading="lazy" width="120" height="90"></button>'; }).join("") + "</div></div>" +
    '<div class="dhead"><h1>' + esc(l.judul) + '</h1><p class="loc">' + ico("pin") + esc(l.alamat) + " · " + esc(l.area) + ", " + esc(l.kota) + '</p><p class="dprice">' + price(l) + (l.mode === "jual" ? "<small>" + rp(l.harga) + "</small>" : "<small>" + rp(l.harga) + " per " + l.satuan + "</small>") + "</p>" +
    '<div class="dact no-print"><button type="button" class="btn btn-ghost fav-b' + (fav ? " on" : "") + '" data-act="fav" data-id="' + l.id + '" aria-pressed="' + fav + '">' + ico("heart") + "Favorit</button>" +
    '<label class="btn btn-ghost cmp-b"><input type="checkbox" data-act="cmp" data-id="' + l.id + '"' + (cm ? " checked" : "") + "> Bandingkan</label>" +
    '<button type="button" class="btn btn-ghost" data-act="copy-link">' + ico("link") + "Salin tautan</button>" +
    '<button type="button" class="btn btn-ghost" data-act="print">' + ico("print") + "Cetak brosur</button></div></div>" +
    '<section class="box"><h2>Spesifikasi</h2><dl class="spec">' + specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl></section>" +
    '<section class="box"><h2>Deskripsi</h2><p class="desc">' + esc(l.deskripsi) + "</p></section>" +
    (l.fas.length ? '<section class="box"><h2>Fasilitas</h2><ul class="fas-l">' + l.fas.map(function (x) { return "<li>" + ico("check") + FASMAP[x] + "</li>"; }).join("") + "</ul></section>" : "") +
    '<section class="box no-print-x" id="kprbox"><h2>' + (l.mode === "jual" ? "Kalkulator KPR" : "Simulasi biaya sewa") + "</h2>" + (l.mode === "jual" ? kprBlock(l.harga, l.tipe === "tanah") : rentBlock(l)) + "</section>" +
    '</div><aside class="dside no-print">' + sideForm(l, ag) + "</aside></div>" +
    (similar.length ? '<section class="sec"><h2>Properti serupa</h2><div class="grid">' + similar.map(card).join("") + "</div></section>" : "") + "</div>";
  if (l.mode === "jual") calcKpr(); else calcRent();
  return l.judul;
}
ACT.gal = function (el) {
  var g = $("#gal"), l = getL(g.getAttribute("data-id")), i = +el.getAttribute("data-i"), p = photo(l.foto[i]);
  g.setAttribute("data-i", i); var im = $("#galimg"); im.src = "img/" + p.k + ".jpg"; im.alt = p.alt; $("#galn").textContent = (i + 1) + " / " + l.foto.length;
  $$(".thumbs button", g).forEach(function (b, j) { if (j === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
};
ACT["copy-link"] = function () {
  var u = location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { toast("Tautan disalin"); }, function () { toast("Gagal menyalin. Salin dari bilah alamat."); });
  else toast("Salin tautan dari bilah alamat peramban.");
};
ACT.print = function () { window.print(); };
ACT.copy = function (el) {
  var v = el.getAttribute("data-v");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { toast("Disalin: " + v); }, function () { toast("Catat kode: " + v); });
  else toast("Catat kode: " + v);
};

/* lightbox */
function lbDraw() {
  var l = getL(rt.lbId); if (!l) return;
  var n = l.foto.length, p = photo(l.foto[rt.lbI]);
  $("#lb").innerHTML = '<div class="lb-in"><button type="button" class="lb-x" data-act="lb-close" aria-label="Tutup galeri">' + ico("x") + "</button>" +
    (n > 1 ? '<button type="button" class="lb-n lb-p" data-act="lb-prev" aria-label="Foto sebelumnya">' + ico("left") + '</button><button type="button" class="lb-n lb-nx" data-act="lb-next" aria-label="Foto berikutnya">' + ico("right") + "</button>" : "") +
    '<figure><img src="img/' + p.k + '.jpg" alt="' + esc(p.alt) + '"><figcaption>' + esc(p.alt) + " (" + (rt.lbI + 1) + " dari " + n + ")</figcaption></figure></div>";
}
ACT.lb = function () {
  var g = $("#gal"); rt.lbId = g.getAttribute("data-id"); rt.lbI = +g.getAttribute("data-i"); lbDraw();
  var d = $("#lb"); if (!d.open) d.showModal(); $(".lb-x", d).focus();
};
ACT["lb-close"] = function () { $("#lb").close(); };
function lbMove(dx) { var l = getL(rt.lbId); if (!l) return; rt.lbI = (rt.lbI + dx + l.foto.length) % l.foto.length; lbDraw(); var d = $("#lb"); var b = $(dx > 0 ? ".lb-nx" : ".lb-p", d) || $(".lb-x", d); b.focus(); }
ACT["lb-prev"] = function () { lbMove(-1); };
ACT["lb-next"] = function () { lbMove(1); };

/* KPR */
function kprBlock(harga, tanah, d) {
  d = d || {};
  return '<div class="kpr" data-harga="' + harga + '"><div class="kpr-f"><label class="fld"><span>Harga properti (Rp)</span><input name="harga" inputmode="text" value="' + dot(harga) + '" data-inp="kpr" autocomplete="off"></label>' +
    '<label class="fld"><span>Uang muka (%)</span><input name="dp" type="number" min="0" max="90" step="1" value="' + (d.dp == null ? 20 : d.dp) + '" data-inp="kpr"></label>' +
    '<label class="fld"><span>Bunga per tahun (%)</span><input name="bunga" type="number" min="0" max="30" step="0.1" value="' + (d.b == null ? 7.5 : d.b) + '" data-inp="kpr"></label>' +
    '<label class="fld"><span>Tenor (tahun)</span><select name="tenor" data-inp="kpr" data-chg="kpr">' + [5, 10, 15, 20, 25, 30].map(function (t) { return '<option value="' + t + '"' + (t === (d.t || 20) ? " selected" : "") + ">" + t + " tahun</option>"; }).join("") + "</select></label></div>" +
    '<p class="kpr-err err" role="alert" hidden></p><div class="kpr-out" aria-live="polite"></div>' +
    '<p class="hint">Ilustrasi dengan bunga tetap sepanjang tenor dan cicilan anuitas. Bunga dan syarat bank yang sebenarnya bisa berbeda' + (tanah ? ", dan pembiayaan kavling tidak selalu lewat KPR" : "") + ".</p></div>";
}
function calcKpr() {
  var k = $(".kpr"); if (!k) return;
  var g = function (n) { return k.querySelector("[name=" + n + "]").value; };
  var P = parsePrice(g("harga")), dp = parseFloat(String(g("dp")).replace(",", ".")), b = parseFloat(String(g("bunga")).replace(",", ".")), t = parseInt(g("tenor"), 10);
  var err = k.querySelector(".kpr-err"), out = k.querySelector(".kpr-out"), msg = "";
  if (isNaN(P) || P < 1e6) msg = "Isi harga properti, contoh 1,2m atau 1200000000.";
  else if (isNaN(dp) || dp < 0 || dp > 90) msg = "Uang muka harus antara 0 dan 90 persen.";
  else if (isNaN(b) || b < 0 || b > 30) msg = "Bunga harus antara 0 dan 30 persen.";
  else if (isNaN(t) || t < 1 || t > 30) msg = "Tenor 1 sampai 30 tahun.";
  err.hidden = !msg; err.textContent = msg;
  if (msg) { out.innerHTML = ""; return; }
  var pinj = P * (1 - dp / 100), a = amort(pinj, b, t), show = rt.amorAll ? a.rows : a.rows.slice(0, 5);
  out.innerHTML = '<div class="kpr-res"><div class="big"><span>Cicilan per bulan</span><b id="kpr-pay">' + rp(Math.round(a.pay)) + '</b></div><dl><div><dt>Uang muka</dt><dd>' + rp(Math.round(P * dp / 100)) + "</dd></div><div><dt>Pinjaman pokok</dt><dd>" + rp(Math.round(pinj)) + "</dd></div><div><dt>Total bunga</dt><dd>" + rp(Math.round(a.totalBunga)) + "</dd></div><div><dt>Total dibayar</dt><dd>" + rp(Math.round(pinj + a.totalBunga + P * dp / 100)) + "</dd></div></dl></div>" +
    '<h3 class="amh">Tabel amortisasi per tahun</h3><div class="tw"><table class="tbl"><thead><tr><th scope="col">Tahun</th><th scope="col">Cicilan</th><th scope="col">Pokok</th><th scope="col">Bunga</th><th scope="col">Sisa</th></tr></thead><tbody>' +
    show.map(function (r) { return "<tr><td>" + r.y + "</td><td>" + short(r.pay) + "</td><td>" + short(r.pokok) + "</td><td>" + short(r.bunga) + "</td><td>" + short(r.sisa) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
    (a.rows.length > 5 ? '<button type="button" class="btn btn-sm btn-ghost" data-act="amor">' + (rt.amorAll ? "Ringkas tabel" : "Tampilkan semua " + a.rows.length + " tahun") + "</button>" : "");
}
INP.kpr = function () { calcKpr(); };
CHG.kpr = function () { calcKpr(); };
ACT.amor = function () { rt.amorAll = !rt.amorAll; calcKpr(); };
function rentBlock(l) {
  var opts = l.satuan === "bulan" ? [6, 12, 24, 36] : [1, 2, 3];
  return '<div class="kpr rent" data-id="' + l.id + '"><div class="kpr-f"><label class="fld"><span>Lama sewa (' + l.satuan + ')</span><select name="lama" data-chg="rent">' + opts.map(function (o) { return '<option value="' + o + '"' + (o === opts[1 > opts.length - 1 ? 0 : (l.satuan === "bulan" ? 1 : 0)] ? " selected" : "") + ">" + o + " " + l.satuan + "</option>"; }).join("") + "</select></label>" +
    '<label class="fld"><span>Deposit (setara bulan sewa)</span><select name="dep" data-chg="rent"><option value="0">Tanpa deposit</option><option value="1">1 bulan</option><option value="2" selected>2 bulan</option><option value="3">3 bulan</option></select></label></div><div class="kpr-out" aria-live="polite"></div>' +
    '<p class="hint">Ilustrasi biaya. Deposit dan syarat sewa yang berlaku mengikuti kesepakatan dengan pemilik.</p></div>';
}
function calcRent() {
  var k = $(".rent"); if (!k) return;
  var l = getL(k.getAttribute("data-id")), lama = +k.querySelector("[name=lama]").value, dep = +k.querySelector("[name=dep]").value;
  var bln = l.satuan === "bulan" ? l.harga : l.harga / 12, total = l.harga * lama, depo = bln * dep, muka = l.harga + depo;
  var months = l.satuan === "bulan" ? lama : lama * 12;
  k.querySelector(".kpr-out").innerHTML = '<div class="kpr-res"><div class="big"><span>Dibayar di muka</span><b>' + rp(Math.round(muka)) + '</b></div><dl><div><dt>Sewa periode pertama</dt><dd>' + rp(l.harga) + "</dd></div><div><dt>Deposit</dt><dd>" + rp(Math.round(depo)) + "</dd></div><div><dt>Total sewa " + lama + " " + l.satuan + "</dt><dd>" + rp(Math.round(total)) + "</dd></div><div><dt>Rata-rata per bulan</dt><dd>" + rp(Math.round(total / months)) + "</dd></div></dl></div>";
}
CHG.rent = function () { calcRent(); };

function pageKpr() {
  rt.amorAll = false;
  var q = route.q, kh = +q.h >= 1e6 && +q.h <= 1e11 ? Math.round(+q.h) : 1500000000;
  var kd = { dp: +q.dp >= 0 && +q.dp <= 90 && q.dp !== "" && q.dp != null ? +q.dp : 20, b: +q.b >= 0 && +q.b <= 30 && q.b ? +q.b : 7.5, t: [5, 10, 15, 20, 25, 30].indexOf(+q.t) > -1 ? +q.t : 20 };
  return '<div class="wrap narrow"><div class="page-h"><h1>Simulasi KPR</h1></div><p class="muted">Hitung cicilan untuk harga berapa pun. Buka salah satu listing untuk memakai harganya langsung.</p><section class="box">' + kprBlock(kh, false, kd) + "</section></div>";
}

/* ---------- formulir tanya / survei ---------- */
function sideForm(l, ag) {
  var h = '<div class="agent"><span class="av" aria-hidden="true">' + esc(ag.n.split(" ").map(function (x) { return x[0]; }).slice(0, 2).join("")) + "</span><div><b>" + esc(ag.n) + "</b><small>Agen · " + ag.hp + '</small></div><a class="btn btn-sm btn-ghost" href="' + waLink(l.agen, "Halo, saya tertarik dengan " + l.judul + " (" + l.kode + ").") + '" target="_blank" rel="noopener">' + ico("phone") + "WhatsApp</a></div>";
  if (l.status === "terjual" || l.status === "disewa") return h + '<div class="box off"><h2>Sudah ' + (l.status === "terjual" ? "terjual" : "disewa") + '</h2><p>Properti ini tidak bisa disurvei lagi. Lihat properti serupa di bawah atau cari yang lain.</p><a class="btn btn-block" href="#/cari?tipe=' + l.tipe + "&mode=" + l.mode + '">Cari ' + TIPE[l.tipe].toLowerCase() + " lain</a></div>";
  return h + '<div class="box" id="lead-box"><h2>Hubungi agen</h2>' + (l.status === "dipesan" ? '<p class="note">Properti ini sedang dipesan. Anda tetap bisa bertanya atau masuk daftar tunggu.</p>' : "") + leadForm(l) + "</div>";
}
function leadForm(l) {
  var dates = surveyDates();
  return '<form id="lead-f" data-sub="lead" data-id="' + l.id + '" novalidate><div class="seg seg-2" role="radiogroup" aria-label="Keperluan"><label><input type="radio" name="jenis" value="tanya" checked data-chg="jenis"><span>Tanya agen</span></label><label><input type="radio" name="jenis" value="survei" data-chg="jenis"><span>Jadwalkan survei</span></label></div>' +
    '<label class="fld"><span>Nama lengkap</span><input name="nama" maxlength="60" autocomplete="name" aria-describedby="e-nama"><em class="err" id="e-nama"></em></label>' +
    '<label class="fld"><span>Nomor WhatsApp</span><input name="hp" inputmode="tel" placeholder="0812-0000-1234" maxlength="20" autocomplete="tel" aria-describedby="e-hp"><em class="err" id="e-hp"></em></label>' +
    '<label class="fld"><span>Email <i>(opsional)</i></span><input name="email" type="email" maxlength="80" autocomplete="email" aria-describedby="e-email"><em class="err" id="e-email"></em></label>' +
    '<div id="srv" hidden><label class="fld"><span>Tanggal survei</span><select name="tgl" data-chg="tgl" aria-describedby="e-tgl"><option value="">Pilih tanggal</option>' + dates.map(function (d) { return '<option value="' + d + '">' + fmtTgl(d) + "</option>"; }).join("") + '</select><em class="err" id="e-tgl"></em></label>' +
    '<fieldset class="jam"><legend>Jam</legend><div id="jam" class="chipsel"><p class="hint">Pilih tanggal dulu.</p></div><em class="err" id="e-jam"></em></fieldset><p class="hint">Survei Senin sampai Sabtu, maksimal dua survei per jam.</p></div>' +
    '<label class="fld"><span id="lbl-pesan">Pertanyaan Anda</span><textarea name="pesan" rows="3" maxlength="500" aria-describedby="e-pesan" placeholder="Tulis pertanyaan singkat"></textarea><em class="err" id="e-pesan"></em></label>' +
    '<button class="btn btn-block" type="submit" id="lead-btn">Kirim pertanyaan</button></form>';
}
function drawJam(f) {
  var l = getL(f.getAttribute("data-id")), cur = ($("input[name=jam]:checked", f) || {}).value;
  $("#jam", f).innerHTML = jamChipsHtml(f.elements.tgl.value, l.id, cur, "");
}
CHG.jenis = function (el) {
  var f = el.form, sv = f.elements.jenis.value === "survei";
  $("#srv", f).hidden = !sv;
  $("#lbl-pesan").textContent = sv ? "Catatan untuk agen (opsional)" : "Pertanyaan Anda";
  $("#lead-btn").textContent = sv ? "Jadwalkan survei" : "Kirim pertanyaan";
};
CHG.tgl = function (el) { drawJam(el.form); };
function fieldErr(f, name, msg) { var e = $("#e-" + name, f); if (e) e.textContent = msg || ""; var i = f.elements[name]; if (i && i.setAttribute) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); } }
function validateLead(f, l) {
  var g = function (n) { return (f.elements[n].value || "").trim(); };
  var sv = f.elements.jenis.value === "survei", er = {};
  var hp = g("hp").replace(/\D/g, "");
  if (g("nama").length < 3) er.nama = "Isi nama lengkap, minimal 3 huruf.";
  if (!/^(08|628)\d{8,11}$/.test(hp)) er.hp = "Nomor WhatsApp tidak valid. Contoh 0812-0000-1234.";
  if (g("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g("email"))) er.email = "Format email tidak valid.";
  if (!sv && g("pesan").length < 10) er.pesan = "Tulis pertanyaan minimal 10 karakter.";
  if (sv) {
    var tgl = g("tgl"), jam = ($("input[name=jam]:checked", f) || {}).value || "";
    if (!tgl) er.tgl = "Pilih tanggal survei.";
    else if (surveyDates().indexOf(tgl) < 0) er.tgl = "Tanggal tidak tersedia. Survei Senin sampai Sabtu, mulai besok.";
    if (!jam) er.jam = "Pilih jam survei.";
    else if (tgl && slotState(tgl, jam, l.id) !== "ok") er.jam = "Jam itu sudah terisi. Pilih jam lain.";
    else if (tgl && hp) { var dup = slotLeads(tgl, jam).filter(function (x) { return x.hp.replace(/\D/g, "") === hp; })[0]; if (dup) er.jam = "Anda sudah punya survei di jam itu (" + dup.kode + ")."; }
  }
  return er;
}
SUB.lead = function (f) {
  var l = getL(f.getAttribute("data-id"));
  if (!l || l.status === "terjual" || l.status === "disewa") { toast("Listing ini sudah tidak menerima permintaan."); return; }
  var er = validateLead(f, l);
  ["nama", "hp", "email", "tgl", "jam", "pesan"].forEach(function (n) { fieldErr(f, n, er[n]); });
  var first = Object.keys(er)[0];
  if (first) { var t = f.elements[first] || $("#jam input:not([disabled])", f) || $("#jam", f); if (t && t.focus) t.focus(); toast("Periksa isian yang bertanda merah."); return; }
  var sv = f.elements.jenis.value === "survei", g = function (n) { return f.elements[n].value.trim(); };
  var lead = { kode: nextKode(), listingId: l.id, listingJudul: l.judul, nama: g("nama"), hp: g("hp"), email: g("email"), jenis: sv ? "survei" : "tanya", tgl: sv ? g("tgl") : "", jam: sv ? ($("input[name=jam]:checked", f) || {}).value : "", pesan: g("pesan"), status: "baru", dibuat: new Date().toISOString(), riwayat: [{ t: new Date().toISOString(), s: "baru" }], catatan: [] };
  S.leads.push(lead); S.mine.push(lead.kode); save();
  $("#lead-box").innerHTML = '<div class="ok" role="status"><h2>' + (sv ? "Survei terjadwal" : "Pertanyaan terkirim") + '</h2><p>Kode tiket Anda</p><p class="code">' + lead.kode + "</p>" +
    (sv ? "<p>" + fmtTgl(lead.tgl) + ", pukul " + lead.jam + ". Agen akan mengonfirmasi lewat WhatsApp.</p>" : "<p>Agen akan membalas lewat WhatsApp ke " + esc(lead.hp) + ".</p>") +
    '<div class="row"><a class="btn" href="#/tiket/' + lead.kode + '">Lihat status</a><button type="button" class="btn btn-ghost" data-act="copy" data-v="' + lead.kode + '">Salin kode</button></div></div>';
  toast("Tiket " + lead.kode + " dibuat");
  renderHeader();
};

/* ---------- lacak tiket ---------- */
function stageBar(lead) {
  var order = ["baru", "dihubungi", "survei", "negosiasi", "deal"], reached = lead.riwayat.map(function (r) { return r.s; });
  if (lead.status === "batal") return '<p class="note bad">Tiket ini dibatalkan.</p>';
  var idx = order.indexOf(lead.status);
  return '<ol class="stages">' + order.map(function (s, i) { return '<li class="' + (i < idx ? "done" : i === idx ? "cur" : "") + '"' + (i === idx ? ' aria-current="step"' : "") + "><span>" + (i < idx ? ico("check") : i + 1) + "</span>" + STAGEMAP[s] + "</li>"; }).join("") + "</ol>";
}
function pageTicket(kode) {
  var h = '<div class="wrap narrow"><div class="page-h"><h1>Lacak tiket</h1></div>';
  var lead = kode ? S.leads.filter(function (x) { return x.kode === kode.toUpperCase(); })[0] : null;
  if (kode && lead && (S.mine.indexOf(lead.kode) > -1 || rt.verified[lead.kode])) {
    var l = getL(lead.listingId), ag = AGEN[(l && l.agen) || 0];
    h += '<section class="box tk"><div class="tk-h"><div><p class="muted">Kode tiket</p><p class="code">' + lead.kode + '</p></div><span class="st st-' + lead.status + '">' + STAGEMAP[lead.status] + "</span></div>" + stageBar(lead) +
      '<dl class="spec"><div><dt>Properti</dt><dd>' + (l ? '<a href="#/properti/' + l.id + '">' + esc(l.judul) + "</a>" : esc(lead.listingJudul) + " (sudah dihapus)") + "</dd></div><div><dt>Keperluan</dt><dd>" + (lead.jenis === "survei" ? "Survei lokasi" : "Pertanyaan") + "</dd></div>" +
      (lead.jenis === "survei" ? "<div><dt>Jadwal</dt><dd>" + fmtTgl(lead.tgl) + ", " + lead.jam + "</dd></div>" : "") + "<div><dt>Atas nama</dt><dd>" + esc(lead.nama) + "</dd></div>" + (lead.pesan ? "<div><dt>Pesan</dt><dd>" + esc(lead.pesan) + "</dd></div>" : "") + "</dl>" +
      '<h2>Riwayat</h2><ol class="tl">' + lead.riwayat.slice().reverse().map(function (r) { return "<li><b>" + STAGEMAP[r.s] + "</b><span>" + fmtDT(r.t) + "</span></li>"; }).join("") + "</ol>" +
      '<div class="row no-print"><a class="btn btn-ghost" href="' + waLink(l ? l.agen : 0, "Halo, saya menanyakan tiket " + lead.kode + ".") + '" target="_blank" rel="noopener">' + ico("phone") + "Chat agen (" + esc(ag.n.split(" ")[0]) + ")</a>" +
      '<button type="button" class="btn btn-ghost" data-act="print">' + ico("print") + "Cetak</button>" +
      (lead.status !== "deal" && lead.status !== "batal" ? '<button type="button" class="btn btn-ghost danger" data-act="tk-cancel" data-k="' + lead.kode + '">Batalkan tiket</button>' : "") + "</div></section></div>";
    return h;
  }
  if (kode) h += '<p class="note bad" role="alert">Tiket tidak ditemukan, atau belum diverifikasi. Isi kode dan 4 digit terakhir nomor WhatsApp.</p>';
  h += '<section class="box"><form id="tk-f" data-sub="tiket" novalidate><label class="fld"><span>Kode tiket</span><input name="kode" placeholder="TKT-1001" maxlength="12" autocomplete="off" aria-describedby="e-kode"><em class="err" id="e-kode"></em></label>' +
    '<label class="fld"><span>4 digit terakhir nomor WhatsApp</span><input name="hp4" inputmode="numeric" maxlength="4" placeholder="0201" autocomplete="off" aria-describedby="e-hp4"><em class="err" id="e-hp4"></em></label><button class="btn" type="submit">Cari tiket</button></form>' +
    '<p class="hint">Untuk demo: coba TKT-1001 dengan 4 digit 0201.</p></section>';
  var mine = S.mine.map(function (k) { return S.leads.filter(function (x) { return x.kode === k; })[0]; }).filter(Boolean);
  if (mine.length) h += '<section class="box"><h2>Tiket di perangkat ini</h2><ul class="mine">' + mine.slice().reverse().map(function (x) { return '<li><a href="#/tiket/' + x.kode + '"><b>' + x.kode + "</b><span>" + esc(x.listingJudul) + '</span></a><span class="st st-' + x.status + '">' + STAGEMAP[x.status] + "</span></li>"; }).join("") + "</ul></section>";
  return h + "</div>";
}
SUB.tiket = function (f) {
  var k = f.elements.kode.value.trim().toUpperCase(), h4 = f.elements.hp4.value.replace(/\D/g, "");
  fieldErr(f, "kode", k ? "" : "Isi kode tiket."); fieldErr(f, "hp4", h4.length === 4 ? "" : "Isi 4 digit terakhir nomor WhatsApp.");
  if (!k || h4.length !== 4) return;
  var lead = S.leads.filter(function (x) { return x.kode === k && x.hp.replace(/\D/g, "").slice(-4) === h4; })[0];
  if (!lead) { fieldErr(f, "kode", "Kode atau nomor tidak cocok."); return; }
  rt.verified[lead.kode] = true;
  if (location.hash === "#/tiket/" + lead.kode) render(true); else location.hash = "#/tiket/" + lead.kode;
};
ACT["tk-cancel"] = function (el) {
  if (!twice(el)) return;
  var lead = S.leads.filter(function (x) { return x.kode === el.getAttribute("data-k"); })[0]; if (!lead) return;
  setLeadStatus(lead, "batal"); save(); render(true); toast("Tiket dibatalkan");
};

/* ---------- umum ---------- */
ACT.menu = function () { rt.menu = !rt.menu; renderHeader(); var b = $(".burger"); if (b) b.focus(); };
ACT.reset = function (el) {
  if (!twice(el)) return;
  try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch (e) { /* abaikan */ }
  S = makeSeed(); save(); rt.verified = {}; toast("Data demo dikembalikan ke awal");
  if (route.parts[0] === "admin" || route.parts[0] === "properti" || route.parts[0] === "tiket") location.hash = "#/"; else render(true);
};

function closeSheet() { var d = $("#sheet"); if (d && d.open) d.close(); }

document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-act]");
  if (el) {
    if (el.tagName === "INPUT") return;
    var f = ACT[el.getAttribute("data-act")];
    if (f) { f(el, e); return; }
  }
  if (rt.menu && !e.target.closest("#nav")) { rt.menu = false; renderHeader(); }
  if (e.target.id === "lb") $("#lb").close();
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (t.matches && t.matches('input[data-act="cmp"]')) { ACT.cmp(t, e); return; }
  var a = t.getAttribute && t.getAttribute("data-act");
  if (a && t.tagName === "INPUT" && t.type === "checkbox" && ACT[a]) { ACT[a](t, e); return; }
  var c = t.getAttribute && t.getAttribute("data-chg");
  if (c && CHG[c]) CHG[c](t, e);
});
document.addEventListener("input", function (e) {
  var c = e.target.getAttribute && e.target.getAttribute("data-inp");
  if (c && INP[c]) INP[c](e.target, e);
});
document.addEventListener("submit", function (e) {
  var f = e.target.closest("form[data-sub]");
  if (f && SUB[f.getAttribute("data-sub")]) { e.preventDefault(); SUB[f.getAttribute("data-sub")](f); }
});
document.addEventListener("keydown", function (e) {
  var lb = $("#lb");
  if (lb && lb.open) { if (e.key === "ArrowLeft") { e.preventDefault(); lbMove(-1); } else if (e.key === "ArrowRight") { e.preventDefault(); lbMove(1); } }
  else if (e.key === "Escape" && rt.menu) { rt.menu = false; renderHeader(); }
});
(function () {
  var x0 = null;
  document.addEventListener("touchstart", function (e) { if (e.target.closest && e.target.closest("#lb figure")) x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) lbMove(dx < 0 ? 1 : -1); }, { passive: true });
})();

function boot() {
  S = load();
  window.addEventListener("hashchange", function () { render(); });
  window.addEventListener("error", function (e) { window.__errors = (window.__errors || []).concat(String(e.message)); });
  render();
}
