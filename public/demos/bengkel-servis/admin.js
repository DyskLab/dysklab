"use strict";
/* Panel bengkel (#/admin). PIN demo ada di layar login. */
var CATS = ["Berkala", "Oli", "Rem", "AC", "Tune up", "Ban", "Kelistrikan", "Paket", "Lainnya"];
function isAuth() { try { return sessionStorage.getItem(AUTHKEY) === "1"; } catch (e) { return !!S.auth; } }
function waLink(phone, text) { return "https://wa.me/" + waNum(phone) + "?text=" + encodeURIComponent(text); }
function vehLabel(v) { return v.brand + " " + v.model; }
function woBadges(w) {
  var b = [];
  if (w.status === "menunggu") b.push(w.est.status === "diajukan" ? badge("Menunggu persetujuan", "warn") : w.est.status === "ditolak" ? badge("Estimasi ditolak", "bad") : w.items.length ? badge("Estimasi belum diajukan", "") : badge("Belum ada item", ""));
  if (w.est.reapp && w.est.status !== "disetujui") b.push(badge("Perlu persetujuan ulang", "bad"));
  if (w.items.length && (w.status === "selesai" || w.status === "diambil" || woPaid(w))) b.push(woDue(w) <= 0 ? badge("Lunas", "ok") : badge("Sisa " + rp(woDue(w)), "warn"));
  return b.join("");
}
function nextActions(w) {
  var id = w.id, b = function (to, label, cls) { return '<button class="btn sm ' + (cls || "") + '" type="button" data-act="wo-move" data-id="' + id + '" data-to="' + to + '">' + label + "</button>"; };
  if (w.status === "menunggu") return b("dikerjakan", "Mulai dikerjakan", "pri");
  if (w.status === "dikerjakan") return b("selesai", "Tandai selesai", "pri") + '<button class="btn sm" type="button" data-act="wo-hold" data-id="' + id + '">Tahan: suku cadang</button>';
  if (w.status === "suku_cadang") return b("dikerjakan", "Lanjut dikerjakan", "pri");
  if (w.status === "selesai") return b("diambil", "Serahkan kendaraan", "pri") + b("dikerjakan", "Buka kembali");
  return "";
}
function loginView() {
  return '<header class="ah"><div class="wrap"><a class="brand" href="#/"><span class="logo" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" stroke-width="2.6" stroke-linecap="square"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg></span>' + esc(SHOP.name) + '</a><a class="btn sm" href="#/">Lihat situs</a></div></header><div class="login"><form class="card" data-form="login" novalidate style="margin:16px"><h1 style="font-size:1.5rem">Panel bengkel</h1><p class="mut">Masuk untuk mengelola booking, work order, stok, dan laporan.</p>' + fieldHTML({ k: "pin", l: "PIN", t: "password", req: 1, max: 8, hint: "PIN demo: " + PIN }) + '<button class="btn pri" type="submit" style="width:100%">Masuk</button></form></div>';
}
FORM.login = function (f) {
  var pin = String(formVals(f).pin || "").trim();
  if (pin !== PIN) return showErrs(f, { pin: "PIN salah. PIN demo adalah " + PIN });
  try { sessionStorage.setItem(AUTHKEY, "1"); } catch (e) { S.auth = true; }
  go("#/admin/papan");
};
ACT.logout = function () { try { sessionStorage.removeItem(AUTHKEY); } catch (e) { } S.auth = false; go("#/admin"); };
ACT.reset = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi untuk reset"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Reset data demo"; } }, 4000); return; }
  try { localStorage.removeItem(KEY); } catch (e) { }
  seed(); S.bk = {}; S.ver = null; S.rw = null; S.boardTab = "semua"; S.woQ = ""; S.woSt = "semua"; S.cQ = ""; toast("Data demo dikembalikan"); go("#/admin/papan"); render();
};
function adminHeader() {
  return '<header class="ah"><div class="wrap"><a class="brand" href="#/admin/papan"><span class="logo" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" stroke-width="2.6" stroke-linecap="square"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg></span>Panel bengkel</a><span class="who">' + esc(SHOP.name) + '</span><a class="btn sm" href="#/">Lihat situs</a><button class="menu-btn" type="button" data-act="amenu" aria-expanded="' + S.menu + '" aria-controls="anav">Menu</button></div></header>';
}
ACT.amenu = function () { S.menu = !S.menu; $("#anav").classList.toggle("open", S.menu); $(".menu-btn").setAttribute("aria-expanded", S.menu); };
function adminNav(cur) {
  var t = today(), act = DB.wos.filter(function (w) { return w.status !== "diambil"; }).length, bt = DB.bookings.filter(function (b) { return b.date === t && b.status === "dibooking"; }).length, low = lowParts().length, due = reminders().filter(function (r) { return r.left <= 14 && !r.booked; }).length;
  var items = [["papan", "Papan kerja", act], ["booking", "Booking", bt], ["wo", "Work order", 0], ["layanan", "Layanan", 0], ["mekanik", "Mekanik", 0], ["suku-cadang", "Suku cadang", low], ["pelanggan", "Pelanggan", 0], ["pengingat", "Pengingat servis", due], ["laporan", "Laporan", 0]];
  return '<nav class="anav' + (S.menu ? " open" : "") + '" id="anav" aria-label="Menu panel">' + items.map(function (i) { return '<a href="#/admin/' + i[0] + '"' + (cur === i[0] ? ' class="on" aria-current="page"' : "") + "><span>" + i[1] + "</span>" + (i[2] ? '<span class="cnt">' + i[2] + "</span>" : "") + "</a>"; }).join("") + '<hr style="width:100%;border:0;border-top:1px solid var(--line);margin:8px 0"><button class="btn sm" type="button" data-act="reset">Reset data demo</button><button class="btn sm" type="button" data-act="logout" style="margin-top:6px">Keluar</button></nav>';
}
function renderAdmin(p) {
  if (!isAuth()) return '<main id="main" tabindex="-1">' + loginView() + "</main>";
  var sub = p[1] || "papan", main, cur = sub;
  if (sub === "papan") main = viewBoard();
  else if (sub === "booking") main = viewAdmBooking();
  else if (sub === "wo") { main = p[2] ? viewWO(p[2]) : viewWOList(); }
  else if (sub === "layanan") main = viewServices();
  else if (sub === "mekanik") main = viewMechs();
  else if (sub === "suku-cadang") main = viewParts();
  else if (sub === "pelanggan") main = p[2] ? viewCustDetail(p[2]) : viewCusts();
  else if (sub === "pengingat") main = viewReminders();
  else if (sub === "laporan") main = viewReports();
  else if (sub === "nota") { main = viewNota(p[2], true); cur = "wo"; }
  else main = '<div class="empty">Halaman tidak ditemukan. <a href="#/admin/papan">Ke papan kerja</a></div>';
  return adminHeader() + '<div class="ashell">' + adminNav(cur) + '<main class="amain" id="main" tabindex="-1">' + main + "</main></div>";
}
function adminAfter() { }
function hd(title, extra) { return '<div class="ph1"><h1>' + title + "</h1>" + (extra ? '<div class="row">' + extra + "</div>" : "") + "</div>"; }

