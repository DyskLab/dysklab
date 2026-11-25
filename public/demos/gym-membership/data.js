"use strict";
/* Data, seed, dan aturan bisnis Kinetik Fit Center (demo). Semua di localStorage. */
var KEY="gym.v1", SESS="gym.sess", ADM="gym.admin";
var DOW=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
var DOWS=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
var MON=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
var REG_FEE=25000, DAYPASS=50000, FREEZE_MAX=30;
var PHOTOS={"ruang-latihan":"Ruang latihan","area-kelas":"Area kelas","area-kardio":"Area kardio","dumbbell":"Dumbbell","plate-warna":"Plate warna","kettlebell":"Kettlebell","sarung-tinju":"Sarung tinju","matras-yoga":"Matras yoga"};
var db=null;

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function P(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function today(){return ymd(new Date())}
function addDays(s,n){var d=P(s);d.setDate(d.getDate()+n);return ymd(d)}
function addMonths(s,m){var d=P(s),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return ymd(d)}
function diff(a,b){var x=a.split("-"),y=b.split("-");return Math.round((Date.UTC(+y[0],+y[1]-1,+y[2])-Date.UTC(+x[0],+x[1]-1,+x[2]))/864e5)}
function fmtDate(s){var d=P(s);return d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}
function fmtDay(s){var d=P(s);return DOWS[d.getDay()]+", "+d.getDate()+" "+MON[d.getMonth()]}
function hm(iso){var d=new Date(iso);return pad(d.getHours())+"."+pad(d.getMinutes())}
function dOf(iso){return ymd(new Date(iso))}
function rp(n){return "Rp "+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function normPhone(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("62")===0)d="0"+d.slice(2);return d}
function fmtPhone(d){d=normPhone(d);return d.length>=10?d.slice(0,4)+"-"+d.slice(4,8)+"-"+d.slice(8):d}
function initials(n){var p=String(n).trim().split(/\s+/);return((p[0]||"?")[0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase()}
function nowIso(){return new Date().toISOString()}
function nid(k){db.seq[k]=(db.seq[k]||0)+1;return db.seq[k]}

/* ---------- penyimpanan ---------- */
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function load(){
  var raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}
  if(raw){try{db=JSON.parse(raw)}catch(e){db=null}}
  if(!db||db.v!==1){db=seed();save()}
  normalize();
}
function resetAll(){try{localStorage.removeItem(KEY);sessionStorage.removeItem(SESS);sessionStorage.removeItem(ADM)}catch(e){}db=seed();save()}

/* ---------- seed deterministik ---------- */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seed(){
  var R=rng(20260);function ri(a,b){return a+Math.floor(R()*(b-a+1))}
  var t=today();
  var d={v:1,seq:{},pin:"2468",gym:"Kinetik Fit Center",
    plans:[
      {id:1,name:"Bulanan",months:1,price:350000,perks:["Akses gym penuh","Semua kelas grup","Loker harian"]},
      {id:2,name:"3 Bulan",months:3,price:900000,perks:["Akses gym penuh","Semua kelas grup","Bekukan hingga 30 hari","Handuk gratis"]},
      {id:3,name:"Tahunan",months:12,price:3200000,perks:["Akses gym penuh","Semua kelas grup","Bekukan hingga 30 hari","Loker tetap","1 sesi evaluasi tubuh"]}
    ],
    promos:[
      {code:"BARU10",type:"pct",val:10,minMonths:1,max:0,used:0,active:true},
      {code:"HEMAT50",type:"flat",val:50000,minMonths:3,max:5,used:2,active:true},
      {code:"TAHUNAN100",type:"flat",val:100000,minMonths:12,max:0,used:0,active:true},
      {code:"LEBARAN25",type:"pct",val:25,minMonths:1,max:0,used:0,active:false}
    ],
    coaches:[
      {id:1,name:"Rani Kusuma",spec:"Yoga dan mobilitas",c1:"#2a8f6c",c2:"#1b5d7a"},
      {id:2,name:"Bimo Santoso",spec:"HIIT dan tinju kebugaran",c1:"#c4622d",c2:"#7a2d1b"},
      {id:3,name:"Sari Wulandari",spec:"Zumba dan dance fitness",c1:"#b03a7a",c2:"#5b2a7a"},
      {id:4,name:"Dito Pramana",spec:"Indoor cycling",c1:"#2d6fc4",c2:"#1b2d7a"},
      {id:5,name:"Maya Anggraini",spec:"Body pump dan kekuatan",c1:"#8f8a2a",c2:"#5d6b1b"},
      {id:6,name:"Andra Wijaya",spec:"Latihan fungsional",c1:"#6a4ec4",c2:"#2d1b7a"}
    ],
    classes:[
      {id:1,name:"Yoga Flow",photo:"matras-yoga",color:"#d6459a",level:"Semua level",dur:60,desc:"Gerakan mengalir untuk kelenturan, napas, dan pemulihan. Bawa matras sendiri atau pinjam di studio."},
      {id:2,name:"Zumba",photo:"",color:"#e8743b",level:"Semua level",dur:60,desc:"Dance fitness dengan musik Latin dan pop. Bakar kalori sambil bergerak."},
      {id:3,name:"HIIT 45",photo:"kettlebell",color:"#e5b82e",level:"Menengah",dur:45,desc:"Interval intensitas tinggi dengan kettlebell dan berat badan. Singkat, padat, berkeringat."},
      {id:4,name:"Spinning",photo:"area-kardio",color:"#3b8fe0",level:"Semua level",dur:45,desc:"Indoor cycling dengan iringan musik. Tahanan bisa diatur sesuai kemampuan."},
      {id:5,name:"Body Pump",photo:"plate-warna",color:"#2fb07a",level:"Pemula",dur:60,desc:"Latihan beban ringan sampai sedang dengan barbel dan plate, ulangan banyak."},
      {id:6,name:"Boxing Fit",photo:"sarung-tinju",color:"#d44b4b",level:"Menengah",dur:60,desc:"Teknik dasar tinju untuk kebugaran, tanpa kontak antar peserta."},
      {id:7,name:"Fungsional",photo:"area-kelas",color:"#7a5fd6",level:"Semua level",dur:60,desc:"Sirkuit gerakan sehari-hari: dorong, tarik, jongkok, angkat. Cocok untuk pemula."}
    ],
    sessions:[],members:[],payments:[],visits:[],bookings:[],workouts:[],notifs:[]
  };
  var S=[[1,[1,3,5],"07:00",14,"Studio A",1],[1,[6],"08:00",14,"Studio A",1],
    [2,[2,4],"19:00",20,"Studio A",3],[2,[6],"09:30",20,"Studio A",3],
    [3,[1,3,5],"18:30",12,"Studio B",2],[3,[0],"08:00",12,"Studio B",2],
    [4,[2,4],"06:30",10,"Studio Cycle",4],[4,[1,3],"19:30",10,"Studio Cycle",4],[4,[6],"07:00",10,"Studio Cycle",4],
    [5,[2,4],"18:00",12,"Studio B",5],[5,[0],"09:00",12,"Studio B",5],
    [6,[3,5],"20:00",10,"Studio B",2],[6,[6],"10:30",10,"Studio B",2],
    [7,[1,4],"12:15",12,"Studio A",6],[7,[0],"10:15",12,"Studio A",6],[7,[6],"08:30",12,"Studio B",6]];
  S.forEach(function(s){s[1].forEach(function(dw){d.sessions.push({id:++d.seq.s||(d.seq.s=1),classId:s[0],dow:dw,time:s[2],cap:s[3],room:s[4],coachId:s[5]})})});
  d.seq.s=d.sessions.length;d.sessions.forEach(function(s,i){s.id=i+1});
  var names=["Andi Pratama","Budi Hartono","Citra Lestari","Dewi Anggraini","Eko Saputra","Fajar Nugroho","Gita Permata","Hadi Susanto","Indah Maharani","Joko Santoso","Kartika Sari","Lukman Hakim","Mega Puspita","Nanda Prakoso","Olivia Rahma","Putra Mahendra","Qori Fadilah","Rina Marlina","Surya Dharma","Tia Novita","Umar Faruq","Vina Oktavia","Wahyu Hidayat","Yuli Astuti","Zaki Ramadhan","Ayu Wulandari","Bayu Firmansyah","Cahya Ningrum","Dimas Aditya","Elsa Putri"];
  // [planId, status, param]
  names.forEach(function(nm,i){
    var n=i+1,st,pl,start,end,fr=null,fd=0;
    if(n===1){pl=2;start=addDays(t,-50);end=addMonths(start,3);end=addDays(end,-1);st="a"}
    else if(n<=18){pl=n%3===0?3:(n%3===1?1:2);var m=d.plans[pl-1].months;start=addDays(t,-ri(3,m===1?20:70));end=addDays(addMonths(start,m),-1);if(diff(t,end)<8){start=addDays(t,-ri(3,12));end=addDays(addMonths(start,m),-1)}}
    else if(n<=23){pl=1;end=addDays(t,[0,1,3,5,6][n-19]);start=addDays(addMonths(end,-1),1)}
    else if(n<=27){pl=n%2?1:2;end=addDays(t,-ri(2,40));start=addDays(addMonths(end,-d.plans[pl-1].months),1)}
    else if(n===28){pl=2;start=addDays(t,-45);end=addDays(addMonths(start,3),-1)+"";fr={since:addDays(t,-3)}}
    else if(n===29){pl=1;start=addDays(t,3);end=addDays(addMonths(start,1),-1)}
    else{pl=3;start=addDays(t,-20);end=addDays(addMonths(start,12),-1)}
    d.members.push({id:n,no:"GYM-"+("000"+n).slice(-4),name:nm,phone:"0812"+("00000000"+n).slice(-8),email:nm.split(" ")[0].toLowerCase()+n+"@contoh.test",birth:(1986+n%18)+"-"+pad(1+n%12)+"-"+pad(1+n%27),planId:pl,start:start,end:end,frozen:fr,freezeDays:fd,joined:start,note:"",goal:["Turun berat badan","Tambah massa otot","Kebugaran umum","Kelenturan"][n%4]});
    d.payments.push({id:0,at:P(start).toISOString(),mid:n,name:nm,kind:"daftar",label:"Paket "+d.plans[pl-1].name+" + kartu",amount:d.plans[pl-1].price+REG_FEE,method:n%2?"QRIS":"Tunai"});
  });
  d.seq.m=names.length;
  // pembayaran tambahan: perpanjangan & day pass dalam 40 hari terakhir
  for(var k=0;k<14;k++){var mm=d.members[ri(0,17)],off=ri(1,38),pp=d.plans[ri(0,1)];d.payments.push({id:0,at:P(addDays(t,-off)).toISOString(),mid:mm.id,name:mm.name,kind:"perpanjang",label:"Perpanjang "+pp.name,amount:pp.price,method:["QRIS","Tunai","Transfer"][k%3]})}
  for(k=0;k<12;k++){d.payments.push({id:0,at:P(addDays(t,-ri(0,30))).toISOString(),mid:0,name:"Tamu",kind:"daypass",label:"Day pass",amount:DAYPASS,method:["Tunai","QRIS"][k%2]})}
  d.payments.forEach(function(p){var dt=new Date(p.at);dt.setHours(8+ri(0,12),ri(0,59));p.at=dt.toISOString()});
  d.payments.sort(function(a,b){return a.at<b.at?-1:1}).forEach(function(p,i){p.id=i+1;p.no="INV-"+("0000"+(i+1)).slice(-4)});
  d.seq.p=d.payments.length;
  // kunjungan 30 hari
  var vid=0;
  d.members.forEach(function(m){
    var freq=0.25+R()*0.5;
    for(var o=-30;o<=-1;o++){var day=addDays(t,o);if(day<m.start||day>m.end||m.id>27&&m.id!==30)continue;if(R()<freq){var dt=P(day);dt.setHours(ri(6,20),ri(0,59));d.visits.push({id:++vid,mid:m.id,at:dt.toISOString()})}}
  });
  [[2,40],[3,75],[4,20]].forEach(function(x){d.visits.push({id:++vid,mid:x[0],at:new Date(Date.now()-x[1]*60000).toISOString()})});
  d.seq.v=vid;
  // booking: masa lalu (hadir/tidak) dan 3 hari ke depan
  var bid=0;
  function addB(m,s,date,st){d.bookings.push({id:++bid,mid:m,sid:s,date:date,status:st,at:new Date(Date.now()-bid*1000).toISOString()})}
  function valid(m,date){return date>=m.start&&date<=m.end&&!(m.frozen&&m.frozen.since<=date)}
  for(var o2=-7;o2<=3;o2++){
    var date=addDays(t,o2),dw=P(date).getDay();
    d.sessions.filter(function(s){return s.dow===dw}).forEach(function(s){
      var pool=d.members.filter(function(m){return m.id>2&&valid(m,date)});
      var want=Math.min(pool.length,Math.max(2,Math.round(s.cap*(0.35+R()*0.45))));
      pool=pool.sort(function(){return R()-.5}).slice(0,want);
      pool.forEach(function(m){addB(m.id,s.id,date,o2<0?(R()<0.85?"attended":"noshow"):"booked")});
    });
  }
  // kelas penuh + daftar tunggu: instans pertama zumba dan spinning (yang belum lewat)
  var cap=d.classes;
  [2,4].forEach(function(cid){
    for(var o3=0;o3<=7;o3++){
      var date=addDays(t,o3),dw=P(date).getDay(),done=false;
      d.sessions.filter(function(s){return s.classId===cid&&s.dow===dw}).forEach(function(s){
        if(done)return;var st=P(date);var a=s.time.split(":");st.setHours(+a[0],+a[1]);if(st<new Date())return;
        d.bookings=d.bookings.filter(function(b){return !(b.sid===s.id&&b.date===date)});
        var pool=d.members.filter(function(m){return m.id>2&&valid(m,date)});
        pool.slice(0,s.cap).forEach(function(m){addB(m.id,s.id,date,"booked")});
        pool.slice(s.cap,s.cap+2).forEach(function(m){addB(m.id,s.id,date,"wait")});
        done=true;
      });
      if(done)break;
    }
  });
  // booking untuk anggota demo GYM-0001 (kelas dengan tempat)
  var added=0;
  for(var o4=1;o4<=6&&added<2;o4++){
    var date=addDays(t,o4),dw=P(date).getDay();
    d.sessions.filter(function(s){return s.dow===dw&&(s.classId===1||s.classId===3||s.classId===7)}).forEach(function(s){
      if(added>=2)return;
      var c=d.bookings.filter(function(b){return b.sid===s.id&&b.date===date&&b.status==="booked"}).length;
      if(c<s.cap-2){addB(1,s.id,date,"booked");added++}
    });
  }
  d.seq.b=bid;
  // catatan latihan GYM-0001, 2 dan 5
  var wid=0,types=["Kekuatan","Kardio","Kelas grup","Fleksibilitas"];
  [[1,84.5],[2,71],[5,66]].forEach(function(x){
    for(var w=7;w>=0;w--){d.workouts.push({id:++wid,mid:x[0],date:addDays(t,-w*6-1),weight:Math.round((x[1]-(7-w)*0.55+(R()-.5)*0.6)*10)/10,type:types[(w+x[0])%4],min:ri(35,75),note:w%3===0?"Terasa lebih ringan":""})}
  });
  d.seq.w=wid;
  d.notifs.push({id:1,mid:1,at:nowIso(),text:"Selamat datang di Kinetik Fit Center. Kartu anggota Anda siap dicetak."});d.seq.n=1;
  return d;
}

/* ---------- normalisasi: bekukan otomatis selesai ---------- */
function normalize(){
  var t=today(),ch=false;
  db.members.forEach(function(m){
    if(m.frozen){var left=FREEZE_MAX-(m.freezeDays||0);if(diff(m.frozen.since,t)>=left){resume(m,m.frozen.since,addDays(m.frozen.since,left));ch=true}}
  });
  if(ch)save();
}
function resume(m,since,until){
  var days=Math.max(0,diff(since,until));days=Math.min(days,FREEZE_MAX-(m.freezeDays||0));
  m.end=addDays(m.end,days);m.freezeDays=(m.freezeDays||0)+days;m.frozen=null;
}

/* ---------- aturan keanggotaan ---------- */
function mById(id){for(var i=0;i<db.members.length;i++)if(db.members[i].id===id)return db.members[i];return null}
function plan(id){for(var i=0;i<db.plans.length;i++)if(db.plans[i].id===id)return db.plans[i];return null}
function cls(id){for(var i=0;i<db.classes.length;i++)if(db.classes[i].id===id)return db.classes[i];return null}
function coach(id){for(var i=0;i<db.coaches.length;i++)if(db.coaches[i].id===id)return db.coaches[i];return null}
function liveSessions(){return db.sessions.filter(function(s){return !s.removed})}
function liveClasses(){return db.classes.filter(function(c){return !c.removed})}
function sess(id){for(var i=0;i<db.sessions.length;i++)if(db.sessions[i].id===id)return db.sessions[i];return null}
function remaining(m){return diff(today(),m.end)}
// kode: frozen, notyet, expired, soon, active
function mState(m){var t=today();if(m.frozen)return"frozen";if(m.end<t)return"expired";if(m.start>t)return"notyet";if(diff(t,m.end)<=7)return"soon";return"active"}
var STL={frozen:["Dibekukan","bl"],expired:["Kedaluwarsa","er"],notyet:["Belum mulai","mt"],soon:["Segera habis","wr"],active:["Aktif","ok"]};
function memberNoFromInput(s){s=String(s||"").trim().toUpperCase().replace(/\s+/g,"");var x=/^(?:GYM-?)?(\d{1,5})$/.exec(s);if(x)s="GYM-"+("0000"+x[1]).slice(-4);return s}
function memberByNo(s){s=memberNoFromInput(s);for(var i=0;i<db.members.length;i++)if(db.members[i].no===s)return db.members[i];return null}
function memberByPhone(p){p=normPhone(p);for(var i=0;i<db.members.length;i++)if(normPhone(db.members[i].phone)===p)return db.members[i];return null}
function findMembers(q){
  q=String(q||"").trim().toLowerCase();if(!q)return[];
  var dq=q.replace(/\D/g,"");
  return db.members.filter(function(m){return m.no.toLowerCase().indexOf(q)>-1||m.name.toLowerCase().indexOf(q)>-1||(dq.length>=3&&normPhone(m.phone).indexOf(dq)>-1)||(/^\d{1,5}$/.test(q)&&m.no==="GYM-"+("0000"+q).slice(-4))}).slice(0,12);
}

/* promo: hasil {ok,msg,disc,promo} */
function calcPromo(code,pl,isNew){
  code=String(code||"").trim().toUpperCase();
  if(!code)return{ok:true,disc:0,promo:null,msg:""};
  var p=null;db.promos.forEach(function(x){if(x.code===code)p=x});
  if(!p)return{ok:false,disc:0,msg:"Kode promo tidak dikenal."};
  if(!p.active)return{ok:false,disc:0,msg:"Kode promo "+code+" sudah tidak aktif."};
  if(p.max&&p.used>=p.max)return{ok:false,disc:0,msg:"Kuota kode "+code+" sudah habis."};
  if(pl.months<p.minMonths)return{ok:false,disc:0,msg:"Kode "+code+" berlaku untuk paket minimal "+p.minMonths+" bulan."};
  var disc=p.type==="pct"?Math.round(pl.price*p.val/100):Math.min(p.val,pl.price);
  return{ok:true,disc:disc,promo:p,msg:"Kode "+code+" dipakai: potongan "+rp(disc)+"."};
}
function addPayment(o){var id=nid("p");var p={id:id,no:"INV-"+("0000"+id).slice(-4),at:nowIso(),mid:o.mid||0,name:o.name||"Tamu",kind:o.kind,label:o.label,amount:o.amount,disc:o.disc||0,promo:o.promo||"",method:o.method};db.payments.push(p);return p}

function renewDates(m,pl){var start=mState(m)==='expired'?today():addDays(m.end,1);return{start:start,end:addDays(addMonths(start,pl.months),-1)}}
/* perpanjangan; mengembalikan {ok,msg,pay,end} */
function renew(m,pl,code,method){
  if(m.frozen)return{ok:false,msg:"Keanggotaan sedang dibekukan. Aktifkan kembali dulu sebelum perpanjang."};
  var pr=calcPromo(code,pl,false);if(!pr.ok)return pr;
  var rd=renewDates(m,pl),end=rd.end;
  if(mState(m)==="expired"){m.start=rd.start;m.freezeDays=0}
  m.end=end;m.planId=pl.id;
  if(pr.promo)pr.promo.used++;
  var pay=addPayment({mid:m.id,name:m.name,kind:"perpanjang",label:"Perpanjang "+pl.name,amount:pl.price-pr.disc,disc:pr.disc,promo:pr.promo?pr.promo.code:"",method:method});
  db.notifs.push({id:nid("n"),mid:m.id,at:nowIso(),text:"Keanggotaan diperpanjang sampai "+fmtDate(end)+"."});
  save();return{ok:true,pay:pay,end:end,msg:"Berhasil diperpanjang sampai "+fmtDate(end)+"."};
}

function freezeMember(m){
  var st=mState(m),pl=plan(m.planId);
  if(m.frozen)return{ok:false,msg:"Sudah dibekukan."};
  if(st==="expired"||st==="notyet")return{ok:false,msg:"Hanya keanggotaan aktif yang bisa dibekukan."};
  if(pl.months<3)return{ok:false,msg:"Pembekuan hanya untuk paket 3 bulan atau tahunan."};
  if((m.freezeDays||0)>=FREEZE_MAX)return{ok:false,msg:"Jatah pembekuan "+FREEZE_MAX+" hari sudah habis."};
  m.frozen={since:today()};
  var n=0;db.bookings.forEach(function(b){if(b.mid===m.id&&(b.status==="booked"||b.status==="wait")&&b.date>=today()){b.status="cancelled";n++}});
  save();return{ok:true,msg:"Keanggotaan dibekukan."+(n?" "+n+" booking dibatalkan.":"")};
}
function unfreezeMember(m){
  if(!m.frozen)return{ok:false,msg:"Tidak sedang dibekukan."};
  var since=m.frozen.since,days0=m.freezeDays||0;resume(m,since,today());save();
  return{ok:true,msg:"Keanggotaan aktif kembali. Masa aktif diperpanjang "+((m.freezeDays||0)-days0)+" hari, sampai "+fmtDate(m.end)+"."};
}

/* ---------- kelas dan booking ---------- */
function startOf(date,time){var d=P(date),a=time.split(":");d.setHours(+a[0],+a[1],0,0);return d}
function endOf(date,s){var d=startOf(date,s.time);d.setMinutes(d.getMinutes()+(cls(s.classId)||{dur:60}).dur);return d}
function bookingsOf(sid,date,st){return db.bookings.filter(function(b){return b.sid===sid&&b.date===date&&(st?b.status===st:(b.status==="booked"||b.status==="wait"))}).sort(function(a,b){return a.id-b.id})}
function booked(sid,date){return db.bookings.filter(function(b){return b.sid===sid&&b.date===date&&(b.status==="booked"||b.status==="attended"||b.status==="noshow")}).length}
function waitN(sid,date){return db.bookings.filter(function(b){return b.sid===sid&&b.date===date&&b.status==="wait"}).length}
function myBooking(mid,sid,date){for(var i=0;i<db.bookings.length;i++){var b=db.bookings[i];if(b.mid===mid&&b.sid===sid&&b.date===date&&(b.status==="booked"||b.status==="wait"||b.status==="attended"))return b}return null}
function dayInstances(date){var dw=P(date).getDay();return db.sessions.filter(function(s){return s.dow===dw&&!s.removed}).sort(function(a,b){return a.time<b.time?-1:a.time>b.time?1:a.id-b.id})}
function memberValidOn(m,date){return date>=m.start&&date<=m.end&&!m.frozen}
function bookClass(mid,sid,date){
  var m=mById(mid),s=sess(sid);if(!m||!s)return{ok:false,msg:"Data tidak ditemukan."};
  if(startOf(date,s.time)<=new Date())return{ok:false,msg:"Kelas ini sudah dimulai atau lewat."};
  if(m.frozen)return{ok:false,msg:"Keanggotaan dibekukan. Aktifkan dulu untuk booking."};
  if(!memberValidOn(m,date))return{ok:false,msg:date<m.start?"Keanggotaan baru mulai "+fmtDate(m.start)+".":"Keanggotaan Anda berakhir "+fmtDate(m.end)+", sebelum kelas ini. Perpanjang dulu."};
  if(myBooking(mid,sid,date))return{ok:false,msg:"Anda sudah terdaftar di kelas ini."};
  // bentrok jadwal
  var c=cls(s.classId),a1=startOf(date,s.time),b1=endOf(date,s),clash=null;
  db.bookings.forEach(function(b){if(b.mid!==mid||b.date!==date||(b.status!=="booked"&&b.status!=="wait"))return;var o=sess(b.sid);if(!o)return;if(startOf(date,o.time)<b1&&endOf(date,o)>a1)clash=o});
  if(clash)return{ok:false,msg:"Bentrok dengan "+cls(clash.classId).name+" pukul "+clash.time.replace(":",".")+"."};
  var full=booked(sid,date)>=s.cap;
  var b={id:nid("b"),mid:mid,sid:sid,date:date,status:full?"wait":"booked",at:nowIso()};db.bookings.push(b);save();
  if(full)return{ok:true,status:"wait",msg:"Kelas penuh. Anda masuk daftar tunggu urutan "+waitN(sid,date)+"."};
  return{ok:true,status:"booked",msg:"Booking "+c.name+" berhasil."};
}
function promote(sid,date){
  var s=sess(sid),out=[];if(!s)return out;
  while(booked(sid,date)<s.cap){
    var w=bookingsOf(sid,date,"wait")[0];if(!w)break;
    var m=mById(w.mid);
    if(!m||!memberValidOn(m,date)){w.status="cancelled";continue}
    w.status="booked";out.push(w);
    db.notifs.push({id:nid("n"),mid:w.mid,at:nowIso(),text:"Anda naik dari daftar tunggu: "+cls(s.classId).name+", "+fmtDay(date)+" pukul "+s.time.replace(":",".")+"."});
  }
  return out;
}
function cancelBooking(id,byAdmin){
  var b=null;db.bookings.forEach(function(x){if(x.id===id)b=x});if(!b)return{ok:false,msg:"Booking tidak ditemukan."};
  var s=sess(b.sid);
  if(b.status!=="booked"&&b.status!=="wait")return{ok:false,msg:"Booking ini tidak bisa dibatalkan."};
  if(b.status==="booked"&&!byAdmin&&s&&startOf(b.date,s.time).getTime()-Date.now()<2*3600*1000)return{ok:false,msg:"Pembatalan paling lambat 2 jam sebelum kelas dimulai."};
  var was=b.status;b.status="cancelled";var up=[];
  if(was==="booked")up=promote(b.sid,b.date);
  save();
  return{ok:true,msg:"Booking dibatalkan."+(up.length?" Peserta daftar tunggu naik otomatis.":""),promoted:up.length};
}

/* ---------- check-in ---------- */
function checkIn(m){
  var t=today(),st=mState(m);
  var already=db.visits.filter(function(v){return v.mid===m.id&&dOf(v.at)===t})[0];
  if(st==="expired")return{ok:false,level:"no",title:"Ditolak: masa aktif habis",msg:"Berakhir "+fmtDate(m.end)+" ("+Math.abs(remaining(m))+" hari lalu). Arahkan ke kasir untuk perpanjang."};
  if(st==="frozen")return{ok:false,level:"no",title:"Ditolak: keanggotaan dibekukan",msg:"Dibekukan sejak "+fmtDate(m.frozen.since)+". Aktifkan kembali lewat portal atau kasir."};
  if(st==="notyet")return{ok:false,level:"no",title:"Ditolak: belum mulai",msg:"Keanggotaan baru berlaku "+fmtDate(m.start)+"."};
  if(already)return{ok:false,level:"wr",title:"Sudah check-in hari ini",msg:"Check-in pertama pukul "+hm(already.at)+". Tidak dicatat dua kali."};
  db.visits.push({id:nid("v"),mid:m.id,at:nowIso()});
  var att=0,cn="";
  db.bookings.forEach(function(b){if(b.mid!==m.id||b.date!==t||b.status!=="booked")return;var s=sess(b.sid);if(!s)return;var diffMin=(startOf(t,s.time)-new Date())/60000;if(diffMin<=180&&diffMin>=-90){b.status="attended";att++;cn=cls(s.classId).name}});
  save();
  var left=remaining(m);
  return{ok:true,level:"ok",title:"Check-in berhasil",msg:"Sisa masa aktif "+left+" hari"+(left<=7?" (segera habis)":"")+"."+(att?" Booking "+cn+" ditandai hadir.":"")};
}

/* ---------- kode batang Code 39 ---------- */
var C39={"0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn","A":"wnnnnwnnw","B":"nnwnnwnnw","C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn","F":"nnwnwwnnn","G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn","K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww","O":"wnnnwnnwn","P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn","S":"nnwnnnwwn","T":"nnnnwnwwn","U":"wwnnnnnnw","V":"nwwnnnnnw","W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn","Z":"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn"};
function barcode(text){
  var s="*"+String(text).toUpperCase().replace(/[^0-9A-Z\-\. ]/g,"")+"*",x=0,out="";
  for(var i=0;i<s.length;i++){
    var p=C39[s[i]];if(!p)continue;
    for(var j=0;j<9;j++){var w=p[j]==="w"?3:1;if(j%2===0)out+='<rect x="'+x+'" y="0" width="'+w+'" height="40"/>';x+=w}
    x+=1;
  }
  return '<svg viewBox="0 0 '+x+' 40" preserveAspectRatio="none" role="img" aria-label="Kode batang '+esc(text)+'" fill="#111">'+out+'</svg>';
}

/* ---------- CSV ---------- */
function csvCell(v){v=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(v)&&!/^\d{4}-\d\d-\d\d/.test(v)&&!/^-?\d+(\.\d+)?$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function downloadCsv(name,rows){
  var txt="﻿"+rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n");
  var blob=new Blob([txt],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
}
