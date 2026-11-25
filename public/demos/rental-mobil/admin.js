/* Laju Rental: panel pengelola (PIN demo 2468) */
"use strict";
const PIN = "2468";
const ATABS = [["ringkasan", "Ringkasan"], ["kalender", "Kalender"], ["booking", "Booking"], ["armada", "Armada"], ["perawatan", "Perawatan"], ["pelanggan", "Pelanggan"], ["laporan", "Laporan"], ["pengaturan", "Pengaturan"]];
let BK = { q: "", st: "", sort: "start", dir: -1, page: 1 }, CAL = { start: null }, RP = { from: null, to: null }, CU = { q: "" };
const COLS = 14, PER = 10;

function renderAdmin(tab) {
  if (!isAdmin()) return '<main id="main" class="wrap main login" tabindex="-1"><div class="card lgc"><span class="logo big">' + IC.car + '</span><h1>Panel rental</h1><p class="muted">Masuk dengan PIN demo.</p><form id="lg" novalidate><div class="fld"><label for="lg-pin">PIN</label><input id="lg-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="4 digit"></div><p class="err" id="lg-err" role="alert"></p><button class="btn pri blk" type="submit">Masuk</button></form><p class="hintbox">PIN demo: <b>' + PIN + '</b></p><a href="#/">Kembali ke situs</a></div></main>';
  tab = ATABS.some(t => t[0] === tab) ? tab : "ringkasan";
  return '<header class="atop"><div class="abar"><a class="brand" href="#/admin">' + logo() + "<span>Panel rental</span></a><div class=\"aact\"><a class=\"btn sm ghost\" href=\"#/\">Lihat situs</a><button class=\"btn sm ghost\" data-act=\"logout\">Keluar</button></div></div></header><div class=\"adm\"><nav class=\"anav\" aria-label=\"Menu panel\">" + ATABS.map(t => '<a href="#/admin/' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a>").join("") + '</nav><main id="main" class="amain" tabindex="-1">' + TAB[tab]() + "</main></div>";
}
FORMS.lg = () => { if ($("#lg-pin").value.trim() === PIN) { ssSet({ admin: true }); location.hash = "#/admin"; route(); } else { $("#lg-err").textContent = "PIN salah. PIN demo: " + PIN; $("#lg-pin").value = ""; $("#lg-pin").focus(); } };
ACTS.logout = () => { ssSet({ admin: false }); location.hash = "#/"; };

/* ---------- util ---------- */
function csvDl(name, rows) {
  const q = v => { let s = String(v == null ? "" : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const blob = new Blob(["﻿" + rows.map(r => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast("File " + name + " diunduh");
}
const fuelOpts = sel => FUEL.map((t, i) => '<option value="' + i + '"' + (i === sel ? " selected" : "") + ">" + t + "</option>").join("");
const stTag = c => '<span class="tag ' + (c.k === "free" ? "ok" : c.k === "rent" ? "info" : "bad") + '">' + c.t + "</span>";
const numv = id => { const v = $("#" + id).value.trim(); return v === "" ? NaN : Number(v); };
function fieldE(form, E) {
  $$("small.e", form).forEach(x => { x.textContent = ""; }); $$("[aria-invalid]", form).forEach(x => x.removeAttribute("aria-invalid"));
  const k = Object.keys(E); if (!k.length) return false;
  k.forEach(n => { const e = $("#e-" + n, form), i = $("#" + n, form); if (e) e.textContent = E[n]; if (i) i.setAttribute("aria-invalid", "true"); });
  const f = $("#" + k[0], form); if (f) f.focus(); return true;
}
const fld = (id, label, inner) => '<div class="fld"><label for="' + id + '">' + label + "</label>" + inner + '<small class="e" id="e-' + id + '" role="alert"></small></div>';
const sheetHead = (t, sub) => '<header class="sh-h"><div>' + (sub ? '<p class="eyebrow">' + sub + "</p>" : "") + "<h2>" + t + '</h2></div><button class="btn sm ghost" data-act="sheet-close" aria-label="Tutup">' + IC.x + "</button></header>";
function refresh(id) { route(); if (id) openBooking(id); }
const firstName = n => String(n).split(" ")[0];
function brow(b) {
  const car = carOf(b), late = b.status === "berjalan" && Date.now() > b.end + S().graceIn * H;
  return '<button class="brow" data-act="open-b" data-id="' + esc(b.id) + '"><span class="b1"><b>' + esc(b.id) + "</b> " + esc(b.name) + "</span><span class=\"b2\">" + esc(car.name) + "</span><span class=\"b3\">" + fST(b.start) + " &rarr; " + fST(b.end) + '</span><span class="b4">' + (late ? '<span class="tag bad">Terlambat</span> ' : "") + badge(b.status) + "</span></button>";
}
ACTS["open-b"] = el => openBooking(el.dataset.id);

/* ---------- ringkasan ---------- */
const TAB = {};
TAB.ringkasan = () => {
  const now = Date.now(), t0 = sod(now), t1 = t0 + DAY, B = DB.bookings, st = S();
  const pick = B.filter(b => b.status === "dipesan" && b.start < t1 && b.start >= t0 - DAY).sort((a, b) => a.start - b.start);
  const ret = B.filter(b => ["diambil", "berjalan"].includes(b.status) && b.end < t1).sort((a, b) => a.end - b.end);
  const late = B.filter(b => b.status === "berjalan" && now > b.end + st.graceIn * H);
  const pending = B.filter(b => b.status === "dikembalikan");
  const mo = new Date(now); const m0 = new Date(mo.getFullYear(), mo.getMonth(), 1).getTime();
  const rev = B.filter(b => revAt(b) >= m0 && revAt(b) < t1 + 0 && revenue(b) > 0).reduce((a, b) => a + revenue(b), 0);
  const act = DB.cars.filter(c => c.active !== false), states = act.map(c => carState(c, now));
  const free = states.filter(s => s.k === "free").length, rent = states.filter(s => s.k === "rent").length, mt = states.filter(s => s.k === "maint").length;
  const list = (a, empty) => a.length ? a.map(brow).join("") : '<p class="none sm">' + empty + "</p>";
  return '<h1 class="h2">Ringkasan hari ini <small>' + fD(now) + '</small></h1><div class="stats"><div><small>Siap disewa</small><b>' + free + " <span>dari " + act.length + '</span></b></div><div><small>Sedang disewa</small><b>' + rent + '</b></div><div><small>Perawatan</small><b>' + mt + '</b></div><div class="' + (late.length ? "warn" : "") + '"><small>Terlambat kembali</small><b>' + late.length + '</b></div><div><small>Menunggu diselesaikan</small><b>' + pending.length + '</b></div><div><small>Pendapatan bulan ini</small><b class="sm">' + rp(rev) + "</b></div></div>" +
    '<div class="cols"><section class="card"><h2>Ambil hari ini</h2>' + list(pick, "Tidak ada jadwal ambil.") + '</section><section class="card"><h2>Kembali hari ini atau terlambat</h2>' + list(ret, "Tidak ada jadwal kembali.") + '</section><section class="card"><h2>Menunggu penyelesaian</h2>' + list(pending, "Semua pengembalian sudah diselesaikan.") + '</section><section class="card"><h2>Status armada</h2><ul class="fl">' + DB.cars.map(c => { const s = carState(c, now), nb = DB.bookings.filter(b => b.carId === c.id && b.status === "dipesan" && b.start > now).sort((a, b) => a.start - b.start)[0]; return '<li><img src="' + esc(c.img) + '" alt="" width="56" height="35" loading="lazy"><span><b>' + esc(c.name) + "</b><small>" + esc(c.plate) + " · odometer " + c.odo.toLocaleString("id-ID") + " km" + (nb ? " · berikutnya " + fST(nb.start) : "") + "</small></span>" + stTag(s) + "</li>"; }).join("") + "</ul></section></div>";
};

/* ---------- kalender ---------- */
TAB.kalender = () => {
  const now = Date.now(); if (!CAL.start) CAL.start = sod(now) - DAY;
  const rs = CAL.start, re = addDays(rs, COLS), span = re - rs;
  const pos = (s, e) => { const a = Math.max(s, rs), z = Math.min(e, re); return [(a - rs) / span * 100, Math.max((z - a) / span * 100, 0.8)]; };
  let head = "", n = 0;
  for (let i = 0; i < COLS; i++) { const d = addDays(rs, i), dd = new Date(d); head += '<div class="cd' + (sod(now) === d ? " today" : "") + (dd.getDay() === 0 || dd.getDay() === 6 ? " we" : "") + '"><small>' + DN[dd.getDay()] + "</small><b>" + dd.getDate() + "</b>" + (dd.getDate() === 1 || i === 0 ? "<small>" + MN[dd.getMonth()] + "</small>" : "") + "</div>"; }
  const nowL = now >= rs && now < re ? '<i class="nowl" style="left:' + (now - rs) / span * 100 + '%"></i>' : "";
  const rows = DB.cars.map(c => {
    let bars = "";
    DB.bookings.filter(b => b.carId === c.id && b.status !== "batal").forEach(b => {
      const over = ["berjalan", "diambil"].includes(b.status) && now > b.end;
      if (b.end <= rs || b.start >= re) return; const p = pos(b.start, b.end); n++;
      bars += '<button class="bar s-' + b.status + '" style="left:' + p[0] + "%;width:" + p[1] + '%" data-act="open-b" data-id="' + esc(b.id) + '" aria-label="' + esc(b.id + " " + b.name + ", " + STATUS[b.status] + ", " + fST(b.start) + " sampai " + fST(b.end)) + '" title="' + esc(b.name + " · " + fST(b.start) + " sampai " + fST(b.end)) + '"><span>' + esc(firstName(b.name)) + "</span></button>";
      if (over && now > rs && b.end < re) { const q = pos(b.end, Math.min(now, re)); bars += '<i class="bar-late" style="left:' + q[0] + "%;width:" + q[1] + '%" title="Lewat jam kembali"></i>'; }
    });
    DB.maint.filter(m => m.carId === c.id && m.end > rs && m.start < re).forEach(m => { const p = pos(m.start, m.end); bars += '<button class="bar maint" style="left:' + p[0] + "%;width:" + p[1] + '%" data-act="open-m" data-id="' + esc(m.id) + '" aria-label="' + esc("Perawatan " + m.kind + ", " + fST(m.start) + " sampai " + fST(m.end)) + '"><span>' + esc(m.kind) + "</span></button>"; });
    return '<div class="cr"><div class="cn"><b>' + esc(c.name.replace(/^(Toyota|Honda) /, "").replace("Kijang ", "")) + "</b><small>" + esc(c.plate) + (c.active === false ? " · nonaktif" : "") + '</small></div><div class="ct">' + bars + nowL + "</div></div>";
  }).join("");
  return '<h1 class="h2">Kalender armada</h1><div class="ctl cal-c"><button class="btn sm ghost" data-act="cal" data-d="-7">&larr; 7 hari</button><button class="btn sm ghost" data-act="cal" data-d="0">Hari ini</button><button class="btn sm ghost" data-act="cal" data-d="7">7 hari &rarr;</button><label class="sr" for="cal-go">Lompat ke tanggal</label><input type="date" id="cal-go" value="' + ymd(rs) + '" data-ch="calgo"></div><ul class="leg"><li><i class="lg s-dipesan"></i>Dipesan</li><li><i class="lg s-diambil"></i>Diambil</li><li><i class="lg s-berjalan"></i>Berjalan</li><li><i class="lg s-dikembalikan"></i>Dikembalikan</li><li><i class="lg s-selesai"></i>Selesai</li><li><i class="lg maint"></i>Perawatan</li><li><i class="lg late"></i>Lewat jam kembali</li></ul>' +
    '<div class="cal-s" role="group" aria-label="Kalender, geser ke samping untuk melihat tanggal lain"><div class="cal" style="--days:' + COLS + '"><div class="cr ch"><div class="cn">Mobil</div><div class="cds">' + head + '</div></div><div class="cb">' + rows + "</div></div></div><p class=\"muted\">" + n + " booking tampil dalam rentang " + fS(rs) + " sampai " + fS(re - DAY) + ". Klik batang untuk membuka detail. Garis tipis menandai sekarang.</p>";
};
ACTS.cal = el => { const d = +el.dataset.d; CAL.start = d ? addDays(CAL.start, d) : sod(Date.now()) - DAY; route(); };
CHG.calgo = el => { if (el.value) { CAL.start = toMs(el.value, "00:00"); route(); } };
ACTS["open-m"] = el => openMaint(el.dataset.id);

/* ---------- booking: daftar ---------- */
function bkFiltered() {
  const q = BK.q.trim().toLowerCase(); let a = DB.bookings.slice();
  if (BK.st) a = a.filter(b => b.status === BK.st);
  if (q) a = a.filter(b => (b.id + " " + b.name + " " + b.phone + " " + carOf(b).name + " " + carOf(b).plate).toLowerCase().includes(q));
  const k = { start: b => b.start, end: b => b.end, total: b => b.q.total + extra(b), name: b => b.name.toLowerCase(), status: b => Object.keys(STATUS).indexOf(b.status), code: b => b.id }[BK.sort];
  a.sort((x, y) => (k(x) > k(y) ? 1 : k(x) < k(y) ? -1 : 0) * BK.dir);
  return a;
}
TAB.booking = () => {
  const cnt = s => DB.bookings.filter(b => !s || b.status === s).length;
  return '<h1 class="h2">Booking</h1><div class="tools"><div class="fld"><label for="bk-q">Cari kode, nama, HP, atau mobil</label><input id="bk-q" type="search" value="' + esc(BK.q) + '" data-ch="bkq:input" autocomplete="off"></div><div class="fld"><label for="bk-s">Urutkan</label><select id="bk-s" data-ch="bks">' + [["start", "Jam ambil"], ["end", "Jam kembali"], ["total", "Total"], ["name", "Nama"], ["status", "Status"], ["code", "Kode"]].map(o => '<option value="' + o[0] + '"' + (BK.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>").join("") + '</select></div><button class="btn ghost" data-act="bk-dir" id="bk-dir">' + (BK.dir < 0 ? "Terbaru dulu" : "Terlama dulu") + '</button><button class="btn ghost" data-act="bk-csv">Unduh CSV</button></div><div class="chips" role="group" aria-label="Filter status">' + [""].concat(Object.keys(STATUS)).map(s => '<button class="chip' + (BK.st === s ? " on" : "") + '" data-act="bk-st" data-s="' + s + '" aria-pressed="' + (BK.st === s) + '">' + (s ? STATUS[s] : "Semua") + " <small>" + cnt(s) + "</small></button>").join("") + '</div><div id="bk-list"></div>';
};
function bkList() {
  const a = bkFiltered(), pages = Math.max(1, Math.ceil(a.length / PER)); BK.page = Math.min(BK.page, pages);
  const part = a.slice((BK.page - 1) * PER, BK.page * PER), L = $("#bk-list"); if (!L) return;
  L.innerHTML = '<div class="bt" role="list"><div class="bh" aria-hidden="true"><span>Booking</span><span>Mobil</span><span>Jadwal</span><span>Status</span></div>' + (part.length ? part.map(b => '<div role="listitem">' + brow(b) + "</div>").join("") : '<p class="none">Tidak ada booking yang cocok.</p>') + '</div><div class="pg"><button class="btn sm ghost" data-act="bk-pg" data-d="-1"' + (BK.page <= 1 ? " disabled" : "") + '>Sebelumnya</button><span>Halaman ' + BK.page + " dari " + pages + " (" + a.length + ' booking)</span><button class="btn sm ghost" data-act="bk-pg" data-d="1"' + (BK.page >= pages ? " disabled" : "") + ">Berikutnya</button></div>";
}
function afterAdmin(tab) { if (tab === "booking") bkList(); if (tab === "pelanggan") cuList(); }
CHG.bkq = el => { BK.q = el.value; BK.page = 1; bkList(); };
CHG.bks = el => { BK.sort = el.value; bkList(); };
ACTS["bk-dir"] = el => { BK.dir *= -1; el.textContent = BK.dir < 0 ? "Terbaru dulu" : "Terlama dulu"; bkList(); };
ACTS["bk-st"] = el => { BK.st = el.dataset.s; BK.page = 1; $$(".chip").forEach(c => { const on = c.dataset.s === BK.st; c.classList.toggle("on", on); c.setAttribute("aria-pressed", String(on)); }); bkList(); };
ACTS["bk-pg"] = el => { BK.page += +el.dataset.d; bkList(); };
ACTS["bk-csv"] = () => {
  const rows = [["Kode", "Status", "Penyewa", "HP", "Mobil", "Plat contoh", "Ambil", "Kembali", "Durasi jam", "Sopir", "Total sewa", "Denda terlambat", "BBM", "Kerusakan", "Pendapatan"]];
  bkFiltered().forEach(b => { const c = carOf(b); rows.push([b.id, STATUS[b.status], b.name, b.phone, c.name, c.plate, ymd(b.start) + " " + hm(b.start), ymd(b.end) + " " + hm(b.end), b.q.h, b.drv ? "Ya" : "Tidak", b.q.total, b.ret ? b.ret.penalty : 0, b.ret ? b.ret.fuelFee : 0, b.ret ? b.ret.damageFee : 0, revenue(b)]); });
  csvDl("booking-" + ymd(Date.now()) + ".csv", rows);
};

/* ---------- booking: detail dan aksi ---------- */
function openBooking(id) {
  const b = DB.bookings.find(x => x.id === id); if (!b) return;
  const car = carOf(b), now = Date.now(), late = b.status === "berjalan" && now > b.end + S().graceIn * H;
  let act = "";
  if (b.status === "dipesan") act = outForm(b) + cancelForm(b);
  else if (b.status === "diambil" || b.status === "berjalan") act = inForm(b);
  else if (b.status === "dikembalikan") act = finForm(b);
  const ho = b.out ? '<dt>Serah terima</dt><dd>' + fDT(b.out.at) + ", odometer " + b.out.odo.toLocaleString("id-ID") + " km, BBM " + FUEL[b.out.fuel] + "<br>" + esc(b.out.note) + "</dd>" : "";
  const hr = b.ret ? "<dt>Pengembalian</dt><dd>" + fDT(b.ret.at) + ", odometer " + b.ret.odo.toLocaleString("id-ID") + " km, BBM " + FUEL[b.ret.fuel] + "<br>" + esc(b.ret.note) + "</dd>" : "";
  openSheet(sheetHead(esc(car.name), esc(b.id)) + '<div class="sh-b"><p>' + badge(b.status) + (late ? ' <span class="tag bad">Terlambat ' + durTxt(Math.ceil((now - b.end) / H)) + "</span>" : "") + '</p><dl class="kv"><dt>Penyewa</dt><dd>' + esc(b.name) + "<br>" + esc(b.phone) + "</dd><dt>NIK / SIM</dt><dd>" + esc(b.nik) + " / " + (b.simNo ? esc(b.simNo) + " (s.d. " + esc(b.simExp) + ")" : "tanpa SIM, dengan sopir") + "</dd><dt>Jadwal</dt><dd>" + fDT(b.start) + "<br>sampai " + fDT(b.end) + " (" + durTxt(b.q.h) + ")</dd><dt>Plat</dt><dd>" + esc(car.plate) + " (contoh)</dd><dt>Opsi</dt><dd>" + (b.drv ? "Dengan sopir. " : "") + (b.child ? b.child + " kursi anak. " : "") + (b.deliver ? "Antar: " + esc(b.addrD) + ". " : "") + (b.pickup ? "Jemput: " + esc(b.addrP) + "." : "") + (!b.drv && !b.child && !b.deliver && !b.pickup ? "Tanpa tambahan" : "") + "</dd>" + (b.note ? "<dt>Catatan</dt><dd>" + esc(b.note) + "</dd>" : "") + ho + hr + "</dl>" + priceTable(b) + act +
    '<p><a class="btn ghost" href="#/kontrak/' + esc(b.id) + '">Kontrak sewa (cetak)</a></p><h3>Riwayat</h3><ul class="hist">' + b.hist.slice().reverse().map(x => "<li><b>" + STATUS[x.s] + "</b> " + esc(x.n) + "<small>" + fDT(x.t) + "</small></li>").join("") + "</ul></div>");
}
function outForm(b) {
  const car = carOf(b), hrs = (b.start - Date.now()) / H;
  return '<form id="ho" class="panel" data-id="' + esc(b.id) + '" novalidate><h3>Serah terima: unit keluar</h3>' + (hrs > 12 ? '<p class="note">Jam ambil masih ' + durTxt(Math.floor(hrs)) + " lagi. Serah terima dibuka 12 jam sebelum jam ambil.</p>" : "") +
    '<label class="chk"><input type="checkbox" id="ho-c1"> ' + (b.drv ? "KTP penyewa dicek" : "KTP dan SIM A asli dicek, cocok dengan data") + '</label><label class="chk"><input type="checkbox" id="ho-c2"> Sewa ' + rp(b.q.total) + ' lunas diterima</label><label class="chk"><input type="checkbox" id="ho-c3"> Deposit ' + rp(b.q.dep) + ' diterima</label><label class="chk"><input type="checkbox" id="ho-c4"> Kontrak sewa ditandatangani</label><small class="e" id="e-ho-c1" role="alert"></small>' +
    '<div class="two">' + fld("ho-odo", "Odometer keluar (km)", '<input id="ho-odo" type="number" min="0" step="1" value="' + car.odo + '">') + fld("ho-fuel", "BBM keluar", '<select id="ho-fuel">' + fuelOpts(8) + "</select>") + "</div>" + fld("ho-note", "Kondisi mobil saat keluar", '<textarea id="ho-note" rows="2" maxlength="200" placeholder="Contoh: baret halus di pintu kiri, ban baik"></textarea>') + '<button class="btn pri blk" type="submit">Serahkan unit</button></form>';
}
FORMS.ho = f => {
  const b = DB.bookings.find(x => x.id === f.dataset.id), car = carOf(b), now = Date.now(), E = {};
  const odo = numv("ho-odo"), note = $("#ho-note").value.trim();
  if (!$("#ho-c1").checked || !$("#ho-c2").checked || !$("#ho-c3").checked || !$("#ho-c4").checked) E["ho-c1"] = "Centang semua pemeriksaan sebelum menyerahkan unit.";
  if (!isFinite(odo) || odo < car.odo) E["ho-odo"] = "Odometer tidak boleh kurang dari catatan terakhir (" + car.odo.toLocaleString("id-ID") + " km).";
  if (note.length < 4) E["ho-note"] = "Tulis kondisi mobil (minimal 4 karakter), misalnya \"baik, tanpa baret\".";
  if (fieldE(f, E)) return;
  if ((b.start - now) / H > 12) { toast("Terlalu awal: serah terima dibuka 12 jam sebelum jam ambil.", true); return; }
  const busy = DB.bookings.find(x => x.carId === b.carId && x.id !== b.id && ["diambil", "berjalan"].includes(x.status));
  if (busy) { toast("Mobil masih dipakai booking " + busy.id + " dan belum dikembalikan.", true); return; }
  if (DB.maint.some(m => m.carId === b.carId && m.start <= now && now < m.end)) { toast("Mobil sedang dalam perawatan.", true); return; }
  b.out = { at: now, odo, fuel: +$("#ho-fuel").value, note, by: "Admin" }; b.paid = b.q.total; b.depPaid = true; car.odo = odo;
  b.status = b.start <= now ? "berjalan" : "diambil";
  b.hist.push({ t: now, s: b.status, n: "Unit diserahkan, odometer " + odo.toLocaleString("id-ID") + " km, deposit " + rp(b.q.dep) + " diterima" });
  save(); toast("Unit diserahkan. Status: " + STATUS[b.status]); refresh(b.id);
};
function cancelForm(b) {
  const ci = cancelInfo(b), fee = ci.ok ? ci.fee : Math.round(b.q.total * S().cancelPct / 100);
  return '<form id="hc" class="panel" data-id="' + esc(b.id) + '" novalidate><h3>Batalkan booking</h3><p class="muted">' + (ci.ok ? esc(ci.label) : "Kurang dari " + S().cancelPart + " jam sebelum jam ambil. Biaya default " + S().cancelPct + "%, bisa diubah.") + "</p>" + fld("hc-fee", "Biaya pembatalan (Rp)", '<input id="hc-fee" type="number" min="0" step="1000" value="' + fee + '">') + fld("hc-why", "Alasan", '<input id="hc-why" maxlength="100" placeholder="Contoh: pelanggan minta batal">') + '<button class="btn danger blk" type="submit" data-act="hc-go">Batalkan booking</button></form>';
}
ACTS["hc-go"] = (el, e) => { e.preventDefault(); const f = el.form; twoPress(el, "Tekan lagi untuk membatalkan", () => FORMS.hc(f)); };
FORMS.hc = f => {
  const b = DB.bookings.find(x => x.id === f.dataset.id), fee = numv("hc-fee"), why = $("#hc-why").value.trim(), E = {};
  if (b.status !== "dipesan") { toast("Status booking sudah berubah.", true); return; }
  if (!isFinite(fee) || fee < 0) E["hc-fee"] = "Biaya harus angka 0 atau lebih.";
  if (why.length < 3) E["hc-why"] = "Isi alasan pembatalan.";
  if (fieldE(f, E)) return;
  const now = Date.now(); b.status = "batal"; b.cancel = { at: now, fee, why }; b.hist.push({ t: now, s: "batal", n: "Dibatalkan admin" + (fee ? ", biaya " + rp(fee) : ", tanpa biaya") + ". Alasan: " + why });
  save(); toast("Booking dibatalkan"); refresh(b.id);
};
function inForm(b) {
  const now = Date.now(), lp = latePen(b, now), car = carOf(b);
  return '<form id="hi" class="panel" data-id="' + esc(b.id) + '" novalidate><h3>Terima pengembalian</h3><p class="muted">Waktu kembali dicatat sekarang: ' + fDT(now) + (lp.amt ? ". Terlambat " + lp.h + " jam." : ". Tepat waktu.") + '</p><div class="two">' + fld("hi-odo", "Odometer kembali (km)", '<input id="hi-odo" type="number" min="0" step="1" value="' + (b.out.odo + 0) + '" data-ch="hin">') + fld("hi-fuel", "BBM kembali", '<select id="hi-fuel" data-ch="hin">' + fuelOpts(b.out.fuel) + "</select>") + "</div>" + fld("hi-note", "Kondisi mobil saat kembali", '<textarea id="hi-note" rows="2" maxlength="200" placeholder="Contoh: kondisi baik, tidak ada kerusakan baru"></textarea>') +
    '<label class="chk"><input type="checkbox" id="hi-dmg" data-ch="hin"> Ada kerusakan baru</label><div id="hi-dd" hidden>' + fld("hi-dfee", "Biaya kerusakan (Rp)", '<input id="hi-dfee" type="number" min="0" step="1000" value="0" data-ch="hin">') + fld("hi-dnote", "Deskripsi kerusakan", '<input id="hi-dnote" maxlength="120">') + "</div>" + fld("hi-pen", "Denda keterlambatan (Rp, ubah ke 0 untuk membebaskan)", '<input id="hi-pen" type="number" min="0" step="1000" value="' + lp.amt + '" data-ch="hin">') + '<div id="hi-sum" class="sumbox" aria-live="polite"></div><button class="btn pri blk" type="submit">Terima pengembalian</button></form>';
}
function hinCalc(b) {
  const fuelIn = +$("#hi-fuel").value, ff = Math.max(0, b.out.fuel - fuelIn) * S().fuel8, pen = Math.max(0, numv("hi-pen") || 0), dmg = $("#hi-dmg").checked ? Math.max(0, numv("hi-dfee") || 0) : 0, tot = ff + pen + dmg;
  return { ff, pen, dmg, tot };
}
CHG.hin = () => {
  const f = $("#hi"); if (!f) return; const b = DB.bookings.find(x => x.id === f.dataset.id), c = hinCalc(b);
  $("#hi-dd").hidden = !$("#hi-dmg").checked;
  $("#hi-sum").innerHTML = "BBM kurang: " + rp(c.ff) + "<br>Denda: " + rp(c.pen) + "<br>Kerusakan: " + rp(c.dmg) + "<br><b>Biaya tambahan: " + rp(c.tot) + "</b><br>Deposit " + rp(b.q.dep) + ": " + (c.tot <= b.q.dep ? "dikembalikan " + rp(b.q.dep - c.tot) : "kurang, penyewa membayar " + rp(c.tot - b.q.dep));
};
FORMS.hi = f => {
  const b = DB.bookings.find(x => x.id === f.dataset.id), car = carOf(b), now = Date.now(), E = {}, odo = numv("hi-odo"), note = $("#hi-note").value.trim(), dm = $("#hi-dmg").checked;
  if (!isFinite(odo) || odo < b.out.odo) E["hi-odo"] = "Odometer kembali tidak boleh kurang dari odometer keluar (" + b.out.odo.toLocaleString("id-ID") + " km).";
  else if (odo - b.out.odo > 5000) E["hi-odo"] = "Selisih " + (odo - b.out.odo).toLocaleString("id-ID") + " km tidak wajar. Periksa angkanya.";
  if (note.length < 4) E["hi-note"] = "Tulis kondisi mobil saat kembali (minimal 4 karakter).";
  const pen = numv("hi-pen"); if (!isFinite(pen) || pen < 0) E["hi-pen"] = "Denda harus angka 0 atau lebih.";
  if (dm) { const d = numv("hi-dfee"); if (!isFinite(d) || d <= 0) E["hi-dfee"] = "Isi biaya kerusakan lebih dari 0."; if ($("#hi-dnote").value.trim().length < 3) E["hi-dnote"] = "Jelaskan kerusakannya."; }
  if (fieldE(f, E)) return;
  const c = hinCalc(b), dn = dm ? $("#hi-dnote").value.trim() : "";
  b.ret = { at: now, odo, fuel: +$("#hi-fuel").value, note: note + (dm ? ". Kerusakan: " + dn : ""), penalty: c.pen, fuelFee: c.ff, damageFee: c.dmg, by: "Admin" };
  b.status = "dikembalikan"; car.odo = Math.max(car.odo, odo);
  b.hist.push({ t: now, s: "dikembalikan", n: "Unit dikembalikan, " + (odo - b.out.odo).toLocaleString("id-ID") + " km ditempuh" + (c.tot ? ", biaya tambahan " + rp(c.tot) : "") });
  save(); toast("Pengembalian dicatat"); refresh(b.id);
};
function finForm(b) {
  const ch = extra(b), dep = b.q.dep, refund = Math.max(0, dep - ch), due = Math.max(0, ch - dep);
  return '<form id="hf" class="panel" data-id="' + esc(b.id) + '"><h3>Selesaikan booking</h3><dl class="kv"><dt>Biaya tambahan</dt><dd>' + rp(ch) + "</dd><dt>Deposit ditahan</dt><dd>" + rp(dep) + "</dd><dt>" + (due ? "Kekurangan dibayar penyewa" : "Deposit dikembalikan") + "</dt><dd><b>" + rp(due || refund) + '</b></dd></dl><div class="fld"><label for="hf-m">Metode</label><select id="hf-m"><option>Tunai</option><option>Transfer</option></select></div><button class="btn pri blk" type="submit">Tandai selesai</button></form>';
}
FORMS.hf = f => {
  const b = DB.bookings.find(x => x.id === f.dataset.id), ch = extra(b), now = Date.now();
  b.settle = { at: now, refund: Math.max(0, b.q.dep - ch), due: Math.max(0, ch - b.q.dep), method: $("#hf-m").value }; b.status = "selesai";
  b.hist.push({ t: now, s: "selesai", n: (b.settle.due ? "Kekurangan " + rp(b.settle.due) + " dibayar" : "Deposit " + rp(b.settle.refund) + " dikembalikan") + " (" + b.settle.method + ")" });
  save(); toast("Booking selesai"); refresh(b.id);
};

/* ---------- armada ---------- */
TAB.armada = () => '<div class="h-r"><h1 class="h2">Armada dan harga</h1><button class="btn pri" data-act="car-new">' + IC.plus + " Tambah mobil</button></div><div class=\"rows\">" + DB.cars.map(c => {
  const s = carState(c), has = DB.bookings.some(b => b.carId === c.id);
  return '<article class="rw"><img src="' + esc(c.img) + '" alt="' + esc(c.alt) + '" width="120" height="75" loading="lazy"><div class="rw-m"><h2>' + esc(c.name) + " " + stTag(s) + "</h2><p>" + esc(c.plate) + " (contoh) · " + TYPES[c.type] + " · " + (c.trans === "AT" ? "Matic" : "Manual") + " · " + c.seats + " kursi · " + esc(c.fuel) + " · " + c.odo.toLocaleString("id-ID") + ' km</p><p><b>' + rp(c.p24) + "</b> / hari · <b>" + rp(c.p12) + "</b> / 12 jam · deposit " + rp(c.dep) + (c.drv === "only" ? " · wajib sopir" : "") + '</p></div><div class="rw-a"><button class="btn sm ghost" data-act="car-edit" data-id="' + c.id + '">Edit</button><button class="btn sm ghost" data-act="car-tog" data-id="' + c.id + '">' + (c.active === false ? "Aktifkan" : "Nonaktifkan") + '</button><button class="btn sm danger" data-act="car-del" data-id="' + c.id + '"' + (has ? ' title="Punya riwayat booking"' : "") + ">Hapus</button></div></article>";
}).join("") + "</div>";
function carForm(c) {
  const n = !c; c = c || { name: "", type: "mpv", trans: "AT", seats: 7, bags: 2, fuel: "Bensin", year: new Date().getFullYear() - 2, plate: "", p24: 500000, p12: 330000, dep: 1000000, drv: "opt", odo: 0, img: CAR_IMGS[0][0] };
  const sel = (id, o, v) => '<select id="' + id + '">' + o.map(x => '<option value="' + x[0] + '"' + (String(x[0]) === String(v) ? " selected" : "") + ">" + x[1] + "</option>").join("") + "</select>";
  openSheet(sheetHead(n ? "Tambah mobil" : "Edit " + esc(c.name)) + '<form id="cf" class="sh-b" data-id="' + (n ? "" : c.id) + '" novalidate>' + fld("cf-name", "Nama mobil", '<input id="cf-name" maxlength="50" value="' + esc(c.name) + '">') + '<div class="two">' + fld("cf-type", "Tipe", sel("cf-type", Object.entries(TYPES), c.type)) + fld("cf-trans", "Transmisi", sel("cf-trans", [["AT", "Matic"], ["MT", "Manual"]], c.trans)) + "</div><div class=\"two\">" + fld("cf-seats", "Kursi", '<input id="cf-seats" type="number" min="2" max="16" value="' + c.seats + '">') + fld("cf-bags", "Bagasi (koper)", '<input id="cf-bags" type="number" min="0" max="10" value="' + c.bags + '">') + '</div><div class="two">' + fld("cf-fuel", "BBM", sel("cf-fuel", [["Bensin", "Bensin"], ["Solar", "Solar"], ["Listrik", "Listrik"]], c.fuel)) + fld("cf-year", "Tahun", '<input id="cf-year" type="number" min="2000" max="2035" value="' + c.year + '">') + "</div>" +
    fld("cf-plate", "Plat nomor (contoh)", '<input id="cf-plate" maxlength="14" value="' + esc(c.plate) + '">') + '<div class="two">' + fld("cf-p24", "Harga per hari (Rp)", '<input id="cf-p24" type="number" min="0" step="10000" value="' + c.p24 + '">') + fld("cf-p12", "Harga 12 jam (Rp)", '<input id="cf-p12" type="number" min="0" step="10000" value="' + c.p12 + '">') + '</div><div class="two">' + fld("cf-dep", "Deposit (Rp)", '<input id="cf-dep" type="number" min="0" step="50000" value="' + c.dep + '">') + fld("cf-odo", "Odometer (km)", '<input id="cf-odo" type="number" min="0" value="' + c.odo + '">') + "</div>" +
    fld("cf-drv", "Sopir", sel("cf-drv", [["opt", "Opsional"], ["only", "Wajib dengan sopir"]], c.drv)) + fld("cf-img", "Foto", sel("cf-img", CAR_IMGS, c.img)) + '<p class="muted">Perubahan harga berlaku untuk booking baru. Booking yang sudah ada tidak berubah.</p><button class="btn pri blk" type="submit">Simpan</button></form>');
}
ACTS["car-new"] = () => carForm(null);
ACTS["car-edit"] = el => carForm(DB.cars.find(c => c.id === el.dataset.id));
FORMS.cf = f => {
  const id = f.dataset.id, E = {}, v = k => $("#cf-" + k).value.trim(), nm = k => numv("cf-" + k);
  if (v("name").length < 3) E["cf-name"] = "Isi nama mobil (minimal 3 karakter).";
  else if (DB.cars.some(c => c.id !== id && c.name.toLowerCase() === v("name").toLowerCase())) E["cf-name"] = "Nama sudah dipakai mobil lain.";
  if (!(nm("seats") >= 2)) E["cf-seats"] = "Minimal 2 kursi.";
  if (!(nm("bags") >= 0)) E["cf-bags"] = "Isi angka 0 atau lebih.";
  if (!(nm("year") >= 2000)) E["cf-year"] = "Tahun tidak valid.";
  if (v("plate").length < 4) E["cf-plate"] = "Isi plat nomor contoh.";
  else if (DB.cars.some(c => c.id !== id && c.plate.toLowerCase() === v("plate").toLowerCase())) E["cf-plate"] = "Plat sudah dipakai mobil lain.";
  if (!(nm("p24") > 0)) E["cf-p24"] = "Harga harian harus lebih dari 0.";
  if (!(nm("p12") > 0)) E["cf-p12"] = "Harga 12 jam harus lebih dari 0."; else if (nm("p12") >= nm("p24")) E["cf-p12"] = "Harga 12 jam harus lebih kecil dari harga harian.";
  if (!(nm("dep") >= 0)) E["cf-dep"] = "Isi deposit 0 atau lebih.";
  if (!(nm("odo") >= 0)) E["cf-odo"] = "Isi odometer 0 atau lebih.";
  if (fieldE(f, E)) return;
  const img = CAR_IMGS.find(x => x[0] === v("img")) || CAR_IMGS[0];
  const d = { name: v("name"), type: v("type"), trans: v("trans"), seats: nm("seats"), bags: nm("bags"), fuel: v("fuel"), year: nm("year"), plate: v("plate").toUpperCase(), p24: nm("p24"), p12: nm("p12"), dep: nm("dep"), odo: nm("odo"), drv: v("drv"), img: img[0], alt: "Foto " + v("name") };
  if (id) { const c = DB.cars.find(x => x.id === id); const hasRun = DB.bookings.some(b => b.carId === id && ["diambil", "berjalan"].includes(b.status)); if (hasRun && d.odo < c.odo) { fieldE(f, { "cf-odo": "Mobil sedang disewa, odometer tidak boleh turun." }); return; } Object.assign(c, d); toast("Mobil diperbarui"); }
  else { DB.cars.push(Object.assign({ id: "c" + Date.now().toString(36), active: true, about: "Unit ditambahkan dari panel rental.", spec: ["AC", "Audio", "Kondisi diperiksa sebelum disewakan"] }, d)); toast("Mobil ditambahkan"); }
  save(); closeSheet(); route();
};
ACTS["car-tog"] = el => {
  const c = DB.cars.find(x => x.id === el.dataset.id);
  if (c.active !== false && DB.bookings.some(b => b.carId === c.id && ["dipesan", "diambil", "berjalan"].includes(b.status))) { toast(c.name + " masih punya booking aktif. Selesaikan atau batalkan dulu.", true); return; }
  c.active = c.active === false; save(); toast(c.name + (c.active ? " diaktifkan" : " dinonaktifkan")); route();
};
ACTS["car-del"] = el => {
  const c = DB.cars.find(x => x.id === el.dataset.id);
  if (DB.bookings.some(b => b.carId === c.id) || DB.maint.some(m => m.carId === c.id)) { toast("Punya riwayat booking atau perawatan. Nonaktifkan saja.", true); return; }
  twoPress(el, "Tekan lagi untuk hapus", () => { DB.cars = DB.cars.filter(x => x.id !== c.id); save(); toast("Mobil dihapus"); route(); });
};

/* ---------- perawatan ---------- */
const MKINDS = ["Servis berkala", "Ganti ban", "Perbaikan", "Cuci dan detailing", "Uji KIR dan pajak"];
TAB.perawatan = () => {
  const now = Date.now(), a = DB.maint.slice().sort((x, y) => y.start - x.start);
  return '<div class="h-r"><h1 class="h2">Perawatan terjadwal</h1><button class="btn pri" data-act="m-new">' + IC.plus + ' Jadwalkan</button></div><p class="muted">Mobil yang sedang dirawat tidak muncul sebagai tersedia di pencarian pelanggan.</p><div class="rows">' + (a.length ? a.map(m => { const c = DB.cars.find(x => x.id === m.carId), s = m.end <= now ? ["Selesai", "ok"] : m.start <= now ? ["Berlangsung", "bad"] : ["Terjadwal", "info"]; return '<article class="rw"><div class="rw-m"><h2>' + esc(m.kind) + " · " + esc(c ? c.name : "Mobil dihapus") + ' <span class="tag ' + s[1] + '">' + s[0] + "</span></h2><p>" + fST(m.start) + " sampai " + fST(m.end) + (m.cost ? " · biaya " + rp(m.cost) : "") + "</p><p>" + esc(m.note) + '</p></div><div class="rw-a"><button class="btn sm ghost" data-act="open-m" data-id="' + esc(m.id) + '">Edit</button><button class="btn sm danger" data-act="m-del" data-id="' + esc(m.id) + '">Hapus</button></div></article>'; }).join("") : '<p class="none">Belum ada jadwal perawatan.</p>') + "</div>";
};
ACTS["m-new"] = () => openMaint(null);
function openMaint(id) {
  const m = DB.maint.find(x => x.id === id), n = !m, t = sod(Date.now()) + DAY;
  const d = m || { carId: DB.cars[0].id, kind: MKINDS[0], start: t + 8 * H, end: t + 17 * H, note: "", cost: 0 };
  const sel = '<select id="mf-car">' + DB.cars.map(c => '<option value="' + c.id + '"' + (c.id === d.carId ? " selected" : "") + ">" + esc(c.name) + "</option>").join("") + "</select>";
  openSheet(sheetHead(n ? "Jadwalkan perawatan" : "Edit perawatan") + '<form id="mf" class="sh-b" data-id="' + (n ? "" : esc(m.id)) + '" novalidate>' + fld("mf-car", "Mobil", sel) + fld("mf-kind", "Jenis", '<select id="mf-kind">' + MKINDS.map(k => "<option" + (k === d.kind ? " selected" : "") + ">" + k + "</option>").join("") + "</select>") + '<div class="two">' + fld("mf-sd", "Tanggal mulai", '<input id="mf-sd" type="date" value="' + ymd(d.start) + '">') + fld("mf-st", "Jam mulai", '<input id="mf-st" type="time" value="' + hm(d.start) + '">') + '</div><div class="two">' + fld("mf-ed", "Tanggal selesai", '<input id="mf-ed" type="date" value="' + ymd(d.end) + '">') + fld("mf-et", "Jam selesai", '<input id="mf-et" type="time" value="' + hm(d.end) + '">') + "</div>" + fld("mf-cost", "Biaya (Rp, opsional)", '<input id="mf-cost" type="number" min="0" step="1000" value="' + (d.cost || 0) + '">') + fld("mf-note", "Catatan", '<textarea id="mf-note" rows="2" maxlength="160">' + esc(d.note) + '</textarea>') + '<button class="btn pri blk" type="submit">Simpan</button></form>');
}
FORMS.mf = f => {
  const id = f.dataset.id, E = {}, carId = $("#mf-car").value, S0 = $("#mf-sd").value, E0 = $("#mf-ed").value;
  if (!S0) E["mf-sd"] = "Isi tanggal mulai."; if (!E0) E["mf-ed"] = "Isi tanggal selesai.";
  if (!$("#mf-st").value) E["mf-st"] = "Isi jam mulai."; if (!$("#mf-et").value) E["mf-et"] = "Isi jam selesai.";
  const cost = numv("mf-cost"); if (!(cost >= 0)) E["mf-cost"] = "Biaya harus 0 atau lebih.";
  let s, e; if (!Object.keys(E).length) { s = toMs(S0, $("#mf-st").value); e = toMs(E0, $("#mf-et").value); if (e <= s) E["mf-ed"] = "Waktu selesai harus setelah waktu mulai."; }
  if ($("#mf-note").value.trim().length < 3) E["mf-note"] = "Isi catatan singkat.";
  if (!Object.keys(E).length) {
    const bb = DB.bookings.find(b => b.carId === carId && ACTIVE.includes(b.status) && s < (b.status === "dipesan" ? b.end : Math.max(b.end, Date.now())) + S().buffer * H && e > b.start);
    if (bb) E["mf-sd"] = "Bentrok dengan booking " + bb.id + " (" + fST(bb.start) + " sampai " + fST(bb.end) + "). Batalkan atau pilih waktu lain.";
    const mm = DB.maint.find(x => x.id !== id && x.carId === carId && s < x.end && e > x.start); if (mm) E["mf-sd"] = "Bentrok dengan perawatan lain (" + mm.kind + ", " + fST(mm.start) + ").";
  }
  if (fieldE(f, E)) return;
  const d = { carId, kind: $("#mf-kind").value, start: s, end: e, note: $("#mf-note").value.trim(), cost };
  if (id) Object.assign(DB.maint.find(x => x.id === id), d); else DB.maint.push(Object.assign({ id: "m" + Date.now().toString(36) }, d));
  save(); closeSheet(); toast("Perawatan disimpan"); route();
};
ACTS["m-del"] = el => twoPress(el, "Tekan lagi untuk hapus", () => { DB.maint = DB.maint.filter(m => m.id !== el.dataset.id); save(); toast("Jadwal perawatan dihapus"); route(); });

/* ---------- pelanggan ---------- */
function customers() {
  const map = {};
  DB.bookings.forEach(b => { const k = b.phone.replace(/\D/g, ""); const c = map[k] || (map[k] = { name: b.name, phone: b.phone, n: 0, total: 0, last: 0, sim: b.simNo }); if (b.status !== "batal") c.n++; c.total += revenue(b); c.last = Math.max(c.last, b.start); });
  return Object.values(map).sort((a, b) => b.last - a.last);
}
TAB.pelanggan = () => '<div class="h-r"><h1 class="h2">Pelanggan</h1><button class="btn ghost" data-act="cu-csv">Unduh CSV</button></div><div class="fld tools1"><label for="cu-q">Cari nama atau HP</label><input id="cu-q" type="search" value="' + esc(CU.q) + '" data-ch="cuq:input" autocomplete="off"></div><div id="cu-list"></div>';
function cuList() {
  const q = CU.q.trim().toLowerCase(), a = customers().filter(c => !q || (c.name + " " + c.phone).toLowerCase().includes(q)), L = $("#cu-list"); if (!L) return;
  L.innerHTML = a.length ? '<div class="bt cu" role="list"><div class="bh" aria-hidden="true"><span>Pelanggan</span><span>Sewa</span><span>Total belanja</span><span>Terakhir</span></div>' + a.map(c => '<div role="listitem"><button class="brow" data-act="cu-go" data-p="' + esc(c.phone) + '"><span class="b1"><b>' + esc(c.name) + "</b> " + esc(c.phone) + '</span><span class="b2">' + c.n + ' kali</span><span class="b3">' + rp(c.total) + '</span><span class="b4">' + fS(c.last) + "</span></button></div>").join("") + "</div>" : '<p class="none">Tidak ada pelanggan yang cocok.</p>';
}
CHG.cuq = el => { CU.q = el.value; cuList(); };
ACTS["cu-go"] = el => { BK = Object.assign(BK, { q: el.dataset.p, st: "", page: 1 }); location.hash = "#/admin/booking"; };
ACTS["cu-csv"] = () => csvDl("pelanggan-" + ymd(Date.now()) + ".csv", [["Nama", "HP", "Jumlah sewa", "Total belanja", "Sewa terakhir"]].concat(customers().map(c => [c.name, c.phone, c.n, c.total, ymd(c.last)])));

/* ---------- laporan ---------- */
function report() {
  const f = toMs(RP.from, "00:00"), t = toMs(RP.to, "00:00") + DAY, now = Date.now(), span = Math.max(1, (Math.min(t, now) - f) / H);
  const rows = DB.cars.map(c => {
    const bs = DB.bookings.filter(b => b.carId === c.id && revenue(b) > 0 && revAt(b) >= f && revAt(b) < t && b.status !== "batal");
    const sewa = bs.reduce((a, b) => a + b.q.base - b.q.disc, 0), sopir = bs.reduce((a, b) => a + b.q.driverAmt, 0), tam = bs.reduce((a, b) => a + b.q.total - (b.q.base - b.q.disc) - b.q.driverAmt, 0), den = bs.reduce((a, b) => a + extra(b), 0);
    const cb = DB.bookings.filter(b => b.carId === c.id && b.status === "batal" && b.cancel && b.cancel.at >= f && b.cancel.at < t).reduce((a, b) => a + b.cancel.fee, 0);
    const used = DB.bookings.filter(b => b.carId === c.id && ["berjalan", "dikembalikan", "selesai"].includes(b.status)).reduce((a, b) => { const s = Math.max(b.start, f), e = Math.min(b.ret ? b.ret.at : Math.min(b.end, now), t, now); return a + Math.max(0, e - s) / H; }, 0);
    return { c, n: bs.length, days: bs.reduce((a, b) => a + b.q.h / 24, 0), sewa, sopir, tam, den, cb, total: sewa + sopir + tam + den + cb, util: Math.min(100, used / span * 100) };
  });
  return rows;
}
TAB.laporan = () => {
  if (!RP.from) { RP.to = ymd(Date.now()); RP.from = ymd(addDays(Date.now(), -29)); }
  const R = report().sort((a, b) => b.total - a.total), tot = R.reduce((a, r) => a + r.total, 0), mx = Math.max(1, R[0] ? R[0].total : 1), nb = R.reduce((a, r) => a + r.n, 0), den = R.reduce((a, r) => a + r.den, 0), ut = R.reduce((a, r) => a + r.util, 0) / Math.max(1, R.length);
  return '<div class="h-r"><h1 class="h2">Laporan pendapatan</h1><button class="btn ghost" data-act="rp-csv">Unduh CSV</button></div><div class="tools"><div class="fld"><label for="rp-f">Dari</label><input id="rp-f" type="date" value="' + RP.from + '" data-ch="rp"></div><div class="fld"><label for="rp-t">Sampai</label><input id="rp-t" type="date" value="' + RP.to + '" data-ch="rp"></div></div><p class="err" id="rp-err" role="alert"></p>' +
    '<div class="stats"><div><small>Total pendapatan</small><b class="sm">' + rp(tot) + "</b></div><div><small>Booking selesai</small><b>" + nb + '</b></div><div><small>Rata-rata per booking</small><b class="sm">' + rp(nb ? tot / nb : 0) + "</b></div><div><small>Denda, BBM, kerusakan</small><b class=\"sm\">" + rp(den) + "</b></div><div><small>Utilisasi armada</small><b>" + ut.toFixed(0) + '%</b></div></div><section class="card"><h2>Pendapatan per mobil</h2><ul class="hb">' + R.map(r => '<li><span class="hb-n">' + esc(r.c.name) + '</span><span class="hb-b" role="img" aria-label="' + esc(r.c.name + " " + rp(r.total)) + '"><i style="width:' + (r.total / mx * 100).toFixed(1) + '%"></i></span><b>' + rp(r.total) + "</b></li>").join("") + '</ul></section><section class="card"><h2>Rincian</h2><div class="tbs"><table class="tb rt"><thead><tr><th scope="col">Mobil</th><th scope="col">Sewa</th><th scope="col">Hari</th><th scope="col">Biaya sewa</th><th scope="col">Sopir</th><th scope="col">Tambahan</th><th scope="col">Denda dll</th><th scope="col">Batal</th><th scope="col">Total</th><th scope="col">Utilisasi</th></tr></thead><tbody>' + R.map(r => "<tr><th scope=\"row\">" + esc(r.c.name) + "</th><td>" + r.n + "</td><td>" + r.days.toFixed(1) + "</td><td>" + rp(r.sewa) + "</td><td>" + rp(r.sopir) + "</td><td>" + rp(r.tam) + "</td><td>" + rp(r.den) + "</td><td>" + rp(r.cb) + "</td><td><b>" + rp(r.total) + "</b></td><td>" + r.util.toFixed(0) + "%</td></tr>").join("") + '</tbody><tfoot><tr><th scope="row">Total</th><td>' + nb + "</td><td>" + R.reduce((a, r) => a + r.days, 0).toFixed(1) + "</td><td>" + rp(R.reduce((a, r) => a + r.sewa, 0)) + "</td><td>" + rp(R.reduce((a, r) => a + r.sopir, 0)) + "</td><td>" + rp(R.reduce((a, r) => a + r.tam, 0)) + "</td><td>" + rp(den) + "</td><td>" + rp(R.reduce((a, r) => a + r.cb, 0)) + "</td><td>" + rp(tot) + "</td><td>" + ut.toFixed(0) + '%</td></tr></tfoot></table></div><p class="muted">Pendapatan dihitung saat mobil dikembalikan (sewa, sopir, tambahan, denda) dan saat pembatalan berbiaya. Deposit tidak dihitung. Booking batal tanpa biaya tidak masuk.</p></section>';
};
CHG.rp = () => {
  const f = $("#rp-f").value, t = $("#rp-t").value;
  if (!f || !t) { $("#rp-err").textContent = "Isi kedua tanggal."; return; }
  if (f > t) { $("#rp-err").textContent = "Tanggal mulai tidak boleh setelah tanggal akhir."; return; }
  RP.from = f; RP.to = t; route();
};
ACTS["rp-csv"] = () => csvDl("laporan-" + RP.from + "-" + RP.to + ".csv", [["Mobil", "Plat contoh", "Jumlah sewa", "Hari sewa", "Biaya sewa", "Sopir", "Tambahan", "Denda BBM kerusakan", "Biaya batal", "Total", "Utilisasi %"]].concat(report().map(r => [r.c.name, r.c.plate, r.n, r.days.toFixed(1), r.sewa, r.sopir, r.tam, r.den, r.cb, r.total, r.util.toFixed(0)])));

/* ---------- pengaturan ---------- */
const SFIELDS = [["Tarif", [["driverDay", "Sopir per hari (Rp)", 0], ["driver12", "Sopir per 12 jam (Rp)", 0], ["child", "Kursi anak per hari (Rp)", 0], ["deliver", "Antar atau jemput per arah (Rp)", 0], ["fuel8", "Kekurangan BBM per 1/8 tangki (Rp)", 0], ["depositDriverPct", "Deposit dengan sopir (% dari deposit mobil)", 0]]], ["Waktu", [["open", "Jam buka (0 sampai 23)", 0], ["close", "Jam tutup (1 sampai 24)", 1], ["lead", "Pesan minimal berapa jam sebelum ambil", 0], ["minHours", "Durasi minimal (jam)", 1], ["maxDays", "Durasi maksimal (hari)", 1], ["buffer", "Jeda antar sewa (jam)", 0], ["graceOut", "Toleransi kelebihan jam per 24 jam", 0], ["graceIn", "Toleransi keterlambatan (jam)", 0], ["overPct", "Biaya kelebihan jam (% harga harian per jam)", 1]]], ["Diskon durasi (%)", [["disc3", "3 hari atau lebih", 0], ["disc7", "7 hari atau lebih", 0], ["disc14", "14 hari atau lebih", 0]]], ["Ubah dan batal", [["changeMin", "Ubah jadwal, jam sebelum ambil", 0], ["cancelFree", "Batal gratis, jam sebelum ambil", 0], ["cancelPart", "Batas batal online, jam sebelum ambil", 0], ["cancelPct", "Biaya batal (%)", 0]]]];
TAB.pengaturan = () => '<h1 class="h2">Pengaturan</h1><form id="sf2" class="card" novalidate>' + SFIELDS.map(g => "<fieldset><legend>" + g[0] + '</legend><div class="g2">' + g[1].map(f => fld("s-" + f[0], f[1], '<input id="s-' + f[0] + '" type="number" min="' + f[2] + '" step="1" value="' + S()[f[0]] + '">')).join("") + "</div></fieldset>").join("") + '<p class="muted">Perubahan berlaku untuk booking baru dan perhitungan berikutnya. Total booking yang sudah dibuat tidak berubah.</p><button class="btn pri" type="submit">Simpan pengaturan</button></form><section class="card"><h2>Data demo</h2><p class="muted">Mengembalikan semua data (armada, booking, perawatan, pengaturan) ke kondisi awal.</p><button class="btn danger" data-act="reset-demo">Reset data demo</button></section>';
FORMS.sf2 = f => {
  const E = {}, v = {}; SFIELDS.forEach(g => g[1].forEach(x => { const n = numv("s-" + x[0]); v[x[0]] = n; if (!isFinite(n) || n < x[2] || n !== Math.floor(n)) E["s-" + x[0]] = "Isi bilangan bulat " + x[2] + " atau lebih."; }));
  if (!E["s-open"] && v.open > 23) E["s-open"] = "Maksimal 23.";
  if (!E["s-close"] && !E["s-open"] && v.close <= v.open) E["s-close"] = "Jam tutup harus setelah jam buka.";
  if (!E["s-close"] && v.close > 24) E["s-close"] = "Maksimal 24.";
  if (!E["s-driver12"] && !E["s-driverDay"] && v.driver12 >= v.driverDay) E["s-driver12"] = "Harus lebih kecil dari tarif sopir per hari.";
  if (!E["s-cancelPart"] && !E["s-cancelFree"] && v.cancelPart >= v.cancelFree) E["s-cancelPart"] = "Harus lebih kecil dari batas batal gratis.";
  if (!E["s-disc3"] && (v.disc3 > 50 || v.disc7 > 50 || v.disc14 > 50)) E["s-disc3"] = "Diskon maksimal 50%.";
  if (!E["s-overPct"] && v.overPct > 100) E["s-overPct"] = "Maksimal 100%.";
  if (!E["s-cancelPct"] && v.cancelPct > 100) E["s-cancelPct"] = "Maksimal 100%.";
  if (!E["s-depositDriverPct"] && v.depositDriverPct > 100) E["s-depositDriverPct"] = "Maksimal 100%.";
  if (fieldE(f, E)) return;
  Object.assign(DB.settings, v); save(); toast("Pengaturan disimpan");
};
