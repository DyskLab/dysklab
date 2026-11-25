/* Desa Wisata Tirta Asri: data bersama (localStorage) untuk situs publik dan admin.html.
   Semua data demo, tanpa server. Kunci: tirta.v1 (data), tirta.cart.v1 (keranjang). */
(function () {
'use strict';

var KEY = 'tirta.v1', CART = 'tirta.cart.v1';
var HORIZON = 150;            // hari ke depan yang bisa dipesan
var MAKS_MALAM = 14;
var NOMOR_WA = '6281200007319';
var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
var STATUS = { menunggu: 'Menunggu bayar', lunas: 'Lunas', checkin: 'Check-in', selesai: 'Selesai', batal: 'Batal' };

/* ---------- util ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function rp(n) { return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function today() { return iso(new Date()); }
function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
function selisih(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
function dow(s) { return parse(s).getDay(); }
function tglPanjang(s) { var d = parse(s); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); }
function tglPendek(s) { var d = parse(s); return HARI[d.getDay()].slice(0, 3) + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
function waktu(isoStr) { var d = new Date(isoStr); if (isNaN(d)) return ''; return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + '.' + pad(d.getMinutes()); }
function uid() { return 'x' + Math.random().toString(36).slice(2, 9); }
function clamp(v, a, b) { v = Math.floor(Number(v)); if (isNaN(v)) v = a; return Math.max(a, Math.min(b, v)); }
function normTelp(s) {
  s = String(s || '').replace(/[^\d+]/g, '');
  if (s.indexOf('+62') === 0) s = '0' + s.slice(3); else if (s.indexOf('62') === 0) s = '0' + s.slice(2);
  return s;
}
function telpOk(s) { return /^08\d{8,11}$/.test(s); }
function emailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }
function telpTampil(t) { return t.length > 8 ? t.slice(0, 4) + '-' + t.slice(4, 8) + '-' + t.slice(8) : t; }

var tTimer;
function toast(msg) {
  var t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('tampil');
  clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('tampil'); }, 3200);
}

/* ---------- penyimpanan ---------- */
var mem = null;
function baca(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function tulis(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function db() {
  var d = baca(KEY);
  if (d && d.v === 1) return d;
  if (mem) return mem;
  d = seed(); save(d); return d;
}
function save(d) { mem = d; if (!tulis(KEY, d)) toast('Penyimpanan peramban diblokir. Data hanya bertahan selama halaman terbuka.'); }
function cart() { var c = baca(CART); return Array.isArray(c) ? c : []; }
function saveCart(c) { tulis(CART, c); badge(); }
function badge() {
  var n = cart().length;
  $$('[data-kbadge]').forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
}
function resetData() {
  mem = null;
  try { localStorage.removeItem(KEY); localStorage.removeItem(CART); } catch (e) {}
  var d = seed(); save(d); badge(); return d;
}

/* ---------- data awal (deterministik, tanggal relatif hari ini) ---------- */
function seed() {
  var t = today();
  function D(n) { return addDays(t, n); }
  function nextDow(min, days) { for (var n = min; n < min + 14; n++) if (days.indexOf(dow(D(n))) >= 0) return D(n); return D(min); }
  var semua = [0, 1, 2, 3, 4, 5, 6];
  var d = {
    v: 1,
    paket: [
      { id: 'santai', nama: 'Jalan-jalan santai', ket: 'Pemandu keliling desa dan sawah, teh dan camilan.', durasi: 'Sekitar 2 jam', harga: 50000, anak: 25000, kuota: 40, hari: semua, lead: 1, aktif: true },
      { id: 'setengah', nama: 'Setengah hari', ket: 'Menanam padi, keliling desa, dan makan siang.', durasi: 'Sekitar 5 jam', harga: 150000, anak: 100000, kuota: 30, hari: semua, lead: 3, aktif: true },
      { id: 'sehari', nama: 'Sehari penuh', ket: 'Semua kegiatan di atas, satu kelas pilihan, dan menonton latihan tari.', durasi: 'Sekitar 9 jam', harga: 275000, anak: 175000, kuota: 30, hari: semua, lead: 3, aktif: true },
      { id: 'duahari', nama: 'Dua hari satu malam', ket: 'Paket sehari penuh, menginap di rumah warga, dan sarapan.', durasi: 'Menginap 1 malam', harga: 525000, anak: 350000, kuota: 20, hari: semua, lead: 3, aktif: true },
      { id: 'membatik', nama: 'Kelas membatik', ket: 'Belajar memakai canting bersama Sanggar Kencana. Kain boleh dibawa pulang.', durasi: '3 jam, mulai 09.00', harga: 120000, anak: 90000, kuota: 12, hari: [1, 3, 6], lead: 3, aktif: true },
      { id: 'menganyam', nama: 'Kelas menganyam bambu', ket: 'Membelah bilah bambu lalu menganyam satu tampah kecil.', durasi: '2 jam, mulai 09.00', harga: 75000, anak: 55000, kuota: 15, hari: [2, 4, 0], lead: 3, aktif: true },
      { id: 'memasak', nama: 'Kelas memasak jajanan', ket: 'Membuat serabi di tungku tanah liat bersama Bu Sari.', durasi: '90 menit, mulai 10.30', harga: 60000, anak: 40000, kuota: 10, hari: semua, lead: 3, aktif: true }
    ],
    tambahan: [
      { id: 'sepeda', nama: 'Bersepeda keliling subak', ket: 'Rute 9 km, sepeda dan helm disediakan.', harga: 65000, per: 'orang' },
      { id: 'sunrise', nama: 'Melihat matahari terbit', ket: 'Jalan ke bukit timur pukul 05.15, lalu sarapan.', harga: 45000, per: 'orang' },
      { id: 'menari', nama: 'Belajar menari', ket: 'Satu jam bersama guru sanggar.', harga: 50000, per: 'orang' },
      { id: 'pemandu', nama: 'Pemandu tambahan', ket: 'Per 3 jam, untuk 10 orang. Harga tetap.', harga: 100000, per: 'tetap' }
    ],
    homestay: [
      { id: 'made', nama: 'Rumah Pak Made', ket: '2 kamar, kamar mandi dalam, teras menghadap sawah.', satuan: 'kamar', kamar: 2, tamuKamar: 2, harga: 250000, sarapan: 25000, aktif: true },
      { id: 'ketut', nama: 'Rumah Bu Ketut', ket: '3 kamar, cocok untuk keluarga, sarapan sudah termasuk.', satuan: 'kamar', kamar: 3, tamuKamar: 2, harga: 325000, sarapan: 0, aktif: true },
      { id: 'pondok', nama: 'Pondok Tepi Sawah', ket: '1 kamar untuk berdua, kipas angin, kamar mandi semi terbuka.', satuan: 'kamar', kamar: 1, tamuKamar: 2, harga: 200000, sarapan: 25000, aktif: true },
      { id: 'sanggar', nama: 'Rumah Rombongan Sanggar', ket: 'Ruang besar dengan kasur lantai untuk 12 orang.', satuan: 'orang', kamar: 12, tamuKamar: 1, harga: 80000, sarapan: 20000, aktif: true }
    ],
    kuota: {}, avail: {}, booking: [], pesan: [], seq: 3
  };
  function pItem(pid, tgl, dew, anak, tamb) {
    return buatItemPaket(d, { tipe: 'paket', ref: pid, tgl: tgl, dew: dew, anak: anak, tamb: tamb || [] });
  }
  function iItem(hid, masuk, malam, unit, tamu, sar) {
    return buatItemInap(d, { tipe: 'inap', ref: hid, masuk: masuk, keluar: addDays(masuk, malam), unit: unit, tamu: tamu, sarapan: !!sar });
  }
  function bk(kode, nama, telp, email, status, umur, items, catatan) {
    var total = items.reduce(function (a, i) { return a + i.total; }, 0);
    var t0 = new Date(Date.now() - umur * 86400000);
    var rw = [{ t: t0.toISOString(), teks: 'Booking dibuat' }];
    var urut = ['menunggu', 'lunas', 'checkin', 'selesai'];
    var teks = { lunas: 'Pembayaran diterima', checkin: 'Tamu check-in', selesai: 'Kunjungan selesai' };
    var i = urut.indexOf(status);
    for (var k = 1; k <= i; k++) rw.push({ t: new Date(t0.getTime() + k * 3600000 * 5).toISOString(), teks: teks[urut[k]] });
    if (status === 'batal') rw.push({ t: new Date(t0.getTime() + 3600000 * 8).toISOString(), teks: 'Booking dibatalkan' });
    d.booking.push({ kode: kode, nama: nama, telp: telp, email: email, catatan: catatan || '', status: status, dibuat: t0.toISOString(), items: items, total: total, riwayat: rw });
  }
  var mb = nextDow(4, [6]);
  bk('TA-DEMO01', 'Rani Wulandari', '081200000001', 'rani@contoh.test', 'menunggu', 0.3, [pItem('sehari', D(5), 2, 2, ['sepeda'])], 'Ada anak 6 dan 8 tahun.');
  bk('TA-DEMO02', 'Bowo Santoso', '081200000002', '', 'lunas', 2, [pItem('membatik', mb, 7, 0, [])]);
  bk('TA-DEMO03', 'Sanggar Cinta Kain', '081200000003', 'sanggar@contoh.test', 'lunas', 3, [pItem('membatik', mb, 5, 0, [])], 'Rombongan komunitas.');
  bk('TA-DEMO04', 'Citra Lestari', '081200000004', 'citra@contoh.test', 'lunas', 4, [iItem('pondok', D(6), 3, 1, 2, true)]);
  bk('TA-DEMO05', 'Made Arta', '081200000005', '', 'checkin', 2, [iItem('made', D(-1), 3, 1, 3, false), pItem('santai', D(0), 2, 1, [])]);
  bk('TA-DEMO06', 'Lestari Dewi', '081200000006', '', 'selesai', 14, [pItem('setengah', D(-10), 4, 0, [])]);
  bk('TA-DEMO07', 'Agus Pranata', '081200000007', '', 'batal', 6, [pItem('sehari', D(12), 3, 0, [])]);
  bk('TA-DEMO08', 'Wayan Sukma', '081200000008', 'wayan@contoh.test', 'menunggu', 1, [iItem('ketut', D(10), 2, 2, 4, false)]);
  bk('TA-DEMO09', 'SMP Contoh 1', '081200000009', 'smp@contoh.test', 'lunas', 5, [iItem('sanggar', D(14), 2, 10, 10, true), pItem('memasak', D(15), 10, 0, [])], 'Studi lapangan kelas 8.');
  bk('TA-DEMO10', 'Putu Ayu', '081200000010', '', 'selesai', 25, [pItem('menganyam', addDays(nextDow(-20, [2]), 0), 3, 1, ['menari'])]);
  d.pesan = [
    { id: 1, nama: 'Dian Pertiwi', kontak: '081200000021', topik: 'Rombongan', isi: 'Kami 40 orang dari sekolah dasar. Apakah bisa dua pemandu sekaligus dan makan siang disiapkan?', dibuat: new Date(Date.now() - 86400000 * 1.2).toISOString(), dibaca: false },
    { id: 2, nama: 'Hendra', kontak: 'hendra@contoh.test', topik: 'Menginap', isi: 'Apakah Pondok Tepi Sawah bisa ditambah satu kasur untuk anak umur 4 tahun?', dibuat: new Date(Date.now() - 86400000 * 3).toISOString(), dibaca: true },
    { id: 3, nama: 'Sari', kontak: '081200000023', topik: 'Umum', isi: 'Apakah ada tempat sholat dan kursi roda untuk orang tua?', dibuat: new Date(Date.now() - 3600000 * 5).toISOString(), dibaca: false }
  ];
  return d;
}

/* ---------- ketersediaan ---------- */
function semuaItem(d, tipe) {
  var out = [];
  d.booking.forEach(function (b) { if (b.status !== 'batal') b.items.forEach(function (i) { if (i.tipe === tipe) out.push(i); }); });
  return out;
}
function kapPaket(d, p, tgl) {
  var o = d.kuota[p.id + '|' + tgl];
  if (o != null) return o;
  return p.hari.indexOf(dow(tgl)) >= 0 ? p.kuota : 0;
}
function terpakaiPaket(d, pid, tgl, extra) {
  var n = 0;
  semuaItem(d, 'paket').concat(extra || []).forEach(function (i) { if (i.tipe === 'paket' && i.ref === pid && i.tgl === tgl) n += i.dew + i.anak; });
  return n;
}
function statusPaket(d, p, tgl, extra) {
  var t = today();
  if (tgl < addDays(t, p.lead)) return { ok: false, why: 'lewat', kap: 0, sisa: 0 };
  if (tgl > addDays(t, HORIZON)) return { ok: false, why: 'jauh', kap: 0, sisa: 0 };
  var kap = kapPaket(d, p, tgl);
  if (kap <= 0) return { ok: false, why: 'tutup', kap: 0, sisa: 0 };
  var sisa = kap - terpakaiPaket(d, p.id, tgl, extra);
  if (sisa <= 0) return { ok: false, why: 'penuh', kap: kap, sisa: 0 };
  return { ok: true, kap: kap, sisa: sisa };
}
function kapMalam(d, h, tgl) {
  var o = d.avail[h.id + '|' + tgl];
  return o != null ? Math.min(o, h.kamar) : h.kamar;
}
function terpakaiMalam(d, hid, tgl, extra) {
  var n = 0;
  semuaItem(d, 'inap').concat(extra || []).forEach(function (i) { if (i.tipe === 'inap' && i.ref === hid && i.masuk <= tgl && tgl < i.keluar) n += i.unit; });
  return n;
}
function sisaMalam(d, h, tgl, extra) { return Math.max(0, kapMalam(d, h, tgl) - terpakaiMalam(d, h.id, tgl, extra)); }
function cari(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }

/* ---------- harga ---------- */
function hitungPaket(d, p, dew, anak, tamb) {
  var peserta = dew + anak, sub = dew * p.harga + anak * p.anak;
  var diskon = peserta > 15 ? Math.round(sub * 0.1) : 0;
  var rinci = [];
  rinci.push([dew + ' dewasa x ' + rp(p.harga), dew * p.harga]);
  if (anak) rinci.push([anak + ' anak x ' + rp(p.anak), anak * p.anak]);
  if (diskon) rinci.push(['Potongan rombongan 10%', -diskon]);
  var t = 0;
  (tamb || []).forEach(function (id) {
    var a = cari(d.tambahan, id); if (!a) return;
    var v = a.per === 'orang' ? a.harga * peserta : a.harga;
    t += v;
    rinci.push([a.nama + (a.per === 'orang' ? ' x ' + peserta : ''), v]);
  });
  return { peserta: peserta, diskon: diskon, total: sub - diskon + t, rinci: rinci };
}
function unitDari(h, line) { return h.satuan === 'orang' ? line.tamu : line.unit; }
function hitungInap(h, unit, tamu, malam, sarapan) {
  var rinci = [], total = 0;
  if (h.satuan === 'orang') rinci.push([unit + ' tamu x ' + malam + ' malam x ' + rp(h.harga), unit * malam * h.harga]);
  else rinci.push([unit + ' kamar x ' + malam + ' malam x ' + rp(h.harga), unit * malam * h.harga]);
  total = unit * malam * h.harga;
  if (sarapan && h.sarapan > 0) { var s = h.sarapan * tamu * malam; rinci.push(['Sarapan ' + tamu + ' tamu x ' + malam + ' malam', s]); total += s; }
  return { total: total, rinci: rinci };
}
function buatItemPaket(d, l) {
  var p = cari(d.paket, l.ref), h = hitungPaket(d, p, l.dew, l.anak, l.tamb);
  return {
    tipe: 'paket', ref: p.id, judul: p.nama, tgl: l.tgl, dew: l.dew, anak: l.anak, peserta: h.peserta,
    sub: tglPanjang(l.tgl) + ' - ' + l.dew + ' dewasa' + (l.anak ? ', ' + l.anak + ' anak' : ''),
    tamb: (l.tamb || []).map(function (id) { var a = cari(d.tambahan, id); return a ? a.nama : id; }),
    rinci: h.rinci, total: h.total
  };
}
function buatItemInap(d, l) {
  var h = cari(d.homestay, l.ref), malam = selisih(l.masuk, l.keluar);
  var unit = h.satuan === 'orang' ? l.tamu : l.unit;
  var r = hitungInap(h, unit, l.tamu, malam, l.sarapan);
  return {
    tipe: 'inap', ref: h.id, judul: h.nama, masuk: l.masuk, keluar: l.keluar, malam: malam, unit: unit, tamu: l.tamu, sarapan: !!(l.sarapan && h.sarapan > 0),
    sub: 'Masuk ' + tglPendek(l.masuk) + ', keluar ' + tglPendek(l.keluar) + ' - ' + malam + ' malam, ' + (h.satuan === 'orang' ? l.tamu + ' tamu' : unit + ' kamar, ' + l.tamu + ' tamu'),
    tamb: [], rinci: r.rinci, total: r.total
  };
}
/* Validasi satu baris keranjang terhadap data dan item lain yang sudah diterima. */
function cekLine(d, l, extra) {
  var t = today(), i;
  if (l.tipe === 'paket') {
    var p = cari(d.paket, l.ref);
    if (!p || !p.aktif) return 'Paket "' + (p ? p.nama : l.ref) + '" tidak tersedia lagi.';
    if (!l.tgl) return 'Pilih tanggal kunjungan dulu.';
    if (l.dew < 1) return 'Minimal satu orang dewasa.';
    if (l.dew + l.anak > 60) return 'Maksimal 60 orang per pemesanan.';
    var s = statusPaket(d, p, l.tgl, extra);
    if (!s.ok) return 'Tanggal ' + tglPendek(l.tgl) + ' untuk ' + p.nama + ' ' + ({ penuh: 'sudah penuh', tutup: 'tutup', lewat: 'terlalu dekat (pesan minimal ' + p.lead + ' hari sebelumnya)', jauh: 'terlalu jauh' }[s.why]) + '.';
    if (l.dew + l.anak > s.sisa) return 'Sisa tempat di ' + tglPendek(l.tgl) + ' hanya ' + s.sisa + ' orang.';
    return '';
  }
  var h = cari(d.homestay, l.ref);
  if (!h || !h.aktif) return 'Penginapan "' + (h ? h.nama : l.ref) + '" tidak tersedia lagi.';
  if (!l.masuk || !l.keluar) return 'Pilih tanggal masuk dan keluar.';
  var malam = selisih(l.masuk, l.keluar);
  if (malam < 1) return 'Tanggal keluar harus setelah tanggal masuk.';
  if (malam > MAKS_MALAM) return 'Maksimal ' + MAKS_MALAM + ' malam per pemesanan.';
  if (l.masuk < addDays(t, 3)) return 'Pesan penginapan minimal 3 hari sebelum masuk.';
  if (l.masuk > addDays(t, HORIZON)) return 'Tanggal masuk terlalu jauh.';
  var unit = h.satuan === 'orang' ? l.tamu : l.unit;
  if (unit < 1 || l.tamu < 1) return 'Isi jumlah ' + (h.satuan === 'orang' ? 'tamu' : 'kamar dan tamu') + '.';
  if (h.satuan !== 'orang' && l.tamu > unit * h.tamuKamar) return 'Satu kamar maksimal ' + h.tamuKamar + ' tamu.';
  for (i = 0; i < malam; i++) {
    var tg = addDays(l.masuk, i);
    if (sisaMalam(d, h, tg, extra) < unit) return 'Malam ' + tglPendek(tg) + ' tidak cukup (sisa ' + sisaMalam(d, h, tg, extra) + (h.satuan === 'orang' ? ' tempat' : ' kamar') + ').';
  }
  return '';
}
function kodeBaru(d) {
  var abj = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', k;
  do { k = 'TA-'; for (var i = 0; i < 6; i++) k += abj[Math.floor(Math.random() * abj.length)]; } while (d.booking.some(function (b) { return b.kode === k; }));
  return k;
}
/* Membuat booking dari keranjang. Mengembalikan {err} atau {ok, kode}. */
function buatBooking(f) {
  var err = {};
  var nama = String(f.nama || '').trim(), telp = normTelp(f.telp), email = String(f.email || '').trim();
  if (nama.length < 3) err.nama = 'Tulis nama lengkap, minimal 3 huruf.';
  if (!telpOk(telp)) err.telp = 'Nomor telepon tidak valid. Contoh: 0812-0000-1234.';
  if (email && !emailOk(email)) err.email = 'Format email belum benar.';
  if (!f.setuju) err.setuju = 'Centang persetujuan aturan pembatalan.';
  var c = cart();
  if (!c.length) err.keranjang = 'Keranjang masih kosong.';
  if (Object.keys(err).length) return { err: err };
  var d = db(), items = [];
  for (var i = 0; i < c.length; i++) {
    var m = cekLine(d, c[i], items);
    if (m) return { err: { keranjang: m } };
    items.push(c[i].tipe === 'paket' ? buatItemPaket(d, c[i]) : buatItemInap(d, c[i]));
  }
  var total = items.reduce(function (a, x) { return a + x.total; }, 0);
  var now = new Date().toISOString();
  var b = { kode: kodeBaru(d), nama: nama, telp: telp, email: email, catatan: String(f.catatan || '').trim().slice(0, 300), status: 'menunggu', dibuat: now, items: items, total: total, riwayat: [{ t: now, teks: 'Booking dibuat' }] };
  d.booking.push(b); save(d); saveCart([]);
  return { ok: true, kode: b.kode, booking: b };
}
function cariBooking(kode, telp) {
  kode = String(kode || '').trim().toUpperCase(); telp = normTelp(telp);
  var d = db();
  for (var i = 0; i < d.booking.length; i++) if (d.booking[i].kode === kode && d.booking[i].telp === telp) return d.booking[i];
  return null;
}
function ubahStatus(kode, st, oleh) {
  var d = db(), b = cari2(d.booking, kode);
  if (!b || !STATUS[st]) return 'Booking tidak ditemukan.';
  if (b.status === 'batal' || b.status === 'selesai') return 'Booking ' + STATUS[b.status].toLowerCase() + ' tidak bisa diubah lagi.';
  if (b.status === st) return 'Status sudah ' + STATUS[st].toLowerCase() + '.';
  var teks = { menunggu: 'Status dikembalikan ke menunggu bayar', lunas: 'Pembayaran diterima', checkin: 'Tamu check-in', selesai: 'Kunjungan selesai', batal: 'Booking dibatalkan' + (oleh ? ' oleh ' + oleh : '') };
  b.status = st; b.riwayat.push({ t: new Date().toISOString(), teks: teks[st] });
  save(d); return '';
}
function cari2(arr, kode) { for (var i = 0; i < arr.length; i++) if (arr[i].kode === kode) return arr[i]; return null; }
function batalkan(kode, telp) {
  var b = cariBooking(kode, telp);
  if (!b) return 'Booking tidak ditemukan.';
  if (b.status !== 'menunggu' && b.status !== 'lunas') return 'Booking dengan status ' + STATUS[b.status].toLowerCase() + ' tidak bisa dibatalkan di sini.';
  return ubahStatus(b.kode, 'batal', 'pemesan');
}
function tglTerdekat(b) {
  var m = null;
  b.items.forEach(function (i) { var t = i.tipe === 'paket' ? i.tgl : i.masuk; if (m === null || t < m) m = t; });
  return m;
}
function refundTeks(b) {
  var m = tglTerdekat(b);
  if (b.status === 'menunggu') return 'Belum ada pembayaran, tidak ada biaya pembatalan.';
  return selisih(today(), m) > 3 ? 'Dibatalkan lebih dari 3 hari sebelum datang: uang muka kembali penuh.' : 'Dibatalkan kurang dari 3 hari sebelum datang: 50% uang muka dipakai untuk biaya persiapan warga.';
}

/* ---------- tampilan bersama: bukti, instruksi bayar, WhatsApp ---------- */
function waLink(b) {
  var t = 'Halo pengelola Desa Tirta Asri, saya ' + b.nama + ' ingin konfirmasi booking ' + b.kode + '.\n';
  b.items.forEach(function (i) { t += '- ' + i.judul + ': ' + i.sub + '\n'; });
  t += 'Total ' + rp(b.total) + '. Mohon dicek ya.';
  return 'https://wa.me/' + NOMOR_WA + '?text=' + encodeURIComponent(t);
}
function buktiHTML(b) {
  var h = '<article class="bukti" id="bukti" aria-label="Bukti booking ' + esc(b.kode) + '">' +
    '<h2>Bukti booking</h2><p class="kode">' + esc(b.kode) + '</p>' +
    '<p class="meta"><span>Status <span class="st ' + b.status + '">' + STATUS[b.status] + '</span></span><span>Dibuat ' + esc(waktu(b.dibuat)) + '</span></p>' +
    '<p class="meta"><span>Pemesan: <b>' + esc(b.nama) + '</b></span><span>' + esc(telpTampil(b.telp)) + '</span>' + (b.email ? '<span>' + esc(b.email) + '</span>' : '') + '</p><ul>';
  b.items.forEach(function (i) {
    h += '<li><b>' + esc(i.judul) + '</b><span>' + esc(i.sub) + '</span>' +
      (i.tamb && i.tamb.length ? '<span>Tambahan: ' + esc(i.tamb.join(', ')) + '</span>' : '') +
      '<span class="hg">' + rp(i.total) + '</span></li>';
  });
  h += '</ul><p class="tot"><span>Total</span><span>' + rp(b.total) + '</span></p>';
  if (b.catatan) h += '<p class="kecil-teks">Catatan: ' + esc(b.catatan) + '</p>';
  h += '<p class="kecil-teks">Tunjukkan bukti ini di balai wisata Desa Tirta Asri, Jl. Subak Asri No. 8. Ini bukti contoh untuk demo, bukan dokumen resmi.</p></article>';
  return h;
}
function bayarHTML(b) {
  var dp = Math.round(b.total * 0.3), batas = new Date(new Date(b.dibuat).getTime() + 86400000);
  return '<div class="kartu-i no-cetak"><h3>Cara bayar (contoh)</h3><ol>' +
    '<li>Transfer ke <strong>Bank Contoh 000-000-0000</strong> a.n. Pengelola Desa Tirta Asri. Rekening ini fiktif.</li>' +
    '<li>Bayar uang muka 30% (<strong>' + rp(dp) + '</strong>) atau lunas (<strong>' + rp(b.total) + '</strong>). Tulis kode <strong>' + esc(b.kode) + '</strong> di berita transfer.</li>' +
    '<li>Kirim bukti transfer lewat WhatsApp dengan tombol di bawah.</li>' +
    '<li>Setelah dicek, pengelola mengubah status menjadi Lunas. Anda bisa melihatnya di halaman Cek booking.</li></ol>' +
    '<p>Batas bayar: <strong>' + esc(waktu(batas.toISOString())) + '</strong>. Di demo ini pembatalan otomatis tidak dijalankan; pengelola membatalkannya manual dari admin.</p></div>';
}

/* ---------- kalender ---------- */
function Kalender(el, o) {
  var awal = parse(o.awal || today()), y = awal.getFullYear(), m = awal.getMonth();
  var nowD = parse(today());
  function idx(yy, mm) { return yy * 12 + mm; }
  function batas() {
    var lo = idx(nowD.getFullYear(), nowD.getMonth()) - (o.admin ? 2 : 0);
    var hi = idx(nowD.getFullYear(), nowD.getMonth()) + (o.admin ? 12 : Math.floor(HORIZON / 30));
    return [lo, hi];
  }
  function gambar() {
    var first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    var bt = batas(), cur = idx(y, m), sel = o.sel ? o.sel() : {}, tdy = today();
    var h = '<div class="kal-h"><button type="button" data-n="-1" aria-label="Bulan sebelumnya"' + (cur <= bt[0] ? ' disabled' : '') + '>‹</button><b aria-live="polite">' + BULAN[m] + ' ' + y + '</b><button type="button" data-n="1" aria-label="Bulan berikutnya"' + (cur >= bt[1] ? ' disabled' : '') + '>›</button></div><div class="kal-g">';
    ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].forEach(function (x) { h += '<span aria-hidden="true">' + x + '</span>'; });
    for (var i = 0; i < off; i++) h += '<i></i>';
    for (var dd = 1; dd <= n; dd++) {
      var tg = y + '-' + pad(m + 1) + '-' + pad(dd), inf = o.info(tg) || {}, c = [];
      if (inf.dis) {} else if (inf.k) c.push(inf.k);
      if (sel.a === tg || sel.b === tg) c.push('psl');
      else if (sel.a && sel.b && tg > sel.a && tg < sel.b) c.push('rtg');
      if (tg === tdy) c.push('hari-ini');
      h += '<button type="button" data-tgl="' + tg + '"' + (c.length ? ' class="' + c.join(' ') + '"' : '') + (inf.dis ? ' disabled' : '') +
        ' aria-label="' + esc(tglPanjang(tg) + (inf.label ? '. ' + inf.label : '')) + '"' + ((sel.a === tg || sel.b === tg) ? ' aria-pressed="true"' : '') + '>' + dd + (inf.sub ? '<small>' + esc(inf.sub) + '</small>' : '') + '</button>';
    }
    h += '</div>';
    if (!o.admin) h += '<div class="kal-l"><span>Tersedia</span><span class="s">Sisa sedikit</span><span class="p">Penuh atau tutup</span></div>';
    el.innerHTML = h;
  }
  el.classList.add('kal');
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.dataset.n) {
      var bt = batas(), nx = idx(y, m) + Number(b.dataset.n);
      if (nx < bt[0] || nx > bt[1]) return;
      y = Math.floor(nx / 12); m = nx % 12; gambar();
      var nb = $('[data-n="' + b.dataset.n + '"]', el); if (nb && !nb.disabled) nb.focus();
      return;
    }
    if (b.dataset.tgl && !b.disabled) o.pilih(b.dataset.tgl);
  });
  gambar();
  return { gambar: gambar, ke: function (t) { var p = parse(t); y = p.getFullYear(); m = p.getMonth(); gambar(); } };
}
function stepper(id, nilai, min, max) {
  return '<div class="stepper"><button type="button" data-st="' + id + '" data-d="-1" aria-label="Kurangi">−</button><input id="' + id + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + nilai + '"><button type="button" data-st="' + id + '" data-d="1" aria-label="Tambah">+</button></div>';
}
function pasangStepper(root, onChange) {
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-st]'); if (!b || !root.contains(b)) return;
    var inp = $('#' + b.dataset.st, root); if (!inp) return;
    inp.value = clamp(Number(inp.value) + Number(b.dataset.d), Number(inp.min), Number(inp.max));
    onChange(inp);
  });
  root.addEventListener('change', function (e) {
    var inp = e.target; if (inp.type !== 'number') return;
    inp.value = clamp(inp.value, Number(inp.min), Number(inp.max));
    onChange(inp);
  });
}
function setMaxStepper(id, root, max) { var i = $('#' + id, root); if (i) { i.max = max; if (Number(i.value) > max) i.value = max; } }