/* ---------- papan kerja ---------- */
function woCard(w) {
  var v = getVeh(w.vehId), c = getCust(w.custId), m = getMech(w.mechId);
  return '<div class="wo"><a href="#/admin/wo/' + w.id + '" style="text-decoration:none;color:inherit;display:block"><div class="t">' + plateHTML(v.plate) + '<span class="sm mut">' + esc(w.no) + '</span></div><b>' + esc(vehLabel(v)) + '</b><div class="sm mut">' + esc(c.name) + " | " + (m ? "Bay " + m.bay + " " + esc(m.name) : "Belum ada mekanik") + '</div><div class="sm">' + (w.items.length ? rp(woTotal(w)) : "Belum ada rincian") + '</div><div class="badges">' + woBadges(w) + (w.status === "suku_cadang" && w.hold ? badge(w.hold.length > 40 ? w.hold.slice(0, 38) + "..." : w.hold, "bad") : "") + "</div></a>" + (nextActions(w) ? '<div class="row adv">' + nextActions(w) + "</div>" : "") + "</div>";
}
function viewBoard() {
  var t = today(), act = DB.wos.filter(function (w) { return w.status !== "diambil"; }), bt = DB.bookings.filter(function (b) { return b.date === t && b.status === "dibooking"; }).length, ap = DB.wos.filter(function (w) { return w.est.status === "diajukan"; }).length, low = lowParts().length;
  var recent = DB.wos.filter(function (w) { return w.status === "diambil" && w.pickedAt.slice(0, 10) >= addD(t, -2); });
  var tab = S.boardTab, cols = FLOW.map(function (s) {
    var l = (s === "diambil" ? recent : act.filter(function (w) { return w.status === s; })).sort(function (a, b) { return a.created < b.created ? -1 : 1; });
    return { s: s, l: l };
  });
  var chips = '<div class="bt" role="group" aria-label="Filter status"><button class="chip' + (tab === "semua" ? " on" : "") + '" type="button" data-act="board-tab" data-v="semua">Semua</button>' + cols.map(function (c) { return '<button class="chip' + (tab === c.s ? " on" : "") + '" type="button" data-act="board-tab" data-v="' + c.s + '">' + stLabel(c.s) + "<small>" + c.l.length + "</small></button>"; }).join("") + "</div>";
  var show = tab === "semua" ? cols : cols.filter(function (c) { return c.s === tab; });
  var board = '<div class="board ' + (tab === "semua" ? "all" : "cols") + '">' + show.map(function (c) { return '<section class="col" aria-label="' + stLabel(c.s) + '"><h3><span>' + stLabel(c.s) + "</span><span>" + c.l.length + "</span></h3>" + (c.l.length ? c.l.map(woCard).join("") : '<div class="empty" style="padding:14px;font-size:13px">Kosong</div>') + "</section>"; }).join("") + "</div>";
  return hd("Papan kerja", '<button class="btn pri" type="button" data-act="wo-new">+ Work order</button>') + '<div class="stats"><a class="stat" href="#/admin/papan"><b>' + act.length + "</b><span>Kendaraan di bengkel</span></a><a class=\"stat\" href=\"#/admin/booking\"><b>" + bt + "</b><span>Booking hari ini belum datang</span></a><button class=\"stat" + (ap ? " alert" : "") + "\" type=\"button\" data-act=\"board-tab\" data-v=\"menunggu\"><b>" + ap + "</b><span>Menunggu persetujuan pelanggan</span></button><a class=\"stat" + (low ? " alert" : "") + "\" href=\"#/admin/suku-cadang\"><b>" + low + "</b><span>Suku cadang menipis atau habis</span></a></div>" + chips + board;
}
ACT["board-tab"] = function (el) { S.boardTab = el.getAttribute("data-v"); if (parts()[1] !== "papan") go("#/admin/papan"); else render(); };
ACT["wo-move"] = function (el) {
  var w = getWO(el.getAttribute("data-id")), to = el.getAttribute("data-to"), er = moveWO(w, to);
  if (er) return toast(er, true);
  toast(w.no + ": " + stLabel(to)); render();
};
ACT["wo-hold"] = function (el) {
  var w = getWO(el.getAttribute("data-id"));
  openForm({ title: "Tahan: menunggu suku cadang", ok: "Tahan pekerjaan", fields: [{ k: "hold", l: "Suku cadang yang ditunggu", t: "textarea", req: 1, max: 160, v: w.hold, ph: "Contoh: kampas rem belakang, dipesan ke pemasok", wide: 1 }], submit: function (v) { var er = moveWO(w, "suku_cadang"); if (er) return er; w.hold = v.hold; save(); toast("Pekerjaan ditahan"); render(); } });
};

/* ---------- work order: daftar dan buat ---------- */
function woRow(w) {
  var v = getVeh(w.vehId), c = getCust(w.custId);
  return '<a class="li" href="#/admin/wo/' + w.id + '" style="text-decoration:none;color:inherit"><div class="main"><b>' + esc(w.no) + "</b> " + plateHTML(v.plate) + '<div class="sm mut">' + esc(vehLabel(v)) + " | " + esc(c.name) + " | " + esc(fts(w.created)) + '</div></div><div class="row">' + badge(stLabel(w.status), stClass(w.status)) + woBadges(w) + '<b class="nowrap">' + rp(woTotal(w)) + "</b></div></a>";
}
function woFiltered() {
  var q = S.woQ.trim().toLowerCase(), qp = normPlate(S.woQ);
  return DB.wos.filter(function (w) {
    if (S.woSt !== "semua" && w.status !== S.woSt) return false;
    if (!q) return true; var v = getVeh(w.vehId), c = getCust(w.custId);
    return w.no.toLowerCase().indexOf(q) >= 0 || c.name.toLowerCase().indexOf(q) >= 0 || (qp && normPlate(v.plate).indexOf(qp) >= 0) || (w.invNo || "").toLowerCase().indexOf(q) >= 0;
  }).sort(function (a, b) { return a.created < b.created ? 1 : -1; });
}
function woListHTML() { var l = woFiltered(); return l.length ? '<div class="list">' + l.slice(0, 60).map(woRow).join("") + "</div>" + (l.length > 60 ? '<p class="mut sm">Menampilkan 60 dari ' + l.length + ". Persempit pencarian.</p>" : "") : '<div class="empty">Tidak ada work order yang cocok.</div>'; }
function viewWOList() {
  return hd("Work order", '<button class="btn" type="button" data-act="csv-wo">Unduh CSV</button><button class="btn pri" type="button" data-act="wo-new">+ Work order</button>') + '<div class="toolbar"><div class="f"><label for="woq">Cari plat, nama, atau nomor</label><input id="woq" type="search" value="' + esc(S.woQ) + '" data-oi="wo-q" autocomplete="off"></div><div class="f"><label for="wost">Status</label><select id="wost" data-on="wo-st"><option value="semua">Semua status</option>' + FLOW.map(function (s) { return '<option value="' + s + '"' + (S.woSt === s ? " selected" : "") + ">" + stLabel(s) + "</option>"; }).join("") + '</select></div></div><div id="wolist" aria-live="polite">' + woListHTML() + "</div>";
}
ON["wo-q"] = function (el) { S.woQ = el.value; $("#wolist").innerHTML = woListHTML(); };
ON["wo-st"] = function (el) { S.woSt = el.value; $("#wolist").innerHTML = woListHTML(); };
function mechOpts(type, none) { var o = [[0, none || "Belum dipilih"]]; DB.mechs.filter(function (m) { return m.active && (!type || m.skill === "semua" || m.skill === type); }).forEach(function (m) { o.push([m.id, "Bay " + m.bay + " | " + m.name + " (" + m.skill + ")"]); }); return o; }
ACT["wo-new"] = function () {
  var vo = [[0, "Kendaraan baru"]].concat(DB.vehs.map(function (v) { return [v.id, v.plate + " | " + vehLabel(v) + " | " + getCust(v.custId).name]; }));
  openForm({ title: "Work order baru (tanpa booking)", ok: "Buat work order", fields: [
    { k: "veh", l: "Kendaraan", t: "select", opts: vo, v: 0, wide: 1 },
    { k: "type", l: "Jenis (kendaraan baru)", t: "select", opts: [["motor", "Motor"], ["mobil", "Mobil"]], v: "motor" }, { k: "plate", l: "Plat (kendaraan baru)", max: 12, ph: "B 1234 ABC" },
    { k: "brand", l: "Merek (kendaraan baru)", max: 30 }, { k: "model", l: "Model (kendaraan baru)", max: 30 },
    { k: "name", l: "Nama pemilik (kendaraan baru)", max: 60 }, { k: "phone", l: "Telepon (kendaraan baru)", max: 18, ph: "0812-0000-0000" },
    { k: "km", l: "Km masuk", t: "number", req: 1, min: 0, maxn: 999999 }, { k: "mech", l: "Mekanik", t: "select", opts: mechOpts("", "Belum dipilih"), v: 0 },
    { k: "complaint", l: "Keluhan", t: "textarea", req: 1, max: 300, wide: 1 }], submit: function (v) {
    var veh, cust;
    if (+v.veh) { veh = getVeh(v.veh); cust = getCust(veh.custId); }
    else {
      var er = {}; if (!v.brand) er.brand = "Wajib diisi"; if (!v.model) er.model = "Wajib diisi"; if (!v.name) er.name = "Wajib diisi";
      if (!/^[A-Z]{1,2}\d{1,4}[A-Z]{0,3}$/.test(normPlate(v.plate))) er.plate = "Plat tidak valid, contoh B 1234 ABC"; if (!okPhone(v.phone)) er.phone = "Telepon tidak valid";
      if (Object.keys(er).length) return er;
      cust = upsertCust(v.name, v.phone); veh = upsertVeh(cust.id, v.type, v.brand, v.model, v.plate, "", v.km);
    }
    if (DB.wos.some(function (w) { return w.vehId === veh.id && w.status !== "diambil"; })) return { veh: "Kendaraan ini masih punya work order yang belum diambil" };
    if (+v.mech) { var mm_ = getMech(v.mech); if (mm_.skill !== "semua" && mm_.skill !== veh.type) return { mech: "Mekanik ini tidak menangani " + veh.type }; }
    var w = newWO({ custId: cust.id, vehId: veh.id, km: v.km, complaint: v.complaint, mechId: +v.mech || 0 }); if (v.km > (veh.km || 0)) veh.km = v.km; save(); toast(w.no + " dibuat"); go("#/admin/wo/" + w.id);
  } });
};
ACT["csv-wo"] = function () {
  var rows = [["No WO", "Tanggal masuk", "Plat", "Kendaraan", "Pelanggan", "Mekanik", "Status", "Jasa", "Suku cadang", "Diskon", "Total", "Dibayar", "Sisa", "Nota"]];
  DB.wos.slice().sort(function (a, b) { return a.created < b.created ? -1 : 1; }).forEach(function (w) { var v = getVeh(w.vehId), m = getMech(w.mechId); rows.push([w.no, w.created, v.plate, vehLabel(v), getCust(w.custId).name, m ? m.name : "", stLabel(w.status), sumItems(w, "jasa"), sumItems(w, "part"), w.disc || 0, woTotal(w), woPaid(w), woDue(w), w.invNo]); });
  csvDown("work-order.csv", rows);
};

