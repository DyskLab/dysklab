"use strict";
/* Panggung Kita: demo tiket event. Data di localStorage, tanpa backend. */
var KEY="tiket.v1",HOLD_MS=600000,TZ="Asia/Jakarta";
var CATS=["Konser","Seminar","Workshop","Festival"];
var IMGS=[
 {f:"img/konser-panggung.jpg",l:"Panggung konser dan penonton"},
 {f:"img/festival-kerumunan.jpg",l:"Festival dengan kerumunan dari jauh"},
 {f:"img/panggung-senja.jpg",l:"Panggung terbuka saat senja"},
 {f:"img/ruang-seminar.jpg",l:"Ruang seminar"},
 {f:"img/workshop-keramik.jpg",l:"Roda tanah liat"}
];
var db=null,SID=null,armed=null,ACT={},FORMS={},INP={},ui={q:"",cat:"",city:"",from:"",past:false};
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rp(n){return "Rp"+Math.round(n).toLocaleString("id-ID")}
function num(v){var n=parseInt(String(v).replace(/\D/g,""),10);return isNaN(n)?0:n}
var fD=new Intl.DateTimeFormat("id-ID",{timeZone:TZ,weekday:"short",day:"numeric",month:"short",year:"numeric"});
var fDs=new Intl.DateTimeFormat("id-ID",{timeZone:TZ,day:"numeric",month:"short"});
var fM=new Intl.DateTimeFormat("id-ID",{timeZone:TZ,month:"short"});
var fT=new Intl.DateTimeFormat("id-ID",{timeZone:TZ,hour:"2-digit",minute:"2-digit",hour12:false});
function dstr(ms){return fD.format(ms)}
function dshort(ms){return fDs.format(ms)}
function tstr(ms){return fT.format(ms).replace(":",".")}
function dtstr(ms){return dshort(ms)+", "+tstr(ms)+" WIB"}
function dayKey(ms){return new Date(ms+7*36e5).toISOString().slice(0,10)}
function jktMid(off){var d=new Date(Date.now()+7*36e5);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-7*36e5+(off||0)*864e5}
function fromInput(d,t){var p=String(d||"").split("-"),q=String(t||"00:00").split(":");if(p.length!==3)return NaN;return Date.UTC(+p[0],+p[1]-1,+p[2],+q[0]-7,+q[1]||0)}
function timeInput(ms){var d=new Date(ms+7*36e5);return ("0"+d.getUTCHours()).slice(-2)+":"+("0"+d.getUTCMinutes()).slice(-2)}
function ago(ms){var s=Math.max(0,Math.round((Date.now()-ms)/1000));if(s<60)return "baru saja";if(s<3600)return Math.floor(s/60)+" menit lalu";if(s<86400)return Math.floor(s/3600)+" jam lalu";return Math.floor(s/86400)+" hari lalu"}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var CH="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function mkCode(r,n){var s="";for(var i=0;i<n;i++)s+=CH[Math.floor(r()*CH.length)];return s}
function newId(p){return p+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36)}
function normPhone(s){return String(s||"").replace(/\D/g,"").replace(/^62/,"0")}

