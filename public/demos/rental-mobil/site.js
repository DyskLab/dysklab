/* Laju Rental: sisi pelanggan, router, utilitas UI */
"use strict";
const ACTS = {}, CHG = {}, FORMS = {};
const ic = p => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
const IC = {
  user: ic('<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
  bag: ic('<path d="M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0"/>'),
  fuel: ic('<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h10M14 10h2a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V8l-3-3"/>'),
  cal: ic('<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>'),
  check: ic('<path d="M5 12l5 5 9-10"/>'),
  x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
  key: ic('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>'),
  car: ic('<path d="M3 16v-4l2-5h14l2 5v4M3 16h18M3 16v2h3v-2M18 16v2h3v-2"/><circle cx="7.5" cy="13" r=".6"/><circle cx="16.5" cy="13" r=".6"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>')
};
const logo = () => '<span class="logo" aria-hidden="true">' + IC.car + "</span>";

/* ---------- sesi, toast, sheet ---------- */
const ss = () => { try { return JSON.parse(sessionStorage.getItem(SKEY) || "{}"); } catch (e) { return {}; } };
const ssSet = o => { try { sessionStorage.setItem(SKEY, JSON.stringify(Object.assign(ss(), o))); } catch (e) { /* abaikan */ } };
let _tt; function toast(m, bad) { const t = $("#toast"); t.textContent = m; t.className = "show" + (bad ? " bad" : ""); clearTimeout(_tt); _tt = setTimeout(() => { t.className = ""; }, 3200); }
function twoPress(el, armText, fn) {
  if (el.dataset.arm) { clearTimeout(+el.dataset.arm); delete el.dataset.arm; fn(); return; }
  const old = el.innerHTML; el.innerHTML = esc(armText); el.classList.add("armed");
  el.dataset.arm = setTimeout(() => { delete el.dataset.arm; el.innerHTML = old; el.classList.remove("armed"); }, 4000);
}
let _sheetFrom = null;
function openSheet(html, cls) {
  const o = $("#sheet"); _sheetFrom = document.activeElement;
  o.innerHTML = '<div class="sh-bg" data-act="sheet-close"></div><section class="sh ' + (cls || "") + '" role="dialog" aria-modal="true" aria-label="Detail" tabindex="-1">' + html + "</section>";
  o.hidden = false; document.body.classList.add("lock");
  const s = $(".sh", o); s.focus();
}
function closeSheet() { const o = $("#sheet"); if (o.hidden) return; o.hidden = true; o.innerHTML = ""; document.body.classList.remove("lock"); if (_sheetFrom && _sheetFrom.focus && document.contains(_sheetFrom)) _sheetFrom.focus(); }
ACTS["sheet-close"] = closeSheet;
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeSheet();
  if (e.key === "Tab" && !$("#sheet").hidden) {
    const f = $$("a[href],button:not([disabled]),input:not([disabled]),select,textarea", $(".sh")).filter(x => x.offsetParent !== null);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === a || document.activeElement.classList.contains("sh"))) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const f = ACTS[el.dataset.act]; if (f) { if (el.tagName === "A" && !el.getAttribute("href")) e.preventDefault(); f(el, e); }
});
["change", "input"].forEach(ev => document.addEventListener(ev, e => {
  const el = e.target.closest("[data-ch]"); if (!el) return;
  const m = el.dataset.ch.split(":"); if (m[1] && m[1] !== ev) return; const f = CHG[m[0]]; if (f) f(el, e);
}));
document.addEventListener("submit", e => { const f = FORMS[e.target.id]; if (f) { e.preventDefault(); f(e.target); } });
window.addEventListener("error", ev => { window.__errs = (window.__errs || []).concat(ev.message); });

/* ---------- pencarian ---------- */
let Q = null, ORD = null, FLT = { type: "", trans: "", seats: 0, max: 0, sort: "price", only: true };
function defQ() { const t = sod(Date.now()); return { s: toMs(ymd(addDays(t, 1)), "08:00"), e: toMs(ymd(addDays(t, 2)), "08:00"), drv: false }; }
function initState() { const s = ss(); Q = s.q || defQ(); ORD = s.ord || null; if (Q.s < Date.now()) Q = defQ(); }
const timeOpts = sel => { let o = ""; const st = S(); for (let m = st.open * 60; m <= st.close * 60; m += 30) { const v = p2(Math.floor(m / 60)) + ":" + p2(m % 60); o += '<option value="' + v + '"' + (v === sel ? " selected" : "") + ">" + v + "</option>"; } return o; };
const minDate = () => ymd(Date.now());
function dtFields(pre, s, e) {
  return '<div class="fld"><label for="' + pre + 's">Tanggal ambil</label><input id="' + pre + 's" type="date" min="' + minDate() + '" value="' + ymd(s) + '" data-ch="dt"></div>' +
    '<div class="fld"><label for="' + pre + 'st">Jam ambil</label><select id="' + pre + 'st" data-ch="dt">' + timeOpts(hm(s)) + "</select></div>" +
    '<div class="fld"><label for="' + pre + 'e">Tanggal kembali</label><input id="' + pre + 'e" type="date" min="' + minDate() + '" value="' + ymd(e) + '" data-ch="dt"></div>' +
    '<div class="fld"><label for="' + pre + 'et">Jam kembali</label><select id="' + pre + 'et" data-ch="dt">' + timeOpts(hm(e)) + "</select></div>";
}
const readDt = pre => ({ s: toMs($("#" + pre + "s").value || "x-1-1", $("#" + pre + "st").value), e: toMs($("#" + pre + "e").value || "x-1-1", $("#" + pre + "et").value) });
function searchForm(compact) {
  return '<form class="sf' + (compact ? " compact" : "") + '" id="sf" novalidate><div class="sf-g">' + dtFields("f", Q.s, Q.e) + '</div><div class="sf-b"><label class="chk"><input type="checkbox" id="fd"' + (Q.drv ? " checked" : "") + '> Dengan sopir</label><button class="btn pri" type="submit">' + IC.cal + " Cari mobil</button></div><p class=\"err\" id=\"sf-err\" role=\"alert\"></p></form>";
}
CHG.dt = el => {
  if (/^[fdx]s$/.test(el.id)) { const p = el.id.slice(0, 1), e = $("#" + p + "e"); if (e && e.value < el.value) e.value = el.value; }
  if (el.id.startsWith("d") && $("#quote")) readDetail();
  if (el.id.startsWith("x") && $("#edq")) editPreview();
};
FORMS.sf = () => {
  const r = readDt("f"), err = checkRange(r.s, r.e);
  if (err) { $("#sf-err").textContent = err; return; }
  Q = { s: r.s, e: r.e, drv: $("#fd").checked }; ssSet({ q: Q });
  if (location.hash.startsWith("#/armada")) route(); else location.hash = "#/armada";
};