/* ---------- work order: detail ---------- */
function stepper(w) { var i = FLOW.indexOf(w.status); return '<div class="stepper" aria-label="Status">' + FLOW.map(function (s, k) { return '<span class="' + (k < i ? "past" : k === i ? "on" : "") + '">' + stLabel(s) + "</span>"; }).join("") + "</div>"; }
function itemRow(w, i) {
  var ed = editable(w);
  return '<div class="li"><div class="main"><b>' + esc(i.name) + '</b> ' + badge(i.t === "part" ? "Suku cadang" : "Jasa", i.t === "part" ? "info" : "") + '<div class="sm mut">' + rp(i.price) + (i.t === "part" ? " per " + esc((getPart(i.ref) || {}).unit || "unit") : "") + '</div></div><div class="row">' + (ed ? '<button class="btn sm" type="button" data-act="item-qty" data-wo="' + w.id + '" data-id="' + i.id + '" data-d="-1" aria-label="Kurangi jumlah ' + esc(i.name) + '">-</button>' : "") + '<b style="min-width:26px;text-align:center" aria-label="Jumlah">' + i.qty + "</b>" + (ed ? '<button class="btn sm" type="button" data-act="item-qty" data-wo="' + w.id + '" data-id="' + i.id + '" data-d="1" aria-label="Tambah jumlah ' + esc(i.name) + '">+</button>' : "") + '<b class="nowrap" style="min-width:92px;text-align:right">' + rp(i.qty * i.price) + "</b>" + (ed ? '<button class="btn sm bad" type="button" data-act="item-del" data-wo="' + w.id + '" data-id="' + i.id + '" aria-label="Hapus ' + esc(i.name) + '">Hapus</button>' : "") + "</div></div>";
}
function viewWO(id) {
  var w = getWO(id); if (!w) return '<div class="empty">Work order tidak ditemukan. <a href="#/admin/wo">Ke daftar</a></div>';
  var v = getVeh(w.vehId), c = getCust(w.custId), m = getMech(w.mechId), b = w.bkId ? getBk(w.bkId) : null, ed = editable(w), due = woDue(w), e = w.est;
  var items = '<div class="card"><div class="row sb"><h3 style="margin:0">Item pekerjaan</h3>' + (ed ? '<div class="row"><button class="btn sm pri" type="button" data-act="item-add" data-wo="' + w.id + '" data-t="jasa">+ Jasa</button><button class="btn sm pri" type="button" data-act="item-add" data-wo="' + w.id + '" data-t="part">+ Suku cadang</button><button class="btn sm" type="button" data-act="item-add" data-wo="' + w.id + '" data-t="lain">+ Lain-lain</button></div>' : "") + '</div><div class="list" style="margin-top:12px">' + (w.items.length ? w.items.map(function (i) { return itemRow(w, i); }).join("") : '<div class="empty">Belum ada item. Tambahkan jasa dan suku cadang, lalu ajukan estimasi.</div>') + '</div><div class="tot"><span>Jasa</span><span class="r">' + rp(sumItems(w, "jasa")) + "</span><span>Suku cadang</span><span class=\"r\">" + rp(sumItems(w, "part")) + "</span><span>Diskon" + (ed && w.items.length ? ' <button class="btn sm" type="button" data-act="wo-disc" data-id="' + w.id + '">Atur</button>' : "") + '</span><span class="r">-' + rp(w.disc || 0) + '</span><span class="big">Total</span><span class="big r">' + rp(woTotal(w)) + "</span></div></div>";
  var est = '<div class="card"><h3>Estimasi dan persetujuan</h3><p style="margin:0 0 8px">' + (e.status === "disetujui" ? badge("Disetujui " + rp(e.total), "ok") : e.status === "diajukan" ? badge("Menunggu persetujuan " + rp(e.total), "warn") : e.status === "ditolak" ? badge("Ditolak pelanggan", "bad") : badge(e.reapp ? "Biaya naik, perlu persetujuan ulang" : "Belum diajukan", e.reapp ? "bad" : "")) + "</p>" + (e.at ? '<p class="sm mut" style="margin:0 0 8px">' + esc(fts(e.at)) + (e.by ? " | " + esc(e.by) : "") + "</p>" : "") + '<div class="row">';
  if (ed && w.items.length && (e.status === "belum" || e.status === "ditolak")) est += '<button class="btn pri sm" type="button" data-act="est-send" data-id="' + w.id + '">Ajukan estimasi ' + rp(woTotal(w)) + "</button>";
  if (e.status === "diajukan") est += '<button class="btn pri sm" type="button" data-act="est-rec" data-id="' + w.id + '">Catat persetujuan</button><button class="btn bad sm" type="button" data-act="est-rej" data-id="' + w.id + '">Pelanggan menolak</button>';
  est += '<a class="btn sm" href="#/admin/nota/' + w.id + '">Cetak estimasi</a>' + (e.status === "diajukan" ? '<a class="btn sm" target="_blank" rel="noopener" href="' + waLink(c.phone, "Halo " + c.name + ", estimasi servis " + vehLabel(v) + " " + v.plate + " sebesar " + rp(woTotal(w)) + ". Cek dan setujui di halaman Cek booking.") + '">Kirim WA</a>' : "") + "</div></div>";
  var pay = '<div class="card"><h3>Pembayaran</h3><div class="tot" style="margin-top:0"><span>Total</span><span class="r">' + rp(woTotal(w)) + "</span><span>Dibayar</span><span class=\"r\">" + rp(woPaid(w)) + '</span><span class="b">Sisa</span><span class="r b">' + rp(Math.max(0, due)) + "</span></div>" + (w.pays.length ? '<ul style="padding-left:18px;margin:10px 0">' + w.pays.map(function (p) { return "<li>" + esc(fts(p.at)) + ": " + rp(p.amt) + " (" + esc(p.method) + ")</li>"; }).join("") + "</ul>" : '<p class="mut sm">Belum ada pembayaran.</p>') + '<div class="row">' + (due > 0 && w.items.length ? '<button class="btn pri sm" type="button" data-act="pay-add" data-id="' + w.id + '">Catat pembayaran</button>' : "") + (w.items.length ? '<a class="btn sm" href="#/admin/nota/' + w.id + '">Cetak nota</a>' : "") + "</div></div>";
  var info = '<div class="card"><div class="row sb"><h3 style="margin:0">' + esc(w.no) + "</h3>" + badge(stLabel(w.status), stClass(w.status)) + "</div>" + stepper(w) + (w.status === "suku_cadang" ? '<p class="sm" style="margin:0 0 8px"><b>Menunggu:</b> ' + esc(w.hold || "-") + "</p>" : "") + '<div class="row" style="margin-bottom:12px">' + nextActions(w) + '</div><dl class="kv"><dt>Pelanggan</dt><dd><a href="#/admin/pelanggan/' + c.id + '">' + esc(c.name) + '</a> <a class="sm" target="_blank" rel="noopener" href="' + waLink(c.phone, "Halo " + c.name + ", ini " + SHOP.name + " soal " + w.no + ".") + '">' + esc(fPhone(c.phone)) + "</a></dd><dt>Kendaraan</dt><dd>" + esc(vehLabel(v)) + " " + plateHTML(v.plate) + "</dd><dt>Km masuk</dt><dd>" + num(w.km) + "</dd><dt>Keluhan</dt><dd>" + esc(w.complaint || "-") + "</dd><dt>Masuk</dt><dd>" + esc(fts(w.created)) + "</dd>" + (b ? "<dt>Booking</dt><dd>" + esc(b.code) + "</dd>" : "<dt>Booking</dt><dd>Tanpa booking</dd>") + (w.doneAt ? "<dt>Selesai</dt><dd>" + esc(fts(w.doneAt)) + "</dd>" : "") + (w.pickedAt ? "<dt>Diambil</dt><dd>" + esc(fts(w.pickedAt)) + "</dd>" : "") + (w.nextDate ? "<dt>Servis berikutnya</dt><dd>" + esc(fds(w.nextDate)) + " atau " + num(w.nextKm) + " km</dd>" : "") + '</dl><div class="f" style="margin-top:12px"><label for="womech">Mekanik</label><select id="womech" data-on="wo-mech" data-id="' + w.id + '"' + (w.status === "diambil" ? " disabled" : "") + ">" + mechOpts(v.type, "Belum dipilih").map(function (o) { return '<option value="' + o[0] + '"' + (+o[0] === w.mechId ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + '</select></div><form data-form="wo-note" data-id="' + w.id + '" novalidate><div class="f" data-f="note"><label for="ff_note">Catatan mekanik</label><textarea id="ff_note" name="note" maxlength="400">' + esc(w.note) + '</textarea><div class="err" role="alert"></div></div><button class="btn sm" type="submit">Simpan catatan</button></form>' + (w.status === "menunggu" && !w.pays.length ? '<hr style="border:0;border-top:1px solid var(--line);margin:14px 0"><button class="btn bad sm" type="button" data-act="wo-del" data-id="' + w.id + '">Hapus work order</button>' : "") + "</div>";
  return hd(esc(w.no) + " " + plateHTML(v.plate), '<a class="btn" href="#/admin/wo">Semua work order</a>') + '<div class="split"><div class="list" style="gap:14px;display:grid">' + items + est + pay + "</div><div>" + info + "</div></div>";
}
ON["wo-mech"] = function (el) {
  var w = getWO(el.getAttribute("data-id")); w.mechId = +el.value; save(); toast(w.mechId ? "Mekanik: " + getMech(w.mechId).name : "Mekanik dikosongkan");
};
FORM["wo-note"] = function (f) { var w = getWO(f.getAttribute("data-id")); w.note = String(formVals(f).note || "").trim().slice(0, 400); save(); toast("Catatan disimpan"); };
ACT["wo-del"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi untuk menghapus"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Hapus work order"; } }, 4000); return; }
  var w = getWO(el.getAttribute("data-id")); w.items.slice().forEach(function (i) { removeItem(w, i.id); });
  if (w.bkId) { var b = getBk(w.bkId); if (b && b.status === "datang") b.status = "dibooking"; }
  DB.wos.splice(DB.wos.indexOf(w), 1); save(); toast("Work order dihapus, stok dikembalikan"); go("#/admin/wo");
};
ACT["item-qty"] = function (el) {
  var w = getWO(el.getAttribute("data-wo")), it = byId(w.items, el.getAttribute("data-id")); if (!it || !editable(w)) return;
  var q = it.qty + +el.getAttribute("data-d"); if (q < 1) return toast("Jumlah minimal 1. Gunakan Hapus untuk membuang item", true);
  var er = setItemQty(w, it.id, q); if (er) return toast(er, true); save(); render();
};
ACT["item-del"] = function (el) { var w = getWO(el.getAttribute("data-wo")); if (!editable(w)) return; removeItem(w, el.getAttribute("data-id")); save(); toast("Item dihapus" + "; stok dikembalikan jika suku cadang"); render(); };
ON["item-svc"] = function (el) { var s = getSvc(el.value); if (s) $("#ff_price").value = s.price; };
ON["item-part"] = function (el) { var p = getPart(el.value); if (p) $("#ff_price").value = p.price; };
ACT["item-add"] = function (el) {
  var w = getWO(el.getAttribute("data-wo")), t = el.getAttribute("data-t"), v = getVeh(w.vehId); if (!editable(w)) return toast("Work order sudah selesai, buka kembali untuk mengubah", true);
  if (t === "jasa") {
    var ss = svcFor(v.type), first = ss[0];
    openForm({ title: "Tambah jasa", ok: "Tambahkan", fields: [{ k: "ref", l: "Jasa", t: "select", wide: 1, on: "item-svc", opts: ss.map(function (s) { return [s.id, s.name + " (" + rp(s.price) + ")"]; }), v: first ? first.id : "" }, { k: "price", l: "Harga (Rp)", t: "number", req: 1, min: 0, maxn: 99999999, v: first ? first.price : 0 }, { k: "qty", l: "Jumlah", t: "number", req: 1, min: 1, maxn: 999, v: 1 }], submit: function (x) { var s = getSvc(x.ref); if (!s) return { ref: "Pilih jasa" }; var er = addItem(w, { t: "jasa", ref: s.id, name: s.name, qty: x.qty, price: x.price }); if (er) return er; save(); toast("Jasa ditambahkan"); render(); } });
  } else if (t === "part") {
    var ps = DB.parts.filter(function (p) { return p.type === "semua" || p.type === v.type; }), fp = ps.filter(function (p) { return p.stock > 0; })[0] || ps[0];
    openForm({ title: "Tambah suku cadang", ok: "Tambahkan", intro: "Stok berkurang saat item ditambahkan dan kembali jika item dihapus.", fields: [{ k: "ref", l: "Suku cadang", t: "select", wide: 1, on: "item-part", opts: ps.map(function (p) { return [p.id, p.name + " | stok " + p.stock + " " + p.unit + " | " + rp(p.price)]; }), v: fp ? fp.id : "" }, { k: "price", l: "Harga satuan (Rp)", t: "number", req: 1, min: 0, maxn: 99999999, v: fp ? fp.price : 0 }, { k: "qty", l: "Jumlah", t: "number", req: 1, min: 1, maxn: 999, v: 1 }], submit: function (x) { var p = getPart(x.ref); if (!p) return { ref: "Pilih suku cadang" }; var er = addItem(w, { t: "part", ref: p.id, name: p.name, qty: x.qty, price: x.price }); if (er) return { qty: er }; save(); toast("Suku cadang ditambahkan, stok " + p.stock); render(); } });
  } else {
    openForm({ title: "Tambah item lain-lain", ok: "Tambahkan", fields: [{ k: "name", l: "Uraian", req: 1, max: 80, wide: 1, ph: "Contoh: Jasa derek, bahan kebersihan" }, { k: "price", l: "Harga (Rp)", t: "number", req: 1, min: 0, maxn: 99999999 }, { k: "qty", l: "Jumlah", t: "number", req: 1, min: 1, maxn: 999, v: 1 }], submit: function (x) { var er = addItem(w, { t: "jasa", ref: 0, name: x.name, qty: x.qty, price: x.price }); if (er) return er; save(); toast("Item ditambahkan"); render(); } });
  }
};
ACT["wo-disc"] = function (el) {
  var w = getWO(el.getAttribute("data-id")), sub = sumItems(w);
  openForm({ title: "Diskon", fields: [{ k: "disc", l: "Diskon (Rp)", t: "number", min: 0, maxn: sub, v: w.disc || 0, hint: "Maksimal sama dengan subtotal " + rp(sub), wide: 1 }], submit: function (x) { w.disc = x.disc; if (woPaid(w) > woTotal(w)) { w.disc = 0; return "Diskon terlalu besar: pembayaran masuk sudah " + rp(woPaid(w)); } touchEst(w); save(); toast("Diskon disimpan"); render(); } });
};
ACT["est-send"] = function (el) {
  var w = getWO(el.getAttribute("data-id")); if (!w.items.length) return toast("Belum ada item", true);
  w.est = { status: "diajukan", total: woTotal(w), reapp: false, at: nowTs(), by: "" }; save(); toast("Estimasi diajukan. Pelanggan bisa menyetujui di Cek booking"); render();
};
ACT["est-rec"] = function (el) {
  var w = getWO(el.getAttribute("data-id"));
  openForm({ title: "Catat persetujuan pelanggan", ok: "Catat setuju", fields: [{ k: "how", l: "Disetujui lewat", t: "select", wide: 1, opts: [["Pelanggan (di tempat)", "Di tempat"], ["Pelanggan (via telepon)", "Telepon"], ["Pelanggan (via WhatsApp)", "WhatsApp"]] }], submit: function (x) { w.est.status = "disetujui"; w.est.total = woTotal(w); w.est.reapp = false; w.est.at = nowTs(); w.est.by = x.how; save(); toast("Persetujuan dicatat"); render(); } });
};
ACT["est-rej"] = function (el) { var w = getWO(el.getAttribute("data-id")); w.est.status = "ditolak"; w.est.by = "Pelanggan (dicatat admin)"; save(); toast("Estimasi ditandai ditolak"); render(); };
ACT["pay-add"] = function (el) {
  var w = getWO(el.getAttribute("data-id")), due = woDue(w);
  openForm({ title: "Catat pembayaran", ok: "Simpan pembayaran", intro: "Sisa tagihan " + rp(due), fields: [{ k: "amt", l: "Jumlah (Rp)", t: "number", req: 1, min: 1, maxn: due, v: due }, { k: "method", l: "Metode", t: "select", opts: METHODS.map(function (m) { return [m, m]; }) }], submit: function (x) { var er = addPay(w, x.amt, x.method); if (er) return { amt: er }; toast("Pembayaran " + rp(x.amt) + " dicatat"); render(); } });
};

