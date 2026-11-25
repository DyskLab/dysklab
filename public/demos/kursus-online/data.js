"use strict";
/* Isi kursus contoh (fiktif). Dipakai sebagai data awal. */
function L(t,m,b,p){return{title:t,mins:m,body:b,pts:p}}
function Q(q,o,a){return{q:q,o:o,a:a}}
function M(t,ls,qs,pass){return{title:t,lessons:ls,quiz:qs&&qs.length?{pass:pass||70,qs:qs}:null}}
function SEED_COURSES(){return[
{id:"c1",title:"HTML dan CSS dari Nol",cat:"Pemrograman Web",lvl:"Pemula",price:149000,img:"laptop",ins:"i1",base:420,ago:120,
 desc:"Bangun halaman web pertamamu tanpa alat tambahan. Kamu belajar struktur HTML, gaya CSS, tata letak Flexbox, sampai halaman yang nyaman dibuka di HP.",
 modules:[
 M("Dasar HTML",[
  L("Struktur halaman HTML",8,"Setiap halaman web dimulai dari dokumen HTML. Elemen html membungkus head untuk informasi halaman dan body untuk isi yang tampil di layar.\n\nBrowser membaca dokumen dari atas ke bawah, jadi urutan dan penutupan tag penting.",["Mulai dengan <!DOCTYPE html>","Judul tab diatur lewat elemen title di dalam head","Isi yang terlihat ditaruh di dalam body"]),
  L("Judul, paragraf, dan tautan",10,"Gunakan h1 sampai h6 untuk judul bertingkat, p untuk paragraf, dan a dengan atribut href untuk tautan ke halaman lain.\n\nJudul bukan untuk membesarkan teks. Ia memberi struktur yang dipakai pembaca layar dan mesin pencari.",["Satu h1 per halaman","Atribut href berisi tujuan tautan","Teks tautan harus jelas, bukan \"klik di sini\""]),
  L("Gambar dan daftar",9,"Elemen img menampilkan gambar dan wajib punya atribut alt berisi deskripsi singkat. Daftar tak berurut memakai ul, daftar berurut memakai ol, dan tiap butir memakai li.",["Alt menjelaskan isi gambar","ul untuk daftar tanpa urutan, ol untuk langkah","Tag img tidak punya penutup"])
 ],[Q("Elemen mana yang berisi isi yang tampil di layar?",["head","body","title","meta"],1),Q("Atribut apa yang menyimpan tujuan tautan?",["src","alt","href","id"],2),Q("Untuk apa atribut alt pada gambar?",["Mengatur ukuran","Memberi deskripsi teks gambar","Mengganti warna","Menautkan gambar"],1)]),
 M("Dasar CSS",[
  L("Selektor dan properti",10,"CSS menata tampilan HTML. Sebuah aturan terdiri dari selektor yang memilih elemen, lalu blok properti dan nilai di dalam kurung kurawal.",["Selektor kelas diawali titik, misalnya .kartu","Selektor id diawali tanda pagar","Akhiri tiap deklarasi dengan titik koma"]),
  L("Warna, teks, dan kotak (box model)",12,"Setiap elemen adalah kotak berlapis: isi, padding, border, lalu margin. Padding memberi ruang di dalam, margin memberi jarak di luar.\n\nDengan box-sizing: border-box, lebar yang kamu tulis sudah termasuk padding dan border.",["Warna teks: color, latar: background","Padding di dalam kotak, margin di luar","Pakai box-sizing: border-box agar hitungan lebar mudah"]),
  L("Tata letak dengan Flexbox",14,"Tambahkan display: flex pada wadah agar anak-anaknya tersusun sejajar. Atur arah dengan flex-direction dan jarak dengan gap.\n\nUntuk rata tengah, gunakan justify-content di sumbu utama dan align-items di sumbu silang.",["display: flex pada wadah, bukan pada anak","gap lebih rapi daripada margin satu per satu","flex-wrap: wrap agar item turun ke baris baru"])
 ],[Q("Properti mana yang memberi ruang di dalam kotak?",["margin","padding","gap","border"],1),Q("Selektor kelas ditulis dengan awalan...",["#",".","*","@"],1),Q("Properti untuk membuat wadah flex adalah...",["display: flex","position: flex","flex: wadah","layout: flex"],0),Q("Nilai box-sizing yang memasukkan padding ke lebar adalah...",["content-box","border-box","padding-box","auto"],1)]),
 M("Halaman responsif",[
  L("Media query dan satuan relatif",12,"Halaman responsif menyesuaikan diri dengan lebar layar. Mulai dari tampilan HP, lalu tambahkan media query untuk layar yang lebih lebar.\n\nSatuan relatif seperti rem dan persen membuat ukuran ikut menyesuaikan.",["Tambahkan meta viewport di head","Tulis gaya HP dulu, lalu @media (min-width: 768px)","Gunakan max-width: 100% pada gambar"]),
  L("Latihan: halaman profil",15,"Gabungkan semuanya. Buat halaman profil dengan foto, nama, daftar keahlian, dan tombol kontak. Pastikan tidak ada gulir ke samping di lebar 320 piksel.",["Mulai dari kerangka HTML","Tambahkan gaya dasar lalu tata letak","Uji di lebar 320, 768, dan 1280"])
 ],[Q("Pendekatan mobile first berarti...",["Menulis gaya layar besar dulu","Menulis gaya HP dulu lalu menambah untuk layar lebar","Menyembunyikan situs di desktop","Memakai satuan piksel saja"],1),Q("Agar gambar tidak melebihi wadahnya, gunakan...",["max-width: 100%","width: 1000px","float: left","overflow: scroll"],0),Q("Tag meta viewport diletakkan di...",["body","head","footer","di dalam img"],1)])
 ]},
{id:"c2",title:"JavaScript untuk Pemula",cat:"Pemrograman Web",lvl:"Menengah",price:249000,img:"laptop",ins:"i1",base:310,ago:90,
 desc:"Dari variabel sampai interaksi halaman. Kamu menulis skrip kecil yang membaca input, mengubah tampilan, dan menyimpan data di peramban.",
 modules:[
 M("Dasar bahasa",[
  L("Variabel dan tipe data",10,"Gunakan let untuk nilai yang berubah dan const untuk nilai tetap. JavaScript punya tipe angka, teks, boolean, array, dan objek.",["Pilih const dulu, ganti ke let bila perlu","Teks diapit tanda kutip","typeof menunjukkan tipe sebuah nilai"]),
  L("Fungsi dan kondisi",12,"Fungsi membungkus langkah yang bisa dipakai ulang. Kondisi if dan else memilih langkah sesuai syarat.\n\nGunakan === untuk membandingkan nilai dan tipe sekaligus.",["Fungsi menerima parameter dan mengembalikan nilai dengan return","Gunakan === bukan ==","Beri nama fungsi berupa kata kerja"])
 ],[Q("Kata kunci untuk nilai yang tidak diganti adalah...",["var","let","const","def"],2),Q("Operator pembanding yang mengecek nilai dan tipe adalah...",["=","==","===","=>"],2),Q("Fungsi mengirim hasil keluar dengan kata kunci...",["return","print","exit","yield"],0)]),
 M("Interaksi halaman",[
  L("Membaca dan mengubah elemen (DOM)",14,"DOM adalah representasi halaman yang bisa dibaca JavaScript. Ambil elemen dengan document.querySelector, lalu ubah teks atau kelasnya.",["querySelector memakai selektor CSS","Ubah teks dengan textContent","Hindari menyisipkan teks pengguna lewat innerHTML tanpa escape"]),
  L("Event dan penyimpanan lokal",14,"Event seperti click dan input memicu fungsi. Data kecil dapat disimpan di localStorage dalam bentuk teks, sehingga objek perlu diubah dengan JSON.stringify.",["addEventListener memasang pendengar event","localStorage hanya menyimpan teks","JSON.parse mengembalikan teks menjadi objek"])
 ],[Q("Method untuk memilih elemen dengan selektor CSS adalah...",["getTag","querySelector","findNode","selectAll"],1),Q("localStorage menyimpan data dalam bentuk...",["Teks","Objek langsung","Berkas biner","Fungsi"],0),Q("Untuk mengubah objek menjadi teks sebelum disimpan gunakan...",["JSON.parse","JSON.stringify","toObject","String.object"],1)])
 ]},
{id:"c3",title:"Dasar Desain Grafis",cat:"Desain",lvl:"Pemula",price:179000,img:"meja2",ins:"i2",base:260,ago:75,
 desc:"Pahami prinsip tata letak, warna, dan huruf, lalu terapkan pada poster dan unggahan media sosial sederhana.",
 modules:[
 M("Prinsip visual",[
  L("Hierarki dan keseimbangan",9,"Mata pembaca mengikuti ukuran, kontras, dan posisi. Tentukan satu hal terpenting dan buat ia paling menonjol, lalu atur sisanya di bawahnya.",["Satu titik fokus per desain","Beri ruang kosong agar napas","Ulangi gaya yang sama untuk elemen sejenis"]),
  L("Warna dan kontras",11,"Palet sederhana terdiri dari satu warna utama, satu aksen, dan netral. Pastikan teks terbaca di atas latarnya: kontras rendah membuat teks sulit dibaca.",["Batasi diri pada tiga warna","Cek kontras teks dengan latar","Warna aksen untuk tindakan penting saja"])
 ],[Q("Apa tujuan hierarki visual?",["Memakai semua warna","Mengarahkan mata ke hal terpenting","Memperkecil gambar","Menambah hiasan"],1),Q("Berapa warna yang disarankan untuk palet sederhana?",["Sekitar tiga","Lima belas","Satu saja tanpa netral","Sebanyak mungkin"],0),Q("Kontras rendah antara teks dan latar menyebabkan...",["Teks sulit dibaca","Desain lebih rapi","Gambar tajam","File lebih kecil"],0)]),
 M("Huruf dan tata letak",[
  L("Memilih dan memasangkan huruf",10,"Pakai dua keluarga huruf paling banyak: satu untuk judul, satu untuk isi. Ukuran, tebal, dan jarak baris membentuk irama baca.",["Maksimal dua keluarga huruf","Jarak baris sekitar 1,4 sampai 1,6 kali ukuran","Hindari teks isi seluruhnya huruf kapital"]),
  L("Grid dan margin",12,"Grid membantu menyejajarkan elemen. Tetapkan margin tepi yang konsisten dan susun elemen pada kolom yang sama agar hasilnya terasa tertata.",["Pakai kolom yang konsisten","Sejajarkan tepi kiri teks dan gambar","Beri jarak sama antar bagian sejenis"])
 ],[Q("Berapa keluarga huruf yang cukup untuk satu desain sederhana?",["Dua","Sepuluh","Tidak ada","Satu per kata"],0),Q("Grid dipakai untuk...",["Menyejajarkan elemen","Mewarnai latar","Mengompres gambar","Menghapus margin"],0),Q("Teks isi panjang sebaiknya...",["Semua huruf kapital","Huruf kapital dan miring","Mudah dibaca dengan jarak baris cukup","Berwarna terang di latar putih"],2)])
 ]},
{id:"c4",title:"Desain Antarmuka Seluler",cat:"Desain",lvl:"Menengah",price:299000,img:"meja",ins:"i2",base:150,ago:40,
 desc:"Rancang layar aplikasi yang jelas: alur pengguna, komponen, ukuran sentuh, dan uji sederhana dengan prototipe kertas.",
 modules:[
 M("Alur dan komponen",[
  L("Memetakan alur pengguna",11,"Mulai dari tujuan pengguna, bukan dari layar. Tulis langkah dari awal sampai tujuan tercapai, lalu cari langkah yang bisa dibuang.",["Satu tujuan utama per alur","Kurangi jumlah ketukan","Tulis keadaan error dan kosong juga"]),
  L("Ukuran sentuh dan jarak",10,"Jari tidak seakurat kursor. Area ketuk sebaiknya sedikitnya sekitar 44 piksel dan diberi jarak dari area ketuk lain agar tidak salah tekan.",["Tombol minimal sekitar 44 piksel","Beri jarak antar tombol","Letakkan aksi utama dekat jangkauan jempol"])
 ],[Q("Alur pengguna sebaiknya dimulai dari...",["Warna tombol","Tujuan pengguna","Logo","Animasi"],1),Q("Ukuran area ketuk yang disarankan kira-kira...",["10 piksel","24 piksel","44 piksel","200 piksel"],2),Q("Keadaan yang perlu dirancang selain keadaan normal adalah...",["Error dan kosong","Hanya loading","Tidak ada","Dark mode saja"],0)]),
 M("Uji cepat",[
  L("Prototipe kertas",9,"Gambar layar di kertas dan minta seseorang mencoba menyelesaikan tugas. Amati di mana ia ragu, jangan langsung menjelaskan.",["Siapkan satu tugas yang jelas","Diam dan amati","Catat titik bingung, bukan pendapat warna"]),
  L("Mengumpulkan umpan balik",9,"Tanyakan apa yang dilakukan dan dipikirkan, bukan apakah mereka suka. Kelompokkan temuan lalu perbaiki yang paling sering muncul lebih dulu.",["Ajukan pertanyaan terbuka","Kelompokkan temuan serupa","Perbaiki masalah paling sering dulu"])
 ],[Q("Saat uji prototipe, sebaiknya kamu...",["Menjelaskan tiap layar","Mengamati tanpa membantu","Menghentikan uji saat ada salah","Menilai warna saja"],1),Q("Pertanyaan umpan balik yang baik bersifat...",["Terbuka","Mengarahkan","Ya atau tidak saja","Hanya tentang suka"],0),Q("Temuan sebaiknya diprioritaskan menurut...",["Seberapa sering muncul","Urutan ditemukan","Selera tim","Warna"],0)])
 ]},
{id:"c5",title:"Kosakata Inggris Sehari-hari",cat:"Bahasa Inggris",lvl:"Pemula",price:0,img:"buku",ins:"i3",base:880,ago:150,
 desc:"Kursus gratis untuk membangun kosakata dan kalimat dasar yang dipakai setiap hari: perkenalan, belanja, dan bertanya arah.",
 modules:[
 M("Perkenalan",[
  L("Menyapa dan memperkenalkan diri",7,"Gunakan Hello atau Hi untuk menyapa, lalu My name is dan I am from untuk memperkenalkan diri. Tutup dengan Nice to meet you.",["Hello, my name is Dewi.","I am from Bandung.","Nice to meet you."]),
  L("Angka, hari, dan waktu",8,"Hafalkan angka satu sampai seratus, nama hari, dan cara menyebut jam. Untuk jam, gunakan It is ... o'clock atau It is half past ....",["Monday sampai Sunday","It is half past two = pukul dua lewat tiga puluh","On untuk hari, at untuk jam"])
 ],[Q("Kalimat untuk memperkenalkan diri adalah...",["My name is Dewi.","I name Dewi.","Name me Dewi.","Dewi my."],0),Q("Kata depan untuk hari adalah...",["at","on","in the","by"],1),Q("\"Nice to meet you\" diucapkan saat...",["Berpamitan","Pertama kali bertemu","Meminta maaf","Berterima kasih"],1)]),
 M("Di tempat umum",[
  L("Berbelanja",8,"Tanyakan harga dengan How much is this? dan sampaikan keinginan dengan I would like .... Gunakan Can I have ...? untuk meminta barang.",["How much is this?","I would like two, please.","Do you accept cash?"]),
  L("Bertanya arah",8,"Gunakan Excuse me, where is ...? lalu pahami petunjuk seperti turn left, turn right, dan go straight.",["Turn left = belok kiri","Go straight = lurus","It is next to the bank = di sebelah bank"])
 ],[Q("\"How much is this?\" menanyakan...",["Waktu","Harga","Arah","Nama"],1),Q("\"Turn left\" artinya...",["Belok kanan","Belok kiri","Lurus","Putar balik"],1),Q("Cara sopan membuka pertanyaan kepada orang asing adalah...",["Hey you","Excuse me","Listen","Come here"],1)])
 ]},
{id:"c6",title:"English untuk Email Profesional",cat:"Bahasa Inggris",lvl:"Menengah",price:199000,img:"buku2",ins:"i3",base:240,ago:60,
 desc:"Tulis email kerja yang jelas dan sopan: subjek, pembuka, permintaan, tindak lanjut, dan penutup.",
 modules:[
 M("Struktur email",[
  L("Subjek dan salam",8,"Subjek singkat menjelaskan isi, misalnya Meeting request: project update. Buka dengan Dear Mr. Rahman atau Hello Anita sesuai tingkat kenalan.",["Subjek maksimal sekitar delapan kata","Dear untuk formal, Hello atau Hi untuk santai","Cek ejaan nama penerima"]),
  L("Menyampaikan permintaan dengan sopan",10,"Gunakan Could you please ... atau I would appreciate it if you could .... Sertakan batas waktu agar jelas.",["Could you please send the report by Friday?","Awali dengan konteks singkat","Ucapkan terima kasih di akhir"])
 ],[Q("Salam yang cocok untuk email formal adalah...",["Yo,","Dear Mr. Rahman,","Hey bro,","Sup,"],1),Q("Permintaan yang sopan adalah...",["Send it now.","Could you please send it by Friday?","You must send it.","Send!"],1),Q("Subjek email yang baik bersifat...",["Singkat dan jelas","Kosong","Panjang sekali","Huruf kapital semua"],0)]),
 M("Menutup dan menindaklanjuti",[
  L("Penutup yang tepat",7,"Akhiri dengan kalimat penutup lalu salam, misalnya Best regards atau Kind regards, diikuti nama dan jabatan.",["Best regards untuk umum","Sertakan nama dan jabatan","Tutup dengan tindakan berikutnya"]),
  L("Menindaklanjuti tanpa terkesan menuntut",8,"Saat perlu mengingatkan, gunakan I am following up on ... atau Just a gentle reminder .... Hindari nada menyalahkan.",["I am following up on my email from Monday.","Sebut tanggal email sebelumnya","Tawarkan bantuan bila ada kendala"])
 ],[Q("Penutup formal yang umum adalah...",["Later","Kind regards","Cheers dude","Bye"],1),Q("Cara menindaklanjuti dengan halus adalah...",["Why no reply?","I am following up on my earlier email.","Answer me now.","Ignore"],1),Q("Setelah penutup sebaiknya ditulis...",["Nama pengirim","Kata sandi","Nomor kartu","Tidak ada"],0)])
 ]},
{id:"c7",title:"Akuntansi Dasar untuk Pemilik Usaha",cat:"Akuntansi",lvl:"Pemula",price:199000,img:"meja",ins:"i4",base:330,ago:100,
 desc:"Catat uang masuk dan keluar usahamu dengan rapi. Kamu belajar persamaan akuntansi, jurnal sederhana, dan memisahkan uang pribadi dari uang usaha.",
 modules:[
 M("Konsep dasar",[
  L("Persamaan akuntansi",9,"Aset sama dengan kewajiban ditambah modal. Aset adalah apa yang dimiliki usaha, kewajiban adalah utang, dan modal adalah bagian pemilik.",["Aset = Kewajiban + Modal","Kas, persediaan, dan peralatan adalah aset","Pisahkan uang pribadi dan usaha"]),
  L("Mencatat transaksi harian",11,"Setiap transaksi dicatat dengan tanggal, keterangan, dan nilai. Mulailah dengan buku kas: uang masuk di satu kolom, uang keluar di kolom lain.",["Catat saat transaksi terjadi","Simpan bukti seperti nota","Cocokkan saldo buku dengan uang di tangan"])
 ],[Q("Persamaan akuntansi yang benar adalah...",["Aset = Kewajiban + Modal","Modal = Aset + Kewajiban","Kewajiban = Aset + Modal","Aset = Modal - Kas"],0),Q("Manakah yang termasuk aset?",["Utang ke pemasok","Kas","Gaji terutang","Pinjaman bank"],1),Q("Mengapa bukti transaksi perlu disimpan?",["Sebagai dasar pencatatan","Untuk hiasan","Agar kas bertambah","Tidak perlu"],0)]),
 M("Jurnal dan laba",[
  L("Debit dan kredit",12,"Setiap transaksi memengaruhi minimal dua akun, dan jumlah debit harus sama dengan kredit. Menjual barang tunai menambah kas (debit) dan penjualan (kredit).",["Debit kiri, kredit kanan","Total debit = total kredit","Satu transaksi bisa melibatkan lebih dari dua akun"]),
  L("Menghitung laba rugi sederhana",12,"Laba adalah pendapatan dikurangi biaya. Jika biaya lebih besar dari pendapatan, usaha mengalami rugi pada periode itu.",["Laba = Pendapatan - Biaya","Hitung per periode, misalnya per bulan","Biaya mencakup bahan, gaji, dan sewa"])
 ],[Q("Dalam jurnal, jumlah debit harus...",["Lebih besar dari kredit","Sama dengan kredit","Lebih kecil dari kredit","Tidak dihitung"],1),Q("Laba dihitung dengan...",["Pendapatan - Biaya","Biaya - Pendapatan","Aset + Modal","Kas x 2"],0),Q("Penjualan tunai menambah akun...",["Kas","Utang","Modal pribadi saja","Tidak ada"],0)])
 ]},
{id:"c8",title:"Laporan Keuangan Usaha Kecil",cat:"Akuntansi",lvl:"Lanjut",price:349000,img:"buku2",ins:"i4",base:90,ago:20,
 desc:"Susun laporan laba rugi, neraca, dan arus kas sederhana dari catatan harianmu, lalu baca angka-angkanya untuk keputusan usaha.",
 modules:[
 M("Menyusun laporan",[
  L("Laporan laba rugi",12,"Laporan laba rugi merangkum pendapatan dan biaya dalam satu periode. Susun dari atas: pendapatan, harga pokok, laba kotor, biaya operasional, lalu laba bersih.",["Laba kotor = Pendapatan - Harga pokok","Laba bersih = Laba kotor - Biaya operasional","Gunakan periode yang sama dengan pembukuan"]),
  L("Neraca",12,"Neraca memotret posisi keuangan pada satu tanggal: aset di satu sisi, kewajiban dan modal di sisi lain, dan keduanya harus seimbang.",["Aset sama dengan kewajiban plus modal","Laba bersih menambah modal","Urutkan aset dari yang paling mudah dicairkan"])
 ],[Q("Laba kotor dihitung dari...",["Pendapatan - Harga pokok","Pendapatan + Biaya","Aset - Modal","Kas - Utang"],0),Q("Neraca menggambarkan keuangan pada...",["Satu tanggal tertentu","Satu tahun penuh","Tidak ada waktu","Hanya hari libur"],0),Q("Aset yang paling mudah dicairkan adalah...",["Kas","Gedung","Mesin","Tanah"],0)]),
 M("Membaca angka",[
  L("Arus kas",11,"Arus kas menunjukkan uang masuk dan keluar nyata. Usaha bisa untung di laporan tetapi kekurangan kas bila pelanggan belum membayar.",["Pisahkan kas operasional dan lainnya","Pantau piutang","Siapkan cadangan kas untuk beberapa bulan"]),
  L("Rasio sederhana",10,"Margin laba bersih adalah laba bersih dibagi pendapatan. Rasio membantu membandingkan bulan ke bulan, bukan hanya melihat angka mentah.",["Margin = Laba bersih / Pendapatan","Bandingkan dengan periode sebelumnya","Satu rasio tidak cukup, lihat tren"])
 ],[Q("Usaha bisa untung tetapi kekurangan kas karena...",["Piutang belum dibayar","Laba selalu jadi kas","Biaya tidak ada","Neraca salah"],0),Q("Margin laba bersih adalah...",["Laba bersih / Pendapatan","Pendapatan / Laba","Aset / Modal","Kas / Utang"],0),Q("Rasio paling berguna bila...",["Dibandingkan antarperiode","Dilihat sekali saja","Tanpa data","Dihitung acak"],0)])
 ]}
]}