/* ---------- kerangka ---------- */
const isAdmin = () => !!ss().admin;
function siteShell(inner, cur, full) {
  const nv = (h, t, k) => '<a href="' + h + '"' + (cur === k ? ' aria-current="page"' : "") + ">" + t + "</a>";
  return '<header class="top"><div class="wrap hbar"><a class="brand" href="#/">' + logo() + "<span>Laju Rental</span></a><nav class=\"nav\" aria-label=\"Menu utama\">" + nv("#/armada", "Armada", "armada") + nv("#/cek", "Cek booking", "cek") + nv("#/syarat", "Ketentuan", "syarat") + '</nav><a class="btn sm ghost pnl" href="#/admin">Panel rental</a></div></header>' +
    '<main id="main" class="' + (full ? "main home" : "wrap main") + '" tabindex="-1">' + inner + "</main>" +
    '<footer class="foot"><div class="wrap"><div class="fg"><div><b>Laju Rental</b><p>Contoh situs rental mobil untuk demo. Bukan perusahaan nyata. Alamat contoh: Jl. Contoh No. 1, Jakarta. Telepon contoh 0812-0000-0000.</p></div><div><b>Jam operasional</b><p>Ambil dan kembali ' + p2(S().open) + ":00 sampai " + p2(S().close) + ':00, setiap hari.</p></div><div><b>Tentang demo</b><p>Data tersimpan di peramban ini saja. <button class="lnk" data-act="reset-demo">Reset data demo</button></p></div></div><p class="credit">Foto: Wikimedia Commons, <a href="credits.json" target="_blank" rel="noopener">lihat kredit</a>.</p></div></footer>';
}
ACTS["reset-demo"] = el => twoPress(el, "Tekan lagi untuk reset", () => { resetDemo(); ssSet({ q: null, ord: null, ok: [], admin: false }); initState(); toast("Data demo dikembalikan ke awal"); location.hash = "#/"; route(); });

/* ---------- beranda ---------- */
function pageHome() {
  const cars = DB.cars.filter(c => c.active !== false), st = S();
  const min = Math.min.apply(null, cars.map(c => c.p24));
  const types = {}; cars.forEach(c => { types[c.type] = 1; });
  const maxSeats = Math.max.apply(null, cars.map(c => c.seats));
  const hero = cars.find(c => /alphard/.test(c.img)) || cars[0];
  const card = c => '<article class="car"><a class="car-img" href="#/mobil/' + c.id + '" tabindex="-1" aria-hidden="true"><img src="' + esc(c.img) + '" alt="' + esc(c.alt) + '" loading="lazy" width="480" height="300"></a><div class="car-b"><h3><a href="#/mobil/' + c.id + '">' + esc(c.name) + "</a></h3>" + specRow(c) + '<div class="pr"><small>mulai / hari</small><b>' + rp(c.p24) + "</b></div></div></article>";
  const li = t => "<li>" + IC.check + t + "</li>";
  const stp = [["Cari", "Isi jam ambil dan kembali, lalu saring tipe dan harga."], ["Pilih tambahan", "Sopir, kursi anak, atau antar jemput. Harga dihitung langsung."], ["Isi data", "Data penyewa dan SIM. Kamu dapat kode booking."], ["Ambil mobil", "Tunjukkan kode dan SIM asli, cek kondisi bersama petugas."]];
  return siteShell('<section class="hero2"><div class="hero-bg"><img src="' + esc(hero.img) + '" alt="' + esc(hero.alt) + '" width="960" height="600"></div><div class="speed" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wrap hero-t"><p class="eyebrow">Rental mobil harian</p><h1>Pilih mobil.<br>Tentukan jam.<br><span>Tancap.</span></h1><p>Ketersediaan dihitung dari booking yang ada, jadi mobil yang tampil memang kosong di jadwalmu. Mulai ' + rp(min) + ' per hari.</p></div></section>' +
    '<div class="wrap dock-w"><div class="dock"><h2 class="dock-t">Cari mobil</h2>' + searchForm() + "</div></div>" +
    '<section class="wrap sec"><div class="sec-h"><h2 class="h2">Armada</h2><a href="#/armada">Semua armada ' + IC.arrow + '</a></div><div class="cars">' + cars.map(card).join("") + "</div></section>" +
    '<section class="band" aria-label="Angka armada"><div class="wrap"><dl><div><dd>' + cars.length + "</dd><dt>unit armada</dt></div><div><dd>" + Object.keys(types).length + "</dd><dt>tipe mobil</dt></div><div><dd>" + maxSeats + "</dd><dt>kursi terbanyak</dt></div><div><dd>" + p2(st.open) + "-" + p2(st.close) + "</dd><dt>jam ambil dan kembali</dt></div></dl></div></section>" +
    '<section class="wrap sec"><h2 class="h2">Cara sewa</h2><ol class="lane">' + stp.map((s, i) => "<li><i>" + (i + 1) + "</i><b>" + s[0] + "</b><span>" + s[1] + "</span></li>").join("") + "</ol></section>" +
    '<section class="wrap sec"><div class="sec-h"><h2 class="h2">Ketentuan singkat</h2><a href="#/syarat">Baca lengkap ' + IC.arrow + '</a></div><div class="terms"><div><h3>Waktu dan biaya</h3><ul class="ticks">' + li("Ambil dan kembali " + p2(st.open) + ":00 sampai " + p2(st.close) + ":00.") + li("Durasi " + st.minHours + " jam sampai " + st.maxDays + " hari. Lebih dari 12 jam dihitung per 24 jam.") + li("Diskon durasi: " + st.disc3 + "% (3 hari), " + st.disc7 + "% (7 hari), " + st.disc14 + "% (14 hari).") + li("Deposit tampil sebelum kamu memesan dan dikembalikan saat selesai.") + '</ul></div><div><h3>Ubah dan batal</h3><ul class="ticks">' + li("Ubah jadwal lebih dari " + st.changeMin + " jam sebelum jam ambil.") + li("Batal gratis lebih dari " + st.cancelFree + " jam sebelum jam ambil.") + li("Terlambat lebih dari " + st.graceIn + " jam kena denda per jam.") + li("Cek, ubah, batalkan, dan cetak kontrak lewat kode booking.") + "</ul></div></div></section>", "home", true);
}
const specRow = c => '<ul class="sp"><li>' + IC.user + c.seats + " kursi</li><li>" + IC.gear + (c.trans === "AT" ? "Matic" : "Manual") + "</li><li>" + IC.bag + c.bags + " koper</li><li>" + IC.fuel + esc(c.fuel) + "</li></ul>";

