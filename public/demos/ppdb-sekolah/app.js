"use strict";
var KEY="ppdb.v1",ADMIN_KEY="ppdb.admin";
var $=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var BLN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function pad(n){return (n<10?"0":"")+n}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function today(){return iso(new Date())}
function parseD(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(s,n){var d=parseD(s);d.setDate(d.getDate()+n);return iso(d)}
function fd(s){if(!s)return"-";var p=s.split("-");return +p[2]+" "+BLN[+p[1]-1]+" "+p[0]}
function fdt(t){var d=new Date(t);return fd(iso(d))+", "+pad(d.getHours())+"."+pad(d.getMinutes())}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||"")&&iso(parseD(s))===s}
function ageAt(dob,ref){var a=parseD(dob),r=parseD(ref),y=r.getFullYear()-a.getFullYear();if(r.getMonth()<a.getMonth()||(r.getMonth()===a.getMonth()&&r.getDate()<a.getDate()))y--;return y}

var JALUR={
 zonasi:{n:"Zonasi",ic:"Z",d:"Berdasarkan jarak rumah ke sekolah, dipadukan dengan nilai rapor.",syarat:["Domisili sesuai Kartu Keluarga (minimal 1 tahun)","Jarak rumah ke sekolah paling jauh 10 km"],extra:[],f:"Skor = 60% x poin jarak + 40% x rata-rata nilai. Poin jarak = 100 - (10 x jarak km), minimal 0."},
 prestasi:{n:"Prestasi",ic:"P",d:"Berdasarkan juara lomba resmi, dipadukan dengan nilai rapor.",syarat:["Juara 1 sampai 3 lomba tingkat kota, provinsi, atau nasional","Sertifikat dikeluarkan dalam 3 tahun terakhir"],extra:[["sertifikat","Sertifikat prestasi"]],f:"Skor = 50% x rata-rata nilai + 50% x poin prestasi. Poin: nasional 100/95/90, provinsi 85/80/75, kota 70/65/60 untuk juara 1/2/3."},
 afirmasi:{n:"Afirmasi",ic:"A",d:"Untuk keluarga kurang mampu yang memiliki kartu bantuan resmi.",syarat:["Memiliki KIP, PKH, KIS, atau SKTM yang masih berlaku","Penghasilan orang tua sesuai ketentuan"],extra:[["kartu","Kartu KIP/PKH/KIS atau SKTM"]],f:"Skor = 70% x rata-rata nilai + bonus kartu. Bonus: KIP 30, PKH 25, KIS 20, SKTM 15."},
 mutasi:{n:"Mutasi orang tua",ic:"M",d:"Untuk anak dari orang tua yang dipindahtugaskan.",syarat:["Orang tua pindah tugas ke wilayah ini","Surat tugas resmi dari instansi"],extra:[["surat","Surat tugas orang tua"]],f:"Skor = rata-rata nilai. Jika sama, yang mendaftar lebih awal diutamakan."}
};
var JK=Object.keys(JALUR);
var JUR=["MIPA","IPS","Bahasa dan Budaya"];
var MAPEL=[["mtk","Matematika"],["ipa","IPA"],["ind","Bahasa Indonesia"],["ing","Bahasa Inggris"],["ips","IPS"]];
var BASE_DOCS=[["kk","Kartu Keluarga"],["akta","Akta kelahiran"],["ijazah","Ijazah atau SKL"],["rapor","Rapor kelas 7 sampai 9"],["foto","Pas foto 3x4"]];
var PRES={nasional:[100,95,90],provinsi:[85,80,75],kota:[70,65,60]},TINGKAT={nasional:"Nasional",provinsi:"Provinsi",kota:"Kota/Kabupaten"};
var KARTU={KIP:30,PKH:25,KIS:20,SKTM:15};
var JOBS=["PNS/TNI/Polri","Karyawan swasta","Wiraswasta","Petani/Nelayan","Buruh","Guru/Dosen","Lainnya"];
var INCOME=["Kurang dari Rp1,5 juta","Rp1,5 juta sampai Rp3 juta","Rp3 juta sampai Rp6 juta","Lebih dari Rp6 juta"];
var STL={menunggu:["Menunggu verifikasi","b-warn"],ditolak:["Berkas perlu perbaikan","b-bad"],terverifikasi:["Terverifikasi","b-ok"]};
var DEC={lulus:["Lulus","b-ok"],cadangan:["Cadangan","b-warn"],tidak:["Tidak lulus","b-bad"]};

var db;
function docKeys(j){return BASE_DOCS.concat((JALUR[j]||{extra:[]}).extra)}
function refDate(){var t=parseD(today());return (t.getMonth()>=6?t.getFullYear()+1:t.getFullYear())+"-07-01"}
function seed(){
 var t=today(),ry=+refDate().slice(0,4),s=7;
 function rnd(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}
 function ri(a,b){return a+Math.floor(rnd()*(b-a+1))}
 var F=["Aditya","Bunga","Citra","Dimas","Eka","Farhan","Gita","Hendra","Intan","Joko","Kirana","Lukman","Mira","Naufal","Oki","Putri","Rangga","Sekar","Tegar","Wulan"];
 var L=["Pratama","Lestari","Wijaya","Santoso","Maharani","Kusuma","Saputra","Anggraini","Hidayat","Permata","Nugroho","Safitri","Ramadhan","Utami","Firmansyah","Puspita","Setiawan","Handayani","Purnama","Wibowo"];
 var PL=["zonasi","zonasi","prestasi","zonasi","afirmasi","zonasi","mutasi","zonasi","prestasi","zonasi"];
 var RS=["Foto buram, unggah ulang","Nama tidak sesuai dengan Kartu Keluarga","Dokumen terpotong di bagian bawah"];
 var apps=[],N=30,i;
 for(i=0;i<N;i++){
  var j=PL[i%10],g={};MAPEL.forEach(function(m){g[m[0]]=ri(62,96)});
  var a={no:"PPDB"+String(ry).slice(2)+"-"+("000"+(i+1)).slice(-4),nisn:String(3100000000+i*7919+ri(0,999)).slice(0,10),
   name:F[(i*7)%20]+" "+L[(i*3+Math.floor(i/20)*7+5)%20],gender:i%2?"P":"L",pob:["Cahaya Baru","Sukamaju","Tirta Mulia"][i%3],
   dob:(ry-16+(i%3===0?1:0))+"-"+pad(ri(1,12))+"-"+pad(ri(1,28)),address:"Jl. Contoh No. "+ri(1,99)+", RT 0"+ri(1,9)+"/RW 0"+ri(1,5),
   phone:"0812-0000-"+pad(ri(10,99))+pad(ri(10,99)).slice(0,2),email:"",father:F[(i*5+3)%20].replace(/[aeiou]$/,"o")+" "+L[(i*3+5)%20],mother:F[(i*3+9)%20]+" "+L[(i*3+5)%20],
   job:JOBS[i%7],pphone:"0812-0000-"+pad(ri(10,99))+pad(ri(10,99)),income:INCOME[j==="afirmasi"?0:ri(1,3)],
   school:["SMP Negeri 1 Cahaya Baru","SMP Negeri 2 Sukamaju","MTs Al-Hikmah","SMP Tunas Bangsa"][i%4],stype:"SMP",gradYear:ry,grades:g,
   jalur:j,jarak:Math.round(rnd()*85+3)/10,tingkat:"",peringkat:"",lomba:"",kartu:"",instansi:"",p1:JUR[ri(0,2)],p2:"",docs:{},decision:null,
   at:new Date(Date.now()-(N-i)*5*3600e3).toISOString()};
  a.phone=a.phone.slice(0,14);a.pphone=a.pphone.slice(0,14);
  a.p2=JUR[(JUR.indexOf(a.p1)+1+ri(0,1))%3];
  if(j==="prestasi"){a.tingkat=["kota","provinsi","nasional"][i%3];a.peringkat=String(1+i%3);a.lomba=["Olimpiade Sains","Lomba Debat","Kejuaraan Renang"][i%3]}
  if(j==="afirmasi")a.kartu=["KIP","PKH","KIS","SKTM"][i%4];
  if(j==="mutasi")a.instansi="Instansi Contoh "+(i%5+1);
  docKeys(j).forEach(function(d){a.docs[d[0]]={name:d[0]+"-"+a.no.slice(-4)+(d[0]==="foto"?".jpg":".pdf"),status:i<20?"setuju":"menunggu",reason:""}});
  if(i>=20&&i<24){var ks=Object.keys(a.docs),k=ks[i%ks.length];a.docs[k].status="tolak";a.docs[k].reason=RS[i%3];ks.forEach(function(x){if(x!==k)a.docs[x].status="setuju"})}
  apps.push(a)}
 var d={v:1,year:ry+"/"+(ry+1),ref:refDate(),pin:"2468",announce:false,draft:null,minAge:14,maxAge:18,
  sched:[{id:"daftar",n:"Pendaftaran online",s:addDays(t,-6),e:addDays(t,8)},{id:"verif",n:"Verifikasi berkas",s:addDays(t,-4),e:addDays(t,10)},{id:"umum",n:"Pengumuman hasil",s:addDays(t,12),e:addDays(t,12)},{id:"ulang",n:"Daftar ulang",s:addDays(t,13),e:addDays(t,19)}],
  quota:{zonasi:{k:6,c:2},prestasi:{k:3,c:2},afirmasi:{k:2,c:1},mutasi:{k:1,c:1}},apps:apps};
 return d}
