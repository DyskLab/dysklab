"use strict";
/* Kala Salon & Barber: demo website dan booking. Data di localStorage, semua nama dan nomor fiktif. */
var KEY="salon-booking.v1",SESS="salon-booking.admin",STEP=30,PPH=68;
var DAYS=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],DS=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
var MON=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var ST={booked:"Terjadwal",hadir:"Hadir",selesai:"Selesai",tidak_hadir:"Tidak hadir",batal:"Batal"};
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function rp(n){n=Math.round(n||0);return(n<0?"-":"")+"Rp"+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function ds(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function pd(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function addD(s,n){var d=pd(s);d.setDate(d.getDate()+n);return ds(d)}
function dow(s){return pd(s).getDay()}
function hm(m){return pad(Math.floor(m/60))+":"+pad(m%60)}
function pm(t){var p=String(t).split(":");return(+p[0])*60+(+p[1])}
function today(){return ds(new Date())}
function nowMin(){var d=new Date();return d.getHours()*60+d.getMinutes()}
function stampOf(s,m){var d=pd(s);d.setMinutes(m);return d.getTime()}
function fdate(s){var d=pd(s);return DAYS[d.getDay()]+", "+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}
function sdate(s){var d=pd(s);return DS[d.getDay()]+", "+d.getDate()+" "+MON[d.getMonth()].slice(0,3)}
function dur(m){return m<60?m+" mnt":Math.floor(m/60)+" jam"+(m%60?" "+m%60+" mnt":"")}
function isDate(s){return/^\d{4}-\d{2}-\d{2}$/.test(s||"")&&ds(pd(s))===s}
function norm(p){var d=String(p||"").replace(/\D/g,"");if(d.indexOf("62")===0)d="0"+d.slice(2);else if(d.charAt(0)==="8")d="0"+d;return d}
function fphone(p){p=norm(p);return p.length>8?p.slice(0,4)+"-"+p.slice(4,8)+"-"+p.slice(8):p}
function validPhone(p){var n=norm(p);return n.charAt(0)==="0"&&n.length>=9&&n.length<=14}
var toastT;function toast(m,bad){var t=$("toast");t.textContent=m;t.className="on"+(bad?" bad":"");clearTimeout(toastT);toastT=setTimeout(function(){t.className=""},2800)}

/* ===== data ===== */
var db;
function load(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.v===1&&d.bookings)return d}}catch(e){}var s=seed();db=s;save();return s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast("Data tidak bisa disimpan di peramban ini",true)}}
function wk(on,s,e){return{on:on,s:s,e:e}}
function hoursOf(days,s,e){var h=[];for(var i=0;i<7;i++)h.push(days.indexOf(i)>=0?wk(true,s,e):wk(false,"10:00","19:00"));return h}
function seed(){
 db={v:1,seq:1,salon:{name:"Kala Salon & Barber",addr:"Jl. Contoh No. 12, Kota Contoh",tel:"0812-0000-0101",cancelHours:3,leadMin:60,windowDays:30,pin:"2468",ptsVisit:10,ptsRedeem:100,redeemValue:30000},
 services:[
  {id:"s1",name:"Potong Rambut Wanita",cat:"Rambut",dur:45,price:90000,active:true,desc:"Konsultasi bentuk, keramas, potong dan rapikan."},
  {id:"s2",name:"Potong Rambut Pria",cat:"Barber",dur:30,price:60000,active:true,desc:"Potong klasik atau modern dengan finishing rapi."},
  {id:"s3",name:"Cukur Jenggot dan Kumis",cat:"Barber",dur:15,price:45000,active:true,desc:"Handuk hangat, cukur dan bentuk garis."},
  {id:"s4",name:"Creambath",cat:"Perawatan",dur:45,price:85000,active:true,desc:"Pijat kepala dan masker nutrisi rambut."},
  {id:"s5",name:"Hair Spa",cat:"Perawatan",dur:60,price:150000,active:true,desc:"Perawatan intensif untuk rambut kering atau rusak."},
  {id:"s6",name:"Pewarnaan Rambut",cat:"Warna",dur:120,price:350000,active:true,desc:"Satu warna penuh. Harga untuk panjang sebahu."},
  {id:"s7",name:"Highlight",cat:"Warna",dur:150,price:450000,active:true,desc:"Warna per helai. Termasuk toner."},
  {id:"s8",name:"Smoothing",cat:"Perawatan",dur:180,price:600000,active:true,desc:"Meluruskan dan melembutkan rambut."},
  {id:"s9",name:"Blow dan Styling",cat:"Rambut",dur:30,price:70000,active:true,desc:"Blow kering dan tata sesuai acara."},
  {id:"s10",name:"Fade Cut",cat:"Barber",dur:45,price:75000,active:true,desc:"Gradasi rapi di samping dan belakang."},
  {id:"s11",name:"Pijat Kepala",cat:"Perawatan",dur:30,price:50000,active:true,desc:"Pijat relaksasi kepala dan bahu."},
  {id:"s12",name:"Cuci dan Blow",cat:"Rambut",dur:30,price:50000,active:true,desc:"Keramas, pijat ringan dan blow."}],
 stylists:[
  {id:"y1",name:"Raisa Putri",role:"Senior Stylist",bio:"Delapan tahun menata rambut panjang dan potongan wanita. Suka bentuk yang mudah dirawat sendiri.",look:"panjang",hue:"#8a2f5f",skin:"#e8b894",hair:"#3a2018",active:true,skills:["s1","s4","s5","s6","s7","s8","s9","s12"],hours:hoursOf([2,3,4,5,6,0],"10:00","19:00")},
  {id:"y2",name:"Dimas Aryo",role:"Barber",bio:"Spesialis fade dan potongan pria klasik. Rapi sampai garis cukur.",look:"jenggot",hue:"#1f5f6b",skin:"#d9a47c",hair:"#1d1412",active:true,skills:["s2","s3","s10","s11","s12"],hours:hoursOf([1,2,3,4,5,6],"09:00","18:00")},
  {id:"y3",name:"Nadia Lestari",role:"Colorist",bio:"Fokus warna dan perawatan. Selalu mulai dengan tes helai agar hasil sesuai.",look:"sanggul",hue:"#9a5b13",skin:"#f0c8a4",hair:"#6b3a1d",active:true,skills:["s1","s5","s6","s7","s8","s9"],hours:(function(){var h=hoursOf([1,2,3,4,5],"10:00","19:00");h[6]=wk(true,"10:00","17:00");return h})()},
  {id:"y4",name:"Bagas Pratama",role:"Barber dan Stylist",bio:"Potong pria dan anak, cukur dan pijat kepala. Buka sampai malam.",look:"pendek",hue:"#3b5b2a",skin:"#c98f66",hair:"#17100d",active:true,skills:["s1","s2","s3","s10","s11","s12"],hours:hoursOf([3,4,5,6,0],"11:00","20:00")}],
 holidays:[{id:"h1",date:addD(today(),9),label:"Libur contoh (semua stylist)",sid:""},{id:"h2",date:addD(today(),4),label:"Cuti",sid:"y2"}],
 vouchers:[{code:"HEMAT10",type:"pct",value:10,min:100000,active:true,used:3,desc:"Diskon 10% untuk belanja mulai Rp100.000"},{code:"BARU20K",type:"nom",value:20000,min:80000,active:true,used:1,desc:"Potongan Rp20.000 untuk belanja mulai Rp80.000"},{code:"LEBARAN",type:"pct",value:15,min:0,active:false,used:0,desc:"Promo musiman, sedang nonaktif"}],
 customers:[],bookings:[]};
 var names=["Sari Contoh","Budi Fiktif","Maya Sample","Rudi Contoh","Lina Demo","Andi Fiktif","Tia Contoh","Joko Sample"];
 names.forEach(function(n,i){db.customers.push({phone:"08120000"+String(10101+i).slice(1),name:n,points:0})});
 var seedv=20260,rnd=function(n){seedv=(Math.imul(seedv,1664525)+1013904223)>>>0;return(seedv>>>8)%n};
 var t0=today();
 for(var off=-21;off<=6;off++){var date=addD(t0,off);
  db.stylists.forEach(function(y){var w=workHours(y.id,date);if(!w)return;var t=w[0]+STEP*rnd(3),n=0,max=off<0?4:2;
   while(n<max&&t<w[1]){var cap=y.skills.slice(),pick=[cap[rnd(cap.length)]];if(rnd(3)===0){var x=cap[rnd(cap.length)];if(pick.indexOf(x)<0)pick.push(x)}
    var d=0;pick.forEach(function(id){d+=svc(id).dur});if(t+d>w[1])break;
    var c=db.customers[rnd(db.customers.length)];
    var b=mkBooking({date:date,start:t,sid:y.id,svc:pick,name:c.name,phone:c.phone,source:rnd(4)===0?"walkin":"online",voucher:""});
    var r=rnd(20),past=off<0||(off===0&&b.start+b.dur<nowMin());
    if(past)setStatus(b,r<2?"tidak_hadir":r<5?"batal":"selesai");else if(off===0&&b.start<=nowMin())setStatus(b,"hadir");
    t+=Math.ceil(d/STEP)*STEP+STEP*rnd(3);n++}})}
 db.customers[0].points+=100;
 return db}