/* ---------- halaman ---------- */
var H = {};

H.index = function () {
  var tabs = $$('.jalur [role=tab]');
  function pilih(i, fokus) {
    tabs.forEach(function (t, k) {
      var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (fokus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pilih(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (k < 0) return; e.preventDefault(); pilih((k + tabs.length) % tabs.length, true);
    });
  });
};

H.aktivitas = function () {
  var root = $('#paketApp'); if (!root) return;
  var S = { pid: null, tgl: '', kal: null };
  var daftar = $('#pDaftar'), panel = $('#pPanel');
  function aktif() { return db().paket.filter(function (p) { return p.aktif; }); }
  function hariTeks(p) { return p.hari.length === 7 ? 'Setiap hari' : p.hari.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); }).map(function (x) { return HARI[x]; }).join(', '); }
  function gambarDaftar() {
    daftar.innerHTML = aktif().map(function (p) {
      return '<label><input type="radio" name="paket" value="' + esc(p.id) + '"' + (S.pid === p.id ? ' checked' : '') + '><span class="kt"><b>' + esc(p.nama) + '</b><span>' + esc(p.ket) + '</span><span>' + esc(p.durasi) + ' - ' + esc(hariTeks(p)) + '</span><span class="hg">' + rp(p.harga) + ' dewasa, ' + rp(p.anak) + ' anak</span></span></label>';
    }).join('');
  }
  function cur() { var d = db(); return { d: d, p: cari(d.paket, S.pid) }; }
  function val(id) { return Number($('#' + id, panel).value); }
  function tambDipilih() { return $$('input[name=tamb]:checked', panel).map(function (x) { return x.value; }); }
  function line() { return { tipe: 'paket', ref: S.pid, tgl: S.tgl, dew: val('nDew'), anak: val('nAnak'), tamb: tambDipilih() }; }
  function cartExtra() { return cart().map(function (l) { return l.tipe === 'paket' ? { tipe: 'paket', ref: l.ref, tgl: l.tgl, dew: l.dew, anak: l.anak } : { tipe: 'x' }; }); }
  function info(tgl) {
    var c = cur(), s = statusPaket(c.d, c.p, tgl, cartExtra()), butuh = val('nDew') + val('nAnak');
    if (!s.ok) return { dis: true, sub: s.why === 'penuh' ? 'Penuh' : s.why === 'tutup' ? 'Tutup' : '', label: ({ penuh: 'penuh', tutup: 'tutup', lewat: 'tidak bisa dipesan', jauh: 'terlalu jauh' })[s.why] };
    if (s.sisa < butuh) return { dis: true, sub: 'Sisa ' + s.sisa, label: 'sisa ' + s.sisa + ' tempat, kurang dari jumlah peserta' };
    return { dis: false, sub: String(s.sisa), k: s.sisa <= 5 ? 'sdikit' : 'ok', label: 'tersedia, sisa ' + s.sisa + ' tempat' };
  }
  function rinci() {
    var c = cur(), l = line(), h = hitungPaket(c.d, c.p, l.dew, l.anak, l.tamb);
    $('#pRinci', panel).innerHTML = h.rinci.map(function (r) { return '<li' + (r[1] < 0 ? ' class="min"' : '') + '><span>' + esc(r[0]) + '</span><span>' + (r[1] < 0 ? '− ' + rp(-r[1]) : rp(r[1])) + '</span></li>'; }).join('') +
      '<li class="jml"><span>Total</span><span>' + rp(h.total) + '</span></li>';
    $('#pTgl', panel).innerHTML = S.tgl ? 'Tanggal: <b>' + esc(tglPanjang(S.tgl)) + '</b>' : 'Belum memilih tanggal. Hari yang penuh atau tutup tidak bisa dipilih.';
  }
  function gambarPanel() {
    var c = cur(), p = c.p;
    if (!p) { panel.innerHTML = '<p>Pilih salah satu paket.</p>'; return; }
    panel.innerHTML = '<h3>' + esc(p.nama) + '</h3><p>' + esc(p.ket) + ' ' + esc(p.durasi) + '. Pesan minimal ' + p.lead + ' hari sebelumnya.</p>' +
      '<p class="jud">1. Pilih tanggal</p><div id="pKal"></div><div class="status-baris" id="pTgl" role="status"></div>' +
      '<p class="jud">2. Jumlah peserta</p><div class="dua"><div><label for="nDew">Dewasa<small>' + rp(p.harga) + ' per orang</small></label>' + stepper('nDew', 1, 1, 60) + '</div><div><label for="nAnak">Anak 5 sampai 12 tahun<small>' + rp(p.anak) + ' per anak</small></label>' + stepper('nAnak', 0, 0, 60) + '</div></div>' +
      '<p class="kecil-teks" style="font-size:.875rem;color:var(--redup);margin-top:8px">Anak di bawah 5 tahun gratis dan tidak perlu didaftarkan. Rombongan di atas 15 orang mendapat potongan 10%.</p>' +
      '<p class="jud">3. Tambahan (opsional)</p>' + c.d.tambahan.map(function (a) { return '<label class="cek"><input type="checkbox" name="tamb" value="' + esc(a.id) + '"><span>' + esc(a.nama) + ' - ' + rp(a.harga) + (a.per === 'orang' ? ' per orang' : ' tetap') + '<small>' + esc(a.ket) + '</small></span></label>'; }).join('') +
      '<ul class="rinci" id="pRinci"></ul><p class="err" id="pErr" role="alert"></p>' +
      '<div class="baris-tombol"><button class="tombol" type="button" id="pTambah">Masukkan ke keranjang</button><a class="tombol sek" href="kunjungan.html#keranjang">Lihat keranjang <span class="kbadge" data-kbadge hidden>0</span></a></div>';
    S.tgl = '';
    S.kal = Kalender($('#pKal', panel), { info: info, sel: function () { return { a: S.tgl }; }, pilih: function (t) { S.tgl = t; $('#pErr', panel).textContent = ''; S.kal.gambar(); rinci(); } });
    rinci(); badge();
  }
  pasangStepper(panel, function () {
    if (!S.kal) return;
    if (S.tgl) { var i = info(S.tgl); if (i.dis) { S.tgl = ''; toast('Tanggal terpilih tidak cukup untuk jumlah ini. Pilih tanggal lain.'); } }
    S.kal.gambar(); rinci();
  });
  function pilih(id, gulir) {
    S.pid = id; gambarDaftar(); gambarPanel();
    if (gulir) { var s = $('#paket'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  daftar.addEventListener('change', function (e) { if (e.target.name === 'paket') pilih(e.target.value); });
  panel.addEventListener('change', function (e) { if (e.target.name === 'tamb') rinci(); });
  panel.addEventListener('click', function (e) {
    if (e.target.id !== 'pTambah') return;
    var c = cur(), l = line(), err = $('#pErr', panel);
    var m = cekLine(c.d, l, cartExtra());
    if (m) { err.textContent = m; return; }
    err.textContent = '';
    var k = cart(); l.id = uid(); k.push(l); saveCart(k);
    toast('Ditambahkan ke keranjang: ' + c.p.nama);
    S.tgl = ''; S.kal.gambar(); rinci();
  });
  $$('[data-pilih]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); if (cari(db().paket, a.dataset.pilih)) pilih(a.dataset.pilih, true); }); });
  var a = aktif(), q = location.search.match(/[?&]p=([a-z0-9]+)/);
  pilih(q && cari(db().paket, q[1]) ? q[1] : (a[0] ? a[0].id : null));
};

H.menginap = function () {
  var root = $('#inapApp'); if (!root) return;
  var S = { hid: null, masuk: '', keluar: '', kal: null };
  var daftar = $('#iDaftar'), panel = $('#iPanel');
  function aktif() { return db().homestay.filter(function (h) { return h.aktif; }); }
  function cur() { var d = db(); return { d: d, h: cari(d.homestay, S.hid) }; }
  function val(id) { var e = $('#' + id, panel); return e ? Number(e.value) : 0; }
  function unitNow() { var c = cur(); return c.h.satuan === 'orang' ? val('nTamu') : val('nKamar'); }
  function cartExtra() { return cart().map(function (l) { var h = cari(db().homestay, l.ref); return l.tipe === 'inap' ? { tipe: 'inap', ref: l.ref, masuk: l.masuk, keluar: l.keluar, unit: h && h.satuan === 'orang' ? l.tamu : l.unit } : { tipe: 'x' }; }); }
  function gambarDaftar() {
    daftar.innerHTML = aktif().map(function (h) {
      return '<label><input type="radio" name="rumah" value="' + esc(h.id) + '"' + (S.hid === h.id ? ' checked' : '') + '><span class="kt"><b>' + esc(h.nama) + '</b><span>' + esc(h.ket) + '</span><span class="hg">' + rp(h.harga) + (h.satuan === 'orang' ? ' per orang per malam' : ' per kamar per malam') + '</span></span></label>';
    }).join('');
  }
  function blokOk(c, masuk, keluar, unit) {
    for (var t = masuk; t < keluar; t = addDays(t, 1)) if (sisaMalam(c.d, c.h, t, cartExtra()) < unit) return false;
    return true;
  }
  function info(tgl) {
    var c = cur(), unit = unitNow(), ex = cartExtra(), now = today();
    if (S.masuk && !S.keluar && tgl > S.masuk) {
      if (selisih(S.masuk, tgl) > MAKS_MALAM) return { dis: true, label: 'melebihi ' + MAKS_MALAM + ' malam' };
      return blokOk(c, S.masuk, tgl, unit) ? { dis: false, sub: selisih(S.masuk, tgl) + ' mlm', k: 'ok', label: 'keluar di sini, ' + selisih(S.masuk, tgl) + ' malam' } : { dis: true, label: 'ada malam yang penuh sebelum tanggal ini' };
    }
    if (tgl < addDays(now, 3)) return { dis: true, label: 'tidak bisa dipesan, minimal 3 hari sebelumnya' };
    if (tgl > addDays(now, HORIZON)) return { dis: true, label: 'terlalu jauh' };
    var s = sisaMalam(c.d, c.h, tgl, ex), kap = kapMalam(c.d, c.h, tgl);
    if (kap <= 0) return { dis: true, sub: 'Tutup', label: 'tutup' };
    if (s <= 0) return { dis: true, sub: 'Penuh', label: 'penuh' };
    if (s < unit) return { dis: true, sub: 'Sisa ' + s, label: 'sisa ' + s + ', kurang dari jumlah yang diminta' };
    return { dis: false, sub: String(s), k: s <= 1 ? 'sdikit' : 'ok', label: 'tersedia, sisa ' + s };
  }
  function rinci() {
    var c = cur(), h = c.h, st = $('#iTgl', panel), r = $('#iRinci', panel);
    var malam = S.masuk && S.keluar ? selisih(S.masuk, S.keluar) : 0;
    if (!S.masuk) st.innerHTML = 'Pilih tanggal <b>masuk</b> di kalender.';
    else if (!S.keluar) st.innerHTML = 'Masuk <b>' + esc(tglPanjang(S.masuk)) + '</b>. Sekarang pilih tanggal <b>keluar</b>, atau ketuk tanggal masuk lagi untuk membatalkan.';
    else {
      var ls = [], t; for (t = S.masuk; t < S.keluar; t = addDays(t, 1)) ls.push(t.slice(8) + '/' + t.slice(5, 7) + ': sisa ' + sisaMalam(c.d, h, t, cartExtra()));
      st.innerHTML = 'Masuk <b>' + esc(tglPanjang(S.masuk)) + '</b><br>Keluar <b>' + esc(tglPanjang(S.keluar)) + '</b> (' + malam + ' malam, tersedia)<br><small>Sisa per malam: ' + esc(ls.join(', ')) + '</small>';
    }
    if (malam) {
      var x = hitungInap(h, unitNow(), val('nTamu'), malam, $('#iSar', panel) && $('#iSar', panel).checked);
      r.innerHTML = x.rinci.map(function (q) { return '<li><span>' + esc(q[0]) + '</span><span>' + rp(q[1]) + '</span></li>'; }).join('') + '<li class="jml"><span>Total</span><span>' + rp(x.total) + '</span></li>';
    } else r.innerHTML = '<li><span>Pilih tanggal masuk dan keluar untuk melihat total.</span><span></span></li>';
  }
  function batasTamu() {
    var h = cur().h; if (h.satuan !== 'orang') setMaxStepper('nTamu', panel, val('nKamar') * h.tamuKamar);
  }
  function gambarPanel() {
    var c = cur(), h = c.h;
    if (!h) { panel.innerHTML = '<p>Pilih salah satu penginapan.</p>'; return; }
    var orang = h.satuan === 'orang';
    panel.innerHTML = '<h3>' + esc(h.nama) + '</h3><p>' + esc(h.ket) + ' Pesan minimal 3 hari sebelum masuk. Masuk mulai 14.00, keluar paling lambat 11.00.</p>' +
      '<p class="jud">1. Jumlah</p><div class="dua">' +
      (orang ? '' : '<div><label for="nKamar">Kamar<small>Maksimal ' + h.kamar + ' kamar</small></label>' + stepper('nKamar', 1, 1, h.kamar) + '</div>') +
      '<div><label for="nTamu">Tamu<small>' + (orang ? 'Maksimal ' + h.kamar + ' orang' : h.tamuKamar + ' tamu per kamar') + '</small></label>' + stepper('nTamu', orang ? 2 : Math.min(2, h.tamuKamar), 1, orang ? h.kamar : h.tamuKamar) + '</div></div>' +
      '<p class="jud">2. Pilih tanggal masuk dan keluar</p><div id="iKal"></div><div class="status-baris" id="iTgl" role="status"></div>' +
      (h.sarapan > 0 ? '<p class="jud">3. Tambahan (opsional)</p><label class="cek"><input type="checkbox" id="iSar"><span>Sarapan - ' + rp(h.sarapan) + ' per tamu per malam<small>Disajikan di teras pukul 07.00</small></span></label>' : '<p class="kecil-teks" style="font-size:.875rem;color:var(--redup);margin-top:10px">Sarapan sudah termasuk di harga.</p>') +
      '<ul class="rinci" id="iRinci"></ul><p class="err" id="iErr" role="alert"></p>' +
      '<div class="baris-tombol"><button class="tombol" type="button" id="iTambah">Masukkan ke keranjang</button><a class="tombol sek" href="kunjungan.html#keranjang">Lihat keranjang <span class="kbadge" data-kbadge hidden>0</span></a></div>';
    S.masuk = ''; S.keluar = '';
    S.kal = Kalender($('#iKal', panel), {
      info: info, sel: function () { return { a: S.masuk, b: S.keluar }; },
      pilih: function (t) {
        $('#iErr', panel).textContent = '';
        if (S.masuk && !S.keluar) {
          if (t === S.masuk) { S.masuk = ''; }
          else if (t > S.masuk) { S.keluar = t; }
          else { S.masuk = t; }
        } else { S.masuk = t; S.keluar = ''; }
        S.kal.gambar(); rinci();
      }
    });
    batasTamu(); rinci(); badge();
  }
  pasangStepper(panel, function () {
    if (!S.kal) return;
    batasTamu();
    if (S.masuk && S.keluar && !blokOk(cur(), S.masuk, S.keluar, unitNow())) { S.masuk = ''; S.keluar = ''; toast('Tanggal terpilih tidak cukup untuk jumlah ini. Pilih tanggal lagi.'); }
    else if (S.masuk && !S.keluar && info(S.masuk).dis) { S.masuk = ''; }
    S.kal.gambar(); rinci();
  });
  function pilih(id) { S.hid = id; gambarDaftar(); gambarPanel(); }
  daftar.addEventListener('change', function (e) { if (e.target.name === 'rumah') pilih(e.target.value); });
  panel.addEventListener('change', function (e) { if (e.target.id === 'iSar') rinci(); });
  panel.addEventListener('click', function (e) {
    if (e.target.id !== 'iTambah') return;
    var c = cur(), err = $('#iErr', panel);
    var l = { tipe: 'inap', ref: S.hid, masuk: S.masuk, keluar: S.keluar, unit: unitNow(), tamu: val('nTamu'), sarapan: !!($('#iSar', panel) && $('#iSar', panel).checked) };
    var m = cekLine(c.d, l, cartExtra());
    if (m) { err.textContent = m; return; }
    err.textContent = '';
    var k = cart(); l.id = uid(); k.push(l); saveCart(k);
    toast('Ditambahkan ke keranjang: ' + c.h.nama);
    S.masuk = ''; S.keluar = ''; S.kal.gambar(); rinci();
  });
  $$('[data-pilih-rumah]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); pilih(a.dataset.pilihRumah); }); });
  var a = aktif(); pilih(a[0] ? a[0].id : null);
};

H.kunjungan = function () {
  var kBox = $('#kList'), kTot = $('#kTotal'), form = $('#form');
  function render() {
    var c = cart(), d = db(), valid = true;
    if (!c.length) {
      kBox.innerHTML = '<div class="kosong"><p>Keranjang masih kosong.</p><div class="baris-tombol"><a class="tombol kecil" href="aktivitas.html#paket">Pilih paket atau kelas</a><a class="tombol sek kecil" href="menginap.html">Pilih penginapan</a></div></div>';
      kTot.hidden = true; $('#kForm').hidden = true; return;
    }
    kBox.innerHTML = c.map(function (l) {
      var it;
      try { var cm = cekLine(d, l, []); it = l.tipe === 'paket' ? buatItemPaket(d, l) : buatItemInap(d, l); if (cm) { it.masalah = cm; valid = false; } }
      catch (e) { it = { judul: 'Item tidak tersedia lagi', sub: '', total: 0, masalah: 'Item ini sudah dihapus pengelola.' }; valid = false; }
      return '<div class="baris-k"><div><h3>' + esc(it.judul) + '</h3><p>' + esc(it.sub) + '</p>' + (it.tamb && it.tamb.length ? '<p>Tambahan: ' + esc(it.tamb.join(', ')) + '</p>' : '') + (it.masalah ? '<p class="err" role="alert">' + esc(it.masalah) + '</p>' : '') + '</div><div class="hg">' + rp(it.total) + '</div><button type="button" data-hapus="' + esc(l.id) + '" aria-label="Hapus ' + esc(it.judul) + ' dari keranjang">Hapus</button></div>';
    }).join('');
    var tot = c.reduce(function (a, l) { try { return a + (l.tipe === 'paket' ? buatItemPaket(d, l) : buatItemInap(d, l)).total; } catch (e) { return a; } }, 0);
    kTot.hidden = false; kTot.innerHTML = '<span>Total</span><span>' + rp(tot) + '</span>';
    $('#kForm').hidden = false;
  }
  kBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hapus]'); if (!b) return;
    saveCart(cart().filter(function (l) { return l.id !== b.dataset.hapus; })); render(); toast('Dihapus dari keranjang.');
  });
  function salah(id, msg) {
    var p = $('#e' + id), el = form.elements[id.toLowerCase()];
    if (p) { p.textContent = msg || ''; p.hidden = !msg; }
    if (el) { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var r = buatBooking({ nama: form.nama.value, telp: form.telp.value, email: form.email.value, catatan: form.catatan.value, setuju: form.setuju.checked });
    ['Nama', 'Telp', 'Email', 'Setuju', 'Keranjang'].forEach(function (k) { salah(k, r.err && r.err[k.toLowerCase()]); });
    if (r.err) { var f = form.querySelector('[aria-invalid=true]') || $('#eKeranjang'); if (f) f.focus && f.focus(); if (r.err.keranjang) { $('#eKeranjang').scrollIntoView({ block: 'center' }); render(); } return; }
    tampilSelesai(r.booking);
  });
  function tampilSelesai(b) {
    $('#keranjang').hidden = true;
    var s = $('#selesai'); s.hidden = false;
    $('#selesaiIsi').innerHTML = '<div class="hasil-wrap">' + buktiHTML(b) + bayarHTML(b) + '</div>' +
      '<div class="baris-tombol no-cetak"><a class="tombol" href="' + esc(waLink(b)) + '" target="_blank" rel="noopener">Konfirmasi lewat WhatsApp</a><button class="tombol sek" type="button" id="cetak">Cetak bukti</button><a class="tombol sek" href="cek.html?kode=' + encodeURIComponent(b.kode) + '">Cek booking</a></div>' +
      '<p class="kecil-teks no-cetak" style="color:var(--redup);margin-top:14px">Simpan kode <b>' + esc(b.kode) + '</b> dan nomor telepon Anda. Keduanya dipakai untuk cek atau membatalkan booking.</p>';
    $('#cetak').addEventListener('click', function () { window.print(); });
    s.scrollIntoView({ block: 'start' }); $('#selesaiJudul').focus();
    badge();
  }
  render();
};

H.cek = function () {
  var form = $('#form'), hasil = $('#hasil'), cur = null;
  function langkah(b) {
    var urut = ['menunggu', 'lunas', 'checkin', 'selesai'], i = urut.indexOf(b.status), h = '<ol class="garis-w">';
    urut.forEach(function (s, k) {
      var cl = b.status === 'batal' ? (k === 0 ? 'sdh' : '') : (k < i ? 'sdh' : k === i ? 'sdh skr' : '');
      var rw = null; b.riwayat.forEach(function (r) { var tk = { menunggu: 'Booking dibuat', lunas: 'Pembayaran diterima', checkin: 'Tamu check-in', selesai: 'Kunjungan selesai' }[s]; if (r.teks === tk) rw = r; });
      h += '<li class="' + cl + '">' + STATUS[s] + (rw ? '<time>' + esc(waktu(rw.t)) + '</time>' : '') + '</li>';
    });
    if (b.status === 'batal') { var r = b.riwayat[b.riwayat.length - 1]; h += '<li class="bt skr">Dibatalkan<time>' + esc(waktu(r.t)) + '</time></li>'; }
    return h + '</ol>';
  }
  function tampil(b, pesan) {
    cur = b;
    var h = '<div class="hasil-wrap"><div class="kartu-i no-cetak"><h3>Status: <span class="st ' + b.status + '">' + STATUS[b.status] + '</span></h3>' + (pesan ? '<p role="status"><strong>' + esc(pesan) + '</strong></p>' : '') + langkah(b) + '</div>' + buktiHTML(b);
    if (b.status === 'menunggu') h += bayarHTML(b);
    h += '</div><div class="baris-tombol no-cetak"><a class="tombol" href="' + esc(waLink(b)) + '" target="_blank" rel="noopener">Konfirmasi lewat WhatsApp</a><button class="tombol sek" type="button" id="cetak">Cetak bukti</button>' +
      (b.status === 'menunggu' || b.status === 'lunas' ? '<button class="tombol sek" type="button" id="batalBtn">Batalkan booking</button>' : '') + '</div><div id="batalBox" class="no-cetak"></div>';
    hasil.innerHTML = '<div class="wadah">' + h + '</div>'; hasil.hidden = false;
    $('#cetak').addEventListener('click', function () { window.print(); });
    var bb = $('#batalBtn');
    if (bb) bb.addEventListener('click', function () {
      $('#batalBox').innerHTML = '<div class="konfirm"><p><strong>Batalkan booking ' + esc(b.kode) + '?</strong> ' + esc(refundTeks(b)) + ' Tindakan ini tidak bisa diurungkan.</p><button class="tombol bahaya kecil" type="button" id="ya">Ya, batalkan</button><button class="tombol sek kecil" type="button" id="tdk">Tidak</button></div>';
      $('#ya').focus();
      $('#tdk').addEventListener('click', function () { $('#batalBox').innerHTML = ''; bb.focus(); });
      $('#ya').addEventListener('click', function () {
        var m = batalkan(b.kode, b.telp);
        if (m) { $('#batalBox').innerHTML = '<p class="err" role="alert">' + esc(m) + '</p>'; return; }
        tampil(cariBooking(b.kode, b.telp), 'Booking dibatalkan. ' + refundTeks(b)); toast('Booking dibatalkan.');
      });
    });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var er = $('#eCek'), kode = form.kode.value.trim(), tel = form.telp.value;
    if (!kode || !tel.trim()) { er.textContent = 'Isi kode booking dan nomor telepon.'; er.hidden = false; hasil.hidden = true; return; }
    var b = cariBooking(kode, tel);
    if (!b) { er.textContent = 'Kode booking atau nomor telepon tidak cocok. Periksa lagi, atau lihat contoh di atas.'; er.hidden = false; hasil.hidden = true; return; }
    er.hidden = true; tampil(b);
  });
  var q = location.search.match(/[?&]kode=([A-Za-z0-9-]+)/); if (q) { form.kode.value = q[1].toUpperCase(); form.telp.focus(); }
};

