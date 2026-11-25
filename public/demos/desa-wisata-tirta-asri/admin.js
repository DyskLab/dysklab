/* Admin demo Tirta Asri. Memakai data yang sama dengan situs publik (window.TA dari app.js). */
(function () {
'use strict';
var T = window.TA, $ = T.$, $$ = T.$$, esc = T.esc, rp = T.rp;
var PIN = '2468', SES = 'tirta.admin';
var STATUS = T.STATUS, URUT = ['menunggu', 'lunas', 'checkin', 'selesai', 'batal'];
var main = $('#a-main');
var B = { q: '', st: 'semua', urut: 'baru', hal: 1, buka: null };
var PS = { pid: null, tgl: '', kal: null };
var HS = { hid: null, tgl: '', kal: null };
var PF = { st: 'semua' };
var resetTimer = null;

function masuk() { try { return sessionStorage.getItem(SES) === '1'; } catch (e) { return false; } }
function setMasuk(v) { try { if (v) sessionStorage.setItem(SES, '1'); else sessionStorage.removeItem(SES); } catch (e) {} }
function pesan(id, msg, ok) { var p = $('#' + id); if (!p) return; p.textContent = msg || ''; p.className = ok ? 'a-ok' : 'a-err'; p.hidden = !msg; }
function num(v) { v = String(v).trim(); return /^\d+$/.test(v) ? Number(v) : NaN; }
function tandai(el, bad) { if (!el) return; if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
function bdg(s) { return '<span class="a-bdg ' + s + '">' + STATUS[s] + '</span>'; }

/* ---------- masuk ---------- */
$('#loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var pin = $('#pin'), er = $('#pinErr');
  if (pin.value.trim() === PIN) { setMasuk(true); er.hidden = true; tandai(pin, false); mulai(); }
  else { er.textContent = 'PIN salah. PIN demo ada di bawah kolom ini.'; er.hidden = false; tandai(pin, true); pin.value = ''; pin.focus(); }
});
$('#keluar').addEventListener('click', function () { setMasuk(false); location.hash = ''; $('#app').hidden = true; $('#login').hidden = false; $('#pin').value = ''; $('#pin').focus(); });

function mulai() {
  $('#login').hidden = true; $('#app').hidden = false;
  rute();
}
function hitungBadge() {
  var d = T.db();
  var b = d.booking.filter(function (x) { return x.status === 'menunggu'; }).length, p = d.pesan.filter(function (x) { return !x.dibaca; }).length;
  [['booking', b], ['pesan', p]].forEach(function (x) { var el = $('[data-c=' + x[0] + ']'); el.textContent = x[1]; el.hidden = !x[1]; });
}
function rute() {
  if (!masuk()) return;
  var v = location.hash.replace('#', '') || 'dashboard';
  if (!V[v]) v = 'dashboard';
  $$('#aNav a').forEach(function (a) { if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  hitungBadge();
  V[v]();
}
window.addEventListener('hashchange', function () { rute(); main.focus(); window.scrollTo(0, 0); });
window.addEventListener('storage', function () { if (masuk()) { hitungBadge(); } });
function ulang() { hitungBadge(); rute(); }

var V = {};

/* ---------- dashboard ---------- */
V.dashboard = function () {
  var d = T.db(), t = T.today(), tamu = 0;
  var aktif = d.booking.filter(function (b) { return b.status !== 'batal'; });
  var pendapatan = d.booking.filter(function (b) { return ['lunas', 'checkin', 'selesai'].indexOf(b.status) >= 0; }).reduce(function (a, b) { return a + b.total; }, 0);
  var tunggu = d.booking.filter(function (b) { return b.status === 'menunggu'; });
  var tungguNilai = tunggu.reduce(function (a, b) { return a + b.total; }, 0);
  var dt = [];
  aktif.forEach(function (b) { b.items.forEach(function (i) { var tg = i.tipe === 'paket' ? i.tgl : i.masuk; if (tg >= t && tg <= T.addDays(t, 7)) dt.push({ tg: tg, i: i, b: b }); }); });
  dt.sort(function (a, b) { return a.tg < b.tg ? -1 : a.tg > b.tg ? 1 : 0; });
  var belum = d.pesan.filter(function (p) { return !p.dibaca; }).length;
  var h = '<div class="a-kp"><div><h1>Dashboard</h1><p>Ringkasan booking dan keterisian. Data sama dengan yang dilihat pengunjung.</p></div></div>';
  h += '<div class="a-g4">' +
    tile('Booking aktif', aktif.length, d.booking.length + ' booking semuanya') +
    tile('Menunggu bayar', tunggu.length, rp(tungguNilai)) +
    tile('Pendapatan (lunas dst.)', rp(pendapatan), 'Lunas, check-in, selesai') +
    tile('Pertanyaan baru', belum, d.pesan.length + ' pertanyaan semuanya') + '</div>';
  h += '<div class="a-g2"><div class="a-card"><h2>Kedatangan 7 hari ke depan</h2>';
  if (!dt.length) h += '<p class="m">Belum ada kedatangan.</p>';
  else h += '<ul class="a-list">' + dt.slice(0, 8).map(function (x) {
    return '<li><div><b>' + esc(T.tglPendek(x.tg)) + '</b><br><span class="m">' + esc(x.i.judul) + ' - ' + (x.i.tipe === 'paket' ? x.i.peserta + ' orang' : x.i.malam + ' malam') + '</span></div><div style="text-align:right"><a href="#booking" data-buka="' + esc(x.b.kode) + '">' + esc(x.b.kode) + '</a><br>' + bdg(x.b.status) + '</div></li>';
  }).join('') + '</ul>' + (dt.length > 8 ? '<p class="m xs" style="margin-top:8px">dan ' + (dt.length - 8) + ' lainnya.</p>' : '');
  h += '</div><div class="a-card"><h2>Status booking</h2>';
  var mx = Math.max(1, d.booking.length);
  URUT.forEach(function (s) { var n = d.booking.filter(function (b) { return b.status === s; }).length; h += '<div class="a-bar"><span>' + STATUS[s] + '</span><i><b style="width:' + Math.round(n / mx * 100) + '%"></b></i><b>' + n + '</b></div>'; });
  h += '</div></div>';
  h += '<div class="a-card" style="margin-top:14px"><h2>Keterisian 7 hari ke depan</h2><div class="a-scroll"><table class="a-t"><thead><tr><th scope="col">Terisi / kapasitas</th>';
  for (var k = 0; k < 7; k++) { var tg = T.addDays(t, k); h += '<th scope="col">' + esc(T.tglPendek(tg).split(',')[0] + ' ' + tg.slice(8)) + '</th>'; }
  h += '</tr></thead><tbody>';
  d.paket.filter(function (p) { return p.aktif; }).forEach(function (p) {
    h += '<tr><td>' + esc(p.nama) + '</td>';
    for (var k = 0; k < 7; k++) { var tg = T.addDays(t, k), cap = T.kapPaket(d, p, tg), u = T.terpakaiPaket(d, p.id, tg); h += '<td' + (cap > 0 && u >= cap ? ' class="pn"' : '') + '>' + (cap ? u + '/' + cap : '-') + '</td>'; }
    h += '</tr>';
  });
  d.homestay.filter(function (x) { return x.aktif; }).forEach(function (x) {
    h += '<tr><td>' + esc(x.nama) + ' (' + (x.satuan === 'orang' ? 'tamu' : 'kamar') + ')</td>';
    for (var k = 0; k < 7; k++) { var tg = T.addDays(t, k), cap = T.kapMalam(d, x, tg), u = T.terpakaiMalam(d, x.id, tg); h += '<td' + (cap > 0 && u >= cap ? ' class="pn"' : '') + '>' + (cap ? u + '/' + cap : 'tutup') + '</td>'; }
    h += '</tr>';
  });
  h += '</tbody></table></div><p class="m xs" style="margin-top:8px">Sel berwarna emas berarti penuh.</p></div>';
  main.innerHTML = h;
  $$('[data-buka]', main).forEach(function (a) { a.addEventListener('click', function () { B.buka = a.dataset.buka; B.q = ''; B.st = 'semua'; B.hal = 1; }); });
};
function tile(a, v, s) { return '<div class="a-card a-tile"><p class="a">' + esc(a) + '</p><p class="v">' + esc(v) + '</p><small>' + esc(s) + '</small></div>'; }

/* ---------- booking ---------- */
function cocok(b) {
  if (B.st !== 'semua' && b.status !== B.st) return false;
  var q = B.q.trim().toLowerCase();
  if (!q) return true;
  return (b.kode + ' ' + b.nama + ' ' + b.telp + ' ' + b.email).toLowerCase().indexOf(q) >= 0 || T.normTelp(q) === b.telp;
}
function daftarBooking() {
  var l = T.db().booking.filter(cocok);
  l.sort(function (a, b) {
    if (B.urut === 'tanggal') { var x = T.tglTerdekat(a), y = T.tglTerdekat(b); return x < y ? -1 : x > y ? 1 : 0; }
    if (B.urut === 'total') return b.total - a.total;
    return a.dibuat < b.dibuat ? 1 : a.dibuat > b.dibuat ? -1 : 0;
  });
  return l;
}
function csv(rows) {
  return rows.map(function (r) {
    return r.map(function (c) { c = String(c == null ? '' : c); if (/^[=+\-@\t\r]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(',');
  }).join('\r\n');
}
function csvBooking(list) {
  var rows = [['Kode', 'Status', 'Dibuat', 'Nama', 'Telepon', 'Email', 'Isi booking', 'Tanggal terdekat', 'Total (Rp)', 'Catatan']];
  list.forEach(function (b) {
    rows.push([b.kode, STATUS[b.status], b.dibuat, b.nama, b.telp, b.email, b.items.map(function (i) { return i.judul + ' (' + i.sub + ')'; }).join(' | '), T.tglTerdekat(b), b.total, b.catatan]);
  });
  return csv(rows);
}
function csvPesan() {
  var rows = [['Nomor', 'Dibuat', 'Nama', 'Kontak', 'Topik', 'Sudah dibaca', 'Pertanyaan']];
  T.db().pesan.forEach(function (p) { rows.push(['T-' + T.pad(p.id), p.dibuat, p.nama, p.kontak, p.topik, p.dibaca ? 'ya' : 'belum', p.isi]); });
  return csv(rows);
}
function unduh(nama, teks) {
  var blob = new Blob(['﻿' + teks], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function detailBooking(b) {
  var final = b.status === 'batal' || b.status === 'selesai';
  var h = '<div class="a-det"><h3>Pemesan</h3><p>' + esc(b.nama) + ' - ' + esc(T.telpTampil(b.telp)) + (b.email ? ' - ' + esc(b.email) : '') + '</p>' + (b.catatan ? '<p class="m">Catatan: ' + esc(b.catatan) + '</p>' : '') + '<h3>Isi booking</h3>';
  b.items.forEach(function (i) {
    h += '<div class="it"><b>' + esc(i.judul) + '</b> - ' + rp(i.total) + '<br><span class="m">' + esc(i.sub) + '</span>' + (i.tamb && i.tamb.length ? '<br><span class="m">Tambahan: ' + esc(i.tamb.join(', ')) + '</span>' : '') + '</div>';
  });
  h += '<p style="margin-top:6px"><b>Total ' + rp(b.total) + '</b></p><h3>Riwayat</h3><ul>' + b.riwayat.map(function (r) { return '<li>' + esc(T.waktu(r.t)) + ': ' + esc(r.teks) + '</li>'; }).join('') + '</ul>' +
    '<h3>Ubah status</h3><div class="a-sel"><label class="sr" for="st-' + esc(b.kode) + '">Status baru</label><select id="st-' + esc(b.kode) + '" data-st-sel="' + esc(b.kode) + '"' + (final ? ' disabled' : '') + '>' +
    URUT.map(function (s) { return '<option value="' + s + '"' + (s === b.status ? ' selected' : '') + '>' + STATUS[s] + '</option>'; }).join('') + '</select>' +
    '<button class="a-btn" type="button" data-st-simpan="' + esc(b.kode) + '"' + (final ? ' disabled' : '') + '>Simpan status</button>' +
    '<a class="a-btn out" target="_blank" rel="noopener" href="https://wa.me/' + '62' + esc(b.telp.slice(1)) + '?text=' + encodeURIComponent('Halo ' + b.nama + ', ini Desa Tirta Asri soal booking ' + b.kode + '.') + '">Hubungi lewat WhatsApp</a></div>' +
    '<p id="stp-' + esc(b.kode) + '" role="status" class="a-err" hidden></p>' +
    (final ? '<p class="m xs" style="margin-top:6px">Booking ' + STATUS[b.status].toLowerCase() + ' sudah final dan tidak bisa diubah.</p>' : '') + '</div>';
  return h;
}
V.booking = function () {
  var d = T.db(), semua = d.booking, list = daftarBooking(), per = 8, hal = Math.max(1, Math.min(B.hal, Math.ceil(list.length / per) || 1)); B.hal = hal;
  var h = '<div class="a-kp"><div><h1>Booking</h1><p>Ubah status di sini, dan pemesan langsung melihatnya di halaman Cek booking.</p></div><button class="a-btn out" id="csvB" type="button">Ekspor CSV (' + list.length + ')</button></div>';
  h += '<div class="a-tb"><div class="cari"><label class="sr" for="qB">Cari booking</label><input id="qB" type="search" placeholder="Cari kode, nama, atau telepon" value="' + esc(B.q) + '" autocomplete="off"></div>' +
    '<label class="sr" for="urutB">Urutkan</label><select id="urutB"><option value="baru"' + (B.urut === 'baru' ? ' selected' : '') + '>Terbaru</option><option value="tanggal"' + (B.urut === 'tanggal' ? ' selected' : '') + '>Tanggal kunjungan</option><option value="total"' + (B.urut === 'total' ? ' selected' : '') + '>Total terbesar</option></select></div>';
  h += '<div class="a-chips" role="group" aria-label="Filter status"><button type="button" data-f="semua" aria-pressed="' + (B.st === 'semua') + '">Semua <small>' + semua.length + '</small></button>' +
    URUT.map(function (s) { return '<button type="button" data-f="' + s + '" aria-pressed="' + (B.st === s) + '">' + STATUS[s] + ' <small>' + semua.filter(function (b) { return b.status === s; }).length + '</small></button>'; }).join('') + '</div>';
  h += '<div id="bList">';
  if (!list.length) h += '<div class="kosong">Tidak ada booking yang cocok.</div>';
  list.slice((hal - 1) * per, hal * per).forEach(function (b) {
    var o = B.buka === b.kode;
    h += '<article class="a-bk"><button type="button" data-k="' + esc(b.kode) + '" aria-expanded="' + o + '"><span><span class="k">' + esc(b.kode) + '</span> ' + bdg(b.status) + '</span><span class="t">' + rp(b.total) + '</span><span class="m xs">' + esc(b.nama) + ' - ' + esc(b.items.map(function (i) { return i.judul; }).join(', ')) + '</span><span class="m xs" style="text-align:right">' + esc(T.tglPendek(T.tglTerdekat(b))) + '</span></button>' + (o ? detailBooking(b) : '') + '</article>';
  });
  h += '</div>';
  if (list.length > per) h += '<div class="a-pg"><button class="a-btn out sm" id="prevB" type="button"' + (hal <= 1 ? ' disabled' : '') + '>Sebelumnya</button><span>Halaman ' + hal + ' dari ' + Math.ceil(list.length / per) + '</span><button class="a-btn out sm" id="nextB" type="button"' + (hal >= Math.ceil(list.length / per) ? ' disabled' : '') + '>Berikutnya</button></div>';
  main.innerHTML = h;
  var q = $('#qB');
  q.addEventListener('input', function () { B.q = q.value; B.hal = 1; var pos = q.selectionStart; V.booking(); var n = $('#qB'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} });
  $('#urutB').addEventListener('change', function (e) { B.urut = e.target.value; V.booking(); });
  $('.a-chips', main).addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; B.st = b.dataset.f; B.hal = 1; V.booking(); });
  $('#csvB').addEventListener('click', function () { unduh('booking-tirta-asri.csv', csvBooking(list)); T.toast('CSV booking diunduh.'); });
  var pv = $('#prevB'), nx = $('#nextB');
  if (pv) pv.addEventListener('click', function () { B.hal--; V.booking(); });
  if (nx) nx.addEventListener('click', function () { B.hal++; V.booking(); });
  $('#bList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]');
    if (b) { B.buka = B.buka === b.dataset.k ? null : b.dataset.k; V.booking(); var nb = $('[data-k="' + b.dataset.k + '"]'); if (nb) nb.focus(); return; }
    var s = e.target.closest('[data-st-simpan]');
    if (s) {
      var kode = s.dataset.stSimpan, v = $('#st-' + kode).value, msg = T.ubahStatus(kode, v, 'admin');
      if (msg) { pesan('stp-' + kode, msg, false); return; }
      hitungBadge(); T.toast('Status ' + kode + ' menjadi ' + STATUS[v] + '.'); V.booking();
    }
  });
};

/* ---------- paket ---------- */
function hariUrut() { return [1, 2, 3, 4, 5, 6, 0]; }
function formPaket(p) {
  return '<form class="a-pk" data-paket="' + esc(p.id) + '" novalidate><h3>' + esc(p.nama) + ' ' + (p.aktif ? '' : '<span class="a-bdg batal">Nonaktif</span>') + '</h3><div class="a-fg">' +
    '<div class="a-f w2"><label for="pn-' + p.id + '">Nama</label><input id="pn-' + p.id + '" name="nama" value="' + esc(p.nama) + '"></div>' +
    '<div class="a-f"><label for="ph-' + p.id + '">Harga dewasa (Rp)</label><input id="ph-' + p.id + '" name="harga" inputmode="numeric" value="' + p.harga + '"></div>' +
    '<div class="a-f"><label for="pa-' + p.id + '">Harga anak (Rp)</label><input id="pa-' + p.id + '" name="anak" inputmode="numeric" value="' + p.anak + '"></div>' +
    '<div class="a-f"><label for="pk-' + p.id + '">Kuota per hari</label><input id="pk-' + p.id + '" name="kuota" inputmode="numeric" value="' + p.kuota + '"></div>' +
    '<div class="a-f"><label for="pl-' + p.id + '">Pesan minimal (hari)</label><input id="pl-' + p.id + '" name="lead" inputmode="numeric" value="' + p.lead + '"></div>' +
    '<div class="a-f wide"><span class="a-lbl">Hari buka</span><div class="a-hr">' + hariUrut().map(function (x) { return '<label class="a-ck"><input type="checkbox" name="hari" value="' + x + '"' + (p.hari.indexOf(x) >= 0 ? ' checked' : '') + '>' + T.HARI[x] + '</label>'; }).join('') + '</div></div>' +
    '<label class="a-ck wide"><input type="checkbox" name="aktif"' + (p.aktif ? ' checked' : '') + '>Tampil dan bisa dipesan</label></div>' +
    '<div class="a-act"><button class="a-btn" type="submit">Simpan paket</button><span role="status" class="a-err" hidden></span></div></form>';
}
function bacaFormPaket(f, d, p) {
  var harga = num(f.harga.value), anak = num(f.anak.value), kuota = num(f.kuota.value), lead = num(f.lead.value), nama = f.nama.value.trim();
  var hari = $$('[name=hari]:checked', f).map(function (x) { return Number(x.value); });
  var err = '';
  [['nama', nama.length < 3], ['harga', !(harga >= 1000)], ['anak', isNaN(anak) || anak > harga], ['kuota', isNaN(kuota) || kuota < 1 || kuota > 500], ['lead', isNaN(lead) || lead > 30]].forEach(function (c) { tandai(f[c[0]], c[1]); });
  if (nama.length < 3) err = 'Nama minimal 3 huruf.';
  else if (!(harga >= 1000)) err = 'Harga dewasa minimal Rp 1.000 (angka saja).';
  else if (isNaN(anak) || anak > harga) err = 'Harga anak harus angka dan tidak lebih mahal dari dewasa.';
  else if (isNaN(kuota) || kuota < 1 || kuota > 500) err = 'Kuota per hari harus 1 sampai 500.';
  else if (isNaN(lead) || lead > 30) err = 'Pesan minimal 0 sampai 30 hari.';
  else if (!hari.length) err = 'Pilih minimal satu hari buka.';
  return err ? { err: err } : { v: { nama: nama, harga: harga, anak: anak, kuota: kuota, lead: lead, hari: hari, aktif: f.aktif.checked } };
}
V.paket = function () {
  var d = T.db(), t = T.today();
  if (!PS.pid || !T.cari(d.paket, PS.pid)) PS.pid = d.paket[0] && d.paket[0].id;
  var h = '<div class="a-kp"><div><h1>Paket dan kuota</h1><p>Harga dan kuota harian berlaku untuk pemesanan baru. Booking yang sudah ada tidak berubah.</p></div></div>';
  h += '<div class="a-card"><h2>Kuota per tanggal</h2><div class="a-f" style="max-width:360px;margin-bottom:12px"><label for="pSel">Paket</label><select id="pSel">' + d.paket.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === PS.pid ? ' selected' : '') + '>' + esc(p.nama) + '</option>'; }).join('') + '</select></div>' +
    '<p class="m xs" style="margin-bottom:8px">Setiap tanggal menampilkan terpakai/kuota. Ketuk tanggal untuk mengubah kuotanya atau menutupnya.</p><div id="pKalA" class="a-kal"></div><div id="pEd"></div></div>';
  h += '<div class="a-card"><h2>Daftar paket</h2>' + d.paket.map(formPaket).join('') + '</div>';
  h += '<div class="a-card"><h2>Tambah paket</h2><form id="paketBaru" novalidate><div class="a-fg"><div class="a-f w2"><label for="nbN">Nama</label><input id="nbN" name="nama"></div><div class="a-f"><label for="nbH">Harga dewasa (Rp)</label><input id="nbH" name="harga" inputmode="numeric"></div><div class="a-f"><label for="nbA">Harga anak (Rp)</label><input id="nbA" name="anak" inputmode="numeric"></div><div class="a-f"><label for="nbK">Kuota per hari</label><input id="nbK" name="kuota" inputmode="numeric" value="20"></div><div class="a-f"><label for="nbL">Pesan minimal (hari)</label><input id="nbL" name="lead" inputmode="numeric" value="3"></div></div><div class="a-act"><button class="a-btn" type="submit">Tambah paket</button><span id="nbE" class="a-err" role="alert" hidden></span></div></form></div>';
  h += '<div class="a-card"><h2>Kegiatan tambahan</h2>' + d.tambahan.map(function (a) {
    return '<form class="a-pk" data-tamb="' + esc(a.id) + '" novalidate><div class="a-fg"><div class="a-f w2"><label for="tb-' + a.id + '">' + esc(a.nama) + ' (' + (a.per === 'orang' ? 'per orang' : 'tetap') + ')</label><input id="tb-' + a.id + '" name="harga" inputmode="numeric" value="' + a.harga + '"></div><div class="a-act" style="align-self:end;margin:0"><button class="a-btn" type="submit">Simpan harga</button><span role="status" class="a-err" hidden></span></div></div></form>';
  }).join('') + '</div>';
  main.innerHTML = h;
  $('#pSel').addEventListener('change', function (e) { PS.pid = e.target.value; PS.tgl = ''; V.paket(); });
  pasangKalPaket();
  $$('form[data-paket]', main).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d2 = T.db(), p = T.cari(d2.paket, f.dataset.paket), r = bacaFormPaket(f, d2, p), st = $('[role=status]', f);
      if (r.err) { st.className = 'a-err'; st.textContent = r.err; st.hidden = false; return; }
      Object.keys(r.v).forEach(function (k) { p[k] = r.v[k]; });
      T.save(d2); T.toast('Paket ' + p.nama + ' disimpan.'); V.paket();
    });
  });
  $$('form[data-tamb]', main).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = num(f.harga.value), st = $('[role=status]', f);
      if (!(v >= 1000)) { tandai(f.harga, true); st.textContent = 'Harga minimal Rp 1.000 (angka saja).'; st.hidden = false; return; }
      var d2 = T.db(); T.cari(d2.tambahan, f.dataset.tamb).harga = v; T.save(d2); T.toast('Harga tambahan disimpan.'); V.paket();
    });
  });
  $('#paketBaru').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, nama = f.nama.value.trim(), h1 = num(f.harga.value), a1 = num(f.anak.value), k1 = num(f.kuota.value), l1 = num(f.lead.value), er = '';
    if (nama.length < 3) er = 'Nama minimal 3 huruf.'; else if (!(h1 >= 1000)) er = 'Harga dewasa minimal Rp 1.000.'; else if (isNaN(a1) || a1 > h1) er = 'Harga anak harus angka dan tidak lebih mahal dari dewasa.'; else if (isNaN(k1) || k1 < 1 || k1 > 500) er = 'Kuota 1 sampai 500.'; else if (isNaN(l1) || l1 > 30) er = 'Pesan minimal 0 sampai 30 hari.';
    if (er) { pesan('nbE', er, false); return; }
    var d2 = T.db(), id = 'p' + Date.now().toString(36);
    d2.paket.push({ id: id, nama: nama, ket: 'Paket baru dari pengelola.', durasi: 'Lihat keterangan di lokasi', harga: h1, anak: a1, kuota: k1, hari: [0, 1, 2, 3, 4, 5, 6], lead: l1, aktif: true });
    T.save(d2); PS.pid = id; T.toast('Paket ditambahkan.'); V.paket();
  });
};
function pasangKalPaket() {
  var d = T.db(), p = T.cari(d.paket, PS.pid); if (!p) { $('#pKalA').innerHTML = '<p class="m">Belum ada paket.</p>'; return; }
  var t = T.today();
  PS.kal = T.Kalender($('#pKalA'), {
    admin: true,
    info: function (tg) {
      var dd = T.db(), cap = T.kapPaket(dd, p, tg), u = T.terpakaiPaket(dd, p.id, tg), past = tg < t;
      return { dis: past, sub: cap ? u + '/' + cap : (u ? u + '/0' : 'Tutup'), k: cap ? (u >= cap ? 'sdikit' : 'ok') : '', label: cap ? 'terpakai ' + u + ' dari ' + cap : 'tutup' };
    },
    sel: function () { return { a: PS.tgl }; },
    pilih: function (tg) { PS.tgl = tg; PS.kal.gambar(); editorKuota(); }
  });
  editorKuota();
}
function editorKuota() {
  var box = $('#pEd'); if (!PS.tgl) { box.innerHTML = ''; return; }
  var d = T.db(), p = T.cari(d.paket, PS.pid), tg = PS.tgl, cap = T.kapPaket(d, p, tg), u = T.terpakaiPaket(d, p.id, tg), ov = d.kuota[p.id + '|' + tg] != null;
  var def = p.hari.indexOf(T.dow(tg)) >= 0 ? p.kuota : 0;
  box.innerHTML = '<div class="a-ed"><b>' + esc(T.tglPanjang(tg)) + '</b><p class="m">Terpakai ' + u + ' dari kuota ' + cap + (ov ? ' (diubah manual)' : ' (bawaan ' + def + ')') + '.</p>' +
    '<div class="a-f"><label for="kuotaIn">Kuota tanggal ini</label><input id="kuotaIn" inputmode="numeric" value="' + cap + '" style="max-width:160px"></div><p class="a-err" id="kuotaE" role="alert" hidden></p>' +
    '<div class="a-act"><button class="a-btn" type="button" id="kSimpan">Simpan kuota</button><button class="a-btn out" type="button" id="kTutup">Tutup tanggal</button><button class="a-btn out" type="button" id="kDef"' + (ov ? '' : ' disabled') + '>Kembalikan ke bawaan</button></div></div>';
  function set(v) {
    var d2 = T.db(), used = T.terpakaiPaket(d2, p.id, tg);
    if (isNaN(v) || v > 500) { pesan('kuotaE', 'Kuota harus angka 0 sampai 500.', false); tandai($('#kuotaIn'), true); return; }
    if (v < used) { pesan('kuotaE', 'Sudah ada ' + used + ' peserta di tanggal ini. Kuota minimal ' + used + '.', false); tandai($('#kuotaIn'), true); return; }
    d2.kuota[p.id + '|' + tg] = v; T.save(d2); T.toast('Kuota ' + T.tglPendek(tg) + ' menjadi ' + v + '.'); PS.kal.gambar(); editorKuota();
  }
  $('#kSimpan').addEventListener('click', function () { set(num($('#kuotaIn').value)); });
  $('#kTutup').addEventListener('click', function () { set(0); });
  $('#kDef').addEventListener('click', function () { var d2 = T.db(); delete d2.kuota[p.id + '|' + tg]; T.save(d2); T.toast('Kuota dikembalikan ke bawaan.'); PS.kal.gambar(); editorKuota(); });
}

