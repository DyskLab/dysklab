"use strict";
/* Bengkel Roda Sigap: demo fiktif. Semua data di localStorage, tanpa server. */
var KEY = "bengkel-servis.v1", PIN = "1234", AUTHKEY = "bengkel-servis.admin";
var SHOP = { name: "Bengkel Roda Sigap", addr: "Jl. Contoh Raya No. 12, Kota Contoh", tel: "0812-0000-0100", wa: "6281200000100" };
var STATUS = { menunggu: "Menunggu", dikerjakan: "Dikerjakan", suku_cadang: "Menunggu suku cadang", selesai: "Selesai", diambil: "Diambil" };
var FLOW = ["menunggu", "dikerjakan", "suku_cadang", "selesai", "diambil"];
var METHODS = ["Tunai", "Transfer", "QRIS"];
var DN = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], DS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
var MN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
var BRANDS = { motor: ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Vespa"], mobil: ["Toyota", "Daihatsu", "Honda", "Suzuki", "Mitsubishi", "Nissan", "Wuling"] };
var DB, S = { svcFilter: "semua", bk: {}, ver: null, boardTab: "semua", woQ: "", woSt: "semua", cQ: "", repR: "30", menu: false };

/* ---------- util ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function rp(n) { n = Math.round(n || 0); return (n < 0 ? "-" : "") + "Rp" + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function num(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s) { var a = s.split("-"); return new Date(+a[0], +a[1] - 1, +a[2]); }
function addD(s, n) { var d = pd(s); d.setDate(d.getDate() + n); return ymd(d); }
function addM(s, n) { var d = pd(s); d.setMonth(d.getMonth() + n); return ymd(d); }
function today() { return ymd(new Date()); }
function diffD(a, b) { return Math.round((pd(a) - pd(b)) / 864e5); }
function fd(s) { if (!s) return "-"; var d = pd(s); return DS[d.getDay()] + ", " + d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear(); }
function fds(s) { if (!s) return "-"; var d = pd(s); return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear(); }
function nowTs() { var d = new Date(); return ymd(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function fts(t) { return t ? fds(t.slice(0, 10)) + ", " + t.slice(11, 16) : "-"; }
function mm(t) { var a = t.split(":"); return +a[0] * 60 + +a[1]; }
function hm(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
function nid() { return ++DB.seq.id; }
function normPlate(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function fmtPlate(s) { var n = normPlate(s), m = /^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/.exec(n); return m ? (m[1] + " " + m[2] + (m[3] ? " " + m[3] : "")) : n; }
function normPhone(s) { var d = String(s || "").replace(/\D/g, ""); if (d.indexOf("62") === 0) d = "0" + d.slice(2); return d; }
function okPhone(s) { return /^0\d{8,13}$/.test(normPhone(s)); }
function fPhone(s) { var d = normPhone(s); return d.length > 8 ? d.slice(0, 4) + "-" + d.slice(4, 8) + "-" + d.slice(8) : d; }
function waNum(s) { return "62" + normPhone(s).slice(1); }
function byId(arr, id) { id = +id; for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
function plateHTML(p) { return '<span class="plate">' + esc(p) + "</span>"; }
function badge(t, c) { return '<span class="badge ' + (c || "") + '">' + esc(t) + "</span>"; }
var toastT;
function toast(msg, err) { var t = $("#toast"); t.textContent = msg; t.className = "show" + (err ? " err" : ""); clearTimeout(toastT); toastT = setTimeout(function () { t.className = ""; }, 3200); }
function csvDown(name, rows) {
  var t = "﻿" + rows.map(function (r) { return r.map(function (c) { if (c == null) c = ""; if (typeof c === "string" && /^[=+\-@\t\r]/.test(c)) c = "'" + c; c = String(c); return /[",;\n\r]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\r\n");
  var a = document.createElement("a"), u = URL.createObjectURL(new Blob([t], { type: "text/csv;charset=utf-8" }));
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 500);
  toast("File " + name + " diunduh");
}
function stLabel(s) { return STATUS[s] || s; }
function stClass(s) { return { menunggu: "warn", dikerjakan: "info", suku_cadang: "bad", selesai: "ok", diambil: "" }[s] || ""; }

/* ---------- data ---------- */
function load() {
  try { var raw = localStorage.getItem(KEY); if (raw) { var d = JSON.parse(raw); if (d && d.seq && d.svcs) return d; } } catch (e) { }
  return seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast("Penyimpanan browser penuh atau dimatikan", true); } }
function getSvc(id) { return byId(DB.svcs, id); }
function getPart(id) { return byId(DB.parts, id); }
function getCust(id) { return byId(DB.custs, id); }
function getVeh(id) { return byId(DB.vehs, id); }
function getMech(id) { return byId(DB.mechs, id); }
function getWO(id) { return byId(DB.wos, id); }
function getBk(id) { return byId(DB.bookings, id); }

/* ---------- jadwal dan slot ---------- */
function dayCfg(date) { var w = pd(date).getDay(); if (w === 0) return null; return w === 6 ? { o: 480, c: 840, brk: null } : { o: 480, c: 1020, brk: [720, 780] }; }
function hoursText(date) { var c = dayCfg(date); return c ? hm(c.o) + " - " + hm(c.c) : "Tutup"; }
function mechsFor(type) { return DB.mechs.filter(function (m) { return m.active && (m.skill === "semua" || m.skill === type); }); }
function activeBks(mid, date, ignore) { return DB.bookings.filter(function (b) { return b.mechId === mid && b.date === date && b.id !== ignore && (b.status === "dibooking" || b.status === "datang"); }); }
function mechFree(m, date, start, dur, ignore) { return !activeBks(m.id, date, ignore).some(function (b) { var s = mm(b.time); return start < s + b.dur && s < start + dur; }); }
function freeMechs(date, start, dur, type, ignore) {
  return mechsFor(type).filter(function (m) { return mechFree(m, date, start, dur, ignore); }).sort(function (a, b) { return (a.skill === type ? 0 : 1) - (b.skill === type ? 0 : 1) || a.id - b.id; });
}
function slotsFor(date, dur, type, ignore) {
  var c = dayCfg(date), out = []; if (!c || !dur) return out;
  var now = new Date(), nowMin = date === ymd(now) ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
  if (date < today()) return out;
  for (var t = c.o; t + dur <= c.c; t += 30) {
    if (c.brk && t < c.brk[1] && t + dur > c.brk[0]) continue;
    if (t < nowMin) continue;
    var n = freeMechs(date, t, dur, type, ignore).length; if (n) out.push({ t: t, n: n });
  }
  return out;
}
function durOf(ids) { var s = 0; ids.forEach(function (i) { var v = getSvc(i); if (v) s += v.dur; }); return s ? Math.ceil(s / 30) * 30 : 0; }
function svcFor(type) { return DB.svcs.filter(function (s) { return s.active && (s.type === "semua" || s.type === type); }); }

/* ---------- pelanggan, kendaraan, booking ---------- */
function upsertCust(name, phone) {
  var p = normPhone(phone), c = DB.custs.filter(function (x) { return normPhone(x.phone) === p; })[0];
  if (c) { if (name) c.name = name; return c; }
  c = { id: nid(), name: name, phone: p }; DB.custs.push(c); return c;
}
function upsertVeh(custId, type, brand, model, plate, year, km) {
  var pl = fmtPlate(plate), v = DB.vehs.filter(function (x) { return normPlate(x.plate) === normPlate(pl); })[0];
  if (v) { v.custId = custId; v.type = type; v.brand = brand; v.model = model; if (year) v.year = year; if (km > (v.km || 0)) v.km = km; return v; }
  v = { id: nid(), custId: custId, type: type, brand: brand, model: model, plate: pl, year: year || "", km: km || 0 }; DB.vehs.push(v); return v;
}
function genCode() {
  var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", c, i;
  do { c = "BK-"; for (i = 0; i < 5; i++) c += A.charAt(Math.floor(Math.random() * A.length)); } while (DB.bookings.some(function (b) { return b.code === c; }));
  return c;
}
function createBooking(d) {
  var dur = durOf(d.svc), m = freeMechs(d.date, mm(d.time), dur, d.type)[0];
  if (!m || slotsFor(d.date, dur, d.type).every(function (s) { return hm(s.t) !== d.time; })) return { err: "Jam itu baru saja terisi. Pilih jam lain." };
  var c = upsertCust(d.name, d.phone), v = upsertVeh(c.id, d.type, d.brand, d.model, d.plate, d.year, d.km);
  var b = { id: nid(), code: genCode(), custId: c.id, vehId: v.id, svc: d.svc.slice(), date: d.date, time: d.time, dur: dur, mechId: m.id, status: "dibooking", note: d.note || "", km: d.km || 0, created: nowTs() };
  DB.bookings.push(b); save(); return { b: b };
}
function bkWO(b) { return DB.wos.filter(function (w) { return w.bkId === b.id; })[0] || null; }
function rescheduleBooking(b, date, time) {
  var dur = b.dur, v = getVeh(b.vehId), type = v ? v.type : "motor";
  var ok = slotsFor(date, dur, type, b.id).some(function (s) { return hm(s.t) === time; });
  if (!ok) return "Jam itu tidak tersedia. Pilih jam lain.";
  var free = freeMechs(date, mm(time), dur, type, b.id), m = free.filter(function (x) { return x.id === b.mechId; })[0] || free[0];
  b.date = date; b.time = time; b.mechId = m.id; save(); return null;
}
function bkSvcNames(b) { return b.svc.map(function (i) { var s = getSvc(i); return s ? s.name : "Layanan"; }).join(", "); }