var FOTO = [
  { f: 'teras-timur.jpg', k: 'sawah', t: 'Terasering di lembah', a: 'Terasering sawah hijau berundak di lembah, dengan pondok kecil di antara pepohonan' },
  { f: 'sawah-hutan.jpg', k: 'sawah', t: 'Sawah di kaki bukit', a: 'Sawah berundak di kaki bukit berhutan' },
  { f: 'teras-dekat.jpg', k: 'sawah', t: 'Terasering dari dekat', a: 'Petak-petak terasering sawah di lereng' },
  { f: 'jalan-utama.jpg', k: 'desa', t: 'Jalan utama desa', a: 'Jalan batu lurus diapit rumah adat beratap ijuk dan rumput' },
  { f: 'jalan-2.jpg', k: 'desa', t: 'Jalan desa dari sisi lain', a: 'Jalan desa dengan deretan rumah adat' },
  { f: 'lorong-kios.jpg', k: 'desa', t: 'Lorong menuju kios kerajinan', a: 'Lorong sempit berdinding tua menuju deretan kios cendera mata' },
  { f: 'pura.jpg', k: 'desa', t: 'Pura di sudut desa', a: 'Bangunan pura di sudut desa' },
  { f: 'petani.jpg', k: 'kegiatan', t: 'Menanam bibit padi', a: 'Petani berikat kepala putih menanam bibit padi di petak sawah' },
  { f: 'tari.jpg', k: 'kegiatan', t: 'Latihan tari anak-anak', a: 'Anak-anak berkostum tari berlatih di bawah pepohonan' },
  { f: 'membatik.jpg', k: 'kegiatan', t: 'Membatik dengan canting', a: 'Seorang ibu mengerjakan kain batik di samping tungku malam' },
  { f: 'anyaman.jpg', k: 'kegiatan', t: 'Anyaman bambu', a: 'Tumpukan kalo dan tampah dari anyaman bambu' },
  { f: 'serabi.jpg', k: 'kegiatan', t: 'Serabi di atas tungku', a: 'Kue serabi dipanggang di atas tungku' },
  { f: 'rumah-kayu.jpg', k: 'inap', t: 'Rumah kayu untuk menginap', a: 'Rumah kayu beratap gonjong di tengah kebun hijau' }
];
var KAT = [['semua', 'Semua'], ['sawah', 'Sawah'], ['desa', 'Lorong desa'], ['kegiatan', 'Kegiatan'], ['inap', 'Penginapan']];