/* ---------- homestay ---------- */
function maksTerpakai(d, h) {
  var t = T.today(), m = 0;
  for (var i = 0; i < T.HORIZON + 20; i++) m = Math.max(m, T.terpakaiMalam(d, h.id, T.addDays(t, i)));
  return m;
}
function formHs(h) {
  var orang = h.satuan === 'orang';
  return '<form class="a-pk" data-hs="' + esc(h.id) + '" novalidate><h3>' + esc(h.nama) + ' ' + (h.aktif ? '' : '<span class="a-bdg batal">Nonaktif</span>') + '</h3><div class="a-fg">' +
    '<div class="a-f w2"><label for="hn-' + h.id + '">Nama</label><input id="hn-' + h.id + '" name="nama" value="' + esc(h.nama) + '"></div>' +
    '<div class="a-f"><label for="hh-' + h.id + '">Harga ' + (orang ? 'per orang' : 'per kamar') + ' (Rp)</label><input id="hh-' + h.id + '" name="harga" inputmode="numeric" value="' + h.harga + '"></div>' +
    '<div class="a-f"><label for="hs-' + h.id + '">Sarapan per tamu (Rp, 0 = termasuk)</label><input id="hs-' + h.id + '" name="sarapan" inputmode="numeric" value="' + h.sarapan + '"></div>' +
    '<div class="a-f"><label for="hk-' + h.id + '">' + (orang ? 'Kapasitas (orang)' : 'Jumlah kamar') + '</label><input id="hk-' + h.id + '" name="kamar" inputmode="numeric" value="' + h.kamar + '"></div>' +
    (orang ? '' : '<div class="a-f"><label for="ht-' + h.id + '">Tamu per kamar</label><input id="ht-' + h.id + '" name="tamuKamar" inputmode="numeric" value="' + h.tamuKamar + '"></div>') +
    '<div class="a-f wide"><label for="he-' + h.id + '">Keterangan</label><input id="he-' + h.id + '" name="ket" value="' + esc(h.ket) + '"></div>' +
    '<label class="a-ck wide"><input type="checkbox" name="aktif"' + (h.aktif ? ' checked' : '') + '>Tampil dan bisa dipesan</label></div>' +
    '<div class="a-act"><button class="a-btn" type="submit">Simpan</button><span role="status" class="a-err" hidden></span></div></form>';
}
V.homestay = function () {
  var d = T.db();
  if (!HS.hid || !T.cari(d.homestay, HS.hid)) HS.hid = d.homestay[0] && d.homestay[0].id;
  var hs = T.cari(d.homestay, HS.hid);
  var h = '<div class="a-kp"><div><h1>Homestay dan ketersediaan</h1><p>Atur harga, jumlah kamar, dan ketersediaan per malam. Malam yang sudah dibooking tidak bisa dikurangi di bawah jumlah terpakai.</p></div></div>';
  h += '<div class="a-card"><h2>Ketersediaan per malam</h2><div class="a-f" style="max-width:360px;margin-bottom:12px"><label for="hSel">Penginapan</label><select id="hSel">' + d.homestay.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === HS.hid ? ' selected' : '') + '>' + esc(x.nama) + '</option>'; }).join('') + '</select></div>' +
    '<p class="m xs" style="margin-bottom:8px">Setiap tanggal menampilkan terpakai/tersedia (' + (hs && hs.satuan === 'orang' ? 'tempat' : 'kamar') + ') untuk malam yang dimulai tanggal itu.</p><div id="hKalA" class="a-kal"></div><div id="hEd"></div>' +
    '<h3 style="margin-top:18px">Atur rentang tanggal</h3><form id="rentang" novalidate><div class="a-fg"><div class="a-f"><label for="rDari">Dari malam</label><input id="rDari" type="date" name="dari"></div><div class="a-f"><label for="rSampai">Sampai malam</label><input id="rSampai" type="date" name="sampai"></div><div class="a-f"><label for="rJml">Tersedia</label><input id="rJml" name="jml" inputmode="numeric" value="0"></div></div><div class="a-act"><button class="a-btn" type="submit">Terapkan rentang</button><span id="rE" role="alert" class="a-err" hidden></span></div></form></div>';
  h += '<div class="a-card"><h2>Daftar penginapan</h2>' + d.homestay.map(formHs).join('') + '</div>';
  h += '<div class="a-card"><h2>Tambah penginapan</h2><form id="hsBaru" novalidate><div class="a-fg"><div class="a-f w2"><label for="nhN">Nama</label><input id="nhN" name="nama"></div><div class="a-f"><label for="nhS">Jenis</label><select id="nhS" name="satuan"><option value="kamar">Per kamar</option><option value="orang">Per orang (kasur lantai)</option></select></div><div class="a-f"><label for="nhH">Harga (Rp)</label><input id="nhH" name="harga" inputmode="numeric"></div><div class="a-f"><label for="nhK">Kamar atau kapasitas</label><input id="nhK" name="kamar" inputmode="numeric" value="1"></div><div class="a-f"><label for="nhT">Tamu per kamar</label><input id="nhT" name="tamuKamar" inputmode="numeric" value="2"></div><div class="a-f"><label for="nhR">Sarapan per tamu (Rp)</label><input id="nhR" name="sarapan" inputmode="numeric" value="0"></div></div><div class="a-act"><button class="a-btn" type="submit">Tambah penginapan</button><span id="nhE" class="a-err" role="alert" hidden></span></div></form></div>';
  main.innerHTML = h;
  $('#hSel').addEventListener('change', function (e) { HS.hid = e.target.value; HS.tgl = ''; V.homestay(); });
  pasangKalHs();
  $$('form[data-hs]', main).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d2 = T.db(), x = T.cari(d2.homestay, f.dataset.hs), st = $('[role=status]', f);
      var nama = f.nama.value.trim(), harga = num(f.harga.value), sar = num(f.sarapan.value), kamar = num(f.kamar.value), tk = f.tamuKamar ? num(f.tamuKamar.value) : 1, er = '';
      if (nama.length < 3) er = 'Nama minimal 3 huruf.'; else if (!(harga >= 1000)) er = 'Harga minimal Rp 1.000 (angka saja).'; else if (isNaN(sar)) er = 'Sarapan harus angka (0 jika termasuk).'; else if (isNaN(kamar) || kamar < 1 || kamar > 60) er = 'Jumlah harus 1 sampai 60.'; else if (isNaN(tk) || tk < 1 || tk > 12) er = 'Tamu per kamar 1 sampai 12.';
      if (!er) { var mk = maksTerpakai(d2, x); if (kamar < mk) er = 'Sudah ada booking yang memakai ' + mk + ' pada satu malam. Jumlah minimal ' + mk + '.'; }
      if (er) { st.className = 'a-err'; st.textContent = er; st.hidden = false; return; }
      x.nama = nama; x.harga = harga; x.sarapan = sar; x.kamar = kamar; x.tamuKamar = tk; x.ket = f.ket.value.trim() || x.ket; x.aktif = f.aktif.checked;
      T.save(d2); T.toast('Penginapan ' + x.nama + ' disimpan.'); V.homestay();
    });
  });
  $('#hsBaru').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, nama = f.nama.value.trim(), harga = num(f.harga.value), kamar = num(f.kamar.value), tk = num(f.tamuKamar.value), sar = num(f.sarapan.value), er = '';
    if (nama.length < 3) er = 'Nama minimal 3 huruf.'; else if (!(harga >= 1000)) er = 'Harga minimal Rp 1.000.'; else if (isNaN(kamar) || kamar < 1 || kamar > 60) er = 'Jumlah 1 sampai 60.'; else if (isNaN(tk) || tk < 1 || tk > 12) er = 'Tamu per kamar 1 sampai 12.'; else if (isNaN(sar)) er = 'Sarapan harus angka.';
    if (er) { pesan('nhE', er, false); return; }
    var d2 = T.db(), id = 'h' + Date.now().toString(36), orang = f.satuan.value === 'orang';
    d2.homestay.push({ id: id, nama: nama, ket: 'Penginapan baru dari pengelola.', satuan: f.satuan.value, kamar: kamar, tamuKamar: orang ? 1 : tk, harga: harga, sarapan: sar, aktif: true });
    T.save(d2); HS.hid = id; T.toast('Penginapan ditambahkan.'); V.homestay();
  });
  $('#rentang').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, dari = f.dari.value, sampai = f.sampai.value, jml = num(f.jml.value), d2 = T.db(), x = T.cari(d2.homestay, HS.hid), er = '';
    if (!dari || !sampai) er = 'Isi tanggal dari dan sampai.'; else if (sampai < dari) er = 'Tanggal sampai tidak boleh sebelum dari.'; else if (dari < T.today()) er = 'Tanggal tidak boleh di masa lalu.'; else if (T.selisih(dari, sampai) > 120) er = 'Maksimal 120 malam sekali atur.'; else if (isNaN(jml) || jml > x.kamar) er = 'Tersedia harus angka 0 sampai ' + x.kamar + '.';
    if (!er) for (var tg = dari; tg <= sampai; tg = T.addDays(tg, 1)) { var u = T.terpakaiMalam(d2, x.id, tg); if (jml < u) { er = 'Malam ' + T.tglPendek(tg) + ' sudah dipakai ' + u + '. Tersedia minimal ' + u + '.'; break; } }
    tandai(f.dari, !dari); tandai(f.sampai, !sampai);
    if (er) { pesan('rE', er, false); return; }
    for (var g = dari; g <= sampai; g = T.addDays(g, 1)) d2.avail[x.id + '|' + g] = jml;
    T.save(d2); T.toast('Ketersediaan diatur untuk ' + (T.selisih(dari, sampai) + 1) + ' malam.'); V.homestay();
  });
};
function pasangKalHs() {
  var d = T.db(), x = T.cari(d.homestay, HS.hid); if (!x) { $('#hKalA').innerHTML = '<p class="m">Belum ada penginapan.</p>'; return; }
  var t = T.today();
  HS.kal = T.Kalender($('#hKalA'), {
    admin: true,
    info: function (tg) {
      var dd = T.db(), cap = T.kapMalam(dd, x, tg), u = T.terpakaiMalam(dd, x.id, tg);
      return { dis: tg < t, sub: cap ? u + '/' + cap : 'Tutup', k: cap ? (u >= cap ? 'sdikit' : 'ok') : '', label: cap ? 'terpakai ' + u + ' dari ' + cap : 'tutup' };
    },
    sel: function () { return { a: HS.tgl }; },
    pilih: function (tg) { HS.tgl = tg; HS.kal.gambar(); editorMalam(); }
  });
  editorMalam();
}
function editorMalam() {
  var box = $('#hEd'); if (!HS.tgl) { box.innerHTML = ''; return; }
  var d = T.db(), x = T.cari(d.homestay, HS.hid), tg = HS.tgl, cap = T.kapMalam(d, x, tg), u = T.terpakaiMalam(d, x.id, tg), ov = d.avail[x.id + '|' + tg] != null;
  box.innerHTML = '<div class="a-ed"><b>Malam ' + esc(T.tglPanjang(tg)) + '</b><p class="m">Terpakai ' + u + ' dari ' + cap + ' (maksimal ' + x.kamar + ')' + (ov ? ', diubah manual' : '') + '.</p>' +
    '<div class="a-f"><label for="avIn">Tersedia malam ini</label><input id="avIn" inputmode="numeric" value="' + cap + '" style="max-width:160px"></div><p class="a-err" id="avE" role="alert" hidden></p>' +
    '<div class="a-act"><button class="a-btn" type="button" id="avSimpan">Simpan</button><button class="a-btn out" type="button" id="avTutup">Tutup malam ini</button><button class="a-btn out" type="button" id="avDef"' + (ov ? '' : ' disabled') + '>Kembalikan ke bawaan</button></div></div>';
  function set(v) {
    var d2 = T.db(), used = T.terpakaiMalam(d2, x.id, tg);
    if (isNaN(v) || v > x.kamar) { pesan('avE', 'Harus angka 0 sampai ' + x.kamar + '.', false); tandai($('#avIn'), true); return; }
    if (v < used) { pesan('avE', 'Sudah dipakai ' + used + ' pada malam ini. Tersedia minimal ' + used + '.', false); tandai($('#avIn'), true); return; }
    d2.avail[x.id + '|' + tg] = v; T.save(d2); T.toast('Ketersediaan ' + T.tglPendek(tg) + ' menjadi ' + v + '.'); HS.kal.gambar(); editorMalam();
  }
  $('#avSimpan').addEventListener('click', function () { set(num($('#avIn').value)); });
  $('#avTutup').addEventListener('click', function () { set(0); });
  $('#avDef').addEventListener('click', function () { var d2 = T.db(); delete d2.avail[x.id + '|' + tg]; T.save(d2); T.toast('Dikembalikan ke bawaan.'); HS.kal.gambar(); editorMalam(); });
}