/* ---------- work order ---------- */
function sumItems(w, t) { return w.items.reduce(function (a, i) { return a + (!t || i.t === t ? i.qty * i.price : 0); }, 0); }
function woTotal(w) { return Math.max(0, sumItems(w) - (w.disc || 0)); }
function woPaid(w) { return w.pays.reduce(function (a, p) { return a + p.amt; }, 0); }
function woDue(w) { return woTotal(w) - woPaid(w); }
function stockLog(partId, delta, why) { DB.stockLog.unshift({ ts: nowTs(), partId: partId, delta: delta, why: why }); DB.stockLog = DB.stockLog.slice(0, 120); }
function touchEst(w) {
  var e = w.est;
  if (e.status === "disetujui") { if (woTotal(w) > e.total) { e.status = "belum"; e.reapp = true; } }
  else if (e.status === "diajukan" || e.status === "ditolak") e.status = "belum";
}
function addItem(w, it, seed) {
  var found = w.items.filter(function (x) { return x.t === it.t && x.ref === it.ref && x.ref && x.price === it.price; })[0], add = it.qty;
  if (it.t === "part") {
    var p = getPart(it.ref); if (!p) return "Suku cadang tidak ditemukan";
    if (!seed && p.stock < add) return "Stok " + p.name + " kurang (sisa " + p.stock + " " + p.unit + ")";
    if (!seed) { p.stock -= add; stockLog(p.id, -add, w.no); }
    it.cost = p.cost;
  }
  if (found) found.qty += add; else { it.id = nid(); w.items.push(it); }
  if (!seed) touchEst(w);
  return null;
}
function setItemQty(w, id, q) {
  var it = byId(w.items, id); if (!it) return "Item tidak ditemukan";
  q = Math.round(q); if (!(q >= 1) || q > 999) return "Jumlah harus 1 sampai 999";
  if (it.t === "part") {
    var p = getPart(it.ref), d = q - it.qty;
    if (p) { if (d > 0 && p.stock < d) return "Stok kurang (sisa " + p.stock + " " + p.unit + ")"; p.stock -= d; if (d) stockLog(p.id, -d, w.no); }
  }
  it.qty = q; touchEst(w); return null;
}
function removeItem(w, id) {
  var i = w.items.map(function (x) { return x.id; }).indexOf(+id); if (i < 0) return;
  var it = w.items[i];
  if (it.t === "part") { var p = getPart(it.ref); if (p) { p.stock += it.qty; stockLog(p.id, it.qty, w.no + " (item dihapus)"); } }
  w.items.splice(i, 1); touchEst(w);
}
function editable(w) { return w.status === "menunggu" || w.status === "dikerjakan" || w.status === "suku_cadang"; }
function newWO(o) {
  var w = { id: nid(), no: "WO-" + ("000" + (++DB.seq.wo)).slice(-4), bkId: o.bkId || 0, custId: o.custId, vehId: o.vehId, km: o.km || 0, complaint: o.complaint || "", status: "menunggu", mechId: o.mechId || 0, items: [], disc: 0, est: { status: "belum", total: 0, reapp: false, at: "", by: "" }, pays: [], note: "", hold: "", created: o.created || nowTs(), doneAt: "", pickedAt: "", nextKm: 0, nextDate: "", invNo: "" };
  DB.wos.push(w); return w;
}
function moveWO(w, to) {
  var from = w.status;
  if (to === "dikerjakan") {
    if (from === "menunggu") {
      if (!w.mechId) return "Pilih mekanik dulu";
      if (!w.items.length) return "Belum ada item. Tambahkan jasa lalu ajukan estimasi";
      if (woTotal(w) > 0 && w.est.status !== "disetujui") return "Estimasi belum disetujui pelanggan";
    } else if (from === "selesai") { if (w.est.reapp) return "Perlu persetujuan ulang"; }
    else if (from !== "suku_cadang") return "Perpindahan status tidak valid";
    w.hold = "";
  } else if (to === "suku_cadang") { if (from !== "dikerjakan") return "Hanya pekerjaan yang sedang dikerjakan bisa ditahan"; }
  else if (to === "selesai") {
    if (from !== "dikerjakan") return "Mulai pekerjaan dulu";
    if (!w.items.length) return "Belum ada item";
    if (woTotal(w) > 0 && w.est.status !== "disetujui") return "Biaya berubah, perlu persetujuan ulang pelanggan";
    w.doneAt = nowTs();
  } else if (to === "diambil") {
    if (from !== "selesai") return "Kendaraan belum selesai";
    if (woDue(w) > 0) return "Masih ada sisa pembayaran " + rp(woDue(w));
    w.pickedAt = nowTs(); setReminder(w);
    var v = getVeh(w.vehId); if (v && w.km > (v.km || 0)) v.km = w.km;
  } else return "Status tidak dikenal";
  w.status = to; save(); return null;
}
function setReminder(w) {
  var v = getVeh(w.vehId), km = [], mo = [];
  w.items.forEach(function (i) { if (i.t === "jasa" && i.ref) { var s = getSvc(i.ref); if (s) { if (s.kmNext) km.push(s.kmNext); if (s.moNext) mo.push(s.moNext); } } });
  var type = v ? v.type : "motor", k = km.length ? Math.min.apply(0, km) : (type === "motor" ? 3000 : 5000), m = mo.length ? Math.min.apply(0, mo) : (type === "motor" ? 3 : 6);
  w.nextKm = (w.km || (v ? v.km : 0) || 0) + k; w.nextDate = addM((w.pickedAt || nowTs()).slice(0, 10), m);
}
function addPay(w, amt, method) {
  amt = Math.round(amt);
  if (!w.items.length) return "Belum ada item untuk dibayar";
  if (!(amt > 0)) return "Jumlah harus lebih dari 0";
  if (amt > woDue(w)) return "Melebihi sisa tagihan " + rp(woDue(w));
  w.pays.push({ id: nid(), amt: amt, method: method, at: nowTs() });
  if (!w.invNo) w.invNo = "INV-" + ("000" + (++DB.seq.inv)).slice(-4);
  save(); return null;
}
function reminders() {
  var out = [], t = today();
  DB.vehs.forEach(function (v) {
    var ws = DB.wos.filter(function (w) { return w.vehId === v.id && w.status === "diambil" && w.nextDate; }).sort(function (a, b) { return a.pickedAt < b.pickedAt ? 1 : -1; });
    if (!ws.length) return;
    var w = ws[0], c = getCust(v.custId), left = diffD(w.nextDate, t);
    var booked = DB.bookings.some(function (b) { return b.vehId === v.id && b.status === "dibooking" && b.date >= t; });
    out.push({ veh: v, cust: c, wo: w, left: left, booked: booked, st: left < 0 ? "Terlambat" : left <= 14 ? "Segera" : "Terjadwal" });
  });
  return out.sort(function (a, b) { return a.left - b.left; });
}
function lowParts() { return DB.parts.filter(function (p) { return p.stock <= p.min; }); }

