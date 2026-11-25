"use strict";
var KEY="restoran.v1",AKEY="restoran.admin";
var DAYN=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],MON=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
var SLOTS=["11:00","13:00","15:00","17:00","19:00"],SLOTMIN=120,MAXG=10;
var ACTIVE=["menunggu","dikonfirmasi","datang"];
var OST={baru:"Baru",masak:"Dimasak",siap:"Siap",selesai:"Selesai",batal:"Batal"};
var RST={menunggu:"Menunggu",dikonfirmasi:"Dikonfirmasi",datang:"Sudah datang",tidak:"Tidak datang",ditolak:"Ditolak",batal:"Dibatalkan"};
var CATS=["Makanan Utama","Bakar & Sate","Sayur & Lauk","Camilan","Minuman","Penutup"];
var TAGS={pedas:"Pedas",vegetarian:"Vegetarian",favorit:"Favorit"};
var PAYS={tunai:"Tunai",qris:"QRIS contoh",transfer:"Transfer contoh"};
var RND=Math.random;

function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rp(n){return(n<0?"-":"")+"Rp"+Math.abs(Math.round(n)).toLocaleString("id-ID")}
function two(n){return String(n).padStart(2,"0")}
function num(v){return +(String(v).replace(/\D/g,"")||0)}
function ymd(d){return d.getFullYear()+"-"+two(d.getMonth()+1)+"-"+two(d.getDate())}
function pd(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function addD(s,n){var d=pd(s);d.setDate(d.getDate()+n);return ymd(d)}
function today(){return ymd(new Date())}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||"")&&ymd(pd(s))===s}
function fdate(s){var d=pd(s);return DAYN[d.getDay()]+", "+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}
function sdate(s){var d=pd(s);return d.getDate()+" "+MON[d.getMonth()]}
function hm(t){var d=new Date(t);return two(d.getHours())+":"+two(d.getMinutes())}
function fdt(t){var d=new Date(t);return d.getDate()+" "+MON[d.getMonth()]+" "+hm(t)}
function tmin(s){var h=s.split(":");return +h[0]*60+ +h[1]}
function slotT(date,slot){var d=pd(date),h=slot.split(":");d.setHours(+h[0],+h[1],0,0);return d.getTime()}
function slotEnd(slot){var m=tmin(slot)+SLOTMIN;return two(Math.floor(m/60))+":"+two(m%60)}
function ago(t){var m=Math.max(0,Math.round((Date.now()-t)/60000));return m<1?"baru saja":m<60?m+" mnt lalu":Math.floor(m/60)+" j "+(m%60)+" mnt lalu"}
function cleanPhone(p){return String(p||"").replace(/\D/g,"")}
function phoneOk(p){var d=cleanPhone(p);return d.length>=9&&d.length<=14&&d.charAt(0)==="0"}

/* ---------- penyimpanan ---------- */
var lastRaw=null,db;
function save(){try{lastRaw=JSON.stringify(db);localStorage.setItem(KEY,lastRaw)}catch(e){}}
function load(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.v===1&&d.menu&&d.tables){lastRaw=r;return d}}}catch(e){}var s=seed();db=s;save();return s}
function reload(){try{var r=localStorage.getItem(KEY);if(r&&r!==lastRaw){var d=JSON.parse(r);if(d&&d.v===1){db=d;lastRaw=r;return true}}}catch(e){}return false}