/* ---------- pertanyaan ---------- */
V.pesan = function () {
  var d = T.db(), semua = d.pesan.slice().sort(function (a, b) { return a.dibuat < b.dibuat ? 1 : -1; });
  var list = semua.filter(function (p) { return PF.st === 'semua' || (PF.st === 'baru' ? !p.dibaca : p.dibaca); });
  var h = '<div class="a-kp"><div><h1>Pertanyaan masuk</h1><p>Dari formulir di halaman Info. Balas lewat WhatsApp atau email, lalu tandai sudah dibaca.</p></div><button class="a-btn out" id="csvP" type="button">Ekspor CSV</button></div>';
  h += '<div class="a-chips" role="group" aria-label="Filter"><button type="button" data-f="semua" aria-pressed="' + (PF.st === 'semua') + '">Semua <small>' + semua.length + '</small></button><button type="button" data-f="baru" aria-pressed="' + (PF.st === 'baru') + '">Belum dibaca <small>' + semua.filter(function (p) { return !p.dibaca; }).length + '</small></button><button type="button" data-f="dibaca" aria-pressed="' + (PF.st === 'dibaca') + '">Sudah dibaca <small>' + semua.filter(function (p) { return p.dibaca; }).length + '</small></button></div>';
  if (!list.length) h += '<div class="kosong">Tidak ada pertanyaan di sini.</div>';
  list.forEach(function (p) {
    var tel = T.normTelp(p.kontak), wa = T.telpOk(tel);
    h += '<article class="a-card" style="margin-bottom:10px"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px"><b>' + esc(p.nama) + '</b><span>' + (p.dibaca ? '' : '<span class="a-bdg baru">Baru</span> ') + '<span class="m xs">T-' + T.pad(p.id) + ' - ' + esc(p.topik) + ' - ' + esc(T.waktu(p.dibuat)) + '</span></span></div>' +
      '<p style="margin:8px 0">' + esc(p.isi) + '</p><p class="m xs">Kontak: ' + esc(p.kontak) + '</p><div class="a-act">' +
      '<a class="a-btn sm" target="_blank" rel="noopener" href="' + (wa ? 'https://wa.me/62' + esc(tel.slice(1)) + '?text=' + encodeURIComponent('Halo ' + p.nama + ', terima kasih sudah bertanya ke Desa Tirta Asri.') : 'mailto:' + encodeURIComponent(p.kontak) + '?subject=' + encodeURIComponent('Pertanyaan Anda ke Desa Tirta Asri')) + '">Balas lewat ' + (wa ? 'WhatsApp' : 'email') + '</a>' +
      '<button class="a-btn out sm" type="button" data-baca="' + p.id + '">' + (p.dibaca ? 'Tandai belum dibaca' : 'Tandai sudah dibaca') + '</button>' +
      '<button class="a-btn out sm" type="button" data-hapus="' + p.id + '">Hapus</button></div></article>';
  });
  main.innerHTML = h;
  $('.a-chips', main).addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; PF.st = b.dataset.f; V.pesan(); });
  $('#csvP').addEventListener('click', function () { unduh('pertanyaan-tirta-asri.csv', csvPesan()); T.toast('CSV pertanyaan diunduh.'); });
  main.addEventListener('click', klikPesan);
};
function klikPesan(e) {
  if (!$('#csvP')) { main.removeEventListener('click', klikPesan); return; }
  var b = e.target.closest('[data-baca],[data-hapus]'); if (!b) return;
  var d = T.db();
  if (b.dataset.baca) {
    var p = d.pesan.filter(function (x) { return String(x.id) === b.dataset.baca; })[0]; p.dibaca = !p.dibaca; T.save(d); ulang(); return;
  }
  if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'Tekan lagi untuk menghapus'; b.classList.add('des'); setTimeout(function () { if (document.contains(b)) { b.dataset.armed = ''; b.textContent = 'Hapus'; b.classList.remove('des'); } }, 4000); return; }
  d.pesan = d.pesan.filter(function (x) { return String(x.id) !== b.dataset.hapus; }); T.save(d); T.toast('Pertanyaan dihapus.'); ulang();
}