/* ---------- seed ---------- */
function seed() {
  var T = today(), r = 7;
  function rnd(n) { r = (r * 1103515245 + 12345) & 0x7fffffff; return r % n; }
  DB = { seq: { id: 0, wo: 0, inv: 0 }, svcs: [], parts: [], mechs: [], custs: [], vehs: [], bookings: [], wos: [], stockLog: [] };
  function svc(name, cat, type, price, dur, km, mo, desc) { var s = { id: nid(), name: name, cat: cat, type: type, price: price, dur: dur, kmNext: km, moNext: mo, desc: desc, active: true }; DB.svcs.push(s); return s.id; }
  var sBM = svc("Servis berkala motor", "Berkala", "motor", 85000, 60, 4000, 3, "Cek rantai, kopling, rem, kelistrikan, dan setel karburator atau injeksi."),
    sOM = svc("Ganti oli motor", "Oli", "motor", 15000, 30, 2500, 2, "Jasa kuras dan ganti oli mesin. Harga oli dihitung terpisah."),
    sRM = svc("Servis rem motor", "Rem", "motor", 35000, 30, 8000, 6, "Bersihkan kaliper, cek kampas dan minyak rem."),
    sTM = svc("Tune up motor", "Tune up", "motor", 120000, 90, 6000, 6, "Bersih injektor atau karburator, busi, filter udara, setel katup."),
    sBC = svc("Servis berkala mobil", "Berkala", "mobil", 250000, 180, 10000, 6, "Pemeriksaan 40 titik, kuras oli, cek rem, kaki-kaki, dan aki."),
    sOC = svc("Ganti oli mesin mobil", "Oli", "mobil", 50000, 30, 5000, 4, "Jasa kuras dan ganti oli serta filter. Oli dan filter dihitung terpisah."),
    sRC = svc("Servis rem mobil", "Rem", "mobil", 150000, 90, 20000, 12, "Lepas roda, bersihkan kaliper, ukur kampas dan piringan."),
    sAC = svc("Servis AC mobil", "AC", "mobil", 200000, 90, 0, 6, "Cuci evaporator, cek tekanan freon, bersihkan filter kabin."),
    sFR = svc("Isi freon AC mobil", "AC", "mobil", 150000, 60, 0, 6, "Vakum dan isi freon sesuai takaran. Freon dihitung terpisah."),
    sTC = svc("Tune up mobil", "Tune up", "mobil", 300000, 150, 10000, 6, "Busi, filter udara, bersih throttle body, scan kelistrikan."),
    sSB = svc("Spooring dan balancing", "Ban", "mobil", 180000, 90, 10000, 6, "Setel sudut roda dan seimbangkan empat roda."),
    sAK = svc("Ganti aki", "Kelistrikan", "semua", 40000, 30, 0, 0, "Jasa pasang aki dan cek sistem pengisian. Aki dihitung terpisah."),
    sCK = svc("Cek kondisi kendaraan", "Lainnya", "semua", 0, 30, 0, 0, "Pemeriksaan visual dan saran perbaikan. Gratis jika dilanjutkan servis."),
    sPM = svc("Paket Hemat Motor", "Paket", "motor", 110000, 90, 4000, 3, "Servis berkala motor, jasa ganti oli, dan cek rem. Oli dan suku cadang terpisah."),
    sPC = svc("Paket Lengkap Mobil", "Paket", "mobil", 450000, 240, 10000, 6, "Servis berkala, jasa ganti oli, tune up dasar, dan cek AC. Oli dan suku cadang terpisah.");
  function part(sku, name, unit, stock, min, cost, price, type) { var p = { id: nid(), sku: sku, name: name, unit: unit, stock: stock, min: min, cost: cost, price: price, type: type }; DB.parts.push(p); return p.id; }
  var pOM = part("OLI-M08", "Oli mesin motor 10W-30 0,8 L", "botol", 24, 8, 42000, 55000, "motor"),
    pOC = part("OLI-C10", "Oli mesin mobil 5W-30 sintetik 1 L", "liter", 30, 10, 95000, 125000, "mobil"),
    pFO = part("FLT-OLC", "Filter oli mobil", "pcs", 3, 4, 38000, 65000, "mobil"),
    pFU = part("FLT-UDM", "Filter udara motor", "pcs", 6, 3, 30000, 48000, "motor"),
    pBM = part("BSI-MTR", "Busi motor", "pcs", 20, 6, 18000, 30000, "motor"),
    pKD = part("KMP-DM", "Kampas rem depan motor", "set", 3, 4, 35000, 55000, "motor"),
    pKB = part("KMP-BM", "Kampas rem belakang motor", "set", 0, 3, 30000, 48000, "motor"),
    pKC = part("KMP-DC", "Kampas rem depan mobil", "set", 5, 2, 280000, 380000, "mobil"),
    pAK = part("AKI-45", "Aki 12V 45Ah", "pcs", 4, 2, 720000, 850000, "semua"),
    pFR = part("FRN-134", "Freon AC R134a", "kaleng", 12, 4, 55000, 85000, "mobil"),
    pFK = part("FLT-KBN", "Filter kabin AC mobil", "pcs", 8, 3, 45000, 80000, "mobil"),
    pBC = part("BSI-MBL", "Busi mobil", "pcs", 24, 8, 32000, 55000, "mobil"),
    pMR = part("MNK-RM3", "Minyak rem DOT 3 0,5 L", "botol", 9, 3, 28000, 45000, "semua"),
    pBN = part("BAN-M14", "Ban motor 80/90-14", "pcs", 2, 2, 210000, 285000, "motor");
  function mech(name, skill) { var m = { id: nid(), name: name, skill: skill, active: true, bay: DB.mechs.length + 1 }; DB.mechs.push(m); return m.id; }
  var m1 = mech("Rudi", "motor"), m2 = mech("Dedi", "motor"), m3 = mech("Agus", "mobil"), m4 = mech("Hendra", "semua");
  function cust(name, n) { var c = { id: nid(), name: name, phone: "08120000" + ("0000" + n).slice(-4) }; DB.custs.push(c); return c.id; }
  var c1 = cust("Budi Santoso", 1), c2 = cust("Siti Rahma", 2), c3 = cust("Agus Wibowo", 3), c4 = cust("Dewi Lestari", 4), c5 = cust("Rizky Pratama", 5), c6 = cust("Made Wirawan", 6), c7 = cust("Nur Hidayah", 7), c8 = cust("Tono Kurniawan", 8);
  function veh(c, type, brand, model, plate, year, km) { var v = { id: nid(), custId: c, type: type, brand: brand, model: model, plate: plate, year: year, km: km }; DB.vehs.push(v); return v.id; }
  var v1 = veh(c1, "motor", "Honda", "Beat", "B 4521 KJL", 2019, 28400), v2 = veh(c1, "mobil", "Toyota", "Avanza", "B 1190 SRT", 2016, 98200),
    v3 = veh(c2, "motor", "Yamaha", "NMAX", "D 3307 AB", 2021, 15300), v4 = veh(c3, "mobil", "Daihatsu", "Xenia", "F 8842 GH", 2015, 121500),
    v5 = veh(c4, "motor", "Honda", "Vario 125", "B 6120 FQA", 2020, 22100), v6 = veh(c5, "mobil", "Honda", "Brio", "B 2275 UXL", 2018, 61000),
    v7 = veh(c6, "motor", "Suzuki", "Satria", "DK 5530 ZZ", 2017, 47800), v8 = veh(c7, "mobil", "Suzuki", "Ertiga", "L 9031 PD", 2019, 72300),
    v9 = veh(c8, "motor", "Yamaha", "Vixion", "AB 7710 XK", 2016, 61200), v10 = veh(c8, "motor", "Honda", "Scoopy", "AB 2204 LR", 2022, 9800);
  function pickMech(type) { var l = DB.mechs.filter(function (m) { return m.skill === type || m.skill === "semua"; }); return l[rnd(l.length)].id; }
  function line(w, kind, ref, qty, price) {
    if (kind === "jasa") { var s = getSvc(ref); addItem(w, { t: "jasa", ref: ref, name: s.name, qty: qty || 1, price: price == null ? s.price : price }, true); }
    else { var p = getPart(ref); addItem(w, { t: "part", ref: ref, name: p.name, qty: qty || 1, price: p.price }, true); }
  }
  function hist(vid, ago, combo, km) {
    var v = getVeh(vid), d = addD(T, -ago), w = newWO({ custId: v.custId, vehId: vid, km: km, complaint: "Servis rutin", mechId: pickMech(v.type), created: d + " 08:" + pad(10 + rnd(40)) });
    combo.forEach(function (c) { line(w, c[0], c[1], c[2]); });
    w.est = { status: "disetujui", total: woTotal(w), reapp: false, at: d + " 09:00", by: "Pelanggan (di tempat)" };
    w.status = "diambil"; w.doneAt = d + " 14:00"; w.pickedAt = d + " 15:" + pad(rnd(50));
    w.pays.push({ id: nid(), amt: woTotal(w), method: METHODS[rnd(3)], at: w.pickedAt }); w.invNo = "INV-" + ("000" + (++DB.seq.inv)).slice(-4);
    setReminder(w); return w;
  }
  var motorCombos = [[["jasa", sOM], ["part", pOM, 1]], [["jasa", sBM], ["part", pBM, 1], ["part", pFU, 1]], [["jasa", sRM], ["part", pKD, 1], ["part", pMR, 1]], [["jasa", sTM], ["part", pBM, 1]], [["jasa", sOM], ["part", pOM, 1], ["jasa", sCK]]];
  var carCombos = [[["jasa", sOC], ["part", pOC, 4], ["part", pFO, 1]], [["jasa", sBC], ["part", pOC, 4], ["part", pFO, 1], ["part", pBC, 4]], [["jasa", sRC], ["part", pKC, 1]], [["jasa", sAC], ["part", pFR, 1], ["part", pFK, 1]], [["jasa", sSB]]];
  /* riwayat lama (membuat pengingat terlambat atau segera) */
  hist(v1, 75, motorCombos[0], 25200); hist(v2, 150, carCombos[1], 90400); hist(v3, 20, motorCombos[0], 14600); hist(v4, 200, carCombos[0], 114000);
  hist(v5, 40, motorCombos[1], 21000); hist(v6, 110, carCombos[1], 56800); hist(v7, 60, motorCombos[2], 46100); hist(v8, 30, carCombos[2], 70500);
  hist(v9, 85, motorCombos[3], 59800); hist(v10, 10, motorCombos[4], 9500);
  /* riwayat 28 hari terakhir untuk laporan */
  var pool = [v2, v3, v5, v7, v8, v9, v10], days = [];
  for (var i = 0; i < 22; i++) days.push(1 + rnd(27));
  days.sort(function (a, b) { return b - a; });
  days.forEach(function (ago) {
    var vid = pool[rnd(pool.length)], v = getVeh(vid), cb = v.type === "motor" ? motorCombos : carCombos;
    hist(vid, ago, cb[rnd(cb.length)], v.km - 300 * ago / 10);
  });
  /* order aktif hari ini */
  function bk(code, vid, svcs, date, time, status, note) {
    var v = getVeh(vid), dur = durOf(svcs), m = freeMechs(date, mm(time), dur, v.type)[0] || mechsFor(v.type)[0];
    var b = { id: nid(), code: code, custId: v.custId, vehId: vid, svc: svcs, date: date, time: time, dur: dur, mechId: m.id, status: status, note: note || "", km: v.km, created: addD(T, -2) + " 10:00" };
    DB.bookings.push(b); return b;
  }
  function nextOpen(d) { while (!dayCfg(d)) d = addD(d, 1); return d; }
  var bC = bk("BK-C3D8M", v1, [sBM, sOM], T, "08:00", "datang", "Rem terasa kurang pakem"), bB = bk("BK-B5NQ7", v6, [sBC], T, "08:30", "datang", "");
  var d1 = nextOpen(addD(T, 1)), d2 = nextOpen(addD(d1, 1)), d3 = nextOpen(addD(d2, 1));
  bk("BK-K7P2X", v2, [sOC], T, "13:00", "dibooking", "Bunyi kasar di mesin"); bk("BK-H4T9R", v9, [sBM], T, "15:00", "dibooking", "");
  bk("BK-M2W6Z", v4, [sRC], d1, "09:00", "dibooking", "Rem bergetar saat diinjak"); bk("BK-Q8E5A", v10, [sOM], d1, "10:30", "dibooking", "");
  bk("BK-R3L7J", v3, [sTM], d2, "09:30", "dibooking", ""); bk("BK-V9F4D", v5, [sRM, sOM], d3, "08:00", "dibooking", "Rem belakang bunyi");
  var bx = bk("BK-X6G2S", v7, [sBM], addD(T, -1), "10:00", "dibatalkan", ""); bx.cancelNote = "Dibatalkan pelanggan";
  var w;
  w = newWO({ custId: c4, vehId: v5, km: 22400, complaint: "Rem belakang bunyi dan getar", mechId: 0, created: T + " 08:20" });
  w = newWO({ custId: c5, vehId: v6, km: 61350, complaint: "Servis berkala 60.000 km", bkId: bB.id, mechId: m3, created: T + " 08:35" });
  line(w, "jasa", sBC); line(w, "jasa", sOC); w.est = { status: "belum", total: 0, reapp: false, at: "", by: "" };
  addItem(w, { t: "part", ref: pOC, name: getPart(pOC).name, qty: 4, price: getPart(pOC).price }); addItem(w, { t: "part", ref: pFO, name: getPart(pFO).name, qty: 1, price: getPart(pFO).price });
  w.est = { status: "diajukan", total: woTotal(w), reapp: false, at: T + " 09:10", by: "" };
  w = newWO({ custId: c1, vehId: v1, km: 28700, complaint: "Servis berkala, rem kurang pakem", bkId: bC.id, mechId: m1, created: T + " 08:05" });
  line(w, "jasa", sBM); addItem(w, { t: "part", ref: pBM, name: getPart(pBM).name, qty: 1, price: getPart(pBM).price }); addItem(w, { t: "part", ref: pOM, name: getPart(pOM).name, qty: 1, price: getPart(pOM).price });
  w.est = { status: "disetujui", total: woTotal(w), reapp: false, at: T + " 08:25", by: "Pelanggan (di tempat)" }; w.status = "dikerjakan";
  w = newWO({ custId: c6, vehId: v7, km: 48000, complaint: "Rem depan dan belakang tipis", mechId: m2, created: T + " 07:50" });
  line(w, "jasa", sRM); addItem(w, { t: "part", ref: pKD, name: getPart(pKD).name, qty: 1, price: getPart(pKD).price }, false);
  w.est = { status: "disetujui", total: woTotal(w), reapp: false, at: T + " 08:10", by: "Pelanggan (via telepon)" }; w.status = "suku_cadang"; w.hold = "Kampas rem belakang kosong, sedang dipesan ke pemasok";
  w.note = "Kampas depan sudah diganti. Tinggal belakang.";
  w = newWO({ custId: c2, vehId: v3, km: 15600, complaint: "Ganti oli rutin", mechId: m1, created: T + " 07:40" });
  line(w, "jasa", sOM); addItem(w, { t: "part", ref: pOM, name: getPart(pOM).name, qty: 1, price: getPart(pOM).price });
  w.est = { status: "disetujui", total: woTotal(w), reapp: false, at: T + " 07:45", by: "Pelanggan (di tempat)" }; w.status = "selesai"; w.doneAt = T + " 08:20"; addPay(w, 40000, "Tunai");
  w = newWO({ custId: c7, vehId: v8, km: 72900, complaint: "AC kurang dingin", mechId: m4, created: addD(T, 0) + " 07:30" });
  line(w, "jasa", sAC); addItem(w, { t: "part", ref: pFR, name: getPart(pFR).name, qty: 1, price: getPart(pFR).price }); addItem(w, { t: "part", ref: pFK, name: getPart(pFK).name, qty: 1, price: getPart(pFK).price });
  w.est = { status: "disetujui", total: woTotal(w), reapp: false, at: T + " 07:50", by: "Pelanggan (via telepon)" }; w.status = "selesai"; w.doneAt = T + " 09:30"; addPay(w, woTotal(w), "QRIS");
  stockLog(pOM, 40, "Restok awal"); stockLog(pKB, -3, "Terpakai (riwayat)"); stockLog(pFO, -5, "Terpakai (riwayat)");
  save(); return DB;
}
DB = load();

