/* Admin Desa Wanasari. Memakai data bersama dari app.js (window.W). */
(function () {
  'use strict';
  var W = window.W, $ = W.$, $$ = W.$$, esc = W.esc;
  var SKEY = 'wanasari.admin', mem = false, PAGE = 8;

  function masuk() { try { return sessionStorage.getItem(SKEY) === '1'; } catch (e) { return mem; } }
  function setMasuk(v) { mem = v; try { if (v) sessionStorage.setItem(SKEY, '1'); else sessionStorage.removeItem(SKEY); } catch (e) {} }

  var ICO = {
    dash: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
    surat: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    aduan: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    pengumuman: '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 5V5L7 10H4a1 1 0 0 0-1 1z"/><path d="M19 9a4 4 0 0 1 0 6"/>',
    kabar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6M7 12h10M7 16h10"/>',
    produk: '<path d="M5 7h14l-1 13H6z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    anggaran: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    data: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>'
  };
  var NAV = [['dashboard', 'Dashboard', 'dash'], ['surat', 'Pengajuan surat', 'surat'], ['aduan', 'Pengaduan', 'aduan'], ['pengumuman', 'Pengumuman', 'pengumuman'],
    ['kabar', 'Kabar', 'kabar'], ['produk', 'Produk UMKM', 'produk'], ['anggaran', 'Anggaran', 'anggaran'], ['data', 'Ekspor dan data', 'data']];
  function ico(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICO[n] + '</svg>'; }

  var LS = {}; // keadaan daftar: pencarian, filter, halaman
  function ls(n) { return LS[n] || (LS[n] = { q: '', f: '', p: 1 }); }

  function fotoOpts() { return Object.keys(W.FOTO).map(function (k) { return W.FOTO[k][1]; }); }
  function fotoKey(label) { var r = ''; Object.keys(W.FOTO).forEach(function (k) { if (W.FOTO[k][1] === label) r = k; }); return r; }
  function stPub(r, k) { return '<span class="st ' + (r[k] ? 'terbit' : 'draf') + '">' + (r[k] ? 'Terbit' : 'Draf') + '</span>'; }
  var NUM = ['harga', 'anggaran', 'realisasi', 'tahun'];

  /* ---------- Konfigurasi entitas CRUD ---------- */
  var ENT = {
    pengumuman: {
      judul: 'Pengumuman', baru: 'Tambah pengumuman', idp: 'p', sort: W.urut,
      cols: [['Judul', function (r) { return '<b>' + esc(r.judul) + '</b>'; }], ['Kategori', function (r) { return esc(r.kat); }], ['Tanggal', function (r) { return esc(W.tgl(r.tgl, true)); }], ['Status', function (r) { return stPub(r, 'terbit'); }]],
      filter: { label: 'Kategori', opts: function () { return W.KAT_PENG.map(function (k) { return [k, k]; }); }, get: function (r) { return r.kat; } },
      cari: function (r) { return r.judul + ' ' + r.isi + ' ' + r.kat; },
      fields: [{ k: 'judul', l: 'Judul', t: 'text', req: 1, minLen: 3, maxLen: 100 }, { k: 'kat', l: 'Kategori', t: 'select', req: 1, opts: W.KAT_PENG },
        { k: 'tgl', l: 'Tanggal kegiatan atau terbit', t: 'date', req: 1 }, { k: 'waktu', l: 'Jam', t: 'text', maxLen: 30, hint: 'Contoh: 08.00' },
        { k: 'lokasi', l: 'Tempat', t: 'text', maxLen: 100 }, { k: 'isi', l: 'Isi', t: 'textarea', req: 1, minLen: 10, maxLen: 3000, hint: 'Pisahkan paragraf dengan satu baris kosong.' },
        { k: 'terbit', l: 'Terbitkan di situs', t: 'checkbox' }],
      blank: function () { return { judul: '', kat: '', tgl: W.todayISO(), waktu: '', lokasi: '', isi: '', terbit: true }; }
    },
    kabar: {
      judul: 'Kabar', baru: 'Tambah kabar', idp: 'k', sort: W.urut,
      cols: [['Judul', function (r) { return '<b>' + esc(r.judul) + '</b>'; }], ['Kategori', function (r) { return esc(r.kat); }], ['Tanggal', function (r) { return esc(W.tgl(r.tgl, true)); }], ['Status', function (r) { return stPub(r, 'terbit'); }]],
      filter: { label: 'Kategori', opts: function () { return W.KAT_KABAR.map(function (k) { return [k, k]; }); }, get: function (r) { return r.kat; } },
      cari: function (r) { return r.judul + ' ' + r.ringkas + ' ' + r.isi; },
      fields: [{ k: 'judul', l: 'Judul', t: 'text', req: 1, minLen: 5, maxLen: 140 }, { k: 'kat', l: 'Kategori', t: 'select', req: 1, opts: W.KAT_KABAR },
        { k: 'tgl', l: 'Tanggal terbit', t: 'date', req: 1 }, { k: 'ringkas', l: 'Ringkasan (tampil di daftar)', t: 'text', req: 1, minLen: 10, maxLen: 200 },
        { k: 'isi', l: 'Isi kabar', t: 'textarea', req: 1, minLen: 20, maxLen: 6000, hint: 'Pisahkan paragraf dengan satu baris kosong.' },
        { k: 'foto', l: 'Foto', t: 'select', kosong: '(tanpa foto)', opts: fotoOpts() }, { k: 'penulis', l: 'Penulis', t: 'text', maxLen: 60 },
        { k: 'terbit', l: 'Terbitkan di situs', t: 'checkbox' }],
      blank: function () { return { judul: '', kat: '', tgl: W.todayISO(), ringkas: '', isi: '', foto: '', penulis: 'Tim Informasi Desa', terbit: true }; }
    },
    produk: {
      judul: 'Produk UMKM', baru: 'Tambah produk', idp: 'b',
      sort: function (a, b) { return a.nama < b.nama ? -1 : 1; },
      cols: [['Produk', function (r) { return '<b>' + esc(r.nama) + '</b>'; }], ['Kategori', function (r) { return esc(r.kat); }], ['Harga', function (r) { return esc(W.rp(r.harga)) + ' / ' + esc(r.satuan); }], ['Penjual', function (r) { return esc(r.penjual); }],
        ['Stok', function (r) { return '<span class="st ' + (r.tersedia ? 'terbit' : 'habis') + '">' + (r.tersedia ? 'Tersedia' : 'Habis') + '</span>'; }]],
      filter: { label: 'Kategori', opts: function () { return W.KAT_PRODUK.map(function (k) { return [k, k]; }); }, get: function (r) { return r.kat; } },
      cari: function (r) { return r.nama + ' ' + r.penjual + ' ' + r.desk; },
      fields: [{ k: 'nama', l: 'Nama produk', t: 'text', req: 1, minLen: 3, maxLen: 80 }, { k: 'kat', l: 'Kategori', t: 'select', req: 1, opts: W.KAT_PRODUK },
        { k: 'harga', l: 'Harga (Rp)', t: 'number', req: 1, min: 0, max: 100000000, int: 1 }, { k: 'satuan', l: 'Satuan', t: 'text', req: 1, maxLen: 40, hint: 'Contoh: 200 gram' },
        { k: 'penjual', l: 'Penjual', t: 'text', req: 1, maxLen: 60 }, { k: 'wa', l: 'WhatsApp penjual', t: 'tel', req: 1, hp: 1, hint: 'Pesanan dikirim ke nomor ini. Contoh: 0812-0000-7101' },
        { k: 'desk', l: 'Deskripsi singkat', t: 'text', req: 1, minLen: 5, maxLen: 200 }, { k: 'foto', l: 'Foto', t: 'select', kosong: '(tanpa foto)', opts: fotoOpts() },
        { k: 'tersedia', l: 'Stok tersedia', t: 'checkbox' }],
      blank: function () { return { nama: '', kat: '', harga: '', satuan: '', penjual: '', wa: '', desk: '', foto: '', tersedia: true }; }
    },
    anggaran: {
      judul: 'Anggaran', baru: 'Tambah baris anggaran', idp: 'g',
      sort: function (a, b) { return b.tahun - a.tahun || (a.jenis < b.jenis ? 1 : -1) || (a.uraian < b.uraian ? -1 : 1); },
      cols: [['Tahun', function (r) { return esc(r.tahun); }], ['Jenis', function (r) { return esc(r.jenis); }], ['Uraian', function (r) { return '<b>' + esc(r.uraian) + '</b>'; }],
        ['Anggaran', function (r) { return esc(W.rp(r.anggaran)); }, 'r'], ['Realisasi', function (r) { return esc(W.rp(r.realisasi)); }, 'r']],
      filter: { label: 'Tahun', opts: function () { var t = []; W.get().anggaran.forEach(function (r) { if (t.indexOf(r.tahun) < 0) t.push(r.tahun); }); return t.sort(function (a, b) { return b - a; }).map(function (x) { return [String(x), String(x)]; }); }, get: function (r) { return String(r.tahun); } },
      cari: function (r) { return r.uraian + ' ' + r.jenis + ' ' + r.tahun; },
      fields: [{ k: 'tahun', l: 'Tahun', t: 'number', req: 1, min: 2000, max: 2100, int: 1 }, { k: 'jenis', l: 'Jenis', t: 'select', req: 1, opts: ['Pendapatan', 'Belanja'] },
        { k: 'uraian', l: 'Uraian (bidang atau sumber)', t: 'text', req: 1, minLen: 3, maxLen: 80 }, { k: 'anggaran', l: 'Anggaran (Rp)', t: 'number', req: 1, min: 0, max: 1e13, int: 1 },
        { k: 'realisasi', l: 'Realisasi (Rp)', t: 'number', req: 1, min: 0, max: 1e13, int: 1, hint: 'Tidak boleh lebih besar dari anggaran.' }],
      blank: function () { return { tahun: 2026, jenis: '', uraian: '', anggaran: '', realisasi: 0 }; },
      cek: function (v) { if (Number(v.realisasi) > Number(v.anggaran)) return ['realisasi', 'Realisasi tidak boleh melebihi anggaran.']; return null; }
    },
    surat: {
      judul: 'Pengajuan surat', tiket: true,
      sort: function (a, b) { return a.dibuat < b.dibuat ? 1 : -1; },
      cols: [['Nomor', function (r) { return '<a class="tautan-b" href="#surat/' + esc(r.id) + '">' + esc(r.id) + '</a>'; }], ['Pemohon', function (r) { return esc(r.nama); }],
        ['Jenis', function (r) { var j = W.jenisById(r.jenis); return esc(j ? j.nama : r.jenis); }], ['Diajukan', function (r) { return esc(W.tglJam(r.dibuat)); }], ['Status', function (r) { return W.badge(r.status, W.ST_SURAT); }]],
      filter: { label: 'Status', opts: function () { return Object.keys(W.ST_SURAT).map(function (k) { return [k, W.ST_SURAT[k]]; }); }, get: function (r) { return r.status; } },
      cari: function (r) { var j = W.jenisById(r.jenis); return r.id + ' ' + r.nama + ' ' + r.nik + ' ' + (j ? j.nama : ''); }
    },
    aduan: {
      judul: 'Pengaduan dan aspirasi', tiket: true,
      sort: function (a, b) { return a.dibuat < b.dibuat ? 1 : -1; },
      cols: [['Nomor', function (r) { return '<a class="tautan-b" href="#aduan/' + esc(r.id) + '">' + esc(r.id) + '</a>'; }], ['Judul', function (r) { return '<b>' + esc(r.judul) + '</b><br><span class="m xs">' + esc(r.jenis) + ', Dusun ' + esc(r.dusun) + '</span>'; }],
        ['Kategori', function (r) { return esc(r.kat); }], ['Dikirim', function (r) { return esc(W.tglJam(r.dibuat)); }], ['Status', function (r) { return W.badge(r.status, W.ST_ADUAN); }]],
      filter: { label: 'Status', opts: function () { return Object.keys(W.ST_ADUAN).map(function (k) { return [k, W.ST_ADUAN[k]]; }); }, get: function (r) { return r.status; } },
      cari: function (r) { return r.id + ' ' + r.judul + ' ' + r.isi + ' ' + r.nama; }
    }
  };
  var DEFCAT = { diverifikasi: 'Berkas lengkap dan sedang diperiksa.', diproses: 'Surat sedang diketik.', selesai: 'Surat sudah dapat diambil di loket pelayanan.', ditindaklanjuti: 'Sedang ditindaklanjuti petugas.' };

  /* ---------- Rangka ---------- */
  var out = $('#utama');
  function setJudul(t) { $('#judul').textContent = t; document.title = t + ' | Admin Desa Wanasari'; }
  function hitung() {
    var d = W.get();
    return { surat: d.surat.filter(function (s) { return s.status === 'diterima'; }).length, aduan: d.aduan.filter(function (s) { return s.status === 'baru'; }).length };
  }
  function gambarNav(cur) {
    var h = hitung();
    $('#nav').innerHTML = NAV.map(function (n) {
      var c = n[0] === 'surat' ? h.surat : (n[0] === 'aduan' ? h.aduan : 0);
      return '<button type="button" data-go="' + n[0] + '"' + (n[0] === cur ? ' aria-current="page"' : '') + '>' + ico(n[2]) + '<span>' + n[1] + '</span>' + (c ? '<span class="sb-c" aria-label="' + c + ' baru">' + c + '</span>' : '') + '</button>';
    }).join('');
  }
  function tutupMenu() { $('#sb').classList.remove('buka'); $('#ov').hidden = true; $('#bMenu').setAttribute('aria-expanded', 'false'); }
  $('#bMenu').addEventListener('click', function () { var b = !$('#sb').classList.contains('buka'); $('#sb').classList.toggle('buka', b); $('#ov').hidden = !b; this.setAttribute('aria-expanded', b); });
  $('#ov').addEventListener('click', tutupMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutupMenu(); });
  $('#nav').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) { location.hash = '#' + b.dataset.go; tutupMenu(); } });
  $('#bKeluar').addEventListener('click', function () { setMasuk(false); location.hash = ''; tampil(); });

  /* ---------- Router ---------- */
  function route() {
    if (!masuk()) return;
    var h = location.hash.replace(/^#/, '').split('/'), a = h[0] || 'dashboard', id = h[1] ? decodeURIComponent(h[1]) : '';
    var tampilNav = a;
    if (a === 'dashboard') vDash();
    else if (a === 'data') vData();
    else if (a === 'surat' || a === 'aduan') id ? vTiket(a, id) : vDaftar(a);
    else if (ENT[a]) id ? vForm(a, id) : vDaftar(a);
    else { a = 'dashboard'; tampilNav = a; vDash(); }
    gambarNav(tampilNav);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Dashboard ---------- */
  function vDash() {
    setJudul('Dashboard');
    var d = W.get(), c = function (a, f) { return a.filter(f).length; };
    var baru = c(d.surat, function (s) { return s.status === 'diterima'; }), proses = c(d.surat, function (s) { return s.status === 'diverifikasi' || s.status === 'diproses'; });
    var selesai = c(d.surat, function (s) { return s.status === 'selesai'; }), aduanBaru = c(d.aduan, function (s) { return s.status === 'baru'; });
    var maxS = Math.max.apply(null, Object.keys(W.ST_SURAT).map(function (k) { return c(d.surat, function (s) { return s.status === k; }); }).concat([1]));
    var tindak = d.surat.filter(function (s) { return W.LANJUT_SURAT[s.status].length; }).sort(function (a, b) { return a.dibuat < b.dibuat ? -1 : 1; }).slice(0, 5);
    var tindakA = d.aduan.filter(function (s) { return W.LANJUT_ADUAN[s.status].length; }).sort(function (a, b) { return a.dibuat < b.dibuat ? -1 : 1; }).slice(0, 5);
    out.innerHTML = '<div class="grid">' +
      '<div class="stat"><a href="#surat"><b>' + baru + '</b><span>Pengajuan baru</span></a></div><div class="stat"><a href="#surat"><b>' + proses + '</b><span>Sedang diperiksa atau diproses</span></a></div>' +
      '<div class="stat"><a href="#surat"><b>' + selesai + '</b><span>Surat selesai</span></a></div><div class="stat"><a href="#aduan"><b>' + aduanBaru + '</b><span>Pengaduan baru</span></a></div></div>' +
      '<div class="grid"><div class="stat"><a href="#pengumuman"><b>' + c(d.pengumuman, function (x) { return x.terbit; }) + '</b><span>Pengumuman terbit</span></a></div><div class="stat"><a href="#kabar"><b>' + c(d.kabar, function (x) { return x.terbit; }) + '</b><span>Kabar terbit</span></a></div>' +
      '<div class="stat"><a href="#produk"><b>' + c(d.produk, function (x) { return x.tersedia; }) + '</b><span>Produk tersedia</span></a></div><div class="stat"><a href="#surat"><b>' + d.surat.length + '</b><span>Total tiket surat</span></a></div></div>' +
      '<div class="card"><h2>Tiket surat menurut status</h2>' + Object.keys(W.ST_SURAT).map(function (k) {
        var n = c(d.surat, function (s) { return s.status === k; });
        return '<div class="bar-r"><span>' + esc(W.ST_SURAT[k]) + '</span><div><i style="width:' + (n / maxS * 100) + '%"></i></div><b>' + n + '</b></div>';
      }).join('') + '</div>' +
      '<div class="card"><h2>Perlu ditindak</h2>' + (tindak.length || tindakA.length ? '<div class="daftar-dl" style="margin-top:12px">' +
        tindak.map(function (s) { return '<div class="card" style="padding:10px 12px"><span><a class="tautan-b" href="#surat/' + esc(s.id) + '">' + esc(s.id) + '</a> ' + esc(s.nama) + '</span>' + W.badge(s.status, W.ST_SURAT) + '</div>'; }).join('') +
        tindakA.map(function (s) { return '<div class="card" style="padding:10px 12px"><span><a class="tautan-b" href="#aduan/' + esc(s.id) + '">' + esc(s.id) + '</a> ' + esc(s.judul) + '</span>' + W.badge(s.status, W.ST_ADUAN) + '</div>'; }).join('') + '</div>' : '<p class="m" style="margin-top:8px">Semua tiket sudah selesai atau ditolak.</p>') + '</div>';
  }

  /* ---------- Daftar generik ---------- */
  function vDaftar(n) {
    var E = ENT[n], S = ls(n);
    setJudul(E.judul);
    var fo = E.filter.opts();
    out.innerHTML = '<div class="bar"><div class="fg"><label for="q">Cari</label><input type="search" id="q" autocomplete="off" value="' + esc(S.q) + '"></div>' +
      '<div class="fg"><label for="fl">' + esc(E.filter.label) + '</label><select id="fl"><option value="">Semua</option>' + fo.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (S.f === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>' +
      (E.tiket ? '' : '<a class="btn" href="#' + n + '/baru">' + esc(E.baru) + '</a>') + '</div><div id="tbl"></div>';
    $('#q').addEventListener('input', function () { S.q = this.value; S.p = 1; isiTabel(n); });
    $('#fl').addEventListener('change', function () { S.f = this.value; S.p = 1; isiTabel(n); });
    isiTabel(n);
  }
  function isiTabel(n) {
    var E = ENT[n], S = ls(n), d = W.get(), q = S.q.trim().toLowerCase();
    var rows = d[n].filter(function (r) { return (!S.f || E.filter.get(r) === S.f) && (!q || E.cari(r).toLowerCase().indexOf(q) >= 0); }).sort(E.sort);
    var tot = rows.length, hal = Math.max(1, Math.ceil(tot / PAGE)); if (S.p > hal) S.p = hal;
    var vis = rows.slice((S.p - 1) * PAGE, S.p * PAGE), box = $('#tbl');
    if (!tot) { box.innerHTML = '<div class="tw"><p class="kosong">' + (d[n].length ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada data.') + '</p></div>'; return; }
    box.innerHTML = '<div class="tw"><table class="resp"><thead><tr>' + E.cols.map(function (c) { return '<th scope="col"' + (c[2] ? ' class="r"' : '') + '>' + c[0] + '</th>'; }).join('') + (E.tiket ? '' : '<th scope="col"><span style="position:absolute;left:-9999px">Aksi</span></th>') + '</tr></thead><tbody>' +
      vis.map(function (r) {
        return '<tr>' + E.cols.map(function (c) { return '<td data-label="' + c[0] + '"' + (c[2] ? ' class="r"' : '') + '>' + c[1](r) + '</td>'; }).join('') +
          (E.tiket ? '' : '<td class="aks"><a class="btn sek kecil" href="#' + n + '/' + esc(r.id) + '">Ubah</a> <button type="button" class="btn bahaya kecil" data-hapus="' + n + '|' + esc(r.id) + '">Hapus</button></td>') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="hal"><span class="m xs" aria-live="polite">' + tot + ' data, halaman ' + S.p + ' dari ' + hal + '</span><span class="aksi"><button type="button" class="btn sek kecil" data-hal="-1"' + (S.p <= 1 ? ' disabled' : '') + '>Sebelumnya</button><button type="button" class="btn sek kecil" data-hal="1"' + (S.p >= hal ? ' disabled' : '') + '>Berikutnya</button></span></div>';
    box.dataset.n = n;
  }
  out.addEventListener('click', function (e) {
    var h = e.target.closest('[data-hal]');
    if (h && !h.disabled) { var n = $('#tbl').dataset.n; ls(n).p += +h.dataset.hal; isiTabel(n); return; }
    var x = e.target.closest('[data-hapus]');
    if (x) hapusDua(x, function () {
      var p = x.dataset.hapus.split('|'), d = W.get();
      d[p[0]] = d[p[0]].filter(function (r) { return r.id !== p[1]; }); W.save(d); W.toast('Data dihapus.');
      if (location.hash.indexOf('/') > 0) location.hash = '#' + p[0]; else { gambarNav(p[0]); isiTabel(p[0]); }
    });
  });
  function hapusDua(btn, fn) {
    if (btn.hasAttribute('data-arm')) { clearTimeout(btn._t); fn(); return; }
    btn.setAttribute('data-arm', '1'); btn._ot = btn.textContent; btn.textContent = 'Yakin hapus?';
    btn._t = setTimeout(function () { btn.removeAttribute('data-arm'); btn.textContent = btn._ot; }, 4000);
  }

  /* ---------- Form CRUD ---------- */
  function vForm(n, id) {
    var E = ENT[n], d = W.get(), baru = id === 'baru', rec = null;
    if (!baru) d[n].forEach(function (r) { if (r.id === id) rec = r; });
    if (!baru && !rec) { setJudul(E.judul); out.innerHTML = '<p class="kosong card">Data tidak ditemukan. <a class="tautan-b" href="#' + n + '">Kembali ke daftar</a></p>'; return; }
    var v = {}, src = rec || E.blank();
    E.fields.forEach(function (f) {
      var x = src[f.k];
      if (f.k === 'foto') x = x && W.FOTO[x] ? W.FOTO[x][1] : '';
      v[f.k] = x;
    });
    setJudul(baru ? E.baru : 'Ubah ' + E.judul.toLowerCase());
    out.innerHTML = '<form id="fEdit" class="form card" novalidate>' + E.fields.map(function (f) { return W.fieldHTML(f, v[f.k], 'e_'); }).join('') +
      '<div class="aksi"><button type="submit" class="btn">Simpan</button><a class="btn sek" href="#' + n + '">Batal</a>' + (baru ? '' : '<button type="button" class="btn bahaya" data-hapus="' + n + '|' + esc(id) + '" style="margin-left:auto">Hapus</button>') + '</div></form>';
    var f = $('#fEdit'); W.clearOnInput(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var vals = W.readForm(E.fields, f, 'e_');
      if (!W.validate(E.fields, vals, f, 'e_')) { W.toast('Ada isian yang belum benar.'); return; }
      if (E.cek) { var m = E.cek(vals); if (m) { var el = $('#e_' + m[0]), p = $('#e_' + m[0] + '_e'); p.textContent = m[1]; el.setAttribute('aria-invalid', 'true'); el.focus(); W.toast(m[1]); return; } }
      var o = {};
      E.fields.forEach(function (fd) {
        var x = vals[fd.k];
        if (NUM.indexOf(fd.k) >= 0) x = Number(x);
        if (fd.k === 'foto') x = fotoKey(x);
        o[fd.k] = x;
      });
      var d2 = W.get(), list = d2[n];
      if (baru) { o.id = W.newId(E.idp, list); list.push(o); }
      else list.forEach(function (r) { if (r.id === id) for (var k in o) r[k] = o[k]; });
      W.save(d2); W.toast(baru ? 'Data ditambahkan.' : 'Perubahan disimpan.'); location.hash = '#' + n;
    });
    $('#e_' + E.fields[0].k).focus();
  }

  /* ---------- Detail tiket (surat dan pengaduan) ---------- */
  function vTiket(n, id) {
    var d = W.get(), t = null, surat = n === 'surat';
    d[n].forEach(function (r) { if (r.id === id) t = r; });
    setJudul(surat ? 'Pengajuan surat' : 'Pengaduan dan aspirasi');
    if (!t) { out.innerHTML = '<p class="kosong card">Tiket tidak ditemukan. <a class="tautan-b" href="#' + n + '">Kembali ke daftar</a></p>'; return; }
    var MAP = surat ? W.ST_SURAT : W.ST_ADUAN, LANJ = (surat ? W.LANJUT_SURAT : W.LANJUT_ADUAN)[t.status];
    var rinci;
    if (surat) {
      var j = W.jenisById(t.jenis);
      rinci = '<div><dt>Jenis surat</dt><dd>' + esc(j ? j.nama : t.jenis) + '</dd></div>' + Object.keys(t.data).map(function (k) {
        var x = t.data[k]; if (/^\d{4}-\d{2}-\d{2}$/.test(x)) x = W.tgl(x);
        return '<div><dt>' + esc(W.labelData(t.jenis, k)) + '</dt><dd>' + esc(x) + '</dd></div>';
      }).join('');
    } else {
      rinci = '<div><dt>Jenis</dt><dd>' + esc(t.jenis) + '</dd></div><div><dt>Kategori</dt><dd>' + esc(t.kat) + '</dd></div><div><dt>Lokasi</dt><dd>Dusun ' + esc(t.dusun) + '</dd></div><div><dt>Judul</dt><dd>' + esc(t.judul) + '</dd></div><div><dt>Isi</dt><dd style="white-space:pre-wrap">' + esc(t.isi) + '</dd></div><div><dt>Nama</dt><dd>' + esc(t.nama || '(tanpa nama)') + '</dd></div><div><dt>Nomor HP</dt><dd>' + esc(t.hp || '-') + '</dd></div>';
    }
    out.innerHTML = '<p><a class="tautan-b" href="#' + n + '">&larr; ' + (surat ? 'Semua pengajuan' : 'Semua pengaduan') + '</a></p>' +
      '<div class="card"><div class="aksi" style="justify-content:space-between;align-items:center"><h2>' + esc(t.id) + '</h2>' + W.badge(t.status, MAP) + '</div><dl class="rinci" style="margin-top:8px">' + rinci + '<div><dt>Diajukan</dt><dd>' + esc(W.tglJam(t.dibuat)) + '</dd></div></dl></div>' +
      '<div class="card"><h2>Riwayat</h2>' + W.timeline(t.riwayat, MAP) + '</div>' +
      '<div class="card"><h2>Ubah status</h2>' + (LANJ.length ? '<form id="fStatus" class="form" style="margin-top:12px" novalidate><div class="fg"><label for="s_st">Status baru</label><select id="s_st">' + LANJ.map(function (k) { return '<option value="' + k + '">' + esc(MAP[k]) + '</option>'; }).join('') + '</select></div>' +
        '<div class="fg"><label for="s_cat">' + (surat ? 'Catatan untuk pemohon' : 'Tanggapan untuk pelapor') + ' <span id="s_wajib" class="m xs"></span></label><textarea id="s_cat" maxlength="500" aria-describedby="s_cat_e" style="min-height:100px"></textarea><p class="pesan" id="s_cat_e" role="alert"></p></div>' +
        '<div class="aksi"><button type="submit" class="btn">Simpan status</button></div></form>' : '<p class="m" style="margin-top:8px">Status akhir (' + esc(MAP[t.status]) + '), tidak bisa diubah lagi.</p>') +
      '<div class="aksi" style="margin-top:16px"><button type="button" class="btn bahaya kecil" data-hapus="' + n + '|' + esc(t.id) + '">Hapus tiket</button></div></div>';
    var f = $('#fStatus'); if (!f) return;
    function wajib() { var s = $('#s_st').value; $('#s_wajib').textContent = (s === 'ditolak' || (!surat && s === 'selesai')) ? '(wajib diisi)' : '(boleh dikosongkan)'; }
    $('#s_st').addEventListener('change', wajib); wajib();
    $('#s_cat').addEventListener('input', function () { $('#s_cat_e').textContent = ''; this.removeAttribute('aria-invalid'); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = $('#s_st').value, cat = $('#s_cat').value.trim();
      if ((s === 'ditolak' || (!surat && s === 'selesai')) && !cat) { $('#s_cat_e').textContent = 'Isi alasan atau tanggapan untuk status ini.'; $('#s_cat').setAttribute('aria-invalid', 'true'); $('#s_cat').focus(); return; }
      var d2 = W.get();
      d2[n].forEach(function (r) {
        if (r.id !== id) return;
        if (LANJ.indexOf(s) < 0) return;
        r.riwayat.push({ s: s, at: W.nowISO(), cat: cat || DEFCAT[s] || '' }); r.status = s;
      });
      W.save(d2); W.toast('Status diubah menjadi ' + MAP[s] + '.'); vTiket(n, id); gambarNav(n);
    });
  }

  /* ---------- Ekspor dan data ---------- */
  var CSVS = {
    surat: { nama: 'pengajuan-surat.csv', kolom: ['Nomor', 'Jenis', 'Nama', 'NIK', 'HP', 'Dusun', 'Status', 'Diajukan (UTC)', 'Catatan terakhir', 'Data lain'],
      baris: function (r) { var j = W.jenisById(r.jenis); return [r.id, j ? j.nama : r.jenis, r.nama, r.nik, r.hp, r.dusun, W.ST_SURAT[r.status], r.dibuat, r.riwayat[r.riwayat.length - 1].cat,
        Object.keys(r.data).filter(function (k) { return ['nama', 'nik', 'hp', 'dusun'].indexOf(k) < 0; }).map(function (k) { return W.labelData(r.jenis, k) + ': ' + r.data[k]; }).join('; ')]; } },
    aduan: { nama: 'pengaduan.csv', kolom: ['Nomor', 'Jenis', 'Kategori', 'Dusun', 'Nama', 'HP', 'Judul', 'Isi', 'Status', 'Dikirim (UTC)', 'Tanggapan terakhir'],
      baris: function (r) { return [r.id, r.jenis, r.kat, r.dusun, r.nama, r.hp, r.judul, r.isi, W.ST_ADUAN[r.status], r.dibuat, r.riwayat[r.riwayat.length - 1].cat]; } },
    pengumuman: { nama: 'pengumuman.csv', kolom: ['ID', 'Judul', 'Kategori', 'Tanggal', 'Jam', 'Tempat', 'Isi', 'Status'],
      baris: function (r) { return [r.id, r.judul, r.kat, r.tgl, r.waktu, r.lokasi, r.isi, r.terbit ? 'Terbit' : 'Draf']; } },
    kabar: { nama: 'kabar.csv', kolom: ['ID', 'Judul', 'Kategori', 'Tanggal', 'Ringkasan', 'Isi', 'Penulis', 'Status'],
      baris: function (r) { return [r.id, r.judul, r.kat, r.tgl, r.ringkas, r.isi, r.penulis, r.terbit ? 'Terbit' : 'Draf']; } },
    produk: { nama: 'produk.csv', kolom: ['ID', 'Produk', 'Kategori', 'Harga', 'Satuan', 'Penjual', 'WhatsApp', 'Deskripsi', 'Stok'],
      baris: function (r) { return [r.id, r.nama, r.kat, r.harga, r.satuan, r.penjual, r.wa, r.desk, r.tersedia ? 'Tersedia' : 'Habis']; } },
    anggaran: { nama: 'anggaran.csv', kolom: ['Tahun', 'Jenis', 'Uraian', 'Anggaran', 'Realisasi', 'Terserap (%)'],
      baris: function (r) { return [r.tahun, r.jenis, r.uraian, r.anggaran, r.realisasi, W.pct(r.realisasi, r.anggaran).toFixed(1)]; } }
  };
  function vData() {
    setJudul('Ekspor dan data');
    var d = W.get();
    out.innerHTML = '<div class="card"><h2>Ekspor CSV</h2><p class="m" style="margin-top:4px">Unduh data sebagai berkas CSV yang bisa dibuka di Excel atau Google Sheets.</p><div class="daftar-dl" style="margin-top:12px">' +
      Object.keys(CSVS).map(function (k) { return '<div class="card" style="padding:10px 12px"><span><b>' + esc(ENT[k].judul) + '</b> <span class="m xs">' + d[k].length + ' baris</span></span><button type="button" class="btn sek kecil" data-csv="' + k + '">Unduh CSV</button></div>'; }).join('') + '</div></div>' +
      '<div class="card"><h2>Reset data demo</h2><p class="m" style="margin-top:4px">Mengembalikan semua data (tiket, pengumuman, kabar, produk, anggaran) ke contoh awal. Semua perubahan Anda hilang. Data tersimpan di peramban ini saja.</p><div class="aksi" style="margin-top:12px"><button type="button" class="btn bahaya" id="bReset">Reset data demo</button></div></div>';
  }
  out.addEventListener('click', function (e) {
    var c = e.target.closest('[data-csv]');
    if (c) { var k = c.dataset.csv, X = CSVS[k], d = W.get(); W.unduhCSV(X.nama, X.kolom, d[k].map(X.baris)); W.toast('CSV diunduh: ' + X.nama); return; }
    var r = e.target.closest('#bReset');
    if (r) hapusDua(r, function () { W.reset(); LS = {}; W.toast('Data demo dikembalikan.'); vData(); gambarNav('data'); });
  });

  /* ---------- Masuk ---------- */
  function tampil() {
    var on = masuk();
    $('#login').hidden = on; $('#app').hidden = !on;
    if (on) route(); else { setJudul('Masuk'); $('#pin').value = ''; $('#pin').focus(); }
  }
  $('#fLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = $('#pin').value.trim();
    if (p !== W.PIN) { $('#pinErr').textContent = 'PIN salah. PIN demo tertera di bawah.'; $('#pin').setAttribute('aria-invalid', 'true'); $('#pin').focus(); return; }
    setMasuk(true); $('#pinErr').textContent = ''; tampil();
  });
  $('#pin').addEventListener('input', function () { $('#pinErr').textContent = ''; this.removeAttribute('aria-invalid'); });
  setJudul('Masuk');
  tampil();
})();