/* ---------- data awal ---------- */
var NAMES=["Ayu","Bima","Citra","Dimas","Eka","Farhan","Gita","Hana","Indra","Joko","Kirana","Lukman","Maya","Nadia","Oki","Putri","Raka","Sinta","Tegar","Wulan","Yoga","Zahra"];
var LAST=["Pratama","Lestari","Wijaya","Santoso","Rahayu","Nugroho","Saputra","Kusuma","Hidayat","Permata","Utami","Setiawan"];
var METHODS=["Transfer bank (VA)","QRIS","E-wallet","Kartu kredit"];
function seed(){
 var r=rng(77123),now=Date.now();
 var D=function(d,h,m){return jktMid(d)+((h||0)*60+(m||0))*6e4};
 var ev=[
 {id:"e1",name:"Konser Malam Hijau",cat:"Konser",city:"Bandung",venue:"Lapangan Utama Contoh",addr:"Jl. Contoh Raya No. 1 (alamat contoh)",start:D(24,19),end:D(24,23),img:"img/konser-panggung.jpg",pos:"50% 50%",desc:"Satu malam, tiga penampil, lampu dan layar besar. Area festival berdiri, area VIP di depan panggung dengan antrean masuk terpisah. Anak di bawah 12 tahun wajib didampingi.",sched:"17.00|Pintu dibuka\n19.00|Penampil pembuka\n20.15|Penampil kedua\n21.30|Penampil utama\n23.00|Acara selesai",status:"publish",maxPer:6,earlyUntil:D(10,23,59),seat:null,tiers:[
  {id:"t1",name:"Festival",desc:"Area berdiri, masuk dari pintu A",price:200000,early:150000,quota:400},
  {id:"t2",name:"VIP",desc:"Area depan panggung, antrean masuk khusus",price:450000,early:350000,quota:60}]},
 {id:"e2",name:"Senja di Dermaga",cat:"Konser",city:"Surabaya",venue:"Dermaga Seni Contoh",addr:"Jl. Pelabuhan Contoh No. 8 (alamat contoh)",start:D(9,18),end:D(9,21),img:"img/panggung-senja.jpg",pos:"50% 60%",desc:"Konser akustik kecil di tepi laut saat matahari terbenam. Kursi bernomor di depan panggung, area berdiri di belakang. Bawa jaket, angin sore cukup kencang.",sched:"16.30|Pintu dibuka\n18.00|Set pertama\n19.15|Jeda\n19.45|Set kedua\n21.00|Selesai",status:"publish",maxPer:6,earlyUntil:D(3,23,59),seat:{rows:6,cols:10,tier:"t1"},tiers:[
  {id:"t1",name:"Kursi bernomor",desc:"Pilih kursi sendiri di denah",price:175000,early:140000,quota:60},
  {id:"t2",name:"Berdiri",desc:"Area belakang, tanpa kursi",price:90000,early:70000,quota:80}]},
 {id:"e3",name:"Seminar Bisnis Digital untuk UMKM",cat:"Seminar",city:"Jakarta",venue:"Ruang Seminar Contoh Lt. 3",addr:"Gedung Contoh, Jl. Bisnis No. 12 (alamat contoh)",start:D(14,9),end:D(14,15),img:"img/ruang-seminar.jpg",pos:"50% 50%",desc:"Satu hari penuh tentang jualan online, pembukuan sederhana dan iklan berbayar untuk usaha kecil. Tiga sesi, tanya jawab, dan modul PDF untuk semua peserta. Makan siang dan kopi termasuk.",sched:"08.30|Registrasi\n09.00|Sesi 1: Etalase online yang rapi\n11.00|Sesi 2: Pembukuan sederhana\n12.30|Makan siang\n13.30|Sesi 3: Iklan dengan modal kecil\n15.00|Selesai",status:"publish",maxPer:5,earlyUntil:D(6,23,59),seat:null,tiers:[
  {id:"t1",name:"Umum",desc:"Modul, makan siang, kopi",price:99000,early:75000,quota:120},
  {id:"t2",name:"Mahasiswa",desc:"Tunjukkan kartu mahasiswa saat masuk",price:49000,early:null,quota:40}]},
 {id:"e4",name:"Seminar Keuangan Pribadi",cat:"Seminar",city:"Bandung",venue:"Aula Contoh Pusat Belajar",addr:"Jl. Belajar No. 5 (alamat contoh)",start:D(5,13),end:D(5,16),img:"img/ruang-seminar.jpg",pos:"30% 60%",desc:"Cara menyusun anggaran bulanan, dana darurat, dan memilih tabungan. Disampaikan santai, tanpa istilah rumit. Peserta mendapat lembar anggaran untuk dibawa pulang.",sched:"12.30|Registrasi\n13.00|Anggaran yang masuk akal\n14.15|Dana darurat\n15.00|Tanya jawab\n16.00|Selesai",status:"publish",maxPer:4,earlyUntil:null,seat:null,tiers:[
  {id:"t1",name:"Umum",desc:"Lembar anggaran dan kopi",price:50000,early:null,quota:60}]},
 {id:"e5",name:"Workshop Keramik Tangan",cat:"Workshop",city:"Yogyakarta",venue:"Studio Tanah Liat Contoh",addr:"Jl. Gerabah Contoh No. 3 (alamat contoh)",start:D(12,10),end:D(12,14),img:"img/workshop-keramik.jpg",pos:"50% 80%",desc:"Belajar membentuk mangkuk dan cangkir dari tanah liat di atas roda putar. Empat jam, satu karya dibakar dan bisa diambil dua minggu kemudian. Celemek disediakan.",sched:"09.45|Datang dan siapkan celemek\n10.00|Mengenal tanah liat\n10.45|Membentuk di roda putar\n12.30|Istirahat\n13.00|Menghias dan glasir\n14.00|Selesai",status:"publish",maxPer:4,earlyUntil:D(5,23,59),seat:null,tiers:[
  {id:"t1",name:"Peserta",desc:"Bahan standar dan pembakaran satu karya",price:275000,early:225000,quota:20},
  {id:"t2",name:"Peserta + bahan premium",desc:"Glasir pilihan dan dua karya dibakar",price:350000,early:300000,quota:10}]},
 {id:"e6",name:"Festival Cahaya Kota",cat:"Festival",city:"Semarang",venue:"Alun-alun Contoh",addr:"Jl. Alun-alun Contoh (alamat contoh)",start:D(31,16),end:D(31,22),img:"img/festival-kerumunan.jpg",pos:"50% 40%",desc:"Enam jam panggung musik, jajanan, dan pertunjukan cahaya di pusat kota. Tiket Fast Pass memakai pintu masuk terpisah dan mendapat satu minuman.",sched:"16.00|Gerbang dibuka\n17.00|Panggung musik lokal\n19.00|Pertunjukan cahaya\n20.30|Penampil utama\n22.00|Selesai",status:"publish",maxPer:8,earlyUntil:D(14,23,59),seat:null,tiers:[
  {id:"t1",name:"Reguler",desc:"Masuk sepanjang acara",price:85000,early:60000,quota:800},
  {id:"t2",name:"Fast Pass",desc:"Pintu khusus dan satu minuman",price:150000,early:120000,quota:150}]},
 {id:"e7",name:"Pesta Rakyat Musim Hujan",cat:"Festival",city:"Jakarta",venue:"Taman Kota Contoh",addr:"Jl. Taman Contoh No. 2 (alamat contoh)",start:D(-10,15),end:D(-10,22),img:"img/festival-kerumunan.jpg",pos:"50% 90%",desc:"Festival musik dan jajanan akhir pekan. Acara ini sudah selesai.",sched:"15.00|Gerbang dibuka\n17.00|Panggung musik\n22.00|Selesai",status:"publish",maxPer:6,earlyUntil:null,seat:null,tiers:[
  {id:"t1",name:"Reguler",desc:"Masuk sepanjang acara",price:70000,early:null,quota:300}]},
 {id:"e8",name:"Workshop Kopi Tubruk",cat:"Workshop",city:"Yogyakarta",venue:"Kedai Contoh",addr:"Jl. Kopi Contoh No. 9 (alamat contoh)",start:D(40,14),end:D(40,17),img:"img/ruang-seminar.jpg",pos:"60% 40%",desc:"Draf: belum dipublikasikan. Dasar menyeduh kopi tubruk dan mengenal biji dari beberapa daerah.",sched:"14.00|Mulai\n17.00|Selesai",status:"draft",maxPer:4,earlyUntil:null,seat:null,tiers:[
  {id:"t1",name:"Peserta",desc:"Bahan dan cicip kopi",price:120000,early:null,quota:15}]}
 ];
 var promos=[
  {code:"HEMAT10",type:"pct",value:10,ev:"",max:0,used:0,until:D(60,23,59),active:true},
  {code:"EARLY25",type:"nom",value:25000,ev:"e3",max:50,used:0,until:D(10,23,59),active:true},
  {code:"SENJA20",type:"pct",value:20,ev:"e2",max:10,used:0,until:null,active:true},
  {code:"HABIS",type:"pct",value:15,ev:"",max:5,used:5,until:null,active:true},
  {code:"LAWAS",type:"pct",value:30,ev:"",max:0,used:0,until:D(-3,23,59),active:true}
 ];
 var d={v:1,pin:"2468",org:"Panggung Kita",events:ev,orders:[],promos:promos,holds:[],scans:[],cart:{ev:null,q:{},seats:[],promo:"",hold:0}};
 var codes={};
 function uniq(n){var c;do{c=mkCode(r,n)}while(codes[c]);codes[c]=1;return c}
 var plan=[["e1","t1",231,[-13,0]],["e1","t2",60,[-13,-1]],["e2","t1",31,[-12,0]],["e2","t2",33,[-12,0]],["e3","t1",58,[-13,0]],["e3","t2",22,[-12,0]],["e4","t1",56,[-13,0]],["e5","t1",12,[-11,0]],["e5","t2",4,[-9,0]],["e6","t1",140,[-13,0]],["e6","t2",38,[-13,0]],["e7","t1",212,[-24,-11]]];
 var taken={};
 plan.forEach(function(p){
  var e=ev.filter(function(x){return x.id===p[0]})[0],t=e.tiers.filter(function(x){return x.id===p[1]})[0],left=p[2];
  while(left>0){
   var q=Math.min(left,1+Math.floor(r()*r()*4));left-=q;
   var day=p[3][0]+Math.floor(r()*(p[3][1]-p[3][0]+1)),at=jktMid(day)+(8+r()*14)*36e5;
   if(at>now)at=now-Math.floor(r()*180)*6e4;
   var early=e.earlyUntil&&at<e.earlyUntil&&t.early!=null,price=early?t.early:t.price,sub=price*q,disc=0,pc="";
   if(e.status==="publish"&&r()<.1&&e.start>now){pc="HEMAT10";disc=Math.floor(sub*.1);promos[0].used++}
   var nm=NAMES[Math.floor(r()*NAMES.length)]+" "+LAST[Math.floor(r()*LAST.length)],id="ORD-"+uniq(6);
   var tk=[];
   for(var i=0;i<q;i++){
    var seat="";
    if(e.seat&&e.seat.tier===t.id){var tries=0;do{seat="ABCDEF"[Math.floor(r()*e.seat.rows)]+(1+Math.floor(r()*e.seat.cols));tries++}while(taken[e.id+seat]&&tries<400);taken[e.id+seat]=1}
    var used=null;if(e.start<now&&r()<.9)used=e.start-Math.floor(r()*120)*6e4;
    tk.push({code:uniq(4)+"-"+uniq(4),tier:t.id,holder:i===0?nm:(r()<.5?nm:NAMES[Math.floor(r()*NAMES.length)]+" "+LAST[Math.floor(r()*LAST.length)]),seat:seat,used:used,log:[]});
   }
   d.orders.push({id:id,ev:e.id,items:[{tier:t.id,qty:q,price:price}],buyer:{name:nm,phone:"0812-0000-"+("000"+Math.floor(r()*10000)).slice(-4),email:nm.toLowerCase().replace(/\W+/g,".")+"@contoh.id"},sub:sub,disc:disc,promo:pc,total:sub-disc,status:"paid",at:at,method:METHODS[Math.floor(r()*4)],tickets:tk});
  }
 });
 var rf=0;d.orders.forEach(function(o){if(rf<3&&(o.ev==="e6"||o.ev==="e3")&&o.items[0].qty===1&&!o.promo&&r()<.2){o.status="refunded";o.refundAt=o.at+864e5;o.tickets.forEach(function(t){t.void=true});rf++}});
 d.orders.sort(function(a,b){return a.at-b.at});
 [["C4",4],["C5",4],["D7",7]].forEach(function(s){if(!taken["e2"+s[0]])d.holds.push({ev:"e2",seat:s[0],sid:"lain",until:now+s[1]*6e4})});
 return d;
}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY));if(x&&x.v===1&&x.events&&x.orders&&x.cart)return x}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}

