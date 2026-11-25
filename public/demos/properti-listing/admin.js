"use strict";
/* Panel agen: ringkasan, listing, lead (kanban), jadwal survei. PIN demo 2468. */
var adm = { q: "", st: "", tp: "", urut: "baru", lq: "", ll: "", lj: "", lv: "board", sp: "depan", sx: false, pinErr: "" };
var form = { id: null, foto: [] };

function ago(iso) {
  var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hari ini"; if (d === 1) return "kemarin"; return d + " hari lalu";
}
function jamChipsHtml(tgl, listingId, cur, except) {
  if (!tgl) return '<p class="hint">Pilih tanggal dulu.</p>';
  return JAM.map(function (j) {
    var st = slotState(tgl, j, listingId, except), dis = st !== "ok";
    return '<label class="slot' + (dis ? " off" : "") + '"><input type="radio" name="jam" value="' + j + '"' + (dis ? " disabled" : "") + (cur === j && !dis ? " checked" : "") + "><span>" + j + (st === "penuh" ? "<small>penuh</small>" : st === "listing" ? "<small>terisi</small>" : "") + "</span></label>";
  }).join("");
}
function stSel(cur, attrs) {
  return '<select ' + attrs + ">" + STAGES.map(function (s) { return '<option value="' + s[0] + '"' + (cur === s[0] ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select>";
}

/* ---------- kerangka ---------- */
function admShell(active, body, actions) {
  var tabs = [["ringkasan", "Ringkasan"], ["listing", "Listing"], ["lead", "Lead"], ["survei", "Jadwal survei"]];
  var baru = S.leads.filter(function (x) { return x.status === "baru"; }).length;
  return '<div class="wrap adm"><nav class="tabs no-print" aria-label="Panel agen">' + tabs.map(function (t) {
    return '<a href="#/admin/' + t[0] + '"' + (active === t[0] ? ' aria-current="page"' : "") + ">" + t[1] + (t[0] === "lead" && baru ? ' <span class="cnt">' + baru + "</span>" : "") + "</a>";
  }).join("") + "</nav>" + '<div class="page-h"><h1>' + ({ ringkasan: "Ringkasan", listing: "Kelola listing", lead: "Pipeline lead", survei: "Jadwal survei" }[active]) + "</h1><div class=\"acts no-print\">" + (actions || "") + "</div></div>" + body + "</div>";
}
function pageAdmin(p) {
  var main = $("#main"), tab = p[0] || "ringkasan";
  if (!isAdmin()) {
    main.innerHTML = '<div class="wrap login"><section class="box"><h1>Masuk panel agen</h1><p class="muted">Masukkan PIN untuk mengelola listing, lead, dan jadwal survei.</p>' +
      '<form data-sub="pin" novalidate><label class="fld"><span>PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-describedby="e-pin"><em class="err" id="e-pin" role="alert">' + esc(adm.pinErr) + '</em></label><button class="btn btn-block" type="submit">Masuk</button></form>' +
      '<p class="hint">PIN demo: <b>2468</b>. Ini hanya contoh, tanpa server.</p></section></div>';
    adm.pinErr = "";
    return;
  }
  var map = { ringkasan: admSummary, listing: admListings, lead: admLeads, survei: admSurvey };
  if (!map[tab]) tab = "ringkasan";
  main.innerHTML = map[tab]();
  if (tab === "listing") drawListings(); else if (tab === "lead") drawLeads(); else if (tab === "survei") drawSurvey();
}
SUB.pin = function (f) {
  if (f.elements.pin.value.trim() === PIN) {
    try { sessionStorage.setItem("np.admin", "1"); } catch (e) { /* abaikan */ }
    toast("Selamat datang, agen");
    var same = location.hash === "#/admin/ringkasan"; location.hash = "#/admin/ringkasan"; if (same) render();
  } else { $("#e-pin").textContent = "PIN salah. Coba 2468."; f.elements.pin.setAttribute("aria-invalid", "true"); f.elements.pin.select(); }
};
ACT["adm-logout"] = function () { try { sessionStorage.removeItem("np.admin"); } catch (e) { /* abaikan */ } toast("Anda sudah keluar"); location.hash = "#/"; };

/* ---------- ringkasan ---------- */
function admSummary() {
  var today = ymd(new Date()), in7 = ymd(addDays(new Date(), 7));
  var aktif = S.listings.filter(function (l) { return l.tampil && l.status === "tersedia"; }).length;
  var baru = S.leads.filter(function (x) { return x.status === "baru"; }).length;
  var sv7 = S.leads.filter(function (x) { return x.jenis === "survei" && x.status !== "batal" && x.status !== "deal" && x.tgl >= today && x.tgl <= in7; }).length;
  var deal = S.leads.filter(function (x) { return x.status === "deal"; });
  var tutup = S.leads.filter(function (x) { return x.status === "deal" || x.status === "batal"; }).length;
  var nilai = deal.reduce(function (a, x) { var l = getL(x.listingId); return a + (l && l.mode === "jual" ? l.harga : 0); }, 0);
  var conv = S.leads.length ? Math.round(deal.length / S.leads.length * 100) : 0;
  var maxS = Math.max.apply(null, STAGES.map(function (s) { return S.leads.filter(function (x) { return x.status === s[0]; }).length; }).concat([1]));
  var bars = STAGES.map(function (s) {
    var n = S.leads.filter(function (x) { return x.status === s[0]; }).length;
    return '<li><span>' + s[1] + '</span><span class="pbar"><i class="b-' + s[0] + '" style="width:' + Math.round(n / maxS * 100) + '%"></i></span><b>' + n + "</b></li>";
  }).join("");
  var days = [], cnt = {};
  S.leads.forEach(function (x) { var k = ymd(new Date(x.dibuat)); cnt[k] = (cnt[k] || 0) + 1; });
  for (var i = 13; i >= 0; i--) { var k = ymd(addDays(new Date(), -i)); days.push([k, cnt[k] || 0]); }
  var mx = Math.max.apply(null, days.map(function (d) { return d[1]; }).concat([1])), tot = days.reduce(function (a, d) { return a + d[1]; }, 0);
  var svg = '<svg class="chart" viewBox="0 0 280 90" role="img" aria-label="Lead masuk 14 hari terakhir, total ' + tot + '">' + days.map(function (d, i) {
    var h = Math.round(d[1] / mx * 62);
    return '<g><title>' + fmtTgl(d[0]) + ": " + d[1] + ' lead</title><rect x="' + (i * 20 + 2) + '" y="' + (70 - h) + '" width="16" height="' + Math.max(h, 2) + '" rx="3" class="' + (d[1] ? "on" : "off") + '"/>' + (d[1] ? '<text x="' + (i * 20 + 10) + '" y="' + (66 - h) + '" text-anchor="middle">' + d[1] + "</text>" : "") + '<text x="' + (i * 20 + 10) + '" y="84" text-anchor="middle" class="ax">' + parseYmd(d[0]).getDate() + "</text></g>";
  }).join("") + "</svg>";
  var top = S.listings.slice().sort(function (a, b) { return b.dilihat - a.dilihat; }).slice(0, 5), maxV = Math.max(top[0] ? top[0].dilihat : 1, 1);
  var topH = top.map(function (l) { return '<li><a href="#/properti/' + l.id + '">' + esc(l.judul) + '</a><span class="pbar"><i style="width:' + Math.round(l.dilihat / maxV * 100) + '%"></i></span><b>' + l.dilihat + " dilihat · " + leadsOf(l.id).length + " lead</b></li>"; }).join("");
  var next = S.leads.filter(function (x) { return x.jenis === "survei" && x.status !== "batal" && x.status !== "deal" && x.tgl >= today; }).sort(function (a, b) { return (a.tgl + a.jam) < (b.tgl + b.jam) ? -1 : 1; }).slice(0, 4);
  var nextH = next.length ? '<ul class="mini">' + next.map(function (x) { return "<li><b>" + fmtTgl(x.tgl) + ", " + x.jam + "</b><span>" + esc(x.nama) + " · " + esc(x.listingJudul) + "</span></li>"; }).join("") + "</ul>" : '<p class="muted">Tidak ada survei mendatang.</p>';
  return admShell("ringkasan",
    '<div class="kpis"><div class="kpi"><span>Listing aktif</span><b>' + aktif + "</b><small>dari " + S.listings.length + " listing</small></div><div class=\"kpi\"><span>Lead baru</span><b>" + baru + "</b><small>belum dihubungi</small></div>" +
    '<div class="kpi"><span>Survei 7 hari</span><b>' + sv7 + '</b><small>terjadwal</small></div><div class="kpi"><span>Deal</span><b>' + deal.length + "</b><small>konversi " + conv + "% dari " + S.leads.length + " lead</small></div>" +
    '<div class="kpi"><span>Nilai deal jual</span><b>' + rps(nilai) + "</b><small>" + tutup + " lead selesai</small></div></div>" +
    '<div class="two-col"><section class="box"><h2>Lead per tahap</h2><ul class="hbars">' + bars + '</ul></section><section class="box"><h2>Lead masuk, 14 hari terakhir</h2>' + svg + "</section></div>" +
    '<div class="two-col"><section class="box"><h2>Listing terpopuler</h2><ul class="hbars hb-l">' + topH + '</ul></section><section class="box"><h2>Survei berikutnya</h2>' + nextH + '<a class="btn btn-sm btn-ghost" href="#/admin/survei">Buka jadwal</a></section></div>' +
    '<section class="box"><h2>Data demo</h2><p class="muted">Ekspor ke CSV, atau kembalikan semua data (listing, lead, favorit) ke kondisi awal.</p><div class="row"><button type="button" class="btn btn-ghost" data-act="csv-l">' + ico("dl") + 'CSV listing</button><button type="button" class="btn btn-ghost" data-act="csv-t">' + ico("dl") + 'CSV lead</button><button type="button" class="btn btn-ghost" data-act="reset">Reset data demo</button></div></section>');
}
ACT["csv-l"] = function () {
  var rows = [["Kode", "Judul", "Jenis", "Tipe", "Kota", "Area", "Harga", "Satuan sewa", "Status", "Tampil", "KT", "KM", "Luas bangunan", "Luas tanah", "Dilihat", "Jumlah lead"]];
  S.listings.forEach(function (l) { rows.push([l.kode, l.judul, l.mode, l.tipe, l.kota, l.area, l.harga, l.mode === "sewa" ? l.satuan : "", l.status, l.tampil ? "ya" : "tidak", l.kt, l.km, l.lb, l.lt, l.dilihat, leadsOf(l.id).length]); });
  downloadCsv("listing-" + ymd(new Date()) + ".csv", rows); toast("CSV listing diunduh (" + S.listings.length + " baris)");
};
ACT["csv-t"] = function () {
  var rows = [["Kode tiket", "Masuk", "Nama", "WhatsApp", "Email", "Kode listing", "Listing", "Keperluan", "Jadwal survei", "Status", "Pesan", "Catatan agen"]];
  S.leads.forEach(function (x) { var l = getL(x.listingId); rows.push([x.kode, fmtDT(x.dibuat), x.nama, x.hp, x.email, l ? l.kode : "(dihapus)", x.listingJudul, x.jenis, x.jenis === "survei" ? x.tgl + " " + x.jam : "", STAGEMAP[x.status], x.pesan, x.catatan.map(function (c) { return c.teks; }).join(" | ")]); });
  downloadCsv("lead-" + ymd(new Date()) + ".csv", rows); toast("CSV lead diunduh (" + S.leads.length + " baris)");
};

/* ---------- listing ---------- */
function admListings() {
  return admShell("listing",
    '<div class="toolbar no-print"><label class="fld inl grow"><span>Cari</span><input type="search" placeholder="Judul, kode, kota" value="' + esc(adm.q) + '" data-inp="adm-q" maxlength="60"></label>' +
    '<label class="fld inl"><span>Status</span><select data-chg="adm-f" name="st"><option value="">Semua</option>' + Object.keys(STATUS_LST).map(function (k) { return '<option value="' + k + '"' + (adm.st === k ? " selected" : "") + ">" + STATUS_LST[k] + "</option>"; }).join("") + '<option value="_hide"' + (adm.st === "_hide" ? " selected" : "") + ">Disembunyikan</option></select></label>" +
    '<label class="fld inl"><span>Tipe</span><select data-chg="adm-f" name="tp"><option value="">Semua</option>' + Object.keys(TIPE).map(function (k) { return '<option value="' + k + '"' + (adm.tp === k ? " selected" : "") + ">" + TIPE[k] + "</option>"; }).join("") + "</select></label>" +
    '<label class="fld inl"><span>Urutkan</span><select data-chg="adm-f" name="urut">' + [["baru", "Terbaru"], ["lead", "Lead terbanyak"], ["dilihat", "Terpopuler"], ["harga", "Harga tertinggi"]].map(function (o) { return '<option value="' + o[0] + '"' + (adm.urut === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label></div>" +
    '<div id="adm-list"></div>',
    '<button type="button" class="btn btn-ghost" data-act="csv-l">' + ico("dl") + 'CSV</button><button type="button" class="btn" data-act="l-new">' + ico("plus") + "Tambah listing</button>");
}
INP["adm-q"] = function (el) { adm.q = el.value; drawListings(); };
CHG["adm-f"] = function (el) { adm[el.name] = el.value; drawListings(); };
function drawListings() {
  var el = $("#adm-list"); if (!el) return;
  var q = adm.q.toLowerCase().trim();
  var list = S.listings.filter(function (l) {
    if (adm.st === "_hide" ? l.tampil : (adm.st && l.status !== adm.st)) return false;
    if (adm.tp && l.tipe !== adm.tp) return false;
    if (q && (l.judul + " " + l.kode + " " + l.kota + " " + l.area).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var sorters = { baru: function (a, b) { return b.dibuat < a.dibuat ? -1 : 1; }, lead: function (a, b) { return leadsOf(b.id).length - leadsOf(a.id).length; }, dilihat: function (a, b) { return b.dilihat - a.dilihat; }, harga: function (a, b) { return b.harga - a.harga; } };
  list.sort(sorters[adm.urut] || sorters.baru);
  if (!list.length) { el.innerHTML = empty("Tidak ada listing", "Ubah pencarian atau tambah listing baru.", '<button type="button" class="btn" data-act="l-new">Tambah listing</button>'); return; }
  el.innerHTML = '<p class="muted count-s">' + list.length + ' listing</p><div class="tw"><table class="tbl dt"><thead><tr><th scope="col">Listing</th><th scope="col">Jenis</th><th scope="col">Harga</th><th scope="col">Status</th><th scope="col">Tampil</th><th scope="col">Lead</th><th scope="col">Dilihat</th><th scope="col"><span class="sr">Aksi</span></th></tr></thead><tbody>' +
    list.map(function (l) {
      var im = photo(l.foto[0]), n = leadsOf(l.id).length, aktif = leadsOf(l.id).filter(function (x) { return x.status !== "deal" && x.status !== "batal"; }).length;
      return "<tr" + (l.tampil ? "" : ' class="hid"') + '><td data-label="Listing"><div class="lcell"><img src="img/' + im.k + '.jpg" alt="" width="56" height="42" loading="lazy"><div><b>' + esc(l.judul) + "</b><small>" + l.kode + " · " + esc(l.area) + ", " + esc(l.kota) + "</small></div></div></td>" +
        '<td data-label="Jenis">' + (l.mode === "jual" ? "Jual" : "Sewa") + ", " + TIPE[l.tipe] + '</td><td data-label="Harga">' + price(l) + "</td>" +
        '<td data-label="Status"><select data-chg="l-status" data-id="' + l.id + '" aria-label="Status ' + esc(l.kode) + '">' + statusOpts(l.mode, l.status) + "</select></td>" +
        '<td data-label="Tampil"><button type="button" class="sw' + (l.tampil ? " on" : "") + '" role="switch" aria-checked="' + l.tampil + '" data-act="l-tog" data-id="' + l.id + '" aria-label="Tampilkan ' + esc(l.kode) + ' di situs"><i></i></button></td>' +
        '<td data-label="Lead">' + n + (aktif ? " <small>(" + aktif + " aktif)</small>" : "") + '</td><td data-label="Dilihat">' + l.dilihat + '</td><td class="acts-c"><a class="btn btn-sm btn-ghost" href="#/properti/' + l.id + '">Lihat</a><button type="button" class="btn btn-sm btn-ghost" data-act="l-edit" data-id="' + l.id + '">Ubah</button><button type="button" class="btn btn-sm btn-ghost danger" data-act="l-del" data-id="' + l.id + '">Hapus</button></td></tr>';
    }).join("") + "</tbody></table></div>";
}
function statusOpts(mode, cur) {
  var ks = mode === "jual" ? ["tersedia", "dipesan", "terjual"] : ["tersedia", "dipesan", "disewa"];
  if (ks.indexOf(cur) < 0) ks.push(cur);
  return ks.map(function (k) { return '<option value="' + k + '"' + (cur === k ? " selected" : "") + ">" + STATUS_LST[k] + "</option>"; }).join("");
}
CHG["l-status"] = function (el) {
  var l = getL(el.getAttribute("data-id")); if (!l) return;
  l.status = el.value; save();
  var act = leadsOf(l.id).filter(function (x) { return x.status !== "deal" && x.status !== "batal"; }).length;
  toast(l.kode + " sekarang " + STATUS_LST[l.status].toLowerCase() + (act && (l.status === "terjual" || l.status === "disewa") ? ". Ada " + act + " lead aktif, tutup lewat pipeline." : ""));
};
ACT["l-tog"] = function (el) {
  var l = getL(el.getAttribute("data-id")); if (!l) return;
  l.tampil = !l.tampil; save(); el.classList.toggle("on", l.tampil); el.setAttribute("aria-checked", l.tampil);
  el.closest("tr").classList.toggle("hid", !l.tampil);
  toast(l.tampil ? "Listing tampil di situs" : "Listing disembunyikan dari situs");
};
ACT["l-del"] = function (el) {
  if (!twice(el)) return;
  var id = el.getAttribute("data-id"), l = getL(id); if (!l) return;
  var n = leadsOf(id).length;
  S.listings = S.listings.filter(function (x) { return x.id !== id; });
  S.favs = S.favs.filter(function (x) { return x !== id; }); S.cmp = S.cmp.filter(function (x) { return x !== id; });
  save(); closeSheet(); drawListings(); renderHeader();
  toast(l.kode + " dihapus" + (n ? ". " + n + " lead tetap tersimpan." : ""));
};
ACT["l-new"] = function () { openListingForm(null); };
ACT["l-edit"] = function (el) { openListingForm(el.getAttribute("data-id")); };
function openSheet(html) { var d = $("#sheet"); d.innerHTML = html; if (!d.open) d.showModal(); d.scrollTop = 0; }
ACT["sheet-close"] = function () { closeSheet(); };
function numField(name, label, v, max) { return '<label class="fld"><span>' + label + '</span><input name="' + name + '" type="number" min="0" max="' + max + '" step="1" value="' + (v || 0) + '" aria-describedby="e-' + name + '"><em class="err" id="e-' + name + '"></em></label>'; }
function openListingForm(id) {
  var l = id ? getL(id) : null;
  var d = l || { mode: "jual", tipe: "rumah", judul: "", kota: "", area: "", alamat: "", harga: "", satuan: "bulan", kt: 2, km: 1, lb: 0, lt: 0, lantai: 1, garasi: 0, sertifikat: "SHM", tahun: new Date().getFullYear() - 3, listrik: 2200, agen: 0, deskripsi: "", fas: [], foto: [], status: "tersedia", tampil: true };
  form = { id: id, foto: d.foto.slice() };
  openSheet('<form id="lf" data-sub="listing" novalidate><div class="sheet-h"><h2>' + (l ? "Ubah listing " + l.kode : "Listing baru") + '</h2><button type="button" class="x" data-act="sheet-close" aria-label="Tutup">' + ico("x") + '</button></div><div class="sheet-b"><p id="lf-sum" class="err sum" role="alert" hidden></p>' +
    '<label class="fld"><span>Judul</span><input name="judul" maxlength="90" value="' + esc(d.judul) + '" aria-describedby="e-judul"><em class="err" id="e-judul"></em></label>' +
    '<div class="two"><label class="fld"><span>Jenis</span><select name="mode" data-chg="l-mode"><option value="jual"' + (d.mode === "jual" ? " selected" : "") + '>Dijual</option><option value="sewa"' + (d.mode === "sewa" ? " selected" : "") + ">Disewa</option></select></label>" +
    '<label class="fld"><span>Tipe</span><select name="tipe">' + Object.keys(TIPE).map(function (k) { return '<option value="' + k + '"' + (d.tipe === k ? " selected" : "") + ">" + TIPE[k] + "</option>"; }).join("") + "</select></label></div>" +
    '<div class="two"><label class="fld"><span>Kota</span><input name="kota" maxlength="40" value="' + esc(d.kota) + '" aria-describedby="e-kota"><em class="err" id="e-kota"></em></label><label class="fld"><span>Area</span><input name="area" maxlength="40" value="' + esc(d.area) + '" aria-describedby="e-area"><em class="err" id="e-area"></em></label></div>' +
    '<label class="fld"><span>Alamat</span><input name="alamat" maxlength="90" value="' + esc(d.alamat) + '"></label>' +
    '<div class="two"><label class="fld"><span id="hl">Harga (Rp)</span><input name="harga" inputmode="text" value="' + (d.harga ? dot(d.harga) : "") + '" placeholder="1,5m atau 450jt" aria-describedby="e-harga"><em class="err" id="e-harga"></em></label>' +
    '<label class="fld" id="satf"' + (d.mode === "sewa" ? "" : " hidden") + '><span>Per</span><select name="satuan"><option value="bulan"' + (d.satuan === "bulan" ? " selected" : "") + '>bulan</option><option value="tahun"' + (d.satuan === "tahun" ? " selected" : "") + ">tahun</option></select></label></div>" +
    '<div class="four">' + numField("kt", "Kamar tidur", d.kt, 20) + numField("km", "Kamar mandi", d.km, 20) + numField("lb", "Bangunan m²", d.lb, 100000) + numField("lt", "Tanah m²", d.lt, 1000000) + "</div>" +
    '<div class="four">' + numField("lantai", "Lantai", d.lantai, 80) + numField("garasi", "Garasi", d.garasi, 20) + numField("tahun", "Tahun", d.tahun, 2100) + numField("listrik", "Listrik VA", d.listrik, 100000) + "</div>" +
    '<div class="two"><label class="fld"><span>Sertifikat</span><select name="sertifikat">' + ["SHM", "HGB", "Strata title", "Girik / AJB"].map(function (s) { return "<option" + (d.sertifikat === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select></label><label class="fld"><span>Agen</span><select name="agen">' + AGEN.map(function (a, i) { return '<option value="' + i + '"' + (d.agen === i ? " selected" : "") + ">" + esc(a.n) + "</option>"; }).join("") + "</select></label></div>" +
    '<label class="fld"><span>Deskripsi</span><textarea name="deskripsi" rows="4" maxlength="800" aria-describedby="e-deskripsi">' + esc(d.deskripsi) + '</textarea><em class="err" id="e-deskripsi"></em></label>' +
    '<fieldset class="fas"><legend>Fasilitas</legend>' + FAS.map(function (f) { return '<label class="chk"><input type="checkbox" name="fas" value="' + f[0] + '"' + (d.fas.indexOf(f[0]) > -1 ? " checked" : "") + "><span>" + f[1] + "</span></label>"; }).join("") + "</fieldset>" +
    '<fieldset class="picker-f"><legend>Foto (maks 8, yang pertama jadi sampul)</legend><div id="picker"></div><em class="err" id="e-foto"></em></fieldset>' +
    '<div class="two"><label class="fld"><span>Status</span><select name="status" id="stsel">' + statusOpts(d.mode, d.status) + '</select></label><label class="chk sw-l"><input type="checkbox" name="tampil"' + (d.tampil ? " checked" : "") + "><span>Tampil di situs</span></label></div></div>" +
    '<div class="sheet-f"><button type="button" class="btn btn-ghost" data-act="sheet-close">Batal</button>' + (l ? '<button type="button" class="btn btn-ghost danger" data-act="l-del" data-id="' + l.id + '">Hapus</button>' : "") + '<button class="btn" type="submit">' + (l ? "Simpan perubahan" : "Tambah listing") + "</button></div></form>");
  drawPicker();
}
CHG["l-mode"] = function (el) {
  var f = el.form, cur = f.elements.status.value;
  $("#satf", f).hidden = el.value !== "sewa";
  var ok = el.value === "jual" ? ["tersedia", "dipesan", "terjual"] : ["tersedia", "dipesan", "disewa"];
  f.elements.status.innerHTML = statusOpts(el.value, ok.indexOf(cur) > -1 ? cur : "tersedia");
};
function drawPicker() {
  var el = $("#picker"); if (!el) return;
  var sel = form.foto;
  el.innerHTML = '<div class="strip">' + (sel.length ? sel.map(function (k, i) {
    return '<div class="sel-i"><img src="img/' + photo(k).k + '.jpg" alt="Foto ' + (i + 1) + ": " + esc(photo(k).alt) + '" width="64" height="48">' + (i === 0 ? "<small>Sampul</small>" : '<button type="button" data-act="foto-cover" data-k="' + k + '">Jadikan sampul</button>') + "</div>";
  }).join("") : '<p class="hint">Belum ada foto dipilih.</p>') + '</div><div class="pick-g" role="group" aria-label="Pilih foto">' + IMG.map(function (im) {
    var i = sel.indexOf(im.k);
    return '<button type="button" class="pk' + (i > -1 ? " on" : "") + '" data-act="foto-pick" data-k="' + im.k + '" aria-pressed="' + (i > -1) + '" aria-label="' + esc(im.g + ": " + im.alt) + '"><img src="img/' + im.k + '.jpg" alt="" loading="lazy" width="90" height="68">' + (i > -1 ? "<b>" + (i + 1) + "</b>" : "") + "</button>";
  }).join("") + "</div>";
}
ACT["foto-pick"] = function (el) {
  var k = el.getAttribute("data-k"), i = form.foto.indexOf(k);
  if (i > -1) form.foto.splice(i, 1);
  else if (form.foto.length >= 8) { toast("Maksimal 8 foto."); return; }
  else form.foto.push(k);
  var sc = $("#sheet").scrollTop; drawPicker(); $("#sheet").scrollTop = sc;
  var b = $('.pk[data-k="' + k + '"]'); if (b) b.focus();
};
ACT["foto-cover"] = function (el) {
  var k = el.getAttribute("data-k"); form.foto = [k].concat(form.foto.filter(function (x) { return x !== k; }));
  var sc = $("#sheet").scrollTop; drawPicker(); $("#sheet").scrollTop = sc;
};
SUB.listing = function (f) {
  var g = function (n) { return (f.elements[n].value || "").trim(); }, er = {}, ni = function (n) { var v = g(n); return v === "" ? 0 : Number(v); };
  var harga = parsePrice(g("harga")), mode = g("mode"), tipe = g("tipe");
  if (g("judul").length < 5) er.judul = "Judul minimal 5 karakter.";
  if (g("kota").length < 2) er.kota = "Isi kota.";
  if (g("area").length < 2) er.area = "Isi area.";
  if (isNaN(harga) || harga <= 0) er.harga = "Isi harga, contoh 1,5m atau 450jt.";
  else if (mode === "jual" && harga < 1e6) er.harga = "Harga jual minimal Rp 1 jt.";
  else if (mode === "sewa" && harga < 1e5) er.harga = "Harga sewa minimal Rp 100 rb.";
  ["kt", "km", "lb", "lt", "lantai", "garasi", "tahun", "listrik"].forEach(function (n) { var v = ni(n); if (isNaN(v) || v < 0 || v !== Math.floor(v)) er[n] = "Angka bulat, 0 atau lebih."; });
  if (!er.lb && tipe !== "tanah" && tipe !== "rumah" && ni("lb") < 1) er.lb = "Isi luas bangunan.";
  if (!er.lb && tipe === "rumah" && ni("lb") < 1) er.lb = "Isi luas bangunan.";
  if (!er.lt && (tipe === "tanah" || tipe === "rumah" || tipe === "ruko") && ni("lt") < 1) er.lt = "Isi luas tanah.";
  if (g("deskripsi").length < 20) er.deskripsi = "Deskripsi minimal 20 karakter.";
  if (!form.foto.length) er.foto = "Pilih minimal 1 foto.";
  ["judul", "kota", "area", "harga", "kt", "km", "lb", "lt", "lantai", "garasi", "tahun", "listrik", "deskripsi", "foto"].forEach(function (n) { var e = $("#e-" + n, f); if (e) e.textContent = er[n] || ""; if (f.elements[n] && f.elements[n].setAttribute) { if (er[n]) f.elements[n].setAttribute("aria-invalid", "true"); else f.elements[n].removeAttribute("aria-invalid"); } });
  var keys = Object.keys(er), sum = $("#lf-sum");
  sum.hidden = !keys.length; sum.textContent = keys.length ? "Ada " + keys.length + " isian yang perlu diperbaiki." : "";
  if (keys.length) { var t = f.elements[keys[0]]; if (t && t.focus) t.focus(); else sum.scrollIntoView(); return; }
  var o = {
    judul: g("judul"), mode: mode, tipe: tipe, kota: g("kota"), area: g("area"), alamat: g("alamat"), harga: harga, satuan: mode === "sewa" ? g("satuan") : "bulan",
    kt: tipe === "tanah" ? 0 : ni("kt"), km: tipe === "tanah" ? 0 : ni("km"), lb: tipe === "tanah" ? 0 : ni("lb"), lt: ni("lt"), lantai: Math.max(1, ni("lantai")), garasi: ni("garasi"), tahun: ni("tahun"), listrik: ni("listrik"),
    sertifikat: g("sertifikat"), agen: +g("agen"), deskripsi: g("deskripsi"), fas: $$("input[name=fas]:checked", f).map(function (c) { return c.value; }), foto: form.foto.slice(), status: g("status"), tampil: f.elements.tampil.checked
  };
  var l = form.id ? getL(form.id) : null;
  if (l) {
    Object.keys(o).forEach(function (k) { l[k] = o[k]; });
    S.leads.forEach(function (x) { if (x.listingId === l.id) x.listingJudul = l.judul; });
    toast(l.kode + " disimpan");
  } else {
    var num = S.nextId++; o.id = "p" + num; o.kode = "NP-" + (1000 + num); o.dibuat = new Date().toISOString(); o.dilihat = 0;
    S.listings.push(o); toast(o.kode + " ditambahkan" + (o.tampil ? "" : " (disembunyikan)"));
  }
  save(); closeSheet(); render(true);
};

/* ---------- lead: kanban ---------- */
function admLeads() {
  var opts = '<option value="">Semua listing</option>' + S.listings.map(function (l) { return '<option value="' + l.id + '"' + (adm.ll === l.id ? " selected" : "") + ">" + esc(l.kode + " " + l.judul.slice(0, 40)) + "</option>"; }).join("");
  return admShell("lead",
    '<div class="toolbar no-print"><label class="fld inl grow"><span>Cari</span><input type="search" placeholder="Nama, kode tiket, properti" value="' + esc(adm.lq) + '" data-inp="ld-q" maxlength="60"></label>' +
    '<label class="fld inl"><span>Listing</span><select data-chg="ld-f" name="ll">' + opts + '</select></label><label class="fld inl"><span>Keperluan</span><select data-chg="ld-f" name="lj"><option value="">Semua</option><option value="survei"' + (adm.lj === "survei" ? " selected" : "") + '>Survei</option><option value="tanya"' + (adm.lj === "tanya" ? " selected" : "") + ">Pertanyaan</option></select></label>" +
    '<div class="vt" role="group" aria-label="Tampilan"><button type="button" data-act="lv" data-v="board" aria-pressed="' + (adm.lv === "board") + '">Papan</button><button type="button" data-act="lv" data-v="list" aria-pressed="' + (adm.lv === "list") + '">Daftar</button></div></div><div id="ld-body"></div>');
}
function leadsFiltered() {
  var q = adm.lq.toLowerCase().trim();
  return S.leads.filter(function (x) {
    if (adm.ll && x.listingId !== adm.ll) return false;
    if (adm.lj && x.jenis !== adm.lj) return false;
    if (q && (x.nama + " " + x.kode + " " + x.listingJudul + " " + x.hp).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function leadCard(x) {
  var i = STAGES.map(function (s) { return s[0]; }).indexOf(x.status);
  var prev = i > 0 && x.status !== "batal" ? STAGES[i - 1] : null, nxt = i < 4 ? STAGES[i + 1] : null;
  var over = x.jenis === "survei" && x.tgl < ymd(new Date()) && ["baru", "dihubungi"].indexOf(x.status) > -1;
  return '<li class="lc" draggable="true" data-k="' + x.kode + '"><button type="button" class="lc-o" data-act="ld-open" data-k="' + x.kode + '"><b>' + esc(x.nama) + "</b><span>" + esc(x.listingJudul) + "</span>" +
    '<span class="lc-m"><i class="tag t-' + x.jenis + '">' + (x.jenis === "survei" ? "Survei " + parseYmd(x.tgl).getDate() + " " + BLN[parseYmd(x.tgl).getMonth()] + ", " + x.jam : "Tanya") + "</i><small>" + x.kode + " · " + ago(x.dibuat) + "</small></span>" + (over ? '<span class="warn">Jadwal terlewat</span>' : "") + "</button>" +
    '<span class="lc-b">' + (prev ? '<button type="button" class="mv" data-act="ld-move" data-k="' + x.kode + '" data-to="' + prev[0] + '" aria-label="Pindah ' + x.kode + " ke " + prev[1] + '">' + ico("left") + "</button>" : "<span></span>") + (nxt ? '<button type="button" class="mv" data-act="ld-move" data-k="' + x.kode + '" data-to="' + nxt[0] + '" aria-label="Pindah ' + x.kode + " ke " + nxt[1] + '">' + nxt[1] + ico("right") + "</button>" : "") + "</span></li>";
}
function drawLeads() {
  var el = $("#ld-body"); if (!el) return;
  var list = leadsFiltered();
  if (adm.lv === "list") {
    el.innerHTML = list.length ? '<div class="tw"><table class="tbl dt"><thead><tr><th scope="col">Tiket</th><th scope="col">Nama</th><th scope="col">Properti</th><th scope="col">Keperluan</th><th scope="col">Masuk</th><th scope="col">Status</th><th scope="col"><span class="sr">Aksi</span></th></tr></thead><tbody>' +
      list.slice().sort(function (a, b) { return b.dibuat < a.dibuat ? -1 : 1; }).map(function (x) { return '<tr><td data-label="Tiket"><b>' + x.kode + '</b></td><td data-label="Nama">' + esc(x.nama) + '</td><td data-label="Properti">' + esc(x.listingJudul) + '</td><td data-label="Keperluan">' + (x.jenis === "survei" ? "Survei " + fmtTgl(x.tgl) + ", " + x.jam : "Pertanyaan") + '</td><td data-label="Masuk">' + ago(x.dibuat) + '</td><td data-label="Status">' + stSel(x.status, 'data-chg="ld-status" data-k="' + x.kode + '" aria-label="Status ' + x.kode + '"') + '</td><td class="acts-c"><button type="button" class="btn btn-sm btn-ghost" data-act="ld-open" data-k="' + x.kode + '">Detail</button></td></tr>'; }).join("") + "</tbody></table></div>" : empty("Tidak ada lead", "Belum ada yang cocok dengan pencarian.");
    return;
  }
  el.innerHTML = '<p class="hint no-print">Seret kartu ke kolom lain, atau pakai tombol panah pada kartu.</p><div class="board">' + STAGES.map(function (s) {
    var items = list.filter(function (x) { return x.status === s[0]; }).sort(function (a, b) { return b.dibuat < a.dibuat ? -1 : 1; });
    return '<section class="col col-' + s[0] + '" data-to="' + s[0] + '" aria-label="' + s[1] + '"><h2>' + s[1] + " <span class=\"cnt\">" + items.length + '</span></h2><ul class="lcs">' + (items.length ? items.map(leadCard).join("") : '<li class="none">Kosong</li>') + "</ul></section>";
  }).join("") + "</div>";
}
INP["ld-q"] = function (el) { adm.lq = el.value; drawLeads(); };
CHG["ld-f"] = function (el) { adm[el.name] = el.value; drawLeads(); };
ACT.lv = function (el) { adm.lv = el.getAttribute("data-v"); $$("[data-act=lv]").forEach(function (b) { b.setAttribute("aria-pressed", b === el); }); drawLeads(); };
function findLead(k) { return S.leads.filter(function (x) { return x.kode === k; })[0]; }
function moveLead(lead, to) {
  if (!lead || lead.status === to) return;
  setLeadStatus(lead, to);
  var l = getL(lead.listingId), extra = "";
  if (to === "deal" && l && l.status === "tersedia") { l.status = "dipesan"; extra = ". Listing " + l.kode + " ditandai dipesan."; }
  save();
  toast(lead.kode + " dipindah ke " + STAGEMAP[to] + extra);
}
function refreshLeads() {
  var tab = route.parts[1] || "ringkasan";
  if (tab === "lead") drawLeads(); else if (tab === "survei") drawSurvey();
  else render(true);
  renderTabsBadge();
}
function renderTabsBadge() {
  var a = $(".tabs a[href='#/admin/lead']"); if (!a) return;
  var n = S.leads.filter(function (x) { return x.status === "baru"; }).length;
  a.innerHTML = "Lead" + (n ? ' <span class="cnt">' + n + "</span>" : "");
}
ACT["ld-move"] = function (el) { moveLead(findLead(el.getAttribute("data-k")), el.getAttribute("data-to")); refreshLeads(); };
CHG["ld-status"] = function (el) {
  moveLead(findLead(el.getAttribute("data-k")), el.value);
  if ($("#sheet").open) openLead(el.getAttribute("data-k"));
  refreshLeads();
};
CHG["sv-status"] = CHG["ld-status"];
document.addEventListener("dragstart", function (e) {
  var c = e.target.closest && e.target.closest(".lc"); if (!c) return;
  e.dataTransfer.setData("text/plain", c.getAttribute("data-k")); e.dataTransfer.effectAllowed = "move"; c.classList.add("drag");
});
document.addEventListener("dragend", function (e) { var c = e.target.closest && e.target.closest(".lc"); if (c) c.classList.remove("drag"); $$(".col.over").forEach(function (x) { x.classList.remove("over"); }); });
document.addEventListener("dragover", function (e) { var c = e.target.closest && e.target.closest(".col"); if (c) { e.preventDefault(); $$(".col.over").forEach(function (x) { if (x !== c) x.classList.remove("over"); }); c.classList.add("over"); } });
document.addEventListener("drop", function (e) {
  var c = e.target.closest && e.target.closest(".col"); if (!c) return;
  e.preventDefault(); c.classList.remove("over");
  var k = e.dataTransfer.getData("text/plain"); moveLead(findLead(k), c.getAttribute("data-to")); refreshLeads();
});

/* detail lead */
function openLead(k) {
  var x = findLead(k); if (!x) return;
  var l = getL(x.listingId), ag = AGEN[(l && l.agen) || 0];
  var dates = surveyDates(); if (x.tgl && dates.indexOf(x.tgl) < 0) dates.unshift(x.tgl);
  openSheet('<div class="sheet-h"><h2>' + x.kode + ' <span class="st st-' + x.status + '">' + STAGEMAP[x.status] + '</span></h2><button type="button" class="x" data-act="sheet-close" aria-label="Tutup">' + ico("x") + '</button></div><div class="sheet-b">' +
    '<label class="fld"><span>Tahap pipeline</span>' + stSel(x.status, 'data-chg="ld-status" data-k="' + x.kode + '"') + "</label>" +
    '<dl class="spec one"><div><dt>Nama</dt><dd>' + esc(x.nama) + '</dd></div><div><dt>WhatsApp</dt><dd><a href="' + waLink(l ? l.agen : 0, "Halo " + x.nama + ", saya " + ag.n + " dari Naungan Properti. Tentang tiket " + x.kode + ".") + '" target="_blank" rel="noopener">' + esc(x.hp) + "</a></dd></div>" + (x.email ? "<div><dt>Email</dt><dd>" + esc(x.email) + "</dd></div>" : "") +
    "<div><dt>Properti</dt><dd>" + (l ? '<a href="#/properti/' + l.id + '">' + esc(l.judul) + "</a> (" + STATUS_LST[l.status] + ")" : esc(x.listingJudul) + " (dihapus)") + "</dd></div><div><dt>Masuk</dt><dd>" + fmtDT(x.dibuat) + "</dd></div><div><dt>Keperluan</dt><dd>" + (x.jenis === "survei" ? "Survei" : "Pertanyaan") + "</dd></div>" + (x.pesan ? "<div><dt>Pesan</dt><dd>" + esc(x.pesan) + "</dd></div>" : "") + "</dl>" +
    (x.jenis === "survei" ? '<form id="jf" data-sub="jadwal" data-k="' + x.kode + '" novalidate><h3>Jadwal survei</h3><label class="fld"><span>Tanggal</span><select name="tgl" data-chg="adm-tgl">' + dates.map(function (d) { return '<option value="' + d + '"' + (d === x.tgl ? " selected" : "") + ">" + fmtTgl(d) + "</option>"; }).join("") + '</select></label><div id="jam" class="chipsel">' + jamChipsHtml(x.tgl, x.listingId, x.jam, x.kode) + '</div><em class="err" id="e-jam"></em><button class="btn btn-sm" type="submit">Simpan jadwal</button></form>' : "") +
    '<h3>Catatan agen</h3><ul class="notes">' + (x.catatan.length ? x.catatan.slice().reverse().map(function (c) { return "<li><span>" + fmtDT(c.t) + "</span>" + esc(c.teks) + "</li>"; }).join("") : '<li class="muted">Belum ada catatan.</li>') + '</ul><form data-sub="note" data-k="' + x.kode + '" novalidate><label class="fld"><span>Tambah catatan</span><textarea name="teks" rows="2" maxlength="300" aria-describedby="e-teks"></textarea><em class="err" id="e-teks"></em></label><button class="btn btn-sm" type="submit">Simpan catatan</button></form>' +
    '<h3>Riwayat status</h3><ol class="tl">' + x.riwayat.slice().reverse().map(function (r) { return "<li><b>" + STAGEMAP[r.s] + "</b><span>" + fmtDT(r.t) + "</span></li>"; }).join("") + '</ol></div><div class="sheet-f"><button type="button" class="btn btn-ghost danger" data-act="ld-del" data-k="' + x.kode + '">Hapus lead</button><button type="button" class="btn" data-act="sheet-close">Selesai</button></div>');
}
ACT["ld-open"] = function (el) { openLead(el.getAttribute("data-k")); };
CHG["adm-tgl"] = function (el) {
  var f = el.form, x = findLead(f.getAttribute("data-k"));
  $("#jam", f).innerHTML = jamChipsHtml(el.value, x.listingId, x.jam, x.kode);
};
SUB.jadwal = function (f) {
  var x = findLead(f.getAttribute("data-k")), tgl = f.elements.tgl.value, jam = ($("input[name=jam]:checked", f) || {}).value, e = $("#e-jam", f);
  if (!jam) { e.textContent = "Pilih jam."; return; }
  if (slotState(tgl, jam, x.listingId, x.kode) !== "ok") { e.textContent = "Jam itu sudah terisi."; return; }
  x.tgl = tgl; x.jam = jam; save(); toast("Jadwal " + x.kode + " diubah ke " + fmtTgl(tgl) + ", " + jam); openLead(x.kode); refreshLeads();
};
SUB.note = function (f) {
  var x = findLead(f.getAttribute("data-k")), t = f.elements.teks.value.trim();
  if (t.length < 3) { $("#e-teks", f).textContent = "Tulis catatan minimal 3 karakter."; f.elements.teks.focus(); return; }
  x.catatan.push({ t: new Date().toISOString(), teks: t }); save(); toast("Catatan disimpan"); openLead(x.kode);
};
ACT["ld-del"] = function (el) {
  if (!twice(el)) return;
  var k = el.getAttribute("data-k"); S.leads = S.leads.filter(function (x) { return x.kode !== k; }); S.mine = S.mine.filter(function (m) { return m !== k; });
  save(); closeSheet(); refreshLeads(); toast(k + " dihapus");
};

/* ---------- jadwal survei ---------- */
function admSurvey() {
  return admShell("survei",
    '<div class="toolbar no-print"><label class="fld inl"><span>Periode</span><select data-chg="sv-f" name="sp">' + [["depan", "Mendatang"], ["hari", "Hari ini"], ["lewat", "Sudah lewat"], ["semua", "Semua"]].map(function (o) { return '<option value="' + o[0] + '"' + (adm.sp === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label><label class="chk"><input type="checkbox" data-chg="sv-f" name="sx"' + (adm.sx ? " checked" : "") + "><span>Tampilkan yang dibatalkan</span></label></div><div id=\"sv-body\"></div>",
    '<button type="button" class="btn btn-ghost" data-act="print">' + ico("print") + "Cetak jadwal</button>") + "";
}
CHG["sv-f"] = function (el) { adm[el.name] = el.type === "checkbox" ? el.checked : el.value; drawSurvey(); };
function drawSurvey() {
  var el = $("#sv-body"); if (!el) return;
  var today = ymd(new Date());
  var list = S.leads.filter(function (x) {
    if (x.jenis !== "survei") return false;
    if (x.status === "batal" && !adm.sx) return false;
    if (adm.sp === "depan") return x.tgl >= today;
    if (adm.sp === "hari") return x.tgl === today;
    if (adm.sp === "lewat") return x.tgl < today;
    return true;
  }).sort(function (a, b) { return (a.tgl + a.jam) < (b.tgl + b.jam) ? -1 : 1; });
  if (adm.sp === "lewat") list.reverse();
  if (!list.length) { el.innerHTML = empty("Tidak ada survei", "Belum ada jadwal pada periode ini."); return; }
  var groups = {}, order = [];
  list.forEach(function (x) { if (!groups[x.tgl]) { groups[x.tgl] = []; order.push(x.tgl); } groups[x.tgl].push(x); });
  el.innerHTML = '<p class="print-only">Jadwal survei, dicetak ' + fmtTgl(today) + "</p>" + order.map(function (d) {
    return '<section class="day"><h2>' + fmtTgl(d) + (d === today ? ' <span class="tag t-survei">Hari ini</span>' : "") + ' <small>' + groups[d].length + ' survei</small></h2><ul class="sv">' + groups[d].map(function (x) {
      var l = getL(x.listingId), ag = AGEN[(l && l.agen) || 0], late = d < today && ["baru", "dihubungi"].indexOf(x.status) > -1;
      return '<li class="' + (x.status === "batal" ? "cx" : "") + '"><span class="jam-b">' + x.jam + '</span><div class="sv-i"><b>' + esc(x.nama) + "</b> · " + esc(x.hp) + "<small>" + esc(x.listingJudul) + " · " + x.kode + " · agen " + esc(ag.n.split(" ")[0]) + "</small>" + (late ? '<small class="warn">Jadwal terlewat, perbarui status.</small>' : "") + (x.pesan ? "<small>" + esc(x.pesan) + "</small>" : "") + '</div><div class="sv-a no-print">' + stSel(x.status, 'data-chg="sv-status" data-k="' + x.kode + '" aria-label="Status ' + x.kode + '"') + '<button type="button" class="btn btn-sm btn-ghost" data-act="ld-open" data-k="' + x.kode + '">Detail</button></div><span class="print-only">' + STAGEMAP[x.status] + "</span></li>";
    }).join("") + "</ul></section>";
  }).join("");
}
