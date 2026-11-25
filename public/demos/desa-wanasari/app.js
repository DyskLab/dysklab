/* Desa Wanasari: data bersama (localStorage) untuk halaman publik dan admin.
   Semua data fiktif. Tidak ada request ke luar dan tidak ada backend. */
(function () {
  'use strict';
  var KEY = 'wanasari.v1';
  var memo = null; // cadangan bila localStorage diblokir

  /* ---------- Util ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function rp(n) { return 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function ringkasRp(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M';
    return (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); }
  function tgl(iso, pendek) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString('id-ID', { weekday: pendek ? undefined : 'long', day: 'numeric', month: pendek ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function tglJam(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';
  }
  function nowISO() { return new Date().toISOString(); }
  function normHp(v) {
    var d = String(v || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
    if (d.charAt(0) === '0') d = '62' + d.slice(1);
    return d;
  }
  function paragraf(t) {
    return String(t || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function toast(msg) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.h);
    toast.h = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function salin(teks) {
    function cadangan() {
      var a = document.createElement('textarea'); a.value = teks; a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      a.remove(); toast(ok ? 'Tersalin.' : 'Gagal menyalin. Salin manual.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(teks).then(function () { toast('Tersalin.'); }, cadangan);
    } else cadangan();
  }
  function cetakHTML(html) {
    var a = $('#areaCetak');
    if (!a) { a = document.createElement('div'); a.id = 'areaCetak'; document.body.appendChild(a); }
    a.innerHTML = html;
    document.body.classList.add('mode-cetak');
    var selesai = function () { document.body.classList.remove('mode-cetak'); window.removeEventListener('afterprint', selesai); };
    window.addEventListener('afterprint', selesai);
    window.print();
    setTimeout(selesai, 1500);
  }
  function csvSel(v) {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; // cegah rumus di Excel
    return '"' + v.replace(/"/g, '""') + '"';
  }
  function unduhCSV(nama, kolom, baris) {
    var out = [kolom.map(csvSel).join(',')].concat(baris.map(function (r) { return r.map(csvSel).join(','); })).join('\r\n');
    var blob = new Blob(['﻿' + out], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------- Konfigurasi tetap ---------- */
  var DUSUN = ['Krajan', 'Sidorejo', 'Karangtengah', 'Tegalsari', 'Sumberan'];
  var FOTO = {
    desa: ['img/desa.jpg', 'Bentang desa'], gotong: ['img/gotong.jpg', 'Kerja bakti'], padi: ['img/padi.jpg', 'Panen padi'],
    pindah: ['img/pindah.jpg', 'Gotong royong pindah rumah'], kopi: ['img/kopi.jpg', 'Kebun kopi'], posyandu: ['img/posyandu.jpg', 'Posyandu'],
    bambu: ['img/bambu.jpg', 'Anyaman bambu'], jajan: ['img/jajan.jpg', 'Jajan pasar']
  };
  var KAT_PENG = ['Kesehatan', 'Lingkungan', 'Pertanian', 'Bantuan', 'Lowongan'];
  var KAT_KABAR = ['Ekonomi', 'Kesehatan', 'Pertanian', 'Pendidikan', 'Lingkungan', 'Olahraga', 'Sosial'];
  var KAT_PRODUK = ['Kopi', 'Kerajinan', 'Makanan', 'Pertanian'];
  var KAT_ADUAN = ['Infrastruktur', 'Kebersihan', 'Layanan desa', 'Keamanan', 'Kesehatan', 'Pendidikan', 'Lainnya'];
  var ST_SURAT = { diterima: 'Diterima', diverifikasi: 'Diverifikasi', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak' };
  var LANJUT_SURAT = { diterima: ['diverifikasi', 'ditolak'], diverifikasi: ['diproses', 'ditolak'], diproses: ['selesai', 'ditolak'], selesai: [], ditolak: [] };
  var ST_ADUAN = { baru: 'Baru', ditindaklanjuti: 'Ditindaklanjuti', selesai: 'Selesai', ditolak: 'Ditolak' };
  var LANJUT_ADUAN = { baru: ['ditindaklanjuti', 'ditolak'], ditindaklanjuti: ['selesai', 'ditolak'], selesai: [], ditolak: [] };
  var PIN = '246810';

  var JENIS = [
    { id: 'domisili', nama: 'Surat domisili', untuk: 'Bukti tempat tinggal, misalnya untuk melamar kerja atau membuka rekening.',
      syarat: ['Surat pengantar RT/RW', 'Fotokopi KTP', 'Fotokopi Kartu Keluarga'],
      f: [{ k: 'lama', l: 'Lama tinggal di desa (tahun)', t: 'number', req: 1, min: 0, max: 100 },
          { k: 'keperluan', l: 'Keperluan', t: 'select', req: 1, opts: ['Melamar kerja', 'Membuka rekening', 'Administrasi sekolah', 'Lainnya'] }] },
    { id: 'tidak-mampu', nama: 'Surat tidak mampu', untuk: 'Untuk mengajukan keringanan biaya sekolah atau layanan kesehatan.',
      syarat: ['Surat pengantar RT/RW', 'Fotokopi KTP', 'Fotokopi Kartu Keluarga', 'Surat dari sekolah atau rumah sakit, bila diminta'],
      f: [{ k: 'tanggungan', l: 'Jumlah anggota keluarga', t: 'number', req: 1, min: 1, max: 20 },
          { k: 'penghasilan', l: 'Penghasilan keluarga per bulan (Rp)', t: 'number', req: 1, min: 0, max: 100000000 },
          { k: 'keperluan', l: 'Untuk keperluan', t: 'select', req: 1, opts: ['Keringanan biaya sekolah', 'Keringanan biaya kesehatan', 'Bantuan sosial', 'Lainnya'] }] },
    { id: 'usaha', nama: 'Surat usaha', untuk: 'Bukti punya usaha di desa, misalnya untuk mengajukan pinjaman modal.',
      syarat: ['Surat pengantar RT/RW', 'Fotokopi KTP', 'Foto tempat usaha'],
      f: [{ k: 'nama_usaha', l: 'Nama usaha', t: 'text', req: 1, minLen: 3, maxLen: 60 },
          { k: 'jenis_usaha', l: 'Jenis usaha', t: 'select', req: 1, opts: ['Warung atau toko', 'Pertanian', 'Kerajinan', 'Makanan dan minuman', 'Jasa', 'Lainnya'] },
          { k: 'alamat_usaha', l: 'Alamat usaha', t: 'text', req: 1, minLen: 5, maxLen: 120 },
          { k: 'lama_usaha', l: 'Sudah berjalan (tahun)', t: 'number', req: 1, min: 0, max: 80 }] },
    { id: 'akta-lahir', nama: 'Pengantar akta kelahiran', untuk: 'Pengantar dari desa sebelum mengurus akta ke Dinas Dukcapil.',
      syarat: ['Surat keterangan lahir dari bidan atau rumah sakit', 'Fotokopi KTP orang tua', 'Fotokopi Kartu Keluarga', 'Fotokopi buku nikah'],
      f: [{ k: 'nama_bayi', l: 'Nama anak', t: 'text', req: 1, minLen: 2, maxLen: 60 },
          { k: 'tgl_lahir', l: 'Tanggal lahir anak', t: 'date', req: 1, maxToday: 1 },
          { k: 'jk', l: 'Jenis kelamin anak', t: 'select', req: 1, opts: ['Laki-laki', 'Perempuan'] },
          { k: 'nama_ayah', l: 'Nama ayah', t: 'text', req: 1, minLen: 3, maxLen: 60 },
          { k: 'nama_ibu', l: 'Nama ibu', t: 'text', req: 1, minLen: 3, maxLen: 60 }] },
    { id: 'kematian', nama: 'Surat kematian', untuk: 'Dipakai keluarga untuk mengurus administrasi setelah anggota keluarga meninggal.',
      syarat: ['Surat pengantar RT/RW', 'KTP almarhum', 'Fotokopi Kartu Keluarga', 'KTP pelapor'],
      f: [{ k: 'nama_alm', l: 'Nama almarhum/almarhumah', t: 'text', req: 1, minLen: 3, maxLen: 60 },
          { k: 'nik_alm', l: 'NIK almarhum/almarhumah', t: 'text', req: 1, nik: 1, hint: '16 digit angka.' },
          { k: 'tgl_meninggal', l: 'Tanggal meninggal', t: 'date', req: 1, maxToday: 1 },
          { k: 'hubungan', l: 'Hubungan pelapor', t: 'select', req: 1, opts: ['Anak', 'Istri atau suami', 'Orang tua', 'Saudara', 'Lainnya'] }] }
  ];
  var COMMON = [
    { k: 'nama', l: 'Nama pemohon sesuai KTP', t: 'text', req: 1, minLen: 3, maxLen: 60 },
    { k: 'nik', l: 'NIK pemohon', t: 'text', req: 1, nik: 1, hint: '16 digit angka. Contoh: 3299000000000001' },
    { k: 'hp', l: 'Nomor HP atau WhatsApp', t: 'tel', req: 1, hp: 1, hint: 'Contoh: 0812-0000-1234' },
    { k: 'dusun', l: 'Dusun', t: 'select', req: 1, opts: DUSUN },
    { k: 'alamat', l: 'Alamat (jalan, RT/RW)', t: 'text', req: 1, minLen: 5, maxLen: 120 }
  ];
  var ADUAN_F = [
    { k: 'jenis', l: 'Jenis', t: 'select', req: 1, opts: ['Pengaduan', 'Aspirasi'] },
    { k: 'kat', l: 'Kategori', t: 'select', req: 1, opts: KAT_ADUAN },
    { k: 'dusun', l: 'Lokasi (dusun)', t: 'select', req: 1, opts: DUSUN },
    { k: 'judul', l: 'Judul singkat', t: 'text', req: 1, minLen: 8, maxLen: 100 },
    { k: 'isi', l: 'Isi pengaduan atau aspirasi', t: 'textarea', req: 1, minLen: 20, maxLen: 1000, hint: 'Tulis masalahnya, lokasinya, dan sejak kapan. Minimal 20 karakter.' },
    { k: 'nama', l: 'Nama (boleh dikosongkan)', t: 'text', maxLen: 60 },
    { k: 'hp', l: 'Nomor HP (boleh dikosongkan)', t: 'tel', hp: 1, hint: 'Hanya dipakai bila petugas perlu bertanya.' }
  ];

  function jenisById(id) { for (var i = 0; i < JENIS.length; i++) if (JENIS[i].id === id) return JENIS[i]; return null; }
  function labelData(jenis, k) {
    var j = jenisById(jenis), a = j ? j.f.concat(COMMON) : COMMON;
    for (var i = 0; i < a.length; i++) if (a[i].k === k) return a[i].l;
    return k;
  }

  /* ---------- Data awal (deterministik) ---------- */
  function seed() {
    function R(s, at, cat) { return { s: s, at: at, cat: cat || '' }; }
    function S(n, jenis, nama, nik, hp, dusun, alamat, extra, riw) {
      var d = { nama: nama, nik: nik, hp: hp, dusun: dusun, alamat: alamat };
      for (var k in extra) d[k] = extra[k];
      return { id: 'SRT-2611-' + pad(n, 4), jenis: jenis, nik: nik, nama: nama, hp: hp, dusun: dusun, data: d,
        status: riw[riw.length - 1].s, dibuat: riw[0].at, riwayat: riw };
    }
    var surat = [
      S(1, 'domisili', 'Dewi Lestari', '3299000000000001', '0812-0000-1101', 'Krajan', 'Jl. Mawar RT 02 RW 01', { lama: '6', keperluan: 'Membuka rekening' },
        [R('diterima', '2026-11-02T01:20:00Z', 'Pengajuan diterima.'), R('diverifikasi', '2026-11-02T03:05:00Z', 'Berkas lengkap.'), R('diproses', '2026-11-03T02:10:00Z', 'Surat sedang diketik.'),
         R('selesai', '2026-11-03T07:30:00Z', 'Surat sudah dapat diambil di loket pelayanan, jam 08.00 sampai 15.00.')]),
      S(2, 'usaha', 'Hendra Gunawan', '3299000000000002', '0812-0000-1102', 'Sidorejo', 'Jl. Bambu RT 01 RW 03',
        { nama_usaha: 'Warung Kopi Hendra', jenis_usaha: 'Makanan dan minuman', alamat_usaha: 'Depan Pasar Desa', lama_usaha: '2' },
        [R('diterima', '2026-11-04T02:00:00Z', 'Pengajuan diterima.'), R('diverifikasi', '2026-11-05T01:30:00Z', 'Berkas lengkap.'), R('diproses', '2026-11-06T03:00:00Z', 'Menunggu tanda tangan Kepala Desa.')]),
      S(3, 'tidak-mampu', 'Sarmini', '3299000000000003', '0812-0000-1103', 'Karangtengah', 'Jl. Kopi RT 04 RW 02',
        { tanggungan: '5', penghasilan: '900000', keperluan: 'Keringanan biaya sekolah' },
        [R('diterima', '2026-11-06T04:10:00Z', 'Pengajuan diterima.'), R('diverifikasi', '2026-11-07T02:00:00Z', 'Petugas akan mengecek ke RT. Mohon siapkan surat dari sekolah.')]),
      S(4, 'akta-lahir', 'Ayu Rahmawati', '3299000000000004', '0812-0000-1104', 'Tegalsari', 'Jl. Talud RT 03 RW 01',
        { nama_bayi: 'Naufal Pratama', tgl_lahir: '2026-10-28', jk: 'Laki-laki', nama_ayah: 'Eko Pratama', nama_ibu: 'Ayu Rahmawati' },
        [R('diterima', '2026-11-09T01:00:00Z', 'Pengajuan diterima.')]),
      S(5, 'kematian', 'Bambang Supriyadi', '3299000000000005', '0812-0000-1105', 'Sumberan', 'Jl. Sumber RT 02 RW 02',
        { nama_alm: 'Sutrisno', nik_alm: '3299000000000105', tgl_meninggal: '2026-11-05', hubungan: 'Anak' },
        [R('diterima', '2026-11-06T00:30:00Z', 'Pengajuan diterima.'), R('diverifikasi', '2026-11-06T01:15:00Z', 'Berkas lengkap.'), R('diproses', '2026-11-06T02:00:00Z', 'Surat sedang diketik.'),
         R('selesai', '2026-11-06T05:00:00Z', 'Surat siap diambil. Kami turut berduka cita.')]),
      S(6, 'domisili', 'Rudi Hartono', '3299000000000006', '0812-0000-1106', 'Krajan', 'Jl. Melati RT 05 RW 01', { lama: '1', keperluan: 'Melamar kerja' },
        [R('diterima', '2026-11-10T02:20:00Z', 'Pengajuan diterima.'),
         R('ditolak', '2026-11-11T03:00:00Z', 'Alamat tidak sesuai Kartu Keluarga. Silakan ajukan ulang setelah KK diperbarui.')]),
      S(7, 'usaha', 'Ratna Dewi', '3299000000000007', '0812-0000-1107', 'Sidorejo', 'Jl. Anyam RT 02 RW 03',
        { nama_usaha: 'Anyaman Ratna', jenis_usaha: 'Kerajinan', alamat_usaha: 'Rumah sendiri, Dusun Sidorejo', lama_usaha: '4' },
        [R('diterima', '2026-11-12T03:40:00Z', 'Pengajuan diterima.')])
    ];
    function A(n, o, riw) {
      o.id = 'ADU-2611-' + pad(n, 4); o.riwayat = riw; o.status = riw[riw.length - 1].s; o.dibuat = riw[0].at; return o;
    }
    function R2(s, at, cat) { return { s: s, at: at, cat: cat || '' }; }
    var aduan = [
      A(1, { jenis: 'Pengaduan', kat: 'Infrastruktur', dusun: 'Sumberan', nama: 'Yanti', hp: '', judul: 'Lampu jalan mati di pertigaan Sumberan',
        isi: 'Lampu jalan di pertigaan dekat jembatan Sumberan mati sejak dua minggu lalu. Jalan gelap dan rawan untuk anak yang pulang mengaji.' },
        [R2('baru', '2026-11-03T12:00:00Z', 'Pengaduan diterima.'), R2('ditindaklanjuti', '2026-11-05T02:00:00Z', 'Sudah diteruskan ke petugas listrik desa. Penggantian lampu dijadwalkan pekan depan.')]),
      A(2, { jenis: 'Aspirasi', kat: 'Kesehatan', dusun: 'Krajan', nama: '', hp: '', judul: 'Usul senam lansia dua kali seminggu',
        isi: 'Senam lansia di Polindes saat ini hanya hari Jumat. Banyak lansia ingin ikut dua kali seminggu karena terasa bermanfaat.' },
        [R2('baru', '2026-11-08T01:30:00Z', 'Aspirasi diterima.')]),
      A(3, { jenis: 'Pengaduan', kat: 'Kebersihan', dusun: 'Krajan', nama: 'Warga Krajan', hp: '', judul: 'Sampah menumpuk di dekat jembatan Krajan',
        isi: 'Tumpukan sampah di tepi sungai dekat jembatan Krajan mulai berbau dan menarik lalat. Mohon dibersihkan.' },
        [R2('baru', '2026-11-01T03:00:00Z', 'Pengaduan diterima.'), R2('ditindaklanjuti', '2026-11-02T02:00:00Z', 'Petugas kebersihan akan datang Sabtu.'),
         R2('selesai', '2026-11-07T04:00:00Z', 'Sampah sudah diangkut bersama kerja bakti. Mohon warga tidak membuang sampah di lokasi ini lagi.')]),
      A(4, { jenis: 'Pengaduan', kat: 'Layanan desa', dusun: 'Tegalsari', nama: 'Dedi', hp: '', judul: 'Antrean loket terlalu lama pada hari Senin',
        isi: 'Pada hari Senin pagi antrean di loket pelayanan bisa lebih dari satu jam karena hanya satu petugas yang melayani.' },
        [R2('baru', '2026-11-10T01:00:00Z', 'Pengaduan diterima.')])
    ];
    var P = function (id, judul, kat, tgl, waktu, lokasi, isi) { return { id: id, judul: judul, kat: kat, tgl: tgl, waktu: waktu, lokasi: lokasi, isi: isi, terbit: true }; };
    var pengumuman = [
      P('p1', 'Posyandu balita', 'Kesehatan', '2026-11-10', '08.00', 'Posyandu Melati, Dusun Krajan', 'Bawa buku KIA. Tempat di Posyandu Melati, Dusun Krajan.\n\nPenimbangan, pengukuran tinggi badan, dan imunisasi dasar gratis. Balita yang belum lengkap imunisasinya diharapkan hadir.'),
      P('p2', 'Kerja bakti saluran air', 'Lingkungan', '2026-11-15', '07.00', 'Saluran irigasi Dusun Krajan', 'Setiap rumah diminta mengirim satu orang dan membawa cangkul atau sapu lidi.\n\nBerkumpul di ujung saluran pukul 07.00. Minuman disediakan oleh kelompok PKK.'),
      P('p3', 'Pembagian jadwal air sawah', 'Pertanian', '2026-11-18', '19.30', 'Balai desa', 'Ketua kelompok tani hadir di balai desa untuk menyepakati giliran air.\n\nPetani yang tidak bisa hadir dapat menitipkan usulan lewat ketua kelompok.'),
      P('p4', 'Penyaluran BLT Dana Desa tahap IV', 'Bantuan', '2026-11-21', '09.00', 'Balai desa', 'Penerima membawa KTP asli dan Kartu Keluarga ke balai desa.\n\nDaftar penerima ditempel di papan pengumuman balai desa. Bila berhalangan, penerima dapat mewakilkan dengan surat kuasa bermeterai.'),
      P('p5', 'Cek tekanan darah dan gula untuk lansia', 'Kesehatan', '2026-11-25', '08.30', 'Polindes Wanasari', 'Gratis untuk warga usia 60 tahun ke atas, di Polindes Wanasari.\n\nBawa KTP dan buku kontrol bila ada.'),
      P('p6', 'Pengambilan sampah pilah', 'Lingkungan', '2026-11-07', '06.30', 'Depan rumah warga', 'Setiap Sabtu, pukul 06.30. Pisahkan sampah plastik dan kertas, lalu letakkan di depan rumah.\n\nSampah organik diolah sendiri menjadi kompos atau dibawa ke bank sampah.'),
      P('p7', 'Vaksinasi hewan ternak', 'Pertanian', '2026-10-27', '08.00', 'Lima dusun', 'Sebanyak 184 ekor kambing dan sapi sudah divaksin di lima dusun.\n\nPetugas peternakan akan datang lagi bila ada ternak yang belum terdata. Hubungi kepala dusun.'),
      P('p8', 'Perbaikan jembatan Sumberan', 'Lingkungan', '2026-10-19', '07.00', 'Jembatan Sumberan', 'Jembatan kembali dibuka untuk motor. Mobil masih lewat jalur Tegalsari.'),
      P('p9', 'Pendaftaran pelatihan menjahit', 'Bantuan', '2026-10-12', '09.00', 'Balai desa', 'Sebanyak 24 peserta terdaftar, dan kelas dimulai pada Desember.'),
      P('p10', 'BLT Dana Desa tahap III', 'Bantuan', '2026-10-03', '09.00', 'Balai desa', 'Sudah diterima oleh 28 keluarga. Daftar penerima bisa dilihat di balai desa.'),
      P('p11', 'Lowongan petugas kebersihan balai desa', 'Lowongan', '2026-11-12', '08.00', 'Kantor desa', 'Dibuka satu lowongan petugas kebersihan balai desa, kerja paruh waktu enam hari seminggu.\n\nPelamar adalah warga Wanasari berusia 20 sampai 50 tahun. Serahkan surat lamaran singkat dan fotokopi KTP ke kantor desa sebelum 30 November 2026.')
    ];
    var K = function (id, judul, kat, tgl, ringkas, isi, foto) { return { id: id, judul: judul, kat: kat, tgl: tgl, ringkas: ringkas, isi: isi, foto: foto, penulis: 'Tim Informasi Desa', terbit: true }; };
    var kabar = [
      K('k1', 'Kelompok tani mulai menjual kopi robusta dengan merek sendiri', 'Ekonomi', '2026-10-28',
        'Selama ini kopi Wanasari dijual gelondongan ke pengepul. Lewat rumah sangrai milik BUMDes, 32 petani kini mengemas dan menjual kopi mereka sendiri.',
        'Pak Sutris masih ingat harga kopinya tahun lalu. Satu kilogram gelondong merah dibeli pengepul seharga Rp 9.000, dan ia tidak pernah tahu ke mana kopi itu dijual setelahnya.\n\nPada Oktober 2025, musyawarah desa setuju memakai sebagian modal BUMDes untuk membeli mesin sangrai kecil. Tiga puluh dua petani lalu belajar memetik buah yang benar-benar merah, menjemur di para-para, dan mencatat setiap kiriman.\n\n"Dulu saya hanya tahu harga. Sekarang saya tahu rasa kopi saya sendiri," kata Pak Sutris, petani kopi Dusun Karangtengah.\n\nHasilnya belum besar, tetapi jelas terasa. Dalam setahun, rumah sangrai mengemas 1,8 ton kopi. Petani menerima rata-rata Rp 14.500 per kilogram gelondong, atau 60 persen lebih tinggi dari harga pengepul.\n\nTantangan berikutnya adalah menjaga mutu saat panen raya, ketika buah datang bersamaan. BUMDes berencana menambah dua rak jemur dan melatih enam anak muda sebagai penyangrai pada tahun depan.', 'kopi'),
      K('k2', 'Posyandu Melati kini punya timbangan digital', 'Kesehatan', '2026-10-14',
        'Bantuan dari Dana Desa ini membuat pencatatan tumbuh kembang balita lebih cepat.',
        'Posyandu Melati di Dusun Krajan menerima timbangan digital dan alat ukur tinggi badan baru dari Dana Desa.\n\nSebelumnya kader menulis berat badan balita di kertas, lalu memindahkannya ke buku KIA. Sekarang hasil timbang langsung terbaca dan lebih akurat.\n\nPosyandu buka setiap Selasa minggu kedua, pukul 08.00. Warga yang punya balita diajak datang rutin.', 'posyandu'),
      K('k3', 'Perajin bambu Dusun Sidorejo mendapat pesanan dari kota', 'Ekonomi', '2026-09-30',
        'Sebanyak 400 besek dikirim untuk sebuah usaha katering di Kota Sukamaju.',
        'Perajin bambu Dusun Sidorejo menyelesaikan pesanan 400 besek untuk sebuah usaha katering di Kota Sukamaju.\n\nPekerjaan dibagi kepada 18 perajin dan selesai dalam dua minggu. Pesanan masuk lewat kios BUMDes.\n\nBesek bisa dipesan juga oleh warga lewat halaman Produk di situs ini.', 'bambu'),
      K('k4', 'Karang taruna membuka perpustakaan keliling', 'Pendidikan', '2026-10-21',
        'Dua kali sepekan, memakai motor roda tiga.',
        'Karang taruna Wanasari membuka perpustakaan keliling yang singgah di lima dusun dua kali sepekan, memakai motor roda tiga.\n\nKoleksi awal sekitar 300 buku sumbangan warga, kebanyakan buku anak dan buku pertanian. Pinjam gratis dengan menitipkan nama di buku catatan.', ''),
      K('k5', 'Panen padi Krajan naik 8 persen', 'Pertanian', '2026-10-17',
        'Berkat perbaikan saluran irigasi.',
        'Panen padi di Dusun Krajan musim ini naik 8 persen dibanding musim sebelumnya.\n\nKelompok tani menilai kenaikan datang dari saluran irigasi yang diperbaiki tahun lalu, sehingga air sampai ke petak paling ujung.', 'padi'),
      K('k6', 'Bank sampah melewati 2 ton', 'Lingkungan', '2026-10-09',
        'Hasilnya masuk ke tabungan 96 keluarga.',
        'Bank sampah di samping balai desa sudah menampung lebih dari dua ton sampah pilah sejak dibuka.\n\nHasil penjualan masuk ke tabungan 96 keluarga yang menjadi nasabah. Bank sampah buka setiap Sabtu pukul 08.00.', 'gotong'),
      K('k7', 'Tim voli putri juara kecamatan', 'Olahraga', '2026-10-04',
        'Mengalahkan Desa Mekarjati 3-1.',
        'Tim voli putri Wanasari menjadi juara turnamen tingkat kecamatan setelah mengalahkan Desa Mekarjati 3-1 di final.\n\nPemain berlatih dua kali seminggu di Lapangan Wanasari.', ''),
      K('k8', 'Pelatihan tanggap bencana', 'Sosial', '2026-09-26',
        '40 relawan belajar evakuasi dan P3K.',
        'Empat puluh relawan dari lima dusun mengikuti pelatihan tanggap bencana. Materinya meliputi evakuasi, pertolongan pertama, dan pemakaian peralatan sederhana.\n\nPeserta akan menjadi tim siaga di dusun masing-masing.', ''),
      K('k9', 'SD Wanasari punya kebun sekolah', 'Pendidikan', '2026-09-18',
        'Hasil sayur dipakai untuk makan bersama.',
        'Murid SD Wanasari menanam sayur di kebun sekolah bersama guru dan orang tua. Hasil panen pertama dipakai untuk makan bersama di sekolah.', '')
    ];
    var Pr = function (id, nama, kat, harga, satuan, penjual, wa, desk, foto) { return { id: id, nama: nama, kat: kat, harga: harga, satuan: satuan, penjual: penjual, wa: wa, desk: desk, foto: foto, tersedia: true }; };
    var produk = [
      Pr('b1', 'Kopi robusta biji', 'Kopi', 45000, '200 gram', 'Rumah sangrai BUMDes', '0812-0000-7101', 'Disangrai di desa, biji utuh siap digiling.', 'kopi'),
      Pr('b2', 'Kopi robusta bubuk', 'Kopi', 45000, '200 gram', 'Rumah sangrai BUMDes', '0812-0000-7101', 'Disangrai dan digiling di desa.', 'kopi'),
      Pr('b3', 'Kopi robusta biji kemasan besar', 'Kopi', 195000, '1 kilogram', 'Rumah sangrai BUMDes', '0812-0000-7101', 'Untuk warung kopi atau hajatan.', 'kopi'),
      Pr('b4', 'Besek bambu', 'Kerajinan', 12000, 'isi 10 buah', 'Bu Karti, Sidorejo', '0812-0000-7202', 'Wadah nasi dan kue dari anyaman bambu.', 'bambu'),
      Pr('b5', 'Tampah bambu', 'Kerajinan', 28000, 'diameter 50 cm', 'Bu Karti, Sidorejo', '0812-0000-7202', 'Untuk menjemur atau menampi.', 'bambu'),
      Pr('b6', 'Caping', 'Kerajinan', 25000, 'satu ukuran', 'Bu Karti, Sidorejo', '0812-0000-7202', 'Topi petani dari anyaman bambu.', 'bambu'),
      Pr('b7', 'Jajan pasar', 'Makanan', 2500, 'per potong (min. 20)', 'PKK Dusun Krajan', '0812-0000-7303', 'Pesan minimal sehari sebelumnya untuk hajatan atau rapat.', 'jajan'),
      Pr('b8', 'Beras pandan wangi', 'Pertanian', 80000, '5 kilogram', 'Kelompok tani Krajan', '0812-0000-7404', 'Dari sawah Dusun Krajan, digiling setelah dipesan.', 'padi')
    ];
    var anggaran = []; var n = 0;
    function G(tahun, jenis, uraian, a, r) { n++; anggaran.push({ id: 'g' + n, tahun: tahun, jenis: jenis, uraian: uraian, anggaran: a, realisasi: r }); }
    var BEL = ['Pembangunan desa', 'Penyelenggaraan pemerintahan', 'Pemberdayaan masyarakat', 'Bencana dan keadaan darurat', 'Pembinaan masyarakat'];
    var PEN = ['Dana Desa', 'Alokasi Dana Desa', 'Pendapatan asli desa'];
    // 2024
    [512000000, 340800000, 170200000, 98500000, 93800000].forEach(function (v, i) { G(2024, 'Belanja', BEL[i], v, [508000000, 338500000, 168000000, 41200000, 92900000][i]); });
    [850000000, 316800000, 48500000].forEach(function (v, i) { G(2024, 'Pendapatan', PEN[i], v, [850000000, 316800000, 52100000][i]); });
    // 2025
    [587200000, 371500000, 192400000, 110000000, 87800000].forEach(function (v, i) { G(2025, 'Belanja', BEL[i], v, [583900000, 369000000, 188700000, 52300000, 86100000][i]); });
    [940000000, 347900000, 61000000].forEach(function (v, i) { G(2025, 'Pendapatan', PEN[i], v, [940000000, 347900000, 63400000][i]); });
    // 2026 (realisasi sampai September)
    [638500000, 412300000, 214100000, 121000000, 96750000].forEach(function (v, i) { G(2026, 'Belanja', BEL[i], v, [452000000, 318500000, 158000000, 62000000, 71000000][i]); });
    [1021400000, 386250000, 75000000].forEach(function (v, i) { G(2026, 'Pendapatan', PEN[i], v, [760000000, 290000000, 56000000][i]); });
    return { v: 1, seq: { srt: 7, adu: 4 }, surat: surat, aduan: aduan, pengumuman: pengumuman, kabar: kabar, produk: produk, anggaran: anggaran };
  }

  /* ---------- Penyimpanan ---------- */
  function get() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = memo; }
    if (raw == null) raw = memo;
    if (raw) { try { var d = JSON.parse(raw); if (d && d.v === 1 && d.surat) return d; } catch (e) {} }
    var s = seed(); save(s); return s;
  }
  function save(d) {
    var j = JSON.stringify(d); memo = j;
    try { localStorage.setItem(KEY, j); } catch (e) {}
  }
  function reset() { memo = null; try { localStorage.removeItem(KEY); } catch (e) {} var s = seed(); save(s); return s; }
  function newId(prefix, list) {
    var max = 0; list.forEach(function (x) { var m = String(x.id).match(/\d+$/); if (m) max = Math.max(max, +m[0]); });
    return prefix + (max + 1);
  }
  function nomorTiket(d, tipe) {
    var k = tipe === 'srt' ? 'srt' : 'adu';
    d.seq[k] = (d.seq[k] || 0) + 1;
    var t = new Date();
    return (k === 'srt' ? 'SRT-' : 'ADU-') + pad(t.getFullYear() % 100, 2) + pad(t.getMonth() + 1, 2) + '-' + pad(d.seq[k], 4);
  }

  /* ---------- Form generik ---------- */
  function fieldHTML(f, val, idp) {
    idp = idp || 'f_'; var id = idp + f.k, v = val == null ? '' : val, h = '';
    var lab = esc(f.l) + (f.req ? ' <span class="req" aria-hidden="true">*</span>' : '');
    var desc = id + '_e' + (f.hint ? ' ' + id + '_h' : '');
    if (f.t === 'checkbox') {
      return '<div class="fg"><label style="display:flex;gap:10px;align-items:center;min-height:44px;font-weight:600"><input type="checkbox" id="' + id + '" data-k="' + esc(f.k) + '"' + (v ? ' checked' : '') + ' style="width:22px;height:22px;flex:none"> ' + esc(f.l) + '</label></div>';
    }
    h += '<div class="fg"><label for="' + id + '">' + lab + '</label>';
    var attrs = ' id="' + id + '" data-k="' + esc(f.k) + '" aria-describedby="' + desc + '"' + (f.req ? ' aria-required="true"' : '');
    if (f.t === 'select') {
      h += '<select' + attrs + '><option value="">' + esc(f.kosong || 'Pilih...') + '</option>' + f.opts.map(function (o) { return '<option' + (String(v) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    } else if (f.t === 'textarea') {
      h += '<textarea' + attrs + (f.maxLen ? ' maxlength="' + f.maxLen + '"' : '') + '>' + esc(v) + '</textarea>';
    } else {
      var type = f.t === 'tel' ? 'tel' : (f.t === 'number' ? 'number' : (f.t === 'date' ? 'date' : 'text'));
      h += '<input type="' + type + '"' + attrs + ' value="' + esc(v) + '"' + (f.nik ? ' inputmode="numeric" maxlength="16" autocomplete="off"' : '') + (f.t === 'number' ? ' inputmode="numeric"' + (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') : '') + (f.t === 'date' && f.maxToday ? ' max="' + todayISO() + '"' : '') + (f.maxLen ? ' maxlength="' + f.maxLen + '"' : '') + '>';
    }
    if (f.hint) h += '<p class="bantu" id="' + id + '_h">' + esc(f.hint) + '</p>';
    return h + '<p class="pesan" id="' + id + '_e" role="alert"></p></div>';
  }
  function checkField(f, v) {
    v = String(v == null ? '' : v).trim();
    if (!v) return f.req ? 'Wajib diisi.' : '';
    if (f.nik && !/^\d{16}$/.test(v)) return 'NIK harus 16 digit angka (sekarang ' + v.length + ' karakter).';
    if (f.hp) { var d = v.replace(/[\s-]/g, ''); if (!/^(08|\+628|628)\d{7,11}$/.test(d)) return 'Nomor HP tidak valid. Contoh: 0812-0000-1234.'; }
    if (f.t === 'number') {
      if (f.int && !/^\d+$/.test(v)) return 'Isi bilangan bulat tanpa titik atau koma.';
      var n = Number(v);
      if (!isFinite(n)) return 'Isi dengan angka.';
      if (f.min != null && n < f.min) return 'Minimal ' + f.min + '.';
      if (f.max != null && n > f.max) return 'Maksimal ' + f.max + '.';
    }
    if (f.t === 'date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v))) return 'Tanggal tidak valid.';
      if (f.maxToday && v > todayISO()) return 'Tanggal tidak boleh di masa depan.';
    }
    if (f.t === 'select' && f.opts.indexOf(v) < 0) return 'Pilih salah satu.';
    if (f.minLen && v.length < f.minLen) return 'Minimal ' + f.minLen + ' karakter.';
    if (f.maxLen && v.length > f.maxLen) return 'Maksimal ' + f.maxLen + ' karakter.';
    return '';
  }
  function readForm(fields, root, idp) {
    idp = idp || 'f_'; var o = {};
    fields.forEach(function (f) {
      var el = $('#' + idp + f.k, root); if (!el) return;
      o[f.k] = f.t === 'checkbox' ? el.checked : (el.value || '').trim();
    });
    return o;
  }
  function validate(fields, vals, root, idp) {
    idp = idp || 'f_'; var first = null, n = 0;
    fields.forEach(function (f) {
      if (f.t === 'checkbox') return;
      var m = checkField(f, vals[f.k]), el = $('#' + idp + f.k, root), p = $('#' + idp + f.k + '_e', root);
      if (p) p.textContent = m;
      if (el) { if (m) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
      if (m) { n++; if (!first) first = el; }
    });
    if (first) first.focus();
    return n === 0;
  }
  function clearOnInput(root) {
    root.addEventListener('input', function (e) {
      var el = e.target; if (!el.getAttribute || !el.getAttribute('aria-invalid')) return;
      el.removeAttribute('aria-invalid');
      var p = document.getElementById(el.id + '_e'); if (p) p.textContent = '';
    });
  }

  /* ---------- Komponen tampilan ---------- */
  function badge(st, map) { return '<span class="st ' + esc(st) + '">' + esc(map[st] || st) + '</span>'; }
  function timeline(riw, map) {
    return '<ol class="x-w">' + riw.map(function (r, i) {
      return '<li><b>' + esc(map[r.s] || r.s) + '</b><small>' + esc(tglJam(r.at)) + '</small>' + (r.cat ? '<p>' + esc(r.cat) + '</p>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function fotoHTML(key, alt, lebar, tinggi) {
    var f = FOTO[key];
    if (!f) return '';
    return '<img loading="lazy" src="' + esc(f[0]) + '" alt="' + esc(alt || f[1]) + '"' + (lebar ? ' width="' + lebar + '" height="' + tinggi + '"' : '') + '>';
  }
  function bagikanBar(judul, url) {
    return '<div class="aksi noprint">' +
      '<a class="btn kecil" id="bgWa" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(judul + '\n' + url) + '">Bagikan ke WhatsApp</a>' +
      '<button type="button" class="btn sek kecil" id="bgSalin">Salin tautan</button>' +
      '<button type="button" class="btn sek kecil" id="bgCetak">Cetak</button></div>';
  }
  function pasangBagikan(url) {
    var s = $('#bgSalin'), c = $('#bgCetak');
    if (s) s.addEventListener('click', function () { salin(url); });
    if (c) c.addEventListener('click', function () { window.print(); });
  }
  function queryId() {
    var m = location.search.match(/[?&]id=([^&]+)/);
    if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
    var h = location.hash.replace(/^#/, ''); return h || '';
  }
  function bagiUrl(id) { return location.origin.replace('null', '') + location.pathname + '?id=' + encodeURIComponent(id); }
  function urut(a, b) { return a.tgl < b.tgl ? 1 : (a.tgl > b.tgl ? -1 : 0); }

  /* ---------- Menu "Lainnya" (ponsel) ---------- */
  function menuLainnya() {
    var tL = $('#tLainnya'), mL = $('#lainnya'); if (!tL || !mL) return;
    function atur(b) { mL.hidden = !b; tL.setAttribute('aria-expanded', b); }
    tL.addEventListener('click', function () { atur(mL.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mL.hidden) { atur(false); tL.focus(); } });
    document.addEventListener('click', function (e) { if (!mL.hidden && !mL.contains(e.target) && e.target !== tL) atur(false); });
  }

  /* ---------- Halaman ---------- */
  var pages = {};

  pages.index = function () {
    var d = get();
    var pg = d.pengumuman.filter(function (p) { return p.terbit; }).sort(urut).slice(0, 3);
    $('#idxPeng').innerHTML = pg.length ? pg.map(function (p) {
      return '<li><a class="judul" href="pengumuman.html?id=' + encodeURIComponent(p.id) + '" style="text-decoration:none"><h3>' + esc(p.judul) + '</h3></a><p class="kapan">' + esc(tgl(p.tgl)) + (p.waktu ? ', pukul ' + esc(p.waktu) : '') + '</p><p>' + esc(p.isi.split(/\n\s*\n/)[0]) + '</p></li>';
    }).join('') : '<li><p>Belum ada pengumuman.</p></li>';
    var k = d.kabar.filter(function (x) { return x.terbit; }).sort(urut)[0];
    $('#idxKabar').innerHTML = k ? (k.foto ? fotoHTML(k.foto, k.judul, 960, 663) : '<div class="foto-kosong" aria-hidden="true">' + esc(k.kat) + '</div>') +
      '<div><time datetime="' + esc(k.tgl) + '">' + esc(tgl(k.tgl)) + '</time><h3>' + esc(k.judul) + '</h3><p>' + esc(k.ringkas) + '</p><a class="tautan" href="kabar.html?id=' + encodeURIComponent(k.id) + '">Baca selengkapnya</a></div>' :
      '<p class="kosong">Belum ada kabar.</p>';
  };

  pages.layanan = function () {
    var aktif = 0, draft = {}, terakhir = null;
    var pil = $('#pilihan'), form = $('#formSurat'), hasil = $('#hasilSurat');
    pil.innerHTML = JENIS.map(function (j, i) { return '<button type="button" data-i="' + i + '" aria-pressed="false">' + esc(j.nama) + '</button>'; }).join('');
    pil.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      simpanDraft(); aktif = +b.dataset.i; hasil.hidden = true; form.hidden = false; $('#kepalaSurat').hidden = false; gambar();
    });
    function simpanDraft() { COMMON.forEach(function (f) { var el = $('#f_' + f.k, form); if (el) draft[f.k] = el.value; }); }
    function gambar() {
      var j = JENIS[aktif];
      $$('button', pil).forEach(function (b, i) { b.setAttribute('aria-pressed', i === aktif); });
      $('#namaSurat').textContent = j.nama; $('#untukSurat').textContent = j.untuk;
      var h = '<fieldset class="fgrup" style="border:0;margin:0;padding:0;min-width:0"><legend style="font-weight:600;margin-bottom:6px">Berkas yang akan dibawa ke kantor desa <span class="req" aria-hidden="true">*</span></legend>' +
        '<div class="batang" aria-hidden="true"><i id="batang"></i></div><p class="kemajuan" id="kemajuan" aria-live="polite"></p><ul class="cek-syarat" id="syarat">' +
        j.syarat.map(function (s, i) { return '<li><label><input type="checkbox" data-s="' + i + '"><span>' + esc(s) + '</span></label></li>'; }).join('') + '</ul><p class="pesan" id="syarat_e" role="alert" style="color:#b42318;font-size:.875rem;font-weight:600"></p></fieldset>';
      h += '<div class="dua-kolom">' + COMMON.map(function (f) { return fieldHTML(f, draft[f.k]); }).join('') + '</div>';
      h += '<div class="dua-kolom">' + j.f.map(function (f) { return fieldHTML(f, ''); }).join('') + '</div>';
      h += '<div class="aksi"><button type="submit" class="btn">Kirim pengajuan</button></div><p class="catatan">Layanan surat di kantor desa tidak dipungut biaya. Berkas asli dibawa saat mengambil surat.</p>';
      form.innerHTML = h; kemajuan();
    }
    function kemajuan() {
      var cs = $$('#syarat input', form), n = cs.filter(function (c) { return c.checked; }).length;
      $('#batang').style.width = (n / cs.length * 100) + '%';
      $('#kemajuan').textContent = n === cs.length ? 'Semua berkas siap. Bawa ke kantor desa pada jam layanan.' : n + ' dari ' + cs.length + ' berkas sudah siap';
    }
    form.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.s != null) { kemajuan(); $('#syarat_e').textContent = ''; } });
    clearOnInput(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var j = JENIS[aktif], fields = COMMON.concat(j.f), vals = readForm(fields, form);
      var ok = validate(fields, vals, form);
      var cs = $$('#syarat input', form), semua = cs.every(function (c) { return c.checked; });
      if (!semua) { $('#syarat_e').textContent = 'Centang semua berkas untuk memastikan Anda sudah menyiapkannya.'; if (ok) cs.filter(function (c) { return !c.checked; })[0].focus(); ok = false; }
      if (!ok) { toast('Ada isian yang belum benar. Periksa pesan merah.'); return; }
      var d = get(), id = nomorTiket(d, 'srt'), now = nowISO();
      var t = { id: id, jenis: j.id, nik: vals.nik, nama: vals.nama, hp: vals.hp, dusun: vals.dusun, data: vals, status: 'diterima', dibuat: now,
        riwayat: [{ s: 'diterima', at: now, cat: 'Pengajuan diterima. Petugas akan memeriksa berkas.' }] };
      d.surat.push(t); save(d); terakhir = t; draft = {};
      form.hidden = true; $('#kepalaSurat').hidden = true;
      hasil.hidden = false;
      hasil.innerHTML = '<div class="tiket" tabindex="-1" id="kartuTiket"><p>Pengajuan terkirim. Simpan nomor tiket Anda.</p><p class="no" id="noTiket">' + esc(id) + '</p>' +
        '<p>' + esc(j.nama) + ' atas nama ' + esc(vals.nama) + '. Cek status dengan nomor tiket dan NIK Anda.</p>' +
        '<div class="aksi"><button type="button" class="btn" id="aCek">Cek status tiket</button><button type="button" class="btn sek" id="aSalin">Salin nomor</button>' +
        '<button type="button" class="btn sek" id="aCetak">Cetak bukti</button><button type="button" class="btn sek" id="aBaru">Ajukan surat lain</button></div></div>';
      $('#kartuTiket').focus(); toast('Pengajuan terkirim: ' + id);
    });
    hasil.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !terakhir) return;
      if (b.id === 'aSalin') salin(terakhir.id);
      if (b.id === 'aBaru') { hasil.hidden = true; form.hidden = false; $('#kepalaSurat').hidden = false; gambar(); }
      if (b.id === 'aCek') { $('#c_no').value = terakhir.id; $('#c_nik').value = terakhir.nik; tab('cek'); $('#formCek').requestSubmit(); }
      if (b.id === 'aCetak') cetakHTML(buktiHTML(terakhir));
    });
    function buktiHTML(t) {
      var j = jenisById(t.jenis);
      return '<h2>Pemerintah Desa Wanasari</h2><p>Bukti pengajuan surat (data contoh)</p><p style="font-size:28px;font-weight:800;margin:12px 0">' + esc(t.id) + '</p>' +
        '<dl class="rinci"><div><dt>Jenis surat</dt><dd>' + esc(j ? j.nama : t.jenis) + '</dd></div><div><dt>Pemohon</dt><dd>' + esc(t.nama) + '</dd></div><div><dt>Diajukan</dt><dd>' + esc(tglJam(t.dibuat)) + '</dd></div><div><dt>Status</dt><dd>' + esc(ST_SURAT[t.status]) + '</dd></div></dl>' +
        '<p style="margin-top:16px">Cek status di halaman Layanan dengan nomor tiket dan NIK. Bawa berkas asli ke kantor desa, Senin sampai Jumat, 08.00 sampai 15.00.</p>';
    }
    // Cek status
    var fc = $('#formCek'), hc = $('#hasilCek');
    clearOnInput(fc);
    fc.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = [{ k: 'no', l: 'Nomor tiket', req: 1, t: 'text' }, { k: 'nik', l: 'NIK', req: 1, t: 'text', nik: 1 }];
      var vals = readForm(f, fc, 'c_'); vals.no = vals.no.toUpperCase();
      if (!validate(f, vals, fc, 'c_')) { hc.innerHTML = ''; return; }
      var d = get(), t = null;
      d.surat.forEach(function (x) { if (x.id === vals.no && x.nik === vals.nik) t = x; });
      if (!t) {
        var adu = /^ADU-/.test(vals.no);
        hc.innerHTML = '<p class="kosong" role="alert">' + (adu ? 'Nomor ini adalah tiket pengaduan. Lacak di halaman <a href="kontak.html#lacak">Kontak</a>.' : 'Nomor tiket dan NIK tidak cocok. Periksa lagi, lalu coba sekali lagi.') + '</p>';
        return;
      }
      var j = jenisById(t.jenis);
      var akhir = t.riwayat[t.riwayat.length - 1];
      var info = { diterima: 'Pengajuan sudah masuk. Tunggu pemeriksaan berkas.', diverifikasi: 'Berkas sedang diperiksa petugas.', diproses: 'Surat sedang diketik atau menunggu tanda tangan.', selesai: 'Surat siap diambil di loket pelayanan. Bawa KTP asli dan berkas yang disebutkan.', ditolak: 'Pengajuan ditolak. Baca catatan petugas, lalu ajukan ulang bila perlu.' };
      var rinci = Object.keys(t.data).filter(function (k) { return k !== 'nama' && k !== 'nik' && k !== 'hp'; }).map(function (k) {
        var v = t.data[k]; if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = tgl(v);
        return '<div><dt>' + esc(labelData(t.jenis, k)) + '</dt><dd>' + esc(v) + '</dd></div>';
      }).join('');
      hc.innerHTML = '<div class="tiket"><p>Tiket ' + badge(t.status, ST_SURAT) + '</p><p class="no">' + esc(t.id) + '</p><p>' + esc(info[t.status]) + '</p>' +
        '<dl class="rinci"><div><dt>Jenis surat</dt><dd>' + esc(j ? j.nama : t.jenis) + '</dd></div><div><dt>Pemohon</dt><dd>' + esc(t.nama) + '</dd></div><div><dt>Diajukan</dt><dd>' + esc(tglJam(t.dibuat)) + '</dd></div>' + rinci + '</dl></div>' +
        '<h3 style="margin-top:28px">Riwayat status</h3>' + timeline(t.riwayat, ST_SURAT) +
        '<div class="aksi"><button type="button" class="btn sek" id="cCetak">Cetak</button></div>';
      $('#cCetak').addEventListener('click', function () { cetakHTML(buktiHTML(t) + '<h3>Riwayat</h3>' + timeline(t.riwayat, ST_SURAT)); });
    });
    // Tab
    function tab(nama) {
      var cek = nama === 'cek';
      $('#tabAjukan').setAttribute('aria-selected', !cek); $('#tabCek').setAttribute('aria-selected', cek);
      $('#pAjukan').hidden = cek; $('#pCek').hidden = !cek;
      if (history.replaceState) history.replaceState(null, '', '#' + (cek ? 'cek' : 'ajukan'));
    }
    $('#tabAjukan').addEventListener('click', function () { tab('ajukan'); });
    $('#tabCek').addEventListener('click', function () { tab('cek'); });
    var q = location.search.match(/[?&]no=([^&]+)/);
    if (q) $('#c_no').value = decodeURIComponent(q[1]);
    gambar();
    if (location.hash === '#cek' || q) tab('cek');
  };

  pages.pengumuman = function () {
    var d = get(), st = { q: '', k: 'semua', n: 6 };
    var daftar = d.pengumuman.filter(function (p) { return p.terbit; }).sort(urut);
    var id = queryId(), cur = null;
    daftar.forEach(function (p) { if (p.id === id) cur = p; });
    if (id && !cur) { $('#viewList').hidden = true; $('#viewDetail').hidden = false; $('#detailIsi').innerHTML = '<p class="kosong" role="alert">Pengumuman tidak ditemukan atau sudah dicabut.</p>'; return; }
    if (cur) {
      $('#viewList').hidden = true; $('#viewDetail').hidden = false;
      document.title = cur.judul + ' | Desa Wanasari';
      var url = bagiUrl(cur.id);
      $('#detailIsi').innerHTML = '<p class="cetak-saja"><b>Pemerintah Desa Wanasari</b></p><span class="kat">' + esc(cur.kat) + '</span><h1>' + esc(cur.judul) + '</h1>' +
        '<div class="meta"><span>' + esc(tgl(cur.tgl)) + (cur.waktu ? ', pukul ' + esc(cur.waktu) : '') + '</span>' + (cur.lokasi ? '<span>Tempat: ' + esc(cur.lokasi) + '</span>' : '') + '</div>' +
        '<div class="isi">' + paragraf(cur.isi) + '</div>' + bagikanBar(cur.judul, url);
      pasangBagikan(url);
      return;
    }
    var chips = $('#saring');
    chips.innerHTML = ['semua'].concat(KAT_PENG).map(function (k) { return '<button type="button" data-k="' + esc(k) + '" aria-pressed="' + (k === 'semua') + '">' + (k === 'semua' ? 'Semua' : esc(k)) + '</button>'; }).join('');
    function gambar() {
      $$('button', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === st.k); });
      var q = st.q.toLowerCase();
      var h = daftar.filter(function (p) { return (st.k === 'semua' || p.kat === st.k) && (!q || (p.judul + ' ' + p.isi + ' ' + p.lokasi + ' ' + p.kat).toLowerCase().indexOf(q) >= 0); });
      $('#jumlah').textContent = h.length + ' pengumuman';
      $('#daftar').innerHTML = h.slice(0, st.n).map(function (p) {
        return '<li><a class="judul" href="pengumuman.html?id=' + encodeURIComponent(p.id) + '"><span class="kat">' + esc(p.kat) + '</span><h3 style="margin-top:6px">' + esc(p.judul) + '</h3></a><p class="kapan">' + esc(tgl(p.tgl)) + (p.waktu ? ', pukul ' + esc(p.waktu) : '') + '</p><p>' + esc(p.isi.split(/\n\s*\n/)[0]) + '</p></li>';
      }).join('');
      $('#kosong').hidden = h.length > 0;
      $('#lagi').hidden = h.length <= st.n;
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.k = b.dataset.k; st.n = 6; gambar(); });
    $('#cari').addEventListener('input', function () { st.q = this.value.trim(); st.n = 6; gambar(); });
    $('#lagi').addEventListener('click', function () { st.n += 6; gambar(); });
    gambar();
  };

  pages.kabar = function () {
    var d = get(), st = { q: '', k: 'semua', n: 6 };
    var daftar = d.kabar.filter(function (p) { return p.terbit; }).sort(urut);
    var id = queryId(), cur = null;
    daftar.forEach(function (p) { if (p.id === id) cur = p; });
    if (id && !cur) { $('#viewList').hidden = true; $('#viewDetail').hidden = false; $('#detailIsi').innerHTML = '<p class="kosong" role="alert">Kabar tidak ditemukan atau sudah dicabut.</p>'; return; }
    if (cur) {
      $('#viewList').hidden = true; $('#viewDetail').hidden = false;
      document.title = cur.judul + ' | Desa Wanasari';
      var url = bagiUrl(cur.id);
      var lain = daftar.filter(function (x) { return x.id !== cur.id && x.kat === cur.kat; }).slice(0, 3);
      $('#detailIsi').innerHTML = '<p class="cetak-saja"><b>Pemerintah Desa Wanasari</b></p><span class="kat">' + esc(cur.kat) + '</span><h1>' + esc(cur.judul) + '</h1>' +
        '<div class="meta"><span>' + esc(tgl(cur.tgl)) + '</span><span>Oleh ' + esc(cur.penulis || 'Tim Informasi Desa') + '</span></div>' +
        (cur.foto ? fotoHTML(cur.foto, '') : '') + '<div class="isi">' + paragraf(cur.isi) + '</div>' + bagikanBar(cur.judul, url) +
        (lain.length ? '<h3 class="noprint" style="margin-top:32px">Kabar sejenis</h3><ul class="x-s noprint" style="grid-template-columns:1fr">' + lain.map(function (x) { return '<li><span><a href="kabar.html?id=' + encodeURIComponent(x.id) + '">' + esc(x.judul) + '</a></span><span>' + esc(tgl(x.tgl, true)) + '</span></li>'; }).join('') + '</ul>' : '');
      pasangBagikan(url);
      return;
    }
    var chips = $('#saring');
    chips.innerHTML = ['semua'].concat(KAT_KABAR).map(function (k) { return '<button type="button" data-k="' + esc(k) + '" aria-pressed="' + (k === 'semua') + '">' + (k === 'semua' ? 'Semua' : esc(k)) + '</button>'; }).join('');
    function gambar() {
      $$('button', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === st.k); });
      var q = st.q.toLowerCase();
      var h = daftar.filter(function (p) { return (st.k === 'semua' || p.kat === st.k) && (!q || (p.judul + ' ' + p.ringkas + ' ' + p.isi).toLowerCase().indexOf(q) >= 0); });
      $('#jumlah').textContent = h.length + ' kabar';
      $('#daftar').innerHTML = h.slice(0, st.n).map(function (p) {
        return '<article><a class="kartu-kabar" href="kabar.html?id=' + encodeURIComponent(p.id) + '">' + (p.foto ? fotoHTML(p.foto, '', 960, 640) : '<div class="foto-kosong" aria-hidden="true">' + esc(p.kat) + '</div>') +
          '<time datetime="' + esc(p.tgl) + '">' + esc(tgl(p.tgl)) + ' &middot; ' + esc(p.kat) + '</time><h3>' + esc(p.judul) + '</h3><p>' + esc(p.ringkas) + '</p></a></article>';
      }).join('');
      $('#kosong').hidden = h.length > 0;
      $('#lagi').hidden = h.length <= st.n;
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.k = b.dataset.k; st.n = 6; gambar(); });
    $('#cari').addEventListener('input', function () { st.q = this.value.trim(); st.n = 6; gambar(); });
    $('#lagi').addEventListener('click', function () { st.n += 6; gambar(); });
    gambar();
  };

  pages.produk = function () {
    var d = get(), st = { q: '', k: 'semua', o: 'baru' };
    var daftar = d.produk;
    var chips = $('#saring');
    chips.innerHTML = ['semua'].concat(KAT_PRODUK).map(function (k) { return '<button type="button" data-k="' + esc(k) + '" aria-pressed="' + (k === 'semua') + '">' + (k === 'semua' ? 'Semua' : esc(k)) + '</button>'; }).join('');
    function gambar() {
      $$('button', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === st.k); });
      var q = st.q.toLowerCase();
      var h = daftar.filter(function (p) { return (st.k === 'semua' || p.kat === st.k) && (!q || (p.nama + ' ' + p.desk + ' ' + p.penjual).toLowerCase().indexOf(q) >= 0); });
      if (st.o === 'murah') h = h.slice().sort(function (a, b) { return a.harga - b.harga; });
      if (st.o === 'mahal') h = h.slice().sort(function (a, b) { return b.harga - a.harga; });
      $('#jumlah').textContent = h.length + ' produk';
      $('#daftar').innerHTML = h.map(function (p) {
        return '<li class="' + (p.tersedia ? '' : 'habis') + '">' + (p.foto ? fotoHTML(p.foto, p.nama, 128, 128) : '<div class="foto-kosong" aria-hidden="true">' + esc(p.kat) + '</div>') +
          '<div><span class="kat">' + esc(p.kat) + '</span><h3 style="margin-top:6px">' + esc(p.nama) + '</h3><p>' + esc(p.desk) + '</p><p>Penjual: ' + esc(p.penjual) + '</p>' +
          '<p class="harga">' + esc(rp(p.harga)) + ' / ' + esc(p.satuan) + '</p>' +
          (p.tersedia ? '<button type="button" class="btn kecil" data-pesan="' + esc(p.id) + '">Pesan via WhatsApp</button>' : '<p><span class="st ditolak">Stok habis</span></p>') + '</div></li>';
      }).join('');
      $('#kosong').hidden = h.length > 0;
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.k = b.dataset.k; gambar(); });
    $('#cari').addEventListener('input', function () { st.q = this.value.trim(); gambar(); });
    $('#urut').addEventListener('change', function () { st.o = this.value; gambar(); });
    // Pesan
    var dlg = $('#dlgPesan'), cur = null, link = $('#kirimWa');
    function teks() {
      var q = Math.max(1, Math.min(999, parseInt($('#o_qty').value, 10) || 1)), nama = $('#o_nama').value.trim();
      var t = 'Halo, saya ' + (nama || '(nama)') + '. Saya ingin memesan:\n' + q + ' x ' + cur.nama + ' (' + cur.satuan + ')\nPerkiraan harga: ' + rp(q * cur.harga) +
        '\nPengambilan: ' + $('#o_ambil').value + (($('#o_cat').value.trim()) ? '\nCatatan: ' + $('#o_cat').value.trim() : '') + '\nTerima kasih.';
      return { t: t, q: q };
    }
    function segarkan() {
      var o = teks();
      $('#o_total').textContent = rp(o.q * cur.harga);
      link.href = 'https://wa.me/' + normHp(cur.wa) + '?text=' + encodeURIComponent(o.t);
    }
    $('#daftar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pesan]'); if (!b) return;
      daftar.forEach(function (p) { if (p.id === b.dataset.pesan) cur = p; });
      if (!cur) return;
      $('#o_judul').textContent = cur.nama; $('#o_info').textContent = rp(cur.harga) + ' / ' + cur.satuan + ', penjual: ' + cur.penjual;
      $('#o_qty').value = 1; $('#o_cat').value = ''; $('#o_err').textContent = ''; $('#o_nama').removeAttribute('aria-invalid');
      segarkan();
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      $('#o_nama').focus();
    });
    ['o_qty', 'o_nama', 'o_ambil', 'o_cat'].forEach(function (i) { $('#' + i).addEventListener('input', segarkan); $('#' + i).addEventListener('change', segarkan); });
    link.addEventListener('click', function (e) {
      if (!$('#o_nama').value.trim()) { e.preventDefault(); $('#o_err').textContent = 'Isi nama Anda dulu.'; $('#o_nama').setAttribute('aria-invalid', 'true'); $('#o_nama').focus(); return; }
      $('#o_err').textContent = '';
      setTimeout(function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); toast('Membuka WhatsApp...'); }, 50);
    });
    $('#o_tutup').addEventListener('click', function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); });
    gambar();
  };

  /* Grafik SVG anggaran */
  var WARNA = ['#0e4d3a', '#2fb37f', '#d69e1f', '#5b7fa6', '#9a5b8a'];
  function svgBatang(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.anggaran; }).concat([1])), W = 360, row = 50, H = rows.length * row + 8, s = '';
    rows.forEach(function (r, i) {
      var y = i * row + 4, wa = Math.max(2, r.anggaran / max * W), wr = Math.max(r.realisasi ? 2 : 0, r.realisasi / max * W);
      s += '<text x="0" y="' + (y + 12) + '" font-size="12.5" font-weight="600">' + esc(r.uraian) + '</text>' +
        '<text x="' + W + '" y="' + (y + 12) + '" font-size="12" text-anchor="end">' + esc(ringkasRp(r.anggaran)) + '</text>' +
        '<rect x="0" y="' + (y + 18) + '" width="' + wa.toFixed(1) + '" height="9" rx="4.5" fill="#bfdccd"/>' +
        '<rect x="0" y="' + (y + 29) + '" width="' + wr.toFixed(1) + '" height="9" rx="4.5" fill="#0e4d3a"/>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang anggaran dan realisasi belanja per bidang">' + s + '</svg>' +
      '<div class="legenda"><span><i style="background:#bfdccd"></i>Anggaran</span><span><i style="background:#0e4d3a"></i>Realisasi</span></div>';
  }
  function svgDonat(rows) {
    var tot = rows.reduce(function (a, r) { return a + r.anggaran; }, 0) || 1, R = 70, C = 2 * Math.PI * R, off = 0, s = '';
    rows.forEach(function (r, i) {
      var len = r.anggaran / tot * C;
      s += '<circle cx="90" cy="95" r="' + R + '" fill="none" stroke="' + WARNA[i % 5] + '" stroke-width="32" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 90 95)"/>';
      off += len;
    });
    s += '<text x="90" y="92" text-anchor="middle" font-size="11">Total</text><text x="90" y="110" text-anchor="middle" font-size="14" font-weight="800">' + esc(ringkasRp(tot)) + '</text>';
    rows.forEach(function (r, i) {
      s += '<rect x="186" y="' + (40 + i * 38) + '" width="12" height="12" rx="3" fill="' + WARNA[i % 5] + '"/><text x="204" y="' + (50 + i * 38) + '" font-size="12" font-weight="600">' + esc(r.uraian) + '</text>' +
        '<text x="204" y="' + (65 + i * 38) + '" font-size="11.5">' + esc(ringkasRp(r.anggaran)) + ' (' + (r.anggaran / tot * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + '%)</text>';
    });
    return '<svg viewBox="0 0 360 190" role="img" aria-label="Grafik donat sumber pendapatan desa">' + s + '</svg>';
  }
  function svgTren(tahun) { // tahun: [{t, pend, bel, real}]
    var W = 360, H = 210, base = 170, top = 28, max = Math.max.apply(null, tahun.map(function (x) { return Math.max(x.pend, x.bel); }).concat([1])), s = '';
    var gw = W / Math.max(tahun.length, 1), bw = Math.min(30, gw / 4);
    s += '<line x1="0" y1="' + base + '" x2="' + W + '" y2="' + base + '" stroke="#aab5ae"/>';
    tahun.forEach(function (x, i) {
      var cx = gw * i + gw / 2;
      [[x.pend, '#bfdccd', -bw * 1.5], [x.bel, '#2fb37f', -bw * 0.5], [x.real, '#0e4d3a', bw * 0.5]].forEach(function (b) {
        var h = (base - top) * b[0] / max;
        s += '<rect x="' + (cx + b[2] - 0.5).toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + b[1] + '"/>';
      });
      s += '<text x="' + cx.toFixed(1) + '" y="' + (base + 18) + '" text-anchor="middle" font-size="13" font-weight="700">' + x.t + '</text>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (base + 34) + '" text-anchor="middle" font-size="11">' + esc(ringkasRp(x.bel)) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Perbandingan pendapatan, belanja, dan realisasi belanja per tahun">' + s + '</svg>' +
      '<div class="legenda"><span><i style="background:#bfdccd"></i>Pendapatan</span><span><i style="background:#2fb37f"></i>Belanja (anggaran)</span><span><i style="background:#0e4d3a"></i>Belanja terealisasi</span></div>';
  }
  function pct(a, b) { return b > 0 ? (a / b * 100) : 0; }
  function pctTeks(x) { return x.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + '%'; }

  pages.anggaran = function () {
    var d = get(), tahun = [];
    d.anggaran.forEach(function (r) { if (tahun.indexOf(r.tahun) < 0) tahun.push(r.tahun); });
    tahun.sort(function (a, b) { return b - a; });
    var sel = $('#tahun');
    if (!tahun.length) { $('#isiAnggaran').innerHTML = '<p class="kosong">Belum ada data anggaran.</p>'; sel.hidden = true; return; }
    sel.innerHTML = tahun.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
    var th = tahun.indexOf(2026) >= 0 ? 2026 : tahun[0];
    var m = location.hash.match(/^#(\d{4})$/); if (m && tahun.indexOf(+m[1]) >= 0) th = +m[1];
    sel.value = th;
    function tabel(judul, rows) {
      var ta = rows.reduce(function (a, r) { return a + r.anggaran; }, 0), tr = rows.reduce(function (a, r) { return a + r.realisasi; }, 0);
      return '<h3 style="margin-top:28px">' + judul + '</h3><div class="x-tw"><table class="x-t"><thead><tr><th scope="col">Uraian</th><th scope="col" class="ang">Anggaran</th><th scope="col" class="ang">Realisasi</th><th scope="col" class="ang">Terserap</th></tr></thead><tbody>' +
        rows.map(function (r) {
          var p = pct(r.realisasi, r.anggaran);
          return '<tr><td data-label="Uraian">' + esc(r.uraian) + '</td><td class="ang" data-label="Anggaran">' + esc(rp(r.anggaran)) + '</td><td class="ang" data-label="Realisasi">' + esc(rp(r.realisasi)) + '</td><td class="ang" data-label="Terserap">' + esc(pctTeks(p)) + '</td></tr>';
        }).join('') + '</tbody><tfoot><tr><td data-label="Uraian">Jumlah</td><td class="ang" data-label="Anggaran">' + esc(rp(ta)) + '</td><td class="ang" data-label="Realisasi">' + esc(rp(tr)) + '</td><td class="ang" data-label="Terserap">' + esc(pctTeks(pct(tr, ta))) + '</td></tr></tfoot></table></div>';
    }
    function gambar() {
      var t = +sel.value, rows = d.anggaran.filter(function (r) { return r.tahun === t; });
      var bel = rows.filter(function (r) { return r.jenis === 'Belanja'; }), pen = rows.filter(function (r) { return r.jenis === 'Pendapatan'; });
      var sum = function (a, k) { return a.reduce(function (s, r) { return s + r[k]; }, 0); };
      $('#tAnggaran').textContent = rp(sum(bel, 'anggaran')); $('#tAnggaranLabel').textContent = 'Total belanja APBDes tahun ' + t;
      $('#aPend').textContent = rp(sum(pen, 'anggaran')); $('#aBel').textContent = rp(sum(bel, 'anggaran'));
      $('#aReal').textContent = rp(sum(bel, 'realisasi')); $('#aPersen').textContent = pctTeks(pct(sum(bel, 'realisasi'), sum(bel, 'anggaran')));
      $('#gBatang').innerHTML = bel.length ? svgBatang(bel) : '<p class="kosong">Belum ada data belanja.</p>';
      $('#gDonat').innerHTML = pen.length ? svgDonat(pen) : '<p class="kosong">Belum ada data pendapatan.</p>';
      $('#tabelAnggaran').innerHTML = (pen.length ? tabel('Pendapatan ' + t, pen) : '') + (bel.length ? tabel('Belanja ' + t, bel) : '');
      var tr = tahun.slice().reverse().map(function (y) {
        var r = d.anggaran.filter(function (x) { return x.tahun === y; });
        var b = r.filter(function (x) { return x.jenis === 'Belanja'; }), p = r.filter(function (x) { return x.jenis === 'Pendapatan'; });
        return { t: y, pend: sum(p, 'anggaran'), bel: sum(b, 'anggaran'), real: sum(b, 'realisasi') };
      });
      $('#gTren').innerHTML = svgTren(tr);
    }
    sel.addEventListener('change', function () { if (history.replaceState) history.replaceState(null, '', '#' + sel.value); gambar(); });
    gambar();
  };

  pages.kontak = function () {
    var fa = $('#formAduan'), hasil = $('#hasilAduan'), terakhir = null;
    fa.innerHTML = '<div class="dua-kolom">' + ADUAN_F.slice(0, 3).map(function (f) { return fieldHTML(f, '', 'a_'); }).join('') + '</div>' +
      ADUAN_F.slice(3, 5).map(function (f) { return fieldHTML(f, '', 'a_'); }).join('') +
      '<div class="dua-kolom">' + ADUAN_F.slice(5).map(function (f) { return fieldHTML(f, '', 'a_'); }).join('') + '</div>' +
      '<div class="aksi"><button type="submit" class="btn">Kirim</button></div>';
    clearOnInput(fa);
    fa.addEventListener('submit', function (e) {
      e.preventDefault();
      var vals = readForm(ADUAN_F, fa, 'a_');
      if (!validate(ADUAN_F, vals, fa, 'a_')) { toast('Ada isian yang belum benar. Periksa pesan merah.'); return; }
      var d = get(), id = nomorTiket(d, 'adu'), now = nowISO();
      var a = { id: id, jenis: vals.jenis, kat: vals.kat, dusun: vals.dusun, nama: vals.nama, hp: vals.hp, judul: vals.judul, isi: vals.isi, status: 'baru', dibuat: now,
        riwayat: [{ s: 'baru', at: now, cat: (vals.jenis === 'Aspirasi' ? 'Aspirasi' : 'Pengaduan') + ' diterima.' }] };
      d.aduan.push(a); save(d); terakhir = a;
      fa.hidden = true; hasil.hidden = false;
      hasil.innerHTML = '<div class="tiket" tabindex="-1" id="kartuAduan"><p>' + esc(vals.jenis) + ' terkirim. Simpan nomor tiket Anda.</p><p class="no">' + esc(id) + '</p><p>Lacak perkembangannya dengan nomor ini di bagian "Lacak tiket" di bawah.</p>' +
        '<div class="aksi"><button type="button" class="btn" id="bLacak">Lacak tiket ini</button><button type="button" class="btn sek" id="bSalin">Salin nomor</button><button type="button" class="btn sek" id="bBaru">Kirim lagi</button></div></div>';
      $('#kartuAduan').focus(); toast('Terkirim: ' + id);
    });
    hasil.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !terakhir) return;
      if (b.id === 'bSalin') salin(terakhir.id);
      if (b.id === 'bBaru') { fa.reset(); $$('[aria-invalid]', fa).forEach(function (x) { x.removeAttribute('aria-invalid'); }); fa.hidden = false; hasil.hidden = true; $('#a_jenis').focus(); }
      if (b.id === 'bLacak') { $('#l_no').value = terakhir.id; $('#formLacak').requestSubmit(); $('#lacak').scrollIntoView(); }
    });
    var fl = $('#formLacak'), hl = $('#hasilLacak');
    clearOnInput(fl);
    fl.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = [{ k: 'no', l: 'Nomor tiket', req: 1, t: 'text', minLen: 8 }];
      var vals = readForm(f, fl, 'l_'); vals.no = vals.no.toUpperCase();
      if (!validate(f, vals, fl, 'l_')) { hl.innerHTML = ''; return; }
      var a = null; get().aduan.forEach(function (x) { if (x.id === vals.no) a = x; });
      if (!a) { hl.innerHTML = '<p class="kosong" role="alert">' + (/^SRT-/.test(vals.no) ? 'Nomor ini adalah tiket surat. Cek di halaman <a href="layanan.html#cek">Layanan</a> dengan NIK.' : 'Nomor tiket tidak ditemukan. Periksa lagi penulisannya, misalnya ADU-2611-0001.') + '</p>'; return; }
      hl.innerHTML = '<div class="tiket"><p>' + esc(a.jenis) + ' ' + badge(a.status, ST_ADUAN) + '</p><p class="no">' + esc(a.id) + '</p><p><b>' + esc(a.judul) + '</b></p><p>' + esc(a.isi) + '</p>' +
        '<dl class="rinci"><div><dt>Kategori</dt><dd>' + esc(a.kat) + '</dd></div><div><dt>Lokasi</dt><dd>Dusun ' + esc(a.dusun) + '</dd></div><div><dt>Dikirim</dt><dd>' + esc(tglJam(a.dibuat)) + '</dd></div></dl></div>' +
        '<h3 style="margin-top:28px">Riwayat dan tanggapan</h3>' + timeline(a.riwayat, ST_ADUAN);
    });
  };

  /* ---------- Ekspor ke window ---------- */
  window.W = {
    KEY: KEY, PIN: PIN, DUSUN: DUSUN, FOTO: FOTO, KAT_PENG: KAT_PENG, KAT_KABAR: KAT_KABAR, KAT_PRODUK: KAT_PRODUK, KAT_ADUAN: KAT_ADUAN,
    ST_SURAT: ST_SURAT, LANJUT_SURAT: LANJUT_SURAT, ST_ADUAN: ST_ADUAN, LANJUT_ADUAN: LANJUT_ADUAN, JENIS: JENIS, COMMON: COMMON,
    $: $, $$: $$, esc: esc, rp: rp, ringkasRp: ringkasRp, tgl: tgl, tglJam: tglJam, todayISO: todayISO, nowISO: nowISO, pad: pad, toast: toast, salin: salin,
    unduhCSV: unduhCSV, get: get, save: save, reset: reset, newId: newId, fieldHTML: fieldHTML, checkField: checkField, readForm: readForm, validate: validate, clearOnInput: clearOnInput,
    badge: badge, timeline: timeline, jenisById: jenisById, labelData: labelData, fotoHTML: fotoHTML, normHp: normHp, paragraf: paragraf, cetakHTML: cetakHTML, urut: urut,
    pct: pct, pctTeks: pctTeks
  };

  function mulai() {
    var p = document.body.getAttribute('data-page');
    menuLainnya();
    if (p && pages[p]) pages[p]();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
