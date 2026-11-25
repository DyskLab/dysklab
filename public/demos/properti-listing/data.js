"use strict";
/* Data tetap + seed. Semua nama, nomor, dan alamat adalah contoh fiktif. */
var IMG = [
  { k: "rumah-merah", g: "Rumah", alt: "Rumah satu lantai beratap genteng oranye dengan teras dan taman depan" },
  { k: "rumah-cluster", g: "Rumah", alt: "Rumah cluster baru bercat abu-abu dan kuning dengan atap genteng" },
  { k: "rumah-genteng", g: "Rumah", alt: "Atap genteng deretan rumah di lingkungan yang rindang" },
  { k: "rumah-klasik", g: "Rumah", alt: "Rumah klasik berhalaman dengan teras dan pintu hijau" },
  { k: "apt-kalibata", g: "Apartemen", alt: "Menara apartemen putih di antara pepohonan" },
  { k: "apt-summit", g: "Apartemen", alt: "Fasad apartemen bertingkat tinggi dengan balkon" },
  { k: "apt-kedoya", g: "Apartemen", alt: "Dua menara apartemen di atas barisan pohon" },
  { k: "apt-paladian", g: "Apartemen", alt: "Menara apartemen berkubah di antara pepohonan" },
  { k: "ruko-jalan", g: "Ruko", alt: "Deretan ruko dua lantai di pinggir jalan dengan taman kecil" },
  { k: "ruko-warna", g: "Ruko", alt: "Deretan ruko berwarna-warni di kawasan niaga baru" },
  { k: "ruko-kawasan", g: "Ruko", alt: "Kawasan ruko baru dengan jalan lebar" },
  { k: "ruko-sudut", g: "Ruko", alt: "Ruko sudut dengan pohon palem di depannya" },
  { k: "villa-kolam", g: "Villa", alt: "Kolam renang panjang dengan paviliun kayu dan pohon kamboja" },
  { k: "villa-paviliun", g: "Villa", alt: "Paviliun kayu terbuka menghadap laut" },
  { k: "villa-tebing", g: "Villa", alt: "Kolam renang di tebing dengan pemandangan laut" },
  { k: "int-ruang-1", g: "Interior", alt: "Dapur dan ruang tamu modern dengan panel kayu" },
  { k: "int-ruang-2", g: "Interior", alt: "Ruang tamu dengan jendela besar menghadap pepohonan dan danau" },
  { k: "int-ruang-3", g: "Interior", alt: "Ruang keluarga dengan sofa cokelat dan televisi" },
  { k: "int-dapur", g: "Interior", alt: "Dapur modern dan ruang makan yang terang" },
  { k: "int-makan", g: "Interior", alt: "Meja makan dengan kursi hijau di dapur kecil" },
  { k: "int-kamar-1", g: "Interior", alt: "Kamar tidur dengan tempat tidur putih dan lampu meja" },
  { k: "int-kamar-2", g: "Interior", alt: "Kamar tidur luas dengan tirai tebal" },
  { k: "tanah-padi", g: "Tanah", alt: "Hamparan padi hijau di lahan datar" },
  { k: "tanah-teras", g: "Tanah", alt: "Lahan berkontur berundak di kawasan perbukitan" },
  { k: "tanah-lapang", g: "Tanah", alt: "Lahan kosong datar dengan rumah di kejauhan" }
];
var IMGMAP = {};
IMG.forEach(function (i) { IMGMAP[i.k] = i; });

var FAS = [
  ["ac", "AC"], ["kolam", "Kolam renang"], ["garasi", "Garasi / carport"], ["satpam", "Keamanan 24 jam"],
  ["taman", "Taman"], ["gym", "Gym"], ["furnitur", "Furnitur"], ["lift", "Lift"],
  ["transit", "Dekat stasiun / halte"], ["pdam", "Air PDAM"]
];
var FASMAP = {};
FAS.forEach(function (f) { FASMAP[f[0]] = f[1]; });

