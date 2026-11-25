/* Klinik Sehat Prima: tampilan dan aksi. Bergantung pada app.js (KS). */
(function(){
"use strict";
var K=KS,esc=K.esc,S=K.SES;
function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
var main=$("#main"),hdr=$("#hdr");
var bk=null,rs=null,chk=null,chkF={code:"",phone:"",err:""},sh=null,stafOk=false,armed=null,armT=null,toastT=null,lastFocus=null;
var sf={q:"",st:"",doc:"",svc:"",rng:"upcoming",date:"",sort:"asc",page:1},qd=null,qdoc="all",pq="",pPage=1,hErr="";
var PER=12;

/* ---------- util ---------- */
function toast(m,bad){var t=$("#toast");t.textContent=m;t.className=bad?"bad":"";t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200)}
function chip(b,pub){return'<span class="chip '+b.st+'">'+esc(K.stLabel(b,pub))+'</span>'}
var AVC=["#1f5f5b","#4d5a3a","#1d4f55","#5c6b4f","#2f7d76","#6b7a5a"];
function avatar(d){var i=0;K.db.docs.forEach(function(x,n){if(x.id===d.id)i=n});return'<i style="background:'+AVC[i%AVC.length]+'" aria-hidden="true">'+esc(K.initials(d.n))+'</i>'}
function go(h){if(location.hash===h)render();else location.hash=h}
function refresh(){var y=window.scrollY,a=document.activeElement,id=a&&a.id;render();window.scrollTo(0,y);if(id){var e=document.getElementById(id);if(e)e.focus()}if(sh)sheetRefresh()}
function stafGet(){try{return sessionStorage.getItem("klinik-sehat.staf")==="1"}catch(e){return stafOk}}
function stafSet(v){stafOk=v;try{if(v)sessionStorage.setItem("klinik-sehat.staf","1");else sessionStorage.removeItem("klinik-sehat.staf")}catch(e){}}
function parse(){var h=location.hash.replace(/^#\/?/,""),q={},i=h.indexOf("?");if(i>=0){h.slice(i+1).split("&").forEach(function(kv){var a=kv.split("=");try{q[decodeURIComponent(a[0])]=decodeURIComponent(a[1]||"")}catch(e){}});h=h.slice(0,i)}return{p:h.split("/").filter(Boolean),q:q}}
function summ(rows){return'<div class="sum">'+rows.filter(Boolean).map(function(r){return'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join("")+'</div>'}
function bkRows(b,pub){
  var sv=K.svcOf(b.svc),dc=K.docOf(b.doc);
  return[["Layanan",esc(sv.n)],["Dokter",esc(dc.n)],["Tanggal",esc(K.fdate(b.date))],["Jam",esc(b.time)+" WIB"],b.date===K.today()&&b.st!=="batal"?["No. antrian",esc(b.qn)]:null,["Pasien",esc(b.name)],["Pembayaran",esc(b.pay)+(b.pay==="Asuransi"?" ("+esc(b.ins)+")":"")]]
}

/* ---------- header ---------- */
function hdrPub(a){
  var L=[["layanan","Layanan"],["dokter","Dokter"],["janji","Janji temu"],["cek","Cek booking"]];
  hdr.innerHTML='<a class="logo" href="#/"><i aria-hidden="true">+</i><span>Klinik Sehat Prima</span></a><nav class="main" aria-label="Menu utama">'+L.map(function(x){return'<a href="#/'+x[0]+'"'+(a===x[0]||(a==="ubah"&&x[0]==="cek")?' aria-current="page"':'')+'>'+x[1]+'</a>'}).join("")+'</nav>'
}
function hdrStaff(t){
  var L=[["ringkasan","Ringkasan"],["antrian","Antrian"],["booking","Booking"],["jadwal","Jadwal"],["pasien","Pasien"]],td=K.today(),w=K.db.bookings.filter(function(b){return b.date===td&&b.st==="menunggu"}).length;
  hdr.innerHTML='<a class="logo" href="#/staf"><i aria-hidden="true">+</i>Panel staf</a>'+(stafGet()?'<nav class="stnav" aria-label="Menu staf">'+L.map(function(x){return'<a href="#/staf/'+x[0]+'"'+(t===x[0]?' aria-current="page"':'')+'>'+x[1]+(x[0]==="antrian"&&w?' <span class="badge">'+w+'</span>':'')+'</a>'}).join("")+'<a href="#/">Lihat situs</a><button class="btn ghost sm" data-act="logout">Keluar</button></nav>':'<a class="btn ghost sm" href="#/" style="margin-left:auto">Ke situs</a>')
}

/* ---------- router ---------- */
function render(){
  var r=parse(),p=r.p,a=p[0]||"",staff=a==="staf";
  document.body.classList.toggle("staff",staff);
  var cr=window.__credit;if(cr)$("#credit").innerHTML=cr;
  if(staff){var t=p[1]||"ringkasan";hdrStaff(t);main.innerHTML=stafGet()?staffView(t):vLogin();return}
  hdrPub(a);
  var h;
  if(a==="layanan")h=p[1]?vSvc(p[1]):vSvcList();
  else if(a==="dokter")h=p[1]?vDoc(p[1]):vDocList();
  else if(a==="janji"){if(!bk||bk.done||r.q.svc||r.q.doc)newBk(r.q);h='<section class="sec"><div class="wrap"><span class="kick">Janji temu online</span><h1 style="margin:6px 0;color:var(--ink);font-size:clamp(1.6rem,4vw,2.4rem)">Buat janji temu</h1><div id="wiz"></div></div></section>'}
  else if(a==="cek")h=vCek();
  else if(a==="ubah"){if(!rs){location.hash="#/cek";return}h=vUbah()}
  else h=vHome();
  main.innerHTML=h;
  if(a==="janji")wiz();
}
function route(){window.scrollTo(0,0);if(sh&&parse().p[0]!=="staf")closeSheet();render();var m=$("#main");if(m)m.focus({preventScroll:true})}

/* ---------- publik: beranda, layanan, dokter ---------- */
function svcCards(){return'<ol class="svl">'+K.db.svcs.map(function(x,i){return'<li><a href="#/layanan/'+x.id+'"><span class="no" aria-hidden="true">'+K.p2(i+1)+'</span><span class="tx"><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small><span class="ds">'+esc(x.about.split(". ")[0].replace(/\.$/,""))+'.</span></span><span class="pr">'+K.rp(x.price)+'<em>contoh biaya</em></span></a></li>'}).join("")+'</ol>'}
function docRow(d,tag){var n=K.nextFree(d.id);return'<a class="doc" href="#/dokter/'+d.id+'">'+avatar(d)+'<span><b>'+esc(d.n)+'</b><small>'+esc(d.spec)+' &middot; '+esc(K.daysOf(d))+'</small>'+(n?'<small style="display:block">Kosong terdekat: '+esc(K.sdate(n.date))+'</small>':'<small style="display:block">Belum ada jadwal kosong</small>')+'</span>'+(tag||"")+'</a>'}
function todayBox(){
  var td=K.today();
  return'<div class="today">'+K.db.docs.map(function(d){var i=K.slotInfo(d.id,td);return'<div class="box"><b style="color:var(--ink)">'+esc(d.n)+'</b><br><small>'+esc(d.spec)+'</small><p style="margin:8px 0 0">'+(i.off&&!i.ses.length?'<span class="tag off">'+esc(i.k==="hol"?i.off:"Tidak praktik hari ini")+'</span>':(i.free?'<span class="tag">'+i.free+' slot kosong hari ini</span>':'<span class="tag off">Penuh hari ini</span>'))+'</p></div>'}).join("")+'</div>'
}
function faq(){return'<section class="sec" id="faq"><div class="faq"><h2>Pertanyaan yang sering diajukan</h2><p class="lead">Contoh bagian FAQ untuk website klinik.</p><details class="fq" open><summary>Apakah saya harus datang lebih awal?</summary><p>Disarankan datang 15 menit sebelum jadwal. Tunjukkan kode booking di resepsionis untuk mendapat nomor antrian.</p></details><details class="fq"><summary>Bagaimana jika ingin mengubah atau membatalkan jadwal?</summary><p>Buka halaman Cek booking, masukkan kode dan nomor telepon. Perubahan bisa dilakukan sendiri sampai 3 jam sebelum jadwal. Setelah itu hubungi resepsionis.</p></details><details class="fq"><summary>Apakah pasien asuransi dilayani?</summary><p>Ya. Pilih Asuransi saat membuat janji dan isi nama asuransi serta nomor polis. Petugas memeriksa kartu di resepsionis.</p></details><details class="fq"><summary>Apakah ada layanan untuk anak?</summary><p>Ada. Pilih layanan Kesehatan anak agar jadwalnya diarahkan ke dokter anak. Untuk usia sampai 17 tahun.</p></details></div></section>'}
var TONES=[["#dfe8e1","#1f5f5b"],["#e8e6d6","#4d5a3a"],["#d8e6e4","#1d4f55"],["#ece7dc","#5c5a40"]];
function docCard(d,i){var n=K.nextFree(d.id),t=TONES[i%TONES.length];return'<a class="dc" href="#/dokter/'+d.id+'" style="--tb:'+t[0]+';--tf:'+t[1]+'"><span class="pt" aria-hidden="true"><span>'+esc(d.letter||d.n.replace(/^dr?g?\.\s*/,"").charAt(0))+'</span></span><span class="in"><small>'+esc(d.spec)+'</small><b>'+esc(d.n)+'</b><span class="mu">'+esc(K.daysOf(d))+'</span><span class="nx">'+(n?'Kosong terdekat '+esc(K.sdate(n.date)):'Belum ada jadwal kosong')+'</span></span></a>'}
function qsDocs(sv,sel){var s=K.svcOf(sv);return K.docsFor(s?s.id:"").map(function(d){return'<option value="'+esc(d.id)+'"'+(d.id===sel?' selected':'')+'>'+esc(d.n)+'</option>'}).join("")}
function qsDate(doc){var n=K.nextFree(doc);return n?n.date:""}
function quickWidget(){
  var s0=K.db.svcs[0],d0=K.docsFor(s0.id)[0],td=K.today(),mx=K.ymd(K.addDays(new Date(),K.HORIZON));
  return'<form class="qs" id="qs" novalidate aria-label="Cari jadwal janji temu"><label>Layanan<select id="qs-svc" name="svc">'+K.db.svcs.map(function(s){return'<option value="'+esc(s.id)+'">'+esc(s.n)+'</option>'}).join("")+'</select></label><label>Dokter<select id="qs-doc" name="doc">'+qsDocs(s0.id,d0.id)+'</select></label><label>Tanggal<input type="date" id="qs-date" name="date" min="'+td+'" max="'+mx+'" value="'+esc(qsDate(d0.id))+'"></label><button class="btn" type="submit">Cari jadwal</button><p class="err" id="qs-err" role="alert" hidden></p></form>'
}
function quickGo(f){
  var sv=f.svc.value,dc=f.doc.value,dt=f.date.value,er=$("#qs-err"),td=K.today(),mx=K.ymd(K.addDays(new Date(),K.HORIZON)),m="";
  if(!K.svcOf(sv)||!dc)m="Pilih layanan dan dokter.";
  else if(dt&&dt<td)m="Tanggal sudah lewat. Pilih hari ini atau sesudahnya.";
  else if(dt&&dt>mx)m="Janji hanya bisa dibuat sampai 60 hari ke depan.";
  if(m){er.textContent=m;er.hidden=false;return}
  er.hidden=true;go("#/janji?svc="+encodeURIComponent(sv)+"&doc="+encodeURIComponent(dc)+(dt?"&date="+encodeURIComponent(dt):""))
}
function trustBand(){
  var td=K.today(),free=0;K.db.docs.forEach(function(d){var i=K.slotInfo(d.id,td);if(!i.off)free+=i.free});
  return'<section class="trust" aria-label="Ringkasan klinik"><div><small>Jam praktik</small><b>Senin sampai Sabtu</b><span>08.00 - 16.00 WIB</span></div><div><small>Layanan</small><b>'+K.db.svcs.length+' jenis</b><span>Umum, gigi, anak, laboratorium</span></div><div><small>Dokter</small><b>'+K.db.docs.length+' orang</b><span>Jadwal tampil per hari</span></div><div><small>Hari ini</small><b>'+free+' slot kosong</b><span>Dihitung dari booking yang masuk</span></div></section>'
}
function zig(img,alt,kick,h,p,lnk,rev){return'<div class="zg'+(rev?' rev':'')+'"><img src="img/'+img+'" alt="'+esc(alt)+'" loading="lazy" width="800" height="600"><div><span class="kick">'+kick+'</span><h2>'+h+'</h2><p>'+p+'</p>'+lnk+'</div></div>'}
function vHome(){
  return'<div class="hero"><img src="img/dokter.jpg" alt="Dokter mencatat hasil konsultasi di meja praktik" width="1280" height="800"><div class="hin"><span class="kick">Klinik keluarga</span><h1>Periksa kesehatan tanpa antre panjang.</h1><p>Pilih layanan, dokter, dan jam yang masih kosong. Kode booking langsung muncul.</p></div></div>'+
  '<div class="qsw">'+quickWidget()+'</div>'+trustBand()+
  '<section class="sec" id="dokter"><div class="wrap wide"><div class="sh"><div><span class="kick">Dokter</span><h2>Dokter yang praktik</h2><p class="lead">Nama dan jadwal hanya contoh.</p></div><div class="arr"><button type="button" class="btn ghost sm" data-act="scr" data-dir="-1" aria-label="Geser ke kiri">&lsaquo;</button><button type="button" class="btn ghost sm" data-act="scr" data-dir="1" aria-label="Geser ke kanan">&rsaquo;</button></div></div></div><div class="scroller" id="dscr" tabindex="0" role="region" aria-label="Daftar dokter">'+K.db.docs.map(docCard).join("")+'</div></section>'+
  '<section class="sec" id="layanan"><div class="wrap wide"><span class="kick">Layanan</span><h2>Layanan kami</h2><p class="lead">Biaya hanya contoh. Pilih layanan untuk melihat detail dan membuat janji.</p>'+svcCards()+'</div></section>'+
  '<section class="sec zgs"><div class="wrap wide">'+
  zig("perawat.jpg","Tenaga kesehatan tersenyum","Tim kami","Ditangani tenaga yang sabar menjelaskan.","Dokter dan perawat meluangkan waktu menjelaskan hasil pemeriksaan dan langkah berikutnya, supaya Anda pulang dengan rencana yang jelas.",'<a class="tl" href="#/dokter">Kenali dokternya &rarr;</a>',false)+
  zig("resepsi.jpg","Resepsionis klinik di meja pendaftaran","Kunjungan","Datang, tunjukkan kode, langsung dipanggil.","Setelah booking, Anda mendapat kode. Di klinik, tunjukkan kode ke resepsionis untuk mendapat nomor antrian. Jadwal bisa diubah atau dibatalkan sampai 3 jam sebelumnya.",'<a class="tl" href="#/cek">Cek atau ubah booking &rarr;</a>',true)+
  zig("lab.jpg","Sampel darah untuk pemeriksaan laboratorium","Laboratorium","Cek darah dan urin dalam satu kunjungan.","Pengambilan sampel hanya 15 menit. Hasilnya dijelaskan oleh dokter yang Anda pilih. Beberapa pemeriksaan butuh puasa, jadi baca persiapannya dulu.",'<a class="tl" href="#/layanan/lab">Lihat layanan laboratorium &rarr;</a>',false)+
  '</div></section>'+
  '<section class="sec"><div class="wrap wide"><span class="kick">Alur</span><h2>Cara membuat janji</h2><ol class="how"><li><b>Pilih layanan dan dokter</b><p>Hanya dokter yang melayani layanan itu yang muncul.</p></li><li><b>Pilih tanggal dan jam</b><p>Hari libur dan sesi penuh tidak bisa dipilih. Jam yang sudah terisi dicoret.</p></li><li><b>Isi data dan simpan kode</b><p>Kode booking dipakai untuk cek, ubah, atau batalkan jadwal.</p></li></ol></div></section>'+faq()
}
function vSvcList(){return'<section class="sec"><div class="wrap"><span class="kick">Layanan</span><h1 style="margin:6px 0;color:var(--ink)">Layanan kami</h1><p class="lead">Biaya hanya contoh untuk demo.</p>'+svcCards()+'</div></section>'}
function vSvc(id){
  var s=K.svcOf(id);if(!s)return'<section class="sec"><div class="wrap"><div class="empty">Layanan tidak ditemukan. <a href="#/layanan">Lihat semua layanan</a></div></div></section>';
  return'<section class="sec"><div class="wrap"><a class="crumb" href="#/layanan">&larr; Semua layanan</a><div class="detail"><img src="img/'+esc(s.img)+'" alt="'+esc(s.n)+'"><div><h1 style="margin:0 0 6px;color:var(--ink)">'+esc(s.n)+'</h1><p>'+esc(s.about)+'</p>'+summ([["Durasi",s.dur+" menit"],["Biaya contoh",K.rp(s.price)],["Persiapan",esc(s.prep)]])+'<h3 style="color:var(--ink);margin:20px 0 8px">Dokter yang melayani</h3><div class="docs">'+K.docsFor(s.id).map(function(d){return docRow(d,'<span class="btn sm" aria-hidden="true">Detail</span>')}).join("")+'</div><div class="cta"><a class="btn" href="#/janji?svc='+s.id+'">Buat janji untuk layanan ini</a></div></div></div></div></section>'
}
function vDocList(){return'<section class="sec"><div class="wrap"><span class="kick">Tim kami</span><h1 style="margin:6px 0;color:var(--ink)">Daftar dokter</h1><p class="lead">Jadwal praktik berubah mengikuti pengaturan staf.</p><div class="docs">'+K.db.docs.map(function(d){return docRow(d)}).join("")+'</div></div></section>'}
function vDoc(id){
  var d=K.docOf(id);if(!d)return'<section class="sec"><div class="wrap"><div class="empty">Dokter tidak ditemukan. <a href="#/dokter">Lihat semua dokter</a></div></div></section>';
  var rows=[1,2,3,4,5,6,0].map(function(w){var ks=d.sched[w]||[];return'<tr><td>'+K.DN[w]+'</td>'+["pagi","siang"].map(function(k){return'<td class="c">'+(ks.indexOf(k)>=0?'Praktik':'-')+'</td>'}).join("")+'</tr>'}).join("");
  var lim=K.ymd(K.addDays(new Date(),K.HORIZON)),hol=K.db.holidays.filter(function(h){return h.date>=K.today()&&h.date<=lim&&(h.doc==="all"||h.doc===d.id)}).sort(function(a,b){return a.date<b.date?-1:1});
  var n=K.nextFree(d.id);
  return'<section class="sec"><div class="wrap"><a class="crumb" href="#/dokter">&larr; Semua dokter</a><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">'+avatar(d)+'<div><h1 style="margin:0;color:var(--ink);font-size:1.7rem">'+esc(d.n)+'</h1><span class="kick">'+esc(d.spec)+'</span></div></div><p>'+esc(d.bio)+'</p>'+
  '<div class="dl"><div class="box"><h4>Jadwal praktik</h4><table class="stbl"><tr><th>Hari</th><th class="c">Pagi<br>'+S.pagi.r+'</th><th class="c">Siang<br>'+S.siang.r+'</th></tr>'+rows+'</table><p class="hint" style="margin:8px 0 0">Kuota per sesi: pagi '+d.quota.pagi+', siang '+d.quota.siang+' pasien.</p></div>'+
  '<div class="box"><h4>Libur dan cuti</h4>'+(hol.length?hol.map(function(h){return'<p style="margin:4px 0">'+esc(K.sdate(h.date))+': '+esc(h.note)+'</p>'}).join(""):'<p>Tidak ada libur dalam 60 hari ke depan.</p>')+'<h4 style="margin-top:14px">Kosong terdekat</h4><p>'+(n?esc(K.fdate(n.date))+', '+n.free+' slot':'Belum ada jadwal kosong.')+'</p></div></div>'+
  '<h3 style="color:var(--ink);margin:22px 0 10px">Buat janji</h3><div class="cta" style="margin-top:0">'+K.db.svcs.filter(function(s){return s.docs.indexOf(d.id)>=0}).map(function(s){return'<a class="btn" href="#/janji?svc='+s.id+'&doc='+d.id+'">'+esc(s.n)+'</a>'}).join("")+'</div></div></section>'
}

/* ---------- komponen jadwal (kalender + jam) ---------- */
function schedHtml(c){
  var ph=c.phone||(c.f&&c.f.phone)||"";var td=K.today(),minM=td.slice(0,7),maxM=K.ymd(K.addDays(new Date(),K.HORIZON)).slice(0,7);
  if(!c.cm)c.cm=(c.date||td).slice(0,7);
  var y=+c.cm.slice(0,4),m=+c.cm.slice(5,7)-1,lead=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate(),cells="";
  ["Sen","Sel","Rab","Kam","Jum","Sab","Min"].forEach(function(n){cells+='<div class="dn">'+n+'</div>'});
  for(var i=0;i<lead;i++)cells+='<span class="cd pad"></span>';
  for(var d=1;d<=dim;d++){
    var ds=y+"-"+K.p2(m+1)+"-"+K.p2(d),inf=K.slotInfo(c.doc,ds,c.ign,ph),cl="cd"+(inf.k==="full"?" full":"")+(inf.k==="hol"?" hol":"")+(ds===td?" today":"")+(c.date===ds?" on":""),lb;
    if(!inf.off)lb=inf.free;else if(inf.k==="hol")lb="Libur";else if(inf.k==="full")lb="Penuh";else if(inf.k==="none")lb="-";else lb="";
    cells+='<button type="button" class="'+cl+'" data-act="pickdate" data-d="'+ds+'"'+(inf.off?' disabled':'')+(c.date===ds?' aria-pressed="true"':'')+' aria-label="'+esc(K.sdate(ds)+", "+(inf.off||inf.free+" slot kosong"))+'">'+d+'<small>'+esc(lb)+'</small></button>'
  }
  var h='<div class="cal"><div class="calh"><button type="button" class="btn ghost sm" data-act="calprev" aria-label="Bulan sebelumnya"'+(c.cm<=minM?' disabled':'')+'>&lsaquo;</button><b>'+K.MN[m]+' '+y+'</b><button type="button" class="btn ghost sm" data-act="calnext" aria-label="Bulan berikutnya"'+(c.cm>=maxM?' disabled':'')+'>&rsaquo;</button></div><div class="cg">'+cells+'</div><div class="legend"><span><i style="background:var(--soft)"></i>Angka = slot kosong</span><span><i style="background:#fdf0e3"></i>Penuh</span><span><i style="background:#fdeeee"></i>Libur</span><span>- = dokter tidak praktik</span></div></div>';
  if(!c.date)return h+'<p class="sub">Pilih tanggal dulu.</p>';
  var inf=K.slotInfo(c.doc,c.date,c.ign,ph);
  h+='<h4 style="margin:0;color:var(--ink)">'+esc(K.fdate(c.date))+'</h4>';
  inf.ses.forEach(function(o){
    h+='<div class="sesh"><span>Sesi '+o.n.toLowerCase()+' <small>'+o.r+'</small></span><small>Kuota terisi '+o.used+' dari '+o.quota+'</small></div><div class="slots">'+o.slots.map(function(x){
      var dis=x.s!=="free";return'<button type="button" class="slot'+(c.time===x.t?' on':'')+'" data-act="picktime" data-t="'+x.t+'"'+(dis?' disabled title="'+esc(K.checkSlot(c.doc,c.date,x.t,c.ign,ph)||"")+'"':'')+(c.time===x.t?' aria-pressed="true"':'')+'>'+x.t+'</button>'}).join("")+'</div>'+(o.used>=o.quota?'<p class="hint">Kuota sesi ini penuh.</p>':'')
  });
  return h+'<p class="hint" style="margin-top:10px">Jam yang dicoret sudah terisi atau sudah lewat.</p>'
}

/* ---------- publik: wizard booking ---------- */
function newBk(q){
  bk={step:0,svc:null,doc:null,date:null,time:null,cm:null,f:{name:"",dob:"",phone:"",pay:"Umum",ins:"",pol:"",kl:""},err:{},msg:"",done:null};
  var s=q.svc&&K.svcOf(q.svc);
  if(s){bk.svc=s.id;bk.step=1;if(q.doc&&s.docs.indexOf(q.doc)>=0){bk.doc=q.doc;bk.step=2;if(/^\d{4}-\d\d-\d\d$/.test(q.date||"")&&!K.slotInfo(bk.doc,q.date).off){bk.date=q.date;bk.cm=q.date.slice(0,7)}}}
}
function pills(){var a=[];if(bk.svc)a.push(K.svcOf(bk.svc).n);if(bk.doc&&bk.step>1)a.push(K.docOf(bk.doc).n);if(bk.date&&bk.time&&bk.step>2)a.push(K.sdate(bk.date)+", "+bk.time);return a.length?'<div class="chosen">'+a.map(function(x){return'<span class="pill">'+esc(x)+'</span>'}).join("")+'</div>':""}
function formHtml(){
  var f=bk.f,e=bk.err;
  function er(k){return e[k]?'<span class="err" id="e-'+k+'">'+esc(e[k])+'</span>':""}
  function ia(k){return e[k]?' aria-invalid="true" aria-describedby="e-'+k+'"':""}
  return'<form class="f" id="pform" novalidate autocomplete="on"><div class="two"><label>Nama lengkap<input name="name" value="'+esc(f.name)+'" autocomplete="name" maxlength="60"'+ia("name")+'>'+er("name")+'</label><label>Nomor telepon / WhatsApp<input name="phone" value="'+esc(f.phone)+'" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="0812-0000-0000"'+ia("phone")+'>'+er("phone")+'</label></div>'+
  '<div class="two"><label>Tanggal lahir<input name="dob" type="date" value="'+esc(f.dob)+'" min="1900-01-01" max="'+K.today()+'"'+ia("dob")+'>'+er("dob")+'</label><label>Pembayaran<select name="pay"'+ia("pay")+'><option'+(f.pay==="Umum"?' selected':'')+'>Umum</option><option'+(f.pay==="Asuransi"?' selected':'')+'>Asuransi</option></select>'+er("pay")+'</label></div>'+
  '<div class="two" id="insbox"'+(f.pay==="Asuransi"?'':' hidden')+'><label>Nama asuransi<input name="ins" value="'+esc(f.ins)+'" maxlength="40"'+ia("ins")+'>'+er("ins")+'</label><label>Nomor polis<input name="pol" value="'+esc(f.pol)+'" maxlength="24"'+ia("pol")+'>'+er("pol")+'</label></div>'+
  '<label>Keluhan singkat<textarea name="kl" rows="3" maxlength="200"'+ia("kl")+'>'+esc(f.kl)+'</textarea><span class="hint">Maksimal 200 karakter.</span>'+er("kl")+'</label></form>'
}
function wiz(){
  var el=$("#wiz");if(!el||!bk)return;
  var st=bk.step,names=["1. Layanan","2. Dokter","3. Jadwal","4. Data diri","5. Selesai"],h='<div class="steps" aria-label="Langkah">'+names.map(function(n,i){return'<div class="'+(i===st?'on':(i<st?'done':''))+'"'+(i===st?' aria-current="step"':'')+'>'+n+'</div>'}).join("")+'</div><div class="panel">';
  if(st===0)h+='<h3>Pilih layanan</h3><p class="sub">Pilih jenis pemeriksaan yang Anda perlukan.</p><div class="opts">'+K.db.svcs.map(function(x){return'<button type="button" class="opt'+(bk.svc===x.id?' on':'')+'" data-act="psvc" data-id="'+x.id+'"><img src="img/'+esc(x.img)+'" alt="" loading="lazy"><span><b>'+esc(x.n)+'</b><small>'+esc(x.d)+' &middot; '+K.rp(x.price)+'</small></span></button>'}).join("")+'</div>';
  if(st===1)h+=pills()+'<h3>Pilih dokter</h3><p class="sub">Dokter yang melayani layanan ini.</p><div class="pick">'+K.docsFor(bk.svc).map(function(d){var n=K.nextFree(d.id);return'<button type="button" class="pk'+(bk.doc===d.id?' on':'')+'" data-act="pdoc" data-id="'+d.id+'">'+avatar(d)+'<span><b>'+esc(d.n)+'</b><small>'+esc(d.spec)+' &middot; '+esc(K.daysOf(d))+'</small><small>'+(n?'Kosong terdekat: '+esc(K.sdate(n.date)):'Belum ada jadwal kosong')+'</small></span></button>'}).join("")+'</div>';
  if(st===2)h+=pills()+'<h3>Pilih tanggal dan jam</h3><p class="sub">'+esc(K.docOf(bk.doc).n)+' praktik pada '+esc(K.daysOf(K.docOf(bk.doc)))+'.</p>'+(bk.msg?'<div class="notice bad" role="alert">'+esc(bk.msg)+'</div>':'')+schedHtml(bk);
  if(st===3)h+=pills()+'<h3>Data pasien</h3><p class="sub">Isi data singkat untuk konfirmasi.</p>'+(bk.msg?'<div class="notice bad" role="alert">'+esc(bk.msg)+'</div>':'')+formHtml();
  if(st===4){var b=K.bookingOf(bk.done);
    h+='<div class="ok"><div class="tick" aria-hidden="true">&#10003;</div><h3>Janji temu tercatat</h3><p class="sub" style="margin-bottom:12px">Simpan kode ini. Anda butuh kode dan nomor telepon untuk mengubah atau membatalkan jadwal.</p><span class="code" id="bkcode">'+esc(b.code)+'</span></div>'+summ(bkRows(b))+'<p class="hint">Datang 15 menit sebelum jam janji. Nomor antrian resmi dicatat saat Anda tiba.</p><div class="nav" style="justify-content:center"><button type="button" class="btn ghost" data-act="ics" data-id="'+b.id+'">Simpan ke kalender (.ics)</button><button type="button" class="btn ghost" data-act="printproof" data-id="'+b.id+'">Cetak bukti</button><a class="btn ghost" href="#/cek" data-code="'+esc(b.code)+'" data-act="tocek">Cek atau ubah booking</a></div>'
  }
  if(st<4){
    var ok=[bk.svc,bk.doc,bk.date&&bk.time,true][st];
    h+='<div class="nav"><button type="button" class="btn ghost" data-act="back"'+(st===0?' style="visibility:hidden"':'')+'>Kembali</button><button type="button" class="btn" data-act="next"'+(ok?'':' disabled')+'>'+(st===3?'Konfirmasi janji':'Lanjut')+'</button></div>'
  }else h+='<div class="nav" style="justify-content:center"><button type="button" class="btn" data-act="again">Buat janji lagi</button></div>';
  el.innerHTML=h+'</div>'
}
function readForm(){var f=$("#pform");if(!f)return;$$("input,select,textarea",f).forEach(function(i){bk.f[i.name]=i.value})}
function submitForm(){
  readForm();bk.msg="";
  var e=K.validate(bk.f,bk.svc);bk.err=e;
  if(Object.keys(e).length){wiz();var k=["name","phone","dob","pay","ins","pol","kl"].filter(function(x){return e[x]})[0],i=$('#pform [name="'+k+'"]');if(i)i.focus();return}
  var r=K.createBooking({svc:bk.svc,doc:bk.doc,date:bk.date,time:bk.time,f:bk.f});
  if(r.fields){bk.err=r.fields;wiz();return}
  if(r.err){bk.msg=r.err;if(r.sched){bk.time=null;bk.step=2}wiz();toast(r.err,true);return}
  bk.done=r.b.id;bk.step=4;wiz();window.scrollTo(0,0)
}

/* ---------- publik: cek, ubah, batal ---------- */
function vCek(){
  var b=chk&&K.bookingOf(chk),h='<section class="sec"><div class="wrap" style="max-width:720px"><span class="kick">Booking saya</span><h1 style="margin:6px 0;color:var(--ink);font-size:clamp(1.6rem,4vw,2.3rem)">Cek, ubah, atau batalkan booking</h1><p class="lead">Masukkan kode booking dan nomor telepon yang dipakai saat mendaftar.</p>';
  h+='<div class="panel" style="margin-top:18px"><form class="f" id="cekform" novalidate><div class="two"><label>Kode booking<input name="code" value="'+esc(chkF.code)+'" placeholder="KSP-XXXXX" maxlength="12" autocomplete="off" style="text-transform:uppercase"></label><label>Nomor telepon<input name="phone" value="'+esc(chkF.phone)+'" inputmode="tel" placeholder="0812-0000-0000" maxlength="20"></label></div>'+(chkF.err?'<div class="notice bad" role="alert">'+esc(chkF.err)+'</div>':'')+'<button type="submit" class="btn">Cari booking</button></form></div>';
  if(b){
    var self=K.canSelf(b)||(b.st==="menunggu"&&K.conflict(b));
    h+='<div class="panel" style="margin-top:18px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><span class="code">'+esc(b.code)+'</span>'+chip(b,true)+'</div>'+summ(bkRows(b).concat([["Keluhan",esc(b.complaint)]]));
    if(K.conflict(b))h+='<div class="notice warn">Jadwal dokter pada tanggal ini berubah. Mohon pilih jadwal baru.</div>';
    else if(b.st==="menunggu"&&!self)h+='<div class="notice">Perubahan dan pembatalan hanya bisa sampai 3 jam sebelum jadwal. Hubungi resepsionis di 0812-0000-0000 (nomor contoh).</div>';
    if(b.st==="batal")h+='<div class="notice">Booking ini sudah dibatalkan.</div>';
    if(b.st==="selesai"||b.st==="tidak")h+='<div class="notice">Kunjungan ini sudah berstatus '+esc(K.ST[b.st].toLowerCase())+'.</div>';
    h+='<div class="nav" style="justify-content:flex-start">'+(self?'<button type="button" class="btn" data-act="ubah" data-id="'+b.id+'">Ubah jadwal</button><button type="button" class="btn danger" data-act="cancelself" data-id="'+b.id+'" data-arm>Batalkan booking</button>':'')+(b.st==="menunggu"||b.st==="dipanggil"?'<button type="button" class="btn ghost" data-act="ics" data-id="'+b.id+'">Simpan ke kalender (.ics)</button>':'')+'<button type="button" class="btn ghost" data-act="printproof" data-id="'+b.id+'">Cetak bukti</button></div></div>'
  }
  return h+'</div></section>'
}
function doCek(){
  var f=$("#cekform");chkF.code=f.code.value.trim().toUpperCase();chkF.phone=f.phone.value;chk=null;
  if(!chkF.code||!K.normPhone(chkF.phone)){chkF.err="Isi kode booking dan nomor telepon.";render();return}
  var b=K.db.bookings.filter(function(x){return x.code===chkF.code&&K.normPhone(x.phone)===K.normPhone(chkF.phone)})[0];
  if(!b){chkF.err="Kode atau nomor telepon tidak cocok. Periksa lagi.";render();return}
  chkF.err="";chk=b.id;render()
}
function vUbah(){
  var b=K.bookingOf(rs.id),sv=K.svcOf(b.svc);
  rs.ign=b.id;rs.phone=b.phone;rs.doc=b.doc;if(!rs.cm)rs.cm=(rs.date||b.date).slice(0,7);
  return'<section class="sec"><div class="wrap"><span class="kick">Ubah jadwal</span><h1 style="margin:6px 0;color:var(--ink);font-size:clamp(1.5rem,4vw,2.2rem)">Pilih jadwal baru</h1><div class="panel" style="margin-top:16px"><p class="sub">'+esc(b.code)+' &middot; '+esc(sv.n)+' &middot; '+esc(K.docOf(b.doc).n)+' &middot; '+esc(b.name)+'<br>Jadwal sekarang: '+esc(K.sdate(b.date))+', '+b.time+'</p>'+(rs.msg?'<div class="notice bad" role="alert">'+esc(rs.msg)+'</div>':'')+schedHtml(rs)+'<div class="nav"><button type="button" class="btn ghost" data-act="ubahback">Batal</button><button type="button" class="btn" data-act="ubahsave"'+(rs.date&&rs.time?'':' disabled')+'>Simpan jadwal baru</button></div></div></div></section>'
}
function ubahDone(){
  var r=K.moveBooking(rs.id,rs.date,rs.time);
  if(r.err){rs.msg=r.err;if(r.sched)rs.time=null;main.innerHTML=vUbah();toast(r.err,true);return}
  var staff=rs.staff;chk=staff?chk:r.b.id;rs=null;toast("Jadwal diubah ke "+K.sdate(r.b.date)+", "+r.b.time+".");
  if(staff){sh={t:"b",id:r.b.id};go("#/staf/booking");setTimeout(function(){sheetRefresh()},0)}else go("#/cek")
}

/* ---------- cetak ---------- */
function printDoc(kind,id){
  var b=K.bookingOf(id);if(!b)return;var sv=K.svcOf(b.svc),dc=K.docOf(b.doc),h;
  if(kind==="card")h='<div class="tk"><h4>Klinik Sehat Prima</h4><p style="font-size:.75rem">Kartu antrian (contoh)</p><div class="n">'+esc(b.qn)+'</div><p><b>'+esc(b.name)+'</b></p><p>'+esc(sv.n)+' &middot; '+esc(dc.n)+'</p><p>'+esc(K.fdate(b.date))+', '+b.time+' WIB</p><p>Kode: '+esc(b.code)+'</p><p class="s">Urutan panggil mengikuti jam janji. Mohon menunggu di ruang tunggu.</p></div>';
  else h='<div class="tk"><h4>Klinik Sehat Prima</h4><p style="font-size:.75rem">Bukti booking (contoh)</p><div class="n" style="font-size:1.8rem">'+esc(b.code)+'</div><p><b>'+esc(b.name)+'</b></p><p>'+esc(sv.n)+'</p><p>'+esc(dc.n)+'</p><p>'+esc(K.fdate(b.date))+', '+b.time+' WIB</p><p>Pembayaran: '+esc(b.pay)+'</p><p class="s">Datang 15 menit lebih awal. Bawa kode ini. Ubah atau batalkan lewat halaman Cek booking sampai 3 jam sebelum jadwal.</p></div>';
  $("#print").innerHTML=h;setTimeout(function(){window.print()},60)
}

/* ---------- staf ---------- */
function vLogin(){
  return'<div class="login"><div class="panel"><h1 style="margin:0 0 4px;font-size:1.5rem;color:var(--ink)">Masuk staf</h1><p class="sub">PIN demo: <b>'+K.PIN+'</b></p><form class="f" id="loginform" novalidate><label>PIN<input name="pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label>'+(hErr?'<span class="err" role="alert">'+esc(hErr)+'</span>':'')+'<button class="btn" type="submit">Masuk</button></form></div></div>'
}
function staffView(t){
  var h;
  if(t==="antrian")h=vQueue();else if(t==="booking")h=vBookings();else if(t==="jadwal")h=vSched();else if(t==="pasien")h=vPatients();else h=vSummary();
  return'<div class="stpage">'+h+'</div>'
}
function vSummary(){
  var td=K.today(),db=K.db,tb=db.bookings.filter(function(b){return b.date===td}),act=tb.filter(function(b){return b.st!=="batal"}),c=function(s){return tb.filter(function(b){return b.st===s}).length};
  var tm=K.ymd(K.addDays(new Date(),1)),conf=db.bookings.filter(K.conflict).length,fresh=db.bookings.filter(function(b){return Date.now()-new Date(b.created).getTime()<86400000}).length;
  var h='<h1>Ringkasan hari ini</h1><p class="lead">'+esc(K.fdate(td))+'</p><div class="kpi"><div><b>'+act.length+'</b><span>Booking aktif hari ini</span></div><div><b>'+c("menunggu")+'</b><span>Menunggu</span></div><div><b>'+c("dipanggil")+'</b><span>Sedang dipanggil</span></div><div><b>'+c("selesai")+'</b><span>Selesai</span></div><div><b>'+c("tidak")+'</b><span>Tidak hadir</span></div><div><b>'+c("batal")+'</b><span>Dibatalkan</span></div></div>';
  h+='<div class="kpi"><div><b>'+db.bookings.filter(function(b){return b.date===tm&&b.st!=="batal"}).length+'</b><span>Booking besok</span></div><div><b>'+fresh+'</b><span>Booking baru 24 jam terakhir</span></div><div><b>'+db.patients.length+'</b><span>Total pasien</span></div><div><b>'+act.filter(function(b){return b.pay==="Asuransi"}).length+'</b><span>Pasien asuransi hari ini</span></div><div><b>'+conf+'</b><span>Perlu jadwal ulang</span></div></div>';
  if(conf)h+='<div class="notice warn">'+conf+' booking jatuh di hari libur atau jadwal yang sudah tidak ada. <a href="#/staf/booking" data-act="filterconf">Lihat daftar</a></div>';
  h+='<div class="cols"><div class="box"><h4>Beban dokter hari ini</h4>'+db.docs.map(function(d){var i=K.slotInfo(d.id,td),q=0,u=0;i.ses.forEach(function(o){q+=o.quota;u+=o.used});if(!i.ses.length)return'<p style="margin:8px 0"><b>'+esc(d.n)+'</b><br><small>'+esc(i.off||"Tidak praktik")+'</small></p>';return'<p style="margin:8px 0 0"><b>'+esc(d.n)+'</b> <small>'+u+' dari '+q+' kuota</small></p><div class="meter"><i style="width:'+Math.min(100,Math.round(u/q*100))+'%"></i></div>'}).join("")+'</div>';
  var nx=db.bookings.filter(function(b){return b.date===td&&b.st==="menunggu"}).sort(function(a,b){return a.time<b.time?-1:1}).slice(0,4);
  h+='<div class="box"><h4>Berikutnya dalam antrian</h4>'+(nx.length?nx.map(function(b){return'<p style="margin:6px 0"><b>'+esc(b.qn)+'</b> '+esc(b.time)+' '+esc(b.name)+'<br><small>'+esc(K.docOf(b.doc).n)+'</small></p>'}).join(""):'<p>Tidak ada pasien menunggu.</p>')+'<a class="btn sm" href="#/staf/antrian">Buka antrian</a></div></div>';
  var rec=db.bookings.slice().sort(function(a,b){return a.created<b.created?1:-1}).slice(0,5);
  h+='<h3 style="color:var(--ink);margin:22px 0 10px">Booking terbaru</h3><div class="q">'+rec.map(function(b){return bkRow(b)}).join("")+'</div>';
  return h
}
function bkRow(b){
  var sv=K.svcOf(b.svc),dc=K.docOf(b.doc);
  return'<button class="row" data-act="bk" data-id="'+b.id+'"><span class="qn" aria-hidden="true">'+esc(b.qn)+'</span><span class="m"><b>'+esc(b.name)+'</b><small>'+esc(b.code)+' &middot; '+esc(sv.n)+' &middot; '+esc(dc.n)+'<br>'+esc(K.sdate(b.date))+', '+b.time+'</small></span>'+(K.conflict(b)?'<span class="chip warn">Perlu jadwal ulang</span>':'')+chip(b)+'</button>'
}
function vQueue(){
  var td=K.today();if(!qd)qd=td;var isT=qd===td,db=K.db;
  var all=db.bookings.filter(function(b){return b.date===qd&&b.st!=="batal"&&(qdoc==="all"||b.doc===qdoc)}).sort(function(a,b){return a.time<b.time?-1:a.time>b.time?1:(a.qn<b.qn?-1:1)});
  var h='<h1>Antrian</h1><p class="lead">Urutan panggil mengikuti jam janji. Nomor antrian dibuat saat booking.</p><div class="bar"><label class="fld">Tanggal<input class="inp" type="date" id="qd" data-q="d" value="'+qd+'"></label><label class="fld">Dokter<select class="inp" id="qdoc" data-q="doc"><option value="all">Semua dokter</option>'+db.docs.map(function(d){return'<option value="'+d.id+'"'+(qdoc===d.id?' selected':'')+'>'+esc(d.n)+'</option>'}).join("")+'</select></label>'+(isT?'<button class="btn" data-act="callnext" data-doc="all" style="flex:0 0 auto">Panggil berikutnya</button>':'<button class="btn ghost" data-act="qtoday" style="flex:0 0 auto">Kembali ke hari ini</button>')+'</div>';
  if(!isT)h+='<div class="notice">Tombol panggil hanya aktif untuk hari ini.</div>';
  var ds=db.docs.filter(function(d){return(qdoc==="all"||d.id===qdoc)&&all.some(function(b){return b.doc===d.id})});
  if(ds.length)h+='<div class="calls">'+ds.map(function(d){
    var cur=all.filter(function(b){return b.doc===d.id&&b.st==="dipanggil"})[0],w=all.filter(function(b){return b.doc===d.id&&b.st==="menunggu"}).length;
    return'<div class="call'+(cur?' live':'')+'"><b style="color:var(--ink)">'+esc(d.n)+'</b>'+(cur?'<span class="big">'+esc(cur.qn)+'</span><span>'+esc(cur.name)+'</span>':'<span class="big" style="color:#7b939a">-</span><span>Belum ada yang dipanggil</span>')+'<small>'+w+' menunggu</small>'+(isT?'<button class="btn sm" data-act="callnext" data-doc="'+d.id+'"'+(w?'':' disabled')+'>Panggil berikutnya</button>':'')+'</div>'}).join("")+'</div>';
  h+='<div class="q">'+(all.length?all.map(function(b){
    var sv=K.svcOf(b.svc),a="";
    if(isT){
      if(b.st==="menunggu")a='<button class="btn sm" data-act="stat" data-s="dipanggil" data-id="'+b.id+'">Panggil</button><button class="btn ghost sm" data-act="stat" data-s="tidak" data-id="'+b.id+'">Tidak hadir</button>';
      else if(b.st==="dipanggil")a='<button class="btn sm" data-act="stat" data-s="selesai" data-id="'+b.id+'">Selesai</button><button class="btn ghost sm" data-act="stat" data-s="tidak" data-id="'+b.id+'">Tidak hadir</button><button class="btn ghost sm" data-act="stat" data-s="menunggu" data-id="'+b.id+'">Kembali menunggu</button>';
      else a='<button class="btn ghost sm" data-act="stat" data-s="menunggu" data-id="'+b.id+'">Kembali menunggu</button>';
      a+='<button class="btn ghost sm" data-act="printcard" data-id="'+b.id+'">Cetak kartu</button>'
    }
    return'<div class="row"><span class="qn">'+esc(b.qn)+'</span><span class="m"><b>'+esc(b.time)+' '+esc(b.name)+'</b><small>'+esc(sv.n)+' &middot; '+esc(K.docOf(b.doc).n)+'</small></span>'+chip(b)+'<span class="act">'+a+'<button class="btn ghost sm" data-act="bk" data-id="'+b.id+'">Detail</button></span></div>'}).join(""):'<div class="empty">Tidak ada antrian pada '+esc(K.fdate(qd))+'.</div>')+'</div>';
  return h
}
function filtered(){
  var td=K.today(),tm=K.ymd(K.addDays(new Date(),1)),wk=K.ymd(K.addDays(new Date(),7)),q=sf.q.trim().toLowerCase(),qp=K.normPhone(sf.q);
  var l=K.db.bookings.filter(function(b){
    if(sf.st==="conf"){if(!K.conflict(b))return false}else if(sf.st&&b.st!==sf.st)return false;
    if(sf.doc&&b.doc!==sf.doc)return false;if(sf.svc&&b.svc!==sf.svc)return false;
    if(sf.rng==="today"&&b.date!==td)return false;if(sf.rng==="tomorrow"&&b.date!==tm)return false;if(sf.rng==="week"&&(b.date<td||b.date>wk))return false;
    if(sf.rng==="upcoming"&&b.date<td)return false;if(sf.rng==="past"&&b.date>=td)return false;if(sf.rng==="date"&&sf.date&&b.date!==sf.date)return false;
    if(q&&b.name.toLowerCase().indexOf(q)<0&&b.code.toLowerCase().indexOf(q)<0&&!(qp.length>=3&&K.normPhone(b.phone).indexOf(qp)>=0)&&b.qn.toLowerCase()!==q)return false;
    return true});
  l.sort(function(a,b){var x=a.date+a.time,y=b.date+b.time;if(sf.sort==="new")return a.created<b.created?1:-1;return sf.sort==="desc"?(x<y?1:-1):(x<y?-1:1)});
  return l
}
function listHtml(){
  var l=filtered(),n=l.length,pages=Math.max(1,Math.ceil(n/PER));if(sf.page>pages)sf.page=pages;
  var s=(sf.page-1)*PER,pg=l.slice(s,s+PER);
  return n?'<div class="q">'+pg.map(bkRow).join("")+'</div><div class="pg"><span>Menampilkan '+(s+1)+' sampai '+(s+pg.length)+' dari '+n+'</span><span><button class="btn ghost sm" data-act="pg" data-n="-1"'+(sf.page<=1?' disabled':'')+'>Sebelumnya</button> <button class="btn ghost sm" data-act="pg" data-n="1"'+(sf.page>=pages?' disabled':'')+'>Berikutnya</button></span></div>':'<div class="empty">Tidak ada booking yang cocok dengan filter.</div>'
}
function opt(v,l,cur){return'<option value="'+v+'"'+(cur===v?' selected':'')+'>'+esc(l)+'</option>'}
function vBookings(){
  var db=K.db;
  return'<h1>Daftar booking</h1><p class="lead">Cari berdasarkan nama, kode, atau nomor telepon.</p><div class="bar"><label class="fld grow">Cari<input class="inp" id="fq" data-f="q" value="'+esc(sf.q)+'" placeholder="Nama, kode, telepon"></label><label class="fld">Status<select class="inp" data-f="st">'+opt("","Semua status",sf.st)+Object.keys(K.ST).map(function(k){return opt(k,K.ST[k],sf.st)}).join("")+opt("conf","Perlu jadwal ulang",sf.st)+'</select></label><label class="fld">Dokter<select class="inp" data-f="doc">'+opt("","Semua dokter",sf.doc)+db.docs.map(function(d){return opt(d.id,d.n,sf.doc)}).join("")+'</select></label><label class="fld">Layanan<select class="inp" data-f="svc">'+opt("","Semua layanan",sf.svc)+db.svcs.map(function(d){return opt(d.id,d.n,sf.svc)}).join("")+'</select></label><label class="fld">Tanggal<select class="inp" data-f="rng">'+opt("all","Semua tanggal",sf.rng)+opt("upcoming","Mulai hari ini",sf.rng)+opt("today","Hari ini",sf.rng)+opt("tomorrow","Besok",sf.rng)+opt("week","7 hari ke depan",sf.rng)+opt("past","Sudah lewat",sf.rng)+opt("date","Pilih tanggal",sf.rng)+'</select></label><label class="fld" id="bdate"'+(sf.rng==="date"?'':' hidden')+'>Tanggal tertentu<input class="inp" type="date" data-f="date" value="'+esc(sf.date)+'"></label><label class="fld">Urutan<select class="inp" data-f="sort">'+opt("asc","Jadwal terdekat",sf.sort)+opt("desc","Jadwal terjauh",sf.sort)+opt("new","Dibuat terbaru",sf.sort)+'</select></label><button class="btn ghost" data-act="csvb" style="flex:0 0 auto">Ekspor CSV</button></div><div id="blist">'+listHtml()+'</div>'
}
function vPatients(){
  var q=pq.trim().toLowerCase(),qp=K.normPhone(pq),l=K.db.patients.filter(function(p){return!q||p.name.toLowerCase().indexOf(q)>=0||p.id.toLowerCase()===q||(qp.length>=3&&K.normPhone(p.phone).indexOf(qp)>=0)});
  l.sort(function(a,b){return a.name<b.name?-1:1});
  var pages=Math.max(1,Math.ceil(l.length/PER));if(pPage>pages)pPage=pages;var s=(pPage-1)*PER,pg=l.slice(s,s+PER);
  return'<h1>Data pasien</h1><p class="lead">Pasien baru dibuat otomatis dari booking (nama dan telepon yang sama dianggap satu pasien).</p><div class="bar"><label class="fld grow">Cari<input class="inp" id="pq" data-p="q" value="'+esc(pq)+'" placeholder="Nama, telepon, nomor RM"></label><button class="btn ghost" data-act="csvp" style="flex:0 0 auto">Ekspor CSV</button></div><div id="plist">'+plistHtml(l,pg,s,pages)+'</div>'
}
function plistHtml(l,pg,s,pages){
  if(!l.length)return'<div class="empty">Tidak ada pasien yang cocok.</div>';
  return'<div class="q">'+pg.map(function(p){var v=K.db.bookings.filter(function(b){return b.pid===p.id&&b.st==="selesai"}).length;return'<button class="row" data-act="pat" data-id="'+p.id+'"><span class="qn" aria-hidden="true" style="font-size:.78rem">'+esc(p.id)+'</span><span class="m"><b>'+esc(p.name)+'</b><small>'+esc(K.fmtPhone(p.phone))+' &middot; '+K.ageOf(p.dob)+' tahun &middot; '+esc(p.pay)+'</small></span><span class="chip">'+v+' kunjungan</span></button>'}).join("")+'</div><div class="pg"><span>Menampilkan '+(s+1)+' sampai '+(s+pg.length)+' dari '+l.length+'</span><span><button class="btn ghost sm" data-act="ppg" data-n="-1"'+(pPage<=1?' disabled':'')+'>Sebelumnya</button> <button class="btn ghost sm" data-act="ppg" data-n="1"'+(pPage>=pages?' disabled':'')+'>Berikutnya</button></span></div>'
}
function vSched(){
  var db=K.db,td=K.today(),hol=db.holidays.filter(function(h){return h.date>=td}).sort(function(a,b){return a.date<b.date?-1:1});
  var h='<h1>Jadwal dokter dan hari libur</h1><p class="lead">Perubahan langsung dipakai kalender pasien.</p><div class="grid-s">'+db.docs.map(function(d){
    return'<form class="box f" data-doc="'+d.id+'" novalidate><h4>'+esc(d.n)+'</h4><table class="stbl"><tr><th>Hari</th><th class="c">Pagi</th><th class="c">Siang</th></tr>'+[1,2,3,4,5,6,0].map(function(w){var ks=d.sched[w]||[];return'<tr><td>'+K.DN[w]+'</td>'+["pagi","siang"].map(function(k){return'<td class="c"><label class="chk"><input type="checkbox" name="s-'+w+'-'+k+'"'+(ks.indexOf(k)>=0?' checked':'')+' aria-label="'+esc(d.n+", "+K.DN[w]+", sesi "+k)+'"></label></td>'}).join("")+'</tr>'}).join("")+'</table><div class="two"><label>Kuota pagi (1-'+S.pagi.slots.length+')<input name="qpagi" type="number" min="1" max="'+S.pagi.slots.length+'" value="'+d.quota.pagi+'"></label><label>Kuota siang (1-'+S.siang.slots.length+')<input name="qsiang" type="number" min="1" max="'+S.siang.slots.length+'" value="'+d.quota.siang+'"></label></div><button type="submit" class="btn sm">Simpan jadwal</button></form>'}).join("")+'</div>';
  h+='<h3 style="color:var(--ink);margin:26px 0 10px">Hari libur dan cuti</h3><form class="box f" id="holform" novalidate><div class="two"><label>Tanggal<input type="date" name="d" min="'+td+'"></label><label>Berlaku untuk<select name="s"><option value="all">Semua dokter (klinik tutup)</option>'+db.docs.map(function(d){return'<option value="'+d.id+'">'+esc(d.n)+'</option>'}).join("")+'</select></label></div><label>Keterangan<input name="n" maxlength="40" placeholder="Contoh: Cuti dokter"></label>'+(hErr?'<span class="err" role="alert">'+esc(hErr)+'</span>':'')+'<button class="btn sm" type="submit" style="justify-self:start">Tambah libur</button></form><div class="q" style="margin-top:12px">'+(hol.length?hol.map(function(x){var n=db.bookings.filter(function(b){return b.date===x.date&&b.st!=="batal"&&(x.doc==="all"||b.doc===x.doc)}).length;return'<div class="row"><span class="m"><b>'+esc(K.fdate(x.date))+'</b><small>'+esc(x.note)+' &middot; '+(x.doc==="all"?"Semua dokter":esc(K.docOf(x.doc).n))+(n?' &middot; '+n+' booking terdampak':'')+'</small></span><button class="btn danger sm" data-act="delhol" data-id="'+x.id+'" data-arm>Hapus</button></div>'}).join(""):'<div class="empty">Belum ada hari libur.</div>')+'</div>';
  hErr="";return h
}
function saveSched(form){
  var d=K.docOf(form.dataset.doc),ns={},f=form.elements,qp=+f.qpagi.value,qs=+f.qsiang.value;
  if(!(Number.isInteger(qp)&&qp>=1&&qp<=S.pagi.slots.length)||!(Number.isInteger(qs)&&qs>=1&&qs<=S.siang.slots.length)){toast("Kuota harus angka bulat: pagi 1 sampai "+S.pagi.slots.length+", siang 1 sampai "+S.siang.slots.length+".",true);return}
  [0,1,2,3,4,5,6].forEach(function(w){var a=[];["pagi","siang"].forEach(function(k){if(f["s-"+w+"-"+k].checked)a.push(k)});if(a.length)ns[w]=a});
  d.sched=ns;d.quota={pagi:qp,siang:qs};K.save();
  var n=K.db.bookings.filter(function(b){return b.doc===d.id&&K.conflict(b)}).length;
  toast("Jadwal "+d.n+" disimpan."+(n?" "+n+" booking perlu dijadwal ulang.":""));refresh()
}
function addHol(form){
  var f=form.elements,d=f.d.value,s=f.s.value,n=f.n.value.trim()||"Libur";hErr="";
  if(!d||ymd2(d)!==d)hErr="Pilih tanggal libur.";else if(d<K.today())hErr="Tanggal tidak boleh sudah lewat.";
  else if(K.db.holidays.some(function(x){return x.date===d&&x.doc===s}))hErr="Libur ini sudah ada.";
  if(hErr){refresh();return}
  K.db.holidays.push({id:"h"+K.nextId("h"),date:d,doc:s,note:n});K.save();
  var c=K.db.bookings.filter(function(b){return b.date===d&&b.st!=="batal"&&(s==="all"||b.doc===s)}).length;
  toast("Libur ditambahkan."+(c?" "+c+" booking terdampak, jadwalkan ulang.":""));refresh()
}
function ymd2(s){return/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(K.pd(s).getTime())?K.ymd(K.pd(s)):""}

/* ---------- sheet detail ---------- */
function openSheet(){var s=$("#sheet");lastFocus=document.activeElement;s.hidden=false;document.body.classList.add("lock");sheetRefresh();var c=$("#sheet [data-act=closesheet]");if(c)c.focus()}
function closeSheet(){sh=null;$("#sheet").hidden=true;document.body.classList.remove("lock");if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus()}
function sheetRefresh(){
  var s=$("#sheet");if(!sh||(sh.t==="b"&&!K.bookingOf(sh.id))||(sh.t==="p"&&!K.patientOf(sh.id))){closeSheet();return}
  s.hidden=false;document.body.classList.add("lock");
  var body=sh.t==="b"?bSheet(K.bookingOf(sh.id)):pSheet(K.patientOf(sh.id)),keep=$("#note")&&document.activeElement===$("#note"),v=keep?$("#note").value:null;
  s.innerHTML='<div class="sp" role="dialog" aria-modal="true" aria-label="Detail">'+body+'</div>';
  if(keep){$("#note").value=v;$("#note").focus()}
}
function bSheet(b){
  var sv=K.svcOf(b.svc),td=K.today(),sts=b.date>td?["menunggu"]:["menunggu","dipanggil","selesai","tidak"],open=b.st!=="batal"&&b.st!=="selesai";
  return'<div class="sph"><h3>'+esc(b.name)+'</h3><button class="btn ghost sm" data-act="closesheet">Tutup</button></div><div><span class="code" style="font-size:1rem">'+esc(b.code)+'</span> '+chip(b)+'</div>'+(K.conflict(b)?'<div class="notice warn">Jadwal bentrok dengan libur atau jadwal dokter. Pilih jadwal baru.</div>':'')+
  summ([["No. RM",'<a href="#" data-act="pat" data-id="'+esc(b.pid)+'">'+esc(b.pid)+'</a>'],["Umur",K.ageOf(b.dob)+" tahun"],["Telepon",esc(K.fmtPhone(b.phone))],["Layanan",esc(sv.n)],["Dokter",esc(K.docOf(b.doc).n)],["Tanggal",esc(K.fdate(b.date))],["Jam",esc(b.time)],["No. antrian",esc(b.qn)],["Pembayaran",esc(b.pay)+(b.pay==="Asuransi"?" ("+esc(b.ins)+", "+esc(b.pol)+")":"")],["Keluhan",esc(b.complaint)]])+
  '<h4 style="margin:6px 0 0;color:var(--ink)">Ubah status</h4><div class="act" style="display:flex;flex-wrap:wrap;gap:6px">'+(b.st==="batal"?'<span class="hint">Booking dibatalkan.</span>':sts.map(function(s){return'<button class="btn '+(b.st===s?'':'ghost')+' sm" data-act="stat" data-s="'+s+'" data-id="'+b.id+'"'+(b.st===s?' disabled':'')+'>'+K.ST[s]+'</button>'}).join(""))+'</div>'+
  '<label class="fld">Catatan kunjungan<textarea class="inp" id="note" rows="4" maxlength="600" placeholder="Pemeriksaan, diagnosis, resep, saran">'+esc(b.note)+'</textarea></label><button class="btn sm" data-act="savenote" data-id="'+b.id+'" style="justify-self:start">Simpan catatan</button>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">'+(open?'<button class="btn ghost sm" data-act="staffubah" data-id="'+b.id+'">Ubah jadwal</button>':'')+'<button class="btn ghost sm" data-act="printproof" data-id="'+b.id+'">Cetak bukti</button><button class="btn ghost sm" data-act="printcard" data-id="'+b.id+'">Cetak kartu antrian</button>'+(open?'<button class="btn danger sm" data-act="cancelstaff" data-id="'+b.id+'" data-arm>Batalkan booking</button>':'')+'</div>'
}
function pSheet(p){
  var vis=K.db.bookings.filter(function(b){return b.pid===p.id}).sort(function(a,b){return a.date+a.time<b.date+b.time?1:-1});
  return'<div class="sph"><h3>'+esc(p.name)+'</h3><button class="btn ghost sm" data-act="closesheet">Tutup</button></div><div><span class="code" style="font-size:1rem">'+esc(p.id)+'</span></div>'+summ([["Tanggal lahir",esc(K.sdate(p.dob))+" ("+K.ageOf(p.dob)+" tahun)"],["Telepon",esc(K.fmtPhone(p.phone))],["Pembayaran",esc(p.pay)+(p.pay==="Asuransi"?" ("+esc(p.ins)+", "+esc(p.pol)+")":"")]])+
  '<label class="fld">Catatan umum (alergi, penyakit bawaan)<textarea class="inp" id="allergy" rows="3" maxlength="300">'+esc(p.allergy)+'</textarea></label><button class="btn sm" data-act="saveallergy" data-id="'+p.id+'" style="justify-self:start">Simpan catatan</button>'+
  '<h4 style="margin:10px 0 0;color:var(--ink)">Riwayat kunjungan ('+vis.length+')</h4><div class="q">'+vis.map(function(b){return'<button class="row" data-act="bk" data-id="'+b.id+'"><span class="m"><b>'+esc(K.sdate(b.date))+', '+b.time+'</b><small>'+esc(K.svcOf(b.svc).n)+' &middot; '+esc(K.docOf(b.doc).n)+(b.note?'<br>'+esc(b.note.slice(0,90))+(b.note.length>90?"...":""):'')+'</small></span>'+chip(b)+'</button>'}).join("")+'</div>'
}

/* ---------- ekspor ---------- */
function exportB(){
  var rows=[["Kode","Tanggal","Jam","No antrian","Layanan","Dokter","Pasien","No RM","Telepon","Pembayaran","Status","Keluhan","Catatan kunjungan"]].concat(filtered().map(function(b){return[b.code,b.date,b.time,b.qn,K.svcOf(b.svc).n,K.docOf(b.doc).n,b.name,b.pid,K.fmtPhone(b.phone),b.pay,K.ST[b.st],b.complaint,b.note]}));
  K.download("booking-klinik-"+K.today()+".csv",K.csv(rows),"text/csv;charset=utf-8");toast(rows.length-1+" booking diekspor.")
}
function exportP(){
  var rows=[["No RM","Nama","Tanggal lahir","Umur","Telepon","Pembayaran","Asuransi","Kunjungan selesai","Catatan umum"]].concat(K.db.patients.map(function(p){return[p.id,p.name,p.dob,K.ageOf(p.dob),K.fmtPhone(p.phone),p.pay,p.ins,K.db.bookings.filter(function(b){return b.pid===p.id&&b.st==="selesai"}).length,p.allergy]}));
  K.download("pasien-klinik-"+K.today()+".csv",K.csv(rows),"text/csv;charset=utf-8");toast(rows.length-1+" pasien diekspor.")
}

/* ---------- aksi ---------- */
function cur(){return parse().p[0]==="ubah"?rs:bk}
function redraw(){if(parse().p[0]==="ubah")main.innerHTML=vUbah();else wiz()}
function disarm(){if(armed){var a=armed;armed=null;clearTimeout(armT);if(document.contains(a)){a.textContent=a.dataset.orig;a.classList.remove("armed")}}}
document.addEventListener("click",function(e){
  var el=e.target.closest("[data-act]");if(!el)return;var a=el.dataset.act,d=el.dataset;
  if(el.hasAttribute("data-arm")){
    if(armed!==el){disarm();armed=el;d.orig=el.textContent;el.textContent="Klik lagi untuk konfirmasi";el.classList.add("armed");armT=setTimeout(disarm,4000);e.preventDefault();return}
    disarm()
  }
  if(el.tagName==="A"&&a!=="tocek")e.preventDefault();
  var c;
  switch(a){
  case"scr":var sc=$("#dscr");if(sc)sc.scrollBy({left:(+d.dir)*Math.max(240,sc.clientWidth*.8),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});break;
  case"psvc":bk.svc=d.id;bk.doc=null;bk.date=null;bk.time=null;bk.step=1;wiz();break;
  case"pdoc":bk.doc=d.id;bk.date=null;bk.time=null;bk.step=2;bk.msg="";wiz();break;
  case"pickdate":c=cur();c.date=d.d;c.time=null;c.cm=d.d.slice(0,7);c.msg="";redraw();break;
  case"picktime":c=cur();c.time=d.t;redraw();break;
  case"calprev":case"calnext":c=cur();var y=+c.cm.slice(0,4),m=+c.cm.slice(5,7)-1+(a==="calnext"?1:-1);c.cm=new Date(y,m,1).getFullYear()+"-"+K.p2(new Date(y,m,1).getMonth()+1);redraw();break;
  case"back":if(bk.step>0){readForm();bk.step--;bk.msg="";wiz()}break;
  case"next":if(bk.step===3){submitForm();break}if(bk.step<3){bk.step++;bk.msg="";wiz();var w=$("#wiz");if(w)w.scrollIntoView({block:"start"})}break;
  case"again":bk=null;go("#/janji?new="+Date.now());break;
  case"tocek":chkF.code=d.code;chkF.phone=bk&&bk.f?bk.f.phone:"";chkF.err="";chk=null;break;
  case"ics":var b=K.bookingOf(d.id);K.download("janji-temu-"+b.code+".ics",K.icsOf(b),"text/calendar;charset=utf-8");toast("File kalender diunduh.");break;
  case"printproof":printDoc("proof",d.id);break;
  case"printcard":printDoc("card",d.id);break;
  case"ubah":rs={id:d.id,staff:false,date:null,time:null,cm:null,msg:""};go("#/ubah");break;
  case"staffubah":rs={id:d.id,staff:true,date:null,time:null,cm:null,msg:""};closeSheet();go("#/ubah");break;
  case"ubahback":var st=rs.staff;rs=null;if(st)go("#/staf/booking");else go("#/cek");break;
  case"ubahsave":ubahDone();break;
  case"cancelself":var bb=K.bookingOf(d.id);if(!K.canSelf(bb)){toast("Pembatalan hanya sampai 3 jam sebelum jadwal.",true);render();break}K.setStatus(d.id,"batal");toast("Booking dibatalkan.");render();break;
  case"cancelstaff":K.setStatus(d.id,"batal");toast("Booking dibatalkan.");refresh();break;
  case"logout":stafSet(false);closeSheet();go("#/staf");break;
  case"reset":K.resetAll();bk=null;rs=null;chk=null;sh=null;qd=null;closeSheet();toast("Data demo direset.");go("#/");break;
  case"callnext":var r=K.callNext(d.doc);if(r.err)toast(r.err,true);else toast("Memanggil "+r.b.qn+" "+r.b.name+" ke "+K.docOf(r.b.doc).n+".");refresh();break;
  case"qtoday":qd=K.today();refresh();break;
  case"stat":
    var bs=K.bookingOf(d.id);
    if(d.s==="dipanggil"){var busy=K.db.bookings.filter(function(x){return x.date===bs.date&&x.doc===bs.doc&&x.st==="dipanggil"&&x.id!==bs.id})[0];if(busy){toast("Selesaikan dulu pasien "+busy.qn+" yang sedang dipanggil.",true);break}}
    K.setStatus(d.id,d.s);toast(bs.qn+": "+K.ST[d.s]+".");refresh();break;
  case"bk":sh={t:"b",id:d.id};openSheet();break;
  case"pat":if(d.id){sh={t:"p",id:d.id};openSheet()}break;
  case"closesheet":closeSheet();break;
  case"savenote":K.bookingOf(d.id).note=$("#note").value.trim();K.save();toast("Catatan kunjungan disimpan.");if(parse().p[1]==="booking"||parse().p[1]==="pasien")sheetRefresh();break;
  case"saveallergy":K.patientOf(d.id).allergy=$("#allergy").value.trim();K.save();toast("Catatan pasien disimpan.");break;
  case"delhol":K.db.holidays=K.db.holidays.filter(function(x){return x.id!==d.id});K.save();toast("Libur dihapus.");refresh();break;
  case"csvb":exportB();break;
  case"csvp":exportP();break;
  case"pg":sf.page+=+d.n;$("#blist").innerHTML=listHtml();break;
  case"ppg":pPage+=+d.n;render();break;
  case"filterconf":sf.st="conf";sf.rng="all";sf.page=1;go("#/staf/booking");break;
  }
});
document.addEventListener("submit",function(e){
  var f=e.target;e.preventDefault();
  if(f.id==="qs")quickGo(f);
  else if(f.id==="cekform")doCek();
  else if(f.id==="loginform"){if(f.pin.value===K.PIN){hErr="";stafSet(true);render()}else{hErr="PIN salah. Gunakan PIN demo di atas.";render();var i=$("#loginform input");if(i)i.focus()}}
  else if(f.id==="holform")addHol(f);
  else if(f.dataset.doc)saveSched(f);
  else if(f.id==="pform")submitForm()
});
function onField(e){
  var t=e.target;
  if(t.id==="qs-svc"){var dd=$("#qs-doc"),sd=$("#qs-date");dd.innerHTML=qsDocs(t.value);sd.value=qsDate(dd.value);return}
  if(t.id==="qs-doc"){if(e.type==="change")$("#qs-date").value=qsDate(t.value);return}
  if(t.id==="qs-date"){var er=$("#qs-err");if(er)er.hidden=true;return}
  if(t.closest&&t.closest("#pform")&&bk){bk.f[t.name]=t.value;if(t.name==="pay"){$("#insbox").hidden=t.value!=="Asuransi"}return}
  if(t.dataset.f){sf[t.dataset.f]=t.value;sf.page=1;if(t.dataset.f==="rng")$("#bdate").hidden=t.value!=="date";$("#blist").innerHTML=listHtml();return}
  if(t.dataset.p){pq=t.value;pPage=1;var l=K.db.patients.filter(function(p){var q=pq.trim().toLowerCase(),qp=K.normPhone(pq);return!q||p.name.toLowerCase().indexOf(q)>=0||p.id.toLowerCase()===q||(qp.length>=3&&K.normPhone(p.phone).indexOf(qp)>=0)}).sort(function(a,b){return a.name<b.name?-1:1});$("#plist").innerHTML=plistHtml(l,l.slice(0,PER),0,Math.max(1,Math.ceil(l.length/PER)));return}
  if(t.dataset.q&&e.type==="change"){if(t.dataset.q==="d")qd=t.value||K.today();else qdoc=t.value;refresh()}
}
document.addEventListener("input",onField);document.addEventListener("change",onField);
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&sh){closeSheet();return}
  if(e.key==="Tab"&&sh){var f=$$("#sheet button:not(:disabled),#sheet textarea,#sheet a[href]");if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
$("#sheet").addEventListener("click",function(e){if(e.target.id==="sheet")closeSheet()});
window.addEventListener("storage",function(e){if(e.key!=="klinik-sehat.v1")return;K.reload();if(!bk||parse().p[0]!=="janji")refresh()});
window.addEventListener("hashchange",route);
fetch("credits.json").then(function(r){return r.json()}).then(function(c){window.__credit="Foto dari Wikimedia Commons: "+c.map(function(x){return esc(x.author.split("\n")[0])+" ("+esc(x.license)+")"}).filter(function(v,i,a){return a.indexOf(v)===i}).join("; ")+". <a href=\"credits.json\">Lihat kredit</a>";var e=$("#credit");if(e)e.innerHTML=window.__credit}).catch(function(){});
window.KSUI={render:render,get bk(){return bk},get rs(){return rs}};
render();
})();