/* ---------- pemilih data ---------- */
function evById(id){for(var i=0;i<db.events.length;i++)if(db.events[i].id===id)return db.events[i];return null}
function tierOf(ev,id){for(var i=0;i<ev.tiers.length;i++)if(ev.tiers[i].id===id)return ev.tiers[i];return null}
function ordById(id){for(var i=0;i<db.orders.length;i++)if(db.orders[i].id===id)return db.orders[i];return null}
function paidTickets(evId){var a=[];db.orders.forEach(function(o){if(o.ev===evId&&o.status==="paid")o.tickets.forEach(function(t){a.push(t)})});return a}
function sold(evId,tierId){var n=0;paidTickets(evId).forEach(function(t){if(t.tier===tierId)n++});return n}
function avail(ev,t){return Math.max(0,t.quota-sold(ev.id,t.id))}
function takenSeats(evId){var m={};paidTickets(evId).forEach(function(t){if(t.seat)m[t.seat]=1});return m}
function purgeHolds(){var n=Date.now(),l=db.holds.length;db.holds=db.holds.filter(function(h){return h.until>n});return l!==db.holds.length}
function heldOthers(evId){var m={};purgeHolds();db.holds.forEach(function(h){if(h.ev===evId&&h.sid!==SID)m[h.seat]=h.until});return m}
function isPast(ev){return (ev.end||ev.start+108e5)<Date.now()}
function earlyOn(ev){return !!ev.earlyUntil&&Date.now()<ev.earlyUntil&&ev.tiers.some(function(t){return t.early!=null})}
function curPrice(ev,t){return earlyOn(ev)&&t.early!=null?t.early:t.price}
function minPrice(ev){var m=Infinity;ev.tiers.forEach(function(t){m=Math.min(m,curPrice(ev,t))});return m===Infinity?0:m}
function evStat(ev){var q=0,s=0,rev=0;ev.tiers.forEach(function(t){q+=t.quota;s+=sold(ev.id,t.id)});db.orders.forEach(function(o){if(o.ev===ev.id&&o.status==="paid")rev+=o.total});return{quota:q,sold:s,rev:rev,left:q-s}}
function evFlag(ev){var s=evStat(ev);if(ev.status==="draft")return{t:"Draft",c:"mut"};if(isPast(ev))return{t:"Selesai",c:"mut"};if(s.left<=0)return{t:"Habis",c:"bad"};if(s.left/s.quota<=.15)return{t:"Sisa "+s.left,c:"warn"};return null}
function promoCheck(code,ev,sub){
 code=String(code||"").trim().toUpperCase();if(!code)return{err:"Masukkan kode promo"};
 var p=null;db.promos.forEach(function(x){if(x.code===code)p=x});
 if(!p||!p.active)return{err:"Kode promo tidak ditemukan"};
 if(p.until&&p.until<Date.now())return{err:"Kode promo sudah berakhir"};
 if(p.max&&p.used>=p.max)return{err:"Kuota kode promo sudah habis"};
 if(p.ev&&ev&&p.ev!==ev.id)return{err:"Kode ini tidak berlaku untuk event ini"};
 var disc=p.type==="pct"?Math.floor(sub*p.value/100):Math.min(p.value,sub);
 return{p:p,disc:disc};
}
function calc(c){
 var ev=c.ev?evById(c.ev):null,r={ev:ev,lines:[],qty:0,sub:0,disc:0,total:0,promo:null,perr:""};
 if(!ev)return r;
 ev.tiers.forEach(function(t){var q=c.q[t.id]||0;if(q>0){var pr=curPrice(ev,t);r.lines.push({t:t,qty:q,price:pr,sub:pr*q,seats:(ev.seat&&ev.seat.tier===t.id)?c.seats.slice().sort(seatCmp):[]});r.qty+=q;r.sub+=pr*q}});
 if(c.promo){var k=promoCheck(c.promo,ev,r.sub);if(k.err)r.perr=k.err;else{r.promo=k.p;r.disc=k.disc}}
 r.total=r.sub-r.disc;return r;
}
function seatCmp(a,b){return a.charAt(0)===b.charAt(0)?(+a.slice(1))-(+b.slice(1)):(a<b?-1:1)}
function tkStatus(o,t){if(o.status!=="paid"||t.void)return{t:"Dibatalkan",c:"bad"};if(t.used)return{t:"Sudah dipakai",c:"mut"};var ev=evById(o.ev);if(ev&&isPast(ev))return{t:"Kedaluwarsa",c:"mut"};return{t:"Valid",c:"ok"}}
function findTicket(code){code=String(code||"").toUpperCase().replace(/^TKT:/,"").replace(/[^A-Z0-9]/g,"");for(var i=0;i<db.orders.length;i++){var o=db.orders[i];for(var j=0;j<o.tickets.length;j++){if(o.tickets[j].code.replace(/-/g,"")===code)return{o:o,t:o.tickets[j]}}}return null}