/* ---------- armada ---------- */
function pageArmada() {
  const err = checkRange(Q.s, Q.e);
  return siteShell('<h1 class="h1">Armada tersedia</h1>' + searchForm(true) + '<p class="sum" id="sum"></p><div class="res"><aside class="flt" aria-label="Filter"><div class="flt-g">' +
    '<div class="fld"><label for="ft">Tipe</label><select id="ft" data-ch="flt">' + [["", "Semua tipe"]].concat(Object.entries(TYPES)).map(a => '<option value="' + a[0] + '"' + (FLT.type === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></div>" +
    '<div class="fld"><label for="fx">Transmisi</label><select id="fx" data-ch="flt">' + [["", "Semua"], ["AT", "Matic"], ["MT", "Manual"]].map(a => '<option value="' + a[0] + '"' + (FLT.trans === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></div>" +
    '<div class="fld"><label for="fk">Kapasitas</label><select id="fk" data-ch="flt">' + [[0, "Semua"], [5, "5 kursi atau lebih"], [7, "7 kursi atau lebih"]].map(a => '<option value="' + a[0] + '"' + (FLT.seats === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></div>" +
    '<div class="fld"><label for="fm">Harga per hari</label><select id="fm" data-ch="flt">' + [[0, "Semua harga"], [400000, "Sampai Rp 400.000"], [700000, "Sampai Rp 700.000"], [1000000, "Sampai Rp 1.000.000"], [1500000, "Sampai Rp 1.500.000"]].map(a => '<option value="' + a[0] + '"' + (FLT.max === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></div>" +
    '<div class="fld"><label for="fo">Urutkan</label><select id="fo" data-ch="flt">' + [["price", "Harga terendah"], ["priced", "Harga tertinggi"], ["seats", "Kapasitas terbanyak"]].map(a => '<option value="' + a[0] + '"' + (FLT.sort === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + '</select></div></div><label class="chk"><input type="checkbox" id="fv" data-ch="flt"' + (FLT.only ? " checked" : "") + '> Hanya yang tersedia</label></aside><div id="list" aria-live="polite"></div></div>', "armada");
}
CHG.flt = () => { FLT = { type: $("#ft").value, trans: $("#fx").value, seats: +$("#fk").value, max: +$("#fm").value, sort: $("#fo").value, only: $("#fv").checked }; renderList(); };
function renderList() {
  const err = checkRange(Q.s, Q.e), L = $("#list"); if (!L) return;
  $("#sum").innerHTML = err ? '<span class="err">' + esc(err) + " Ubah jadwal di atas.</span>" : IC.cal + " Ambil <b>" + fST(Q.s) + "</b>, kembali <b>" + fST(Q.e) + "</b> (" + durTxt(Math.ceil((Q.e - Q.s) / H)) + ")" + (Q.drv ? ", dengan sopir" : "");
  if (err) { L.innerHTML = '<p class="none">Jadwal belum valid, jadi ketersediaan belum bisa dihitung.</p>'; return; }
  let a = DB.cars.filter(c => c.active !== false).map(c => ({ c, av: carFree(c, Q.s, Q.e), q: quote(c, Q.s, Q.e, { drv: Q.drv }) }));
  a = a.filter(x => (!FLT.type || x.c.type === FLT.type) && (!FLT.trans || x.c.trans === FLT.trans) && (!FLT.seats || x.c.seats >= FLT.seats) && (!FLT.max || x.c.p24 <= FLT.max) && (!FLT.only || x.av));
  a.sort((x, y) => FLT.sort === "seats" ? y.c.seats - x.c.seats || x.q.total - y.q.total : FLT.sort === "priced" ? y.q.total - x.q.total : x.q.total - y.q.total);
  const nav = DB.cars.filter(c => c.active !== false && !carFree(c, Q.s, Q.e)).length;
  L.innerHTML = '<p class="cnt">' + a.length + " mobil ditampilkan" + (nav && FLT.only ? ", " + nav + " tidak tersedia di jadwal ini" : "") + '</p>' + (a.length ? '<div class="cars">' + a.map(x => carCard(x)).join("") + "</div>" : '<p class="none">Tidak ada mobil yang cocok. Longgarkan filter atau ubah jadwal.</p>');
}
function carCard(x) {
  const c = x.c, nf = x.av ? null : nextFree(c, Q.s, Q.e);
  return '<article class="car' + (x.av ? "" : " na") + '"><a class="car-img" href="#/mobil/' + c.id + '" tabindex="-1" aria-hidden="true"><img src="' + esc(c.img) + '" alt="' + esc(c.alt) + '" loading="lazy" width="480" height="300"></a><div class="car-b"><div class="row"><h3><a href="#/mobil/' + c.id + '">' + esc(c.name) + '</a></h3><span class="tag ' + (x.av ? "ok" : "bad") + '">' + (x.av ? "Tersedia" : "Tidak tersedia") + "</span></div>" + specRow(c) +
    '<div class="pr"><div><small>Total ' + durTxt(x.q.h) + (x.q.drv ? ", dengan sopir" : "") + '</small><b>' + rp(x.q.total) + "</b></div><small>" + rp(c.p24) + " / hari</small></div>" +
    (x.av ? "" : '<p class="muted">' + (c.active === false ? "" : nf ? "Kosong lagi mulai " + fST(nf) + " untuk durasi yang sama." : "Penuh dalam waktu dekat.") + "</p>") +
    '<a class="btn ' + (x.av ? "pri" : "ghost") + ' blk" href="#/mobil/' + c.id + '">Lihat detail</a></div></article>';
}

/* ---------- detail mobil ---------- */
function pageMobil(id) {
  const c = DB.cars.find(x => x.id === id);
  if (!c || c.active === false) return siteShell('<p class="none">Mobil tidak ditemukan. <a href="#/armada">Lihat armada</a></p>', "armada");
  if (!ORD || ORD.carId !== id) { ORD = { carId: id, s: Q.s, e: Q.e, drv: c.drv === "only" || Q.drv, child: 0, deliver: false, pickup: false, addrD: "", addrP: "" }; ssSet({ ord: ORD }); }
  const st = S();
  const tc = (t, b) => "<details><summary>" + t + "</summary><p>" + b + "</p></details>";
  return siteShell('<p class="crumb"><a href="#/armada">Armada</a> / ' + esc(c.name) + '</p><div class="dt"><div class="dt-l"><img class="dt-img" src="' + esc(c.img) + '" alt="' + esc(c.alt) + '" width="960" height="600"><h1 class="h1">' + esc(c.name) + '</h1><p class="lead">' + esc(c.about) + "</p>" +
    '<dl class="specs"><div><dt>Tipe</dt><dd>' + TYPES[c.type] + "</dd></div><div><dt>Transmisi</dt><dd>" + (c.trans === "AT" ? "Otomatis" : "Manual") + "</dd></div><div><dt>Kapasitas</dt><dd>" + c.seats + " penumpang</dd></div><div><dt>Bagasi</dt><dd>" + c.bags + " koper sedang</dd></div><div><dt>BBM</dt><dd>" + esc(c.fuel) + "</dd></div><div><dt>Tahun</dt><dd>" + c.year + "</dd></div></dl>" +
    '<h2>Spesifikasi ringkas</h2><ul class="ticks">' + c.spec.map(x => "<li>" + IC.check + esc(x) + "</li>").join("") + '</ul><p class="muted">Spesifikasi dapat berbeda sedikit per unit. Plat dan kondisi dicek saat serah terima.</p>' +
    '<h2>Harga</h2><table class="tb"><tbody><tr><th scope="row">Paket 12 jam</th><td>' + rp(c.p12) + '</td></tr><tr><th scope="row">Per hari (24 jam)</th><td>' + rp(c.p24) + '</td></tr><tr><th scope="row">Sopir</th><td>' + (c.drv === "only" ? "Wajib, " : "") + rp(st.driverDay) + " / hari, " + rp(st.driver12) + ' / 12 jam</td></tr><tr><th scope="row">Deposit</th><td>' + rp(c.dep) + " (dengan sopir " + rp(Math.round(c.dep * st.depositDriverPct / 100 / 50000) * 50000) + ')</td></tr><tr><th scope="row">Kelebihan jam</th><td>' + rp(overRate(c.p24)) + " / jam</td></tr></tbody></table>" +
    '<h2>Ketentuan</h2><div class="acc">' + tc("BBM", "Mobil diserahkan dengan tangki penuh dan harus kembali penuh. Kekurangan diganti " + rp(st.fuel8) + " per 1/8 tangki. Jenis BBM: " + esc(c.fuel) + ".") +
    tc("Syarat penyewa", c.drv === "only" ? "KTP asli. Mobil ini hanya disewa dengan sopir dari rental." : "KTP dan SIM A asli yang masih berlaku, usia minimal 21 tahun. Dengan sopir, SIM penyewa tidak diwajibkan.") +
    tc("Deposit", "Deposit ditahan saat mobil diambil dan dikembalikan saat sewa selesai, dikurangi denda, BBM, atau kerusakan bila ada.") +
    tc("Terlambat", "Toleransi " + st.graceIn + " jam. Setelah itu " + rp(overRate(c.p24)) + " per jam, maksimal sebesar harga per hari untuk tiap 24 jam keterlambatan.") +
    tc("Ubah dan batal", "Ubah jadwal bisa lebih dari " + st.changeMin + " jam sebelum jam ambil. Batal gratis lebih dari " + st.cancelFree + " jam sebelumnya, biaya " + st.cancelPct + "% antara " + st.cancelPart + " dan " + st.cancelFree + " jam, dan tidak bisa dibatalkan online kurang dari " + st.cancelPart + " jam.") + '</div></div>' +
    '<aside class="dt-r"><form id="bk" class="card bk" novalidate><h2>Atur sewa</h2><div class="sf-g">' + dtFields("d", ORD.s, ORD.e) + '</div><fieldset class="opt"><legend>Sopir</legend><label class="chk"><input type="checkbox" id="od" data-ch="opt"' + (ORD.drv ? " checked" : "") + (c.drv === "only" ? " disabled" : "") + "> Dengan sopir" + (c.drv === "only" ? " (wajib untuk unit ini)" : "") + '</label></fieldset>' +
    '<fieldset class="opt"><legend>Kursi anak</legend><div class="step"><button type="button" class="btn sm ghost" data-act="child" data-d="-1" aria-label="Kurangi kursi anak">-</button><output id="oc" aria-live="polite">' + ORD.child + '</output><button type="button" class="btn sm ghost" data-act="child" data-d="1" aria-label="Tambah kursi anak">+</button><small>' + rp(st.child) + " / hari, maks. 2</small></div></fieldset>" +
    '<fieldset class="opt"><legend>Antar jemput</legend><label class="chk"><input type="checkbox" id="oa" data-ch="opt"' + (ORD.deliver ? " checked" : "") + "> Antar mobil ke alamat (" + rp(st.deliver) + ')</label><div class="fld" id="oad"' + (ORD.deliver ? "" : " hidden") + '><label for="oaa">Alamat antar</label><input id="oaa" data-ch="opt" maxlength="160" value="' + esc(ORD.addrD) + '" placeholder="Jalan, nomor, kota"></div><label class="chk"><input type="checkbox" id="oj" data-ch="opt"' + (ORD.pickup ? " checked" : "") + "> Jemput mobil di alamat (" + rp(st.deliver) + ')</label><div class="fld" id="ojd"' + (ORD.pickup ? "" : " hidden") + '><label for="oja">Alamat jemput</label><input id="oja" data-ch="opt" maxlength="160" value="' + esc(ORD.addrP) + '" placeholder="Jalan, nomor, kota"></div></fieldset>' +
    '<div id="quote" aria-live="polite"></div></form></aside></div>', "armada");
}
function readDetail() {
  const r = readDt("d"); Object.assign(ORD, r);
  ORD.drv = $("#od").checked; ORD.deliver = $("#oa").checked; ORD.pickup = $("#oj").checked; ORD.addrD = $("#oaa").value; ORD.addrP = $("#oja").value;
  $("#oad").hidden = !ORD.deliver; $("#ojd").hidden = !ORD.pickup;
  const car = DB.cars.find(c => c.id === ORD.carId); if (car.drv === "only") ORD.drv = true;
  Q = { s: ORD.s, e: ORD.e, drv: ORD.drv }; ssSet({ ord: ORD, q: Q }); renderQuote();
}
CHG.opt = () => readDetail();
ACTS.child = el => { ORD.child = Math.max(0, Math.min(2, ORD.child + +el.dataset.d)); $("#oc").textContent = ORD.child; ssSet({ ord: ORD }); renderQuote(); };
function renderQuote() {
  const car = DB.cars.find(c => c.id === ORD.carId), Z = $("#quote"); if (!Z) return;
  const err = checkRange(ORD.s, ORD.e);
  if (err) { Z.innerHTML = '<p class="err" role="alert">' + esc(err) + '</p><button class="btn pri blk" type="button" disabled>Lanjut isi data</button>'; return; }
  const free = carFree(car, ORD.s, ORD.e), q = quote(car, ORD.s, ORD.e, ORD), nf = free ? null : nextFree(car, ORD.s, ORD.e);
  Z.innerHTML = '<p class="tag ' + (free ? "ok" : "bad") + ' big">' + (free ? "Tersedia di jadwal ini" : "Tidak tersedia di jadwal ini") + "</p>" + (free ? "" : '<p class="muted">' + (nf ? "Kosong lagi mulai " + fST(nf) + " untuk durasi yang sama. Ubah jam ambil atau pilih mobil lain." : "Pilih tanggal lain.") + "</p>") +
    '<p class="dur">' + durTxt(q.h) + "</p><table class=\"tb pr-tb\"><tbody>" + q.lines.map(l => "<tr><th scope=\"row\">" + esc(l.l) + "</th><td" + (l.a < 0 ? ' class="neg"' : "") + ">" + (l.a ? rp(l.a) : "Gratis") + "</td></tr>").join("") + '</tbody><tfoot><tr><th scope="row">Total sewa</th><td>' + rp(q.total) + "</td></tr></tfoot></table>" +
    '<p class="muted">Deposit ' + rp(q.dep) + " ditahan saat ambil dan dikembalikan saat selesai. Tidak termasuk dalam total.</p>" +
    '<button class="btn pri blk" type="button" data-act="go-pesan"' + (free ? "" : " disabled") + ">Lanjut isi data penyewa</button><p class=\"err\" id=\"bk-err\" role=\"alert\"></p>";
}
ACTS["go-pesan"] = () => {
  readDetail(); const car = DB.cars.find(c => c.id === ORD.carId);
  if (ORD.deliver && ORD.addrD.trim().length < 8) { $("#bk-err").textContent = "Isi alamat antar (minimal 8 karakter) atau matikan antar."; $("#oaa").focus(); return; }
  if (ORD.pickup && ORD.addrP.trim().length < 8) { $("#bk-err").textContent = "Isi alamat jemput (minimal 8 karakter) atau matikan jemput."; $("#oja").focus(); return; }
  if (!carFree(car, ORD.s, ORD.e)) { $("#bk-err").textContent = "Mobil tidak tersedia di jadwal ini."; return; }
  location.hash = "#/pesan";
};

/* ---------- formulir penyewa ---------- */
function summaryCard(car, o, q) {
  return '<div class="card sumc"><img src="' + esc(car.img) + '" alt="' + esc(car.alt) + '" width="480" height="300" loading="lazy"><h2>' + esc(car.name) + '</h2><p class="muted">' + fST(o.s) + " sampai " + fST(o.e) + "<br>" + durTxt(q.h) + (q.drv ? ", dengan sopir" : "") + '</p><table class="tb pr-tb"><tbody>' + q.lines.map(l => "<tr><th scope=\"row\">" + esc(l.l) + "</th><td" + (l.a < 0 ? ' class="neg"' : "") + ">" + (l.a ? rp(l.a) : "Gratis") + "</td></tr>").join("") + '</tbody><tfoot><tr><th scope="row">Total sewa</th><td>' + rp(q.total) + '</td></tr></tfoot></table><p class="muted">Deposit ' + rp(q.dep) + " dibayar saat ambil mobil.</p></div>";
}
function pagePesan() {
  const car = ORD && DB.cars.find(c => c.id === ORD.carId);
  if (!car) return siteShell('<p class="none">Belum ada mobil yang dipilih. <a href="#/armada">Pilih mobil</a></p>', "armada");
  const err = checkRange(ORD.s, ORD.e);
  if (err || !carFree(car, ORD.s, ORD.e)) return siteShell('<p class="none">' + esc(err || "Mobil ini sudah tidak tersedia di jadwal tersebut.") + ' <a href="#/mobil/' + car.id + '">Ubah jadwal</a></p>', "armada");
  const q = quote(car, ORD.s, ORD.e, ORD), req = !q.drv;
  const f = (id, label, extra, hint) => '<div class="fld"><label for="f-' + id + '">' + label + '</label>' + extra + (hint ? '<small class="hint" id="h-' + id + '">' + hint + "</small>" : "") + '<small class="e" id="e-' + id + '" role="alert"></small></div>';
  return siteShell('<p class="crumb"><a href="#/mobil/' + car.id + '">' + esc(car.name) + "</a> / Data penyewa</p><h1 class=\"h1\">Data penyewa</h1><div class=\"dt\"><div class=\"dt-l\"><form id=\"pf\" class=\"card\" novalidate><p class=\"note\">Ini demo. Jangan isi data pribadi asli. <button type=\"button\" class=\"lnk\" data-act=\"fill-sample\">Isi dengan data contoh</button></p>" +
    '<div class="two">' + f("name", "Nama sesuai KTP", '<input id="f-name" autocomplete="off" maxlength="60">') + f("phone", "Nomor WhatsApp", '<input id="f-phone" inputmode="tel" autocomplete="off" maxlength="16" placeholder="0812-0000-0000">') + "</div>" +
    f("email", "Email (opsional)", '<input id="f-email" type="email" autocomplete="off" maxlength="80">') +
    f("nik", "NIK (16 digit)", '<input id="f-nik" inputmode="numeric" autocomplete="off" maxlength="16">') +
    '<div class="two">' + f("sim", "Nomor SIM A (12 digit)" + (req ? "" : ", opsional dengan sopir"), '<input id="f-sim" inputmode="numeric" autocomplete="off" maxlength="12">') + f("simexp", "SIM berlaku sampai", '<input id="f-simexp" type="date">') + "</div>" +
    f("addr", "Alamat", '<textarea id="f-addr" rows="2" maxlength="160"></textarea>') + f("note", "Catatan untuk petugas (opsional)", '<textarea id="f-note" rows="2" maxlength="200" placeholder="Contoh: tiba dengan kereta jam 07.40"></textarea>') +
    '<label class="chk"><input type="checkbox" id="f-agree"><span>Saya setuju dengan <a href="#/syarat" target="_blank" rel="noopener">ketentuan sewa</a> dan menyerahkan SIM asli saat ambil.</span></label><small class="e" id="e-agree" role="alert"></small><p class="err" id="pf-err" role="alert"></p><button class="btn pri blk" type="submit">Buat booking</button></form></div><aside class="dt-r">' + summaryCard(car, ORD, q) + "</aside></div>", "armada");
}
ACTS["fill-sample"] = () => {
  const v = { name: "Contoh Penyewa", phone: "0812-0000-0000", email: "", nik: "3201000000000001", sim: "123456789012", simexp: ymd(addDays(Date.now(), 1100)), addr: "Jl. Contoh No. 1, Jakarta (alamat contoh)" };
  Object.keys(v).forEach(k => { $("#f-" + k).value = v[k]; });
  $("#f-agree").checked = true;
};
FORMS.pf = () => {
  const car = DB.cars.find(c => c.id === ORD.carId), q = quote(car, ORD.s, ORD.e, ORD), g = k => $("#f-" + k).value.trim(), E = {};
  const digits = s => s.replace(/\D/g, "");
  if (g("name").length < 3 || !/^[\p{L} .'-]+$/u.test(g("name"))) E.name = "Isi nama lengkap (huruf saja, minimal 3 karakter).";
  const ph = digits(g("phone")); if (!/^(08|628)\d{8,11}$/.test(ph)) E.phone = "Nomor HP tidak valid. Contoh: 0812-0000-0000.";
  if (g("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g("email"))) E.email = "Format email tidak valid.";
  if (!/^\d{16}$/.test(g("nik"))) E.nik = "NIK harus 16 digit angka.";
  if (!q.drv || g("sim") || g("simexp")) {
    if (!/^\d{12}$/.test(g("sim"))) E.sim = "Nomor SIM harus 12 digit angka.";
    if (!g("simexp")) E.simexp = "Isi masa berlaku SIM."; else if (g("simexp") <= ymd(ORD.e)) E.simexp = "SIM harus berlaku setelah tanggal kembali (" + fD(ORD.e) + ").";
  }
  if (g("addr").length < 10) E.addr = "Isi alamat lengkap (minimal 10 karakter).";
  if (!$("#f-agree").checked) E.agree = "Centang persetujuan untuk melanjutkan.";
  $$("small.e").forEach(x => { x.textContent = ""; }); $$("#pf [aria-invalid]").forEach(x => x.removeAttribute("aria-invalid")); $("#pf-err").textContent = "";
  const keys = Object.keys(E);
  if (keys.length) { keys.forEach(k => { $("#e-" + k).textContent = E[k]; const el = $("#f-" + k); if (el) el.setAttribute("aria-invalid", "true"); }); $("#pf-err").textContent = "Periksa " + keys.length + " isian yang ditandai."; $("#f-" + keys[0]).focus(); return; }
  if (!carFree(car, ORD.s, ORD.e)) { $("#pf-err").textContent = "Maaf, mobil ini baru saja dipesan orang lain di jadwal tersebut."; return; }
  const now = Date.now(), b = {
    id: genCode(), carId: car.id, name: g("name"), phone: g("phone"), email: g("email"), nik: g("nik"), simNo: g("sim"), simExp: g("simexp"), addr: g("addr"), note: g("note"),
    start: ORD.s, end: ORD.e, drv: q.drv, child: ORD.child, deliver: ORD.deliver, pickup: ORD.pickup, addrD: ORD.deliver ? ORD.addrD.trim() : "", addrP: ORD.pickup ? ORD.addrP.trim() : "",
    q, status: "dipesan", createdAt: now, hist: [{ t: now, s: "dipesan", n: "Booking dibuat" }], out: null, ret: null, cancel: null, settle: null
  };
  DB.bookings.unshift(b); save(); const ok = (ss().ok || []).concat(b.id); ORD = null; ssSet({ ok, ord: null });
  location.hash = "#/kode/" + b.id + "?baru=1";
};

/* ---------- cek, lihat, ubah, batal ---------- */
const verified = code => isAdmin() || (ss().ok || []).includes(code);
function pageCek(prefill) {
  const ex = DB.bookings.find(b => b.status === "dipesan") || DB.bookings[0];
  return siteShell('<h1 class="h1">Cek booking</h1><div class="two2"><form id="ck" class="card" novalidate><div class="fld"><label for="ck-code">Kode booking</label><input id="ck-code" value="' + esc(prefill || "") + '" placeholder="LR-ABC123" autocomplete="off" maxlength="12"></div><div class="fld"><label for="ck-ph">4 digit terakhir nomor HP</label><input id="ck-ph" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0000"></div><p class="err" id="ck-err" role="alert"></p><button class="btn pri blk" type="submit">Lihat booking</button></form>' +
    (ex ? '<div class="card"><h2>Coba dengan data contoh</h2><p class="muted">Kode <b>' + esc(ex.id) + "</b> dan 4 digit terakhir <b>" + esc(ex.phone.replace(/\D/g, "").slice(-4)) + '</b>. Booking baru yang kamu buat juga bisa dicek di sini.</p><button class="btn ghost" type="button" data-act="ck-fill" data-c="' + esc(ex.id) + '" data-p="' + esc(ex.phone.replace(/\D/g, "").slice(-4)) + '">Isi otomatis</button></div>' : "") + "</div>", "cek");
}
ACTS["ck-fill"] = el => { $("#ck-code").value = el.dataset.c; $("#ck-ph").value = el.dataset.p; };
FORMS.ck = () => {
  const code = $("#ck-code").value.trim().toUpperCase(), p = $("#ck-ph").value.trim(), b = DB.bookings.find(x => x.id === code);
  if (!code || !/^\d{4}$/.test(p)) { $("#ck-err").textContent = "Isi kode booking dan 4 digit terakhir nomor HP."; return; }
  if (!b || b.phone.replace(/\D/g, "").slice(-4) !== p) { $("#ck-err").textContent = "Kode atau 4 digit nomor HP tidak cocok."; return; }
  ssSet({ ok: (ss().ok || []).concat(code) }); location.hash = "#/kode/" + code;
};
const badge = s => '<span class="bdg s-' + s + '">' + STATUS[s] + "</span>";
function lines(b) {
  const L = b.q.lines.map(l => [l.l, l.a]);
  if (b.ret) { if (b.ret.penalty) L.push(["Denda terlambat", b.ret.penalty]); if (b.ret.fuelFee) L.push(["Kekurangan BBM", b.ret.fuelFee]); if (b.ret.damageFee) L.push(["Biaya kerusakan", b.ret.damageFee]); }
  return L;
}
function priceTable(b) {
  const L = lines(b), tot = b.q.total + extra(b);
  return '<table class="tb pr-tb"><tbody>' + L.map(l => "<tr><th scope=\"row\">" + esc(l[0]) + "</th><td" + (l[1] < 0 ? ' class="neg"' : "") + ">" + (l[1] ? rp(l[1]) : "Gratis") + "</td></tr>").join("") + '</tbody><tfoot><tr><th scope="row">Total</th><td>' + rp(tot) + "</td></tr></tfoot></table>" + '<p class="muted">Deposit ' + rp(b.q.dep) + (b.settle ? ": dikembalikan " + rp(b.settle.refund) + (b.settle.due ? ", kekurangan dibayar " + rp(b.settle.due) : "") + "." : " ditahan saat mobil diambil.") + "</p>";
}
function timeline(b) {
  const order = ["dipesan", "diambil", "berjalan", "dikembalikan", "selesai"];
  if (b.status === "batal") return '<p class="banner bad">Booking dibatalkan ' + (b.cancel ? fDT(b.cancel.at) + (b.cancel.fee ? ", biaya pembatalan " + rp(b.cancel.fee) : ", tanpa biaya") : "") + ".</p>";
  const i = order.indexOf(b.status);
  return '<ol class="tl" aria-label="Status booking">' + order.map((s, k) => '<li class="' + (k < i ? "done" : k === i ? "cur" : "") + '"' + (k === i ? ' aria-current="step"' : "") + "><span>" + (k < i ? IC.check : k + 1) + "</span>" + STATUS[s] + "</li>").join("") + "</ol>";
}
function pageKode(code, qs) {
  const b = DB.bookings.find(x => x.id === code);
  if (!b) return siteShell('<p class="none">Booking tidak ditemukan. <a href="#/cek">Cek booking</a></p>', "cek");
  if (!verified(code)) return pageCek(code);
  const car = carOf(b), ci = cancelInfo(b), ch = changeInfo(b);
  return siteShell((qs.get("baru") ? '<p class="banner ok" role="status">' + IC.check + " Booking dibuat. Simpan kode di bawah, kamu butuh kode ini untuk cek, ubah, atau batal. Demo ini tidak mengirim pesan.</p>" : "") +
    '<div class="bk-h"><div><p class="eyebrow">Kode booking</p><h1 class="code">' + esc(b.id) + "</h1></div>" + badge(b.status) + "</div>" + timeline(b) +
    '<div class="dt"><div class="dt-l"><div class="card bkc"><img src="' + esc(car.img) + '" alt="' + esc(car.alt) + '" width="480" height="300" loading="lazy"><div><h2>' + esc(car.name) + "</h2><dl class=\"kv\"><dt>Ambil</dt><dd>" + fDT(b.start) + "</dd><dt>Kembali</dt><dd>" + fDT(b.end) + "</dd><dt>Durasi</dt><dd>" + durTxt(b.q.h) + "</dd><dt>Sopir</dt><dd>" + (b.drv ? "Ya" : "Tidak") + "</dd><dt>Kursi anak</dt><dd>" + b.child + "</dd>" + (b.deliver ? "<dt>Antar</dt><dd>" + esc(b.addrD) + "</dd>" : "") + (b.pickup ? "<dt>Jemput</dt><dd>" + esc(b.addrP) + "</dd>" : "") + "</dl></div></div>" +
    '<div class="card"><h2>Penyewa</h2><dl class="kv"><dt>Nama</dt><dd>' + esc(b.name) + "</dd><dt>HP</dt><dd>" + esc(b.phone) + "</dd><dt>SIM</dt><dd>" + (b.simNo ? "A, " + esc(b.simNo) + ", berlaku " + esc(b.simExp) : "Tidak diisi (dengan sopir)") + "</dd><dt>Alamat</dt><dd>" + esc(b.addr) + "</dd>" + (b.note ? "<dt>Catatan</dt><dd>" + esc(b.note) + "</dd>" : "") + '</dl></div><div class="card"><h2>Riwayat</h2><ul class="hist">' + b.hist.slice().reverse().map(x => "<li><b>" + STATUS[x.s] + "</b> " + esc(x.n) + "<small>" + fDT(x.t) + "</small></li>").join("") + '</ul></div></div><aside class="dt-r"><div class="card"><h2>Rincian biaya</h2>' + priceTable(b) + "</div>" +
    '<div class="card"><h2>Tindakan</h2><div class="acts">' + (b.status !== "batal" ? '<a class="btn ghost blk" href="#/kontrak/' + esc(b.id) + '">Kontrak sewa (cetak)</a>' : "") +
    (b.status === "dipesan" ? (ch.ok ? '<button class="btn ghost blk" data-act="toggle-edit" aria-expanded="false" aria-controls="edit">Ubah jadwal atau tambahan</button>' : '<p class="muted">' + esc(ch.why) + "</p>") + (ci.ok ? '<button class="btn danger blk" data-act="toggle-cancel" aria-expanded="false" aria-controls="cancel">Batalkan booking</button>' : '<p class="muted">' + esc(ci.why) + "</p>") : "") + "</div>" +
    (ci.ok ? '<div id="cancel" hidden class="panel"><p><b>Biaya pembatalan: ' + rp(ci.fee) + "</b><br><small>" + esc(ci.label) + '</small></p><div class="fld"><label for="cn-why">Alasan (opsional)</label><input id="cn-why" maxlength="100"></div><button class="btn danger blk" data-act="cancel-do" data-id="' + esc(b.id) + '">Ya, batalkan booking</button></div>' : "") +
    (ch.ok ? '<div id="edit" hidden class="panel">' + editForm(b) + "</div>" : "") + "</div></aside></div>", "cek");
}
const sameRule = '<p class="muted">Ubah jadwal memeriksa ulang ketersediaan. Harga dihitung ulang.</p>';
function editForm(b) {
  const car = carOf(b);
  return '<form id="ef" novalidate data-id="' + esc(b.id) + '"><div class="sf-g">' + dtFields("x", b.start, b.end) + '</div><label class="chk"><input type="checkbox" id="xd" data-ch="xp"' + (b.drv ? " checked" : "") + (car.drv === "only" ? " disabled" : "") + '> Dengan sopir</label><div class="fld"><label for="xc">Kursi anak</label><select id="xc" data-ch="xp"><option' + (b.child === 0 ? " selected" : "") + '>0</option><option' + (b.child === 1 ? " selected" : "") + '>1</option><option' + (b.child === 2 ? " selected" : "") + '>2</option></select></div><label class="chk"><input type="checkbox" id="xa" data-ch="xp"' + (b.deliver ? " checked" : "") + '> Antar ke alamat</label><div class="fld"><label for="xaa">Alamat antar</label><input id="xaa" data-ch="xp" maxlength="160" value="' + esc(b.addrD) + '"></div><label class="chk"><input type="checkbox" id="xj" data-ch="xp"' + (b.pickup ? " checked" : "") + '> Jemput di alamat</label><div class="fld"><label for="xja">Alamat jemput</label><input id="xja" data-ch="xp" maxlength="160" value="' + esc(b.addrP) + '"></div><div id="edq" aria-live="polite"></div><button class="btn pri blk" type="submit" id="ef-go">Simpan perubahan</button></form>';
}
function editRead(b) {
  const car = carOf(b), r = readDt("x"), o = { drv: $("#xd").checked, child: +$("#xc").value, deliver: $("#xa").checked, pickup: $("#xj").checked };
  const aD = $("#xaa").value.trim(), aP = $("#xja").value.trim();
  let err = checkRange(r.s, r.e);
  if (!err && (r.s - Date.now()) / H < S().changeMin) err = "Jam ambil baru juga harus lebih dari " + S().changeMin + " jam dari sekarang.";
  if (!err && o.deliver && aD.length < 8) err = "Isi alamat antar (minimal 8 karakter).";
  if (!err && o.pickup && aP.length < 8) err = "Isi alamat jemput (minimal 8 karakter).";
  if (!err && !carFree(car, r.s, r.e, b.id)) err = "Mobil tidak tersedia di jadwal baru.";
  return { r, o, aD, aP, err, q: quote(car, r.s, r.e, o) };
}
function editPreview() {
  const f = $("#ef"); if (!f) return; const b = DB.bookings.find(x => x.id === f.dataset.id), x = editRead(b), d = x.q.total - b.q.total;
  $("#edq").innerHTML = x.err ? '<p class="err" role="alert">' + esc(x.err) + "</p>" : "<p><b>Total baru " + rp(x.q.total) + "</b> (" + (d === 0 ? "sama dengan sebelumnya" : (d > 0 ? "naik " : "turun ") + rp(Math.abs(d))) + ")</p>";
}
CHG.xp = () => editPreview();
ACTS["toggle-edit"] = el => { const p = $("#edit"); p.hidden = !p.hidden; el.setAttribute("aria-expanded", String(!p.hidden)); if (!p.hidden) { editPreview(); $("#xs").focus(); } };
ACTS["toggle-cancel"] = el => { const p = $("#cancel"); p.hidden = !p.hidden; el.setAttribute("aria-expanded", String(!p.hidden)); };
FORMS.ef = f => {
  const b = DB.bookings.find(x => x.id === f.dataset.id), x = editRead(b), ci = changeInfo(b);
  if (!ci.ok) { toast(ci.why, true); return; }
  if (x.err) { editPreview(); return; }
  const d = x.q.total - b.q.total;
  Object.assign(b, { start: x.r.s, end: x.r.e, drv: x.q.drv, child: x.o.child, deliver: x.o.deliver, pickup: x.o.pickup, addrD: x.o.deliver ? x.aD : "", addrP: x.o.pickup ? x.aP : "", q: x.q });
  b.hist.push({ t: Date.now(), s: "dipesan", n: "Jadwal atau tambahan diubah: " + fST(b.start) + " sampai " + fST(b.end) + ", total " + rp(x.q.total) });
  save(); toast("Perubahan disimpan" + (d ? ", total " + (d > 0 ? "naik " : "turun ") + rp(Math.abs(d)) : "")); route();
};
ACTS["cancel-do"] = el => {
  const b = DB.bookings.find(x => x.id === el.dataset.id), ci = cancelInfo(b);
  if (!ci.ok) { toast(ci.why, true); return; }
  const why = ($("#cn-why").value || "").trim(), now = Date.now();
  b.status = "batal"; b.cancel = { at: now, fee: ci.fee, why }; b.hist.push({ t: now, s: "batal", n: "Dibatalkan pelanggan" + (ci.fee ? ", biaya " + rp(ci.fee) : ", tanpa biaya") + (why ? ". Alasan: " + why : "") });
  save(); toast("Booking dibatalkan"); route();
};

/* ---------- kontrak, ketentuan ---------- */
function pageKontrak(code) {
  const b = DB.bookings.find(x => x.id === code);
  if (!b || !verified(code)) return siteShell('<p class="none">Kontrak tidak tersedia. <a href="#/cek">Cek booking</a></p>', "cek");
  const car = carOf(b), st = S();
  return siteShell('<div class="noprint ctl"><a class="btn ghost" href="#/kode/' + esc(b.id) + '">Kembali ke booking</a><button class="btn pri" data-act="print">Cetak kontrak</button></div><article class="doc"><header><h1>Perjanjian Sewa Mobil</h1><p>No. ' + esc(b.id) + " / dibuat " + fD(b.createdAt) + "</p></header>" +
    '<p><b>Pihak pertama</b>: Laju Rental (contoh fiktif), Jl. Contoh No. 1, Jakarta.<br><b>Pihak kedua (penyewa)</b>: ' + esc(b.name) + ", NIK " + esc(b.nik) + ", HP " + esc(b.phone) + ", " + esc(b.addr) + ".</p>" +
    '<table class="tb"><tbody><tr><th scope="row">Mobil</th><td>' + esc(car.name) + " (" + car.year + "), plat contoh " + esc(car.plate) + '</td></tr><tr><th scope="row">Ambil</th><td>' + fDT(b.start) + '</td></tr><tr><th scope="row">Kembali</th><td>' + fDT(b.end) + " (" + durTxt(b.q.h) + ')</td></tr><tr><th scope="row">Sopir</th><td>' + (b.drv ? "Ya, dari pihak pertama" : "Tidak, penyewa mengemudi sendiri dengan SIM A " + esc(b.simNo)) + '</td></tr><tr><th scope="row">Biaya sewa</th><td>' + rp(b.q.total) + '</td></tr><tr><th scope="row">Deposit</th><td>' + rp(b.q.dep) + "</td></tr>" + (b.out ? '<tr><th scope="row">Serah terima</th><td>Odometer ' + b.out.odo.toLocaleString("id-ID") + " km, BBM " + FUEL[b.out.fuel] + ", " + esc(b.out.note) + "</td></tr>" : "") + "</tbody></table>" +
    "<h2>Ketentuan</h2><ol><li>Mobil dipakai sesuai peruntukan, oleh penyewa" + (b.drv ? " dan sopir yang ditugaskan" : " yang namanya tertera di SIM") + ". Dilarang disewakan kembali, dipakai balap, atau mengangkut barang terlarang.</li><li>Mobil diserahkan dengan tangki penuh dan dikembalikan penuh. Kekurangan BBM diganti " + rp(st.fuel8) + " per 1/8 tangki.</li><li>Keterlambatan lebih dari " + st.graceIn + " jam dikenai " + rp(overRate(car.p24)) + " per jam, maksimal " + rp(car.p24) + " untuk tiap 24 jam keterlambatan.</li><li>Kerusakan dan kehilangan selama masa sewa menjadi tanggung jawab penyewa sesuai hasil pemeriksaan saat pengembalian.</li><li>Deposit dikembalikan setelah pemeriksaan, dikurangi denda dan biaya yang timbul.</li><li>Ubah jadwal bisa lebih dari " + st.changeMin + " jam sebelum jam ambil. Pembatalan gratis lebih dari " + st.cancelFree + " jam sebelumnya, biaya " + st.cancelPct + "% antara " + st.cancelPart + " dan " + st.cancelFree + " jam.</li><li>Tol, parkir" + (b.drv ? ", makan dan penginapan sopir" : "") + " ditanggung penyewa.</li></ol>" +
    '<div class="sign"><div><p>Pihak pertama</p><span></span><small>Petugas Laju Rental</small></div><div><p>Pihak kedua</p><span></span><small>' + esc(b.name) + "</small></div></div><p class=\"muted\">Dokumen contoh untuk demo, bukan kontrak hukum.</p></article>", "cek");
}
ACTS.print = () => window.print();
function pageSyarat() {
  const st = S();
  return siteShell('<h1 class="h1">Ketentuan sewa</h1><div class="two2"><div class="card"><h2>Waktu</h2><ul class="ticks"><li>' + IC.check + "Ambil dan kembali antara " + p2(st.open) + ":00 dan " + p2(st.close) + ":00.</li><li>" + IC.check + "Ambil minimal " + st.lead + " jam dari sekarang. Durasi " + st.minHours + " jam sampai " + st.maxDays + " hari.</li><li>" + IC.check + "Sewa sampai 12 jam memakai paket 12 jam. Lebih dari itu dihitung per 24 jam.</li><li>" + IC.check + "Kelebihan sampai " + st.graceOut + " jam dari kelipatan 24 jam tidak dikenai biaya. Lebih dari itu " + st.overPct + "% harga harian per jam.</li><li>" + IC.check + "Antar waktu sewa ada jeda " + st.buffer + " jam untuk cuci dan pemeriksaan.</li></ul></div>" +
    '<div class="card"><h2>Diskon durasi</h2><ul class="ticks"><li>' + IC.check + "3 hari atau lebih: " + st.disc3 + "%</li><li>" + IC.check + "7 hari atau lebih: " + st.disc7 + "%</li><li>" + IC.check + "14 hari atau lebih: " + st.disc14 + '%</li></ul><h2>Deposit</h2><p>Sesuai mobil, ditahan saat ambil dan dikembalikan saat selesai. Dengan sopir, deposit ' + st.depositDriverPct + '%.</p></div>' +
    '<div class="card"><h2>Ubah dan batal</h2><ul class="ticks"><li>' + IC.check + "Ubah jadwal: lebih dari " + st.changeMin + " jam sebelum jam ambil.</li><li>" + IC.check + "Batal gratis: lebih dari " + st.cancelFree + " jam sebelum jam ambil.</li><li>" + IC.check + "Batal " + st.cancelPart + " sampai " + st.cancelFree + " jam sebelumnya: biaya " + st.cancelPct + "% dari total.</li><li>" + IC.check + "Kurang dari " + st.cancelPart + " jam: hubungi kantor, tidak bisa dibatalkan online.</li></ul></div>" +
    '<div class="card"><h2>BBM, terlambat, kerusakan</h2><ul class="ticks"><li>' + IC.check + "Tangki penuh saat ambil, penuh saat kembali. Kekurangan " + rp(st.fuel8) + " per 1/8.</li><li>" + IC.check + "Terlambat lebih dari " + st.graceIn + " jam: denda per jam sebesar " + st.overPct + "% harga harian.</li><li>" + IC.check + "Kondisi dan odometer dicatat saat ambil dan kembali. Kerusakan baru dikenai biaya perbaikan.</li><li>" + IC.check + "Sopir " + rp(st.driverDay) + " / hari, kursi anak " + rp(st.child) + " / hari, antar atau jemput " + rp(st.deliver) + " per arah.</li></ul></div></div>", "syarat");
}

/* ---------- router ---------- */
function route() {
  const hash = location.hash.slice(1) || "/", qi = hash.indexOf("?"), path = qi < 0 ? hash : hash.slice(0, qi), qs = new URLSearchParams(qi < 0 ? "" : hash.slice(qi + 1));
  const p = path.split("/").filter(Boolean); sync(); closeSheet();
  const V = $("#view"); let h;
  if (p[0] === "admin") { h = renderAdmin(p[1] || "", p[2]); }
  else if (!p.length) h = pageHome();
  else if (p[0] === "armada") h = pageArmada();
  else if (p[0] === "mobil") h = pageMobil(p[1]);
  else if (p[0] === "pesan") h = pagePesan();
  else if (p[0] === "cek") h = pageCek();
  else if (p[0] === "kode") h = pageKode((p[1] || "").toUpperCase(), qs);
  else if (p[0] === "kontrak") h = pageKontrak((p[1] || "").toUpperCase());
  else if (p[0] === "syarat") h = pageSyarat();
  else h = siteShell('<p class="none">Halaman tidak ada. <a href="#/">Ke beranda</a></p>', "");
  V.innerHTML = h;
  document.title = (p[0] === "admin" ? "Panel rental" : "Laju Rental") + " | Contoh situs rental mobil";
  if (p[0] === "armada") renderList();
  if (p[0] === "mobil" && $("#quote")) renderQuote();
  if (p[0] === "admin" && typeof afterAdmin === "function") afterAdmin(p[1] || "");
  if (_lastPath !== path) { window.scrollTo(0, 0); const m = $("#main"); if (m) m.focus({ preventScroll: true }); }
  _lastPath = path;
}
let _lastPath = null;
window.addEventListener("hashchange", route);
window.addEventListener("storage", e => { if (e.key === KEY) { load(); } });
setInterval(() => { if (DB) sync(); }, 60000);