/* ---------- data awal ---------- */
var MENU=[
["Nasi Goreng Kampung","Makanan Utama",28000,"Nasi goreng bumbu terasi, telur mata sapi, acar, kerupuk.",["pedas","favorit"],"rice",24],
["Mie Goreng Jawa","Makanan Utama",26000,"Mie kuning, sayur, telur, bumbu kecap manis.",[],"rice",36],
["Soto Ayam Bening","Makanan Utama",25000,"Kuah kuning bening, suwiran ayam, soun, telur rebus.",["favorit"],"bowl",46],
["Rawon Daging","Makanan Utama",36000,"Kuah kluwek hitam, daging sapi empuk, tauge, telur asin.",[],"bowl",12],
["Gado-gado","Makanan Utama",24000,"Sayur rebus, lontong, tahu, tempe, bumbu kacang.",["vegetarian"],"salad",100],
["Nasi Campur Sekar","Makanan Utama",32000,"Nasi dengan ayam suwir, telur, tempe orek, sambal.",["pedas"],"rice",30],
["Ayam Bakar Madu","Bakar & Sate",34000,"Setengah ekor ayam, bumbu madu, lalapan, sambal.",["favorit"],"ribs",28],
["Ikan Bakar Bumbu Kuning","Bakar & Sate",42000,"Ikan segar, bumbu kunyit, sambal mangga.",["pedas"],"fish",40],
["Sate Ayam (10 tusuk)","Bakar & Sate",30000,"Sate ayam bumbu kacang, lontong, acar.",["favorit"],"skewer",20],
["Iga Bakar","Bakar & Sate",58000,"Iga sapi bakar saus kecap, nasi putih, sambal.",[],"ribs",16],
["Ayam Penyet Sambal","Bakar & Sate",30000,"Ayam goreng dipenyet, sambal bawang, tahu, tempe.",["pedas"],"rice",8],
["Tumis Kangkung","Sayur & Lauk",16000,"Kangkung tumis bawang putih dan cabai.",["vegetarian","pedas"],"salad",120],
["Tempe Mendoan","Sayur & Lauk",14000,"Tempe tipis berbalut tepung, kecap cabai.",["vegetarian"],"fried",38],
["Terong Balado","Sayur & Lauk",18000,"Terong goreng dengan sambal balado.",["vegetarian","pedas"],"salad",350],
["Perkedel Jagung","Sayur & Lauk",14000,"Perkedel jagung manis, renyah di luar.",["vegetarian"],"fried",44],
["Pisang Goreng Keju","Camilan",16000,"Pisang kepok goreng, parutan keju, susu.",["vegetarian","favorit"],"fried",42],
["Tahu Crispy","Camilan",15000,"Tahu goreng tepung renyah, saus sambal.",["vegetarian","pedas"],"fried",34],
["Es Teh Manis","Minuman",7000,"Teh melati dingin, gula secukupnya.",["vegetarian"],"glass",32],
["Es Jeruk","Minuman",10000,"Jeruk peras segar dengan es batu.",["vegetarian"],"glass",34],
["Wedang Jahe","Minuman",12000,"Jahe, gula aren, serai, hangat.",["vegetarian"],"glass",26],
["Es Kelapa Muda","Minuman",15000,"Kelapa muda, sirup, es serut.",["vegetarian","favorit"],"glass",150],
["Kopi Tubruk","Minuman",12000,"Kopi hitam seduh tubruk, gula terpisah.",["vegetarian"],"glass",22],
["Es Campur","Penutup",18000,"Cincau, kelapa, nangka, sirup merah, susu.",["vegetarian"],"sweet",340],
["Klepon (5 butir)","Penutup",12000,"Bola ketan isi gula merah, taburan kelapa.",["vegetarian"],"sweet",110]
];
var TABLES=[[1,"T1",2,30,50,80,64],[2,"T2",2,130,50,80,64],[3,"T3",2,230,50,80,64],[4,"T4",2,330,50,80,64],
[5,"T5",4,30,170,100,70],[6,"T6",4,150,170,100,70],[7,"T7",4,270,170,100,70],[8,"T8",4,390,170,100,70],
[9,"T9",6,30,290,130,80],[10,"T10",6,190,290,130,80],[11,"T11",10,350,290,250,80]];
var NAMES=["Budi","Sari","Andi","Dewi","Rizky","Maya","Tono","Lina","Agus","Putri","Hadi","Nia"];