function load(){try{var r=JSON.parse(localStorage.getItem(KEY));if(r&&r.v===1&&r.apps)return r}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
db=load();if(!db){db=seed();save()}

function find(no){no=String(no||"").trim().toUpperCase();for(var i=0;i<db.apps.length;i++)if(db.apps[i].no===no)return db.apps[i];return null}
function statusOf(a){var k=Object.keys(a.docs),ok=0,i;for(i=0;i<k.length;i++){if(a.docs[k[i]].status==="tolak")return"ditolak";if(a.docs[k[i]].status==="setuju")ok++}return ok===k.length?"terverifikasi":"menunggu"}
function avg(a){var s=0;MAPEL.forEach(function(m){s+=parseFloat(String(a.grades[m[0]]).replace(",","."))||0});return s/MAPEL.length}
function r2(x){return Math.round(x*100)/100}
function score(a){var n=avg(a),p=[["Rata-rata nilai",r2(n)]],t;
 if(a.jalur==="zonasi"){var jp=Math.max(0,100-10*(+a.jarak||0));t=.6*jp+.4*n;p.push(["Poin jarak ("+a.jarak+" km)",r2(jp)])}
 else if(a.jalur==="prestasi"){var pp=(PRES[a.tingkat]||[0,0,0])[(+a.peringkat||1)-1]||0;t=.5*n+.5*pp;p.push(["Poin prestasi",pp])}
 else if(a.jalur==="afirmasi"){var b=KARTU[a.kartu]||0;t=.7*n+b;p.push(["Bonus kartu "+a.kartu,b])}
 else t=n;
 return {n:r2(n),total:r2(t),parts:p}}
function ranking(j){return db.apps.filter(function(a){return a.jalur===j&&statusOf(a)==="terverifikasi"}).map(function(a){return {a:a,s:score(a)}}).sort(function(x,y){return y.s.total-x.s.total||y.s.n-x.s.n||(x.a.at<y.a.at?-1:1)})}
function rankOf(a){var r=ranking(a.jalur);for(var i=0;i<r.length;i++)if(r[i].a.no===a.no)return i+1;return 0}
function counts(j){var c={lulus:0,cadangan:0,tidak:0,total:0,ver:0};db.apps.forEach(function(a){if(a.jalur!==j)return;c.total++;if(statusOf(a)==="terverifikasi")c.ver++;if(a.decision)c[a.decision]++});return c}
function phase(p){var t=today();return t>p.e?"selesai":t>=p.s?"berjalan":"akan"}
function sched(id){return db.sched.filter(function(p){return p.id===id})[0]}
function regOpen(){return phase(sched("daftar"))==="berjalan"}
function setDecision(no,d){var a=find(no);if(!a||statusOf(a)!=="terverifikasi"){toast("Hanya pendaftar terverifikasi yang bisa ditetapkan.",1);return false}
 if(d&&a.decision!==d){var c=counts(a.jalur),q=db.quota[a.jalur];if(d==="lulus"&&c.lulus>=q.k){toast("Kuota lulus jalur "+JALUR[a.jalur].n+" sudah penuh ("+q.k+").",1);return false}
  if(d==="cadangan"&&c.cadangan>=q.c){toast("Kuota cadangan jalur "+JALUR[a.jalur].n+" sudah penuh ("+q.c+").",1);return false}}
 a.decision=d||null;save();return true}
function autoDecide(j){var r=ranking(j),q=db.quota[j];r.forEach(function(x,i){x.a.decision=i<q.k?"lulus":i<q.k+q.c?"cadangan":"tidak"});
 db.apps.forEach(function(a){if(a.jalur===j&&statusOf(a)!=="terverifikasi")a.decision=null});save();return r.length}

/* ---------- UI helpers ---------- */
var app=$("#app"),ui={q:"",jalur:"",status:"",dec:"",sort:"new",page:1,rj:"zonasi",pj:"",pq:""},form=null,armed=null,tt,flash=null;
function toast(m,bad){var t=$("#toast");t.textContent=m;t.className="toast"+(bad?" bad":"");t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},3200)}
function badge(k,map){var m=(map||STL)[k];return m?'<span class="badge '+m[1]+'">'+esc(m[0])+'</span>':'<span class="badge b-mute">Belum ada</span>'}
function isAdmin(){return sessionStorage.getItem(ADMIN_KEY)==="1"}
function unlocked(no){try{return JSON.parse(sessionStorage.getItem("ppdb.ok")||"[]").indexOf(no)>=0}catch(e){return false}}
function unlock(no){var l=[];try{l=JSON.parse(sessionStorage.getItem("ppdb.ok")||"[]")}catch(e){}if(l.indexOf(no)<0)l.push(no);sessionStorage.setItem("ppdb.ok",JSON.stringify(l))}
function opts(list,val,ph){return (ph?'<option value="">'+esc(ph)+'</option>':'')+list.map(function(x){var v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return '<option value="'+esc(v)+'"'+(String(v)===String(val)?" selected":"")+'>'+esc(l)+'</option>'}).join("")}
function totalQuota(){var s=0;JK.forEach(function(j){s+=db.quota[j].k});return s}
function pad2(n){return n<10?"0"+n:""+n}

/* ---------- Beranda ---------- */
function photo(f,alt,cls,w,h){return '<img class="ph '+(cls||'')+'" src="img/'+f+'.jpg" alt="'+esc(alt)+'" width="'+w+'" height="'+h+'" loading="lazy" decoding="async">'}
function ill(){return '<img class="ill ph" src="img/hero.jpg" alt="Gedung sekolah dengan atap genteng dan jendela kaca" width="1000" height="664" decoding="async">'}
var FOTO={zonasi:"Gedung sekolah dua lantai dengan taman di depannya",prestasi:"Upacara bendera di lapangan sekolah dilihat dari jauh",afirmasi:"Buku tulis terbuka dengan pulpen di atasnya",mutasi:"Gedung sekolah empat lantai bercat hijau"};
var FAS=[["fas-kelas","Ruang kelas","Meja dan kursi tertata, jendela besar untuk cahaya alami.","Ruang kelas dengan deretan meja dan kursi",800,533],["fas-perpustakaan","Perpustakaan","Ruang baca dengan komputer katalog dan meja belajar.","Ruang perpustakaan dengan meja baca dan komputer",800,453],["fas-lab","Laboratorium","Alat gelas dan tabung reaksi untuk praktik IPA.","Meja laboratorium dengan gelas kimia dan rak tabung reaksi",670,370],["fas-lapangan","Lapangan dan halaman","Halaman berpaving untuk upacara dan olahraga.","Halaman sekolah berpaving dengan tiang bendera",800,600]];
function fasHtml(){return '<div class="sec-h"><h2>Fasilitas sekolah</h2><span>Foto dari sudut-sudut sekolah</span></div><div class="pols">'+FAS.map(function(f){return '<figure class="pol">'+photo(f[0],f[3],'',f[4],f[5])+'<figcaption><b>'+esc(f[1])+'</b>'+esc(f[2])+'</figcaption></figure>'}).join("")+'</div>'}
function cdInfo(){var d=sched("daftar"),now=Date.now(),s=parseD(d.s).getTime(),e=parseD(addDays(d.e,1)).getTime();
 if(now>=s&&now<e)return {l:"Pendaftaran ditutup dalam",t:e};
 if(now<s)return {l:"Pendaftaran dibuka dalam",t:s};
 var nx=db.sched.filter(function(p){return parseD(p.s).getTime()>now}).sort(function(a,b){return a.s<b.s?-1:1})[0];
 return nx?{l:nx.n+" dimulai dalam",t:parseD(nx.s).getTime()}:{l:"Seluruh tahapan sudah selesai",t:0}}
function cdHtml(){var c=cdInfo();if(!c.t)return '<p class="cdl">'+esc(c.l)+'</p>';var ms=Math.max(0,c.t-Date.now()),s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
 return '<p class="cdl">'+esc(c.l)+'</p><div class="cd" role="timer"><div><b>'+d+'</b><span>hari</span></div><div><b>'+pad2(h)+'</b><span>jam</span></div><div><b>'+pad2(m)+'</b><span>menit</span></div><div><b>'+pad2(s%60)+'</b><span>detik</span></div></div>'}
function tick(){var el=$("#cd");if(el)el.innerHTML=cdHtml()}
setInterval(tick,1000);
function schedHtml(){return '<ol class="ribbon">'+db.sched.map(function(p,i){var st=phase(p);return '<li class="'+st+'"><i>'+(st==="selesai"?"&#10003;":i+1)+'</i><b>'+esc(p.n)+'</b>'+(st==="berjalan"?'<span class="badge b-warn">Sedang berjalan</span>':st==="selesai"?'<span class="badge b-ok">Selesai</span>':'')+'<small>'+(p.s===p.e?fd(p.s):fd(p.s)+" sampai "+fd(p.e))+'</small></li>'}).join("")+'</ol>'}
function jalurCards(){return '<div class="forms">'+JK.map(function(j,n){var c=counts(j),q=db.quota[j];return '<article class="form-j"><div class="fh"><span>Formulir jalur</span><span>No. '+pad2(n+1)+'</span></div><div class="kstamp"><span>'+q.k+'<small>Kuota</small></span></div>'+photo("jalur-"+j,FOTO[j],"",800,400)+'<h3>'+esc(JALUR[j].n)+'</h3><p>'+esc(JALUR[j].d)+'</p><div class="meta">+ '+q.c+' cadangan<br>'+c.total+' pendaftar, '+c.ver+' terverifikasi</div><a class="btn sm sec" href="#/jalur">Syarat dan rumus</a></article>'}).join("")+'</div>'}
function papanHtml(){var act=db.sched.filter(function(p){return phase(p)==="berjalan"}),n1;
 if(act.length)n1='<h3>Tahap yang berjalan</h3>'+act.map(function(p){return '<p><b class="big" style="margin:0">'+esc(p.n)+'</b><small>'+(p.s===p.e?fd(p.s):fd(p.s)+" sampai "+fd(p.e))+'</small></p>'}).join("");
 else{var nx=db.sched.filter(function(p){return phase(p)==="akan"})[0];n1='<h3>Tahap berikutnya</h3>'+(nx?'<p><b class="big" style="margin:0">'+esc(nx.n)+'</b><small>Mulai '+fd(nx.s)+'</small></p>':'<p><b class="big" style="margin:0">Semua tahap selesai</b><small>Terima kasih atas partisipasinya.</small></p>')}
 var n2='<h3>Kuota per jalur</h3><ul>'+JK.map(function(j){var q=db.quota[j];return '<li><span>'+esc(JALUR[j].n)+'</span><b>'+q.k+' + '+q.c+'</b></li>'}).join("")+'</ul><small>Kursi + cadangan</small>';
 var u=sched("umum"),n3='<h3>Status pengumuman</h3>'+(db.announce?'<b class="big">Sudah dibuka</b><p>Hasil seleksi bisa dilihat per jalur.</p><a class="lnk" href="#/pengumuman">Lihat hasil seleksi</a>':'<b class="big">Belum dibuka</b><p>Dijadwalkan '+esc(fd(u.s))+'.</p><a class="lnk" href="#/status">Cek status pendaftaran</a>');
 return '<section class="papan" aria-labelledby="pp-h"><h2 id="pp-h">Papan pengumuman</h2><div class="notes"><div class="pin">'+n1+'</div><div class="pin">'+n2+'</div><div class="pin">'+n3+'</div></div></section>'}