/* ---------- QR (versi 1-5, koreksi L, mode byte) ---------- */
var QR_DATA=[19,34,55,80,108],QR_EC=[7,10,15,20,26],QR_AL=[[],[6,18],[6,22],[6,26],[6,30]];
function qrRS(data,ecn){
 var exp=[],log=[],x=1,i;for(i=0;i<255;i++){exp[i]=x;log[x]=i;x<<=1;if(x&256)x^=0x11D}
 var mul=function(a,b){return a&&b?exp[(log[a]+log[b])%255]:0};
 var g=[1];for(i=0;i<ecn;i++){var ng=[];for(var j=0;j<=g.length;j++)ng[j]=0;for(j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=mul(g[j],exp[i])}g=ng}
 var res=[];for(i=0;i<ecn;i++)res[i]=0;
 data.forEach(function(b){var f=b^res[0];res.shift();res.push(0);for(var k=0;k<ecn;k++)res[k]^=mul(g[k+1],f)});
 return res;
}
function qrMatrix(text,fm){
 var bytes=[];for(var i=0;i<text.length;i++)bytes.push(text.charCodeAt(i)&255);
 var v=0;for(v=0;v<5;v++)if(4+8+bytes.length*8<=QR_DATA[v]*8)break;
 if(v>=5)return null;
 var cap=QR_DATA[v],bits=[];
 var put=function(val,n){for(var k=n-1;k>=0;k--)bits.push((val>>>k)&1)};
 put(4,4);put(bytes.length,8);bytes.forEach(function(b){put(b,8)});
 for(i=0;i<4&&bits.length<cap*8;i++)bits.push(0);
 while(bits.length%8)bits.push(0);
 var cw=[];for(i=0;i<bits.length;i+=8){var b=0;for(var k=0;k<8;k++)b=b<<1|bits[i+k];cw.push(b)}
 for(i=0;cw.length<cap;i++)cw.push(i%2?0x11:0xEC);
 cw=cw.concat(qrRS(cw,QR_EC[v]));
 var n=21+4*v,m=[],fn=[],y,x;
 for(y=0;y<n;y++){m.push([]);fn.push([]);for(x=0;x<n;x++){m[y].push(false);fn[y].push(false)}}
 var setFn=function(x,y,d){m[y][x]=!!d;fn[y][x]=true};
 for(i=0;i<n;i++){setFn(6,i,i%2===0);setFn(i,6,i%2===0)}
 var finder=function(cx,cy){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var xx=cx+dx,yy=cy+dy;if(xx<0||yy<0||xx>=n||yy>=n)continue;var dist=Math.max(Math.abs(dx),Math.abs(dy));setFn(xx,yy,dist!==2&&dist!==4)}};
 finder(3,3);finder(n-4,3);finder(3,n-4);
 var al=QR_AL[v];
 for(i=0;i<al.length;i++)for(var j=0;j<al.length;j++){
  if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0))continue;
  for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)setFn(al[i]+dx,al[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
 }
 var drawFmt=function(mm,mask){
  var d=(1<<3)|mask,rem=d;for(var k=0;k<10;k++)rem=(rem<<1)^((rem>>>9)*0x537);
  var bs=((d<<10)|rem)^0x5412,bit=function(k){return ((bs>>>k)&1)!==0};
  for(k=0;k<=5;k++)mm[k][8]=bit(k);mm[7][8]=bit(6);mm[8][8]=bit(7);mm[8][7]=bit(8);
  for(k=9;k<15;k++)mm[8][14-k]=bit(k);
  for(k=0;k<8;k++)mm[8][n-1-k]=bit(k);
  for(k=8;k<15;k++)mm[n-15+k][8]=bit(k);
  mm[n-8][8]=true;
 };
 /* tandai area format sebagai fungsi, lalu letakkan data */
 for(i=0;i<9;i++){fn[8][i]=true;fn[i][8]=true}
 for(i=0;i<8;i++){fn[8][n-1-i]=true;fn[n-1-i][8]=true}
 fn[n-8][8]=true;
 var idx=0,total=cw.length*8;
 for(var right=n-1;right>=1;right-=2){
  if(right===6)right=5;
  for(var vert=0;vert<n;vert++)for(j=0;j<2;j++){
   x=right-j;var up=((right+1)&2)===0;y=up?n-1-vert:vert;
   if(!fn[y][x]&&idx<total){m[y][x]=((cw[idx>>>3]>>>(7-(idx&7)))&1)!==0;idx++}
  }
 }
 var masks=[function(x,y){return (x+y)%2===0},function(x,y){return y%2===0},function(x,y){return x%3===0},function(x,y){return (x+y)%3===0},function(x,y){return (Math.floor(x/3)+Math.floor(y/2))%2===0},function(x,y){return x*y%2+x*y%3===0},function(x,y){return (x*y%2+x*y%3)%2===0},function(x,y){return ((x+y)%2+x*y%3)%2===0}];
 var best=null,bp=1e9;
 for(var mk=0;mk<8;mk++){
  if(fm!==undefined&&mk!==fm)continue;
  var mm=m.map(function(r){return r.slice()});
  for(y=0;y<n;y++)for(x=0;x<n;x++)if(!fn[y][x]&&masks[mk](x,y))mm[y][x]=!mm[y][x];
  drawFmt(mm,mk);
  var p=qrPenalty(mm,n);
  if(p<bp){bp=p;best=mm}
 }
 return best;
}
function qrPenalty(m,n){
 var p=0,x,y,lines=[];
 for(y=0;y<n;y++)lines.push(m[y]);
 for(x=0;x<n;x++){var col=[];for(y=0;y<n;y++)col.push(m[y][x]);lines.push(col)}
 lines.forEach(function(L){
  var run=1,i;for(i=1;i<=n;i++){if(i<n&&L[i]===L[i-1])run++;else{if(run>=5)p+=3+run-5;run=1}}
  var s="0000"+L.map(function(b){return b?1:0}).join("")+"0000",k=-1;
  while((k=s.indexOf("10111010000",k+1))>=0)p+=40;k=-1;
  while((k=s.indexOf("00001011101",k+1))>=0)p+=40;
 });
 var dark=0;
 for(y=0;y<n;y++)for(x=0;x<n;x++){if(m[y][x])dark++;if(x<n-1&&y<n-1&&m[y][x]===m[y][x+1]&&m[y][x]===m[y+1][x]&&m[y][x]===m[y+1][x+1])p+=3}
 p+=(Math.ceil(Math.abs(dark*20-n*n*10)/(n*n))-1)*10;
 return p;
}
function qrPath(m){
 var d="",n=m.length;
 for(var y=0;y<n;y++){var x=0;while(x<n){if(m[y][x]){var s=x;while(x<n&&m[y][x])x++;d+="M"+(s+4)+" "+(y+4)+"h"+(x-s)+"v1h-"+(x-s)+"z"}else x++}}
 return d;
}
function qrSvg(text,cls,label){
 var m=qrMatrix(text);if(!m)return "";
 var s=m.length+8;
 return '<svg class="'+(cls||"qr")+'" viewBox="0 0 '+s+" "+s+'" role="img" aria-label="'+esc(label||"Kode QR tiket")+'" shape-rendering="crispEdges"><rect width="'+s+'" height="'+s+'" fill="#fff"/><path d="'+qrPath(m)+'" fill="#111"/></svg>';
}
function ticketSvgFile(o,t){
 var ev=evById(o.ev)||{name:"Event",venue:"",start:0},tr=ev.tiers?tierOf(ev,t.tier):null;
 var m=qrMatrix("TKT:"+t.code),s=m?m.length+8:0,k=210/s,cut=function(v,n){v=String(v);return esc(v.length>n?v.slice(0,n-1)+"…":v)};
 var st=tkStatus(o,t);
 return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="720" height="280" viewBox="0 0 720 280" font-family="Helvetica,Arial,sans-serif">'+
 '<rect x="1" y="1" width="718" height="278" rx="16" fill="#fff" stroke="#4338ca" stroke-width="2"/><rect x="1" y="1" width="718" height="56" rx="16" fill="#4338ca"/><rect x="1" y="30" width="718" height="27" fill="#4338ca"/>'+
 '<text x="24" y="38" font-size="20" font-weight="700" fill="#fff">'+esc(db.org)+' · E-tiket</text>'+
 '<text x="24" y="96" font-size="24" font-weight="700" fill="#17142b">'+cut(ev.name,34)+'</text>'+
 '<text x="24" y="124" font-size="15" fill="#5b5873">'+esc(dstr(ev.start))+', '+esc(tstr(ev.start))+' WIB</text>'+
 '<text x="24" y="146" font-size="15" fill="#5b5873">'+cut(ev.venue+", "+(ev.city||""),50)+'</text>'+
 '<text x="24" y="186" font-size="12" fill="#5b5873">PEMEGANG TIKET</text><text x="24" y="208" font-size="20" font-weight="700" fill="#17142b">'+cut(t.holder,28)+'</text>'+
 '<text x="24" y="238" font-size="14" fill="#17142b">'+cut(tr?tr.name:"",24)+(t.seat?' · Kursi '+esc(t.seat):'')+' · '+esc(st.t)+'</text>'+
 '<text x="24" y="262" font-size="14" font-family="Courier New,monospace" fill="#17142b">'+esc(t.code)+'</text>'+
 '<line x1="490" y1="72" x2="490" y2="266" stroke="#c9c6dd" stroke-dasharray="6 6"/>'+
 '<g transform="translate(500,66) scale('+k.toFixed(4)+')"><rect width="'+s+'" height="'+s+'" fill="#fff"/><path d="'+(m?qrPath(m):"")+'" fill="#111"/></g></svg>';
}
function download(name,text,mime){var b=new Blob([text],{type:mime}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function csvCell(v){v=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function csvDownload(name,rows){download(name,"﻿"+rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n"),"text/csv;charset=utf-8")}

/* ---------- UI umum ---------- */
var tt=null,lastFocus=null;
function toast(m,bad){var t=$("toast");t.textContent=m;t.className="toast on"+(bad?" bad":"");clearTimeout(tt);tt=setTimeout(function(){t.className="toast"},2600)}
function openSheet(title,html){lastFocus=document.activeElement;$("sheet-t").textContent=title;$("sheet-b").innerHTML=html;$("sheet").classList.add("on");$("scrim").classList.add("on");$("sheet").setAttribute("aria-hidden","false");$("sheet").scrollTop=0;var f=$("sheet-b").querySelector("input:not([type=hidden]),select,textarea");if(f)f.focus()}
function closeSheet(){$("sheet").classList.remove("on");$("scrim").classList.remove("on");$("sheet").setAttribute("aria-hidden","true");$("sheet-b").innerHTML="";if(lastFocus&&lastFocus.focus&&document.body.contains(lastFocus))lastFocus.focus();lastFocus=null}
function sheetOpen(){return $("sheet").classList.contains("on")}
function twice(btn,label,armedText,fn){
 var k=btn.getAttribute("data-key")||label;
 if(armed&&armed.k===k&&armed.b===btn){clearTimeout(armed.t);armed=null;btn.textContent=label;btn.classList.remove("armed");fn();return}
 if(armed){armed.b.textContent=armed.l;armed.b.classList.remove("armed");clearTimeout(armed.t)}
 btn.textContent=armedText;btn.classList.add("armed");
 armed={k:k,b:btn,l:label,t:setTimeout(function(){if(armed&&armed.b===btn){btn.textContent=label;btn.classList.remove("armed");armed=null}},3500)};
}
function fmtCd(ms){var s=Math.max(0,Math.ceil(ms/1000));return ("0"+Math.floor(s/60)).slice(-2)+":"+("0"+s%60).slice(-2)}
function pill(c,t){return '<span class="pill '+c+'">'+esc(t)+'</span>'}
var ICON={
 home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 scan:'<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
 tix:'<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 3"/>'
};
function ico(n,c){return '<svg class="ic '+(c||"")+'" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICON[n]+'</svg>'}

/* ---------- event global ---------- */
function onClick(e){var b=e.target.closest("[data-act]");if(!b||b.disabled)return;var f=ACT[b.getAttribute("data-act")];if(f)f(b,e)}
function onSubmit(e){var f=e.target.closest("[data-form]");if(!f)return;e.preventDefault();var h=FORMS[f.getAttribute("data-form")];if(h)h(f,e)}
function onInput(e){var t=e.target;if(!t.getAttribute)return;var h=t.getAttribute("data-in");if(h&&INP[h])INP[h](t,e)}
ACT["sheet-close"]=function(){closeSheet()};
function liveRefresh(){
 if(sheetOpen())return;var a=document.activeElement;
 if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
 route(true);
}
function boot(){
 try{SID=sessionStorage.getItem("tiket.sid");if(!SID){SID="s"+Math.random().toString(36).slice(2,9);sessionStorage.setItem("tiket.sid",SID)}}catch(e){SID="s"+Math.random().toString(36).slice(2,9)}
 db=load();purgeHolds();save();
 window.addEventListener("hashchange",function(){closeSheet();route()});
 document.addEventListener("click",onClick);
 document.addEventListener("submit",onSubmit);
 document.addEventListener("input",onInput);
 document.addEventListener("change",onInput);
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&sheetOpen())closeSheet()});
 $("scrim").addEventListener("click",closeSheet);
 window.addEventListener("storage",function(e){if(e.key===KEY&&e.newValue){db=load();liveRefresh()}});
 setInterval(tick,1000);
 route();
}