function defSet(){var h={};for(var i=0;i<7;i++)h[i]={on:true,from:"10:00",to:"21:00"};return{hours:h,holidays:[],fee:8000,freeFrom:100000,minOrder:30000,accept:true,pin:"1234"}}
function seed(){
  var s=11;RND=function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  var now=Date.now(),td=today();
  db={v:1,seq:{o:1040},menu:MENU.map(function(m,i){return{id:i+1,n:m[0],c:m[1],p:m[2],d:m[3],tags:m[4],k:m[5],h:m[6],av:true}}),
    tables:TABLES.map(function(t){return{id:t[0],n:t[1],seats:t[2],x:t[3],y:t[4],w:t[5],h:t[6],off:false}}),
    orders:[],resv:[],set:defSet(),cart:{items:{},mode:"antar"},mine:{o:[],r:[]}};
  db.set.holidays.push({d:addD(td,10),r:"Libur contoh: dapur dirawat"});
  var r=function(n){return Math.floor(RND()*n)};
  for(var dd=14;dd>=1;dd--){var day=addD(td,-dd),cnt=7+r(8);
    for(var i=0;i<cnt;i++){var its=[],k=1+r(3);for(var j=0;j<k;j++){var m=db.menu[r(db.menu.length)];if(!its.some(function(x){return x.id===m.id}))its.push({id:m.id,q:1+r(2),note:""})}
      var t=pd(day).getTime()+(10*60+r(630))*60000;
      mkOrder({items:its,mode:RND()<.55?"antar":"ambil",name:NAMES[r(NAMES.length)],phone:"0812-0000-"+two(10+r(80))+two(r(100)),addr:"Jl. Contoh No. "+(1+r(40)),note:"",pay:["tunai","qris","transfer"][r(3)],t:t,status:RND()<.05?"batal":"selesai"})}}
  var T=[[150,"selesai"],[105,"selesai"],[26,"siap"],[15,"masak"],[9,"masak"],[3,"baru"]],ex=[[{id:1,q:2,note:"Satu pedas, satu tidak"},{id:18,q:2,note:""}],[{id:9,q:1,note:""},{id:3,q:1,note:""}],[{id:7,q:1,note:"Tanpa sambal"},{id:19,q:1,note:""}],[{id:4,q:2,note:""},{id:22,q:2,note:"Gula terpisah"}],[{id:5,q:1,note:"Bumbu kacang dipisah"}],[{id:11,q:2,note:"Sambal extra"},{id:21,q:1,note:""}]];
  T.forEach(function(x,i){mkOrder({items:ex[i],mode:i%2?"ambil":"antar",name:NAMES[i],phone:"0812-0000-70"+two(i),addr:"Jl. Contoh No. "+(5+i),note:i===5?"Mohon cepat, ada anak kecil":"",pay:i%2?"tunai":"qris",t:now-x[0]*60000,status:x[1]})});
  for(dd=10;dd>=1;dd--){var d2=addD(td,-dd),n=2+r(3);for(i=0;i<n;i++){var sl=SLOTS[r(SLOTS.length)],gu=1+r(6),st=RND()<.8?"datang":RND()<.5?"tidak":"batal";
    mkResv({name:NAMES[r(NAMES.length)]+" (contoh)",phone:"0812-0000-"+two(10+r(80))+two(r(100)),date:d2,slot:sl,guests:gu,note:"",status:st,t:slotT(d2,sl)-86400000*2},true)}}
  var up=[[0,"13:00",4,"dikonfirmasi"],[0,"13:00",2,"menunggu"],[0,"19:00",6,"dikonfirmasi"],[0,"19:00",3,"dikonfirmasi"],[0,"19:00",2,"menunggu"],[1,"19:00",4,"dikonfirmasi"],[1,"19:00",8,"menunggu"],[1,"11:00",2,"dikonfirmasi"],[3,"17:00",5,"menunggu"],[4,"13:00",2,"dikonfirmasi"]];
  up.forEach(function(u,i){var d3=addD(td,u[0]);mkResv({name:NAMES[(i+3)%NAMES.length]+" (contoh)",phone:"0812-0000-91"+two(i),date:d3,slot:u[1],guests:u[2],note:i===2?"Ulang tahun, mohon kue kecil boleh dibawa":i===6?"Satu kursi bayi":"",status:u[3],t:now-3600000*(i+2)},true)});
  var full=addD(td,2),gl=[2,2,2,2,4,4,4,4,6,6,10];
  gl.forEach(function(g,i){mkResv({name:"Rombongan "+(i+1)+" (contoh)",phone:"0812-0000-92"+two(i),date:full,slot:"19:00",guests:g,note:"",status:"dikonfirmasi",t:now-86400000},true)});
  RND=Math.random;return db;
}