H.galeri = function () {
  var fil = $('#filterG'), grid = $('#gridG'), dlg = $('#lb'), aktifK = 'semua', daftar = FOTO.slice(), idx = 0, pemicu = null;
  fil.innerHTML = KAT.map(function (k) {
    var n = k[0] === 'semua' ? FOTO.length : FOTO.filter(function (f) { return f.k === k[0]; }).length;
    return '<button type="button" data-k="' + k[0] + '" aria-pressed="' + (k[0] === 'semua') + '">' + k[1] + ' <small>' + n + '</small></button>';
  }).join('');
  function gambar() {
    daftar = aktifK === 'semua' ? FOTO.slice() : FOTO.filter(function (f) { return f.k === aktifK; });
    grid.innerHTML = daftar.map(function (f, i) { return '<button type="button" data-i="' + i + '" aria-label="Perbesar foto: ' + esc(f.t) + '"><img loading="lazy" src="img/' + f.f + '" alt="' + esc(f.a) + '" width="480" height="480"><span>' + esc(f.t) + '</span></button>'; }).join('');
    $('#jmlG').textContent = daftar.length + ' foto';
  }
  fil.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    aktifK = b.dataset.k; $$('button', fil).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); gambar();
  });
  function tampil() {
    var f = daftar[idx];
    $('#lbImg').src = 'img/' + f.f; $('#lbImg').alt = f.a;
    $('#lbCap').textContent = f.t; $('#lbHitung').textContent = (idx + 1) + ' dari ' + daftar.length;
  }
  function buka(i) { idx = i; tampil(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  function geser(n) { idx = (idx + n + daftar.length) % daftar.length; tampil(); }
  grid.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; pemicu = b; buka(Number(b.dataset.i)); });
  $('#lbPrev').addEventListener('click', function () { geser(-1); });
  $('#lbNext').addEventListener('click', function () { geser(1); });
  $('#lbTutup').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); geser(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); geser(-1); }
    else if (e.key === 'Home') { e.preventDefault(); idx = 0; tampil(); }
    else if (e.key === 'End') { e.preventDefault(); idx = daftar.length - 1; tampil(); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (pemicu && document.contains(pemicu)) pemicu.focus(); });
  gambar();
};