/* ---------- dialog dan form generik ---------- */
var dlg;
function openDlg(title, body, foot) {
  dlg = $("#dlg");
  dlg.innerHTML = '<div class="dh"><h3>' + esc(title) + '</h3><button class="btn sm" type="button" data-act="dclose" aria-label="Tutup dialog">Tutup</button></div><div class="db">' + body + "</div>" + (foot ? '<div class="df">' + foot + "</div>" : "");
  if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
  var f = $("input,select,textarea", dlg); if (f && !/date|range/.test(f.type)) { try { f.focus(); } catch (e) { } }
}
function closeDlg() { dlg = $("#dlg"); if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); } dlg.innerHTML = ""; S.dyn = null; }
function fieldHTML(f) {
  var id = "ff_" + f.k, v = f.v == null ? "" : f.v, inp, at = ' id="' + id + '" name="' + f.k + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : "") + (f.ro ? " readonly" : "") + (f.on ? ' data-on="' + f.on + '"' : "") + (f.oi ? ' data-oi="' + f.oi + '"' : "");
  if (f.t === "select") inp = "<select" + at + ">" + f.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
  else if (f.t === "textarea") inp = "<textarea" + at + (f.max ? ' maxlength="' + f.max + '"' : "") + ">" + esc(v) + "</textarea>";
  else inp = "<input" + at + ' type="' + (f.t || "text") + '" value="' + esc(v) + '"' + (f.min != null ? ' min="' + f.min + '"' : "") + (f.step ? ' step="' + f.step + '"' : "") + (f.t === "number" ? ' inputmode="numeric"' : "") + (f.max && f.t !== "number" ? ' maxlength="' + f.max + '"' : "") + (f.list ? ' list="' + f.list + '"' : "") + ' autocomplete="off">';
  return '<div class="f" data-f="' + f.k + '"><label for="' + id + '">' + esc(f.l) + (f.req ? " *" : "") + "</label>" + inp + (f.hint ? '<div class="hint">' + esc(f.hint) + "</div>" : "") + '<div class="err" role="alert"></div></div>';
}
function showErrs(form, errs) {
  $$("[data-f]", form).forEach(function (f) { f.classList.remove("bad"); var e = $(".err", f); if (e) e.textContent = ""; });
  var fe = $(".formerr", form); if (fe) fe.remove();
  var first = null;
  Object.keys(errs).forEach(function (k) {
    if (k === "_") { var d = document.createElement("div"); d.className = "formerr"; d.setAttribute("role", "alert"); d.textContent = errs[k]; form.insertBefore(d, form.firstChild); return; }
    var f = $('[data-f="' + k + '"]', form); if (!f) return; f.classList.add("bad"); $(".err", f).textContent = errs[k]; if (!first) first = $("input,select,textarea", f);
  });
  if (first) first.focus();
}
function validate(fields, vals) {
  var errs = {}, out = {};
  fields.forEach(function (f) {
    var v = String(vals[f.k] == null ? "" : vals[f.k]).trim();
    if (f.t === "number") {
      if (v === "") { if (f.req) errs[f.k] = "Wajib diisi"; out[f.k] = 0; return; }
      var n = Number(v.replace(",", "."));
      if (isNaN(n)) errs[f.k] = "Isi dengan angka";
      else if (f.min != null && n < f.min) errs[f.k] = "Minimal " + f.min;
      else if (f.maxn != null && n > f.maxn) errs[f.k] = "Maksimal " + f.maxn;
      else if (!f.dec && Math.round(n) !== n) errs[f.k] = "Isi dengan bilangan bulat";
      out[f.k] = n; return;
    }
    if (f.req && !v) { errs[f.k] = "Wajib diisi"; return; }
    if (f.max && v.length > f.max) errs[f.k] = "Maksimal " + f.max + " karakter";
    out[f.k] = v;
  });
  return { errs: errs, vals: out };
}
function openForm(o) {
  S.dyn = o;
  var body = '<form id="dform" data-form="dyn" novalidate>' + (o.intro ? '<p class="mut">' + esc(o.intro) + "</p>" : "") + '<div class="grid2">' + o.fields.map(function (f) { return f.wide ? "</div>" + fieldHTML(f) + '<div class="grid2">' : fieldHTML(f); }).join("") + "</div></form>";
  openDlg(o.title, body, '<button class="btn" type="button" data-act="dclose">Batal</button><button class="btn pri" type="submit" form="dform">' + esc(o.ok || "Simpan") + "</button>");
}
function formVals(form) { var o = {}; $$("input,select,textarea", form).forEach(function (e) { if (e.name) o[e.name] = e.value; }); return o; }

/* ---------- slot picker ---------- */
function spHTML(id) { return '<div class="sp" id="' + id + '"><div class="dates" role="group" aria-label="Pilih tanggal"></div><div class="slots" role="group" aria-label="Pilih jam"></div><div class="f"><div class="err" role="alert" data-sperr></div></div></div>'; }
function spMount(root, o) {
  root._o = o; root._d = o.date || ""; root._t = o.time || "";
  if (!root._d) { for (var i = 0; i < 14; i++) { var d = addD(today(), i); if (o.dur() ? slotsFor(d, o.dur(), o.type(), o.ignore).length : dayCfg(d)) { root._d = d; break; } } }
  spRender(root);
}
function spRender(root) {
  var o = root._o, dur = o.dur(), type = o.type(), dh = "", i;
  for (i = 0; i < 14; i++) {
    var d = addD(today(), i), cfg = dayCfg(d), n = dur && cfg ? slotsFor(d, dur, type, o.ignore).length : 0, dis = !cfg || (dur && !n);
    dh += '<button type="button" data-sp-d="' + d + '"' + (dis ? " disabled" : "") + ' aria-pressed="' + (root._d === d) + '" aria-label="' + esc(fd(d) + (!cfg ? ", tutup" : dis ? ", penuh" : "")) + '"><span>' + DS[pd(d).getDay()] + "</span><b>" + pd(d).getDate() + "</b><span>" + MN[pd(d).getMonth()] + "</span></button>";
  }
  $(".dates", root).innerHTML = dh;
  var sl = $(".slots", root);
  if (!dur) sl.innerHTML = '<div class="empty" style="grid-column:1/-1">Pilih layanan dulu untuk melihat jam kosong.</div>';
  else {
    var list = root._d ? slotsFor(root._d, dur, type, o.ignore) : [];
    if (!root._d) sl.innerHTML = '<div class="empty" style="grid-column:1/-1">Tidak ada tanggal kosong dalam 14 hari. Kurangi layanan atau hubungi bengkel.</div>';
    else if (!list.length) sl.innerHTML = '<div class="empty" style="grid-column:1/-1">Tidak ada jam kosong di tanggal ini.</div>';
    else {
      if (root._t && !list.some(function (s) { return hm(s.t) === root._t; })) root._t = "";
      sl.innerHTML = list.map(function (s) { return '<button type="button" data-sp-t="' + hm(s.t) + '" aria-pressed="' + (root._t === hm(s.t)) + '">' + hm(s.t) + "<small>" + (s.n > 1 ? s.n + " bay" : "1 bay") + "</small></button>"; }).join("");
    }
  }
  if (o.onChange) o.onChange(root);
}