/* ---------- kode, pesanan, reservasi ---------- */
function resvCode(){var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",c;do{c="RV-";for(var i=0;i<4;i++)c+=A.charAt(Math.floor(RND()*A.length))}while(db.resv.some(function(r){return r.code===c}));return c}
function menuOf(id){return db.menu.filter(function(m){return m.id===id})[0]}
function tableOf(id){return db.tables.filter(function(t){return t.id===id})[0]}
function orderOf(code){var c=String(code||"").toUpperCase().replace(/\s/g,"");if(/^\d+$/.test(c))c="PS-"+c;return db.orders.filter(function(o){return o.code===c})[0]}
function resvOf(code){var c=String(code||"").toUpperCase().replace(/\s/g,"");if(c.indexOf("RV-")!==0&&c.length===4)c="RV-"+c;return db.resv.filter(function(r){return r.code===c})[0]}
function feeFor(sub,mode){return mode==="antar"&&sub<db.set.freeFrom?db.set.fee:0}
function mkOrder(o){
  var items=o.items.map(function(i){var m=menuOf(i.id);return{id:m.id,n:m.n,p:m.p,q:i.q,note:i.note||""}});
  var sub=items.reduce(function(a,i){return a+i.p*i.q},0),fee=feeFor(sub,o.mode),code="PS-"+(++db.seq.o);
  var ord={code:code,items:items,mode:o.mode,name:o.name,phone:o.phone,addr:o.mode==="antar"?o.addr:"",note:o.note||"",pay:o.pay,sub:sub,fee:fee,total:sub+fee,t:o.t,status:"baru",hist:[{s:"baru",t:o.t}]};
  var flow=["masak","siap","selesai"];
  if(o.status==="batal"){ord.status="batal";ord.hist.push({s:"batal",t:o.t+120000});ord.why="Dibatalkan pelanggan"}
  else{for(var i=0;i<flow.length;i++){if(o.status==="baru")break;ord.status=flow[i];ord.hist.push({s:flow[i],t:o.t+(i+1)*7*60000});if(flow[i]===o.status)break}}
  db.orders.push(ord);return ord;
}
function freeTables(date,slot,guests,except){
  return db.tables.filter(function(t){return!t.off&&t.seats>=guests&&!db.resv.some(function(r){return r.code!==except&&r.date===date&&r.slot===slot&&r.table===t.id&&ACTIVE.indexOf(r.status)>=0})}).sort(function(a,b){return a.seats-b.seats||a.id-b.id});
}
function dayInfo(date){var h=db.set.hours[pd(date).getDay()],ho=db.set.holidays.filter(function(x){return x.d===date})[0];return{open:h.on&&!ho,from:h.from,to:h.to,holiday:ho?ho.r:null}}
function slotState(date,slot,guests,except){
  var di=dayInfo(date);
  if(!di.open||tmin(slot)<tmin(di.from)||tmin(slot)+SLOTMIN>tmin(di.to))return{ok:false,why:di.holiday?"Libur":"Tutup"};
  if(slotT(date,slot)<Date.now())return{ok:false,why:"Lewat"};
  var f=freeTables(date,slot,guests||1,except);return f.length?{ok:true,n:f.length,tables:f}:{ok:false,why:"Penuh"};
}
function mkResv(o,force){
  var tb=o.table?tableOf(o.table):freeTables(o.date,o.slot,o.guests)[0];
  if(!tb)return null;
  var r={code:resvCode(),name:o.name,phone:o.phone,date:o.date,slot:o.slot,guests:o.guests,note:o.note||"",table:tb.id,status:o.status||"menunggu",t:o.t||Date.now(),walkin:!!o.walkin,why:""};
  db.resv.push(r);return r;
}
function openNow(){
  var td=today(),di=dayInfo(td);
  if(!db.set.accept)return{ok:false,msg:"Pesanan online sedang dijeda restoran."};
  if(di.holiday)return{ok:false,msg:"Hari ini libur: "+di.holiday};
  if(!di.open)return{ok:false,msg:"Restoran tutup hari ini."};
  var n=new Date(),m=n.getHours()*60+n.getMinutes();
  return{ok:true,msg:m>=tmin(di.from)&&m<tmin(di.to)?"Buka sekarang sampai "+di.to:"Di luar jam buka ("+di.from+" - "+di.to+"). Pesanan diproses saat buka.",live:m>=tmin(di.from)&&m<tmin(di.to)};
}

/* ---------- keranjang ---------- */
function cartLines(){return Object.keys(db.cart.items).map(function(k){var m=menuOf(+k),it=db.cart.items[k];return m?{m:m,q:it.q,note:it.note||""}:null}).filter(Boolean)}
function cartCount(){return cartLines().reduce(function(a,l){return a+l.q},0)}
function cartSub(){return cartLines().reduce(function(a,l){return a+l.m.p*l.q},0)}
function cartAdd(id,d){var m=menuOf(id);if(!m)return;if(d>0&&!m.av){toast(m.n+" sedang habis",true);return}var it=db.cart.items[id]||(db.cart.items[id]={q:0,note:""});it.q+=d;if(it.q>20){it.q=20;toast("Maksimal 20 per menu",true)}if(it.q<=0)delete db.cart.items[id];save()}

/* ---------- foto menu (lokal, kredit di credits.json) ---------- */
var PHOTO={"Nasi Goreng Kampung":"nasi-goreng","Mie Goreng Jawa":"mie-goreng","Soto Ayam Bening":"soto-ayam","Rawon Daging":"rawon","Gado-gado":"gado-gado","Nasi Campur Sekar":"nasi-campur","Ayam Bakar Madu":"ayam-bakar","Ikan Bakar Bumbu Kuning":"ikan-bakar","Sate Ayam (10 tusuk)":"sate-ayam","Iga Bakar":"iga-bakar","Ayam Penyet Sambal":"ayam-penyet","Tumis Kangkung":"tumis-kangkung","Tempe Mendoan":"mendoan","Terong Balado":"terong-balado","Perkedel Jagung":"perkedel-jagung","Pisang Goreng Keju":"pisang-goreng","Tahu Crispy":"tahu-crispy","Es Teh Manis":"es-teh","Es Jeruk":"es-jeruk","Wedang Jahe":"wedang-jahe","Es Kelapa Muda":"es-kelapa-muda","Kopi Tubruk":"kopi-hitam","Es Campur":"es-campur","Klepon (5 butir)":"klepon"};
function photo(m){
  var f=PHOTO[m.n];
  return f?'<img src="img/'+f+'.jpg" alt="'+esc(m.n)+'" width="720" height="540" loading="lazy" decoding="async">':'<div class="noimg" aria-hidden="true">'+esc(m.n.charAt(0))+'</div>';
}
function logo(){return'<span class="mono" aria-hidden="true">SJ</span>'}