/* ---------- booking admin ---------- */
function bayBar(m, date) {
  var c = dayCfg(date); if (!c) return "";
  var span = c.c - c.o, bs = activeBks(m.id, date, 0), brk = c.brk ? ' style="--bl:' + ((c.brk[0] - c.o) / span * 100) + "%;--bw:" + ((c.brk[1] - c.brk[0]) / span * 100) + '%"' : "";
  return '<div class="li" style="display:block"><div class="row sb" style="margin-bottom:6px"><b>Bay ' + m.bay + " | " + esc(m.name) + ' <span class="badge">' + esc(m.skill) + "</span>" + (m.active ? "" : ' <span class="badge bad">Nonaktif</span>') + '</b><span class="sm mut">' + bs.length + ' booking</span></div><div class="bar' + (c.brk ? " brk" : "") + '"' + brk + ' role="img" aria-label="Jadwal bay ' + m.bay + '">' + bs.map(function (b) { var l = (mm(b.time) - c.o) / span * 100, wd = b.dur / span * 100; return '<i class="' + (b.status === "datang" ? "dn" : "") + '" style="left:' + l + "%;width:" + wd + '%" title="' + esc(b.time + " " + bkSvcNames(b)) + '"></i>'; }).join("") + '</div><div class="row sb sm mut" style="margin-top:3px"><span>' + hm(c.o) + "</span><span>" + hm(c.c) + "</span></div></div>";
}
function bkRow(b) {
  var v = getVeh(b.vehId), c = getCust(b.custId), m = getMech(b.mechId), w = bkWO(b);
  var st = { dibooking: ["Terjadwal", "info"], datang: ["Diterima", "ok"], dibatalkan: ["Batal", "bad"] }[b.status];
  return '<div class="li"><div class="main"><b>' + b.time + " - " + hm(mm(b.time) + b.dur) + "</b> " + esc(b.code) + " " + badge(st[0], st[1]) + '<div>' + plateHTML(v.plate) + " " + esc(vehLabel(v)) + " | " + esc(c.name) + '</div><div class="sm mut">' + esc(bkSvcNames(b)) + " | Bay " + (m ? m.bay : "-") + (b.note ? " | " + esc(b.note) : "") + '</div></div><div class="row">' +
    (b.status === "dibooking" ? '<button class="btn sm pri" type="button" data-act="bk-receive" data-id="' + b.id + '">Terima kendaraan</button><button class="btn sm" type="button" data-act="rs-open" data-id="' + b.id + '">Jadwal ulang</button><button class="btn sm bad" type="button" data-act="bk-cancel-a" data-id="' + b.id + '">Batalkan</button>' : "") + (w ? '<a class="btn sm" href="#/admin/wo/' + w.id + '">Buka ' + esc(w.no) + "</a>" : "") + "</div></div>";
}
function viewAdmBooking() {
  var d = S.bDate || today(), list = DB.bookings.filter(function (b) { return b.date === d; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; }), chips = "";
  for (var i = 0; i < 8; i++) { var x = addD(today(), i), n = DB.bookings.filter(function (b) { return b.date === x && b.status === "dibooking"; }).length; chips += '<button class="chip' + (x === d ? " on" : "") + '" type="button" data-act="bk-date" data-v="' + x + '">' + (i === 0 ? "Hari ini" : DS[pd(x).getDay()] + " " + pd(x).getDate()) + "<small> " + n + "</small></button>"; }
  var cfg = dayCfg(d);
  return hd("Booking", '<button class="btn pri" type="button" data-act="wo-new">+ Work order langsung</button><button class="btn" type="button" data-act="csv-bk">Unduh CSV</button>') + '<div class="bt" role="group" aria-label="Pilih tanggal">' + chips + '</div><div class="toolbar"><button class="btn" type="button" data-act="bk-date" data-v="' + addD(d, -1) + '" aria-label="Hari sebelumnya">Sebelumnya</button><div class="f"><label for="bdate">Tanggal</label><input id="bdate" type="date" value="' + d + '" data-on="bk-date-in"></div><button class="btn" type="button" data-act="bk-date" data-v="' + addD(d, 1) + '" aria-label="Hari berikutnya">Berikutnya</button></div><h2 style="font-size:1.1rem">' + esc(fd(d)) + " | " + esc(hoursText(d)) + '</h2>' + (cfg ? '<div class="list">' + DB.mechs.map(function (m) { return bayBar(m, d); }).join("") + '</div><p class="ph-note">Abu-abu: kendaraan sudah diterima. Oranye: terjadwal. Garis miring: istirahat.</p>' : '<div class="empty">Bengkel tutup di hari ini.</div>') + '<h2 style="font-size:1.1rem;margin-top:18px">Daftar booking (' + list.length + ")</h2>" + (list.length ? '<div class="list">' + list.map(bkRow).join("") + "</div>" : '<div class="empty">Tidak ada booking di tanggal ini.</div>');
}
ACT["bk-date"] = function (el) { S.bDate = el.getAttribute("data-v"); render(); };
ON["bk-date-in"] = function (el) { if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) { S.bDate = el.value; render(); } };
ACT["bk-cancel-a"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Batalkan"; } }, 4000); return; }
  var b = getBk(el.getAttribute("data-id")); b.status = "dibooking" === b.status ? "dibatalkan" : b.status; b.cancelNote = "Dibatalkan oleh bengkel"; save(); toast("Booking dibatalkan, slot kembali kosong"); render();
};
ACT["bk-receive"] = function (el) {
  var b = getBk(el.getAttribute("data-id")), v = getVeh(b.vehId);
  if (DB.wos.some(function (w) { return w.vehId === v.id && w.status !== "diambil"; })) return toast("Kendaraan ini masih punya work order yang belum diambil", true);
  openForm({ title: "Terima kendaraan " + v.plate, ok: "Buat work order", fields: [{ k: "km", l: "Km masuk", t: "number", req: 1, min: 0, maxn: 999999, v: b.km || v.km }, { k: "mech", l: "Mekanik", t: "select", opts: mechOpts(v.type), v: b.mechId }, { k: "complaint", l: "Keluhan", t: "textarea", req: 1, max: 300, v: b.note || bkSvcNames(b), wide: 1 }], submit: function (x) {
    var w = newWO({ custId: b.custId, vehId: b.vehId, km: x.km, complaint: x.complaint, bkId: b.id, mechId: +x.mech || 0 });
    b.svc.forEach(function (i) { var s = getSvc(i); if (s) addItem(w, { t: "jasa", ref: s.id, name: s.name, qty: 1, price: s.price }, true); });
    b.status = "datang"; if (x.km > (v.km || 0)) v.km = x.km; save(); toast(w.no + " dibuat dari booking " + b.code); go("#/admin/wo/" + w.id);
  } });
};
ACT["csv-bk"] = function () {
  var rows = [["Kode", "Tanggal", "Jam", "Durasi (menit)", "Bay", "Mekanik", "Plat", "Kendaraan", "Pelanggan", "Telepon", "Layanan", "Status", "Catatan"]];
  DB.bookings.slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }).forEach(function (b) { var v = getVeh(b.vehId), c = getCust(b.custId), m = getMech(b.mechId); rows.push([b.code, b.date, b.time, b.dur, m ? m.bay : "", m ? m.name : "", v.plate, vehLabel(v), c.name, c.phone, bkSvcNames(b), b.status, b.note]); });
  csvDown("booking.csv", rows);
};