function vHome(){var all=db.apps.length,ver=db.apps.filter(function(a){return statusOf(a)==="terverifikasi"}).length;
 return '<section class="hero" aria-label="Surat edaran PPDB"><figure class="hf">'+ill()+'</figure><div class="surat"><p class="kep">Surat edaran PPDB '+esc(db.year)+'</p><h1>Penerimaan peserta didik baru dibuka</h1><p>Isi formulir, unggah berkas, dan pantau status dari rumah. Ini sekolah fiktif untuk contoh demo.</p><div class="row"><a class="btn acc" href="#/daftar">Daftar sekarang</a><a class="btn sec" href="#/status">Cek status</a></div><div id="cd">'+cdHtml()+'</div></div><div class="stamp" aria-hidden="true"><span>PPDB<br>'+esc(String(db.year).slice(0,4))+'<small>Harapan Nusantara</small></span></div></section>'
 +(db.draft?'<div class="note info" style="margin-top:22px">Ada draf formulir yang belum dikirim (disimpan '+esc(fdt(db.draft.saved))+'). <a href="#/daftar">Lanjutkan mengisi</a></div>':'')
 +papanHtml()
 +'<div class="grid g4"><div class="stat"><b>'+totalQuota()+'</b><span>Total kuota</span></div><div class="stat"><b>'+all+'</b><span>Pendaftar</span></div><div class="stat"><b>'+ver+'</b><span>Berkas terverifikasi</span></div><div class="stat"><b>'+(regOpen()?"Buka":"Tutup")+'</b><span>Pendaftaran</span></div></div>'
 +'<div class="sec-h"><h2>Jadwal tahapan</h2><span>Tahap yang berjalan ditandai marun</span></div>'+schedHtml()
 +'<div class="sec-h"><h2>Alur pendaftaran</h2></div><div class="alur-grid"><section class="card"><ol class="ck"><li>Pilih jalur dan siapkan berkas.</li><li>Isi formulir 6 langkah, draf bisa disimpan.</li><li>Catat nomor pendaftaran, cetak bukti.</li><li>Panitia memeriksa berkas, cek di menu Cek status.</li><li>Lihat hasil saat pengumuman dibuka.</li></ol></section><section class="card"><h3>Pertanyaan umum</h3><details><summary>Berapa usia yang boleh mendaftar?</summary><p>Usia '+db.minAge+' sampai '+db.maxAge+' tahun pada '+fd(db.ref)+'.</p></details><details><summary>Apakah bisa mengganti jalur?</summary><p>Tidak. Jika salah pilih, buat pendaftaran baru dengan NISN yang berbeda atau hubungi panitia.</p></details><details><summary>Berkas ditolak, bagaimana?</summary><p>Buka Cek status, lalu pilih file pengganti untuk berkas yang ditolak.</p></details></section></div>'
 +'<div class="sec-h"><h2>Jalur pendaftaran</h2><span>Empat formulir, pilih satu</span></div>'+jalurCards()+fasHtml()}