var POI = [
  { id: 'gerbang', n: 1, t: 'Gerbang dan parkir', x: 70, y: 232, d: 'Parkir motor, mobil, dan bus (lewat jalur selatan). Tiket dibeli di loket balai wisata.' },
  { id: 'balai', n: 2, t: 'Balai wisata', x: 120, y: 190, d: 'Loket, loker, Wi-Fi, toilet, dan titik temu pemandu. Pinjam kursi roda di sini.' },
  { id: 'warung', n: 3, t: 'Warung Bu Sari', x: 190, y: 160, d: 'Buka 07.00 sampai 17.00. Nasi sayur urap, pepes ikan, dan serabi kuah gula merah.' },
  { id: 'lorong', n: 4, t: 'Lorong dan kios kerajinan', x: 245, y: 128, d: 'Jalan utama desa dengan kios batik, anyaman bambu, kopi, dan beras merah.' },
  { id: 'sanggar', n: 5, t: 'Sanggar tari dan batik', x: 300, y: 92, d: 'Kelas membatik dan latihan tari akhir pekan pukul 16.00.' },
  { id: 'pura', n: 6, t: 'Pura desa', x: 335, y: 150, d: 'Tamu boleh melihat dari luar. Masuk halaman hanya memakai kain dan didampingi pemandu.' },
  { id: 'homestay', n: 7, t: 'Rumah warga untuk menginap', x: 215, y: 215, d: 'Rumah Pak Made, Rumah Bu Ketut, Pondok Tepi Sawah, dan Rumah Rombongan Sanggar.' },
  { id: 'bukit', n: 8, t: 'Bukit timur', x: 345, y: 48, d: 'Titik melihat matahari terbit, berangkat 05.15 bersama pemandu. Jalur menanjak dan licin saat basah.' }
];
H.info = function () {
  /* jam buka */
  var JAM = [
    ['Desa dan loket tiket', 7, 18, [0, 1, 2, 3, 4, 5, 6]],
    ['Warung Bu Sari', 7, 17, [0, 1, 2, 3, 4, 5, 6]],
    ['Kedai Kopi Subak', 15, 21, [0, 1, 2, 3, 4, 5, 6]],
    ['Klinik desa', 8, 14, [1, 2, 3, 4, 5, 6]],
    ['Latihan tari (tonton)', 16, 17, [0, 6]]
  ];
  var now = new Date(), jam = now.getHours() + now.getMinutes() / 60, hr = now.getDay();
  function f(j) { return pad(j) + '.00'; }
  var tb = $('#jamBody');
  if (tb) {
    tb.innerHTML = JAM.map(function (r) {
      var buka = r[3].indexOf(hr) >= 0 && jam >= r[1] && jam < r[2];
      var hariT = r[3].length === 7 ? 'Setiap hari' : r[3].length === 2 ? 'Sabtu dan Minggu' : 'Senin sampai Sabtu';
      return '<tr><td data-label="Tempat">' + esc(r[0]) + '</td><td data-label="Hari">' + hariT + '</td><td data-label="Jam">' + f(r[1]) + ' sampai ' + f(r[2]) + '</td><td data-label="Sekarang"><span class="buka-lencana' + (buka ? '' : ' tutup') + '">' + (buka ? 'Buka' : 'Tutup') + '</span></td></tr>';
    }).join('');
    var d0 = JAM[0], b0 = jam >= d0[1] && jam < d0[2];
    $('#statusBuka').innerHTML = '<span class="buka-lencana' + (b0 ? '' : ' tutup') + '">' + (b0 ? 'Desa buka sekarang' : 'Desa tutup sekarang') + '</span> <span style="color:var(--redup)">Berdasarkan jam di perangkat Anda. Loket tutup saat hari raya desa.</span>';
  }
  /* rencana sesuai kondisi, tanpa data cuaca */
  var PLAN = {
    cerah: ['Kalau cerah', 'Datang pagi untuk ke sawah, pakai topi dan tabir surya, dan bawa botol minum. Sore cocok untuk bersepeda keliling subak.'],
    hujan: ['Kalau hujan', 'Kegiatan sawah pindah ke pagi berikutnya atau diganti kelas membatik dan menganyam di sanggar tanpa biaya tambahan. Bawa jas hujan dan sandal.'],
    berkabut: ['Kalau berkabut', 'Matahari terbit di bukit timur bisa tertutup, tetapi terasering tampak lembut. Pakai jaket tipis dan tunda jalan ke pematang sampai kabut naik.']
  };
  var co = $('#cuaca');
  if (co) {
    function pl(k) {
      $$('button', co).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === k); });
      $('#cuacaIsi').innerHTML = '<h3>' + PLAN[k][0] + '</h3><p style="margin-top:8px;max-width:40em;color:var(--redup)">' + PLAN[k][1] + '</p>';
    }
    co.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pl(b.dataset.k); });
    pl('cerah');
  }
  /* peta */
  var pl2 = $('#poiList'), svg = $('#peta');
  if (pl2) {
    pl2.innerHTML = POI.map(function (p) { return '<li><button type="button" data-poi="' + p.id + '" aria-pressed="false"><b>' + p.n + '</b>' + esc(p.t) + '</button></li>'; }).join('');
    svg.innerHTML += POI.map(function (p) {
      return '<g data-poi="' + p.id + '" role="button" tabindex="0" aria-label="' + esc(p.n + '. ' + p.t) + '"><circle class="pt" cx="' + p.x + '" cy="' + p.y + '" r="15" fill="#f3f6ee" stroke="#0f2a22" stroke-width="2"/><text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#0f2a22" pointer-events="none">' + p.n + '</text></g>';
    }).join('');
    var pilihPoi = function (id) {
      var p = POI.filter(function (x) { return x.id === id; })[0]; if (!p) return;
      $$('[data-poi]', pl2).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.poi === id); });
      $$('g[data-poi]', svg).forEach(function (g) { g.classList.toggle('pilih', g.dataset.poi === id); });
      $('#poiInfo').innerHTML = '<h3>' + p.n + '. ' + esc(p.t) + '</h3><p>' + esc(p.d) + '</p>';
    };
    pl2.addEventListener('click', function (e) { var b = e.target.closest('[data-poi]'); if (b) pilihPoi(b.dataset.poi); });
    svg.addEventListener('click', function (e) { var g = e.target.closest('g[data-poi]'); if (g) pilihPoi(g.dataset.poi); });
    svg.addEventListener('keydown', function (e) { var g = e.target.closest('g[data-poi]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pilihPoi(g.dataset.poi); } });
    pilihPoi('balai');
  }
  /* FAQ akordeon + cari */
  var faq = $('#faq');
  if (faq) {
    var ds = $$('details', faq);
    ds.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); }); });
    var cr = $('#cariFaq'), kosong = $('#faqKosong');
    cr.addEventListener('input', function () {
      var q = cr.value.trim().toLowerCase(), n = 0;
      ds.forEach(function (d) { var ok = !q || d.textContent.toLowerCase().indexOf(q) >= 0; d.hidden = !ok; if (ok) n++; });
      kosong.hidden = n > 0;
    });
  }
  /* formulir pertanyaan */
  var form = $('#tanyaForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    function s(id, msg) { var p = $('#e' + id); p.textContent = msg || ''; p.hidden = !msg; var el = form.elements[id.toLowerCase()]; if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); return !msg; }
    var nama = form.nama.value.trim(), kon = form.kontak.value.trim(), isi = form.isi.value.trim();
    var kOk = emailOk(kon) || telpOk(normTelp(kon));
    var r = [s('Nama', nama.length >= 3 ? '' : 'Tulis nama, minimal 3 huruf.'), s('Kontak', kOk ? '' : 'Isi nomor telepon (0812...) atau email yang valid.'), s('Isi', isi.length >= 10 ? '' : 'Tulis pertanyaan, minimal 10 huruf.')];
    if (r.indexOf(false) >= 0) { form.querySelector('[aria-invalid=true]').focus(); return; }
    var d = db(), id = d.pesan.reduce(function (a, p) { return Math.max(a, p.id); }, 0) + 1;
    d.pesan.push({ id: id, nama: nama, kontak: kon, topik: form.topik.value, isi: isi.slice(0, 800), dibuat: new Date().toISOString(), dibaca: false });
    save(d); form.reset();
    var ok = $('#tanyaOk'); ok.hidden = false; ok.innerHTML = 'Pertanyaan terkirim dengan nomor <b>T-' + pad(id) + '</b>. Pengelola membalas lewat kontak yang Anda tulis.';
    toast('Pertanyaan tersimpan.');
  });
};