/* ---------- layanan ---------- */
function svcUsed(id) { return DB.bookings.some(function (b) { return b.svc.indexOf(id) >= 0; }) || DB.wos.some(function (w) { return w.items.some(function (i) { return i.t === "jasa" && i.ref === id; }); }); }
function viewServices() {
  var by = {}; DB.svcs.forEach(function (s) { (by[s.cat] = by[s.cat] || []).push(s); });
  return hd("Layanan dan paket", '<button class="btn pri" type="button" data-act="svc-edit" data-id="0">+ Layanan</button>') + CATS.filter(function (c) { return by[c]; }).map(function (c) {
    return '<h2 style="font-size:1.05rem;margin-top:16px">' + c + '</h2><div class="list">' + by[c].map(function (s) { return '<div class="li"><div class="main"><b>' + esc(s.name) + "</b> " + badge(s.type === "semua" ? "Motor dan mobil" : s.type) + (s.active ? "" : badge("Nonaktif", "bad")) + '<div class="sm mut">' + esc(s.desc) + "</div><div class=\"sm\">" + (s.price ? rp(s.price) : "Gratis") + " | " + s.dur + " menit" + (s.kmNext ? " | ulang " + num(s.kmNext) + " km" : "") + (s.moNext ? " / " + s.moNext + " bln" : "") + '</div></div><div class="row"><button class="btn sm" type="button" data-act="svc-edit" data-id="' + s.id + '">Ubah</button><button class="btn sm" type="button" data-act="svc-toggle" data-id="' + s.id + '">' + (s.active ? "Nonaktifkan" : "Aktifkan") + '</button><button class="btn sm bad" type="button" data-act="svc-del" data-id="' + s.id + '"' + (svcUsed(s.id) ? ' disabled title="Sudah dipakai, nonaktifkan saja"' : "") + ">Hapus</button></div></div>"; }).join("") + "</div>";
  }).join("");
}
ACT["svc-edit"] = function (el) {
  var s = getSvc(el.getAttribute("data-id")) || { name: "", cat: "Berkala", type: "motor", price: 0, dur: 60, kmNext: 0, moNext: 0, desc: "", active: true };
  openForm({ title: s.id ? "Ubah layanan" : "Layanan baru", fields: [{ k: "name", l: "Nama layanan", req: 1, max: 60, v: s.name, wide: 1 }, { k: "cat", l: "Kategori", t: "select", opts: CATS.map(function (c) { return [c, c]; }), v: s.cat }, { k: "type", l: "Untuk", t: "select", opts: [["motor", "Motor"], ["mobil", "Mobil"], ["semua", "Motor dan mobil"]], v: s.type }, { k: "price", l: "Harga jasa (Rp)", t: "number", req: 1, min: 0, maxn: 99999999, v: s.price }, { k: "dur", l: "Durasi", t: "select", opts: [30, 60, 90, 120, 150, 180, 210, 240].map(function (d) { return [d, d + " menit"]; }), v: s.dur }, { k: "kmNext", l: "Servis ulang tiap (km)", t: "number", min: 0, maxn: 100000, v: s.kmNext, hint: "0 jika tidak ada" }, { k: "moNext", l: "Servis ulang tiap (bulan)", t: "number", min: 0, maxn: 36, v: s.moNext, hint: "0 jika tidak ada" }, { k: "desc", l: "Deskripsi", t: "textarea", max: 200, v: s.desc, wide: 1 }], submit: function (x) {
    if (DB.svcs.some(function (o) { return o.id !== s.id && o.name.toLowerCase() === x.name.toLowerCase(); })) return { name: "Nama layanan sudah ada" };
    var t = s.id ? s : { id: nid(), active: true }; t.name = x.name; t.cat = x.cat; t.type = x.type; t.price = x.price; t.dur = +x.dur; t.kmNext = x.kmNext; t.moNext = x.moNext; t.desc = x.desc; if (!s.id) DB.svcs.push(t);
    save(); toast("Layanan disimpan"); render();
  } });
};
ACT["svc-toggle"] = function (el) { var s = getSvc(el.getAttribute("data-id")); s.active = !s.active; save(); toast(s.active ? "Layanan aktif, tampil di situs" : "Layanan dinonaktifkan, tidak tampil di situs"); render(); };
ACT["svc-del"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Hapus"; } }, 4000); return; }
  var s = getSvc(el.getAttribute("data-id")); if (svcUsed(s.id)) return toast("Layanan sudah dipakai", true); DB.svcs.splice(DB.svcs.indexOf(s), 1); save(); toast("Layanan dihapus"); render();
};

