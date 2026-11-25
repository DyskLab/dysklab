/* Klinik Sehat Prima: data dan logika (localStorage, kunci klinik-sehat.v1). Semua data fiktif. */
window.__errs=[];window.addEventListener("error",function(e){window.__errs.push(e.message)});
var KS=(function(){
"use strict";
var KEY="klinik-sehat.v1",PIN="1234";
var DN=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],DS=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
var MN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var SES={pagi:{n:"Pagi",r:"08:00 - 12:00",slots:["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"]},siang:{n:"Siang",r:"13:00 - 16:00",slots:["13:00","13:30","14:00","14:30","15:00","15:30"]}};
var HORIZON=60,LEAD_MIN=180;
var ST={menunggu:"Menunggu",dipanggil:"Dipanggil",selesai:"Selesai",tidak:"Tidak hadir",batal:"Batal"};

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function p2(n){return(n<10?"0":"")+n}
function ymd(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function pd(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function today(){return ymd(new Date())}
function tmin(t){var a=t.split(":");return+a[0]*60+ +a[1]}
function nowMin(){var d=new Date();return d.getHours()*60+d.getMinutes()}
function fdate(s){var d=pd(s);return DN[d.getDay()]+", "+d.getDate()+" "+MN[d.getMonth()]+" "+d.getFullYear()}
function sdate(s){var d=pd(s);return DS[d.getDay()]+", "+d.getDate()+" "+MN[d.getMonth()].slice(0,3)+" "+d.getFullYear()}
function rp(n){return"Rp"+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function sesOf(t){return tmin(t)<720?"pagi":"siang"}
function normPhone(p){var d=String(p||"").replace(/\D/g,"");if(d.indexOf("62")===0)d="0"+d.slice(2);return d}
function fmtPhone(p){var d=normPhone(p);return d.length>8?d.slice(0,4)+"-"+d.slice(4,8)+"-"+d.slice(8):d}
function ageOf(dob){var b=pd(dob),n=new Date(),a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;return a}
function apptDate(b){var d=pd(b.date),a=b.time.split(":");d.setHours(+a[0],+a[1],0,0);return d}

var SV=[
{id:"umum",n:"Konsultasi umum",d:"Dokter umum, 20 menit",dur:20,price:150000,img:"dokter.jpg",docs:["ayu","bima"],about:"Pemeriksaan keluhan sehari-hari seperti demam, batuk, nyeri, atau kontrol rutin. Dokter menanyakan riwayat, memeriksa, lalu menjelaskan langkah berikutnya.",prep:"Bawa daftar obat yang sedang diminum dan hasil pemeriksaan sebelumnya bila ada."},
{id:"gigi",n:"Pemeriksaan gigi",d:"Dokter gigi, 30 menit",dur:30,price:200000,img:"gigi.jpg",docs:["citra"],about:"Pemeriksaan gigi dan mulut, termasuk konsultasi gigi berlubang, karang gigi, dan rencana perawatan.",prep:"Sikat gigi sebelum datang. Beri tahu dokter jika punya alergi obat bius."},
{id:"anak",n:"Kesehatan anak",d:"Dokter anak, 30 menit",dur:30,price:220000,img:"anak.jpg",docs:["dimas"],about:"Pemeriksaan keluhan anak, tumbuh kembang, dan konsultasi imunisasi. Untuk pasien sampai usia 17 tahun.",prep:"Bawa buku kesehatan anak atau catatan imunisasi."},
{id:"lab",n:"Cek laboratorium",d:"Darah dan urin, 15 menit",dur:15,price:120000,img:"lab.jpg",docs:["ayu","bima","dimas"],about:"Pengambilan sampel darah dan urin untuk pemeriksaan rutin. Hasilnya dijelaskan oleh dokter yang Anda pilih.",prep:"Beberapa pemeriksaan butuh puasa 8 jam. Air putih boleh diminum."}];
var DC=[
{id:"ayu",n:"dr. Ayu Lestari",spec:"Dokter umum",color:"#0e8f9a",letter:"A",bio:"Melayani pasien dewasa dan lansia untuk keluhan umum dan kontrol penyakit kronis.",sched:{1:["pagi","siang"],3:["pagi","siang"],5:["pagi","siang"]},quota:{pagi:6,siang:5}},
{id:"bima",n:"dr. Bima Prakoso",spec:"Dokter umum",color:"#2563eb",letter:"B",bio:"Melayani keluhan umum untuk semua usia, termasuk pemeriksaan kesehatan berkala.",sched:{2:["pagi","siang"],4:["pagi","siang"],6:["pagi"]},quota:{pagi:6,siang:5}},
{id:"citra",n:"drg. Citra Anindya",spec:"Dokter gigi",color:"#7c3aed",letter:"C",bio:"Perawatan gigi dan mulut untuk dewasa dan anak, dari pembersihan karang gigi sampai konsultasi tambal.",sched:{1:["pagi"],2:["pagi","siang"],3:["pagi"],4:["pagi","siang"],5:["pagi"],6:["pagi"]},quota:{pagi:6,siang:5}},
{id:"dimas",n:"dr. Dimas Wibowo, Sp.A",spec:"Dokter anak",color:"#db2777",letter:"D",bio:"Dokter spesialis anak yang menangani keluhan, tumbuh kembang, dan jadwal imunisasi.",sched:{1:["pagi","siang"],3:["pagi","siang"],6:["pagi"]},quota:{pagi:6,siang:5}}];

var NAMES=["Rina Marlina","Agus Setiawan","Sari Dewi","Budi Hartono","Lestari Putri","Hendra Gunawan","Maya Kusuma","Joko Santoso","Wulan Sari","Fajar Nugraha","Dewi Anggraini","Rizky Pratama","Nia Ramadhani","Tono Wijaya","Putri Amelia","Eko Prasetyo","Citra Maharani","Yusuf Hakim","Lina Oktavia","Andi Saputra"];
var KIDS=["Kayla Putri","Rafa Pratama","Naura Salsabila","Dika Maulana"];
var COMPL=["Demam dan batuk sejak 3 hari","Sakit kepala berulang","Kontrol rutin tekanan darah","Nyeri perut setelah makan","Cek gula darah dan kolesterol","Pegal dan lemas seminggu","Alergi kulit gatal","Pilek dan hidung tersumbat"];
var NOTES=["Pemeriksaan fisik normal. Diberi obat penurun demam. Kontrol bila belum membaik dalam 3 hari.","Tekanan darah 130/85. Disarankan kurangi garam, olahraga ringan, kontrol 2 minggu lagi.","Hasil lab dalam batas normal. Disarankan menjaga pola makan.","Diberi obat lambung dan saran makan teratur. Kontrol bila nyeri berulang.","Radang tenggorokan ringan. Banyak minum air hangat, istirahat cukup.","Pembersihan karang gigi selesai. Disarankan kontrol 6 bulan lagi."];

function mkRnd(s){return function(){s=(s*1103515245+12345)%2147483648;return s/2147483648}}

function seed(){
  var db={v:1,svcs:JSON.parse(JSON.stringify(SV)),docs:JSON.parse(JSON.stringify(DC)),holidays:[],bookings:[],patients:[],seq:{b:0,p:0,h:0}};
  var t0=new Date(),rnd=mkRnd(20260101);
  db.holidays.push({id:"h1",date:ymd(addDays(t0,9)),doc:"all",note:"Libur contoh (hari besar)"},{id:"h2",date:ymd(addDays(t0,4)),doc:"citra",note:"Cuti dokter"});
  db.seq.h=2;
  NAMES.forEach(function(n,i){mkPatient(db,n,ymd(new Date(1960+(i*7)%45,(i*5)%12,1+(i*3)%27)),"0812"+"0000"+String(100+i).padStart(4,"0"),i%5===0?"Asuransi":"Umum",i%5===0?"Asuransi Contoh":"",i%5===0?"POL-"+(10000+i*37):"")});
  KIDS.forEach(function(n,i){mkPatient(db,n,ymd(new Date(t0.getFullYear()-(3+i*2),(i*3+1)%12,5+i*4)),"0812"+"0000"+String(200+i).padStart(4,"0"),"Umum","","")});
  var adults=db.patients.slice(0,NAMES.length),kids=db.patients.slice(NAMES.length),ai=0,ki=0,fullDone=false;
  function pick(svc){return svc==="anak"?kids[(ki++)%kids.length]:adults[(ai++)%adults.length]}
  function addB(off,doc,time,svcId,st,withNote){
    var p=pick(svcId),date=ymd(addDays(t0,off)),b=blank(db,{svc:svcId,doc:doc.id,date:date,time:time,p:p,kl:COMPL[(ai+ki+off+8)%COMPL.length],rnd:rnd});
    b.st=st;b.created=new Date(t0.getTime()-(Math.abs(off)+2)*86400000).toISOString();
    if(withNote)b.note=NOTES[(db.bookings.length)%NOTES.length];
    db.bookings.push(b)
  }
  for(var off=-14;off<=8;off++){
    var dt=addDays(t0,off),dow=dt.getDay(),date=ymd(dt);
    if(db.holidays.some(function(h){return h.date===date&&h.doc==="all"}))continue;
    db.docs.forEach(function(d,di){
      var ses=d.sched[dow]||[];if(!ses.length)return;
      if(db.holidays.some(function(h){return h.date===date&&h.doc===d.id}))return;
      var list=db.svcs.filter(function(s){return s.docs.indexOf(d.id)>=0});
      ses.forEach(function(k,ki2){
        var sl=SES[k].slots,n;
        if(off<0)n=(off*-1+di+ki2)%3;else if(off===0)n=k==="pagi"?4:2;else n=(off*3+di*2+ki2)%4;
        if(off>0&&di===3&&!fullDone&&k==="pagi"){n=d.quota.pagi;fullDone=true}
        var step=sl.length===8?3:5,start=(Math.abs(off)+di)%sl.length;
        for(var j=0;j<n;j++){
          var time=sl[(start+j*step)%sl.length],svcId=list[(j+Math.abs(off))%list.length].id,st="menunggu",note=false;
          if(off<0){st=(j+di+off)%7===0?"tidak":((j+di+off)%9===0?"batal":"selesai");note=st==="selesai"}
          else if(off===0){st=j===0?"selesai":(j===1&&k==="pagi"?"dipanggil":(di===1&&j===2?"tidak":"menunggu"));note=st==="selesai"}
          else if(off===2&&di===0&&j===0)st="batal";
          addB(off,d,time,svcId,st,note)
        }
      })
    })
  }
  db.bookings.sort(function(a,b){return a.date+a.time<b.date+b.time?-1:1});
  db.bookings.forEach(function(b){assignQn(db,b)});
  return db
}
function mkPatient(db,name,dob,phone,pay,ins,pol){
  var p={id:"RM-"+String(++db.seq.p).padStart(4,"0"),name:name,dob:dob,phone:phone,pay:pay,ins:ins,pol:pol,allergy:"",created:new Date().toISOString()};
  db.patients.push(p);return p
}
function blank(db,o){
  var code;do{code="KSP-"+codeGen(o.rnd||Math.random)}while(db.bookings.some(function(x){return x.code===code}));
  return{id:"b"+(++db.seq.b),code:code,svc:o.svc,doc:o.doc,date:o.date,time:o.time,pid:o.p.id,name:o.p.name,dob:o.p.dob,phone:o.p.phone,pay:o.p.pay,ins:o.p.ins,pol:o.p.pol,complaint:o.kl,st:"menunggu",qn:"",note:"",created:new Date().toISOString()}
}
function codeGen(rnd){var a="ABCDEFGHJKMNPQRSTUVWXYZ23456789",s="";for(var i=0;i<5;i++)s+=a.charAt(Math.floor(rnd()*a.length));return s}
function assignQn(db,b){
  var doc=db.docs.filter(function(d){return d.id===b.doc})[0],mx=0;
  db.bookings.forEach(function(x){if(x!==b&&x.date===b.date&&x.doc===b.doc&&x.qn){var n=+x.qn.slice(1);if(n>mx)mx=n}});
  b.qn=doc.letter+p2(mx+1)
}

var db=load();
function load(){var raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}
  if(raw){try{var d=JSON.parse(raw);if(d&&d.v===1&&Array.isArray(d.bookings)&&Array.isArray(d.docs))return d}catch(e){}}
  var s=seed();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function reload(){var raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}if(raw){try{db=JSON.parse(raw)}catch(e){}}}
function resetAll(){db=seed();save()}

function svcOf(id){return db.svcs.filter(function(s){return s.id===id})[0]}
function docOf(id){return db.docs.filter(function(d){return d.id===id})[0]}
function bookingOf(id){return db.bookings.filter(function(b){return b.id===id})[0]}
function patientOf(id){return db.patients.filter(function(p){return p.id===id})[0]}
function docsFor(svcId){var s=svcOf(svcId);return s?s.docs.map(docOf).filter(Boolean):[]}
function initials(n){return n.replace(/^(dr|drg)\.\s*/i,"").split(" ").slice(0,2).map(function(x){return x[0]}).join("")}
function holidayFor(date,docId){return db.holidays.filter(function(h){return h.date===date&&(h.doc==="all"||h.doc===docId)})[0]}
function daysOf(doc){var o=[];[1,2,3,4,5,6,0].forEach(function(d){if(doc.sched[d]&&doc.sched[d].length)o.push(DS[d])});return o.join(", ")||"Belum ada jadwal"}

/* ketersediaan: satu sumber kebenaran untuk kalender, slot, dan pengecekan akhir */
function slotInfo(docId,date,ignoreId,phone){
  var doc=docOf(docId),r={off:null,ses:[],free:0};
  if(!doc){r.off="Dokter tidak ditemukan";return r}
  var td=today();
  if(date<td){r.off="Sudah lewat";r.k="past";return r}
  if(date>ymd(addDays(new Date(),HORIZON))){r.off="Terlalu jauh";r.k="past";return r}
  var h=holidayFor(date,docId);if(h){r.off="Libur: "+h.note;r.k="hol";return r}
  var ks=doc.sched[pd(date).getDay()]||[];
  if(!ks.length){r.off="Dokter tidak praktik";r.k="none";return r}
  var np=phone?normPhone(phone):"";
  ks.forEach(function(k){
    var sl=SES[k].slots,quota=doc.quota[k]||sl.length,mine=db.bookings.filter(function(b){return b.doc===docId&&b.date===date&&b.st!=="batal"&&b.id!==ignoreId&&sesOf(b.time)===k}),
      o={k:k,n:SES[k].n,r:SES[k].r,quota:quota,used:mine.length,slots:[]};
    sl.forEach(function(t){
      var s="free";
      if(mine.some(function(b){return b.time===t}))s="taken";
      else if(mine.length>=quota)s="full";
      else if(date===td&&tmin(t)<=nowMin())s="past";
      else if(np&&db.bookings.some(function(b){return b.id!==ignoreId&&b.st!=="batal"&&b.date===date&&b.time===t&&normPhone(b.phone)===np}))s="clash";
      if(s==="free")r.free++;
      o.slots.push({t:t,s:s})
    });
    r.ses.push(o)
  });
  if(!r.free){r.off=r.ses.some(function(o){return o.slots.some(function(x){return x.s==="past"})})&&date===td?"Sesi hari ini sudah lewat":"Penuh";r.k="full"}
  return r
}
var SLOT_MSG={taken:"Jam ini sudah terisi. Pilih jam lain.",full:"Kuota sesi ini sudah penuh.",past:"Jam ini sudah lewat.",clash:"Nomor telepon ini sudah punya janji di jam yang sama."};
function checkSlot(docId,date,time,ignoreId,phone){
  var inf=slotInfo(docId,date,ignoreId,phone);
  if(inf.off&&!inf.ses.length)return"Tanggal tidak tersedia: "+inf.off+".";
  var f=null;inf.ses.forEach(function(o){o.slots.forEach(function(x){if(x.t===time)f=x})});
  if(!f)return"Jam tidak termasuk jadwal praktik dokter.";
  return f.s==="free"?null:SLOT_MSG[f.s]
}
function nextFree(docId){for(var i=0;i<=HORIZON;i++){var d=ymd(addDays(new Date(),i)),inf=slotInfo(docId,d);if(!inf.off)return{date:d,free:inf.free}}return null}

/* validasi form pasien */
function validate(f,svcId){
  var e={},nm=String(f.name||"").trim().replace(/\s+/g," ");
  if(nm.length<3)e.name="Isi nama lengkap, minimal 3 huruf.";else if(!/^[\p{L} .,'\-]+$/u.test(nm))e.name="Nama hanya boleh berisi huruf, spasi, titik, dan tanda hubung.";
  if(!f.dob)e.dob="Isi tanggal lahir.";
  else if(!/^\d{4}-\d{2}-\d{2}$/.test(f.dob)||isNaN(pd(f.dob).getTime())||ymd(pd(f.dob))!==f.dob)e.dob="Tanggal lahir tidak valid.";
  else if(f.dob>today())e.dob="Tanggal lahir tidak boleh di masa depan.";
  else if(ageOf(f.dob)>120)e.dob="Tanggal lahir tidak masuk akal. Periksa lagi.";
  else if(svcId==="anak"&&ageOf(f.dob)>17)e.dob="Layanan Kesehatan anak untuk usia sampai 17 tahun.";
  if(!/^08\d{8,11}$/.test(normPhone(f.phone)))e.phone="Nomor telepon tidak valid. Contoh: 0812-0000-0000.";
  if(f.pay==="Asuransi"){
    if(String(f.ins||"").trim().length<3)e.ins="Isi nama asuransi.";
    if(!/^[A-Za-z0-9\-\/ ]{5,24}$/.test(String(f.pol||"").trim()))e.pol="Nomor polis 5 sampai 24 huruf atau angka.";
  }else if(f.pay!=="Umum")e.pay="Pilih jenis pembayaran.";
  var kl=String(f.kl||"").trim();
  if(kl.length<5)e.kl="Tulis keluhan singkat, minimal 5 karakter.";else if(kl.length>200)e.kl="Keluhan maksimal 200 karakter.";
  return e
}
function findPatient(f){
  var key=normPhone(f.phone)+"|"+f.name.trim().toLowerCase().replace(/\s+/g," ");
  return db.patients.filter(function(p){return normPhone(p.phone)+"|"+p.name.toLowerCase()===key})[0]
}
function createBooking(d){
  var sv=svcOf(d.svc),dc=docOf(d.doc);
  if(!sv||!dc||sv.docs.indexOf(dc.id)<0)return{err:"Layanan atau dokter tidak valid."};
  var ve=validate(d.f,d.svc);if(Object.keys(ve).length)return{err:"Data pasien belum benar.",fields:ve};
  var msg=checkSlot(d.doc,d.date,d.time,null,d.f.phone);if(msg)return{err:msg,sched:true};
  var f=d.f,p=findPatient(f);
  if(!p){p=mkPatient(db,f.name.trim().replace(/\s+/g," "),f.dob,normPhone(f.phone),f.pay,f.pay==="Asuransi"?f.ins.trim():"",f.pay==="Asuransi"?f.pol.trim():"")}
  else{p.dob=f.dob;p.pay=f.pay;p.ins=f.pay==="Asuransi"?f.ins.trim():"";p.pol=f.pay==="Asuransi"?f.pol.trim():""}
  var b=blank(db,{svc:d.svc,doc:d.doc,date:d.date,time:d.time,p:p,kl:f.kl.trim()});
  b.pay=p.pay;b.ins=p.ins;b.pol=p.pol;b.dob=p.dob;
  assignQn(db,b);db.bookings.push(b);save();return{ok:true,b:b}
}
function moveBooking(id,date,time){
  var b=bookingOf(id);if(!b)return{err:"Booking tidak ditemukan."};
  if(b.st==="batal"||b.st==="selesai")return{err:"Booking ini sudah "+ST[b.st].toLowerCase()+" dan tidak bisa diubah."};
  var msg=checkSlot(b.doc,date,time,b.id,b.phone);if(msg)return{err:msg,sched:true};
  if(b.date!==date){b.date=date;assignQn(db,b)}
  b.time=time;b.st="menunggu";save();return{ok:true,b:b}
}
function setStatus(id,st){
  var b=bookingOf(id);if(!b||!ST[st])return false;b.st=st;save();return true
}
function callNext(docId){
  var td=today();
  var busy={};db.bookings.forEach(function(b){if(b.date===td&&b.st==="dipanggil")busy[b.doc]=b});
  if(docId&&docId!=="all"&&busy[docId])return{err:"Selesaikan dulu pasien "+busy[docId].qn+" ("+busy[docId].name+") yang sedang dipanggil."};
  var c=db.bookings.filter(function(b){return b.date===td&&b.st==="menunggu"&&(!docId||docId==="all"||b.doc===docId)&&!busy[b.doc]});
  c.sort(function(a,b){return a.time<b.time?-1:a.time>b.time?1:(a.qn<b.qn?-1:1)});
  if(!c.length)return{err:"Tidak ada pasien yang menunggu."};
  c[0].st="dipanggil";save();return{ok:true,b:c[0]}
}
function canSelf(b){return b.st==="menunggu"&&apptDate(b).getTime()-Date.now()>=LEAD_MIN*60000}
function conflict(b){
  if(b.st==="batal"||b.st==="selesai"||b.st==="tidak"||b.date<today())return false;
  if(holidayFor(b.date,b.doc))return true;
  var d=docOf(b.doc),ks=d.sched[pd(b.date).getDay()]||[];return ks.indexOf(sesOf(b.time))<0
}
function stLabel(b,pub){return pub&&b.st==="menunggu"&&b.date>today()?"Terjadwal":ST[b.st]}

/* ics */
function icsOf(b){
  var sv=svcOf(b.svc),dc=docOf(b.doc),d=pd(b.date),a=b.time.split(":"),s=new Date(d.getFullYear(),d.getMonth(),d.getDate(),+a[0],+a[1]),e=new Date(s.getTime()+sv.dur*60000);
  function f(x){return x.getFullYear()+p2(x.getMonth()+1)+p2(x.getDate())+"T"+p2(x.getHours())+p2(x.getMinutes())+"00"}
  function t(x){return x.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n")}
  var n=new Date(),stamp=n.getUTCFullYear()+p2(n.getUTCMonth()+1)+p2(n.getUTCDate())+"T"+p2(n.getUTCHours())+p2(n.getUTCMinutes())+p2(n.getUTCSeconds())+"Z";
  return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Klinik Sehat Prima//Demo//ID","CALSCALE:GREGORIAN","BEGIN:VEVENT","UID:"+b.code+"@klinik-sehat.contoh","DTSTAMP:"+stamp,"DTSTART:"+f(s),"DTEND:"+f(e),
    "SUMMARY:"+t("Janji temu "+sv.n+" ("+b.code+")"),"LOCATION:"+t("Klinik Sehat Prima, Jl. Contoh No. 12, Kota Contoh"),
    "DESCRIPTION:"+t("Dokter: "+dc.n+"\nKode booking: "+b.code+"\nDatang 15 menit lebih awal."),"BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY","DESCRIPTION:Janji temu 1 jam lagi","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n")+"\r\n"
}
function csv(rows){return"\ufeff"+rows.map(function(r){return r.map(function(c){var s=String(c==null?"":c);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'}).join(",")}).join("\r\n")}
function download(name,text,type){var a=document.createElement("a"),u=URL.createObjectURL(new Blob([text],{type:type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)}

return{get db(){return db},esc:esc,p2:p2,ymd:ymd,pd:pd,addDays:addDays,today:today,tmin:tmin,fdate:fdate,sdate:sdate,rp:rp,sesOf:sesOf,normPhone:normPhone,fmtPhone:fmtPhone,ageOf:ageOf,apptDate:apptDate,
 SES:SES,ST:ST,DS:DS,DN:DN,MN:MN,HORIZON:HORIZON,LEAD_MIN:LEAD_MIN,PIN:PIN,
 svcOf:svcOf,docOf:docOf,bookingOf:bookingOf,patientOf:patientOf,docsFor:docsFor,initials:initials,holidayFor:holidayFor,daysOf:daysOf,
 slotInfo:slotInfo,checkSlot:checkSlot,nextFree:nextFree,validate:validate,createBooking:createBooking,moveBooking:moveBooking,setStatus:setStatus,callNext:callNext,
 canSelf:canSelf,conflict:conflict,stLabel:stLabel,icsOf:icsOf,csv:csv,download:download,save:save,reload:reload,resetAll:resetAll,
 nextId:function(k){return++db.seq[k]}}
})();