function vJalur(){return '<h1>Jalur pendaftaran</h1><p>Pilih satu jalur. Skor dihitung otomatis dengan rumus di bawah ini.</p>'+JK.map(function(j){var J=JALUR[j],c=counts(j),q=db.quota[j];return '<section class="card">'+photo("jalur-"+j,FOTO[j],"wide",800,400)+'<div class="row sp"><h2>'+esc(J.n)+'</h2><span class="badge b-info">Kuota '+q.k+' + '+q.c+' cadangan</span></div><p>'+esc(J.d)+'</p><div class="grid g2"><div><h3>Syarat</h3><ul class="ck">'+J.syarat.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ul></div><div><h3>Berkas</h3><ul class="ck">'+docKeys(j).map(function(d){return '<li>'+esc(d[1])+'</li>'}).join("")+'</ul></div></div><div class="note info"><b>Rumus skor.</b> '+esc(J.f)+'</div><small>Saat ini '+c.total+' pendaftar ('+c.ver+' terverifikasi). Peringkat hanya memuat berkas terverifikasi.</small></section>'}).join("")+'<a class="btn" href="#/daftar">Mulai mendaftar</a>'}

/* ---------- Formulir ---------- */
var STEPS=["Data siswa","Orang tua","Asal sekolah","Jalur dan pilihan","Dokumen","Tinjau"];
function blank(){var g={};MAPEL.forEach(function(m){g[m[0]]=""});return {name:"",nisn:"",gender:"",pob:"",dob:"",address:"",phone:"",email:"",father:"",mother:"",job:"",pphone:"",income:"",school:"",stype:"SMP",gradYear:"",grades:g,jalur:"",jarak:"",tingkat:"",peringkat:"",lomba:"",kartu:"",instansi:"",p1:"",p2:"",docs:{},agree:false}}
function gv(path){var d=form.d;if(path.indexOf("g.")===0)return d.grades[path.slice(2)];return d[path]}
function sv(path,v){var d=form.d;if(path.indexOf("g.")===0)d.grades[path.slice(2)]=v;else d[path]=v}
function fld(p,label,o){o=o||{};var v=gv(p),er=form.err[p],id="f-"+p.replace(".","-"),t=o.type||"text",inp;
 if(o.sel)inp='<select class="inp" id="'+id+'" data-f="'+p+'"'+(er?' aria-invalid="true"':"")+'>'+opts(o.sel,v,"Pilih...")+'</select>';
 else inp='<input class="inp" id="'+id+'" data-f="'+p+'" type="'+t+'" value="'+esc(v)+'"'+(o.attr?" "+o.attr:"")+(er?' aria-invalid="true"':"")+' aria-describedby="e-'+id+'">';
 return '<label class="fld" for="'+id+'"><span>'+esc(label)+(o.opt?" (opsional)":"")+'</span>'+inp+(o.hint?'<small>'+esc(o.hint)+'</small>':"")+'<div class="er" id="e-'+id+'">'+esc(er||"")+'</div></label>'}
var phoneRe=/^08\d{8,11}$/;
function cleanPhone(s){return String(s||"").replace(/[\s-]/g,"")}
function vStep(n,d){var e={};function req(k,l,min,max){var v=String(d[k]||"").trim();if(!v)e[k]=l+" wajib diisi.";else if(v.length<min)e[k]=l+" minimal "+min+" karakter.";else if(v.length>max)e[k]=l+" maksimal "+max+" karakter."}
 if(n===1){req("name","Nama lengkap",3,60);if(!e.name&&!/^[A-Za-z' .,-]+$/.test(d.name.trim()))e.name="Nama hanya boleh huruf, spasi, titik, koma, dan tanda hubung.";
  if(!/^\d{10}$/.test(String(d.nisn).trim()))e.nisn="NISN harus 10 digit angka.";else if(db.apps.some(function(a){return a.nisn===String(d.nisn).trim()}))e.nisn="NISN ini sudah terdaftar. Gunakan menu Cek status.";
  if(!d.gender)e.gender="Pilih jenis kelamin.";req("pob","Tempat lahir",2,40);
  if(!d.dob)e.dob="Tanggal lahir wajib diisi.";else if(!validDate(d.dob))e.dob="Tanggal lahir tidak valid.";else if(d.dob>today())e.dob="Tanggal lahir tidak boleh di masa depan.";
  else{var ag=ageAt(d.dob,db.ref);if(ag<db.minAge||ag>db.maxAge)e.dob="Usia pada "+fd(db.ref)+" adalah "+ag+" tahun. Batas usia "+db.minAge+" sampai "+db.maxAge+" tahun."}
  req("address","Alamat",8,120);if(!phoneRe.test(cleanPhone(d.phone)))e.phone="Nomor HP harus diawali 08 dan 10 sampai 13 digit.";
  if(d.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim()))e.email="Format email belum benar."}
 if(n===2){req("father","Nama ayah",3,60);req("mother","Nama ibu",3,60);if(!d.job)e.job="Pilih pekerjaan orang tua.";if(!phoneRe.test(cleanPhone(d.pphone)))e.pphone="Nomor HP harus diawali 08 dan 10 sampai 13 digit.";if(!d.income)e.income="Pilih rentang penghasilan."}
 if(n===3){req("school","Nama sekolah asal",3,60);if(!d.gradYear)e.gradYear="Pilih tahun lulus.";MAPEL.forEach(function(m){var v=String(d.grades[m[0]]).trim().replace(",","."),x=+v;if(v===""||isNaN(x))e["g."+m[0]]="Nilai "+m[1]+" wajib berupa angka.";else if(x<0||x>100)e["g."+m[0]]="Nilai harus antara 0 dan 100."})}
 if(n===4){if(!d.jalur)e.jalur="Pilih salah satu jalur.";else{
   if(d.jalur==="zonasi"){var jv=String(d.jarak).trim().replace(",",".");if(jv===""||isNaN(+jv))e.jarak="Jarak wajib berupa angka.";else if(+jv<0||+jv>10)e.jarak="Zonasi hanya untuk jarak 0 sampai 10 km."}
   if(d.jalur==="prestasi"){if(!d.tingkat)e.tingkat="Pilih tingkat lomba.";if(!d.peringkat)e.peringkat="Pilih peringkat juara.";req("lomba","Nama lomba",3,60)}
   if(d.jalur==="afirmasi"&&!d.kartu)e.kartu="Pilih jenis kartu.";
   if(d.jalur==="mutasi")req("instansi","Instansi penugasan",3,60)}
  if(!d.p1)e.p1="Pilih pilihan 1.";if(!d.p2)e.p2="Pilih pilihan 2.";else if(d.p1&&d.p1===d.p2)e.p2="Pilihan 2 harus berbeda dari pilihan 1."}
 if(n===5){if(!d.jalur)e.docs="Pilih jalur dulu di langkah 4.";else docKeys(d.jalur).forEach(function(k){if(!d.docs[k[0]])e["doc-"+k[0]]=k[1]+" belum dipilih."})}
 if(n===6&&!d.agree)e.agree="Centang pernyataan sebelum mengirim.";
 return e}
function stepper(){return '<ol class="steps" aria-label="Langkah formulir">'+STEPS.map(function(s,i){return '<li class="'+(i+1===form.step?"on":i+1<form.step?"done":"")+'"'+(i+1===form.step?' aria-current="step"':"")+'>'+(i+1)+'<span> '+esc(s)+'</span></li>'}).join("")+'</ol>'}
function stepBody(){var d=form.d,s=form.step,y=+db.ref.slice(0,4);
 if(s===1)return '<h2>Data siswa</h2>'+fld("name","Nama lengkap")+fld("nisn","NISN",{attr:'inputmode="numeric" maxlength="10"',hint:"10 digit, tertera di rapor atau kartu pelajar."})
  +'<fieldset class="fld" style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:700;font-size:.92rem;margin-bottom:4px">Jenis kelamin</legend><div class="row">'+[["L","Laki-laki"],["P","Perempuan"]].map(function(g){return '<label class="opt'+(d.gender===g[0]?" on":"")+'" style="padding:8px 14px;align-items:center"><input type="radio" name="gender" data-f="gender" value="'+g[0]+'"'+(d.gender===g[0]?" checked":"")+'> '+g[1]+'</label>'}).join("")+'</div><div class="er">'+esc(form.err.gender||"")+'</div></fieldset>'
  +fld("pob","Tempat lahir")+fld("dob","Tanggal lahir",{type:"date",hint:"Batas usia "+db.minAge+" sampai "+db.maxAge+" tahun pada "+fd(db.ref)+"."})+fld("address","Alamat lengkap")+fld("phone","Nomor HP siswa",{type:"tel",hint:"Contoh: 0812-0000-1234"})+fld("email","Email",{type:"email",opt:1});
 if(s===2)return '<h2>Orang tua atau wali</h2>'+fld("father","Nama ayah")+fld("mother","Nama ibu")+fld("job","Pekerjaan utama",{sel:JOBS})+fld("pphone","Nomor HP orang tua",{type:"tel"})+fld("income","Penghasilan per bulan",{sel:INCOME});
 if(s===3)return '<h2>Asal sekolah dan nilai</h2>'+fld("school","Nama sekolah asal")+'<div class="grid g2">'+fld("stype","Jenis sekolah",{sel:["SMP","MTs","Paket B"]})+fld("gradYear","Tahun lulus",{sel:[String(y-1),String(y)]})+'</div><h3>Nilai rapor (rata-rata semester 1 sampai 5)</h3><div class="grid g3">'+MAPEL.map(function(m){return fld("g."+m[0],m[1],{type:"number",attr:'inputmode="decimal" min="0" max="100" step="0.01"'})}).join("")+'</div>';
 if(s===4){var h='<h2>Jalur dan pilihan kelas</h2><fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:700;font-size:.92rem;margin-bottom:6px">Jalur pendaftaran</legend><div class="opts">'+JK.map(function(j){var c=counts(j),q=db.quota[j];return '<label class="opt'+(d.jalur===j?" on":"")+'"><input type="radio" name="jalur" data-f="jalur" value="'+j+'"'+(d.jalur===j?" checked":"")+'><span><b>'+esc(JALUR[j].n)+'</b> <small>(kuota '+q.k+', '+c.total+' pendaftar)</small><br><small>'+esc(JALUR[j].syarat.join(". "))+'.</small></span></label>'}).join("")+'</div><div class="er">'+esc(form.err.jalur||"")+'</div></fieldset>';
  if(d.jalur==="zonasi")h+=fld("jarak","Jarak rumah ke sekolah (km)",{type:"number",attr:'inputmode="decimal" min="0" max="10" step="0.1"',hint:"Maksimal 10 km untuk jalur zonasi."});
  if(d.jalur==="prestasi")h+='<div class="grid g2">'+fld("tingkat","Tingkat lomba",{sel:Object.keys(TINGKAT).map(function(k){return [k,TINGKAT[k]]})})+fld("peringkat","Peringkat juara",{sel:[["1","Juara 1"],["2","Juara 2"],["3","Juara 3"]]})+'</div>'+fld("lomba","Nama lomba");
  if(d.jalur==="afirmasi")h+=fld("kartu","Jenis kartu",{sel:Object.keys(KARTU)});
  if(d.jalur==="mutasi")h+=fld("instansi","Instansi penugasan orang tua");
  return h+'<div class="grid g2">'+fld("p1","Pilihan jurusan 1",{sel:JUR})+fld("p2","Pilihan jurusan 2",{sel:JUR})+'</div>'}
 if(s===5){var keys=d.jalur?docKeys(d.jalur):[];return '<h2>Dokumen</h2><div class="note info">Ini demo: file tidak diunggah ke mana pun, hanya nama file yang dicatat. Format PDF, JPG, atau PNG, maksimal 2 MB.</div>'+(form.err.docs?'<div class="note bad">'+esc(form.err.docs)+'</div>':"")+keys.map(function(k){var n=d.docs[k[0]],er=form.err["doc-"+k[0]];return '<div class="file'+(n?" ok":"")+'"><label for="doc-'+k[0]+'"><b>'+esc(k[1])+'</b></label><input type="file" id="doc-'+k[0]+'" data-doc="'+k[0]+'" accept=".pdf,.jpg,.jpeg,.png"'+(er?' aria-invalid="true"':"")+'><span>'+(n?'Terpilih: <b>'+esc(n)+'</b>':'Belum ada file')+'</span><div class="er">'+esc(er||"")+'</div></div>'}).join("")}
 var sc=score(d.grades?{grades:d.grades,jalur:d.jalur,jarak:+String(d.jarak).replace(",","."),tingkat:d.tingkat,peringkat:d.peringkat,kartu:d.kartu}:{});
 return '<h2>Tinjau dan kirim</h2><dl class="kv"><dt>Nama</dt><dd>'+esc(d.name)+'</dd><dt>NISN</dt><dd>'+esc(d.nisn)+'</dd><dt>Tempat, tgl lahir</dt><dd>'+esc(d.pob)+', '+esc(fd(d.dob))+'</dd><dt>Orang tua</dt><dd>'+esc(d.father)+' dan '+esc(d.mother)+'</dd><dt>Sekolah asal</dt><dd>'+esc(d.school)+' ('+esc(d.gradYear)+')</dd><dt>Rata-rata nilai</dt><dd>'+sc.n+'</dd><dt>Jalur</dt><dd>'+esc(JALUR[d.jalur].n)+'</dd><dt>Perkiraan skor</dt><dd>'+sc.total+'</dd><dt>Pilihan</dt><dd>1. '+esc(d.p1)+', 2. '+esc(d.p2)+'</dd><dt>Dokumen</dt><dd>'+docKeys(d.jalur).length+' berkas dipilih</dd></dl><p><button class="btn sm ghost" data-act="goto" data-a="1" style="margin-top:10px">Ubah data</button></p><label class="opt'+(d.agree?" on":"")+'"><input type="checkbox" data-f="agree"'+(d.agree?" checked":"")+'><span>Saya menyatakan data dan berkas yang saya isi benar. Data palsu dapat membatalkan pendaftaran.</span></label><div class="er">'+esc(form.err.agree||"")+'</div>'}
function vDaftar(){
 if(!regOpen()&&!form)return '<h1>Pendaftaran</h1><div class="note bad">Pendaftaran sedang ditutup. Jadwal: '+fd(sched("daftar").s)+' sampai '+fd(sched("daftar").e)+'.</div><a class="btn sec" href="#/">Lihat jadwal</a>';
 if(!form){if(db.draft)return '<h1>Formulir pendaftaran</h1><div class="note info">Ada draf yang disimpan '+esc(fdt(db.draft.saved))+' (langkah '+db.draft.step+' dari 6, atas nama '+esc(db.draft.d.name||"belum diisi")+').</div><div class="row"><button class="btn" data-act="resume">Lanjutkan draf</button><button class="btn sec" data-act="newform">Mulai baru</button></div>';
  form={step:1,d:blank(),err:{}}}
 return '<h1>Formulir pendaftaran</h1>'+stepper()+'<form class="card" id="fm" novalidate>'+stepBody()+'<div class="row sp" style="margin-top:8px"><div class="row">'+(form.step>1?'<button type="button" class="btn sec" data-act="prev">Kembali</button>':'')+'<button type="button" class="btn ghost" data-act="draft">Simpan draf</button></div>'+(form.step<6?'<button type="submit" class="btn">Lanjut</button>':'<button type="submit" class="btn acc">Kirim pendaftaran</button>')+'</div></form>'}
function focusErr(){var el=$("[aria-invalid=true]")||$(".er:not(:empty)");if(el&&el.scrollIntoView){el.scrollIntoView({block:"center"});if(el.focus)el.focus()}}
function nextStep(){var e=vStep(form.step,form.d);form.err=e;if(Object.keys(e).length){render(1);toast("Periksa isian yang bertanda merah.",1);focusErr();return}
 if(form.step<6){form.step++;render();return}
 if(!regOpen()){toast("Pendaftaran sudah ditutup.",1);return}
 for(var s=1;s<=5;s++){var er=vStep(s,form.d);if(Object.keys(er).length){form.step=s;form.err=er;render(1);toast("Ada data yang belum valid di langkah "+s+".",1);focusErr();return}}
 submitForm()}
function submitForm(){var d=form.d,n=db.apps.length+1,no;do{no="PPDB"+db.ref.slice(2,4)+"-"+("000"+n).slice(-4);n++}while(find(no));
 var g={};MAPEL.forEach(function(m){g[m[0]]=+String(d.grades[m[0]]).trim().replace(",",".")});
 var docs={};docKeys(d.jalur).forEach(function(k){docs[k[0]]={name:d.docs[k[0]],status:"menunggu",reason:""}});
 var a={no:no,nisn:d.nisn.trim(),name:d.name.trim().replace(/\s+/g," "),gender:d.gender,pob:d.pob.trim(),dob:d.dob,address:d.address.trim(),phone:cleanPhone(d.phone),email:d.email.trim(),father:d.father.trim(),mother:d.mother.trim(),job:d.job,pphone:cleanPhone(d.pphone),income:d.income,school:d.school.trim(),stype:d.stype,gradYear:+d.gradYear,grades:g,jalur:d.jalur,jarak:d.jalur==="zonasi"?+String(d.jarak).replace(",","."):"",tingkat:d.jalur==="prestasi"?d.tingkat:"",peringkat:d.jalur==="prestasi"?d.peringkat:"",lomba:d.jalur==="prestasi"?d.lomba.trim():"",kartu:d.jalur==="afirmasi"?d.kartu:"",instansi:d.jalur==="mutasi"?d.instansi.trim():"",p1:d.p1,p2:d.p2,docs:docs,decision:null,at:new Date().toISOString()};
 db.apps.push(a);db.draft=null;save();form=null;unlock(no);flash=no;location.hash="#/status/"+no}
function saveDraft(){form.d.agree=false;db.draft={d:JSON.parse(JSON.stringify(form.d)),step:form.step,saved:new Date().toISOString()};save();toast("Draf disimpan. Lanjutkan kapan saja dari browser ini.")}

/* ---------- Status, bukti, pengumuman ---------- */
function barcode(s){var x=4,out="";for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);for(var b=0;b<4;b++){var w=1+((c>>b)&1)*2;if(b%2===0)out+='<rect x="'+x+'" y="2" width="'+w+'" height="42" fill="#0f172a"/>';x+=w+1}x+=2}return '<svg class="code" viewBox="0 0 '+(x+4)+' 46" preserveAspectRatio="none" role="img" aria-label="Kode batang '+esc(s)+'">'+out+'</svg>'}
function buktiHtml(a){return '<div class="bukti"><div class="row sp"><b>KARTU BUKTI PENDAFTARAN PPDB '+esc(db.year)+'</b><span>SMA Harapan Nusantara</span></div><p style="margin:10px 0 0">Nomor pendaftaran</p><div class="no">'+esc(a.no)+'</div><dl class="kv" style="margin:10px 0"><dt>Nama</dt><dd>'+esc(a.name)+'</dd><dt>NISN</dt><dd>'+esc(a.nisn)+'</dd><dt>Tempat, tgl lahir</dt><dd>'+esc(a.pob)+', '+esc(fd(a.dob))+'</dd><dt>Sekolah asal</dt><dd>'+esc(a.school)+'</dd><dt>Jalur</dt><dd>'+esc(JALUR[a.jalur].n)+'</dd><dt>Pilihan</dt><dd>1. '+esc(a.p1)+', 2. '+esc(a.p2)+'</dd><dt>Tanggal daftar</dt><dd>'+esc(fdt(a.at))+'</dd></dl>'+barcode(a.no)+'<p style="font-size:.8rem;margin:8px 0 0">Simpan kartu ini. Gunakan nomor dan tanggal lahir untuk cek status. Dokumen contoh demo, bukan dokumen resmi.</p></div>'}
function resultHtml(a){var u=sched("umum");
 if(!db.announce)return '<div class="note info"><b>Hasil seleksi belum diumumkan.</b> Jadwal pengumuman: '+esc(fd(u.s))+'. Cek lagi setelah panitia membukanya.</div>';
 var st=statusOf(a);
 if(!a.decision)return '<div class="note bad">Pendaftaran Anda tidak masuk peringkat karena berkas '+(st==="ditolak"?"belum memenuhi syarat.":"belum terverifikasi saat pengumuman.")+'</div>';
 var m={lulus:["ok","Selamat, Anda dinyatakan LULUS. Lakukan daftar ulang pada "+fd(sched("ulang").s)+" sampai "+fd(sched("ulang").e)+"."],cadangan:["","Anda masuk daftar CADANGAN. Panitia menghubungi bila ada kursi kosong."],tidak:["bad","Mohon maaf, Anda dinyatakan TIDAK LULUS pada jalur ini."]}[a.decision],s=score(a);
 return '<div class="note '+m[0]+'"><b>'+esc(DEC[a.decision][0])+'.</b> '+esc(m[1])+'<br>Peringkat '+rankOf(a)+' di jalur '+esc(JALUR[a.jalur].n)+', skor '+s.total+'.</div>'}
function vStatus(no){
 if(!no)return '<h1>Cek status pendaftaran</h1><form class="card" id="sf" novalidate style="max-width:480px"><label class="fld" for="s-no"><span>Nomor pendaftaran</span><input class="inp" id="s-no" autocomplete="off" placeholder="PPDB'+db.ref.slice(2,4)+'-0001"></label><label class="fld" for="s-dob"><span>Tanggal lahir</span><input class="inp" id="s-dob" type="date"></label><div class="er" id="s-e"></div><div class="row"><button class="btn" type="submit">Lihat status</button><button class="btn ghost" type="button" data-act="sample">Isi contoh</button></div><p style="margin-top:12px"><small>Coba nomor PPDB'+db.ref.slice(2,4)+'-0001 dengan tanggal lahirnya (tombol Isi contoh).</small></p></form>';
 var a=find(no);if(!a||!unlocked(a.no))return '<h1>Cek status pendaftaran</h1><div class="note bad">Masukkan nomor dan tanggal lahir terlebih dahulu.</div><a class="btn" href="#/status">Kembali ke cek status</a>';
 var st=statusOf(a),ks=docKeys(a.jalur),rej=ks.filter(function(k){return a.docs[k[0]]&&a.docs[k[0]].status==="tolak"});
 return '<h1>Status pendaftaran</h1>'+(flash===a.no?'<div class="note ok"><b>Pendaftaran berhasil dikirim.</b> Catat nomor '+esc(a.no)+' dan cetak kartu bukti di bawah.</div>':"")
  +'<div class="grid g2" style="align-items:start"><div>'+buktiHtml(a)+'<div class="row" style="margin-top:12px"><button class="btn" data-act="print">Cetak bukti pendaftaran</button><a class="btn sec" href="#/status">Cek nomor lain</a></div></div><div><section class="card"><h2>Status</h2><p>'+badge(st)+(a.decision&&db.announce?' '+badge(a.decision,DEC):"")+'</p>'+resultHtml(a)+'</section><section class="card"><h2>Berkas</h2><ul class="ck" style="list-style:none;padding:0">'+ks.map(function(k){var d=a.docs[k[0]]||{status:"menunggu",name:"-"};return '<li style="margin-bottom:8px"><b>'+esc(k[1])+'</b> '+(d.status==="setuju"?'<span class="badge b-ok">Disetujui</span>':d.status==="tolak"?'<span class="badge b-bad">Ditolak</span>':'<span class="badge b-warn">Menunggu</span>')+'<br><small>'+esc(d.name)+'</small>'+(d.status==="tolak"?'<br><small style="color:var(--bad)">Alasan: '+esc(d.reason)+'</small>':"")+'</li>'}).join("")+'</ul>'
  +(rej.length?'<h3>Perbaiki berkas</h3><p><small>Pilih file pengganti (PDF/JPG/PNG, maks 2 MB). Berkas kembali ke antrean verifikasi.</small></p>'+rej.map(function(k){return '<div class="file"><label for="fx-'+k[0]+'"><b>'+esc(k[1])+'</b></label><input type="file" id="fx-'+k[0]+'" data-fix="'+k[0]+'" accept=".pdf,.jpg,.jpeg,.png"></div>'}).join(""):"")+'</section></div></div>'}
function vPengumuman(){var u=sched("umum");
 if(!db.announce)return '<h1>Pengumuman hasil seleksi</h1><div class="card empty"><h2>Belum dibuka</h2><p>Hasil seleksi akan diumumkan pada '+esc(fd(u.s))+'.</p><p><a class="btn" href="#/status">Cek status pendaftaran</a></p></div>';
 var j=ui.pj||"zonasi",rows=ranking(j).filter(function(x){return x.a.decision}),q=ui.pq.trim().toLowerCase();if(q)rows=rows.filter(function(x){return (x.a.name+" "+x.a.no).toLowerCase().indexOf(q)>=0});
 var c=counts(j);
 return '<h1>Pengumuman hasil seleksi</h1><p>PPDB '+esc(db.year)+'. Peringkat berdasarkan skor, hanya pendaftar terverifikasi.</p><div class="tabs">'+JK.map(function(k){return '<a href="#/pengumuman" data-pj="'+k+'" class="'+(k===j?"on":"")+'">'+esc(JALUR[k].n)+'</a>'}).join("")+'</div><div class="card"><div class="row sp"><span><b>'+c.lulus+'</b> lulus dari kuota '+db.quota[j].k+', <b>'+c.cadangan+'</b> cadangan</span><input class="inp" id="pq" aria-label="Cari nama atau nomor" style="max-width:260px" placeholder="Cari nama atau nomor" value="'+esc(ui.pq)+'"></div><div id="plist">'+pubRows(j)+'</div></div>'}
function pubRows(j){var rows=ranking(j).filter(function(x){return x.a.decision}),q=ui.pq.trim().toLowerCase();if(q)rows=rows.filter(function(x){return (x.a.name+" "+x.a.no).toLowerCase().indexOf(q)>=0});
 if(!rows.length)return '<div class="empty">Tidak ada data yang cocok.</div>';
 return '<div class="tw"><table class="rs"><thead><tr><th>Peringkat</th><th>No. pendaftaran</th><th>Nama</th><th>Skor</th><th>Hasil</th></tr></thead><tbody>'+rows.map(function(x){return '<tr><td data-l="Peringkat">'+rankOf(x.a)+'</td><td data-l="No.">'+esc(x.a.no)+'</td><td data-l="Nama">'+esc(x.a.name)+'</td><td data-l="Skor">'+x.s.total+'</td><td data-l="Hasil">'+badge(x.a.decision,DEC)+'</td></tr>'}).join("")+'</tbody></table></div>'}

/* ---------- Panitia ---------- */
var PTABS=[["ringkasan","Ringkasan"],["pendaftar","Pendaftar"],["peringkat","Peringkat"],["pengumuman","Pengumuman"],["jadwal","Jadwal dan kuota"]];
function bars(items,max){max=max||Math.max.apply(null,items.map(function(i){return i[1]}).concat([1]));return items.map(function(i){return '<div class="bar"><span>'+esc(i[0])+'</span><div><i style="width:'+Math.round(i[1]/max*100)+'%"></i></div><b>'+i[1]+'</b></div>'}).join("")}
function vPanitia(tab,arg){
 if(!isAdmin())return '<h1>Panel panitia</h1><form class="card" id="lf" novalidate style="max-width:380px"><label class="fld" for="pin"><span>PIN panitia</span><input class="inp" id="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"><small>PIN demo: '+esc(db.pin)+'</small></label><div class="er" id="pin-e"></div><button class="btn" type="submit">Masuk</button></form>';
 tab=tab||"ringkasan";var body;
 if(tab==="pendaftar"&&arg)body=pDetail(arg);else if(tab==="pendaftar")body=pList();else if(tab==="peringkat")body=pRank();else if(tab==="pengumuman")body=pAnn();else if(tab==="jadwal")body=pCfg();else{tab="ringkasan";body=pSum()}
 return '<div class="row sp"><h1>Panel panitia</h1><button class="btn sm sec" data-act="logout">Keluar</button></div><div class="tabs">'+PTABS.map(function(t){return '<a href="#/panitia/'+t[0]+'" class="'+(t[0]===tab?"on":"")+'">'+t[1]+'</a>'}).join("")+'</div>'+body}
function pSum(){var A=db.apps,by=function(s){return A.filter(function(a){return statusOf(a)===s}).length},dec=A.filter(function(a){return a.decision==="lulus"}).length;
 var sc=A.map(function(a){return avg(a)}),m=sc.length?r2(sc.reduce(function(x,y){return x+y},0)/sc.length):0;
 return '<div class="grid g4" style="margin-bottom:16px"><div class="stat"><b>'+A.length+'</b><span>Total pendaftar</span></div><div class="stat"><b>'+by("menunggu")+'</b><span>Menunggu verifikasi</span></div><div class="stat"><b>'+by("ditolak")+'</b><span>Berkas perlu perbaikan</span></div><div class="stat"><b>'+by("terverifikasi")+'</b><span>Terverifikasi</span></div></div>'
 +'<div class="card"><h2>Kuota per jalur</h2><div class="tw"><table class="rs"><thead><tr><th>Jalur</th><th>Kuota</th><th>Pendaftar</th><th>Terverifikasi</th><th>Lulus</th><th>Cadangan</th></tr></thead><tbody>'+JK.map(function(j){var c=counts(j);return '<tr><td data-l="Jalur"><b>'+esc(JALUR[j].n)+'</b></td><td data-l="Kuota">'+db.quota[j].k+' + '+db.quota[j].c+'</td><td data-l="Pendaftar">'+c.total+'</td><td data-l="Terverifikasi">'+c.ver+'</td><td data-l="Lulus">'+c.lulus+'</td><td data-l="Cadangan">'+c.cadangan+'</td></tr>'}).join("")+'</tbody></table></div></div>'
 +'<div class="grid g2" style="align-items:start"><div class="card"><h2>Pendaftar per jalur</h2>'+bars(JK.map(function(j){return [JALUR[j].n,counts(j).total]}))+'</div><div class="card"><h2>Pilihan jurusan 1</h2>'+bars(JUR.map(function(u){return [u,A.filter(function(a){return a.p1===u}).length]}))+'</div><div class="card"><h2>Jenis kelamin</h2>'+bars([["Laki-laki",A.filter(function(a){return a.gender==="L"}).length],["Perempuan",A.filter(function(a){return a.gender==="P"}).length]])+'</div><div class="card"><h2>Ringkas</h2><dl class="kv"><dt>Rata-rata nilai</dt><dd>'+m+'</dd><dt>Sudah lulus</dt><dd>'+dec+' dari '+totalQuota()+' kursi</dd><dt>Pengumuman</dt><dd>'+(db.announce?"Dibuka":"Ditutup")+'</dd><dt>Pendaftaran</dt><dd>'+(regOpen()?"Buka":"Tutup")+'</dd></dl></div></div>'}
function listData(){var q=ui.q.trim().toLowerCase(),L=db.apps.filter(function(a){
  if(q&&(a.name+" "+a.no+" "+a.nisn).toLowerCase().indexOf(q)<0)return false;if(ui.jalur&&a.jalur!==ui.jalur)return false;if(ui.status&&statusOf(a)!==ui.status)return false;
  if(ui.dec==="none"?a.decision:ui.dec&&a.decision!==ui.dec)return false;return true});
 L.sort(function(a,b){if(ui.sort==="name")return a.name.localeCompare(b.name);if(ui.sort==="score")return score(b).total-score(a).total;if(ui.sort==="no")return a.no<b.no?-1:1;return a.at<b.at?1:-1});return L}
function pList(){return '<div class="card"><div class="grid g4"><label class="fld"><span>Cari</span><input class="inp" data-ui="q" value="'+esc(ui.q)+'" placeholder="Nama, nomor, NISN"></label><label class="fld"><span>Jalur</span><select class="inp" data-ui="jalur">'+opts(JK.map(function(j){return [j,JALUR[j].n]}),ui.jalur,"Semua")+'</select></label><label class="fld"><span>Status berkas</span><select class="inp" data-ui="status">'+opts([["menunggu","Menunggu"],["ditolak","Perlu perbaikan"],["terverifikasi","Terverifikasi"]],ui.status,"Semua")+'</select></label><label class="fld"><span>Keputusan</span><select class="inp" data-ui="dec">'+opts([["none","Belum ditetapkan"],["lulus","Lulus"],["cadangan","Cadangan"],["tidak","Tidak lulus"]],ui.dec,"Semua")+'</select></label></div><div class="row sp"><label class="fld" style="margin:0"><span>Urutkan</span><select class="inp" data-ui="sort">'+opts([["new","Terbaru"],["name","Nama A-Z"],["score","Skor tertinggi"],["no","Nomor pendaftaran"]],ui.sort)+'</select></label><button class="btn sec" data-act="csvlist">Ekspor CSV</button></div></div><div class="card" id="plist">'+pListRows()+'</div>'}
function pListRows(){var L=listData(),per=10,pages=Math.max(1,Math.ceil(L.length/per));if(ui.page>pages)ui.page=pages;var S=L.slice((ui.page-1)*per,ui.page*per);
 if(!L.length)return '<div class="empty">Tidak ada pendaftar yang cocok dengan filter.</div>';
 return '<p><small>'+L.length+' pendaftar</small></p><div class="tw"><table class="rs"><thead><tr><th>Nomor</th><th>Nama</th><th>Jalur</th><th>Skor</th><th>Berkas</th><th>Keputusan</th><th></th></tr></thead><tbody>'+S.map(function(a){return '<tr><td data-l="Nomor">'+esc(a.no)+'</td><td data-l="Nama"><b>'+esc(a.name)+'</b></td><td data-l="Jalur">'+esc(JALUR[a.jalur].n)+'</td><td data-l="Skor">'+score(a).total+'</td><td data-l="Berkas">'+badge(statusOf(a))+'</td><td data-l="Keputusan">'+badge(a.decision,DEC)+'</td><td><a class="btn sm sec" href="#/panitia/pendaftar/'+esc(a.no)+'">Periksa</a></td></tr>'}).join("")+'</tbody></table></div><div class="row sp" style="margin-top:10px"><button class="btn sm sec" data-act="page" data-a="-1"'+(ui.page<=1?" disabled":"")+'>Sebelumnya</button><span>Halaman '+ui.page+' dari '+pages+'</span><button class="btn sm sec" data-act="page" data-a="1"'+(ui.page>=pages?" disabled":"")+'>Berikutnya</button></div>'}
function pDetail(no){var a=find(no);if(!a)return '<div class="note bad">Pendaftar tidak ditemukan.</div><a class="btn sec" href="#/panitia/pendaftar">Ke daftar pendaftar</a>';
 var s=score(a),st=statusOf(a),ks=docKeys(a.jalur);
 return '<p><a href="#/panitia/pendaftar">Daftar pendaftar</a> / '+esc(a.no)+'</p><div class="grid g2" style="align-items:start"><section class="card"><h2>'+esc(a.name)+'</h2><p>'+badge(st)+' '+badge(a.decision,DEC)+'</p><dl class="kv"><dt>Nomor</dt><dd>'+esc(a.no)+'</dd><dt>NISN</dt><dd>'+esc(a.nisn)+'</dd><dt>Lahir</dt><dd>'+esc(a.pob)+', '+esc(fd(a.dob))+' ('+ageAt(a.dob,db.ref)+' th)</dd><dt>Alamat</dt><dd>'+esc(a.address)+'</dd><dt>HP</dt><dd>'+esc(a.phone)+'</dd><dt>Orang tua</dt><dd>'+esc(a.father)+', '+esc(a.mother)+' ('+esc(a.job)+', '+esc(a.income)+')</dd><dt>Sekolah asal</dt><dd>'+esc(a.school)+' ('+esc(a.gradYear)+')</dd><dt>Jalur</dt><dd>'+esc(JALUR[a.jalur].n)+(a.jalur==="zonasi"?', '+esc(a.jarak)+' km':a.jalur==="prestasi"?': '+esc(a.lomba)+', '+esc(TINGKAT[a.tingkat])+' juara '+esc(a.peringkat):a.jalur==="afirmasi"?': '+esc(a.kartu):': '+esc(a.instansi))+'</dd><dt>Pilihan</dt><dd>1. '+esc(a.p1)+', 2. '+esc(a.p2)+'</dd><dt>Mendaftar</dt><dd>'+esc(fdt(a.at))+'</dd></dl></section>'
 +'<section class="card"><h2>Skor otomatis</h2><dl class="kv">'+MAPEL.map(function(m){return '<dt>'+m[1]+'</dt><dd>'+esc(a.grades[m[0]])+'</dd>'}).join("")+s.parts.map(function(p){return '<dt>'+esc(p[0])+'</dt><dd>'+p[1]+'</dd>'}).join("")+'<dt>Skor akhir</dt><dd style="font-size:1.3rem">'+s.total+'</dd><dt>Peringkat</dt><dd>'+(st==="terverifikasi"?rankOf(a)+' dari '+counts(a.jalur).ver+' di jalur '+esc(JALUR[a.jalur].n):"Belum masuk peringkat (berkas belum terverifikasi)")+'</dd></dl><div class="note info" style="margin-top:12px">'+esc(JALUR[a.jalur].f)+'</div></section></div>'
 +'<section class="card"><div class="row sp"><h2>Verifikasi berkas</h2><button class="btn sm" data-act="allok" data-no="'+esc(a.no)+'">Setujui semua</button></div>'+ks.map(function(k){var d=a.docs[k[0]]||{status:"menunggu",name:"-",reason:""};return '<div class="file"><div class="row sp"><b>'+esc(k[1])+'</b>'+(d.status==="setuju"?'<span class="badge b-ok">Disetujui</span>':d.status==="tolak"?'<span class="badge b-bad">Ditolak</span>':'<span class="badge b-warn">Menunggu</span>')+'</div><small>File: '+esc(d.name)+'</small>'+(d.status==="tolak"?'<small style="color:var(--bad)">Alasan: '+esc(d.reason)+'</small>':"")+'<input class="inp" id="rs-'+k[0]+'" aria-label="Alasan penolakan '+esc(k[1])+'" placeholder="Alasan jika ditolak" maxlength="120"><div class="row"><button class="btn sm" data-act="doc" data-no="'+esc(a.no)+'" data-k="'+k[0]+'" data-v="setuju">Setujui</button><button class="btn sm bad" data-act="doc" data-no="'+esc(a.no)+'" data-k="'+k[0]+'" data-v="tolak">Tolak</button></div></div>'}).join("")+'</section>'
 +'<section class="card"><h2>Keputusan</h2>'+(st==="terverifikasi"?'<p>Kuota lulus '+counts(a.jalur).lulus+'/'+db.quota[a.jalur].k+', cadangan '+counts(a.jalur).cadangan+'/'+db.quota[a.jalur].c+'.</p>'+decBtns(a):'<div class="note">Keputusan bisa ditetapkan setelah semua berkas disetujui.</div>')+'</section>'}
function decBtns(a){return '<div class="seg">'+[["lulus","Lulus"],["cadangan","Cadangan"],["tidak","Tidak lulus"]].map(function(d){return '<button data-act="dec" data-no="'+esc(a.no)+'" data-d="'+d[0]+'" aria-pressed="'+(a.decision===d[0])+'" class="'+(a.decision===d[0]?"on":"")+'">'+d[1]+'</button>'}).join("")+'<button data-act="dec" data-no="'+esc(a.no)+'" data-d="" title="Hapus keputusan" aria-label="Hapus keputusan">&times;</button></div>'}
function pRank(){var j=ui.rj,r=ranking(j),c=counts(j),q=db.quota[j],unv=c.total-c.ver;
 return '<div class="tabs">'+JK.map(function(k){return '<a href="#/panitia/peringkat" data-rj="'+k+'" class="'+(k===j?"on":"")+'">'+esc(JALUR[k].n)+'</a>'}).join("")+'</div><div class="card"><div class="row sp"><div><b>Lulus '+c.lulus+' dari kuota '+q.k+'</b><br><small>Cadangan '+c.cadangan+' dari '+q.c+'. Tidak lulus '+c.tidak+'.</small></div><div class="row"><button class="btn sm" data-act="auto">Tetapkan otomatis</button><button class="btn sm ghost" data-act="clear">Kosongkan</button><button class="btn sm sec" data-act="csvrank">Ekspor CSV</button></div></div><div class="q"><i style="width:'+Math.min(100,q.k?c.lulus/q.k*100:0)+'%"></i></div><div class="note info"><b>Rumus.</b> '+esc(JALUR[j].f)+' Seri: nilai tertinggi, lalu pendaftar lebih awal.</div>'
 +(unv?'<p><small>'+unv+' pendaftar jalur ini belum terverifikasi dan tidak masuk peringkat.</small></p>':"")
 +(r.length?'<div class="tw"><table class="rs"><thead><tr><th>#</th><th>Nama</th><th>Nilai</th><th>Skor</th><th>Zona</th><th>Keputusan</th></tr></thead><tbody>'+r.map(function(x,i){return '<tr><td data-l="Peringkat">'+(i+1)+'</td><td data-l="Nama"><a href="#/panitia/pendaftar/'+esc(x.a.no)+'">'+esc(x.a.name)+'</a><br><small>'+esc(x.a.no)+'</small></td><td data-l="Nilai">'+x.s.n+'</td><td data-l="Skor"><b>'+x.s.total+'</b></td><td data-l="Zona">'+(i<q.k?'<span class="badge b-ok">Dalam kuota</span>':i<q.k+q.c?'<span class="badge b-warn">Cadangan</span>':'<span class="badge b-mute">Di luar kuota</span>')+'</td><td data-l="Keputusan">'+decBtns(x.a)+'</td></tr>'}).join("")+'</tbody></table></div>':'<div class="empty">Belum ada pendaftar terverifikasi di jalur ini.</div>')+'</div>'}
function pAnn(){var pend=db.apps.filter(function(a){return statusOf(a)==="terverifikasi"&&!a.decision}).length,dec=db.apps.filter(function(a){return a.decision}).length;
 return '<div class="card"><h2>Pengumuman hasil</h2><p>Status: '+(db.announce?'<span class="badge b-ok">Dibuka</span>':'<span class="badge b-mute">Ditutup</span>')+'</p><p>Saat dibuka, pendaftar melihat hasilnya di menu Cek status dan halaman Pengumuman. Saat ditutup, hasil disembunyikan.</p><dl class="kv"><dt>Sudah ada keputusan</dt><dd>'+dec+' pendaftar</dd><dt>Terverifikasi tanpa keputusan</dt><dd>'+pend+' pendaftar</dd></dl>'+(pend&&!db.announce?'<div class="note" style="margin-top:12px">Tetapkan keputusan semua pendaftar terverifikasi di tab Peringkat sebelum membuka pengumuman.</div>':"")+'<p style="margin-top:12px"><button class="btn'+(db.announce?" bad":"")+'" data-act="announce">'+(db.announce?"Tutup pengumuman":"Buka pengumuman")+'</button></p></div>'}
function pCfg(){return '<form class="card" id="cf" novalidate><h2>Jadwal tahapan</h2><div class="grid g2">'+db.sched.map(function(p){return '<fieldset style="border:1px solid var(--line);border-radius:12px;margin:0 0 4px"><legend><b>'+esc(p.n)+'</b></legend><div class="grid g2"><label class="fld"><span>Mulai</span><input class="inp" type="date" id="sc-'+p.id+'-s" value="'+esc(p.s)+'"></label><label class="fld"><span>Selesai</span><input class="inp" type="date" id="sc-'+p.id+'-e" value="'+esc(p.e)+'"></label></div></fieldset>'}).join("")+'</div><h2 style="margin-top:16px">Kuota</h2><div class="grid g4">'+JK.map(function(j){return '<fieldset style="border:1px solid var(--line);border-radius:12px;margin:0 0 4px"><legend><b>'+esc(JALUR[j].n)+'</b></legend><label class="fld"><span>Kuota lulus</span><input class="inp" type="number" min="0" max="500" id="q-'+j+'-k" value="'+db.quota[j].k+'"></label><label class="fld"><span>Cadangan</span><input class="inp" type="number" min="0" max="500" id="q-'+j+'-c" value="'+db.quota[j].c+'"></label></fieldset>'}).join("")+'</div><h2 style="margin-top:16px">Aturan lain</h2><div class="grid g3"><label class="fld"><span>Usia minimum (tahun)</span><input class="inp" type="number" id="a-min" value="'+db.minAge+'"></label><label class="fld"><span>Usia maksimum (tahun)</span><input class="inp" type="number" id="a-max" value="'+db.maxAge+'"></label><label class="fld"><span>PIN panitia (4 angka)</span><input class="inp" id="a-pin" inputmode="numeric" maxlength="4" value="'+esc(db.pin)+'"></label></div><div class="er" id="cf-e"></div><button class="btn" type="submit">Simpan pengaturan</button></form>'}
function saveCfg(){var e=$("#cf-e"),sc=[],i,q={},v=function(id){return $("#"+id).value};
 for(i=0;i<db.sched.length;i++){var p=db.sched[i],s=v("sc-"+p.id+"-s"),en=v("sc-"+p.id+"-e");if(!validDate(s)||!validDate(en)){e.textContent="Tanggal "+p.n+" belum lengkap.";return}if(en<s){e.textContent="Tanggal selesai "+p.n+" tidak boleh sebelum tanggal mulai.";return}sc.push({id:p.id,n:p.n,s:s,e:en})}
 for(i=0;i<JK.length;i++){var j=JK[i],k=v("q-"+j+"-k"),c=v("q-"+j+"-c");if(!/^\d{1,3}$/.test(k)||!/^\d{1,3}$/.test(c)){e.textContent="Kuota "+JALUR[j].n+" harus bilangan bulat 0 sampai 500.";return}
  var ct=counts(j);if(+k<ct.lulus){e.textContent="Kuota "+JALUR[j].n+" tidak boleh di bawah jumlah yang sudah lulus ("+ct.lulus+").";return}if(+c<ct.cadangan){e.textContent="Cadangan "+JALUR[j].n+" tidak boleh di bawah jumlah cadangan saat ini ("+ct.cadangan+").";return}q[j]={k:+k,c:+c}}
 var mn=+v("a-min"),mx=+v("a-max"),pin=v("a-pin").trim();
 if(!(mn>=5&&mx<=30&&mn<mx)){e.textContent="Usia minimum harus lebih kecil dari maksimum (5 sampai 30).";return}
 if(!/^\d{4}$/.test(pin)){e.textContent="PIN harus 4 angka.";return}
 db.sched=sc;db.quota=q;db.minAge=mn;db.maxAge=mx;db.pin=pin;save();e.textContent="";toast("Pengaturan disimpan.");render(1)}
/* CSV */
function cell(v){v=String(v==null?"":v);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function dl(name,rows){var t="﻿"+rows.map(function(r){return r.map(cell).join(",")}).join("\r\n"),b=new Blob([t],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000)}
function csvRows(L,withRank){var h=["No pendaftaran","NISN","Nama","JK","Tanggal lahir","Jalur","Pilihan 1","Pilihan 2","Rata-rata nilai","Skor","Status berkas","Keputusan","Tanggal daftar","HP"];if(withRank)h.unshift("Peringkat");
 return [h].concat(L.map(function(a){var s=score(a),r=[a.no,a.nisn,a.name,a.gender,a.dob,JALUR[a.jalur].n,a.p1,a.p2,s.n,s.total,STL[statusOf(a)][0],a.decision?DEC[a.decision][0]:"",a.at.slice(0,10),a.phone];if(withRank)r.unshift(rankOf(a));return r}))}

/* ---------- Router dan event ---------- */
function parts(){return (location.hash||"#/").replace(/^#\/?/,"").split("/").map(decodeURIComponent)}
function render(keep){var p=parts(),r=p[0]||"home",h;
 if(r==="jalur")h=vJalur();else if(r==="daftar")h=vDaftar();else if(r==="status")h=vStatus(p[1]);else if(r==="pengumuman")h=vPengumuman();else if(r==="panitia")h=vPanitia(p[1],p[2]);else{r="home";h=vHome()}
 app.innerHTML=h;
 [].forEach.call(document.querySelectorAll("nav.main a"),function(a){a.classList.toggle("on",a.getAttribute("data-r")===r)});
 $("#yr").textContent="PPDB "+db.year;
 if(!keep){window.scrollTo(0,0);app.focus({preventScroll:true});$("#nav").classList.remove("open");$("#menubtn").setAttribute("aria-expanded","false");document.title=({home:"Beranda",jalur:"Jalur",daftar:"Formulir",status:"Cek status",pengumuman:"Pengumuman",panitia:"Panitia"})[r]+" | PPDB SMA Harapan Nusantara"}
 if(r!=="status")flash=null}
window.addEventListener("hashchange",function(){render()});
window.addEventListener("error",function(e){window.__errs=(window.__errs||[]).concat(String(e.message))});
function okFile(f){if(!/\.(pdf|jpe?g|png)$/i.test(f.name)){toast("Format harus PDF, JPG, atau PNG.",1);return false}if(f.size>2*1024*1024){toast("Ukuran file maksimal 2 MB.",1);return false}return true}
function doReset(){localStorage.removeItem(KEY);sessionStorage.clear();db=seed();save();form=null;ui={q:"",jalur:"",status:"",dec:"",sort:"new",page:1,rj:"zonasi",pj:"",pq:""};armed=null;var b=$("#reset");b.textContent="Reset data demo";location.hash="#/";render();toast("Data demo dikembalikan ke awal.")}
function download(rows,name){dl(name,rows);toast("File "+name+" diunduh.")}
document.addEventListener("click",function(e){var t=e.target;
 if(t.id==="menubtn"){var n=$("#nav"),o=n.classList.toggle("open");t.setAttribute("aria-expanded",o);return}
 var pj=t.closest("[data-pj]");if(pj){e.preventDefault();ui.pj=pj.getAttribute("data-pj");render(1);return}
 var rj=t.closest("[data-rj]");if(rj){e.preventDefault();ui.rj=rj.getAttribute("data-rj");render(1);return}
 var b=t.closest("[data-act]");if(!b)return;var a=b.getAttribute("data-act"),no=b.getAttribute("data-no");
 if(a==="reset"){if(armed!=="reset"){armed="reset";b.textContent="Tekan lagi untuk reset";setTimeout(function(){if(armed==="reset"){armed=null;b.textContent="Reset data demo"}},4000);return}doReset();return}
 if(a==="print"){try{window.print()}catch(x){}return}
 if(a==="goto"){form.step=+b.getAttribute("data-a");form.err={};render();return}
 if(a==="prev"){form.step--;form.err={};render();return}
 if(a==="draft"){saveDraft();return}
 if(a==="resume"){form={step:db.draft.step,d:Object.assign(blank(),db.draft.d),err:{}};render();return}
 if(a==="newform"){db.draft=null;save();form={step:1,d:blank(),err:{}};render();return}
 if(a==="sample"){var f=find("PPDB"+db.ref.slice(2,4)+"-0001");if(f){$("#s-no").value=f.no;$("#s-dob").value=f.dob}return}
 if(a==="logout"){sessionStorage.removeItem(ADMIN_KEY);render();return}
 if(a==="page"){ui.page+=+b.getAttribute("data-a");$("#plist").innerHTML=pListRows();return}
 if(a==="csvlist"){download(csvRows(listData()),"pendaftar-ppdb.csv");return}
 if(a==="csvrank"){download(csvRows(ranking(ui.rj).map(function(x){return x.a}),1),"peringkat-"+ui.rj+".csv");return}
 if(a==="allok"){var A=find(no);Object.keys(A.docs).forEach(function(k){A.docs[k].status="setuju";A.docs[k].reason=""});save();render(1);toast("Semua berkas disetujui.");return}
 if(a==="doc"){var A2=find(no),k=b.getAttribute("data-k"),v=b.getAttribute("data-v");
  if(v==="tolak"){var rs=$("#rs-"+k).value.trim();if(rs.length<3){toast("Isi alasan penolakan (minimal 3 karakter).",1);$("#rs-"+k).focus();return}A2.docs[k].status="tolak";A2.docs[k].reason=rs}
  else{A2.docs[k].status="setuju";A2.docs[k].reason=""}
  if(statusOf(A2)!=="terverifikasi")A2.decision=null;save();render(1);toast(v==="tolak"?"Berkas ditolak.":"Berkas disetujui.");return}
 if(a==="dec"){if(setDecision(no,b.getAttribute("data-d")))render(1);return}
 if(a==="auto"){var n=autoDecide(ui.rj);render(1);toast(n?"Keputusan ditetapkan untuk "+n+" pendaftar sesuai kuota.":"Belum ada pendaftar terverifikasi.",!n);return}
 if(a==="clear"){db.apps.forEach(function(x){if(x.jalur===ui.rj)x.decision=null});save();render(1);toast("Keputusan jalur dikosongkan.");return}
 if(a==="announce"){if(!db.announce){var pend=db.apps.filter(function(x){return statusOf(x)==="terverifikasi"&&!x.decision}).length;if(pend){toast(pend+" pendaftar terverifikasi belum punya keputusan.",1);return}}db.announce=!db.announce;save();render(1);toast(db.announce?"Pengumuman dibuka.":"Pengumuman ditutup.");return}
});
function onField(e){var t=e.target,p=t.getAttribute&&t.getAttribute("data-f");
 if(p&&form){sv(p,t.type==="checkbox"?t.checked:t.value);if(form.err[p]){delete form.err[p];var er=$("#e-f-"+p.replace(".","-"));if(er)er.textContent="";t.removeAttribute("aria-invalid")}
  if(e.type==="change"){if(p==="jalur"){form.d.docs={};render(1);var c=$("input[data-f=jalur]:checked");if(c)c.focus()}else if(t.type==="radio"||t.type==="checkbox"){[].forEach.call(document.querySelectorAll('input[name="'+t.name+'"]'),function(r){r.closest(".opt").classList.toggle("on",r.checked)});if(t.type==="checkbox")t.closest(".opt").classList.toggle("on",t.checked)}}return}
 var u=t.getAttribute&&t.getAttribute("data-ui");
 if(u){ui[u]=t.value;ui.page=1;$("#plist").innerHTML=pListRows();return}
 if(t.id==="pq"){ui.pq=t.value;$("#plist").innerHTML=pubRows(ui.pj||"zonasi");return}
 if(e.type==="change"&&t.type==="file"){var f=t.files[0];if(!f)return;
  var dk=t.getAttribute("data-doc");if(dk&&form){if(!okFile(f)){t.value="";return}form.d.docs[dk]=f.name;delete form.err["doc-"+dk];var box=t.closest(".file");box.classList.add("ok");box.querySelector("span").innerHTML="Terpilih: <b>"+esc(f.name)+"</b>";var er2=box.querySelector(".er");if(er2)er2.textContent="";return}
  var fx=t.getAttribute("data-fix");if(fx){if(!okFile(f)){t.value="";return}var A=find(parts()[1]);A.docs[fx]={name:f.name,status:"menunggu",reason:""};save();render(1);toast("Berkas pengganti dicatat, menunggu verifikasi ulang.")}}}
document.addEventListener("input",onField);document.addEventListener("change",onField);
document.addEventListener("submit",function(e){e.preventDefault();var id=e.target.id;
 if(id==="fm")nextStep();
 if(id==="sf"){var no=$("#s-no").value.trim().toUpperCase(),dob=$("#s-dob").value,a=find(no),er=$("#s-e");if(!no||!dob){er.textContent="Isi nomor pendaftaran dan tanggal lahir.";return}if(!a||a.dob!==dob){er.textContent="Nomor atau tanggal lahir tidak cocok. Periksa lagi.";return}unlock(a.no);location.hash="#/status/"+a.no}
 if(id==="lf"){if($("#pin").value===db.pin){sessionStorage.setItem(ADMIN_KEY,"1");render()}else{$("#pin-e").textContent="PIN salah. PIN demo: "+db.pin;$("#pin").value="";$("#pin").focus()}}
 if(id==="cf")saveCfg()});
render();