/* ---------- mekanik ---------- */
function viewMechs() {
  var t = today();
  return hd("Mekanik dan bay", '<button class="btn pri" type="button" data-act="mech-edit" data-id="0">+ Mekanik</button>') + '<p class="mut">Jumlah slot booking sama dengan jumlah mekanik aktif yang menangani jenis kendaraan tersebut. Nonaktifkan mekanik yang cuti.</p><div class="list">' + DB.mechs.map(function (m) {
    var bk = DB.bookings.filter(function (b) { return b.mechId === m.id && b.date >= t && b.status === "dibooking"; }).length, wo = DB.wos.filter(function (w) { return w.mechId === m.id && w.status !== "diambil"; }).length, used = bk || DB.bookings.some(function (b) { return b.mechId === m.id; }) || DB.wos.some(function (w) { return w.mechId === m.id; });
    return '<div class="li"><div class="main"><b>Bay ' + m.bay + " | " + esc(m.name) + "</b> " + badge(m.skill === "semua" ? "Motor dan mobil" : m.skill) + (m.active ? badge("Aktif", "ok") : badge("Nonaktif", "bad")) + '<div class="sm mut">' + wo + " work order aktif | " + bk + " booking mendatang</div></div><div class=\"row\"><button class=\"btn sm\" type=\"button\" data-act=\"mech-edit\" data-id=\"" + m.id + '">Ubah</button><button class="btn sm bad" type="button" data-act="mech-del" data-id="' + m.id + '"' + (used ? ' disabled title="Sudah punya riwayat, nonaktifkan saja"' : "") + ">Hapus</button></div></div>";
  }).join("") + "</div>";
}
ACT["mech-edit"] = function (el) {
  var m = getMech(el.getAttribute("data-id")) || { name: "", skill: "motor", active: true, bay: DB.mechs.length + 1 };
  openForm({ title: m.id ? "Ubah mekanik" : "Mekanik baru", fields: [{ k: "name", l: "Nama", req: 1, max: 40, v: m.name }, { k: "bay", l: "Nomor bay", t: "number", req: 1, min: 1, maxn: 20, v: m.bay }, { k: "skill", l: "Menangani", t: "select", opts: [["motor", "Motor"], ["mobil", "Mobil"], ["semua", "Motor dan mobil"]], v: m.skill }, { k: "active", l: "Status", t: "select", opts: [["1", "Aktif"], ["0", "Nonaktif (cuti)"]], v: m.active ? "1" : "0" }], submit: function (x) {
    if (DB.mechs.some(function (o) { return o.id !== m.id && o.bay === x.bay; })) return { bay: "Nomor bay sudah dipakai" };
    var t = m.id ? m : { id: nid() }; t.name = x.name; t.bay = x.bay; t.skill = x.skill; t.active = x.active === "1"; if (!m.id) DB.mechs.push(t); save(); toast("Mekanik disimpan"); render();
  } });
};
ACT["mech-del"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Hapus"; } }, 4000); return; }
  var m = getMech(el.getAttribute("data-id")); DB.mechs.splice(DB.mechs.indexOf(m), 1); save(); toast("Mekanik dihapus"); render();
};