var TIPE = { rumah: "Rumah", apartemen: "Apartemen", ruko: "Ruko", tanah: "Tanah" };
var STATUS_LST = { tersedia: "Tersedia", dipesan: "Dipesan", terjual: "Terjual", disewa: "Disewa" };
var STAGES = [["baru", "Baru"], ["dihubungi", "Dihubungi"], ["survei", "Survei"], ["negosiasi", "Negosiasi"], ["deal", "Deal"], ["batal", "Batal"]];
var STAGEMAP = {};
STAGES.forEach(function (s) { STAGEMAP[s[0]] = s[1]; });
var AGEN = [
  { n: "Dewi Anggraini", hp: "0812-0000-0101", wa: "6281200000101" },
  { n: "Bagas Wicaksono", hp: "0812-0000-0102", wa: "6281200000102" },
  { n: "Maya Setiani", hp: "0812-0000-0103", wa: "6281200000103" }
];
var JAM = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function pad2(n) { return (n < 10 ? "0" : "") + n; }
function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0); return x; }
function wd(n) { var d = addDays(new Date(), n); if (d.getDay() === 0) d = addDays(d, 1); return ymd(d); }
function isoAt(dayOffset, h, m) {
  var d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m || 0, 0, 0); return d.toISOString();
}

function makeSeed() {
  var L = function (o) {
    o.dilihat = o.dilihat || 0; o.tampil = o.tampil !== false; o.status = o.status || "tersedia";
    o.satuan = o.satuan || "bulan"; o.lt = o.lt || 0; o.lb = o.lb || 0; o.kt = o.kt || 0; o.km = o.km || 0;
    o.lantai = o.lantai || 1; o.garasi = o.garasi || 0; o.listrik = o.listrik || 0; o.agen = o.agen || 0;
    return o;
  };
  var listings = [
    L({ id: "p1", kode: "NP-1001", judul: "Rumah satu lantai halaman luas, Serpong Utara", mode: "jual", tipe: "rumah", kota: "Tangerang Selatan", area: "Serpong Utara", alamat: "Jl. Melati Raya No. 14 (alamat contoh)", harga: 1650000000, kt: 3, km: 2, lb: 78, lt: 120, lantai: 1, garasi: 1, sertifikat: "SHM", tahun: 2021, listrik: 2200, agen: 0, dilihat: 184, fas: ["ac", "garasi", "taman", "satpam", "pdam"], foto: ["rumah-merah", "int-ruang-3", "int-dapur", "int-kamar-2"], deskripsi: "Rumah terawat di cluster tenang dengan teras lapang dan taman depan. Dapur terbuka menyatu dengan ruang makan, tiga kamar tidur, dan satu carport. Sekolah, pasar, dan akses tol ada dalam jarak sekitar 10 menit berkendara.", c: -40 }),
    L({ id: "p2", kode: "NP-1002", judul: "Rumah cluster mungil siap huni, Jatiasih", mode: "jual", tipe: "rumah", kota: "Bekasi", area: "Jatiasih", alamat: "Cluster Pelangi Blok B-7 (alamat contoh)", harga: 685000000, kt: 2, km: 1, lb: 36, lt: 72, lantai: 1, garasi: 1, sertifikat: "SHM", tahun: 2024, listrik: 1300, agen: 1, dilihat: 266, fas: ["garasi", "satpam", "pdam", "transit"], foto: ["rumah-cluster", "int-makan", "int-kamar-1"], deskripsi: "Rumah baru ukuran kecil untuk keluarga muda. Dua kamar tidur, satu kamar mandi, carport satu mobil, dan sisa tanah yang bisa dikembangkan ke belakang. Cicilan di bawah Rp 4 jt per bulan dengan uang muka 20 persen.", c: -30 }),
    L({ id: "p3", kode: "NP-1003", judul: "Rumah klasik berhalaman, Cimahi", mode: "jual", tipe: "rumah", kota: "Bandung", area: "Cimahi Selatan", alamat: "Jl. Cempaka No. 9 (alamat contoh)", harga: 1240000000, kt: 4, km: 2, lb: 110, lt: 180, lantai: 1, garasi: 2, sertifikat: "SHM", tahun: 1998, listrik: 2200, agen: 2, dilihat: 97, status: "terjual", fas: ["garasi", "taman", "pdam"], foto: ["rumah-klasik", "int-ruang-2", "int-makan"], deskripsi: "Rumah lama kokoh dengan langit-langit tinggi dan halaman depan yang luas. Empat kamar tidur, dua kamar mandi. Cocok untuk keluarga besar atau dijadikan kantor.", c: -75 }),
    L({ id: "p4", kode: "NP-1004", judul: "Rumah sewa dekat stasiun, Depok", mode: "sewa", tipe: "rumah", kota: "Depok", area: "Depok Baru", alamat: "Gg. Kenari No. 3 (alamat contoh)", harga: 4500000, satuan: "bulan", kt: 2, km: 1, lb: 54, lt: 90, lantai: 1, garasi: 1, sertifikat: "SHM", tahun: 2016, listrik: 1300, agen: 0, dilihat: 141, fas: ["ac", "garasi", "transit", "pdam"], foto: ["rumah-genteng", "int-ruang-3", "int-kamar-2"], deskripsi: "Rumah sewa lima menit dari stasiun. Dua kamar tidur ber-AC, ruang tamu, dapur, dan carport. Sewa minimal 12 bulan, deposit dua bulan.", c: -22 }),
    L({ id: "p5", kode: "NP-1005", judul: "Villa kolam renang pribadi, Uluwatu", mode: "jual", tipe: "rumah", kota: "Badung", area: "Uluwatu", alamat: "Jl. Pantai Contoh No. 5 (alamat contoh)", harga: 8900000000, kt: 3, km: 3, lb: 220, lt: 400, lantai: 2, garasi: 2, sertifikat: "HGB", tahun: 2019, listrik: 7700, agen: 1, dilihat: 322, fas: ["ac", "kolam", "garasi", "taman", "satpam", "furnitur"], foto: ["villa-kolam", "villa-paviliun", "int-ruang-2", "int-kamar-1"], deskripsi: "Villa tiga kamar dengan kolam renang panjang, paviliun kayu terbuka, dan pemandangan laut dari lantai dua. Dijual lengkap dengan furnitur. Status tanah HGB, bisa diperpanjang.", c: -18 }),
    L({ id: "p6", kode: "NP-1006", judul: "Villa tebing pandangan laut untuk sewa tahunan", mode: "sewa", tipe: "rumah", kota: "Badung", area: "Ungasan", alamat: "Jl. Tebing Contoh No. 11 (alamat contoh)", harga: 210000000, satuan: "tahun", kt: 2, km: 2, lb: 140, lt: 300, lantai: 2, garasi: 1, sertifikat: "HGB", tahun: 2017, listrik: 5500, agen: 2, dilihat: 118, fas: ["ac", "kolam", "furnitur", "satpam", "taman"], foto: ["villa-tebing", "villa-kolam", "int-ruang-1"], deskripsi: "Villa dua kamar dengan kolam di tepi tebing. Disewakan per tahun, sudah berperabot. Tagihan listrik dan air ditanggung penyewa.", c: -12 }),
    L({ id: "p7", kode: "NP-1007", judul: "Apartemen 2 kamar dekat stasiun, Jakarta Selatan", mode: "jual", tipe: "apartemen", kota: "Jakarta Selatan", area: "Pancoran", alamat: "Tower C Lt. 12 (alamat contoh)", harga: 520000000, kt: 2, km: 1, lb: 36, lt: 0, lantai: 12, sertifikat: "Strata title", tahun: 2012, listrik: 1300, agen: 0, dilihat: 203, fas: ["ac", "lift", "satpam", "transit", "gym"], foto: ["apt-kalibata", "int-ruang-3", "int-kamar-1", "int-dapur"], deskripsi: "Unit dua kamar di lantai 12, menghadap taman. Jalan kaki ke stasiun dan halte. Lift cepat, area parkir luas, dan pengelola gedung aktif.", c: -34 }),
    L({ id: "p8", kode: "NP-1008", judul: "Apartemen studio berperabot untuk sewa, Jakarta Selatan", mode: "sewa", tipe: "apartemen", kota: "Jakarta Selatan", area: "Kemang", alamat: "Tower A Lt. 8 (alamat contoh)", harga: 4200000, satuan: "bulan", kt: 1, km: 1, lb: 28, lt: 0, lantai: 8, sertifikat: "Strata title", tahun: 2015, listrik: 1300, agen: 1, dilihat: 176, fas: ["ac", "furnitur", "lift", "gym", "kolam", "satpam"], foto: ["apt-summit", "int-kamar-1", "int-makan"], deskripsi: "Studio siap tinggal dengan tempat tidur, lemari, meja makan, dan dapur kecil. Akses kolam dan gym gratis. Sewa minimal 6 bulan.", c: -15 }),
    L({ id: "p9", kode: "NP-1009", judul: "Apartemen 3 kamar menara tinggi, Jakarta Barat", mode: "jual", tipe: "apartemen", kota: "Jakarta Barat", area: "Kedoya", alamat: "Tower B Lt. 25 (alamat contoh)", harga: 1450000000, kt: 3, km: 2, lb: 86, lt: 0, lantai: 25, garasi: 1, sertifikat: "Strata title", tahun: 2018, listrik: 3500, agen: 2, dilihat: 149, status: "dipesan", fas: ["ac", "lift", "kolam", "gym", "satpam", "garasi"], foto: ["apt-kedoya", "int-ruang-1", "int-dapur", "int-kamar-2"], deskripsi: "Unit sudut tiga kamar di lantai 25 dengan dua sisi jendela. Dapur terpisah, ruang makan lega, dan satu slot parkir.", c: -26 }),
    L({ id: "p10", kode: "NP-1010", judul: "Apartemen 1 kamar furnished, Jakarta Utara", mode: "sewa", tipe: "apartemen", kota: "Jakarta Utara", area: "Kelapa Gading", alamat: "Tower D Lt. 17 (alamat contoh)", harga: 6500000, satuan: "bulan", kt: 1, km: 1, lb: 42, lt: 0, lantai: 17, sertifikat: "Strata title", tahun: 2014, listrik: 2200, agen: 0, dilihat: 112, status: "disewa", fas: ["ac", "furnitur", "lift", "kolam", "satpam"], foto: ["apt-paladian", "int-ruang-1", "int-kamar-1"], deskripsi: "Satu kamar luas dengan ruang tamu terpisah. Sudah berperabot lengkap, dekat pusat belanja.", c: -50 }),
    L({ id: "p11", kode: "NP-1011", judul: "Ruko 3 lantai pinggir jalan raya, Tangerang", mode: "jual", tipe: "ruko", kota: "Tangerang", area: "Cipondoh", alamat: "Jl. Raya Contoh Blok A-3 (alamat contoh)", harga: 3200000000, kt: 0, km: 3, lb: 210, lt: 84, lantai: 3, garasi: 2, sertifikat: "HGB", tahun: 2013, listrik: 6600, agen: 1, dilihat: 131, fas: ["ac", "garasi", "pdam"], foto: ["ruko-jalan", "ruko-sudut"], deskripsi: "Ruko tiga lantai di jalan utama yang ramai. Lantai dasar lega untuk toko, lantai atas bisa jadi kantor atau gudang kecil. Parkir depan untuk dua mobil.", c: -28 }),
    L({ id: "p12", kode: "NP-1012", judul: "Ruko 2 lantai untuk sewa tahunan, Bekasi", mode: "sewa", tipe: "ruko", kota: "Bekasi", area: "Bekasi Barat", alamat: "Kawasan Niaga Contoh Blok C-9 (alamat contoh)", harga: 85000000, satuan: "tahun", kt: 0, km: 2, lb: 120, lt: 60, lantai: 2, garasi: 1, sertifikat: "HGB", tahun: 2012, listrik: 3500, agen: 2, dilihat: 88, fas: ["ac", "garasi", "pdam"], foto: ["ruko-warna", "ruko-sudut"], deskripsi: "Ruko dua lantai di kawasan niaga berpenghuni toko dan kafe. Sewa minimal dua tahun, pembayaran per tahun.", c: -9 }),
    L({ id: "p13", kode: "NP-1013", judul: "Ruko deretan kawasan baru, Bogor", mode: "jual", tipe: "ruko", kota: "Bogor", area: "Sentul", alamat: "Boulevard Contoh Blok D-2 (alamat contoh)", harga: 1900000000, kt: 0, km: 2, lb: 150, lt: 72, lantai: 2, garasi: 1, sertifikat: "HGB", tahun: 2023, listrik: 4400, agen: 0, dilihat: 64, fas: ["garasi", "pdam", "satpam"], foto: ["ruko-kawasan", "ruko-warna"], deskripsi: "Ruko di kawasan baru dengan jalan lebar dan trotoar. Belum banyak tenant, cocok untuk membuka usaha lebih awal.", c: -6 }),
    L({ id: "p14", kode: "NP-1014", judul: "Tanah kavling kontur berundak, 300 m2, Bogor", mode: "jual", tipe: "tanah", kota: "Bogor", area: "Sentul Selatan", alamat: "Jl. Kavling Contoh (alamat contoh)", harga: 780000000, lt: 300, sertifikat: "SHM", tahun: 0, agen: 1, dilihat: 76, fas: ["pdam"], foto: ["tanah-teras", "tanah-padi"], deskripsi: "Kavling 300 m2 di kawasan perbukitan dengan udara sejuk. Akses jalan cor lebar 4 meter. Sertifikat SHM pecahan, siap balik nama.", c: -20 }),
    L({ id: "p15", kode: "NP-1015", judul: "Tanah datar 1.000 m2 dekat kawasan industri, Karawang", mode: "jual", tipe: "tanah", kota: "Karawang", area: "Teluk Jambe", alamat: "Jl. Lahan Contoh (alamat contoh)", harga: 1500000000, lt: 1000, sertifikat: "SHM", agen: 2, dilihat: 52, fas: ["pdam"], foto: ["tanah-lapang", "tanah-padi"], deskripsi: "Lahan datar bentuk persegi panjang, lebar muka 20 meter. Cocok untuk gudang, pabrik kecil, atau perumahan.", c: -45 }),
    L({ id: "p16", kode: "NP-1016", judul: "Rumah dua lantai (draf, belum tayang)", mode: "jual", tipe: "rumah", kota: "Tangerang Selatan", area: "Bintaro", alamat: "Jl. Contoh No. 2 (alamat contoh)", harga: 2350000000, kt: 4, km: 3, lb: 160, lt: 140, lantai: 2, garasi: 2, sertifikat: "SHM", tahun: 2022, listrik: 3500, agen: 0, dilihat: 0, tampil: false, fas: ["ac", "garasi", "taman", "satpam"], foto: ["rumah-cluster", "int-ruang-1", "int-kamar-2"], deskripsi: "Draf listing. Foto dan spesifikasi masih dilengkapi, belum ditayangkan.", c: -2 })
  ];
  listings.forEach(function (l) { l.dibuat = isoAt(l.c, 10, 0); delete l.c; });

  var seq = 1000;
  function lead(o) {
    seq++;
    o.kode = "TKT-" + seq;
    var base = o.dibuat;
    o.riwayat = [{ t: base, s: "baru" }];
    (o.steps || []).forEach(function (st, i) { o.riwayat.push({ t: new Date(new Date(base).getTime() + (i + 1) * 5400000).toISOString(), s: st }); });
    o.status = o.steps && o.steps.length ? o.steps[o.steps.length - 1] : "baru";
    delete o.steps;
    o.catatan = (o.notes || []).map(function (n, i) { return { t: new Date(new Date(base).getTime() + (i + 1) * 3600000).toISOString(), teks: n }; });
    delete o.notes;
    o.email = o.email || "";
    return o;
  }
  var leads = [
    lead({ listingId: "p1", nama: "Contoh Pelanggan Satu", hp: "0812-0000-0201", jenis: "survei", tgl: wd(2), jam: "10:00", pesan: "Bisa lihat sore hari? Kami berdua datang.", dibuat: isoAt(-1, 9, 20), steps: ["dihubungi"], notes: ["Sudah konfirmasi lewat WhatsApp, datang jam 10."] }),
    lead({ listingId: "p2", nama: "Contoh Pelanggan Dua", hp: "0812-0000-0202", jenis: "survei", tgl: wd(1), jam: "13:00", pesan: "", dibuat: isoAt(-2, 14, 5), steps: ["dihubungi", "survei"] }),
    lead({ listingId: "p2", nama: "Contoh Pelanggan Tiga", hp: "0812-0000-0203", jenis: "tanya", tgl: "", jam: "", pesan: "Apakah bisa KPR bank syariah? Dan berapa biaya notaris?", dibuat: isoAt(-3, 11, 40), steps: ["dihubungi"], notes: ["Dijelaskan biaya notaris sekitar 2,5 persen dari harga."] }),
    lead({ listingId: "p5", nama: "Contoh Pelanggan Empat", hp: "0812-0000-0204", jenis: "tanya", tgl: "", jam: "", pesan: "Apakah harga masih bisa nego? Furnitur ikut semua?", dibuat: isoAt(-5, 16, 10), steps: ["dihubungi", "survei", "negosiasi"], notes: ["Survei sudah dilakukan minggu lalu.", "Penawaran 8,4 M, menunggu jawaban pemilik."] }),
    lead({ listingId: "p7", nama: "Contoh Pelanggan Lima", hp: "0812-0000-0205", jenis: "survei", tgl: wd(3), jam: "09:00", pesan: "Tertarik untuk investasi sewa.", dibuat: isoAt(0, 8, 30) }),
    lead({ listingId: "p8", nama: "Contoh Pelanggan Enam", hp: "0812-0000-0206", jenis: "tanya", tgl: "", jam: "", pesan: "Sewa bisa mulai tanggal 1 bulan depan? Boleh bawa kucing?", dibuat: isoAt(0, 7, 50) }),
    lead({ listingId: "p9", nama: "Contoh Pelanggan Tujuh", hp: "0812-0000-0207", jenis: "survei", tgl: wd(-6), jam: "11:00", pesan: "", dibuat: isoAt(-12, 10, 0), steps: ["dihubungi", "survei", "negosiasi", "deal"], notes: ["Deal di 1,43 M. Pembeli ajukan KPR."] }),
    lead({ listingId: "p10", nama: "Contoh Pelanggan Delapan", hp: "0812-0000-0208", jenis: "survei", tgl: wd(-20), jam: "14:00", pesan: "", dibuat: isoAt(-26, 13, 0), steps: ["dihubungi", "survei", "negosiasi", "deal"], notes: ["Kontrak sewa satu tahun ditandatangani."] }),
    lead({ listingId: "p3", nama: "Contoh Pelanggan Sembilan", hp: "0812-0000-0209", jenis: "survei", tgl: wd(-30), jam: "10:00", pesan: "", dibuat: isoAt(-38, 9, 0), steps: ["dihubungi", "survei", "negosiasi", "deal"], notes: ["Terjual lewat KPR."] }),
    lead({ listingId: "p11", nama: "Contoh Pelanggan Sepuluh", hp: "0812-0000-0210", jenis: "survei", tgl: wd(5), jam: "15:00", pesan: "Untuk toko bangunan. Perlu cek lebar jalan masuk truk.", dibuat: isoAt(-1, 15, 45), steps: ["dihubungi"] }),
    lead({ listingId: "p14", nama: "Contoh Pelanggan 11", hp: "0812-0000-0211", jenis: "tanya", tgl: "", jam: "", pesan: "Apakah sertifikat sudah pecah atas nama pemilik sekarang?", dibuat: isoAt(-8, 10, 15), steps: ["dihubungi", "batal"], notes: ["Pembeli memilih kavling lain."] }),
    lead({ listingId: "p12", nama: "Contoh Pelanggan 12", hp: "0812-0000-0212", jenis: "tanya", tgl: "", jam: "", pesan: "Bisa sewa per bulan saja untuk uji coba usaha?", dibuat: isoAt(-4, 12, 30), steps: ["dihubungi", "negosiasi"], notes: ["Pemilik bersedia minimal 6 bulan."] }),
    lead({ listingId: "p4", nama: "Contoh Pelanggan 13", hp: "0812-0000-0213", jenis: "survei", tgl: wd(1), jam: "13:00", pesan: "", dibuat: isoAt(-1, 19, 0) }),
    lead({ listingId: "p6", nama: "Contoh Pelanggan 14", hp: "0812-0000-0214", jenis: "tanya", tgl: "", jam: "", pesan: "Apakah ada biaya kebersihan kolam bulanan?", dibuat: isoAt(0, 6, 40) })
  ];
  leads.forEach(function (l) { var x = listings.filter(function (p) { return p.id === l.listingId; })[0]; l.listingJudul = x ? x.judul : ""; });
  return { v: 1, listings: listings, leads: leads, seq: seq, nextId: 17, favs: ["p2", "p7"], cmp: [], mine: [], view: "grid" };
}