function svc(id){return db.services.filter(function(s){return s.id===id})[0]}
function sty(id){return db.stylists.filter(function(s){return s.id===id})[0]}
function bkOf(id){return db.bookings.filter(function(b){return b.id===id})[0]}
function cust(p){p=norm(p);return db.customers.filter(function(c){return c.phone===p})[0]}
function vch(c){c=String(c||"").trim().toUpperCase();return db.vouchers.filter(function(v){return v.code===c})[0]}
function upCust(phone,name){var c=cust(phone);if(!c){c={phone:norm(phone),name:name,points:0};db.customers.push(c)}return c}
function newCode(){var A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",c;do{c="SB-";for(var i=0;i<5;i++)c+=A.charAt(Math.floor(Math.random()*A.length))}while(db.bookings.some(function(b){return b.code===c}));return c}
function vOk(v,sub){if(!v)return{ok:false,msg:"Kode voucher tidak dikenal"};if(!v.active)return{ok:false,msg:"Voucher sedang tidak aktif"};if(sub<v.min)return{ok:false,msg:"Voucher berlaku untuk belanja mulai "+rp(v.min)};return{ok:true,msg:"Voucher dipakai"}}
function pricing(sub,code,redeem){var vd=0,vc="",v=code?vch(code):null;if(v&&vOk(v,sub).ok){vd=v.type==="pct"?Math.round(sub*v.value/100):Math.min(v.value,sub);vc=v.code}
 var rd=redeem?Math.min(db.salon.redeemValue,sub-vd):0;return{sub:sub,vd:vd,rd:rd,vc:vc,total:sub-vd-rd}}
function mkBooking(o){var items=o.svc.map(function(id){var s=svc(id);return{id:s.id,name:s.name,price:s.price,dur:s.dur}});
 var d=0,sub=0;items.forEach(function(i){d+=i.dur;sub+=i.price});var pr=pricing(sub,o.voucher,o.redeem);
 var b={id:"b"+(db.seq++),code:newCode(),date:o.date,start:o.start,dur:d,sid:o.sid,items:items,sub:sub,vd:pr.vd,rd:pr.rd,total:pr.total,voucher:pr.vc,redeem:pr.rd>0,name:o.name,phone:norm(o.phone),note:o.note||"",source:o.source||"online",status:"booked",created:Date.now(),pts:0};
 db.bookings.push(b);var c=upCust(b.phone,b.name);if(b.redeem)c.points=Math.max(0,c.points-db.salon.ptsRedeem);
 if(b.voucher){var v=vch(b.voucher);if(v)v.used++}return b}
function setStatus(b,s){var prev=b.status;if(prev===s||prev==="batal")return;b.status=s;var c=cust(b.phone);
 if(prev==="selesai"&&b.pts){if(c)c.points=Math.max(0,c.points-b.pts);b.pts=0}
 if(s==="selesai"&&!b.pts){b.pts=db.salon.ptsVisit;c=upCust(b.phone,b.name);c.points+=b.pts}
 if(s==="batal"){if(b.voucher){var v=vch(b.voucher);if(v&&v.used>0)v.used--}if(b.redeem&&c)c.points+=db.salon.ptsRedeem}}

/* ===== ketersediaan ===== */
function holidayFor(date,sid){return db.holidays.filter(function(h){return h.date===date&&(!h.sid||h.sid===sid)})[0]}
function workHours(sid,date){var y=sty(sid);if(!y||!y.active||holidayFor(date,sid))return null;var w=y.hours[dow(date)];return w&&w.on?[pm(w.s),pm(w.e)]:null}
function freeAt(sid,date,start,d,skip){var w=workHours(sid,date);if(!w||start<w[0]||start+d>w[1])return false;
 return!db.bookings.some(function(b){return b.sid===sid&&b.date===date&&b.status!=="batal"&&b.id!==skip&&start<b.start+b.dur&&b.start<start+d})}
function slotsFor(sid,date,d,o){o=o||{};var w=workHours(sid,date),out=[];if(!w)return out;var td=today();if(!o.admin&&date<td)return out;
 for(var t=w[0];t+d<=w[1];t+=STEP){if(!o.admin&&date===td&&t<nowMin()+db.salon.leadMin)continue;if(freeAt(sid,date,t,d,o.skip))out.push(t)}return out}
function capable(y,ids){return y.active&&ids.every(function(id){return y.skills.indexOf(id)>=0})}
function capList(ids){return db.stylists.filter(function(y){return capable(y,ids)})}
function slotsAny(ids,date,d,o){var m={};capList(ids).forEach(function(y){slotsFor(y.id,date,d,o).forEach(function(t){m[t]=1})});return Object.keys(m).map(Number).sort(function(a,b){return a-b})}
function pickStylist(ids,date,start,d){var l=capList(ids).filter(function(y){return freeAt(y.id,date,start,d)});
 l.sort(function(a,b){return load1(a.id,date)-load1(b.id,date)});return l[0]||null}
function load1(sid,date){return db.bookings.filter(function(b){return b.sid===sid&&b.date===date&&b.status!=="batal"}).length}
function canChange(b){if(b.status!=="booked")return{ok:false,msg:"Booking berstatus "+ST[b.status].toLowerCase()+" dan tidak bisa diubah."};
 var left=stampOf(b.date,b.start)-Date.now();if(left<db.salon.cancelHours*3600000)return{ok:false,msg:"Perubahan hanya bisa sampai "+db.salon.cancelHours+" jam sebelum jadwal. Hubungi salon di "+db.salon.tel+"."};return{ok:true}}

/* ===== foto dan avatar ===== */
var IC={Rambut:'<path d="M8 17L18 4M16 17L6 4"/><circle cx="6.5" cy="19" r="2.5"/><circle cx="17.5" cy="19" r="2.5"/>',Barber:'<rect x="3" y="7" width="18" height="6" rx="1.5"/><path d="M6 13v4M9 13v4M12 13v4M15 13v4M18 13v4"/>',Warna:'<path d="M12 3S5 11 5 15a7 7 0 0014 0c0-4-7-12-7-12z"/>',Perawatan:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'};
function icon(c,sz){return'<svg width="'+(sz||24)+'" height="'+(sz||24)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[c]||IC.Perawatan)+'</svg>'}
function initials(n){var p=String(n||"").trim().split(/\s+/);return((p[0]||"?").charAt(0)+(p.length>1?p[p.length-1].charAt(0):"")).toUpperCase()}
function avatar(y,sz){return'<span class="av" role="img" aria-label="Inisial '+esc(y.name)+'" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.36)+'px;--h:'+esc(y.hue||"#8a2f5f")+'">'+esc(initials(y.name))+'</span>'}
var PIC={s1:"gunting",s2:"fade",s3:"cukur",s4:"krim",s5:"spa",s6:"warna",s7:"highlight",s8:"smoothing",s9:"blow",s10:"fade",s11:"salon-2",s12:"cuci"},PICC={Rambut:"gunting",Barber:"cukur",Warna:"warna",Perawatan:"krim"},PICALT={gunting:"Gunting rambut profesional",cukur:"Set cukur dengan kuas dan pisau cukur",krim:"Botol sampo untuk perawatan rambut",spa:"Pengering rambut berdiri di salon",warna:"Rak cat rambut dan botol perawatan di salon",highlight:"Tutup kepala untuk teknik highlight",smoothing:"Rambut lurus dengan catok",blow:"Sisir bulat untuk blow dan styling",fade:"Mesin cukur rambut elektrik","salon-3":"Kursi barber klasik dan cermin","salon-2":"Deretan kursi stylist dan cermin di salon","cuci":"Pajangan pengering rambut warna-warni"};
function svcPic(s,cls){var k=PIC[s.id]||PICC[s.cat]||"gunting";return'<img class="'+(cls||"sp")+'" src="img/'+k+'.jpg" alt="'+esc(PICALT[k]||"")+'" width="400" height="300" loading="lazy">'}
function hero(){return'<div class="collage"><p class="vt" aria-hidden="true">Salon<span class="x"> &amp; barbershop</span></p><figure class="p1"><img src="img/hero.jpg" alt="Ruang salon dengan kursi kulit cokelat, cermin dan lantai kayu" width="1100" height="618" fetchpriority="high"><figcaption><b>01</b>Ruang kerja</figcaption></figure><figure class="p2"><img src="img/salon-3.jpg" alt="Kursi barber klasik dan cermin berbingkai kayu" width="600" height="800" fetchpriority="high"><figcaption><b>02</b>Kursi barber</figcaption></figure><figure class="p3"><img src="img/salon-1.jpg" alt="Meja resepsionis kayu di salon" width="800" height="600" loading="lazy"><figcaption><b>03</b>Resepsi</figcaption></figure></div>'}
function gallery(){var g=[["salon-1","Ruang salon dengan meja resepsionis kayu dan cermin","Resepsi","g1",800,600],["salon-3",PICALT["salon-3"],"Kursi barber","g2",600,800],["salon-2","Deretan kursi stylist dan cermin di salon","Stasiun stylist","g3",800,532],["cukur","Set cukur dengan kuas dan pisau cukur","Set cukur","g4",800,600]];return g.map(function(x,i){return'<figure class="'+x[3]+' rv"><div class="im"><img src="img/'+x[0]+'.jpg" alt="'+esc(x[1])+'" width="'+x[4]+'" height="'+x[5]+'" loading="lazy"></div><figcaption><b>0'+(i+1)+'</b>'+x[2]+'</figcaption></figure>'}).join("")}
function logo(){return'<span class="lg" aria-hidden="true">K</span>'}
/* ===== routing ===== */
var bk,cal,rs,mb,cek={code:"",phone:"",id:null,err:""},poin={phone:"",res:null,err:""},armed=null,armT,flt={cat:"Semua"},bl={q:"",st:"",when:"next",n:40},cu={q:""},rep={r:"7"};
function freshBk(){return{step:1,svc:[],sty:"any",date:"",time:null,name:"",phone:"",note:"",voucher:"",redeem:false,done:null,err:""}}
function isAdmin(){try{return sessionStorage.getItem(SESS)==="1"}catch(e){return false}}
function parts(){return location.hash.replace(/^#\/?/,"").split("?")[0].split("/")}
function go(h){if(location.hash===h)render();else location.hash=h}
var curKey="";
function render(keep){var p=parts(),pg=p[0]||"home";var key=p.join("/");if(!db)db=load();
 var adm=pg==="admin";$("top").innerHTML=adm?adminBar():pubBar(pg);$("foot").innerHTML=adm?"":footer();
 var h="";if(pg==="home")h=pHome();else if(pg==="layanan")h=pLayanan();else if(pg==="stylist")h=pStylist();else if(pg==="booking")h=pBooking();else if(pg==="cek")h=pCek();else if(pg==="poin")h=pPoin();else if(pg==="admin")h=pAdmin(p[1]||"kalender");else h='<div class="wrap sec"><div class="none">Halaman tidak ditemukan. <a href="#/">Ke beranda</a></div></div>';
 $("main").innerHTML=h;document.title=(adm?"Panel salon":"Kala Salon & Barber")+" | Contoh website dan booking salon";
 if(!keep&&key!==curKey){window.scrollTo(0,0)}curKey=key;reveal()}
window.addEventListener("hashchange",function(){closeDlg();render()});
var NAV=[["","Beranda"],["layanan","Layanan"],["stylist","Stylist"],["cek","Cek booking"],["poin","Poin dan voucher"]];
function pubBar(pg){var l=NAV.map(function(n){return'<a href="#/'+n[0]+'"'+((pg==="home"?"":pg)===n[0]?' class="on" aria-current="page"':"")+'>'+n[1]+'</a>'}).join("");
 return'<div class="wrap wide bar"><a class="brand" href="#/" aria-label="'+esc(db.salon.name)+', beranda">'+logo()+'<span class="bn">'+brandName()+'</span></a><a class="btn sm" href="#/booking" data-act="newbk">Booking</a><button class="mbtn" data-act="menu" aria-expanded="false" aria-controls="nav">Menu</button><nav class="nav" id="nav" aria-label="Menu utama">'+l+'</nav></div>'}
function brandName(){var p=String(db.salon.name||"").split(/\s+/);return p.length>1?esc(p[0])+"<br>"+esc(p.slice(1).join(" ")):esc(p[0])}
function footer(){var o=db.salon;return'<div class="wrap wide"><div class="ft"><div><div class="wm">'+esc(o.name)+'</div></div><div><h4>Jam buka</h4><p>'+openText()+'</p><p class="muted small">Jadwal tiap stylist bisa berbeda. Jam kosong lengkap ada di halaman booking.</p></div><div><h4>Alamat</h4><p>'+esc(o.addr)+'</p><p>Telepon '+esc(o.tel)+'</p></div><div><h4>Menu</h4><ul><li><a href="#/layanan">Layanan</a></li><li><a href="#/stylist">Stylist</a></li><li><a href="#/booking">Booking</a></li><li><a href="#/cek">Cek booking</a></li><li><a href="#/admin">Panel salon</a> <span class="muted small">(PIN demo 2468)</span></li></ul><p style="margin-top:10px"><button class="btn sm" data-act="reset" data-sure="Tekan lagi untuk reset">Reset data demo</button></p></div><p class="fine">Situs contoh. Semua nama, alamat dan nomor telepon fiktif. Data tersimpan di peramban ini saja. Foto: Wikimedia Commons, <a href="credits.json" target="_blank" rel="noopener">lihat kredit</a>.</p></div></div>'}
function openText(){var lo=1440,hi=0;db.stylists.forEach(function(y){if(!y.active)return;y.hours.forEach(function(w){if(w.on){lo=Math.min(lo,pm(w.s));hi=Math.max(hi,pm(w.e))}})});return lo<hi?hm(lo)+" - "+hm(hi):"hubungi salon"}

/* ===== halaman publik ===== */
function svcList(list,pick){var f=list[0];return'<div class="pl-wrap"><ul class="pl">'+list.map(function(s,i){var k=PIC[s.id]||PICC[s.cat]||"gunting";return'<li class="pl-i rv"><button class="pl-b" data-act="addsvc" data-id="'+s.id+'" data-pic="'+k+'" data-nm="'+esc(s.name)+'" aria-label="Pesan '+esc(s.name)+', '+dur(s.dur)+', '+rp(s.price)+'"><span class="pl-n">'+pad(i+1)+'</span><span class="pl-t"><span class="pl-name">'+esc(s.name)+'</span><span class="pl-m">'+esc(s.cat)+' &middot; '+dur(s.dur)+'</span></span><span class="pl-dots" aria-hidden="true"></span><span class="pl-p">'+rp(s.price)+'</span></button><div class="pl-x"><p class="pl-d">'+esc(s.desc)+'</p>'+svcPic(s,"pl-img")+'</div></li>'}).join("")+'</ul>'+(f?plFig(f):"")+'</div>'}
function plFig(s){var k=PIC[s.id]||PICC[s.cat]||"gunting";return'<figure class="pl-fig" aria-hidden="true"><div class="fr"><img id="plImg" src="img/'+k+'.jpg" alt="" width="400" height="500"></div><figcaption><span id="plCap">'+esc(s.name)+'</span><span>Klik untuk memesan</span></figcaption></figure>'}
function styCard(y,full){var names=y.skills.map(function(id){var s=svc(id);return s&&s.active?'<span class="chip">'+esc(s.name)+'</span>':""}).join("");
 var out='<div class="card"><div class="sty">'+avatar(y,full?88:72)+'<div><h3 style="margin:0">'+esc(y.name)+'</h3><div class="muted">'+esc(y.role)+'</div></div></div><p class="small">'+esc(y.bio)+'</p><div>'+names+'</div>';
 if(full){out+='<table class="sched" aria-label="Jadwal kerja '+esc(y.name)+'">'+[1,2,3,4,5,6,0].map(function(d){var w=y.hours[d];return'<tr><td>'+DAYS[d]+'</td><td>'+(w.on?w.s+" - "+w.e:"Libur")+'</td></tr>'}).join("")+'</table>';
  var lv=db.holidays.filter(function(h){return h.date>=today()&&(!h.sid||h.sid===y.id)}).sort(function(a,b){return a.date<b.date?-1:1}).slice(0,3);
  if(lv.length)out+='<p class="small muted">Libur mendatang: '+lv.map(function(h){return sdate(h.date)}).join(", ")+'</p>'}
 return out+'<p style="margin:10px 0 0"><button class="btn sm pri" data-act="pickSty" data-id="'+y.id+'">Pesan dengan '+esc(y.name.split(" ")[0])+'</button></p></div>'}
function styRow(y){var names=y.skills.map(function(id){return svc(id)}).filter(function(s){return s&&s.active}).map(function(s){return esc(s.name)}),more=names.length>4?names.length-4:0;
 return'<li class="rv"><span class="sr-i" aria-hidden="true">'+esc(initials(y.name))+'</span><div><h3>'+esc(y.name)+'</h3><p class="sr-role">'+esc(y.role)+'</p><p class="sr-sk">'+names.slice(0,4).join(" &middot; ")+(more?" &middot; +"+more+" lainnya":"")+'</p></div><button class="lk" data-act="pickSty" data-id="'+y.id+'">Pesan dengan '+esc(y.name.split(" ")[0])+' &rarr;</button></li>'}
function promoCards(){var l=db.vouchers.filter(function(v){return v.active});if(!l.length)return'<div class="none">Belum ada promo aktif.</div>';
 return'<ul class="promos">'+l.map(function(v){return'<li class="rv"><div><span class="code">'+esc(v.code)+'</span><p>'+esc(v.desc)+'</p></div><button class="lk" data-act="useV" data-code="'+esc(v.code)+'">Pakai &rarr;</button></li>'}).join("")+'</ul>'}
function pHome(){var act=db.services.filter(function(s){return s.active}).slice(0,6),ys=db.stylists.filter(function(y){return y.active});
 return'<div class="wrap wide"><section class="hero" aria-label="Pembuka"><div class="hero-grid"><h1 class="h-title"><span class="t1">Rapi</span><span class="t2">tanpa antre</span></h1>'+hero()+'<div class="h-copy"><p class="lead">Pilih layanan, pilih stylist, lalu pilih jam kosong. Kode booking langsung terbit dan bisa diubah sampai '+db.salon.cancelHours+' jam sebelum jadwal.</p><div class="btns"><a class="btn pri" href="#/booking" data-act="newbk">Booking sekarang</a><a class="lk" href="#/layanan">Daftar layanan &rarr;</a></div><span class="idx" aria-hidden="true"><b>01</b> / 02 / 03</span></div></div></section>'
 +'<section class="sec" aria-label="Cara kerja"><div class="notes"><div class="rv"><span class="no">i.</span><div><h3>Jam kosong akurat</h3><p>Dihitung dari jadwal kerja stylist dan booking yang sudah ada.</p></div></div><div class="rv"><span class="no">ii.</span><div><h3>Beberapa layanan sekali datang</h3><p>Potong, creambath dan lainnya dalam satu booking. Durasi dijumlahkan otomatis.</p></div></div><div class="rv"><span class="no">iii.</span><div><h3>Poin tiap kunjungan</h3><p>'+db.salon.ptsVisit+' poin per kunjungan selesai. '+db.salon.ptsRedeem+' poin ditukar potongan '+rp(db.salon.redeemValue)+'.</p></div></div></div></section>'
 +'<section class="sec" id="layanan-home"><div class="sh rv"><span class="no">01</span><h2><span>Daftar harga</span>Layanan</h2><a class="lk" href="#/layanan">Semua layanan &rarr;</a></div>'+svcList(act)+'</section>'
 +'<section class="sec"><div class="sh rv"><span class="no">02</span><h2><span>Tim kami</span>Stylist</h2><a class="lk" href="#/stylist">Profil dan jadwal &rarr;</a></div><ol class="sr">'+ys.map(styRow).join("")+'</ol></section>'
 +'<section class="sec"><div class="sh rv"><span class="no">03</span><h2><span>Ruang</span>Suasana salon</h2></div><div class="gal2">'+gallery()+'</div></section>'
 +'<section class="sec"><figure class="quote rv"><blockquote>Jadwal bisa diubah atau dibatalkan sampai '+db.salon.cancelHours+' jam sebelum booking.</blockquote><figcaption>Kebijakan salon &middot; <a href="#/cek">Cek atau ubah booking</a></figcaption></figure></section>'
 +'<section class="sec"><div class="sh rv"><span class="no">04</span><h2><span>Voucher</span>Promo aktif</h2><a class="lk" href="#/poin">Poin dan voucher &rarr;</a></div>'+promoCards()+'</section></div>'}
function pLayanan(){var cats=["Semua"],l=db.services.filter(function(s){return s.active});l.forEach(function(s){if(cats.indexOf(s.cat)<0)cats.push(s.cat)});if(cats.indexOf(flt.cat)<0)flt.cat="Semua";
 var show=l.filter(function(s){return flt.cat==="Semua"||s.cat===flt.cat});
 return'<div class="wrap wide sec"><span class="eyebrow">Daftar harga</span><h1>Layanan</h1><p class="muted" style="max-width:52ch">Harga dan durasi per layanan. Beberapa layanan bisa digabung dalam satu booking. Arahkan kursor atau fokus ke baris untuk melihat foto.</p><div class="chips" role="group" aria-label="Filter kategori">'+cats.map(function(c){return'<button data-act="cat" data-c="'+esc(c)+'"'+(c===flt.cat?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>'+esc(c)+'</button>'}).join("")+'</div>'+(show.length?svcList(show):'<div class="none">Belum ada layanan.</div>')+'</div>'}
function pStylist(){var l=db.stylists.filter(function(y){return y.active});return'<div class="wrap wide sec"><span class="eyebrow">Tim kami</span><h1>Stylist</h1><p class="muted">Keahlian dan jadwal kerja tiap stylist. Jam yang sudah terisi tidak muncul saat booking.</p>'+(l.length?'<div class="grid c2">'+l.map(function(y){return styCard(y,true)}).join("")+'</div>':'<div class="none">Belum ada stylist.</div>')+'</div>'}

/* ----- booking ----- */
function bkSvc(){return bk.svc.map(svc).filter(Boolean)}
function bkDur(){return bkSvc().reduce(function(a,s){return a+s.dur},0)}
function bkSub(){return bkSvc().reduce(function(a,s){return a+s.price},0)}
function slotsBk(date){var d=bkDur();return bk.sty==="any"?slotsAny(bk.svc,date,d):slotsFor(bk.sty,date,d)}
function dayList(f){var out=[],t=today();for(var i=0;i<db.salon.windowDays;i++){var d=addD(t,i);out.push({date:d,n:f(d).length})}return out}
function picker(p,pre){return'<div class="days" role="group" aria-label="Pilih tanggal">'+p.days.map(function(d){var o=pd(d.date);return'<button data-act="'+pre+'date" data-date="'+d.date+'"'+(d.date===p.date?' class="on" aria-pressed="true"':' aria-pressed="false"')+(d.n?"":' disabled')+' aria-label="'+esc(fdate(d.date))+(d.n?"":", tidak ada jam kosong")+'">'+DS[o.getDay()]+'<br>'+o.getDate()+'<small>'+MON[o.getMonth()].slice(0,3)+'</small></button>'}).join("")+'</div>'
 +(p.date?'<h3>Jam kosong, '+esc(fdate(p.date))+'</h3>'+(p.slots.length?'<div class="slots" role="group" aria-label="Pilih jam">'+p.slots.map(function(t){return'<button data-act="'+pre+'time" data-t="'+t+'"'+(t===p.time?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>'+hm(t)+'</button>'}).join("")+'</div>':'<div class="none">Tidak ada jam kosong di tanggal ini.</div>'):'<div class="none">Tidak ada jam kosong dalam '+db.salon.windowDays+' hari ke depan untuk pilihan ini.</div>')}
function bookBar(next,label,dis){return'<div class="sumbar"><div id="sb1">'+sbText()+'</div><div class="btns">'+(bk.step>1?'<button class="btn" data-act="bback">Kembali</button>':"")+'<button class="btn pri" data-act="'+next+'"'+(dis?" disabled":"")+'>'+label+'</button></div></div>'}
function sbText(){var n=bk.svc.length;return n?'<b>'+n+' layanan</b> &middot; '+dur(bkDur())+' &middot; <span class="price">'+rp(bkSub())+'</span>':'<span class="muted">Belum ada layanan dipilih</span>'}
function pBooking(){if(!bk)bk=freshBk();if(bk.done)return bDone();
 var st=["Layanan","Stylist","Jadwal","Data"],h='<div class="wrap sec"><h1>Booking</h1><ol class="steps" aria-label="Langkah booking">'+st.map(function(s,i){return'<li class="'+(i+1===bk.step?"on":i+1<bk.step?"done":"")+'"'+(i+1===bk.step?' aria-current="step"':"")+'>'+(i+1)+'. '+s+'</li>'}).join("")+'</ol>';
 if(bk.step===1){var l=db.services.filter(function(s){return s.active}),cats=[];l.forEach(function(s){if(cats.indexOf(s.cat)<0)cats.push(s.cat)});
  h+='<h2>Pilih layanan</h2><p class="muted">Boleh lebih dari satu. Durasi dijumlahkan.</p>';
  cats.forEach(function(c){h+='<h3 style="margin-top:14px">'+esc(c)+'</h3>'+l.filter(function(s){return s.cat===c}).map(function(s){var on=bk.svc.indexOf(s.id)>=0;return'<label class="pick'+(on?" on":"")+'"><input type="checkbox" data-svc="'+s.id+'"'+(on?" checked":"")+'><span class="grow"><b>'+esc(s.name)+'</b><br><span class="muted small">'+dur(s.dur)+' &middot; '+esc(s.desc)+'</span></span><span class="price">'+rp(s.price)+'</span></label>'}).join("")});
  h+=(bk.err?'<p class="err" role="alert">'+esc(bk.err)+'</p>':"")+bookBar("bnext","Lanjut: pilih stylist")}
 else if(bk.step===2){var cap=capList(bk.svc);
  h+='<h2>Pilih stylist</h2><p class="muted">Hanya stylist yang melayani semua layanan terpilih.</p><button class="pick'+(bk.sty==="any"?" on":"")+'" data-act="selSty" data-id="any"><span class="ico">'+icon("Perawatan")+'</span><span class="grow"><b>Siapa saja</b><br><span class="muted small">Tampil semua jam kosong, stylist ditentukan saat booking</span></span></button>';
  db.stylists.filter(function(y){return y.active}).forEach(function(y){var ok=cap.indexOf(y)>=0;h+='<button class="pick'+(bk.sty===y.id?" on":"")+(ok?"":" off")+'" data-act="selSty" data-id="'+y.id+'"'+(ok?"":" disabled")+'>'+avatar(y,48)+'<span class="grow"><b>'+esc(y.name)+'</b><br><span class="muted small">'+(ok?esc(y.role):"Tidak melayani semua layanan terpilih")+'</span></span></button>'});
  h+=bookBar("bnext","Lanjut: pilih jadwal")}
 else if(bk.step===3){var days=dayList(slotsBk);if(!bk.date||!days.some(function(d){return d.date===bk.date&&d.n})){var f=days.filter(function(d){return d.n})[0];bk.date=f?f.date:"";bk.time=null}
  var sl=bk.date?slotsBk(bk.date):[];if(bk.time!=null&&sl.indexOf(bk.time)<0)bk.time=null;
  h+='<h2>Pilih tanggal dan jam</h2><p class="muted">Total durasi '+dur(bkDur())+'. '+(bk.sty==="any"?"Semua stylist yang cocok.":"Stylist: "+esc(sty(bk.sty).name)+".")+'</p>'+picker({days:days,date:bk.date,slots:sl,time:bk.time},"b")+(bk.err?'<p class="err" role="alert">'+esc(bk.err)+'</p>':"")+bookBar("bnext","Lanjut: data diri")}
 else{h+='<h2>Data diri</h2><div class="sum"><div><span>Jadwal</span><b>'+esc(sdate(bk.date))+', '+hm(bk.time)+'</b></div><div><span>Layanan</span><b>'+bkSvc().map(function(s){return esc(s.name)}).join(", ")+'</b></div><div><span>Durasi</span><b>'+dur(bkDur())+'</b></div><div><span>Stylist</span><b id="whoS">'+whoText()+'</b></div></div>'
  +'<div class="two"><label class="f"><span>Nama</span><input class="in" data-k="name" value="'+esc(bk.name)+'" maxlength="40" autocomplete="name"></label><label class="f"><span>Nomor telepon</span><input class="in" data-k="phone" value="'+esc(bk.phone)+'" inputmode="tel" maxlength="20" placeholder="0812-0000-0101" autocomplete="tel"></label></div>'
  +'<label class="f"><span>Catatan (opsional)</span><textarea class="in" data-k="note" maxlength="200">'+esc(bk.note)+'</textarea></label>'
  +'<label class="f"><span>Kode voucher (opsional)</span><input class="in" data-k="voucher" value="'+esc(bk.voucher)+'" maxlength="20" placeholder="Contoh: HEMAT10" autocapitalize="characters"></label><div id="vmsg" aria-live="polite"></div><div id="redeemBox"></div><div id="sumBox"></div>'
  +(bk.err?'<p class="err" role="alert">'+esc(bk.err)+'</p>':"")+'<div class="btns" style="margin-top:12px"><button class="btn" data-act="bback">Kembali</button><button class="btn pri" data-act="bconfirm">Konfirmasi booking</button></div>'}
 return h+'</div>'}
function whoText(){if(bk.sty!=="any")return esc(sty(bk.sty).name);var y=pickStylist(bk.svc,bk.date,bk.time,bkDur());return y?esc(y.name)+" (ditentukan otomatis)":"-"}
function refreshBox(){var vm=$("vmsg"),rb=$("redeemBox"),sb=$("sumBox");if(!sb)return;var sub=bkSub(),v=bk.voucher?vch(bk.voucher):null;
 if(bk.voucher){var r=vOk(v,sub);vm.innerHTML='<p class="'+(r.ok?"okmsg":"err")+'">'+esc(r.msg)+'</p>'}else vm.innerHTML="";
 var c=validPhone(bk.phone)?cust(bk.phone):null,can=c&&c.points>=db.salon.ptsRedeem;if(!can)bk.redeem=false;
 rb.innerHTML=can?'<label class="chk"><input type="checkbox" data-k="redeem"'+(bk.redeem?" checked":"")+'> Tukar '+db.salon.ptsRedeem+' poin (punya '+c.points+') untuk potongan '+rp(db.salon.redeemValue)+'</label>':"";
 var p=pricing(sub,bk.voucher,bk.redeem);sb.innerHTML='<div class="sum"><div><span>Subtotal</span><span>'+rp(p.sub)+'</span></div>'+(p.vd?'<div><span>Voucher '+esc(p.vc)+'</span><span>-'+rp(p.vd)+'</span></div>':"")+(p.rd?'<div><span>Tukar poin</span><span>-'+rp(p.rd)+'</span></div>':"")+'<div class="tot"><span>Total bayar di salon</span><span>'+rp(p.total)+'</span></div></div>'}
function bDone(){var b=bkOf(bk.done);if(!b){bk=freshBk();return pBooking()}
 return'<div class="wrap sec done"><div class="card" style="max-width:560px;margin:0 auto"><h1 style="font-size:1.6rem">Booking berhasil</h1><p class="muted">Simpan kode ini. Untuk cek atau mengubah jadwal, kode dan nomor telepon dibutuhkan.</p><div class="big" aria-label="Kode booking">'+esc(b.code)+'</div>'+bkDetail(b)+'<div class="btns" style="justify-content:center"><button class="btn pri" data-act="ics" data-id="'+b.id+'">Unduh .ics</button><button class="btn" data-act="toCek" data-id="'+b.id+'">Lihat dan ubah booking</button><button class="btn" data-act="newbk2">Booking lagi</button></div><p class="small muted" style="margin-top:12px">Bayar di salon. Poin '+db.salon.ptsVisit+' masuk setelah kunjungan selesai.</p></div></div>'}
function bkDetail(b){var y=sty(b.sid);return'<dl class="kv"><dt>Jadwal</dt><dd>'+esc(fdate(b.date))+', '+hm(b.start)+' - '+hm(b.start+b.dur)+'</dd><dt>Stylist</dt><dd>'+esc(y?y.name:"-")+'</dd><dt>Layanan</dt><dd>'+b.items.map(function(i){return esc(i.name)}).join(", ")+'</dd><dt>Atas nama</dt><dd>'+esc(b.name)+' ('+esc(fphone(b.phone))+')</dd><dt>Total</dt><dd>'+rp(b.total)+(b.vd||b.rd?' <span class="muted small">(setelah potongan '+rp(b.vd+b.rd)+')</span>':"")+'</dd></dl>'}
function icsText(s){return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n")}
function icsT(date,m){return date.replace(/-/g,"")+"T"+pad(Math.floor(m/60))+pad(m%60)+"00"}
function fold(l){var o=[];while(l.length>73){o.push(l.slice(0,73));l=" "+l.slice(73)}o.push(l);return o.join("\r\n")}
function icsFile(b){var y=sty(b.sid),n=new Date(),u=n.getUTCFullYear()+pad(n.getUTCMonth()+1)+pad(n.getUTCDate())+"T"+pad(n.getUTCHours())+pad(n.getUTCMinutes())+pad(n.getUTCSeconds())+"Z";
 var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kala Salon Demo//ID","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-TIMEZONE:Asia/Jakarta","BEGIN:VEVENT","UID:"+b.code+"@salon-demo.invalid","DTSTAMP:"+u,"DTSTART:"+icsT(b.date,b.start),"DTEND:"+icsT(b.date,b.start+b.dur),
 "SUMMARY:"+icsText("Booking "+db.salon.name),"LOCATION:"+icsText(db.salon.addr),"DESCRIPTION:"+icsText("Kode "+b.code+"\nLayanan: "+b.items.map(function(i){return i.name}).join(", ")+"\nStylist: "+(y?y.name:"-")),"STATUS:"+(b.status==="batal"?"CANCELLED":"CONFIRMED"),"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Booking salon 1 jam lagi","TRIGGER:-PT60M","END:VALARM","END:VEVENT","END:VCALENDAR"];
 return L.map(fold).join("\r\n")+"\r\n"}
function download(name,text,type){var bl=new Blob([text],{type:type}),a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function csvCell(v){v=String(v==null?"":v);if(/^[=+\-@]/.test(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'}
function csv(name,rows){download(name,"\ufeff"+rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n"),"text/csv;charset=utf-8")}

/* ----- cek ----- */
function pCek(){var b=cek.id?bkOf(cek.id):null;
 var h='<div class="wrap sec" style="max-width:640px"><h1>Cek booking</h1><p class="muted">Masukkan kode booking dan nomor telepon saat memesan.</p><div class="card"><div class="two"><label class="f"><span>Kode booking</span><input class="in" id="ckC" value="'+esc(cek.code)+'" maxlength="12" placeholder="SB-XXXXX" autocapitalize="characters"></label><label class="f"><span>Nomor telepon</span><input class="in" id="ckP" value="'+esc(cek.phone)+'" inputmode="tel" maxlength="20" placeholder="0812-0000-0101"></label></div>'+(cek.err?'<p class="err" role="alert">'+esc(cek.err)+'</p>':"")+'<button class="btn pri" data-act="ckGo">Cek booking</button></div>';
 if(b){var c=canChange(b);h+='<div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><h2 style="margin:0" class="code">'+esc(b.code)+'</h2><span class="badge st-'+b.status+'">'+ST[b.status]+'</span></div>'+bkDetail(b)+'<div class="btns"><button class="btn sm" data-act="ics" data-id="'+b.id+'">Unduh .ics</button>'+(c.ok?'<button class="btn sm" data-act="rsOpen" data-id="'+b.id+'">Jadwal ulang</button><button class="btn sm bad" data-act="ckCancel" data-id="'+b.id+'" data-sure="Tekan lagi untuk batalkan">Batalkan booking</button>':"")+'</div>'+(c.ok?'<p class="small muted" style="margin-top:10px">Bisa diubah atau dibatalkan sampai '+db.salon.cancelHours+' jam sebelum jadwal.</p>':'<p class="small" style="margin-top:10px">'+esc(c.msg)+'</p>')+'</div>'}
 return h+'</div>'}
function pPoin(){var r=poin.res,h='<div class="wrap sec" style="max-width:700px"><h1>Poin dan voucher</h1><p class="muted">Dapat '+db.salon.ptsVisit+' poin tiap kunjungan selesai. Kumpulkan '+db.salon.ptsRedeem+' poin, tukar dengan potongan '+rp(db.salon.redeemValue)+' saat booking berikutnya.</p><div class="card"><label class="f"><span>Nomor telepon terdaftar</span><input class="in" id="pnP" value="'+esc(poin.phone)+'" inputmode="tel" maxlength="20" placeholder="0812-0000-0101"></label>'+(poin.err?'<p class="err" role="alert">'+esc(poin.err)+'</p>':"")+'<button class="btn pri" data-act="pnGo">Lihat poin</button></div>';
 if(r){var c=cust(r),pc=Math.min(100,Math.round(c.points/db.salon.ptsRedeem*100)),hist=db.bookings.filter(function(b){return b.phone===c.phone&&b.status==="selesai"}).sort(function(a,b){return a.date<b.date?1:-1}).slice(0,8);
  h+='<div class="card" style="margin-top:14px"><h2 style="margin:0">'+esc(c.name)+'</h2><p class="muted">'+esc(fphone(c.phone))+'</p><p style="font-size:2rem;margin:0" class="price">'+c.points+' poin</p><div class="progress" role="progressbar" aria-valuenow="'+pc+'" aria-valuemin="0" aria-valuemax="100" aria-label="Menuju penukaran poin"><i style="width:'+pc+'%"></i></div><p class="small muted">'+(c.points>=db.salon.ptsRedeem?"Poin cukup untuk ditukar di langkah data diri saat booking.":"Kurang "+(db.salon.ptsRedeem-c.points)+" poin lagi untuk potongan "+rp(db.salon.redeemValue)+".")+'</p><h3>Riwayat kunjungan selesai</h3>'+(hist.length?'<table class="t"><tbody>'+hist.map(function(b){return'<tr><td>'+esc(sdate(b.date))+'</td><td>'+b.items.map(function(i){return esc(i.name)}).join(", ")+'</td><td class="n">+'+b.pts+'</td></tr>'}).join("")+'</tbody></table>':'<p class="muted">Belum ada kunjungan selesai.</p>')+'</div>'}
 return h+'<h2 style="margin-top:26px">Voucher aktif</h2>'+promoCards()+'</div>'}

/* ----- reschedule (dipakai pelanggan dan admin) ----- */
function rsOpen(id,admin){var b=bkOf(id);rs={id:id,admin:!!admin,date:"",time:null,err:""};rsDraw();openDlg()}
function rsSlots(d){var b=bkOf(rs.id);return slotsFor(b.sid,d,b.dur,{admin:rs.admin,skip:b.id})}
function rsDraw(){var b=bkOf(rs.id),days=dayList(rsSlots);if(!rs.date||!days.some(function(d){return d.date===rs.date&&d.n})){var f=days.filter(function(d){return d.n})[0];rs.date=f?f.date:"";rs.time=null}
 var sl=rs.date?rsSlots(rs.date):[];if(rs.time!=null&&sl.indexOf(rs.time)<0)rs.time=null;
 $("dlg").innerHTML='<div class="dh"><h3>Jadwal ulang</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><p class="muted small">'+esc(b.code)+' &middot; '+b.items.map(function(i){return esc(i.name)}).join(", ")+' &middot; stylist '+esc(sty(b.sid).name)+'. Sekarang: '+esc(sdate(b.date))+', '+hm(b.start)+'.</p>'+picker({days:days,date:rs.date,slots:sl,time:rs.time},"r")+(rs.err?'<p class="err" role="alert">'+esc(rs.err)+'</p>':"")+'<div class="btns" style="margin-top:12px"><button class="btn pri" data-act="rsSave"'+(rs.time==null?" disabled":"")+'>Simpan jadwal baru</button><button class="btn" data-act="rsBack">Batal</button></div></div>'}
var dlgSave=null;
function openDlg(){var d=$("dlg");if(!d.open)d.showModal()}
function closeDlg(){var d=$("dlg");if(d.open)d.close();rs=null;mb=null}
function twice(el){var k=el.dataset.act+"|"+(el.dataset.id||"");if(armed!==k){armed=k;if(!el.dataset.orig)el.dataset.orig=el.textContent;el.textContent=el.dataset.sure;clearTimeout(armT);armT=setTimeout(function(){armed=null;el.textContent=el.dataset.orig},4000);return false}armed=null;clearTimeout(armT);return true}

/* ===== aksi publik ===== */
var A={};
function rerender(){render(true);if(parts()[0]==="booking"&&bk&&bk.step===4&&!bk.done)refreshBox()}
function stepTo(n){bk.step=n;bk.err="";render();if(n===4)refreshBox()}
A.menu=function(el){var n=$("nav"),on=n.classList.toggle("on");el.setAttribute("aria-expanded",on)};
A.newbk=function(){if(bk&&bk.done)bk=freshBk()};
A.newbk2=function(){bk=freshBk();render()};
A.addsvc=function(el){if(!bk||bk.done)bk=freshBk();if(bk.svc.indexOf(el.dataset.id)<0)bk.svc.push(el.dataset.id);bk.step=1;bk.time=null;toast("Layanan ditambahkan ke booking");go("#/booking")};
A.pickSty=function(el){if(!bk||bk.done)bk=freshBk();bk.sty=el.dataset.id;bk.step=1;bk.time=null;go("#/booking")};
A.useV=function(el){if(!bk||bk.done)bk=freshBk();bk.voucher=el.dataset.code;toast("Voucher "+el.dataset.code+" akan dipakai di langkah data diri");go("#/booking")};
A.cat=function(el){flt.cat=el.dataset.c;render(true)};
A.bnext=function(){bk.err="";
 if(bk.step===1){if(!bk.svc.length){bk.err="Pilih minimal satu layanan.";return rerender()}
  if(bk.sty!=="any"&&!capable(sty(bk.sty),bk.svc)){bk.sty="any";toast("Stylist pilihan tidak melayani semua layanan, diganti Siapa saja")}
  if(!capList(bk.svc).length){bk.err="Belum ada stylist untuk kombinasi layanan ini. Kurangi layanan.";return rerender()}}
 if(bk.step===3&&bk.time==null){bk.err="Pilih jam terlebih dahulu.";return rerender()}
 stepTo(bk.step+1);window.scrollTo(0,0)};
A.bback=function(){stepTo(Math.max(1,bk.step-1));window.scrollTo(0,0)};
A.selSty=function(el){bk.sty=el.dataset.id;bk.time=null;rerender()};
A.bdate=function(el){bk.date=el.dataset.date;bk.time=null;rerender()};
A.btime=function(el){bk.time=+el.dataset.t;rerender()};
A.bconfirm=function(){bk.err="";var n=bk.name.trim(),sub=bkSub();
 if(n.length<2)bk.err="Isi nama minimal 2 huruf.";else if(!validPhone(bk.phone))bk.err="Nomor telepon tidak valid. Contoh: 0812-0000-0101.";
 else if(bk.voucher&&!vOk(vch(bk.voucher),sub).ok)bk.err=vOk(vch(bk.voucher),sub).msg+". Kosongkan kolom voucher atau ganti kodenya.";
 if(bk.err){rerender();var e=document.querySelector(".err[role=alert]");if(e)e.scrollIntoView({block:"center"});return}
 if(slotsBk(bk.date).indexOf(bk.time)<0){bk.err="Jam yang dipilih baru saja terisi. Pilih jam lain.";bk.step=3;bk.time=null;render();return}
 var y=bk.sty==="any"?pickStylist(bk.svc,bk.date,bk.time,bkDur()):sty(bk.sty);
 if(!y||!freeAt(y.id,bk.date,bk.time,bkDur())){bk.err="Stylist tidak lagi tersedia di jam itu. Pilih jam lain.";bk.step=3;bk.time=null;render();return}
 var c=cust(bk.phone),redeem=bk.redeem&&c&&c.points>=db.salon.ptsRedeem;
 var b=mkBooking({date:bk.date,start:bk.time,sid:y.id,svc:bk.svc.slice(),name:n,phone:bk.phone,note:bk.note.trim(),voucher:bk.voucher,redeem:redeem,source:"online"});
 save();bk.done=b.id;cek={code:b.code,phone:b.phone,id:null,err:""};render();toast("Booking tersimpan: "+b.code)};
A.ics=function(el){var b=bkOf(el.dataset.id);if(b)download("booking-"+b.code+".ics",icsFile(b),"text/calendar;charset=utf-8")};
A.toCek=function(el){var b=bkOf(el.dataset.id);cek={code:b.code,phone:fphone(b.phone),id:b.id,err:""};go("#/cek")};
A.ckGo=function(){cek.code=$("ckC").value;cek.phone=$("ckP").value;var code=cek.code.trim().toUpperCase();if(/^[A-Z0-9]{5}$/.test(code))code="SB-"+code;
 var b=db.bookings.filter(function(x){return x.code===code&&x.phone===norm(cek.phone)})[0];
 if(!cek.code.trim()||!cek.phone.trim()){cek.err="Isi kode booking dan nomor telepon.";cek.id=null}
 else if(!b){cek.err="Kode atau nomor telepon tidak cocok.";cek.id=null}else{cek.err="";cek.id=b.id}render(true)};
A.ckCancel=function(el){var b=bkOf(el.dataset.id),c=canChange(b);if(!c.ok){toast(c.msg,true);return render(true)}setStatus(b,"batal");save();toast("Booking dibatalkan");render(true)};
A.pnGo=function(){poin.phone=$("pnP").value;var c=validPhone(poin.phone)?cust(poin.phone):null;poin.err=c?"":(validPhone(poin.phone)?"Nomor belum terdaftar. Poin dimulai setelah booking pertama selesai.":"Nomor telepon tidak valid.");poin.res=c?c.phone:null;render(true)};
A.rsOpen=function(el){rsOpen(el.dataset.id,false)};
A.rdate=function(el){rs.date=el.dataset.date;rs.time=null;rsDraw()};
A.rtime=function(el){rs.time=+el.dataset.t;rsDraw()};
A.rsSave=function(){var b=bkOf(rs.id);if(rsSlots(rs.date).indexOf(rs.time)<0){rs.err="Jam itu baru saja terisi.";rs.time=null;return rsDraw()}
 if(!rs.admin&&!canChange(b).ok){toast(canChange(b).msg,true);return closeDlg()}
 var adm=rs.admin;b.date=rs.date;b.start=rs.time;save();toast("Jadwal diubah ke "+sdate(b.date)+", "+hm(b.start));if(adm){adDetail(b.id)}else closeDlg();render(true)};
A.rsBack=function(){var adm=rs&&rs.admin,id=rs&&rs.id;if(adm)adDetail(id);else closeDlg()};
A.dclose=function(){closeDlg()};
A.reset=function(){try{localStorage.removeItem(KEY);sessionStorage.removeItem(SESS)}catch(e){}db=seed();save();bk=freshBk();cal=null;cek={code:"",phone:"",id:null,err:""};poin={phone:"",res:null,err:""};closeDlg();toast("Data demo dikembalikan");go("#/");render()};

document.addEventListener("click",function(e){var t=e.target.closest("[data-act]");if(!t||t.disabled)return;var f=A[t.dataset.act];if(!f)return;if(t.dataset.sure!==undefined&&!twice(t)){e.preventDefault();return}f(t,e)});
$("dlg").addEventListener("click",function(e){if(e.target===$("dlg"))closeDlg()});
$("dlg").addEventListener("close",function(){rs=null;mb=null});
document.addEventListener("input",function(e){var t=e.target,k=t.dataset.k;if(!k||!bk)return;if(k==="voucher")bk.voucher=t.value.trim().toUpperCase();else if(k!=="redeem")bk[k]=t.value;if(k==="voucher"||k==="phone")refreshBox()});
document.addEventListener("change",function(e){var t=e.target;
 if(t.dataset.svc&&bk){var i=bk.svc.indexOf(t.dataset.svc);if(t.checked&&i<0)bk.svc.push(t.dataset.svc);else if(!t.checked&&i>=0)bk.svc.splice(i,1);bk.time=null;bk.err="";t.closest(".pick").classList.toggle("on",t.checked);$("sb1").innerHTML=sbText();return}
 if(t.dataset.k==="redeem"){bk.redeem=t.checked;refreshBox();return}
 if(t.dataset.hr)hrChange(t);
 if(t.dataset.mb)mbRefresh()});
document.addEventListener("keydown",function(e){if(e.key!=="Enter")return;var id=e.target.id;if(id==="ckC"||id==="ckP")A.ckGo();else if(id==="pnP")A.pnGo();else if(id==="admPin")A.login()});
document.addEventListener("click",function(e){var n=$("nav");if(n&&n.classList.contains("on")&&e.target.closest("#nav a")){n.classList.remove("on")}});

/* ===== admin ===== */
var TABS=[["kalender","Kalender"],["booking","Booking"],["layanan","Layanan"],["stylist","Stylist"],["jadwal","Jam kerja dan libur"],["pelanggan","Pelanggan"],["laporan","Laporan"],["promo","Promo dan pengaturan"]];
function adminBar(){return'<div class="wrap wide bar"><a class="brand" href="#/admin">'+logo()+'<span class="bn">Panel<br>salon</span></a><a class="btn sm" href="#/">Lihat situs</a>'+(isAdmin()?'<button class="btn sm" data-act="logout">Keluar</button>':"")+'</div>'}
A.login=function(){var v=$("admPin").value.trim();if(v===db.salon.pin){try{sessionStorage.setItem(SESS,"1")}catch(e){}render()}else{$("admErr").textContent="PIN salah.";$("admPin").value="";$("admPin").focus()}};
A.logout=function(){try{sessionStorage.removeItem(SESS)}catch(e){}go("#/")};
function pAdmin(tab){if(!isAdmin())return'<div class="wrap"><form class="card login" onsubmit="return false"><h1 style="font-size:1.6rem">Panel salon</h1><p class="muted">Masukkan PIN. PIN demo: <b>2468</b></p><label class="f"><span>PIN</span><input class="in" id="admPin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" style="text-align:center;font-size:1.3rem;letter-spacing:.3em"></label><p class="err" id="admErr" role="alert"></p><button class="btn pri" style="width:100%" data-act="login" type="button">Masuk</button></form></div>';
 var f={kalender:aCal,booking:aBook,layanan:aSvc,stylist:aSty,jadwal:aHours,pelanggan:aCust,laporan:aRep,promo:aPromo}[tab];if(!f){tab="kalender";f=aCal}
 return'<div class="wrap adm"><div class="atabs" role="navigation" aria-label="Menu panel">'+TABS.map(function(t){return'<a href="#/admin/'+t[0]+'"'+(t[0]===tab?' class="on" aria-current="page"':"")+'>'+t[1]+'</a>'}).join("")+'</div>'+f()+'</div>'}
function bSum(b){return b.items.map(function(i){return esc(i.name)}).join(", ")}
function badge(s){return'<span class="badge st-'+s+'">'+ST[s]+'</span>'}

/* ----- kalender ----- */
function actSty(){return db.stylists.filter(function(y){return y.active})}
function aCal(){var ys=actSty();if(!cal)cal={view:"day",date:today(),sty:window.innerWidth<700&&ys[0]?ys[0].id:"all"};
 if(cal.sty!=="all"&&!sty(cal.sty))cal.sty="all";
 var week=cal.view==="week",one=cal.sty==="all"?ys[0]:sty(cal.sty),cols=[];
 if(!ys.length)return'<div class="none">Belum ada stylist aktif. Tambahkan di tab Stylist.</div>';
 if(week){var m=addD(cal.date,dow(cal.date)===0?-6:1-dow(cal.date));for(var i=0;i<7;i++)cols.push({y:one,date:addD(m,i)})}
 else(cal.sty==="all"?ys:[one]).forEach(function(y){cols.push({y:y,date:cal.date})});
 var lo=9*60,hi=19*60;cols.forEach(function(c){var w=workHours(c.y.id,c.date);if(w){lo=Math.min(lo,w[0]);hi=Math.max(hi,w[1])}db.bookings.forEach(function(b){if(b.sid===c.y.id&&b.date===c.date&&b.status!=="batal"){lo=Math.min(lo,b.start);hi=Math.max(hi,b.start+b.dur)}})});
 lo=Math.floor(lo/60)*60;hi=Math.ceil(hi/60)*60;var H=(hi-lo)/60*PPH,td=today(),n=cols.length;
 var vis=db.bookings.filter(function(b){return b.status!=="batal"&&cols.some(function(c){return c.y.id===b.sid&&c.date===b.date})});
 var h='<div class="tool"><div class="chips" style="margin:0"><button data-act="cview" data-v="day"'+(!week?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>Harian</button><button data-act="cview" data-v="week"'+(week?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>Mingguan</button></div><button class="btn sm" data-act="cnav" data-n="-1" aria-label="Sebelumnya">&larr;</button><button class="btn sm" data-act="cnav" data-n="0">Hari ini</button><button class="btn sm" data-act="cnav" data-n="1" aria-label="Berikutnya">&rarr;</button><label class="f" style="margin:0"><span class="small" style="display:none">Tanggal</span><input class="in" type="date" id="cDate" value="'+cal.date+'" aria-label="Tanggal kalender" style="width:auto"></label><span class="grow"></span><button class="btn sm pri" data-act="mbOpen">+ Booking manual</button></div>'
 +'<div class="chips" role="group" aria-label="Pilih stylist">'+(week?"":'<button data-act="csty" data-id="all"'+(cal.sty==="all"?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>Semua stylist</button>')+ys.map(function(y){var on=week?one.id===y.id:cal.sty===y.id;return'<button data-act="csty" data-id="'+y.id+'"'+(on?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>'+esc(y.name)+'</button>'}).join("")+'</div>'
 +'<p class="small muted"><b>'+esc(week?sdate(cols[0].date)+" - "+sdate(cols[6].date):fdate(cal.date))+'</b> &middot; '+vis.length+' booking &middot; nilai '+rp(vis.reduce(function(a,b){return a+b.total},0))+'. Klik blok untuk detail, klik jam kosong untuk booking baru.</p>'
 +'<div class="calwrap"><div class="cal" style="--pph:'+PPH+'px;grid-template-columns:44px repeat('+n+',minmax('+(week?92:140)+'px,1fr))"><div class="ch"></div>'+cols.map(function(c){return'<div class="ch">'+(week?DS[dow(c.date)]+" "+pd(c.date).getDate()+'<small>'+esc(c.y.name)+'</small>':esc(c.y.name)+'<small>'+esc(c.y.role)+'</small>')+'</div>'}).join("")
 +'<div class="ax" style="height:'+H+'px">'+(function(){var s="";for(var t=lo+60;t<hi;t+=60)s+='<span style="top:'+(t-lo)/60*PPH+'px">'+hm(t)+'</span>';return s})()+'</div>'+cols.map(function(c){return colHtml(c,lo,hi,H,td)}).join("")+'</div></div>'
 +'<p class="small muted" style="margin-top:8px">Warna: biru terjadwal, kuning hadir, hijau selesai, abu-abu tidak hadir. Booking batal tidak ditampilkan.</p>';return h}
function colHtml(c,lo,hi,H,td){var w=workHours(c.y.id,c.date),off="",hol=holidayFor(c.date,c.y.id);
 if(!w)off='<div class="off" style="top:0;height:100%"><span>'+esc(hol?hol.label:"Libur")+'</span></div>';else{if(w[0]>lo)off+='<div class="off" style="top:0;height:'+(w[0]-lo)/60*PPH+'px"></div>';if(w[1]<hi)off+='<div class="off" style="top:'+(w[1]-lo)/60*PPH+'px;bottom:0"></div>'}
 var bl=db.bookings.filter(function(b){return b.sid===c.y.id&&b.date===c.date&&b.status!=="batal"}).map(function(b){return'<button class="blk st-'+b.status+'" data-act="adBk" data-id="'+b.id+'" style="top:'+(b.start-lo)/60*PPH+'px;height:'+Math.max(22,b.dur/60*PPH-2)+'px" aria-label="'+esc(hm(b.start)+" "+b.name+", "+ST[b.status])+'"><b>'+hm(b.start)+' '+esc(b.name)+'</b><span>'+bSum(b)+'</span></button>'}).join("");
 var nl=c.date===td&&nowMin()>lo&&nowMin()<hi?'<div class="nowl" style="top:'+(nowMin()-lo)/60*PPH+'px"></div>':"";
 return'<div class="cc" data-act="slot" data-sid="'+c.y.id+'" data-date="'+c.date+'" data-s="'+lo+'" style="height:'+H+'px">'+off+bl+nl+'</div>'}
A.cview=function(el){cal.view=el.dataset.v;if(cal.view==="week"&&cal.sty==="all"&&actSty()[0])cal.sty=actSty()[0].id;render(true)};
A.cnav=function(el){var n=+el.dataset.n;cal.date=n===0?today():addD(cal.date,n*(cal.view==="week"?7:1));render(true)};
A.csty=function(el){cal.sty=el.dataset.id;render(true)};
A.slot=function(el,e){var r=el.getBoundingClientRect(),m=+el.dataset.s+Math.floor((e.clientY-r.top)/PPH*60/STEP)*STEP;
 if(freeAt(el.dataset.sid,el.dataset.date,m,STEP))mbOpen({sid:el.dataset.sid,date:el.dataset.date,time:m});else toast("Jam ini di luar jadwal kerja atau sudah terisi",true)};
document.addEventListener("change",function(e){if(e.target.id==="cDate"&&isDate(e.target.value)){cal.date=e.target.value;render(true)}});

/* ----- detail booking ----- */
A.adBk=function(el){adDetail(el.dataset.id)};
function adDetail(id){var b=bkOf(id);if(!b)return closeDlg();var y=sty(b.sid),s=b.status,btn=function(st,l,cls){return'<button class="btn sm '+(cls||"")+'" data-act="stat" data-id="'+id+'" data-s="'+st+'">'+l+'</button>'};
 var acts="";if(s==="booked")acts=btn("hadir","Tandai hadir","pri")+btn("selesai","Selesai")+btn("tidak_hadir","Tidak hadir")+'<button class="btn sm" data-act="adRs" data-id="'+id+'">Ubah jadwal</button>'+'<button class="btn sm bad" data-act="stat" data-id="'+id+'" data-s="batal" data-sure="Tekan lagi untuk batalkan">Batalkan</button>';
 else if(s==="hadir")acts=btn("selesai","Selesai","pri")+btn("tidak_hadir","Tidak hadir")+'<button class="btn sm bad" data-act="stat" data-id="'+id+'" data-s="batal" data-sure="Tekan lagi untuk batalkan">Batalkan</button>';
 else if(s==="selesai")acts=btn("hadir","Batalkan status selesai");else if(s==="tidak_hadir")acts=btn("booked","Kembalikan ke terjadwal");
 $("dlg").innerHTML='<div class="dh"><h3>Booking <span class="code">'+esc(b.code)+'</span></h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db">'+badge(s)+' <span class="muted small">'+(b.source==="walkin"?"Walk-in":b.source==="admin"?"Dibuat admin":"Online")+'</span>'
 +'<dl class="kv"><dt>Jadwal</dt><dd>'+esc(fdate(b.date))+', '+hm(b.start)+' - '+hm(b.start+b.dur)+' ('+dur(b.dur)+')</dd><dt>Stylist</dt><dd>'+esc(y?y.name:"-")+'</dd><dt>Pelanggan</dt><dd>'+esc(b.name)+' ('+esc(fphone(b.phone))+')</dd>'+(b.note?'<dt>Catatan</dt><dd>'+esc(b.note)+'</dd>':"")+'</dl>'
 +'<table class="t"><tbody>'+b.items.map(function(i){return'<tr><td>'+esc(i.name)+'</td><td class="n">'+rp(i.price)+'</td></tr>'}).join("")+(b.vd?'<tr><td>Voucher '+esc(b.voucher)+'</td><td class="n">-'+rp(b.vd)+'</td></tr>':"")+(b.rd?'<tr><td>Tukar poin</td><td class="n">-'+rp(b.rd)+'</td></tr>':"")+'<tr><th>Total</th><th class="n">'+rp(b.total)+'</th></tr></tbody></table>'
 +(b.pts?'<p class="small okmsg">+'+b.pts+' poin diberikan ke pelanggan.</p>':"")+(s==="batal"?'<p class="small muted">Booking batal tidak bisa dipulihkan. Buat booking baru bila perlu.</p>':"")+'<div class="btns" style="margin-top:12px">'+acts+'<button class="btn sm" data-act="ics" data-id="'+id+'">.ics</button></div></div>';openDlg()}
A.stat=function(el){var b=bkOf(el.dataset.id),s=el.dataset.s;if(s==="booked"&&!freeAt(b.sid,b.date,b.start,b.dur,b.id)){toast("Jam ini sudah terisi booking lain",true);return}
 setStatus(b,s);save();toast("Status: "+ST[s]);adDetail(b.id);render(true)};
A.adRs=function(el){rsOpen(el.dataset.id,true)};

/* ----- booking manual ----- */
function mbOpen(pre){pre=pre||{};mb={sid:pre.sid||"",date:pre.date||today(),time:pre.time!=null?pre.time:null};
 $("dlg").innerHTML='<div class="dh"><h3>Booking manual</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><div class="two"><label class="f"><span>Nama</span><input class="in" id="mbN" maxlength="40"></label><label class="f"><span>Nomor telepon</span><input class="in" id="mbP" inputmode="tel" maxlength="20" placeholder="0812-0000-0101"></label></div>'
 +'<fieldset style="border:0;padding:0;margin:0 0 10px"><legend class="small muted" style="font-weight:700;padding:0 0 4px">Layanan</legend><div class="sk">'+db.services.filter(function(s){return s.active}).map(function(s){return'<label class="chk"><input type="checkbox" data-mb="1" value="'+s.id+'"> <span>'+esc(s.name)+' <span class="muted small">'+dur(s.dur)+'</span></span></label>'}).join("")+'</div></fieldset>'
 +'<div class="two"><label class="f"><span>Stylist</span><select class="in" id="mbS" data-mb="1"></select></label><label class="f"><span>Tanggal</span><input class="in" type="date" id="mbD" data-mb="1" value="'+mb.date+'"></label></div><label class="f"><span>Jam</span><select class="in" id="mbT"></select></label>'
 +'<label class="f"><span>Kode voucher (opsional)</span><input class="in" id="mbV" maxlength="20"></label><label class="chk"><input type="checkbox" id="mbW"> Walk-in, langsung hadir</label><p class="small muted" id="mbI"></p><p class="err" id="mbE" role="alert"></p><div class="btns"><button class="btn pri" data-act="mbSave">Simpan booking</button><button class="btn" data-act="dclose">Batal</button></div></div>';openDlg();mbRefresh(true)}
A.mbOpen=function(){mbOpen({date:cal?cal.date:today()})};
function mbIds(){return[].slice.call($("dlg").querySelectorAll("input[data-mb][type=checkbox]:checked")).map(function(i){return i.value})}
function mbRefresh(first){if(!mb||!$("mbS"))return;var ids=mbIds(),d=ids.reduce(function(a,id){return a+svc(id).dur},0),sS=$("mbS"),cur=sS.value||mb.sid;
 var l=ids.length?capList(ids):actSty();sS.innerHTML=(ids.length?'<option value="">Otomatis (yang kosong)</option>':'<option value="">Pilih layanan dulu</option>')+l.map(function(y){return'<option value="'+y.id+'">'+esc(y.name)+'</option>'}).join("");
 if(l.some(function(y){return y.id===cur}))sS.value=cur;else sS.value="";
 var date=$("mbD").value,tSel=$("mbT"),prev=tSel.value!==""?+tSel.value:mb.time,sl=[];
 if(ids.length&&isDate(date))sl=sS.value?slotsFor(sS.value,date,d,{admin:true}):slotsAny(ids,date,d,{admin:true});
 tSel.innerHTML=sl.length?sl.map(function(t){return'<option value="'+t+'">'+hm(t)+'</option>'}).join(""):'<option value="">Tidak ada jam kosong</option>';
 if(sl.indexOf(prev)>=0)tSel.value=prev;mb.time=sl.indexOf(prev)>=0?prev:null;
 $("mbI").textContent=ids.length?"Durasi "+dur(d)+", total "+rp(ids.reduce(function(a,id){return a+svc(id).price},0)):""}
A.mbSave=function(){var E=function(m){$("mbE").textContent=m},ids=mbIds(),n=$("mbN").value.trim(),p=$("mbP").value,date=$("mbD").value,t=$("mbT").value;
 if(n.length<2)return E("Isi nama minimal 2 huruf.");if(!validPhone(p))return E("Nomor telepon tidak valid.");if(!ids.length)return E("Pilih minimal satu layanan.");if(!isDate(date)||t==="")return E("Pilih tanggal dan jam yang tersedia.");
 var start=+t,d=ids.reduce(function(a,id){return a+svc(id).dur},0),y=$("mbS").value?sty($("mbS").value):pickStylist(ids,date,start,d);
 if(!y||!capable(y,ids)||!freeAt(y.id,date,start,d))return E("Jam ini tidak tersedia untuk stylist tersebut.");
 var vc=$("mbV").value.trim().toUpperCase(),sub=ids.reduce(function(a,id){return a+svc(id).price},0);if(vc&&!vOk(vch(vc),sub).ok)return E(vOk(vch(vc),sub).msg);
 var w=$("mbW").checked,b=mkBooking({date:date,start:start,sid:y.id,svc:ids,name:n,phone:p,voucher:vc,source:w?"walkin":"admin"});if(w)setStatus(b,"hadir");save();
 if(cal)cal.date=date;toast("Booking "+b.code+" tersimpan");adDetail(b.id);render(true)};

/* ----- daftar booking ----- */
function aBook(){var td=today(),l=db.bookings.filter(function(b){if(bl.st&&b.status!==bl.st)return false;if(bl.when==="today"&&b.date!==td)return false;if(bl.when==="next"&&b.date<td)return false;if(bl.when==="past"&&b.date>=td)return false;
  var q=bl.q.trim().toLowerCase();return!q||(b.code+" "+b.name+" "+b.phone).toLowerCase().indexOf(q)>=0});
 l.sort(function(a,b){var k=a.date+hm(a.start),m=b.date+hm(b.start);return bl.when==="past"?(k<m?1:-1):(k<m?-1:1)});
 var opt=function(v,t,cur){return'<option value="'+v+'"'+(v===cur?" selected":"")+'>'+t+'</option>'};
 return'<div class="tool"><label class="f grow" style="margin:0"><span class="small" style="display:none">Cari</span><input class="in" id="blQ" value="'+esc(bl.q)+'" placeholder="Cari kode, nama atau telepon" aria-label="Cari booking"></label><select class="in" id="blW" aria-label="Waktu" style="width:auto">'+opt("next","Mendatang",bl.when)+opt("today","Hari ini",bl.when)+opt("past","Sudah lewat",bl.when)+opt("all","Semua",bl.when)+'</select><select class="in" id="blS" aria-label="Status" style="width:auto">'+opt("","Semua status",bl.st)+Object.keys(ST).map(function(k){return opt(k,ST[k],bl.st)}).join("")+'</select><button class="btn sm pri" data-act="mbOpen">+ Booking manual</button></div>'
 +'<p class="small muted">'+l.length+' booking</p>'+(l.length?l.slice(0,bl.n).map(function(b){var y=sty(b.sid);return'<div class="row"><div class="grow"><b>'+esc(sdate(b.date))+', '+hm(b.start)+'</b> &middot; <span class="code">'+esc(b.code)+'</span><br>'+esc(b.name)+' <span class="muted small">'+esc(fphone(b.phone))+'</span><br><span class="small muted">'+bSum(b)+' &middot; '+esc(y?y.name:"-")+'</span></div><div class="right">'+badge(b.status)+'<br><b>'+rp(b.total)+'</b></div><button class="btn sm" data-act="adBk" data-id="'+b.id+'">Detail</button></div>'}).join("")+(l.length>bl.n?'<button class="btn" data-act="blMore">Tampilkan lebih banyak</button>':""):'<div class="none">Tidak ada booking yang cocok.</div>')}
A.blMore=function(){bl.n+=40;render(true)};
document.addEventListener("input",function(e){if(e.target.id==="blQ"){bl.q=e.target.value;bl.n=40;var p=e.target.selectionStart;render(true);var i=$("blQ");i.focus();i.setSelectionRange(p,p)}else if(e.target.id==="cuQ"){cu.q=e.target.value;var p2=e.target.selectionStart;render(true);var j=$("cuQ");j.focus();j.setSelectionRange(p2,p2)}});
document.addEventListener("change",function(e){if(e.target.id==="blW"){bl.when=e.target.value;bl.n=40;render(true)}else if(e.target.id==="blS"){bl.st=e.target.value;bl.n=40;render(true)}else if(e.target.id==="rpR"){rep.r=e.target.value;render(true)}});

/* ----- layanan ----- */
function aSvc(){return'<div class="tool"><span class="grow muted small">'+db.services.length+' layanan. Layanan nonaktif tidak tampil di situs.</span><button class="btn sm pri" data-act="svcEdit" data-id="">+ Tambah layanan</button></div>'+(db.services.length?db.services.map(function(s){return'<div class="row'+(s.active?"":" off")+'">'+svcPic(s,"th")+'<div class="grow"><b>'+esc(s.name)+'</b> '+(s.active?"":'<span class="badge st-tidak_hadir">Nonaktif</span>')+'<br><span class="small muted">'+esc(s.cat)+' &middot; '+dur(s.dur)+' &middot; '+rp(s.price)+'</span></div><div class="btns"><button class="btn sm" data-act="svcEdit" data-id="'+s.id+'">Ubah</button><button class="btn sm" data-act="svcTog" data-id="'+s.id+'">'+(s.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn sm bad" data-act="svcDel" data-id="'+s.id+'" data-sure="Tekan lagi">Hapus</button></div></div>'}).join(""):'<div class="none">Belum ada layanan.</div>')}
A.svcEdit=function(el){var s=el.dataset.id?svc(el.dataset.id):{id:"",name:"",cat:"Rambut",dur:30,price:50000,desc:"",active:true},cats=[];db.services.forEach(function(x){if(cats.indexOf(x.cat)<0)cats.push(x.cat)});
 $("dlg").innerHTML='<div class="dh"><h3>'+(s.id?"Ubah":"Tambah")+' layanan</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><label class="f"><span>Nama layanan</span><input class="in" id="fN" maxlength="40" value="'+esc(s.name)+'"></label><div class="two"><label class="f"><span>Kategori</span><input class="in" id="fC" maxlength="20" list="catl" value="'+esc(s.cat)+'"><datalist id="catl">'+cats.map(function(c){return'<option value="'+esc(c)+'">'}).join("")+'</datalist></label><label class="f"><span>Durasi (menit, kelipatan 15)</span><input class="in" id="fD" type="number" min="15" max="300" step="15" value="'+s.dur+'"></label></div><label class="f"><span>Harga (Rp)</span><input class="in" id="fP" type="number" min="0" step="1000" value="'+s.price+'"></label><label class="f"><span>Deskripsi singkat</span><input class="in" id="fT" maxlength="100" value="'+esc(s.desc)+'"></label><label class="chk"><input type="checkbox" id="fA"'+(s.active?" checked":"")+'> Aktif (tampil dan bisa dipesan)</label><p class="err" id="fE" role="alert"></p><div class="btns"><button class="btn pri" data-act="svcSave" data-id="'+s.id+'">Simpan</button><button class="btn" data-act="dclose">Batal</button></div></div>';openDlg()};
A.svcSave=function(el){var E=function(m){$("fE").textContent=m},n=$("fN").value.trim(),c=$("fC").value.trim(),d=parseInt($("fD").value,10),p=parseInt($("fP").value,10);
 if(n.length<2)return E("Isi nama layanan.");if(!c)return E("Isi kategori.");if(!(d>=15&&d<=300&&d%15===0))return E("Durasi harus 15 sampai 300 menit, kelipatan 15.");if(!(p>=0))return E("Harga tidak valid.");
 if(db.services.some(function(s){return s.id!==el.dataset.id&&s.name.toLowerCase()===n.toLowerCase()}))return E("Nama layanan sudah ada.");
 var s=el.dataset.id?svc(el.dataset.id):null;if(!s){var k=1;while(svc("s"+k))k++;s={id:"s"+k};db.services.push(s)}
 s.name=n;s.cat=c;s.dur=d;s.price=p;s.desc=$("fT").value.trim();s.active=$("fA").checked;save();closeDlg();toast("Layanan tersimpan");render(true)};
A.svcTog=function(el){var s=svc(el.dataset.id);s.active=!s.active;save();toast(s.active?"Layanan diaktifkan":"Layanan dinonaktifkan");render(true)};
A.svcDel=function(el){var id=el.dataset.id;if(db.bookings.some(function(b){return b.items.some(function(i){return i.id===id})})){toast("Sudah dipakai di booking. Nonaktifkan saja.",true);return render(true)}
 db.services=db.services.filter(function(s){return s.id!==id});db.stylists.forEach(function(y){y.skills=y.skills.filter(function(x){return x!==id})});save();toast("Layanan dihapus");render(true)};

/* ----- stylist ----- */
var LOOKS={panjang:"Rambut panjang",pendek:"Rambut pendek",jenggot:"Pendek dan jenggot",sanggul:"Sanggul"},HUES=["#8a2f5f","#1f5f6b","#9a5b13","#3b5b2a","#5b3f8f","#8f3b3b"];
function aSty(){return'<div class="tool"><span class="grow muted small">Stylist nonaktif tidak menerima booking baru.</span><button class="btn sm pri" data-act="styEdit" data-id="">+ Tambah stylist</button></div>'+(db.stylists.length?db.stylists.map(function(y){return'<div class="row'+(y.active?"":" off")+'">'+avatar(y,56)+'<div class="grow"><b>'+esc(y.name)+'</b> '+(y.active?"":'<span class="badge st-tidak_hadir">Nonaktif</span>')+'<br><span class="small muted">'+esc(y.role)+' &middot; '+y.skills.length+' layanan</span></div><div class="btns"><button class="btn sm" data-act="styEdit" data-id="'+y.id+'">Ubah</button><button class="btn sm" data-act="styTog" data-id="'+y.id+'">'+(y.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn sm bad" data-act="styDel" data-id="'+y.id+'" data-sure="Tekan lagi">Hapus</button></div></div>'}).join(""):'<div class="none">Belum ada stylist.</div>')}
A.styEdit=function(el){var y=el.dataset.id?sty(el.dataset.id):{id:"",name:"",role:"Stylist",bio:"",look:"pendek",skills:[],active:true};
 $("dlg").innerHTML='<div class="dh"><h3>'+(y.id?"Ubah":"Tambah")+' stylist</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><div class="two"><label class="f"><span>Nama</span><input class="in" id="yN" maxlength="40" value="'+esc(y.name)+'"></label><label class="f"><span>Jabatan</span><input class="in" id="yR" maxlength="30" value="'+esc(y.role)+'"></label></div><label class="f"><span>Profil singkat</span><textarea class="in" id="yB" maxlength="200">'+esc(y.bio)+'</textarea></label><fieldset style="border:0;padding:0;margin:0 0 10px"><legend class="small muted" style="font-weight:700">Keahlian (layanan yang dilayani)</legend><div class="sk">'+db.services.map(function(s){return'<label class="chk"><input type="checkbox" class="ySk" value="'+s.id+'"'+(y.skills.indexOf(s.id)>=0?" checked":"")+'> '+esc(s.name)+'</label>'}).join("")+'</div></fieldset><label class="chk"><input type="checkbox" id="yA"'+(y.active?" checked":"")+'> Aktif</label><p class="err" id="yE" role="alert"></p><div class="btns"><button class="btn pri" data-act="stySave" data-id="'+y.id+'">Simpan</button><button class="btn" data-act="dclose">Batal</button></div></div>';openDlg()};
A.stySave=function(el){var n=$("yN").value.trim(),r=$("yR").value.trim(),sk=[].slice.call(document.querySelectorAll(".ySk:checked")).map(function(i){return i.value});
 if(n.length<2){$("yE").textContent="Isi nama stylist.";return}if(!r){$("yE").textContent="Isi jabatan.";return}if(!sk.length){$("yE").textContent="Pilih minimal satu keahlian.";return}
 var y=el.dataset.id?sty(el.dataset.id):null;if(!y){var k=1;while(sty("y"+k))k++;y={id:"y"+k,hue:HUES[db.stylists.length%HUES.length],skin:["#e8b894","#d9a47c","#f0c8a4","#c98f66"][db.stylists.length%4],hair:"#2b1b17",hours:hoursOf([1,2,3,4,5,6],"10:00","19:00")};db.stylists.push(y)}
 y.name=n;y.role=r;y.bio=$("yB").value.trim();y.skills=sk;y.active=$("yA").checked;save();closeDlg();toast("Stylist tersimpan");render(true)};
A.styTog=function(el){var y=sty(el.dataset.id);y.active=!y.active;save();toast(y.active?"Stylist diaktifkan":"Stylist dinonaktifkan");render(true)};
A.styDel=function(el){var id=el.dataset.id;if(db.bookings.some(function(b){return b.sid===id})){toast("Stylist punya riwayat booking. Nonaktifkan saja.",true);return render(true)}db.stylists=db.stylists.filter(function(y){return y.id!==id});db.holidays=db.holidays.filter(function(h){return h.sid!==id});save();toast("Stylist dihapus");render(true)};

/* ----- jam kerja dan libur ----- */
function timeSel(attrs,val){var o="";for(var t=6*60;t<=23*60;t+=30)o+='<option value="'+hm(t)+'"'+(hm(t)===val?" selected":"")+'>'+hm(t)+'</option>';return'<select class="in" '+attrs+'>'+o+'</select>'}
function aHours(){var td=today(),hl=db.holidays.slice().sort(function(a,b){return a.date<b.date?-1:1});
 return'<div class="grid c2">'+db.stylists.map(function(y){return'<div class="card"><h3>'+esc(y.name)+'</h3>'+[1,2,3,4,5,6,0].map(function(d){var w=y.hours[d];return'<div class="hrs"><label class="chk"><input type="checkbox" data-hr="on" data-sid="'+y.id+'" data-d="'+d+'"'+(w.on?" checked":"")+' aria-label="'+DAYS[d]+' buka"> '+DS[d]+'</label>'+timeSel('data-hr="s" data-sid="'+y.id+'" data-d="'+d+'" aria-label="'+DAYS[d]+' mulai"'+(w.on?"":" disabled"),w.s)+timeSel('data-hr="e" data-sid="'+y.id+'" data-d="'+d+'" aria-label="'+DAYS[d]+' selesai"'+(w.on?"":" disabled"),w.e)+'</div>'}).join("")+'</div>'}).join("")+'</div>'
 +'<h2 style="margin-top:22px">Hari libur dan cuti</h2><div class="card"><div class="two"><label class="f"><span>Tanggal</span><input class="in" type="date" id="hD" value="'+td+'"></label><label class="f"><span>Untuk</span><select class="in" id="hS"><option value="">Semua stylist (salon tutup)</option>'+db.stylists.map(function(y){return'<option value="'+y.id+'">'+esc(y.name)+'</option>'}).join("")+'</select></label></div><label class="f"><span>Keterangan</span><input class="in" id="hL" maxlength="40" placeholder="Contoh: Libur nasional"></label><p class="err" id="hE" role="alert"></p><button class="btn pri" data-act="hAdd">Tambah libur</button></div><div style="margin-top:12px">'
 +(hl.length?hl.map(function(h){var s=h.sid?sty(h.sid):null,n=db.bookings.filter(function(b){return b.date===h.date&&b.status==="booked"&&(!h.sid||b.sid===h.sid)}).length;return'<div class="row"><div class="grow"><b>'+esc(fdate(h.date))+'</b>'+(h.date<td?' <span class="muted small">(lewat)</span>':"")+'<br><span class="small muted">'+esc(h.label)+' &middot; '+(s?esc(s.name):"Semua stylist")+'</span>'+(n?'<br><span class="small err">'+n+' booking terjadwal di tanggal ini perlu dijadwal ulang</span>':"")+'</div><button class="btn sm bad" data-act="hDel" data-id="'+h.id+'" data-sure="Tekan lagi">Hapus</button></div>'}).join(""):'<div class="none">Belum ada hari libur.</div>')+'</div>'}
function hrChange(t){var y=sty(t.dataset.sid),w=y.hours[+t.dataset.d],f=t.dataset.hr;if(f==="on")w.on=t.checked;else w[f]=t.value;
 if(w.on&&pm(w.e)<=pm(w.s)){toast("Jam selesai harus setelah jam mulai",true);w.s="10:00";w.e="19:00"}else toast("Jam kerja tersimpan");save();render(true)}
A.hAdd=function(){var d=$("hD").value,l=$("hL").value.trim()||"Libur";if(!isDate(d)){$("hE").textContent="Pilih tanggal.";return}
 if(db.holidays.some(function(h){return h.date===d&&h.sid===$("hS").value})){$("hE").textContent="Libur untuk tanggal dan stylist ini sudah ada.";return}
 var k=1;while(db.holidays.some(function(h){return h.id==="h"+k}))k++;db.holidays.push({id:"h"+k,date:d,label:l,sid:$("hS").value});save();toast("Libur ditambahkan");render(true)};
A.hDel=function(el){db.holidays=db.holidays.filter(function(h){return h.id!==el.dataset.id});save();toast("Libur dihapus");render(true)};

/* ----- pelanggan ----- */
function cStat(c){var l=db.bookings.filter(function(b){return b.phone===c.phone}),done=l.filter(function(b){return b.status==="selesai"}),last=done.map(function(b){return b.date}).sort().pop()||"";return{all:l,visits:done.length,spent:done.reduce(function(a,b){return a+b.total},0),last:last}}
function aCust(){var q=cu.q.trim().toLowerCase(),l=db.customers.filter(function(c){return!q||(c.name+" "+c.phone).toLowerCase().indexOf(q)>=0}).sort(function(a,b){return b.points-a.points});
 return'<div class="tool"><label class="f grow" style="margin:0"><span class="small" style="display:none">Cari</span><input class="in" id="cuQ" value="'+esc(cu.q)+'" placeholder="Cari nama atau telepon" aria-label="Cari pelanggan"></label><button class="btn sm" data-act="csvCu">Unduh CSV</button></div><p class="small muted">'+l.length+' pelanggan. Pelanggan tercatat otomatis dari booking.</p>'
 +(l.length?l.map(function(c){var s=cStat(c);return'<div class="row"><div class="grow"><b>'+esc(c.name)+'</b><br><span class="small muted">'+esc(fphone(c.phone))+' &middot; '+s.visits+' kunjungan &middot; '+rp(s.spent)+(s.last?" &middot; terakhir "+esc(sdate(s.last)):"")+'</span></div><div><span class="badge st-booked">'+c.points+' poin</span></div><button class="btn sm" data-act="cuOpen" data-p="'+c.phone+'">Riwayat</button></div>'}).join(""):'<div class="none">Tidak ada pelanggan yang cocok.</div>')}
A.cuOpen=function(el){var c=cust(el.dataset.p),s=cStat(c),h=s.all.slice().sort(function(a,b){return a.date<b.date?1:-1});
 $("dlg").innerHTML='<div class="dh"><h3>'+esc(c.name)+'</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><p class="muted">'+esc(fphone(c.phone))+' &middot; '+c.points+' poin &middot; '+s.visits+' kunjungan selesai &middot; belanja '+rp(s.spent)+'</p><div class="tool"><label class="f" style="margin:0"><span class="small" style="display:none">Poin</span><input class="in" id="cuA" type="number" step="1" placeholder="Tambah atau kurangi poin" aria-label="Penyesuaian poin" style="width:230px"></label><button class="btn sm" data-act="cuAdj" data-p="'+c.phone+'">Sesuaikan poin</button></div><p class="err" id="cuE" role="alert"></p><h3>Riwayat booking</h3>'+(h.length?'<table class="t"><tbody>'+h.slice(0,30).map(function(b){return'<tr><td>'+esc(sdate(b.date))+'<br><span class="muted small">'+esc(b.code)+'</span></td><td>'+bSum(b)+'</td><td class="n">'+rp(b.total)+'<br>'+badge(b.status)+'</td></tr>'}).join("")+'</tbody></table>':'<p class="muted">Belum ada booking.</p>')+'</div>';openDlg()};
A.cuAdj=function(el){var c=cust(el.dataset.p),v=parseInt($("cuA").value,10);if(isNaN(v)||v===0){$("cuE").textContent="Isi angka poin, boleh negatif.";return}c.points=Math.max(0,c.points+v);save();toast("Poin sekarang "+c.points);A.cuOpen({dataset:{p:c.phone}});render(true)};
A.csvCu=function(){var rows=[["Nama","Telepon","Poin","Kunjungan selesai","Total belanja","Kunjungan terakhir"]];db.customers.forEach(function(c){var s=cStat(c);rows.push([c.name,c.phone,c.points,s.visits,s.spent,s.last])});csv("pelanggan-salon.csv",rows)};

/* ----- laporan ----- */
function repRange(){var t=today(),r=rep.r;return r==="month"?[t.slice(0,8)+"01",t]:[addD(t,r==="30"?-29:-6),t]}
function aRep(){var rg=repRange(),from=rg[0],to=rg[1],inR=db.bookings.filter(function(b){return b.date>=from&&b.date<=to}),done=inR.filter(function(b){return b.status==="selesai"}),rev=done.reduce(function(a,b){return a+b.total},0);
 var days=[];for(var d=from;d<=to;d=addD(d,1)){var x=done.filter(function(b){return b.date===d});days.push({d:d,n:x.length,v:x.reduce(function(a,b){return a+b.total},0)})}
 var mx=Math.max.apply(null,days.map(function(x){return x.v}).concat([1])),cnt=function(s){return inR.filter(function(b){return b.status===s}).length};
 var perS=db.stylists.map(function(y){var x=done.filter(function(b){return b.sid===y.id});return{y:y,n:x.length,v:x.reduce(function(a,b){return a+b.total},0)}}),top={};
 done.forEach(function(b){b.items.forEach(function(i){top[i.name]=top[i.name]||{n:0,v:0};top[i.name].n++;top[i.name].v+=i.price})});
 var tl=Object.keys(top).map(function(k){return{k:k,n:top[k].n,v:top[k].v}}).sort(function(a,b){return b.n-a.n}).slice(0,5);
 return'<div class="tool"><label class="f" style="margin:0"><span class="small" style="display:none">Periode</span><select class="in" id="rpR" aria-label="Periode laporan" style="width:auto"><option value="7"'+(rep.r==="7"?" selected":"")+'>7 hari terakhir</option><option value="30"'+(rep.r==="30"?" selected":"")+'>30 hari terakhir</option><option value="month"'+(rep.r==="month"?" selected":"")+'>Bulan ini</option></select></label><span class="grow"></span><button class="btn sm" data-act="csvBk">CSV booking</button><button class="btn sm" data-act="csvRev">CSV pendapatan</button></div>'
 +'<div class="kpis"><div><small>Pendapatan (selesai)</small><b>'+rp(rev)+'</b></div><div><small>Kunjungan selesai</small><b>'+done.length+'</b></div><div><small>Rata-rata per kunjungan</small><b>'+rp(done.length?rev/done.length:0)+'</b></div><div><small>Tidak hadir / batal</small><b>'+cnt("tidak_hadir")+' / '+cnt("batal")+'</b></div></div>'
 +'<div class="card"><h3>Pendapatan per hari</h3><div class="bars" role="img" aria-label="Grafik pendapatan per hari">'+days.map(function(x){return'<i style="height:'+Math.max(2,x.v/mx*100)+'%" title="'+esc(sdate(x.d))+': '+rp(x.v)+'"></i>'}).join("")+'</div><div class="small muted" style="display:flex;justify-content:space-between"><span>'+esc(sdate(from))+'</span><span>'+esc(sdate(to))+'</span></div></div>'
 +'<div class="grid c2" style="margin-top:14px"><div class="card"><h3>Per stylist</h3><table class="t"><thead><tr><th>Stylist</th><th class="n">Kunjungan</th><th class="n">Pendapatan</th></tr></thead><tbody>'+perS.map(function(x){return'<tr><td>'+esc(x.y.name)+'</td><td class="n">'+x.n+'</td><td class="n">'+rp(x.v)+'</td></tr>'}).join("")+'</tbody></table></div><div class="card"><h3>Layanan terlaris</h3>'+(tl.length?'<table class="t"><thead><tr><th>Layanan</th><th class="n">Jumlah</th><th class="n">Nilai</th></tr></thead><tbody>'+tl.map(function(x){return'<tr><td>'+esc(x.k)+'</td><td class="n">'+x.n+'</td><td class="n">'+rp(x.v)+'</td></tr>'}).join("")+'</tbody></table>':'<p class="muted">Belum ada data.</p>')+'</div></div>'
 +'<div class="card" style="margin-top:14px"><h3>Per hari</h3><table class="t"><thead><tr><th>Tanggal</th><th class="n">Kunjungan</th><th class="n">Pendapatan</th></tr></thead><tbody>'+days.slice().reverse().map(function(x){return'<tr><td>'+esc(sdate(x.d))+'</td><td class="n">'+x.n+'</td><td class="n">'+rp(x.v)+'</td></tr>'}).join("")+'</tbody></table></div>'}
A.csvBk=function(){var rg=repRange(),rows=[["Kode","Tanggal","Mulai","Selesai","Stylist","Pelanggan","Telepon","Layanan","Subtotal","Voucher","Potongan voucher","Potongan poin","Total","Status","Sumber"]];
 db.bookings.filter(function(b){return b.date>=rg[0]&&b.date<=rg[1]}).sort(function(a,b){return(a.date+hm(a.start))<(b.date+hm(b.start))?-1:1}).forEach(function(b){var y=sty(b.sid);rows.push([b.code,b.date,hm(b.start),hm(b.start+b.dur),y?y.name:"",b.name,b.phone,b.items.map(function(i){return i.name}).join("; "),b.sub,b.voucher,b.vd,b.rd,b.total,ST[b.status],b.source])});csv("booking-salon.csv",rows)};
A.csvRev=function(){var rg=repRange(),rows=[["Tanggal","Stylist","Kunjungan selesai","Pendapatan"]];for(var d=rg[0];d<=rg[1];d=addD(d,1)){db.stylists.forEach(function(y){var x=db.bookings.filter(function(b){return b.date===d&&b.sid===y.id&&b.status==="selesai"});if(x.length)rows.push([d,y.name,x.length,x.reduce(function(a,b){return a+b.total},0)])})}csv("pendapatan-salon.csv",rows)};

/* ----- promo dan pengaturan ----- */
function vDesc(v){return(v.type==="pct"?"Diskon "+v.value+"%":"Potongan "+rp(v.value))+(v.min?" untuk belanja mulai "+rp(v.min):"")}
function aPromo(){var o=db.salon;
 return'<div class="tool"><h2 style="margin:0" class="grow">Voucher</h2><button class="btn sm pri" data-act="vEdit" data-code="">+ Tambah voucher</button></div>'+(db.vouchers.length?db.vouchers.map(function(v){return'<div class="row'+(v.active?"":" off")+'"><div class="grow"><span class="code">'+esc(v.code)+'</span> '+(v.active?"":'<span class="badge st-tidak_hadir">Nonaktif</span>')+'<br><span class="small muted">'+esc(vDesc(v))+' &middot; dipakai '+v.used+'x</span></div><div class="btns"><button class="btn sm" data-act="vEdit" data-code="'+esc(v.code)+'">Ubah</button><button class="btn sm" data-act="vTog" data-code="'+esc(v.code)+'">'+(v.active?"Nonaktifkan":"Aktifkan")+'</button><button class="btn sm bad" data-act="vDel" data-code="'+esc(v.code)+'" data-sure="Tekan lagi">Hapus</button></div></div>'}).join(""):'<div class="none">Belum ada voucher.</div>')
 +'<h2 style="margin-top:24px">Pengaturan</h2><div class="card"><div class="two"><label class="f"><span>Batas ubah dan batal (jam sebelum jadwal)</span><input class="in" id="oC" type="number" min="0" max="72" value="'+o.cancelHours+'"></label><label class="f"><span>Booking online minimal (menit dari sekarang)</span><input class="in" id="oL" type="number" min="0" max="480" step="15" value="'+o.leadMin+'"></label></div><div class="two"><label class="f"><span>Poin per kunjungan selesai</span><input class="in" id="oV" type="number" min="0" max="100" value="'+o.ptsVisit+'"></label><label class="f"><span>Poin untuk satu penukaran</span><input class="in" id="oR" type="number" min="10" max="1000" value="'+o.ptsRedeem+'"></label></div><div class="two"><label class="f"><span>Nilai potongan penukaran (Rp)</span><input class="in" id="oN" type="number" min="0" max="500000" step="1000" value="'+o.redeemValue+'"></label><label class="f"><span>PIN panel (4 angka)</span><input class="in" id="oP" inputmode="numeric" maxlength="4" value="'+esc(o.pin)+'"></label></div><p class="err" id="oE" role="alert"></p><button class="btn pri" data-act="setSave">Simpan pengaturan</button></div>'
 +'<div class="card" style="margin-top:14px"><h3>Data demo</h3><p class="small muted">Kembalikan semua data ke contoh awal. Booking, pelanggan dan pengaturan yang kamu ubah akan hilang.</p><button class="btn bad" data-act="reset" data-sure="Tekan lagi untuk reset">Reset data demo</button></div>'}
A.setSave=function(){var g=function(id){return parseInt($(id).value,10)},E=function(m){$("oE").textContent=m},c=g("oC"),l=g("oL"),v=g("oV"),r=g("oR"),n=g("oN"),p=$("oP").value.trim();
 if(!(c>=0&&c<=72))return E("Batas ubah 0 sampai 72 jam.");if(!(l>=0&&l<=480))return E("Waktu minimal booking 0 sampai 480 menit.");if(!(v>=0&&v<=100))return E("Poin per kunjungan 0 sampai 100.");if(!(r>=10&&r<=1000))return E("Poin penukaran 10 sampai 1000.");if(!(n>=0&&n<=500000))return E("Nilai potongan tidak valid.");if(!/^\d{4}$/.test(p))return E("PIN harus 4 angka.");
 var o=db.salon;o.cancelHours=c;o.leadMin=l;o.ptsVisit=v;o.ptsRedeem=r;o.redeemValue=n;o.pin=p;save();toast("Pengaturan tersimpan");render(true)};
A.vEdit=function(el){var v=el.dataset.code?vch(el.dataset.code):{code:"",type:"pct",value:10,min:0,active:true};
 $("dlg").innerHTML='<div class="dh"><h3>'+(v.code?"Ubah":"Tambah")+' voucher</h3><button class="dx" data-act="dclose" aria-label="Tutup">&times;</button></div><div class="db"><label class="f"><span>Kode (huruf dan angka)</span><input class="in" id="vC" maxlength="12" value="'+esc(v.code)+'"'+(v.code?" readonly":"")+'></label><div class="two"><label class="f"><span>Jenis</span><select class="in" id="vT"><option value="pct"'+(v.type==="pct"?" selected":"")+'>Persen</option><option value="nom"'+(v.type==="nom"?" selected":"")+'>Nominal (Rp)</option></select></label><label class="f"><span>Nilai</span><input class="in" id="vV" type="number" min="1" value="'+v.value+'"></label></div><label class="f"><span>Minimal belanja (Rp)</span><input class="in" id="vM" type="number" min="0" step="1000" value="'+v.min+'"></label><label class="chk"><input type="checkbox" id="vA"'+(v.active?" checked":"")+'> Aktif</label><p class="err" id="vE" role="alert"></p><div class="btns"><button class="btn pri" data-act="vSave" data-code="'+esc(v.code)+'">Simpan</button><button class="btn" data-act="dclose">Batal</button></div></div>';openDlg()};
A.vSave=function(el){var E=function(m){$("vE").textContent=m},code=$("vC").value.trim().toUpperCase(),t=$("vT").value,val=parseInt($("vV").value,10),m=parseInt($("vM").value,10);
 if(!/^[A-Z0-9]{3,12}$/.test(code))return E("Kode 3 sampai 12 huruf atau angka.");if(!el.dataset.code&&vch(code))return E("Kode sudah dipakai.");if(!(val>=1)||(t==="pct"&&val>100))return E(t==="pct"?"Persen 1 sampai 100.":"Nilai harus lebih dari 0.");if(!(m>=0))return E("Minimal belanja tidak valid.");
 var v=el.dataset.code?vch(el.dataset.code):null;if(!v){v={code:code,used:0};db.vouchers.push(v)}v.type=t;v.value=val;v.min=m;v.active=$("vA").checked;v.desc=vDesc(v);save();closeDlg();toast("Voucher tersimpan");render(true)};
A.vTog=function(el){var v=vch(el.dataset.code);v.active=!v.active;save();toast(v.active?"Voucher diaktifkan":"Voucher dinonaktifkan");render(true)};
A.vDel=function(el){db.vouchers=db.vouchers.filter(function(v){return v.code!==el.dataset.code});save();toast("Voucher dihapus");render(true)};

/* ===== gerak dan pratinjau layanan ===== */
var io;
function reveal(){var l=document.querySelectorAll(".rv:not(.shown)");if(!l.length)return;
 if(!("IntersectionObserver" in window)||(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)){for(var i=0;i<l.length;i++)l[i].classList.add("shown");return}
 if(io)io.disconnect();io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("shown");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px",threshold:.05});
 for(var k=0;k<l.length;k++)io.observe(l[k])}
function plShow(b){var im=$("plImg");if(!im||!b||!b.dataset.pic)return;var src="img/"+b.dataset.pic+".jpg";if(im.getAttribute("src")===src)return;
 im.classList.add("sw");setTimeout(function(){im.src=src;$("plCap").textContent=b.dataset.nm||"";im.classList.remove("sw")},150)}
document.addEventListener("mouseover",function(e){var b=e.target.closest&&e.target.closest(".pl-b");if(b)plShow(b)});
document.addEventListener("focusin",function(e){var b=e.target.closest&&e.target.closest(".pl-b");if(b)plShow(b)});

/* ===== mulai ===== */
bk=freshBk();db=load();
window.addEventListener("error",function(e){window.__errs=(window.__errs||[]).concat(String(e.message))});
render();