/* ---------- suku cadang ---------- */
function partUsed(id) { return DB.wos.some(function (w) { return w.items.some(function (i) { return i.t === "part" && i.ref === id; }); }); }
function stockBadge(p) { return p.stock <= 0 ? badge("Habis", "bad") : p.stock <= p.min ? badge("Menipis", "warn") : badge("Aman", "ok"); }
function viewParts() {
  var q = (S.pQ || "").toLowerCase(), l = DB.parts.filter(function (p) { return (!S.pLow || p.stock <= p.min) && (!q || p.name.toLowerCase().indexOf(q) >= 0 || p.sku.toLowerCase().indexOf(q) >= 0); });
  var low = lowParts().length;
  return hd("Suku cadang dan stok", '<button class="btn" type="button" data-act="csv-parts">Unduh CSV</button><button class="btn pri" type="button" data-act="part-edit" data-id="0">+ Suku cadang</button>') + (low ? '<div class="formerr" style="background:var(--warn-s);color:var(--warn)">' + low + " suku cadang di bawah atau sama dengan stok minimum.</div>" : "") + '<div class="toolbar"><div class="f"><label for="pq">Cari nama atau SKU</label><input id="pq" type="search" data-oi="part-q" value="' + esc(S.pQ || "") + '" autocomplete="off"></div><button class="chip' + (S.pLow ? " on" : "") + '" type="button" data-act="part-low" aria-pressed="' + !!S.pLow + '">Hanya yang menipis</button></div><div id="partlist">' + partListHTML(l) + '</div><h2 style="font-size:1.05rem;margin-top:20px">Riwayat stok terakhir</h2>' + (DB.stockLog.length ? '<div class="tw"><table><thead><tr><th>Waktu</th><th>Barang</th><th class="n">Ubah</th><th>Keterangan</th></tr></thead><tbody>' + DB.stockLog.slice(0, 15).map(function (g) { var p = getPart(g.partId); return "<tr><td>" + esc(fts(g.ts)) + "</td><td>" + esc(p ? p.name : "(dihapus)") + '</td><td class="n ' + (g.delta < 0 ? "" : "b") + '">' + (g.delta > 0 ? "+" : "") + g.delta + "</td><td>" + esc(g.why) + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<div class="empty">Belum ada pergerakan stok.</div>');
}
function partListHTML(l) {
  if (!l) { var q = (S.pQ || "").toLowerCase(); l = DB.parts.filter(function (p) { return (!S.pLow || p.stock <= p.min) && (!q || p.name.toLowerCase().indexOf(q) >= 0 || p.sku.toLowerCase().indexOf(q) >= 0); }); }
  return l.length ? '<div class="list">' + l.map(function (p) { return '<div class="li"><div class="main"><b>' + esc(p.name) + "</b> " + stockBadge(p) + '<div class="sm mut">' + esc(p.sku) + " | " + (p.type === "semua" ? "Motor dan mobil" : p.type) + " | modal " + rp(p.cost) + " | jual " + rp(p.price) + '</div></div><div class="row"><span class="b nowrap">' + p.stock + " " + esc(p.unit) + '</span><span class="sm mut nowrap">min ' + p.min + '</span><button class="btn sm pri" type="button" data-act="part-stock" data-id="' + p.id + '">Tambah stok</button><button class="btn sm" type="button" data-act="part-edit" data-id="' + p.id + '">Ubah</button><button class="btn sm bad" type="button" data-act="part-del" data-id="' + p.id + '"' + (partUsed(p.id) ? ' disabled title="Sudah dipakai di work order"' : "") + ">Hapus</button></div></div>"; }).join("") + "</div>" : '<div class="empty">Tidak ada suku cadang yang cocok.</div>';
}
ON["part-q"] = function (el) { S.pQ = el.value; $("#partlist").innerHTML = partListHTML(); };
ACT["part-low"] = function () { S.pLow = !S.pLow; render(); };
ACT["part-stock"] = function (el) {
  var p = getPart(el.getAttribute("data-id"));
  openForm({ title: "Tambah stok: " + p.name, ok: "Tambah stok", intro: "Stok sekarang " + p.stock + " " + p.unit + ".", fields: [{ k: "qty", l: "Jumlah masuk", t: "number", req: 1, min: 1, maxn: 9999, v: Math.max(p.min * 2 - p.stock, 1) }, { k: "why", l: "Keterangan", max: 60, v: "Restok dari pemasok" }], submit: function (x) { p.stock += x.qty; stockLog(p.id, x.qty, x.why || "Restok"); save(); toast("Stok " + p.name + " menjadi " + p.stock); render(); } });
};
ACT["part-edit"] = function (el) {
  var p = getPart(el.getAttribute("data-id")) || { sku: "", name: "", unit: "pcs", stock: 0, min: 2, cost: 0, price: 0, type: "semua" };
  openForm({ title: p.id ? "Ubah suku cadang" : "Suku cadang baru", fields: [{ k: "name", l: "Nama", req: 1, max: 70, v: p.name, wide: 1 }, { k: "sku", l: "SKU", req: 1, max: 14, v: p.sku }, { k: "unit", l: "Satuan", req: 1, max: 10, v: p.unit }, { k: "type", l: "Untuk", t: "select", opts: [["motor", "Motor"], ["mobil", "Mobil"], ["semua", "Motor dan mobil"]], v: p.type }, { k: "min", l: "Stok minimum", t: "number", req: 1, min: 0, maxn: 9999, v: p.min }, { k: "cost", l: "Harga modal (Rp)", t: "number", req: 1, min: 0, maxn: 99999999, v: p.cost }, { k: "price", l: "Harga jual (Rp)", t: "number", req: 1, min: 0, maxn: 99999999, v: p.price }].concat(p.id ? [] : [{ k: "stock", l: "Stok awal", t: "number", req: 1, min: 0, maxn: 9999, v: 0 }]), submit: function (x) {
    if (DB.parts.some(function (o) { return o.id !== p.id && o.sku.toLowerCase() === x.sku.toLowerCase(); })) return { sku: "SKU sudah dipakai" };
    var t = p.id ? p : { id: nid(), stock: x.stock }; t.name = x.name; t.sku = x.sku; t.unit = x.unit; t.type = x.type; t.min = x.min; t.cost = x.cost; t.price = x.price;
    if (!p.id) { DB.parts.push(t); if (x.stock) stockLog(t.id, x.stock, "Stok awal"); } save(); toast("Suku cadang disimpan"); render();
  } });
};
ACT["part-del"] = function (el) {
  if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "Tekan lagi"; setTimeout(function () { if (el.isConnected) { el.classList.remove("armed"); el.textContent = "Hapus"; } }, 4000); return; }
  var p = getPart(el.getAttribute("data-id")); if (partUsed(p.id)) return toast("Sudah dipakai di work order", true); DB.parts.splice(DB.parts.indexOf(p), 1); save(); toast("Suku cadang dihapus"); render();
};
ACT["csv-parts"] = function () {
  var rows = [["SKU", "Nama", "Untuk", "Satuan", "Stok", "Minimum", "Status", "Modal", "Jual"]]; DB.parts.forEach(function (p) { rows.push([p.sku, p.name, p.type, p.unit, p.stock, p.min, p.stock <= 0 ? "Habis" : p.stock <= p.min ? "Menipis" : "Aman", p.cost, p.price]); }); csvDown("suku-cadang.csv", rows);
};

/* ---------- pelanggan ---------- */
function custSpend(c) { return DB.wos.filter(function (w) { return w.custId === c.id; }).reduce(function (a, w) { return a + woPaid(w); }, 0); }
function custListHTML() {
  var q = (S.cQ || "").trim().toLowerCase(), qp = normPlate(S.cQ), qd = (S.cQ || "").replace(/\D/g, "");
  var l = DB.custs.filter(function (c) { if (!q) return true; return c.name.toLowerCase().indexOf(q) >= 0 || (qd.length > 2 && c.phone.indexOf(qd) >= 0) || (qp && DB.vehs.some(function (v) { return v.custId === c.id && normPlate(v.plate).indexOf(qp) >= 0; })); }).sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  return l.length ? '<div class="list">' + l.map(function (c) { var vs = DB.vehs.filter(function (v) { return v.custId === c.id; }); return '<a class="li" href="#/admin/pelanggan/' + c.id + '" style="text-decoration:none;color:inherit"><div class="main"><b>' + esc(c.name) + '</b><div class="sm mut">' + esc(fPhone(c.phone)) + "</div><div>" + vs.map(function (v) { return plateHTML(v.plate); }).join(" ") + '</div></div><div class="sm mut" style="text-align:right">' + DB.wos.filter(function (w) { return w.custId === c.id; }).length + " work order<br>" + rp(custSpend(c)) + "</div></a>"; }).join("") + "</div>" : '<div class="empty">Pelanggan tidak ditemukan.</div>';
}
function viewCusts() {
  return hd("Pelanggan dan kendaraan", '<button class="btn" type="button" data-act="csv-cust">Unduh CSV</button><button class="btn pri" type="button" data-act="cust-edit" data-id="0">+ Pelanggan</button>') + '<div class="toolbar"><div class="f"><label for="cq">Cari nama, telepon, atau plat</label><input id="cq" type="search" data-oi="cust-q" value="' + esc(S.cQ) + '" autocomplete="off"></div></div><div id="custlist">' + custListHTML() + "</div>";
}
ON["cust-q"] = function (el) { S.cQ = el.value; $("#custlist").innerHTML = custListHTML(); };
function viewCustDetail(id) {
  var c = getCust(id); if (!c) return '<div class="empty">Pelanggan tidak ditemukan. <a href="#/admin/pelanggan">Ke daftar</a></div>';
  var vs = DB.vehs.filter(function (v) { return v.custId === c.id; }), rem = reminders();
  return hd(esc(c.name), '<a class="btn" href="#/admin/pelanggan">Semua pelanggan</a><button class="btn" type="button" data-act="cust-edit" data-id="' + c.id + '">Ubah</button><a class="btn" target="_blank" rel="noopener" href="' + waLink(c.phone, "Halo " + c.name + ", dari " + SHOP.name + ".") + '">WhatsApp</a>') + '<p class="mut">Telepon ' + esc(fPhone(c.phone)) + " | Total dibayar " + rp(custSpend(c)) + '</p><div class="row sb" style="margin-bottom:10px"><h2 style="font-size:1.1rem;margin:0">Kendaraan</h2><button class="btn sm pri" type="button" data-act="veh-edit" data-id="0" data-c="' + c.id + '">+ Kendaraan</button></div><div class="list">' + (vs.length ? vs.map(function (v) {
    var ws = DB.wos.filter(function (w) { return w.vehId === v.id; }).sort(function (a, b) { return a.created < b.created ? 1 : -1; }), r = rem.filter(function (x) { return x.veh.id === v.id; })[0];
    return '<div class="card flat"><div class="row sb"><div><b>' + esc(vehLabel(v)) + "</b> " + plateHTML(v.plate) + '<div class="sm mut">' + (v.type === "motor" ? "Motor" : "Mobil") + (v.year ? " " + v.year : "") + " | Km " + num(v.km) + "</div></div><button class=\"btn sm\" type=\"button\" data-act=\"veh-edit\" data-id=\"" + v.id + '" data-c="' + c.id + '">Ubah</button></div>' + (r ? '<p class="sm" style="margin:8px 0 0">Servis berikutnya: <b>' + esc(fds(r.wo.nextDate)) + "</b> atau " + num(r.wo.nextKm) + " km " + badge(r.st, r.left < 0 ? "bad" : r.left <= 14 ? "warn" : "ok") + "</p>" : "") + '<div style="margin-top:8px">' + (ws.length ? ws.map(function (w) { return '<a class="sm" style="display:block;padding:4px 0" href="#/admin/wo/' + w.id + '">' + esc(fds(w.created.slice(0, 10))) + " | " + esc(w.no) + " | " + stLabel(w.status) + " | " + rp(woTotal(w)) + "</a>"; }).join("") : '<span class="sm mut">Belum ada work order.</span>') + "</div></div>";
  }).join("") : '<div class="empty">Belum ada kendaraan.</div>') + "</div>";
}
ACT["cust-edit"] = function (el) {
  var c = getCust(el.getAttribute("data-id")) || { name: "", phone: "" };
  openForm({ title: c.id ? "Ubah pelanggan" : "Pelanggan baru", fields: [{ k: "name", l: "Nama", req: 1, max: 60, v: c.name }, { k: "phone", l: "Telepon", req: 1, max: 18, v: c.phone ? fPhone(c.phone) : "", ph: "0812-0000-0000" }], submit: function (x) {
    if (!okPhone(x.phone)) return { phone: "Telepon tidak valid, contoh 0812-0000-0000" };
    var p = normPhone(x.phone); if (DB.custs.some(function (o) { return o.id !== c.id && o.phone === p; })) return { phone: "Nomor ini sudah dipakai pelanggan lain" };
    if (c.id) { c.name = x.name; c.phone = p; save(); toast("Pelanggan disimpan"); render(); } else { var n = { id: nid(), name: x.name, phone: p }; DB.custs.push(n); save(); toast("Pelanggan ditambahkan"); go("#/admin/pelanggan/" + n.id); }
  } });
};
ACT["veh-edit"] = function (el) {
  var cid = +el.getAttribute("data-c"), v = getVeh(el.getAttribute("data-id")) || { type: "motor", brand: "", model: "", plate: "", year: "", km: 0 };
  openForm({ title: v.id ? "Ubah kendaraan" : "Kendaraan baru", fields: [{ k: "type", l: "Jenis", t: "select", opts: [["motor", "Motor"], ["mobil", "Mobil"]], v: v.type }, { k: "plate", l: "Plat nomor", req: 1, max: 12, v: v.plate }, { k: "brand", l: "Merek", req: 1, max: 30, v: v.brand }, { k: "model", l: "Model", req: 1, max: 30, v: v.model }, { k: "year", l: "Tahun", t: "number", min: 1980, v: v.year }, { k: "km", l: "Kilometer", t: "number", req: 1, min: 0, maxn: 999999, v: v.km }], submit: function (x) {
    if (!/^[A-Z]{1,2}\d{1,4}[A-Z]{0,3}$/.test(normPlate(x.plate))) return { plate: "Plat tidak valid, contoh B 1234 ABC" };
    if (DB.vehs.some(function (o) { return o.id !== v.id && normPlate(o.plate) === normPlate(x.plate); })) return { plate: "Plat ini sudah terdaftar" };
    var t = v.id ? v : { id: nid(), custId: cid }; t.type = x.type; t.plate = fmtPlate(x.plate); t.brand = x.brand; t.model = x.model; t.year = x.year || ""; t.km = x.km; if (!v.id) DB.vehs.push(t); save(); toast("Kendaraan disimpan"); render();
  } });
};
ACT["csv-cust"] = function () {
  var rows = [["Nama", "Telepon", "Plat", "Kendaraan", "Jenis", "Km", "Jumlah WO", "Total dibayar"]];
  DB.vehs.forEach(function (v) { var c = getCust(v.custId); rows.push([c.name, c.phone, v.plate, vehLabel(v), v.type, v.km, DB.wos.filter(function (w) { return w.vehId === v.id; }).length, DB.wos.filter(function (w) { return w.vehId === v.id; }).reduce(function (a, w) { return a + woPaid(w); }, 0)]); });
  csvDown("pelanggan.csv", rows);
};

/* ---------- pengingat ---------- */
function viewReminders() {
  var l = reminders().filter(function (r) { return S.remAll || r.left <= 30; });
  return hd("Pengingat servis berikutnya", '<button class="btn' + (S.remAll ? " on" : "") + '" type="button" data-act="rem-all" aria-pressed="' + !!S.remAll + '">' + (S.remAll ? "Tampilkan 30 hari ke depan" : "Tampilkan semua") + "</button>") + '<p class="mut">Dihitung dari work order terakhir yang diambil: interval layanan dalam km dan bulan, mana yang lebih dulu. Km kendaraan tercatat saat servis terakhir.</p>' + (l.length ? '<div class="list">' + l.map(function (r) {
    var msg = "Halo " + r.cust.name + ", " + SHOP.name + " mengingatkan servis berikutnya untuk " + vehLabel(r.veh) + " " + r.veh.plate + ": sekitar " + fds(r.wo.nextDate) + " atau " + num(r.wo.nextKm) + " km. Booking di halaman Booking kami.";
    return '<div class="li"><div class="main">' + plateHTML(r.veh.plate) + " <b>" + esc(vehLabel(r.veh)) + "</b> " + badge(r.st, r.left < 0 ? "bad" : r.left <= 14 ? "warn" : "ok") + (r.booked ? badge("Sudah booking", "info") : "") + (r.wo.contacted ? badge("Sudah dihubungi", "") : "") + '<div class="sm mut">' + esc(r.cust.name) + " | " + esc(fPhone(r.cust.phone)) + '</div><div class="sm">Jatuh tempo ' + esc(fds(r.wo.nextDate)) + " (" + (r.left < 0 ? -r.left + " hari lewat" : r.left + " hari lagi") + ") atau " + num(r.wo.nextKm) + " km. Km terakhir " + num(r.veh.km) + '.</div></div><div class="row"><a class="btn sm pri" target="_blank" rel="noopener" href="' + waLink(r.cust.phone, msg) + '">Kirim WhatsApp</a><button class="btn sm" type="button" data-act="rem-done" data-id="' + r.wo.id + '">' + (r.wo.contacted ? "Batal tandai" : "Tandai sudah dihubungi") + "</button></div></div>";
  }).join("") + "</div>" : '<div class="empty">Tidak ada servis yang jatuh tempo dalam 30 hari.</div>');
}
ACT["rem-all"] = function () { S.remAll = !S.remAll; render(); };
ACT["rem-done"] = function (el) { var w = getWO(el.getAttribute("data-id")); w.contacted = !w.contacted; save(); render(); };

/* ---------- laporan ---------- */
function rangeDates() { var t = today(), r = S.repR; return r === "semua" ? ["0000-01-01", t] : [addD(t, 1 - (r === "1" ? 1 : +r)), t]; }
function viewReports() {
  var rg = rangeDates(), a = rg[0], z = rg[1], inR = function (ts) { var d = ts.slice(0, 10); return d >= a && d <= z; };
  var pays = [], methods = {}, rev = 0;
  DB.wos.forEach(function (w) { w.pays.forEach(function (p) { if (inR(p.at)) { pays.push(p); rev += p.amt; methods[p.method] = (methods[p.method] || 0) + p.amt; } }); });
  var picked = DB.wos.filter(function (w) { return w.status === "diambil" && inR(w.pickedAt); });
  var jasa = 0, partRev = 0, margin = 0, bySvc = {}, byMech = {};
  picked.forEach(function (w) {
    w.items.forEach(function (i) {
      var amt = i.qty * i.price; if (i.t === "part") { partRev += amt; margin += i.qty * (i.price - (i.cost || 0)); } else jasa += amt;
      var k = i.name; bySvc[k] = bySvc[k] || { n: 0, v: 0, t: i.t }; bySvc[k].n += i.qty; bySvc[k].v += amt;
    });
    var m = getMech(w.mechId), mk = m ? m.name : "Tanpa mekanik"; byMech[mk] = byMech[mk] || { n: 0, v: 0 }; byMech[mk].n++; byMech[mk].v += sumItems(w, "jasa");
  });
  var bks = DB.bookings.filter(function (b) { return inR(b.created); }), open = DB.wos.filter(function (w) { return w.items.length && woDue(w) > 0; }).reduce(function (s, w) { return s + woDue(w); }, 0);
  var days = [], nd = S.repR === "1" ? 1 : S.repR === "semua" ? 30 : +S.repR; if (nd > 31) nd = 31;
  for (var i = nd - 1; i >= 0; i--) days.push(addD(z, -i));
  var perDay = days.map(function (d) { var s = 0; pays.forEach(function (p) { if (p.at.slice(0, 10) === d) s += p.amt; }); return s; }), mx = Math.max.apply(0, perDay.concat([1]));
  var bw = 600 / days.length, chart = '<svg class="chart" viewBox="0 0 600 170" role="img" aria-label="Grafik pemasukan harian">' + perDay.map(function (v, i) { var h = v / mx * 120; return '<rect x="' + (i * bw + 2) + '" y="' + (140 - h) + '" width="' + Math.max(bw - 4, 2) + '" height="' + Math.max(h, 0) + '" rx="2" fill="#c2410c"><title>' + fds(days[i]) + ": " + rp(v) + "</title></rect>"; }).join("") + '<line x1="0" y1="140.5" x2="600" y2="140.5" stroke="#b9b6ae"/><text x="0" y="160" font-size="11" fill="#5d636d">' + fds(days[0]) + '</text><text x="600" y="160" font-size="11" fill="#5d636d" text-anchor="end">' + fds(days[days.length - 1]) + '</text><text x="600" y="12" font-size="11" fill="#5d636d" text-anchor="end">Tertinggi ' + rp(mx > 1 ? mx : 0) + "</text></svg>";
  var tbl = function (obj, h2) { var ks = Object.keys(obj).sort(function (x, y) { return obj[y].v - obj[x].v; }); return ks.length ? '<div class="tw"><table><thead><tr><th>' + h2 + '</th><th class="n">Jml</th><th class="n">Nilai</th></tr></thead><tbody>' + ks.slice(0, 8).map(function (k) { return "<tr><td>" + esc(k) + '</td><td class="n">' + obj[k].n + '</td><td class="n">' + rp(obj[k].v) + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<div class="empty">Belum ada data.</div>'; };
  return hd("Laporan", '<button class="btn" type="button" data-act="csv-rep">Unduh CSV laporan</button>') + '<div class="toolbar"><div class="f"><label for="rrange">Periode</label><select id="rrange" data-on="rep-range">' + [["1", "Hari ini"], ["7", "7 hari terakhir"], ["30", "30 hari terakhir"], ["semua", "Semua data"]].map(function (o) { return '<option value="' + o[0] + '"' + (S.repR === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></div></div><div class="stats"><div class="stat"><b>' + rp(rev) + "</b><span>Pemasukan (pembayaran diterima)</span></div><div class=\"stat\"><b>" + picked.length + "</b><span>Kendaraan diambil</span></div><div class=\"stat\"><b>" + rp(picked.length ? (jasa + partRev) / picked.length : 0) + "</b><span>Rata-rata per kendaraan</span></div><div class=\"stat" + (open ? " alert" : "") + '"><b>' + rp(open) + "</b><span>Belum dibayar (semua WO)</span></div></div><div class=\"stats\"><div class=\"stat\"><b>" + rp(jasa) + "</b><span>Nilai jasa</span></div><div class=\"stat\"><b>" + rp(partRev) + "</b><span>Nilai suku cadang</span></div><div class=\"stat\"><b>" + rp(margin) + "</b><span>Laba kotor suku cadang</span></div><div class=\"stat\"><b>" + bks.length + "</b><span>Booking dibuat (" + bks.filter(function (b) { return b.status === "dibatalkan"; }).length + " batal)</span></div></div><div class=\"card\" style=\"margin-bottom:14px\"><h3>Pemasukan harian</h3>" + chart + '</div><div class="two"><div><h3>Layanan dan suku cadang teratas</h3>' + tbl(bySvc, "Item") + "</div><div><h3>Per mekanik (nilai jasa)</h3>" + tbl(byMech, "Mekanik") + "<h3 style=\"margin-top:14px\">Metode pembayaran</h3>" + (Object.keys(methods).length ? '<div class="tw"><table><tbody>' + Object.keys(methods).map(function (k) { return "<tr><td>" + esc(k) + '</td><td class="n">' + rp(methods[k]) + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<div class="empty">Belum ada pembayaran.</div>') + "</div></div>";
}
ON["rep-range"] = function (el) { S.repR = el.value; render(); };
ACT["csv-rep"] = function () {
  var rg = rangeDates(), rows = [["No WO", "Nota", "Diambil", "Plat", "Pelanggan", "Mekanik", "Item", "Jenis", "Jumlah", "Harga", "Subtotal"]];
  DB.wos.filter(function (w) { return w.status === "diambil" && w.pickedAt.slice(0, 10) >= rg[0] && w.pickedAt.slice(0, 10) <= rg[1]; }).forEach(function (w) { var v = getVeh(w.vehId), m = getMech(w.mechId); w.items.forEach(function (i) { rows.push([w.no, w.invNo, w.pickedAt, v.plate, getCust(w.custId).name, m ? m.name : "", i.name, i.t === "part" ? "Suku cadang" : "Jasa", i.qty, i.price, i.qty * i.price]); }); });
  csvDown("laporan-servis.csv", rows);
};

boot();
