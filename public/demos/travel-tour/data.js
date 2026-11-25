/* Nusa Jelajah Travel (demo fiktif): data, seed, dan aturan harga. Semua tersimpan di localStorage. */
var T=(function(){
"use strict";
var KEY="travel.v1";
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function pd(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function today(){return iso(new Date())}
function addD(s,n){var d=pd(s);d.setDate(d.getDate()+n);return iso(d)}
function diff(a,b){return Math.round((pd(b)-pd(a))/864e5)}
var HARI=["Min","Sen","Sel","Rab","Kam","Jum","Sab"],BLN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function dfmt(s){var d=pd(s);return HARI[d.getDay()]+", "+d.getDate()+" "+BLN[d.getMonth()]+" "+d.getFullYear()}
function dshort(s){var d=pd(s);return d.getDate()+" "+BLN[d.getMonth()]+" "+d.getFullYear()}
function stamp(t){var d=new Date(t);return dshort(iso(d))+" "+pad(d.getHours())+":"+pad(d.getMinutes())}
function rp(n){n=Math.round(n||0);return (n<0?"-":"")+"Rp "+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function sum(a,f){var s=0;for(var i=0;i<a.length;i++)s+=f(a[i]);return s}

var PH={
 borobudur:"Candi Borobudur dari sisi barat laut",prambanan:"Relief candi di kompleks Prambanan",bromo:"Gunung Bromo dan Semeru dari kaldera Tengger",
 ijen:"Kawah Ijen dengan danau asam",bali:"Sawah bertingkat Tegalalang, Bali",gili:"Pantai Gili Trawangan",rajaampat:"Gugusan pulau karang di Wayag, Raja Ampat",
 padar:"Pulau Padar, Flores",toba:"Danau Toba dari Samosir",karimunjawa:"Laut dangkal di Karimunjawa",jakarta:"Monumen Nasional dan pusat kota Jakarta"
};
var DESTS=["Yogyakarta","Bromo dan Ijen","Bali","Bali dan Gili","Raja Ampat","Labuan Bajo","Danau Toba","Karimunjawa","Jakarta"];
var TEMAS=["Budaya","Alam dan gunung","Pantai dan pulau","Kota"];
var TIPES=["Open trip","Paket privat"];
var INS=65000;
var PROMOS=[
 {c:"JALAN10",t:"pct",v:10,max:300000,min:1500000,d:"Diskon 10% (maks Rp 300.000), belanja minimal Rp 1.500.000"},
 {c:"HEMAT200",t:"flat",v:200000,min:3000000,d:"Potongan Rp 200.000, belanja minimal Rp 3.000.000"},
 {c:"LEBARAN",t:"pct",v:15,max:500000,min:0,exp:true,d:"Promo musiman (sudah berakhir)"}
];
var METHODS=["Transfer Bank Contoh","QRIS contoh","Virtual account contoh"];
var FAQ=[
 {q:"Apakah tiket pesawat atau kereta sudah termasuk?",a:"Belum, kecuali tertulis di bagian Termasuk. Titik kumpul ada di kota tujuan."},
 {q:"Berapa batas usia anak?",a:"Anak berusia 2 sampai 11 tahun dihitung sebagai anak dan memakai satu kursi. Untuk bayi di bawah 2 tahun, hubungi biro lewat WhatsApp."},
 {q:"Bagaimana cara pembayaran?",a:"DP 30% paling lambat 1 hari setelah booking, pelunasan paling lambat 14 hari sebelum berangkat. Jika berangkat kurang dari 14 hari lagi, bayar lunas."},
 {q:"Apakah jadwal bisa dipindah?",a:"Bisa satu kali tanpa biaya paling lambat 21 hari sebelum berangkat, selama kursi di jadwal baru masih ada."},
 {q:"Bagaimana jika cuaca buruk?",a:"Urutan acara dapat disesuaikan di lapangan oleh pemandu demi keselamatan. Pembatalan acara oleh biro karena cuaca ekstrem diganti jadwal lain."}
];
var SYARAT=[
 "Harga dalam Rupiah per peserta, berlaku untuk jadwal yang dipilih. Harga turun bila peserta dalam satu booking lebih banyak.",
 "Kamar twin diisi dua dewasa. Kamar single dikenakan tambahan sesuai paket. Anak berbagi kamar dengan dewasa.",
 "Booking dianggap sah setelah DP terkonfirmasi. DP yang tidak dibayar sampai jatuh tempo membuat booking dapat dibatalkan.",
 "Pembatalan 30 hari atau lebih sebelum berangkat: dana kembali 75% dari pembayaran terkonfirmasi. 14 sampai 29 hari: 50%. Kurang dari 14 hari: tidak ada pengembalian.",
 "Peserta wajib membawa tanda pengenal sesuai data yang diisi. Perjalanan gunung memerlukan surat sehat.",
 "Pendaftaran ditutup 3 hari sebelum berangkat. Ini halaman demo: harga, jadwal, dan paket adalah contoh fiktif."
];
var RENT=[
 {id:"r1",n:"Minibus Hiace 14 kursi + sopir",p:1400000,u:"hari",d:"Cocok untuk rombongan keluarga. BBM dan parkir ditanggung penyewa."},
 {id:"r2",n:"Mobil keluarga 7 kursi + sopir",p:850000,u:"hari",d:"Untuk 4 sampai 6 orang. Sudah termasuk sopir, BBM belum."},
 {id:"r3",n:"Motor matic",p:100000,u:"hari",d:"Helm 2 buah. Wajib SIM C dan jaminan identitas."},
 {id:"r4",n:"Homestay keluarga 2 kamar",p:450000,u:"malam",d:"Dua kamar, kamar mandi dalam, sarapan sederhana."},
 {id:"r5",n:"Homestay rumah 4 kamar",p:900000,u:"malam",d:"Satu rumah utuh untuk rombongan sampai 10 orang."}
];

function P(o){return o}
function seedPkgs(){return [
 P({id:"p1",name:"Yogyakarta Klasik 3H2M",dest:"Yogyakarta",tipe:"Open trip",tema:"Budaya",active:true,health:false,cover:"borobudur",photos:["borobudur","prambanan"],t1:1450000,t3:1350000,t6:1250000,child:75,single:350000,optN:"Sunrise di bukit pandang",optP:120000,
  desc:"Tiga hari menyusuri keraton, Borobudur, dan Prambanan dengan pemandu lokal. Ritme santai, cocok untuk keluarga.",
  inc:["Hotel bintang 3, 2 malam (twin)","Transportasi AC selama tur","Tiket masuk sesuai itinerary","Makan 5 kali","Pemandu lokal","Air mineral di kendaraan"],
  exc:["Tiket pesawat atau kereta ke Yogyakarta","Pengeluaran pribadi dan tip","Makan di luar jadwal","Kenaikan tarif tiket masuk"],
  it:[{t:"Tiba, keraton, dan Malioboro",d:"Jemput di bandara atau stasiun, check-in hotel. Sore ke keraton dan taman air, makan malam gudeg, lalu jalan di Malioboro."},{t:"Borobudur dan Prambanan",d:"Pagi ke Borobudur (naik candi sesuai kuota tiket), makan siang, sore ke Prambanan. Malam bebas."},{t:"Belanja oleh-oleh dan pulang",d:"Sarapan, belanja oleh-oleh, lalu diantar ke bandara atau stasiun sesuai jam pulang."}],
  faq:[{q:"Apakah bisa naik ke bangunan Borobudur?",a:"Naik candi dibatasi kuota harian oleh pengelola. Kami mendaftarkan kuota atas nama peserta saat booking."}],meet:"Bandara atau stasiun Yogyakarta, jemput 08.00 dengan papan nama."}),
 P({id:"p2",name:"Bromo dan Ijen Sunrise 3H2M",dest:"Bromo dan Ijen",tipe:"Open trip",tema:"Alam dan gunung",active:true,health:true,cover:"bromo",photos:["bromo","ijen"],t1:1850000,t3:1750000,t6:1650000,child:75,single:400000,optN:"Porter troli di Ijen",optP:150000,
  desc:"Dua gunung dalam tiga hari: matahari terbit di Bromo dan pendakian dini hari ke Kawah Ijen. Perlu fisik cukup dan pakaian hangat.",
  inc:["Penginapan sederhana 2 malam (twin)","Jeep Bromo (4 orang per jeep)","Tiket taman nasional dan Ijen","Transportasi antar kota","Makan 4 kali","Pemandu dan masker gas"],
  exc:["Tiket menuju Malang","Tip pemandu dan sopir jeep","Porter pribadi","Pengeluaran pribadi"],
  it:[{t:"Malang menuju kaki Bromo",d:"Jemput di Malang, perjalanan ke Cemoro Lawang. Makan malam dan istirahat lebih awal."},{t:"Sunrise Bromo, lanjut Banyuwangi",d:"Dini hari naik jeep ke titik pandang, lalu kawah dan lautan pasir. Sarapan, perjalanan sore ke Banyuwangi."},{t:"Kawah Ijen dan pulang",d:"Tengah malam mulai pendakian Ijen. Melihat danau kawah saat fajar, turun, sarapan, antar ke stasiun atau bandara."}],
  faq:[{q:"Apakah api biru pasti terlihat?",a:"Tidak dijamin. Pemandangan bergantung cuaca dan kondisi kawah pada hari itu."},{q:"Perlu perlengkapan apa?",a:"Jaket tebal, sarung tangan, senter kepala, dan sepatu tertutup. Masker gas kami sediakan."}],meet:"Stasiun atau bandara Malang, jemput 10.00."}),
 P({id:"p3",name:"Bali Ubud Santai 4H3M",dest:"Bali",tipe:"Paket privat",tema:"Budaya",active:true,health:false,cover:"bali",photos:["bali"],t1:2950000,t3:2750000,t6:2550000,child:75,single:900000,optN:"Kelas memasak Bali",optP:250000,
  desc:"Empat hari berbasis di Ubud: sawah bertingkat, pura, pasar seni, dan waktu luang. Grup kecil dengan kendaraan sendiri.",
  inc:["Hotel butik di Ubud, 3 malam (twin)","Kendaraan pribadi AC dan sopir","Tiket masuk objek wisata","Sarapan 3 kali, makan 3 kali","Pemandu berbahasa Indonesia"],
  exc:["Tiket pesawat ke Bali","Makan di luar jadwal","Kegiatan opsional","Tip"],
  it:[{t:"Kedatangan dan Ubud",d:"Jemput di bandara, check-in di Ubud, sore jalan kaki ke pasar seni dan pura."},{t:"Sawah bertingkat dan kebun kopi",d:"Pagi ke sawah bertingkat, mampir kebun kopi dan rumah tenun, sore bebas."},{t:"Pura dan desa seni",d:"Mengunjungi pura tirta dan desa pengrajin ukir, malam menonton tari."},{t:"Belanja dan pulang",d:"Sarapan, belanja oleh-oleh, diantar ke bandara."}],
  faq:[{q:"Apakah jadwal bisa disesuaikan?",a:"Ya, paket privat memakai kendaraan sendiri sehingga urutan acara bisa diatur bersama pemandu."}],meet:"Bandara Bali, jemput sesuai jam mendarat."}),
 P({id:"p4",name:"Bali Ubud dan Gili Trawangan 5H4M",dest:"Bali dan Gili",tipe:"Open trip",tema:"Pantai dan pulau",active:true,health:false,cover:"bali",photos:["bali","gili"],t1:3950000,t3:3700000,t6:3450000,child:75,single:1100000,optN:"Snorkeling tiga titik",optP:180000,
  desc:"Dua malam di Ubud, dua malam di Gili Trawangan. Perpindahan dengan kapal cepat, tanpa kendaraan bermotor di pulau.",
  inc:["Hotel Ubud 2 malam dan penginapan Gili 2 malam (twin)","Kapal cepat pergi-pulang","Transportasi darat di Bali","Sarapan 4 kali","Pemandu di Bali"],
  exc:["Tiket pesawat","Makan siang dan malam","Sewa sepeda di Gili","Tip"],
  it:[{t:"Tiba di Bali, Ubud",d:"Jemput di bandara dan menuju Ubud. Sore bebas."},{t:"Sawah dan pura",d:"Mengunjungi sawah bertingkat dan pura, sore kembali ke hotel."},{t:"Kapal ke Gili",d:"Pagi menuju pelabuhan, kapal cepat ke Gili Trawangan. Siang bebas di pantai."},{t:"Keliling pulau",d:"Bersepeda mengelilingi pulau dan snorkeling (opsional)."},{t:"Kembali ke Bali",d:"Kapal pagi ke Bali, diantar ke bandara."}],
  faq:[{q:"Bagaimana jika ombak tinggi?",a:"Jadwal kapal bisa bergeser. Kami mengatur ulang tanpa biaya tambahan di paket."}],meet:"Bandara Bali, jemput 09.00."}),
 P({id:"p5",name:"Raja Ampat Explorer 5H4M",dest:"Raja Ampat",tipe:"Paket privat",tema:"Pantai dan pulau",active:true,health:false,cover:"rajaampat",photos:["rajaampat"],t1:8900000,t3:8400000,t6:7900000,child:80,single:1800000,optN:"Sewa alat snorkeling lengkap",optP:150000,
  desc:"Lima hari menjelajah gugusan pulau karang dengan perahu motor. Penginapan homestay tepi pantai, snorkeling di titik terumbu.",
  inc:["Homestay 4 malam (twin)","Perahu motor antar pulau","Izin masuk kawasan konservasi","Makan 3 kali sehari","Pemandu lokal"],
  exc:["Tiket pesawat ke Sorong","Penyeberangan Sorong ke Waisai di luar jadwal","Alat selam","Tip"],
  it:[{t:"Sorong ke Waisai",d:"Jemput di Sorong, kapal ke Waisai, lanjut ke homestay."},{t:"Pulau karang dan teluk",d:"Perahu ke teluk dan titik pandang, snorkeling siang."},{t:"Gugusan pulau",d:"Seharian di laut: pasir putih, snorkeling di dua titik, makan siang di pantai."},{t:"Desa dan terumbu",d:"Pagi ke desa nelayan, siang snorkeling, sore bebas."},{t:"Kembali ke Sorong",d:"Sarapan, kapal pagi ke Sorong, diantar ke bandara."}],
  faq:[{q:"Apakah cocok untuk anak?",a:"Cocok untuk anak yang berani di laut dan memakai pelampung. Perjalanan perahu cukup lama."}],meet:"Bandara Sorong, jemput sesuai jam mendarat."}),
 P({id:"p6",name:"Labuan Bajo Sailing 3H2M",dest:"Labuan Bajo",tipe:"Open trip",tema:"Pantai dan pulau",active:true,health:true,cover:"padar",photos:["padar"],t1:4750000,t3:4450000,t6:4150000,child:80,single:750000,optN:"Dokumentasi foto dan video",optP:150000,
  desc:"Dua malam di atas kapal kayu keliling pulau-pulau, trekking bukit di Padar, dan snorkeling. Kabin twin berbagi.",
  inc:["Kapal 2 malam, kabin twin","Makan di kapal","Izin taman nasional","Pemandu dan kru","Alat snorkeling"],
  exc:["Tiket pesawat ke Labuan Bajo","Hotel sebelum atau sesudah kapal","Tip kru","Pengeluaran pribadi"],
  it:[{t:"Naik kapal, pulau pertama",d:"Kumpul di pelabuhan, kapal berangkat. Singgah di pulau pertama, snorkeling, menginap di kapal."},{t:"Padar dan pantai",d:"Pagi trekking singkat ke bukit pandang Padar, siang pantai dan snorkeling, malam di kapal."},{t:"Kembali ke pelabuhan",d:"Sarapan, snorkeling terakhir, kembali ke Labuan Bajo siang hari."}],
  faq:[{q:"Apakah ada sinyal di kapal?",a:"Sinyal hilang timbul. Siapkan hiburan luring."},{q:"Apakah aman untuk yang tidak bisa berenang?",a:"Aman dengan rompi pelampung. Kru mendampingi saat snorkeling."}],meet:"Pelabuhan Labuan Bajo, kumpul 08.00."}),
 P({id:"p7",name:"Danau Toba dan Samosir 4H3M",dest:"Danau Toba",tipe:"Open trip",tema:"Alam dan gunung",active:true,health:false,cover:"toba",photos:["toba"],t1:3250000,t3:3050000,t6:2850000,child:75,single:600000,optN:"Sewa motor keliling Samosir",optP:120000,
  desc:"Menyeberang ke Samosir, desa tradisional, bukit pandang, dan sore di tepi danau. Suhu sejuk, bawa jaket.",
  inc:["Penginapan di Samosir 3 malam (twin)","Kapal penyeberangan","Transportasi darat","Makan 6 kali","Pemandu lokal"],
  exc:["Tiket pesawat ke Medan","Perjalanan Medan ke Parapat di luar paket jika menginap","Tip","Belanja pribadi"],
  it:[{t:"Medan ke Parapat",d:"Jemput di Medan, perjalanan ke Parapat, makan siang, menyeberang ke Samosir."},{t:"Desa tradisional",d:"Mengunjungi desa dan rumah adat, pasar, dan makan malam di tepi danau."},{t:"Bukit pandang dan air terjun",d:"Pagi ke bukit pandang, siang ke air terjun, sore bebas."},{t:"Kembali ke Medan",d:"Kapal pagi ke Parapat, kembali ke Medan, diantar ke bandara."}],
  faq:[{q:"Kapan waktu terbaik berkunjung?",a:"Langit cerah umumnya di musim kemarau, tetapi paket tetap berjalan sepanjang tahun."}],meet:"Bandara Medan, jemput 07.00."}),
 P({id:"p8",name:"Karimunjawa Weekend 3H2M",dest:"Karimunjawa",tipe:"Open trip",tema:"Pantai dan pulau",active:true,health:false,cover:"karimunjawa",photos:["karimunjawa"],t1:1950000,t3:1850000,t6:1750000,child:75,single:450000,optN:"Foto bawah air",optP:175000,
  desc:"Akhir pekan di pulau: snorkeling, pantai berpasir, dan matahari terbenam di dermaga. Kapal dari Jepara.",
  inc:["Penginapan 2 malam (twin)","Kapal Jepara pergi-pulang","Perahu keliling pulau","Alat snorkeling","Makan 5 kali"],
  exc:["Perjalanan ke Jepara","Tip","Sewa motor di pulau"],
  it:[{t:"Jepara ke Karimunjawa",d:"Kumpul di pelabuhan, kapal ke pulau, check-in penginapan, sore ke dermaga."},{t:"Keliling pulau kecil",d:"Perahu ke tiga titik snorkeling dan pantai berpasir, makan siang ikan bakar."},{t:"Pantai dan pulang",d:"Pagi bebas, siang kapal kembali ke Jepara."}],
  faq:[{q:"Apakah kapal bisa batal karena ombak?",a:"Bisa. Jika kapal reguler tidak berlayar, jadwal dipindah ke keberangkatan berikutnya."}],meet:"Pelabuhan Jepara, kumpul 06.00."}),
 P({id:"p9",name:"Jakarta Heritage 2H1M",dest:"Jakarta",tipe:"Open trip",tema:"Kota",active:true,health:false,cover:"jakarta",photos:["jakarta"],t1:1150000,t3:1050000,t6:950000,child:70,single:300000,optN:"Tiket Monas ke pelataran puncak",optP:50000,
  desc:"Dua hari menjelajah pusat kota: Monas, kota tua, museum, dan kuliner. Naik kendaraan AC, mudah untuk pemula.",
  inc:["Hotel 1 malam (twin)","Kendaraan AC","Tiket museum sesuai itinerary","Makan 3 kali","Pemandu"],
  exc:["Tiket menuju Jakarta","Tiket Monas ke puncak","Belanja pribadi"],
  it:[{t:"Monas dan kota tua",d:"Jemput di hotel, ke kawasan Monas, kota tua, dan museum. Makan malam kuliner khas."},{t:"Museum dan belanja",d:"Sarapan, museum, pasar oleh-oleh, lalu diantar ke stasiun atau bandara."}],
  faq:[{q:"Apakah bisa tambah malam?",a:"Bisa. Hubungi biro untuk perpanjangan hotel."}],meet:"Hotel mitra di Jakarta pusat, jemput 08.30."})
]}

var OFFS={p1:[-21,5,19,33,61],p2:[-9,12,26,47],p3:[8,22,40,70],p4:[16,30,52],p5:[27,55,90],p6:[10,24,45],p7:[-30,18,40],p8:[-1,6,20,34,62],p9:[3,17,31]};
var QUOTA={p1:20,p2:16,p3:8,p4:14,p5:10,p6:12,p7:12,p8:16,p9:20};
var NAMES=["Rina Anggraini","Dedi Prasetyo","Sari Wulandari","Budi Hartono","Maya Lestari","Agus Setiawan","Nia Ramadhani","Fajar Nugroho","Putri Maharani","Hendra Gunawan","Lina Marlina","Yusuf Hakim","Citra Dewi","Andi Saputra","Wati Susanti","Joko Santoso","Dewi Kartika","Rizky Firmansyah","Mega Puspita","Bagas Wicaksono","Tari Oktaviani","Eko Purnomo","Indah Permata","Rudi Hermawan"];

/* ---------- harga ---------- */
function tierPrice(p,n){return n>=6?p.t6:n>=3?p.t3:p.t1}
function checkPromo(code,sub){
 code=String(code||"").trim().toUpperCase();
 if(!code)return{ok:false,msg:"Masukkan kode promo."};
 for(var i=0;i<PROMOS.length;i++){var m=PROMOS[i];if(m.c===code){
  if(m.exp)return{ok:false,msg:"Kode "+code+" sudah berakhir."};
  if(sub<m.min)return{ok:false,msg:"Kode "+code+" berlaku untuk belanja minimal "+rp(m.min)+"."};
  var amt=m.t==="pct"?Math.min(Math.round(sub*m.v/100),m.max):m.v;
  return{ok:true,code:code,amt:amt,msg:"Kode "+code+" dipakai: potongan "+rp(amt)+"."};}}
 return{ok:false,msg:"Kode promo tidak dikenal."};
}
function quote(p,o){
 var n=o.a+o.k,ua=tierPrice(p,n),uk=Math.round(ua*p.child/100/5000)*5000,L=[];
 L.push({l:"Dewasa",q:o.a,u:ua});
 if(o.k)L.push({l:"Anak (2-11 tahun)",q:o.k,u:uk});
 if(o.s)L.push({l:"Tambahan kamar single",q:o.s,u:p.single});
 if(o.ins)L.push({l:"Asuransi perjalanan",q:n,u:INS});
 if(o.opt)L.push({l:p.optN,q:o.opt,u:p.optP});
 var sub=sum(L,function(x){return x.q*x.u}),disc=0,pr=null;
 if(o.promo){pr=checkPromo(o.promo,sub);if(pr.ok)disc=pr.amt}
 return{lines:L,sub:sub,disc:disc,promo:pr,total:sub-disc,ua:ua,uk:uk};
}
function planPay(total,depDate,createdDate,mode){
 var dpOn=diff(createdDate,depDate)>=14&&mode==="dp";
 if(!dpOn){var due=addD(createdDate,1);return{mode:"full",dpAmt:total,dpDue:due,finalDue:due}}
 var dp=Math.ceil(total*db.biro.dp/100/1000)*1000,dd=addD(createdDate,1);
 return{mode:"dp",dpAmt:dp,dpDue:dd,finalDue:addD(depDate,-14)};
}

/* ---------- penyimpanan ---------- */
var db=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){return false}}
function load(){
 try{var s=localStorage.getItem(KEY);if(s){var d=JSON.parse(s);if(d&&d.v===1&&d.pkgs&&d.books){db=d;return}}}catch(e){}
 seed();save();
}
function reset(){try{localStorage.removeItem(KEY)}catch(e){}seed();save()}
function pkg(id){for(var i=0;i<db.pkgs.length;i++)if(db.pkgs[i].id===id)return db.pkgs[i];return null}
function dep(id){for(var i=0;i<db.deps.length;i++)if(db.deps[i].id===id)return db.deps[i];return null}
function book(code){code=String(code||"").trim().toUpperCase();for(var i=0;i<db.books.length;i++)if(db.books[i].code===code)return db.books[i];return null}
function depsOf(pid){return db.deps.filter(function(d){return d.pkg===pid}).sort(function(a,b){return a.date<b.date?-1:1})}
function seatsUsed(did){return sum(db.books.filter(function(b){return b.dep===did&&b.status!=="batal"}),function(b){return b.a+b.k})}
function seatsLeft(d){return d.quota-seatsUsed(d.id)}
function depState(d){
 var t=today();
 if(d.date<t)return{k:"lewat",label:"Sudah lewat"};
 if(d.closed)return{k:"tutup",label:"Ditutup"};
 var l=seatsLeft(d);
 if(l<=0)return{k:"penuh",label:"Penuh"};
 if(diff(t,d.date)<3)return{k:"tutup",label:"Pendaftaran ditutup"};
 return{k:"ok",label:"Sisa "+l+" kursi",left:l};
}
function days(p){return p.it.length}
function dur(p){return days(p)+"H"+(days(p)-1)+"M"}
function rate(pid){var r=db.reviews.filter(function(x){return x.pkg===pid});if(!r.length)return{avg:0,n:0};return{avg:sum(r,function(x){return x.rating})/r.length,n:r.length}}
function paid(b){return sum(b.pays.filter(function(p){return p.st==="ok"}),function(p){return p.amt})}
function pending(b){return sum(b.pays.filter(function(p){return p.st==="menunggu"}),function(p){return p.amt})}
function recompute(b){
 if(b.status!=="menunggu"&&b.status!=="dp"&&b.status!=="lunas")return;
 var p=paid(b);
 b.status=p>=b.total?"lunas":(b.mode==="dp"&&p>=b.dpAmt)?"dp":"menunggu";
}
var SL={menunggu:"Menunggu DP",dp:"DP dibayar",lunas:"Lunas",berangkat:"Berangkat",selesai:"Selesai",batal:"Batal"};
function statusLabel(b){return b.status==="menunggu"&&b.mode==="full"?"Menunggu pembayaran":SL[b.status]}
function overdue(b){
 var t=today();
 if(b.status==="menunggu"&&t>b.dpDue)return b.mode==="full"?"Lewat jatuh tempo":"DP lewat jatuh tempo";
 if(b.status==="dp"&&t>b.finalDue)return"Pelunasan lewat jatuh tempo";
 return"";
}
function refundFor(b){
 var d=dep(b.dep),dd=d?diff(today(),d.date):0,pc=dd>=30?75:dd>=14?50:0;
 return{pct:pc,amt:Math.round(paid(b)*pc/100)};
}
function roomOf(b,i){
 var x=b.pax[i];if(x.t==="K")return"Bersama dewasa";
 var ai=0;for(var j=0;j<i;j++)if(b.pax[j].t==="D")ai++;
 if(ai<b.s)return"Single";
 return"Twin "+(Math.floor((ai-b.s)/2)+1);
}
function docKeys(p,b){var k=["id"];if(p.health)k.push("sehat");if(b.ins)k.push("asuransi");return k}
var DOCL={id:"Identitas",sehat:"Surat sehat",asuransi:"Data asuransi"};
function newCode(){
 var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",c;
 do{c="TRV-";for(var i=0;i<5;i++)c+=A.charAt(Math.floor(Math.random()*A.length))}while(book(c));
 return c;
}
function nextId(prefix){db.seq[prefix]=(db.seq[prefix]||100)+1;return prefix+db.seq[prefix]}

/* ---------- seed ---------- */
function seed(){
 var t=today();
 db={v:1,biro:{nama:"Nusa Jelajah Travel",pin:"2468",dp:30,wa:"081200000100"},pkgs:seedPkgs(),deps:[],books:[],reviews:[],rents:[],seq:{}};
 db.pkgs.forEach(function(p){OFFS[p.id].forEach(function(o,k){db.deps.push({id:p.id+"d"+(k+1),pkg:p.id,date:addD(t,o),quota:QUOTA[p.id],closed:false})})});
 function dp(pid,off){return pkg(pid)&&db.deps.filter(function(d){return d.pkg===pid&&d.date===addD(t,off)})[0]}
 /* [kode, paket, selisih hari berangkat, dewasa, anak, single, asuransi, opsi, kontak, status, hari lalu dibuat, promo, mode] */
 var S=[
  ["TRV-K7M2X","p1",5,2,0,0,1,0,0,"lunas",12,"","dp"],
  ["TRV-Q4N8R","p1",19,3,1,1,0,1,1,"dp",3,"JALAN10","dp"],
  ["TRV-B9T5C","p1",-21,2,0,0,0,0,2,"selesai",50,"","dp"],
  ["TRV-H2W6D","p2",12,2,0,0,1,0,3,"lunas",10,"","full"],
  ["TRV-M8P3F","p2",26,1,0,1,0,0,4,"menunggu",2,"","dp"],
  ["TRV-L5V9G","p2",-9,4,0,0,0,2,5,"selesai",40,"","dp"],
  ["TRV-S3Z7J","p3",8,2,0,0,0,0,6,"lunas",5,"","dp"],
  ["TRV-R6Y4A","p4",16,2,1,0,1,0,7,"dp",4,"","dp"],
  ["TRV-D7X2E","p6",10,4,0,0,0,0,8,"lunas",9,"","dp"],
  ["TRV-F4C8N","p6",10,4,2,0,1,0,9,"lunas",8,"HEMAT200","dp"],
  ["TRV-G9K3P","p6",10,2,0,0,0,0,10,"menunggu",1,"","dp"],
  ["TRV-N2J5V","p8",-1,3,0,1,0,0,11,"berangkat",20,"","dp"],
  ["TRV-W8H6T","p8",6,2,0,0,0,1,12,"lunas",7,"","dp"],
  ["TRV-C3B9Y","p7",-30,2,0,0,0,0,13,"selesai",60,"","dp"],
  ["TRV-P5Q7S","p5",27,2,0,0,0,0,14,"batal",10,"","dp"],
  ["TRV-T6M4H","p9",3,2,0,0,1,0,15,"menunggu",1,"","dp"]
 ];
 var pn=0;
 S.forEach(function(r,idx){
  var p=pkg(r[1]),d=dp(r[1],r[2]);if(!d)return;
  var at=new Date(Date.now()-r[10]*864e5-idx*36e5),cd=iso(at);
  var q=quote(p,{a:r[3],k:r[4],s:r[5],ins:r[6],opt:r[7],promo:r[11]});
  var pl=planPay(q.total,d.date,cd,r[12]);
  var ci=r[8],hp=String(1100+ci*7);
  var b={code:r[0],pkg:p.id,dep:d.id,a:r[3],k:r[4],s:r[5],ins:r[6],opt:r[7],promo:r[11]&&q.promo&&q.promo.ok?r[11]:"",
   contact:{name:NAMES[ci],phone:"0812-0000-"+hp,email:NAMES[ci].split(" ")[0].toLowerCase()+".contoh@example.com"},
   pax:[],lines:q.lines,sub:q.sub,disc:q.disc,total:q.total,mode:pl.mode,dpAmt:pl.dpAmt,dpDue:pl.dpDue,finalDue:pl.finalDue,status:r[9],at:at.toISOString(),pays:[],note:"",refund:null};
  for(var i=0;i<r[3]+r[4];i++){
   var kid=i>=r[3];pn++;
   var nm=i===0?NAMES[ci]:NAMES[(ci+3+pn*5)%NAMES.length];
   var x={n:nm,t:kid?"K":"D",g:(i+pn)%2?"L":"P",bd:kid?(2013+pn%5)+"-0"+(1+pn%8)+"-1"+(pn%9):(1980+pn*3%19)+"-0"+(1+pn%9)+"-"+(10+pn%18),idn:kid?"":"0000"+String(100000000000+pn*7919).slice(0,12),note:"",docs:{}};
   docKeys(p,b).forEach(function(k){x.docs[k]=(b.status==="menunggu")?0:(b.status==="dp"?(k==="id"?2:(pn%2?1:0)):2)});
   b.pax.push(x);
  }
  var cdate=cd,st=r[9],ref=0;
  function add(amt,kind,dayOff,state){ref++;b.pays.push({id:b.code+"-"+ref,at:new Date(at.getTime()+dayOff*864e5).toISOString(),amt:amt,kind:kind,method:METHODS[(idx+ref)%3],ref:"CTH"+(1000+idx*13+ref),st:state||"ok"})}
  if(st==="lunas"||st==="selesai"||st==="berangkat"){
   if(b.mode==="dp"){add(b.dpAmt,"DP",0.2);add(b.total-b.dpAmt,"Pelunasan",Math.min(3,Math.max(0,r[10]-1)))}else add(b.total,"Lunas",0.2);
  }else if(st==="dp"||st==="batal"){add(b.dpAmt,"DP",0.3)}
  else if(b.code==="TRV-T6M4H"){b.pays.push({id:b.code+"-1",at:new Date().toISOString(),amt:b.total,kind:"Lunas",method:METHODS[0],ref:"CTH9001",st:"menunggu"})}
  if(st==="batal"){var rf=Math.round(paid(b)*0.75);b.refund={amt:rf,pct:75,at:new Date(at.getTime()+3*864e5).toISOString()};b.note="Peserta membatalkan karena jadwal kantor berubah."}
  db.books.push(b);
 });
 var RV=[
  ["p1","Rina A.",5,"Itinerary rapi dan waktu bebasnya cukup. Pemandu sabar menjelaskan sejarah candi."],
  ["p1","Dedi P.",4,"Hotel bersih dan lokasinya dekat pusat kota. Makan siang bisa lebih bervariasi."],
  ["p2","Sari W.",5,"Dini hari memang dingin, tapi pemandangannya sepadan. Jeep dan pemandu tepat waktu."],
  ["p2","Budi H.",4,"Pendakian Ijen cukup berat, untungnya ada briefing yang jelas sebelum naik."],
  ["p3","Maya L.",5,"Grup kecil jadi nyaman. Sopir tahu tempat makan enak yang tidak ramai."],
  ["p4","Agus S.",4,"Perpindahan kapal berjalan lancar. Penginapan di pulau sederhana tapi bersih."],
  ["p5","Nia R.",5,"Perjalanan jauh tapi layak. Pemandu hafal titik snorkeling terbaik."],
  ["p6","Fajar N.",5,"Kabin kapal bersih, kru ramah. Trekking pagi di bukit tidak terlalu berat."],
  ["p6","Putri M.",4,"Makanan di kapal enak. Sinyal memang sulit, sesuai yang dijelaskan."],
  ["p7","Hendra G.",4,"Suasana sejuk dan tenang. Jadwal kapal sempat bergeser tapi diinformasikan jauh hari."],
  ["p8","Lina M.",5,"Snorkeling di tiga titik, airnya jernih. Akhir pekan yang pas."],
  ["p9","Yusuf H.",4,"Cocok untuk yang baru pertama ke Jakarta. Museum dan kuliner pas."]
 ];
 RV.forEach(function(r,i){db.reviews.push({id:"v"+(101+i),pkg:r[0],name:r[1],rating:r[2],text:r[3],at:new Date(Date.now()-(i+3)*864e5*4).toISOString(),code:""})});
 db.reviews.push({id:"v200",pkg:"p1",name:NAMES[2].split(" ")[0]+" "+NAMES[2].split(" ")[1].charAt(0)+".",rating:5,text:"Perjalanan terasa tertata dari booking sampai pulang.",at:new Date(Date.now()-30*864e5).toISOString(),code:"TRV-B9T5C"});
 db.seq.v=200;
 db.rents.push({id:"SW101",item:"r1",start:addD(t,12),n:3,q:1,name:"Maya Lestari",phone:"0812-0000-1066",note:"Rombongan keluarga 12 orang.",st:"baru",at:new Date(Date.now()-864e5).toISOString()});
 db.rents.push({id:"SW102",item:"r4",start:addD(t,20),n:2,q:2,name:"Andi Saputra",phone:"0812-0000-1099",note:"",st:"diproses",at:new Date(Date.now()-3*864e5).toISOString()});
 db.seq.SW=102;
}
load();

return{esc:esc,pad:pad,iso:iso,pd:pd,today:today,addD:addD,diff:diff,dfmt:dfmt,dshort:dshort,stamp:stamp,rp:rp,sum:sum,PH:PH,DESTS:DESTS,TEMAS:TEMAS,TIPES:TIPES,INS:INS,PROMOS:PROMOS,METHODS:METHODS,FAQ:FAQ,SYARAT:SYARAT,RENT:RENT,SL:SL,DOCL:DOCL,
 get db(){return db},save:save,reset:reset,pkg:pkg,dep:dep,book:book,depsOf:depsOf,seatsUsed:seatsUsed,seatsLeft:seatsLeft,depState:depState,days:days,dur:dur,rate:rate,paid:paid,pending:pending,recompute:recompute,statusLabel:statusLabel,overdue:overdue,refundFor:refundFor,roomOf:roomOf,docKeys:docKeys,newCode:newCode,nextId:nextId,tierPrice:tierPrice,checkPromo:checkPromo,quote:quote,planPay:planPay};
})();