/* ---------- komponen publik ---------- */
function img(name, alt, w, h) { return '<img src="img/' + name + '.jpg" alt="' + esc(alt) + '" width="' + w + '" height="' + h + '" loading="lazy">'; }
function openNow() {
  var n = new Date(), c = dayCfg(ymd(n)), m = n.getHours() * 60 + n.getMinutes();
  if (!c) return { on: false, t: "Tutup hari ini (Minggu)" };
  if (m < c.o) return { on: false, t: "Buka pukul " + hm(c.o) };
  if (m >= c.c) return { on: false, t: "Sudah tutup, buka besok" };
  if (c.brk && m >= c.brk[0] && m < c.brk[1]) return { on: false, t: "Istirahat sampai " + hm(c.brk[1]) };
  return { on: true, t: "Buka sekarang, tutup " + hm(c.c) };
}
var GEAR = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" stroke-width="2.6" stroke-linecap="square"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>';
function pubHeader(route) {
  var links = [["#/", "Beranda", "home"], ["#/booking", "Booking", "booking"], ["#/riwayat", "Riwayat servis", "riwayat"]];
  return '<header class="pub-h"><div class="wrap"><a class="brand" href="#/"><span class="logo" aria-hidden="true">' + GEAR + '</span><span class="bn">' + esc(SHOP.name) + '</span></a><button class="menu-btn" type="button" data-act="menu" aria-expanded="' + S.menu + '" aria-controls="pnav">' + (S.menu ? "Tutup" : "Menu") + '</button><nav class="nav' + (S.menu ? " open" : "") + '" id="pnav" aria-label="Menu utama">' +
    links.slice(0, 1).map(function (l) { return '<a href="' + l[0] + '"' + (route === l[2] ? ' class="on" aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("") +
    '<a href="#/" data-act="scroll" data-to="layanan">Layanan</a><a href="#/" data-act="scroll" data-to="jam">Jam buka</a>' +
    links.slice(1).map(function (l) { return '<a href="' + l[0] + '"' + (route === l[2] ? ' class="on" aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("") +
    '<a href="#/admin" class="adm-l">Panel bengkel</a><a href="#/cek" class="cek' + (route === "cek" ? " on" : "") + '"' + (route === "cek" ? ' aria-current="page"' : "") + ">Cek booking</a></nav></div></header>";
}
function pubFooter() {
  return '<footer class="foot"><div class="haz"></div><div class="wrap"><div class="fbig">' + esc(SHOP.name) + '</div><div class="cols"><div><b>Alamat</b><br>' + esc(SHOP.addr) + "<br>Telepon " + esc(SHOP.tel) + '<br><span class="sm">Bengkel fiktif untuk contoh. Semua data, nama, dan nomor adalah contoh.</span></div><div><b>Menu</b><br><a href="#/booking">Booking servis</a><br><a href="#/cek">Cek booking</a><br><a href="#/riwayat">Riwayat servis</a></div><div><b>Demo</b><br><a href="#/admin">Panel bengkel</a><br><a href="credits.json" target="_blank" rel="noopener">Foto: Wikimedia Commons, lihat kredit</a></div></div></div></footer>';
}
function durText(m) { return m >= 60 ? (m / 60).toString().replace(".", ",") + " JAM" : m + " MNT"; }
function svcRow(s) {
  return '<li class="rr"><div class="rn"><b>' + esc(s.name) + '</b><span class="tg">' + esc(s.cat) + '</span><span class="tg">' + (s.type === "semua" ? "Motor + mobil" : s.type === "motor" ? "Motor" : "Mobil") + '</span><p>' + esc(s.desc) + '</p></div><div class="rd"><small>Durasi</small>' + durText(s.dur) + '</div><div class="rp"><small>Jasa</small>' + (s.price ? "Rp" + num(s.price) : "GRATIS") + '</div><div class="ra"><button class="btn sm pri" type="button" data-act="pick-svc" data-id="' + s.id + '" aria-label="Pesan ' + esc(s.name) + '">Pesan</button></div></li>';
}
function viewHome() {
  var on = openNow(), t = today(), pk = DB.svcs.filter(function (s) { return s.active && s.cat === "Paket"; });
  var list = DB.svcs.filter(function (s) { return s.active && s.cat !== "Paket" && (S.svcFilter === "semua" || s.type === S.svcFilter || s.type === "semua"); });
  var tw = pd(t).getDay();
  var hrs = [[1, "Senin - Jumat", "08:00 - 17:00", "Istirahat 12:00 - 13:00"], [6, "Sabtu", "08:00 - 14:00", ""], [0, "Minggu", "TUTUP", ""]].map(function (x) {
    var isT = x[0] === tw || (x[0] === 1 && tw >= 1 && tw <= 5);
    return '<li class="' + (isT ? "today" : "") + '"><span>' + x[1] + (isT ? " <em>HARI INI</em>" : "") + "</span><b>" + x[2] + "</b>" + (x[3] ? "<small>" + x[3] + "</small>" : "") + "</li>";
  }).join("");
  var cats = [["oli", "Ganti oli", "Oli mesin dan filter, motor dan mobil", 1000, 750], ["rem", "Rem", "Kampas, minyak rem, dan setel", 1000, 612], ["ban", "Ban dan kaki-kaki", "Ganti ban, spooring, balancing", 1000, 674], ["mesin", "Tune up dan mesin", "Busi, filter, injektor, scan", 1000, 662]];
  var steps = ["Booking online|Isi data kendaraan, pilih layanan, tanggal, dan jam. Slot dihitung per mekanik, tidak bentrok.", "Datang sesuai jadwal|Tunjukkan kode booking. Kendaraan diterima dan dibuatkan work order.", "Estimasi dan persetujuan|Mekanik memeriksa, biaya diajukan, Anda setujui lewat halaman Cek booking.", "Ambil dan simpan riwayat|Bayar, ambil nota, dan lihat pengingat servis berikutnya di Riwayat servis."];
  var faq = [["Apakah saya harus booking?", "Tidak wajib, tetapi booking menjamin slot dan mekanik. Tanpa booking, kendaraan dilayani sesuai antrean."], ["Bagaimana jika biaya bertambah?", "Mekanik menambah item di work order, lalu meminta persetujuan ulang. Pekerjaan tambahan tidak diselesaikan sebelum Anda setuju."], ["Bisa ubah atau batalkan booking?", "Bisa, lewat Cek booking dengan kode dan nomor telepon, selama kendaraan belum diterima."], ["Apakah data saya aman?", "Ini demo. Data hanya tersimpan di browser Anda dan bisa dihapus dengan Reset data demo di panel bengkel."]];
  return '<section class="hx"><div class="hy"><span class="lbl">Bengkel motor dan mobil</span><h1><span>Servis</span><span>Tanpa</span><span class="k">Nebak</span></h1><p class="lead">Biaya diberi tahu sebelum pekerjaan dimulai. Ada tambahan? Kami minta persetujuan Anda dulu.</p><div class="row"><a class="btn lg dark" href="#/booking">Booking servis</a><a class="btn lg" href="#/" data-act="scroll" data-to="layanan">Lihat harga</a></div><div class="lamp ' + (on.on ? "on" : "off") + '" role="status"><i></i><b>' + (on.on ? "BUKA" : "TUTUP") + "</b><span>" + esc(on.t) + '</span></div></div>' +
    '<div class="hb"><img src="img/mesin.jpg" alt="Ruang mesin mobil yang sedang diservis" width="1000" height="662"><div class="haz top"></div><form class="tk" data-form="ticket" id="tkform" novalidate aria-label="Tiket servis cepat"><div class="tkh"><b>Tiket servis</b><span>Isi cepat</span></div><div class="f"><span class="lb" id="tk_lb">Jenis kendaraan</span><div class="seg" role="radiogroup" aria-labelledby="tk_lb"><label><input type="radio" name="tktype" value="motor" checked><span>Motor</span></label><label><input type="radio" name="tktype" value="mobil"><span>Mobil</span></label></div></div><div class="f" id="tk_f"><label for="tk_plate">Plat nomor</label><input id="tk_plate" name="tkplate" placeholder="B 1234 ABC" maxlength="12" autocomplete="off" aria-describedby="tk_err"><div class="err" id="tk_err" role="alert"></div></div><button class="btn pri lg" type="submit">Booking</button><div class="bc" aria-hidden="true"></div></form></div></section>' +
    '<div class="band" aria-hidden="true"><span>Motor</span><span>Mobil</span><span>Slot per mekanik</span><span>Estimasi sebelum kerja</span><span>Nota digital</span></div>' +
    '<section class="sec" id="layanan"><div class="wrap"><div class="sh"><span class="lbl">01 / Layanan</span><h2>Daftar harga jasa</h2></div><div class="cats">' +
    cats.map(function (c) { return '<article class="ct shift"><div class="ph">' + img(c[0], "Foto " + c[1].toLowerCase(), c[3], c[4]) + '</div><div class="tx"><b>' + c[1] + "</b><span>" + c[2] + "</span></div></article>"; }).join("") +
    '</div><div class="tabs" role="group" aria-label="Filter jenis kendaraan">' + [["semua", "Semua"], ["motor", "Motor"], ["mobil", "Mobil"]].map(function (f) { return '<button type="button" data-act="svc-filter" data-v="' + f[0] + '" aria-pressed="' + (S.svcFilter === f[0]) + '">' + f[1] + "</button>"; }).join("") +
    '</div><div class="rcp"><div class="rh"><b>' + esc(SHOP.name) + '</b><span>Daftar harga jasa</span></div><ul class="rl">' + (list.length ? list.map(svcRow).join("") : '<li class="rr"><div class="rn">Belum ada layanan untuk pilihan ini.</div></li>') + '</ul><div class="rf">Harga jasa belum termasuk oli dan suku cadang. Biaya akhir mengikuti estimasi yang Anda setujui.</div></div></div></section>' +
    '<section class="sec dk" id="paket"><div class="wrap"><div class="sh"><span class="lbl">02 / Paket</span><h2>Sekali datang, beres</h2></div><p class="sub">Beberapa layanan sekaligus dalam satu jadwal, lebih ringkas dari memesan satuan.</p><div class="pk">' +
    pk.map(function (s) { return '<article class="pc shift"><div class="pt"><span>' + (s.type === "motor" ? "Motor" : "Mobil") + '</span><span>' + durText(s.dur) + '</span></div><h3>' + esc(s.name) + '</h3><div class="pr">Rp' + num(s.price) + '</div><p>' + esc(s.desc) + '</p><button class="btn pri" type="button" data-act="pick-svc" data-id="' + s.id + '">Pilih paket</button></article>'; }).join("") + "</div></div></section>" +
    '<section class="sec" id="cara"><div class="wrap"><div class="sh"><span class="lbl">03 / Langkah kerja</span><h2>Empat langkah</h2></div><div class="steps">' +
    steps.map(function (x, i) { var a = x.split("|"); return '<div class="st shift"><b class="no">0' + (i + 1) + "</b><h3>" + a[0] + "</h3><p>" + a[1] + "</p></div>"; }).join("") + '</div></div></section>' +
    '<section class="sec alt" id="jam"><div class="wrap"><div class="sh"><span class="lbl">04 / Jam buka</span><h2>Jam buka dan lokasi</h2></div><div class="two"><div class="papan"><div class="sign ' + (on.on ? "on" : "off") + '" role="status"><b>' + (on.on ? "BUKA" : "TUTUP") + "</b><span>" + esc(on.t) + '</span></div><ul class="jl">' + hrs + '</ul><p class="sm">Booking bisa dibuat 14 hari ke depan. Jam kosong mengikuti jumlah mekanik yang bertugas.</p></div><div class="loc shift"><h3>Lokasi</h3><p><b>' + esc(SHOP.name) + "</b><br>" + esc(SHOP.addr) + "<br>Telepon " + esc(SHOP.tel) + '</p>' + mapSvg() + '<p class="sm" style="margin:8px 0 0">Skema lokasi contoh, bukan peta sebenarnya.</p></div></div></div></section>' +
    '<section class="sec" id="pengingat"><div class="wrap two"><div class="rem"><span class="lbl">05 / Pengingat</span><h2>Servis berikutnya, tidak lupa</h2><p>Setiap kendaraan yang selesai diservis mendapat jadwal servis berikutnya berdasarkan jarak tempuh dan tanggal, mana yang lebih dulu. Lihat di Riwayat servis dengan plat dan nomor telepon.</p><a class="btn pri" href="#/riwayat">Lihat riwayat servis</a></div><div class="fq"><h3>Pertanyaan umum</h3>' +
    faq.map(function (q) { return '<details class="faq"><summary>' + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</div></div></section>";
}
function mapSvg() {
  return '<svg viewBox="0 0 320 170" role="img" aria-label="Skema lokasi bengkel di Jl. Contoh Raya, dekat perempatan"><rect width="320" height="170" fill="#e9e7e1"/><rect x="0" y="72" width="320" height="26" fill="#0d0d0d"/><rect x="150" y="0" width="22" height="170" fill="#0d0d0d"/><path d="M0 85h320M161 0v170" stroke="#ffd400" stroke-width="2" stroke-dasharray="8 7" fill="none"/><rect x="18" y="14" width="110" height="44" fill="#c9c6bd"/><rect x="190" y="14" width="112" height="44" fill="#d6d3ca"/><rect x="18" y="112" width="110" height="44" fill="#d6d3ca"/><rect x="188" y="110" width="40" height="46" fill="#ffd400" stroke="#0d0d0d" stroke-width="3"/><rect x="236" y="110" width="66" height="46" fill="#c9c6bd"/><text x="208" y="138" font-size="7" font-weight="800" fill="#0d0d0d" text-anchor="middle">BENGKEL</text><text x="75" y="40" font-size="10" fill="#3b4046" text-anchor="middle">Taman</text><text x="246" y="40" font-size="10" fill="#3b4046" text-anchor="middle">Ruko</text><text x="75" y="138" font-size="10" fill="#3b4046" text-anchor="middle">Pasar</text><text x="30" y="68" font-size="9" fill="#3b4046">Jl. Contoh Raya</text><text x="269" y="138" font-size="9" fill="#3b4046" text-anchor="middle">Parkir</text></svg>';
}
function viewBooking() {
  var p = S.bk, type = p.type || "motor", ids = p.svc || [];
  return '<div class="page"><div class="wrap"><h1>Booking servis</h1><p class="mut">Isi empat langkah. Kode booking muncul setelah Anda kirim.</p><div class="bk"><form data-form="booking" id="bkform" novalidate class="card"><fieldset><legend><span class="num">1</span>Kendaraan</legend><div class="f" data-f="type"><span class="lb">Jenis kendaraan</span><div class="seg" role="radiogroup" aria-label="Jenis kendaraan"><label><input type="radio" name="type" value="motor" data-on="bk-type"' + (type === "motor" ? " checked" : "") + '><span>Motor</span></label><label><input type="radio" name="type" value="mobil" data-on="bk-type"' + (type === "mobil" ? " checked" : "") + '><span>Mobil</span></label></div></div><div class="grid2">' +
    fieldHTML({ k: "brand", l: "Merek", v: p.brand || "", req: 1, list: "brands", ph: "Contoh: Honda", max: 30 }) + fieldHTML({ k: "model", l: "Model", v: p.model || "", req: 1, ph: "Contoh: Beat", max: 30 }) + fieldHTML({ k: "plate", l: "Plat nomor", v: p.plate || "", req: 1, ph: "B 1234 ABC", max: 12 }) + fieldHTML({ k: "km", l: "Kilometer saat ini", v: p.km || "", t: "number", req: 1, min: 0, hint: "Angka di spidometer" }) + fieldHTML({ k: "year", l: "Tahun (opsional)", v: p.year || "", t: "number", min: 1980 }) + '</div><datalist id="brands">' + BRANDS[type].map(function (b) { return '<option value="' + b + '">'; }).join("") + '</datalist></fieldset><fieldset><legend><span class="num">2</span>Layanan</legend><div id="svcbox" data-f="svc">' + svcBoxHTML(type, ids) + '<div class="err" role="alert"></div></div></fieldset><fieldset><legend><span class="num">3</span>Tanggal dan jam</legend><div data-f="slot">' + spHTML("bksp") + '</div></fieldset><fieldset><legend><span class="num">4</span>Kontak</legend><div class="grid2">' +
    fieldHTML({ k: "name", l: "Nama", v: p.name || "", req: 1, max: 60, ph: "Nama Anda" }) + fieldHTML({ k: "phone", l: "Nomor telepon / WhatsApp", v: p.phone || "", req: 1, max: 18, ph: "0812-0000-0000", hint: "Dipakai untuk mengecek booking" }) + "</div>" + fieldHTML({ k: "note", l: "Keluhan atau catatan (opsional)", t: "textarea", v: p.note || "", max: 300, ph: "Contoh: rem bunyi, mesin kasar" }) + '<button class="btn pri lg" type="submit" style="width:100%">Kirim booking</button></fieldset></form><aside class="side"><div class="card sum" aria-live="polite"><h3>Ringkasan</h3><dl id="bksum"></dl></div></aside></div></div></div>';
}
function svcBoxHTML(type, ids) {
  var l = svcFor(type);
  return l.map(function (s) { return '<label class="pick"><input type="checkbox" name="svc" value="' + s.id + '" data-on="bk-svc"' + (ids.indexOf(s.id) >= 0 ? " checked" : "") + '><span class="grow"><b>' + esc(s.name) + '</b> <span class="badge">' + esc(s.cat) + '</span><br><span class="sm mut">' + esc(s.desc) + '</span></span><span class="price" style="font-size:15px">' + (s.price ? "Rp" + num(s.price) : "Gratis") + "</span></label>"; }).join("");
}
function bkSelected() { return $$('#bkform input[name="svc"]:checked').map(function (e) { return +e.value; }); }
function bkType() { var e = $('#bkform input[name="type"]:checked'); return e ? e.value : "motor"; }
function bkSummary() {
  var ids = bkSelected(), dur = durOf(ids), sp = $("#bksp"), sum = ids.reduce(function (a, i) { var s = getSvc(i); return a + (s ? s.price : 0); }, 0);
  $("#bksum").innerHTML = "<dt>Layanan</dt><dd>" + (ids.length ? ids.length + " dipilih" : "Belum dipilih") + "</dd><dt>Jasa</dt><dd>" + rp(sum) + "</dd><dt>Durasi</dt><dd>" + (dur ? (dur >= 60 ? Math.floor(dur / 60) + " jam" + (dur % 60 ? " 30 mnt" : "") : "30 mnt") : "-") + "</dd><dt>Jadwal</dt><dd>" + (sp && sp._d && sp._t ? fd(sp._d) + ", " + sp._t : "Belum dipilih") + '</dd><dt>Catatan</dt><dd class="sm mut">Oli dan suku cadang dihitung terpisah setelah pemeriksaan.</dd>';
}
function bkInit() {
  var sp = $("#bksp"); if (!sp) return;
  spMount(sp, { dur: function () { return durOf(bkSelected()); }, type: bkType, date: S.bk.date, time: S.bk.time, onChange: bkSummary });
}
function viewSukses(code) {
  var b = DB.bookings.filter(function (x) { return x.code === code; })[0]; if (!b) return viewNotFound();
  var v = getVeh(b.vehId), c = getCust(b.custId), m = getMech(b.mechId);
  var msg = "Halo " + SHOP.name + ", booking saya " + b.code + " pada " + fd(b.date) + " pukul " + b.time + ".";
  return '<div class="page"><div class="wrap" style="max-width:640px"><div class="card" style="text-align:center"><span class="badge ok">Booking diterima</span><h1 style="margin-top:10px">Simpan kode booking Anda</h1><div class="code" aria-label="Kode booking">' + esc(b.code) + '</div><p class="mut" style="margin-top:10px">Tunjukkan kode ini saat datang. Untuk mengecek, ubah, atau membatalkan, gunakan kode dan nomor telepon ' + esc(fPhone(c.phone)) + '.</p><dl class="kv" style="text-align:left;margin:14px 0"><dt>Kendaraan</dt><dd>' + esc(v.brand + " " + v.model) + " " + plateHTML(v.plate) + "</dd><dt>Layanan</dt><dd>" + esc(bkSvcNames(b)) + "</dd><dt>Jadwal</dt><dd>" + esc(fd(b.date)) + ", " + b.time + " - " + hm(mm(b.time) + b.dur) + "</dd><dt>Bay</dt><dd>Bay " + (m ? m.bay : "-") + (m ? ", mekanik " + esc(m.name) : "") + '</dd></dl><div class="row" style="justify-content:center"><button class="btn" type="button" data-act="copy" data-v="' + esc(b.code) + '">Salin kode</button><a class="btn" target="_blank" rel="noopener" href="https://wa.me/' + SHOP.wa + "?text=" + encodeURIComponent(msg) + '">Kirim lewat WhatsApp</a><a class="btn pri" href="#/cek/' + esc(b.code) + '">Cek booking</a></div></div></div></div>';
}
function viewNotFound() { return '<div class="page"><div class="wrap"><div class="empty">Halaman tidak ditemukan. <a href="#/">Ke beranda</a></div></div></div>'; }
function exampleHint(kind) {
  if (kind === "cek") { var b = DB.bookings.filter(function (x) { return x.status === "dibooking" && x.date >= today(); })[0]; if (!b) return ""; var c = getCust(b.custId); return '<p class="sm mut">Contoh data demo: kode <b>' + esc(b.code) + "</b>, telepon <b>" + esc(fPhone(c.phone)) + '</b>. <button type="button" class="btn sm" data-act="fill-cek" data-a="' + esc(b.code) + '" data-b="' + esc(c.phone) + '">Isi otomatis</button></p>'; }
  var v = getVeh(DB.vehs[0].id), c2 = getCust(v.custId);
  return '<p class="sm mut">Contoh data demo: plat <b>' + esc(v.plate) + "</b>, telepon <b>" + esc(fPhone(c2.phone)) + '</b>. <button type="button" class="btn sm" data-act="fill-rw" data-a="' + esc(v.plate) + '" data-b="' + esc(c2.phone) + '">Isi otomatis</button></p>';
}
function viewCek(code) {
  var b = null;
  if (S.ver && S.ver.bkId) b = getBk(S.ver.bkId);
  if (b && code && b.code !== code) b = null;
  var form = '<form data-form="cek" novalidate class="card" style="max-width:520px">' + fieldHTML({ k: "code", l: "Kode booking", v: code || "", req: 1, max: 12, ph: "BK-XXXXX" }) + fieldHTML({ k: "phone", l: "Nomor telepon", v: "", req: 1, max: 18, ph: "0812-0000-0000" }) + '<button class="btn pri" type="submit">Cek booking</button></form>' + exampleHint("cek");
  return '<div class="page"><div class="wrap"><h1>Cek booking</h1><p class="mut">Masukkan kode booking dan nomor telepon yang dipakai saat booking.</p>' + (b ? bookingView(b) : form) + "</div></div>";
}
function bookingView(b) {
  var v = getVeh(b.vehId), c = getCust(b.custId), m = getMech(b.mechId), w = bkWO(b), out = '';
  var stb = { dibooking: ["Terjadwal", "info"], datang: ["Kendaraan diterima", "ok"], dibatalkan: ["Dibatalkan", "bad"] }[b.status];
  out += '<div class="split"><div class="card"><div class="row sb"><h3 style="margin:0">Booking ' + esc(b.code) + "</h3>" + badge(stb[0], stb[1]) + '</div><dl class="kv" style="margin-top:10px"><dt>Nama</dt><dd>' + esc(c.name) + "</dd><dt>Kendaraan</dt><dd>" + esc(v.brand + " " + v.model) + " " + plateHTML(v.plate) + "</dd><dt>Layanan</dt><dd>" + esc(bkSvcNames(b)) + "</dd><dt>Jadwal</dt><dd>" + esc(fd(b.date)) + ", " + b.time + " - " + hm(mm(b.time) + b.dur) + "</dd><dt>Bay</dt><dd>Bay " + (m ? m.bay : "-") + "</dd>" + (b.note ? "<dt>Catatan</dt><dd>" + esc(b.note) + "</dd>" : "") + "</dl>";
  if (b.status === "dibooking") out += '<div class="row" style="margin-top:14px"><button class="btn" type="button" data-act="rs-open" data-id="' + b.id + '">Jadwal ulang</button><button class="btn bad" type="button" data-act="bk-cancel" data-id="' + b.id + '">Batalkan booking</button></div>';
  if (b.status === "dibatalkan") out += '<p class="mut" style="margin-top:12px">Booking ini dibatalkan. <a href="#/booking">Buat booking baru</a></p>';
  out += '<div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-act="cek-reset">Cek kode lain</button></div></div>';
  if (w) out += woPublic(w); else out += '<div class="card"><h3>Status pekerjaan</h3><p class="mut" style="margin:0">' + (b.status === "dibatalkan" ? "Tidak ada pekerjaan untuk booking ini." : "Belum ada work order. Status muncul di sini setelah kendaraan diterima di bengkel.") + "</p></div>";
  return out + "</div>";
}
function woPublic(w) {
  var steps = [["menunggu", "Diterima, menunggu pemeriksaan"], ["dikerjakan", "Dikerjakan"], ["selesai", "Selesai, siap diambil"], ["diambil", "Sudah diambil"]];
  var idx = { menunggu: 0, dikerjakan: 1, suku_cadang: 1, selesai: 2, diambil: 3 }[w.status];
  var tl = steps.map(function (s, i) { var cl = i < idx ? "done" : i === idx ? "cur" : ""; return '<li class="' + cl + '">' + s[1] + (i === idx && w.status === "suku_cadang" ? ' <span class="badge bad">Menunggu suku cadang</span>' : "") + "</li>"; }).join("");
  var o = '<div class="card"><div class="row sb"><h3 style="margin:0">Status ' + esc(w.no) + "</h3>" + badge(stLabel(w.status), stClass(w.status)) + '</div><ol class="tl" style="margin-top:12px">' + tl + "</ol>";
  if (w.status === "suku_cadang" && w.hold) o += '<p class="sm mut">' + esc(w.hold) + "</p>";
  if (w.items.length) {
    o += '<h4 style="margin-top:6px">' + (w.est.status === "disetujui" && !w.est.reapp ? "Rincian biaya" : "Estimasi biaya") + '</h4><div class="tw"><table><tbody>' + w.items.map(function (i) { return "<tr><td>" + esc(i.name) + '<br><span class="sm mut">' + i.qty + " x " + rp(i.price) + '</span></td><td class="n">' + rp(i.qty * i.price) + "</td></tr>"; }).join("") + (w.disc ? '<tr><td>Diskon</td><td class="n">-' + rp(w.disc) + "</td></tr>" : "") + '<tr><td class="b">Total</td><td class="n b">' + rp(woTotal(w)) + "</td></tr></tbody></table></div>";
    o += '<p style="margin:10px 0 0">';
    if (w.est.status === "diajukan") o += badge("Menunggu persetujuan Anda", "warn") + '</p><div class="row" style="margin-top:10px"><button class="btn pri" type="button" data-act="est-ok" data-id="' + w.id + '">Setujui estimasi</button><button class="btn bad" type="button" data-act="est-no" data-id="' + w.id + '">Tolak</button></div>';
    else if (w.est.status === "disetujui") o += badge("Estimasi disetujui", "ok") + "</p>";
    else if (w.est.status === "ditolak") o += badge("Estimasi ditolak, bengkel akan menghubungi Anda", "bad") + "</p>";
    else o += badge(w.est.reapp ? "Biaya berubah, menunggu pengajuan ulang dari bengkel" : "Estimasi sedang disiapkan", "") + "</p>";
    if (woPaid(w)) o += '<p class="sm" style="margin:10px 0 0">Dibayar ' + rp(woPaid(w)) + (woDue(w) > 0 ? ", sisa " + rp(woDue(w)) : ", lunas") + "</p>";
    if (S.ver && (w.status === "selesai" || w.status === "diambil")) o += '<div class="row" style="margin-top:10px"><a class="btn sm" href="#/nota/' + w.id + '">Lihat nota</a></div>';
  } else o += '<p class="mut sm" style="margin:0">Rincian biaya muncul setelah pemeriksaan.</p>';
  return o + "</div>";
}
function viewRiwayat(plateQ) {
  var res = S.rw, out = "";
  var form = '<form data-form="riwayat" novalidate class="card" style="max-width:520px">' + fieldHTML({ k: "plate", l: "Plat nomor", v: plateQ || "", req: 1, max: 12, ph: "B 1234 ABC" }) + fieldHTML({ k: "phone", l: "Nomor telepon pemilik", v: "", req: 1, max: 18, ph: "0812-0000-0000" }) + '<button class="btn pri" type="submit">Lihat riwayat</button></form>' + exampleHint("rw");
  if (res) {
    var v = getVeh(res.vehId), c = getCust(v.custId), ws = DB.wos.filter(function (w) { return w.vehId === v.id; }).sort(function (a, b) { return a.created < b.created ? 1 : -1; });
    var rem = reminders().filter(function (x) { return x.veh.id === v.id; })[0];
    out = '<div class="card" style="margin-bottom:14px"><div class="row sb"><div><h3 style="margin:0">' + esc(v.brand + " " + v.model) + " " + plateHTML(v.plate) + '</h3><span class="sm mut">Pemilik ' + esc(c.name) + " | Km terakhir " + num(v.km) + '</span></div><div class="row"><button class="btn pri sm" type="button" data-act="rw-book" data-id="' + v.id + '">Booking servis</button><button class="btn sm" type="button" data-act="rw-reset">Cari kendaraan lain</button></div></div>' +
      (rem ? '<div class="card flat" style="margin-top:12px;background:' + (rem.left < 0 ? "var(--bad-s)" : rem.left <= 14 ? "var(--warn-s)" : "var(--ok-s)") + '"><b>Servis berikutnya</b><br>' + fd(rem.wo.nextDate) + " atau di " + num(rem.wo.nextKm) + " km, mana yang lebih dulu. " + (rem.left < 0 ? "<b>Sudah lewat " + -rem.left + " hari.</b>" : rem.left === 0 ? "<b>Hari ini.</b>" : "Sekitar " + rem.left + " hari lagi.") + "</div>" : '<p class="mut sm" style="margin:10px 0 0">Pengingat muncul setelah servis pertama selesai dan kendaraan diambil.</p>') + "</div>";
    out += "<h2>Riwayat servis</h2>" + (ws.length ? ws.map(function (w) {
      return '<details class="faq"><summary>' + esc(fds(w.created.slice(0, 10))) + " | " + esc(w.no) + " | " + stLabel(w.status) + " | " + rp(woTotal(w)) + '</summary><div style="padding:0 14px 14px"><p class="sm mut">Km ' + num(w.km) + (w.complaint ? " | " + esc(w.complaint) : "") + "</p>" + (w.items.length ? "<ul>" + w.items.map(function (i) { return "<li>" + esc(i.name) + " x" + i.qty + " <span class=\"mut\">" + rp(i.qty * i.price) + "</span></li>"; }).join("") + "</ul>" : '<p class="mut sm">Belum ada item.</p>') + (w.status === "selesai" || w.status === "diambil" ? '<a class="btn sm" href="#/nota/' + w.id + '">Lihat nota</a>' : "") + "</div></details>";
    }).join("") : '<div class="empty">Belum ada riwayat servis untuk kendaraan ini.</div>');
  }
  return '<div class="page"><div class="wrap"><h1>Riwayat servis kendaraan</h1><p class="mut">Cari dengan plat nomor dan nomor telepon pemilik.</p>' + (res ? out : form) + "</div></div>";
}
function notaHTML(w, forAdmin) {
  var v = getVeh(w.vehId), c = getCust(w.custId), m = getMech(w.mechId), paid = woPaid(w), due = woDue(w);
  var title = w.status === "selesai" || w.status === "diambil" ? "Nota servis" : "Estimasi biaya";
  return '<div class="nota"><div class="hd"><div><h2>' + esc(SHOP.name) + '</h2><span class="sm">' + esc(SHOP.addr) + "<br>Telepon " + esc(SHOP.tel) + '</span></div><div style="text-align:right"><b style="font-size:18px">' + title.toUpperCase() + '</b><br><span class="sm">' + esc(w.invNo || w.no) + "<br>" + esc(fts(w.pickedAt || w.doneAt || w.created)) + '</span></div></div><div class="grid2" style="gap:0 20px;margin-bottom:12px"><dl class="kv"><dt>Pelanggan</dt><dd>' + esc(c.name) + "</dd><dt>Telepon</dt><dd>" + esc(fPhone(c.phone)) + '</dd></dl><dl class="kv"><dt>Kendaraan</dt><dd>' + esc(v.brand + " " + v.model) + " " + plateHTML(v.plate) + "</dd><dt>Km masuk</dt><dd>" + num(w.km) + "</dd><dt>Work order</dt><dd>" + esc(w.no) + "</dd>" + (m ? "<dt>Mekanik</dt><dd>" + esc(m.name) + "</dd>" : "") + '</dl></div><table><thead><tr><th>Uraian</th><th class="n">Jml</th><th class="n">Harga</th><th class="n">Subtotal</th></tr></thead><tbody>' + (w.items.length ? w.items.map(function (i) { return "<tr><td>" + esc(i.name) + '<br><span class="sm mut">' + (i.t === "part" ? "Suku cadang" : "Jasa") + '</span></td><td class="n">' + i.qty + '</td><td class="n">' + rp(i.price) + '</td><td class="n">' + rp(i.qty * i.price) + "</td></tr>"; }).join("") : '<tr><td colspan="4" class="mut">Belum ada item</td></tr>') + '</tbody></table><div class="tot"><span>Jasa</span><span class="r">' + rp(sumItems(w, "jasa")) + "</span><span>Suku cadang</span><span class=\"r\">" + rp(sumItems(w, "part")) + "</span>" + (w.disc ? "<span>Diskon</span><span class=\"r\">-" + rp(w.disc) + "</span>" : "") + '<span class="big">Total</span><span class="big r">' + rp(woTotal(w)) + "</span><span>Dibayar</span><span class=\"r\">" + rp(paid) + "</span><span>Sisa</span><span class=\"r b\">" + rp(Math.max(0, due)) + "</span></div>" + (w.pays.length ? '<p class="sm" style="margin:10px 0 0">Pembayaran: ' + w.pays.map(function (p) { return esc(fts(p.at)) + " " + esc(p.method) + " " + rp(p.amt); }).join("; ") + "</p>" : "") + '<div class="row sb" style="margin-top:18px"><span class="sm mut">Terima kasih. Simpan nota ini sebagai bukti servis.' + (w.nextDate ? "<br>Servis berikutnya: " + esc(fds(w.nextDate)) + " atau " + num(w.nextKm) + " km." : "") + "</span>" + (due <= 0 && w.items.length ? '<span class="stamp">LUNAS</span>' : due > 0 && w.items.length ? '<span class="stamp x">BELUM LUNAS</span>' : "") + "</div></div>";
}
function viewNota(id, admin) {
  var w = getWO(id); if (!w) return viewNotFound();
  var back = admin ? "#/admin/wo/" + w.id : "#/riwayat";
  return (admin ? "" : '<div class="page"><div class="wrap">') + '<div class="row noprint" style="margin-bottom:12px;justify-content:center"><a class="btn" href="' + back + '">Kembali</a><button class="btn pri" type="button" data-act="print">Cetak nota</button></div>' + notaHTML(w, admin) + (admin ? "" : "</div></div>");
}

/* ---------- router dan render ---------- */
function parts() { var h = location.hash.replace(/^#\/?/, ""); return h ? h.split("/") : []; }
function render() {
  var p = parts(), app = $("#app"), isAdm = p[0] === "admin", html;
  document.body.className = isAdm ? "adm" : "";
  if (isAdm) { html = renderAdmin(p); }
  else {
    var r = p[0] || "home", main;
    if (r === "home") main = viewHome();
    else if (r === "booking") main = viewBooking();
    else if (r === "sukses") main = viewSukses(p[1]);
    else if (r === "cek") main = viewCek(p[1]);
    else if (r === "riwayat") main = viewRiwayat();
    else if (r === "nota") main = (S.ver && S.ver.custId && getWO(p[1]) && getWO(p[1]).custId === S.ver.custId) ? viewNota(p[1], false) : '<div class="page"><div class="wrap"><div class="empty">Nota hanya bisa dibuka setelah verifikasi di <a href="#/riwayat">Riwayat servis</a> atau <a href="#/cek">Cek booking</a>.</div></div></div>';
    else main = viewNotFound();
    html = pubHeader(r) + '<main id="main" tabindex="-1">' + main + "</main>" + pubFooter();
  }
  app.innerHTML = html;
  if (!isAdm && p[0] === "booking") bkInit();
  if (isAdm) adminAfter(p);
}
function go(h) { if (location.hash === h) render(); else location.hash = h; }
window.addEventListener("hashchange", function () { S.menu = false; closeDlg(); render(); window.scrollTo(0, 0); var m = $("#main"); if (m) m.focus({ preventScroll: true }); });
window.addEventListener("error", function (e) { window.__errs = (window.__errs || []).concat(String(e.message)); });

/* ---------- aksi (delegasi) ---------- */
var ACT = {}, FORM = {}, ON = {};
document.addEventListener("click", function (e) {
  var sd = e.target.closest("[data-sp-d]"), st = e.target.closest("[data-sp-t]");
  if (sd || st) {
    var root = (sd || st).closest(".sp"); if (!root) return;
    if (sd) { root._d = sd.getAttribute("data-sp-d"); root._t = ""; } else root._t = st.getAttribute("data-sp-t");
    spRender(root); return;
  }
  var el = e.target.closest("[data-act]"); if (!el) { if (e.target === $("#dlg")) closeDlg(); return; }
  var a = el.getAttribute("data-act"); if (!ACT[a]) return;
  e.preventDefault(); ACT[a](el, e);
});
document.addEventListener("submit", function (e) {
  var f = e.target.closest("form[data-form]"); if (!f) return; e.preventDefault();
  var n = f.getAttribute("data-form"); if (FORM[n]) FORM[n](f);
});
document.addEventListener("change", function (e) { var el = e.target.closest("[data-on]"); if (el && ON[el.getAttribute("data-on")]) ON[el.getAttribute("data-on")](el); });
document.addEventListener("input", function (e) { var el = e.target.closest("[data-oi]"); if (el && ON[el.getAttribute("data-oi")]) ON[el.getAttribute("data-oi")](el); });

ACT.menu = function () { S.menu = !S.menu; var n = $("#pnav"), b = $(".menu-btn"); n.classList.toggle("open", S.menu); document.body.classList.toggle("lock", S.menu); b.setAttribute("aria-expanded", S.menu); b.textContent = S.menu ? "Tutup" : "Menu"; };
ACT.scroll = function (el) { var to = el.getAttribute("data-to"); S.menu = false; function z() { var s = document.getElementById(to); if (s) s.scrollIntoView(); } if (parts().length) { location.hash = "#/"; setTimeout(z, 60); } else { render(); z(); } };
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && S.menu) { S.menu = false; render(); } });
ACT.dclose = function () { closeDlg(); };
ACT.print = function () { window.print(); };
ACT.copy = function (el) { var v = el.getAttribute("data-v"); try { navigator.clipboard.writeText(v).then(function () { toast("Kode disalin"); }, function () { toast("Salin manual: " + v); }); } catch (e) { toast("Salin manual: " + v); } };
ACT["svc-filter"] = function (el) { S.svcFilter = el.getAttribute("data-v"); render(); var s = $("#layanan"); if (s) s.scrollIntoView(); };
ACT["pick-svc"] = function (el) { var s = getSvc(el.getAttribute("data-id")); S.bk = { type: s.type === "semua" ? "motor" : s.type, svc: [s.id] }; go("#/booking"); };
ACT["fill-cek"] = function (el) { $("#ff_code").value = el.getAttribute("data-a"); $("#ff_phone").value = fPhone(el.getAttribute("data-b")); };
ACT["fill-rw"] = function (el) { $("#ff_plate").value = el.getAttribute("data-a"); $("#ff_phone").value = fPhone(el.getAttribute("data-b")); };
ACT["cek-reset"] = function () { S.ver = null; go("#/cek"); };
ACT["rw-reset"] = function () { S.rw = null; render(); };
ACT["rw-book"] = function (el) { var v = getVeh(el.getAttribute("data-id")), c = getCust(v.custId); S.bk = { type: v.type, brand: v.brand, model: v.model, plate: v.plate, km: v.km, year: v.year, name: c.name, phone: fPhone(c.phone), svc: [] }; go("#/booking"); };
ACT["bk-cancel"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi untuk membatalkan"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Batalkan booking"; } }, 4000); return; }
  var b = getBk(el.getAttribute("data-id")); if (!b || b.status !== "dibooking") return toast("Booking tidak bisa dibatalkan", true);
  b.status = "dibatalkan"; b.cancelNote = "Dibatalkan pelanggan"; save(); toast("Booking dibatalkan"); render();
};
ACT["rs-open"] = function (el) {
  var b = getBk(el.getAttribute("data-id")), v = getVeh(b.vehId);
  openDlg("Jadwal ulang " + b.code, '<p class="mut sm">Jadwal sekarang: ' + esc(fd(b.date)) + ", " + b.time + ". Durasi " + b.dur + " menit.</p>" + spHTML("rssp"), '<button class="btn" type="button" data-act="dclose">Batal</button><button class="btn pri" type="button" data-act="rs-ok" data-id="' + b.id + '">Simpan jadwal baru</button>');
  spMount($("#rssp"), { dur: function () { return b.dur; }, type: function () { return v.type; }, ignore: b.id });
};
ACT["rs-ok"] = function (el) {
  var b = getBk(el.getAttribute("data-id")), sp = $("#rssp");
  if (!sp._d || !sp._t) { $("[data-sperr]", sp).textContent = "Pilih tanggal dan jam baru"; return; }
  var er = rescheduleBooking(b, sp._d, sp._t); if (er) { $("[data-sperr]", sp).textContent = er; spRender(sp); return; }
  closeDlg(); toast("Jadwal diubah ke " + fds(b.date) + ", " + b.time); render();
};
function setEst(id, ok) {
  var w = getWO(id); if (!w || w.est.status !== "diajukan") return toast("Estimasi tidak sedang menunggu persetujuan", true);
  if (ok) { w.est.status = "disetujui"; w.est.total = woTotal(w); w.est.reapp = false; w.est.at = nowTs(); w.est.by = "Pelanggan (online)"; toast("Estimasi disetujui"); }
  else { w.est.status = "ditolak"; w.est.by = "Pelanggan (online)"; toast("Estimasi ditolak"); }
  save(); render();
}
ACT["est-ok"] = function (el) { setEst(el.getAttribute("data-id"), true); };
ACT["est-no"] = function (el) { setEst(el.getAttribute("data-id"), false); };
ON["bk-type"] = function () {
  var type = bkType(), keep = bkSelected().filter(function (i) { var s = getSvc(i); return s && (s.type === "semua" || s.type === type); });
  $("#svcbox").innerHTML = svcBoxHTML(type, keep) + '<div class="err" role="alert"></div>'; $("#brands").innerHTML = BRANDS[type].map(function (b) { return '<option value="' + b + '">'; }).join("");
  var sp = $("#bksp"); sp._t = ""; spRender(sp);
};
ON["bk-svc"] = function () { var sp = $("#bksp"); spRender(sp); };
FORM.ticket = function (f) {
  var pl = normPlate(f.elements.tkplate.value), box = $("#tk_f"), er = $("#tk_err");
  if (!pl || !/^[A-Z]{1,2}\d{1,4}[A-Z]{0,3}$/.test(pl)) { box.classList.add("bad"); er.textContent = pl ? "Plat belum benar. Contoh: B 1234 ABC" : "Isi plat nomor dulu."; f.elements.tkplate.focus(); return; }
  S.bk = { type: f.elements.tktype.value, plate: fmtPlate(pl), svc: [] }; go("#/booking");
};
FORM.booking = function (f) {
  var fields = [{ k: "brand", req: 1, max: 30 }, { k: "model", req: 1, max: 30 }, { k: "plate", req: 1, max: 12 }, { k: "km", t: "number", req: 1, min: 0, maxn: 999999 }, { k: "year", t: "number", min: 1980, maxn: new Date().getFullYear() + 1 }, { k: "name", req: 1, max: 60 }, { k: "phone", req: 1, max: 18 }, { k: "note", max: 300 }];
  var r = validate(fields, formVals(f)), errs = r.errs, v = r.vals, ids = bkSelected(), sp = $("#bksp");
  if (!errs.plate && !/^[A-Z]{1,2}\d{1,4}[A-Z]{0,3}$/.test(normPlate(v.plate))) errs.plate = "Format plat tidak dikenal, contoh B 1234 ABC";
  if (!errs.phone && !okPhone(v.phone)) errs.phone = "Nomor telepon tidak valid, contoh 0812-0000-0000";
  if (!ids.length) errs.svc = "Pilih minimal satu layanan";
  if (!sp._d || !sp._t) errs.slot = "Pilih tanggal dan jam";
  $("[data-f=slot] .err", f).textContent = "";
  if (Object.keys(errs).length) {
    showErrs(f, errs); if (errs.slot) { $("[data-sperr]", sp).textContent = errs.slot; if (Object.keys(errs).length === 1) sp.scrollIntoView({ block: "center" }); }
    return;
  }
  var dup = DB.bookings.filter(function (b) { return b.status === "dibooking" && normPhone(getCust(b.custId).phone) === normPhone(v.phone) && b.date === sp._d && normPlate(getVeh(b.vehId).plate) === normPlate(v.plate); })[0];
  if (dup) { showErrs(f, { _: "Kendaraan ini sudah punya booking di tanggal tersebut (" + dup.code + "). Ubah lewat Cek booking." }); return; }
  var type = bkType(), res = createBooking({ type: type, brand: v.brand, model: v.model, plate: v.plate, km: v.km, year: v.year, name: v.name, phone: v.phone, note: v.note, svc: ids, date: sp._d, time: sp._t });
  if (res.err) { showErrs(f, { _: res.err }); spRender(sp); return; }
  S.bk = {}; toast("Booking diterima"); go("#/sukses/" + res.b.code);
};
FORM.cek = function (f) {
  var r = validate([{ k: "code", req: 1, max: 12 }, { k: "phone", req: 1, max: 18 }], formVals(f)), errs = r.errs;
  if (Object.keys(errs).length) return showErrs(f, errs);
  var code = r.vals.code.toUpperCase(), b = DB.bookings.filter(function (x) { return x.code === code; })[0];
  if (!b || normPhone(getCust(b.custId).phone) !== normPhone(r.vals.phone)) return showErrs(f, { _: "Kode atau nomor telepon tidak cocok. Periksa lagi." });
  S.ver = { bkId: b.id, custId: b.custId }; go("#/cek/" + b.code); render();
};
FORM.riwayat = function (f) {
  var r = validate([{ k: "plate", req: 1, max: 12 }, { k: "phone", req: 1, max: 18 }], formVals(f)), errs = r.errs;
  if (Object.keys(errs).length) return showErrs(f, errs);
  var v = DB.vehs.filter(function (x) { return normPlate(x.plate) === normPlate(r.vals.plate); })[0], c = v && getCust(v.custId);
  if (!v || normPhone(c.phone) !== normPhone(r.vals.phone)) return showErrs(f, { _: "Plat dan nomor telepon tidak cocok dengan data kami." });
  S.rw = { vehId: v.id }; S.ver = { custId: c.id }; render();
};
FORM.dyn = function (f) {
  var o = S.dyn; if (!o) return;
  var r = validate(o.fields, formVals(f)); if (Object.keys(r.errs).length) return showErrs(f, r.errs);
  var er = o.submit(r.vals); if (er) { showErrs(f, typeof er === "string" ? { _: er } : er); return; }
  closeDlg();
};
window.addEventListener("storage", function () { DB = load(); });
function boot() { if (!location.hash) history.replaceState(null, "", location.pathname + location.search + "#/"); render(); }