/* ---------- data ---------- */
V.data = function () {
  var d = T.db();
  var h = '<div class="a-kp"><div><h1>Data demo</h1><p>Semua data tersimpan di localStorage peramban ini dan dipakai bersama oleh situs publik dan admin.</p></div></div>';
  h += '<div class="a-g2"><div class="a-card"><h2>Ekspor</h2><p class="m">Unduh data sebagai CSV (bisa dibuka di Excel atau Google Sheets).</p><div class="a-act"><button class="a-btn" type="button" id="csvB1">Ekspor semua booking (' + d.booking.length + ')</button><button class="a-btn out" type="button" id="csvP1">Ekspor pertanyaan (' + d.pesan.length + ')</button></div></div>' +
    '<div class="a-card"><h2>Reset data demo</h2><p class="m">Mengembalikan semua booking, paket, penginapan, kuota, dan pertanyaan ke data awal, serta mengosongkan keranjang di peramban ini.</p><div class="a-act"><button class="a-btn des" type="button" id="resetBtn">Reset data demo</button></div><p id="resetInfo" class="a-ok" role="status" hidden></p></div></div>';
  h += '<div class="a-card" style="margin-top:14px"><h2>Isi data</h2><ul class="a-list"><li><span>Booking</span><b>' + d.booking.length + '</b></li><li><span>Paket dan kelas</span><b>' + d.paket.length + '</b></li><li><span>Penginapan</span><b>' + d.homestay.length + '</b></li><li><span>Tanggal dengan kuota diubah manual</span><b>' + (Object.keys(d.kuota).length + Object.keys(d.avail).length) + '</b></li><li><span>Pertanyaan</span><b>' + d.pesan.length + '</b></li></ul></div>';
  main.innerHTML = h;
  $('#csvB1').addEventListener('click', function () { unduh('booking-tirta-asri.csv', csvBooking(T.db().booking)); T.toast('CSV booking diunduh.'); });
  $('#csvP1').addEventListener('click', function () { unduh('pertanyaan-tirta-asri.csv', csvPesan()); T.toast('CSV pertanyaan diunduh.'); });
  var rb = $('#resetBtn'), armed = false;
  rb.addEventListener('click', function () {
    if (!armed) { armed = true; rb.textContent = 'Tekan lagi untuk reset'; clearTimeout(resetTimer); resetTimer = setTimeout(function () { armed = false; rb.textContent = 'Reset data demo'; }, 4000); return; }
    clearTimeout(resetTimer); T.resetData(); B = { q: '', st: 'semua', urut: 'baru', hal: 1, buka: null }; PS.tgl = ''; HS.tgl = '';
    T.toast('Data demo dikembalikan ke awal.'); ulang();
    var ri = $('#resetInfo'); if (ri) { ri.textContent = 'Data demo sudah dikembalikan ke awal.'; ri.hidden = false; }
  });
};

window.TAAdmin = { csvBooking: csvBooking, csvPesan: csvPesan, rute: rute };
if (masuk()) mulai(); else $('#pin').focus();
})();