/* ---------- mulai ---------- */
function mulai() {
  var tMenu = $('#tMenu'), menu = $('#menu');
  if (tMenu) {
    var atur = function (buka) { menu.classList.toggle('buka', buka); tMenu.setAttribute('aria-expanded', buka); tMenu.textContent = buka ? 'Tutup' : 'Menu'; };
    tMenu.addEventListener('click', function () { atur(!menu.classList.contains('buka')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) atur(false); });
  }
  var d = db();
  $$('[data-harga]').forEach(function (el) {
    var k = el.dataset.harga, x = cari(d.paket, k) || cari(d.tambahan, k) || cari(d.homestay, k);
    if (x) el.textContent = rp(x.harga);
  });
  badge();
  window.addEventListener('storage', badge);
  var h = document.body.dataset.halaman;
  if (H[h]) H[h]();
}

window.TA = {
  esc: esc, rp: rp, today: today, addDays: addDays, parse: parse, selisih: selisih, dow: dow, tglPanjang: tglPanjang, tglPendek: tglPendek, waktu: waktu, pad: pad,
  toast: toast, db: db, save: save, cart: cart, saveCart: saveCart, badge: badge, resetData: resetData, uid: uid,
  statusPaket: statusPaket, kapPaket: kapPaket, terpakaiPaket: terpakaiPaket, kapMalam: kapMalam, terpakaiMalam: terpakaiMalam, sisaMalam: sisaMalam,
  hitungPaket: hitungPaket, hitungInap: hitungInap, cekLine: cekLine, buatBooking: buatBooking, cariBooking: cariBooking, ubahStatus: ubahStatus, batalkan: batalkan,
  tglTerdekat: tglTerdekat, refundTeks: refundTeks, waLink: waLink, buktiHTML: buktiHTML, normTelp: normTelp, telpOk: telpOk, emailOk: emailOk, telpTampil: telpTampil,
  Kalender: Kalender, stepper: stepper, pasangStepper: pasangStepper, cari: cari, clamp: clamp,
  STATUS: STATUS, HARI: HARI, BULAN: BULAN, HORIZON: HORIZON, $: $, $$: $$, FOTO: FOTO
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
