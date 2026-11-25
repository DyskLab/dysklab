"use strict";
/* UI situs publik, daftar anggota, jadwal, dan portal anggota */
var $=function(i){return document.getElementById(i)};
var view=$("view"),ov=$("ov"),sheetEl=$("sheet");
var SC={day:null,cls:""};
var RET="";
var lastFocus=null,toastT=null;
var IC={check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'};

function curMember(){var id=+sessionStorage.getItem(SESS)||0;return id?mById(id):null}
function isAdmin(){return sessionStorage.getItem(ADM)==="1"}
function toast(msg,bad){var t=$("toast");t.textContent=msg;t.className="toast on"+(bad?" bad":"");clearTimeout(toastT);toastT=setTimeout(function(){t.className="toast"},3200)}
function go(h){if(location.hash===h)route();else location.hash=h}
function badge(m){var s=STL[mState(m)];return '<span class="pill '+s[1]+'">'+s[0]+'</span>'}
function av(name,c1,c2,sm){return '<span class="av'+(sm?" sm":"")+'" style="--c1:'+esc(c1||"#2a8f6c")+';--c2:'+esc(c2||"#1b5d7a")+'" aria-hidden="true">'+esc(initials(name))+'</span>'}
function photo(c,ar,eager){
  if(c.photo)return '<div class="ph '+ar+'"><img src="img/'+esc(c.photo)+'.jpg" alt="'+esc(PHOTO_ALT[c.photo]||c.name)+'" width="1000" height="750"'+(eager?'':' loading="lazy"')+'></div>';
  return '<div class="ph '+ar+' noimg" style="background:linear-gradient(135deg,'+esc(c.color)+',#1b1b2b)" role="img" aria-label="'+esc(c.name)+'">'+esc(initials(c.name))+'</div>';
}
var PHOTO_ALT={"matras-yoga":"Matras yoga merah muda tergulung","kettlebell":"Dua kettlebell di rak","area-kardio":"Deretan mesin kardio di dekat jendela","plate-warna":"Plate dan barbel warna-warni di rak","sarung-tinju":"Sepasang sarung tinju kulit hitam","area-kelas":"Area latihan fungsional dengan matras karet","ruang-latihan":"Ruang latihan luas dengan rak beban dan lintasan rumput sintetis","dumbbell":"Dumbbell berplat hitam di rak"};
function pimg(n,ar,eager){return '<div class="ph '+ar+'"><img src="img/'+n+'.jpg" alt="'+esc(PHOTO_ALT[n])+'" width="1000" height="750"'+(eager?'':' loading="lazy"')+'></div>'}
function perMonth(p){return Math.round(p.price/p.months)}
function bestPlan(){var b=db.plans[0];db.plans.forEach(function(p){if(perMonth(p)<perMonth(b))b=p});return b}

/* ---------- sheet ---------- */
function openSheet(title,body,wide){
  lastFocus=document.activeElement;
  sheetEl.innerHTML='<div class="hh"><h3 id="sht">'+esc(title)+'</h3><button class="x" type="button" data-act="close" aria-label="Tutup">&times;</button></div>'+body;
  ov.classList.add("on");
  var f=sheetEl.querySelector("input:not([type=hidden]),select,textarea");if(f&&innerWidth>720)f.focus();else sheetEl.querySelector(".x").focus();
}
function closeSheet(){ov.classList.remove("on");sheetEl.innerHTML="";if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
function sheetOpen(){return ov.classList.contains("on")}
document.addEventListener("keydown",function(e){
  if(!sheetOpen())return;
  if(e.key==="Escape"){closeSheet();return}
  if(e.key==="Tab"){var f=[].slice.call(sheetEl.querySelectorAll("a[href],button:not([disabled]),input:not([type=hidden]),select,textarea")).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault()}}
});
ov.addEventListener("mousedown",function(e){if(e.target===ov)closeSheet()});
function ferr(form,msg){var e=form.querySelector(".err");if(!e){e=document.createElement("div");e.className="err";e.setAttribute("role","alert");form.insertBefore(e,form.firstChild)}e.textContent=msg;e.scrollIntoView({block:"nearest"});return false}
function fclr(form){var e=form.querySelector(".err");if(e)e.remove()}

/* ---------- grafik ---------- */
function barChart(vals,labels,fmt,color){
  var W=600,H=150,pl=8,pb=20,mx=Math.max.apply(null,vals.concat([1])),n=vals.length,bw=(W-pl*2)/n,out='';
  vals.forEach(function(v,i){var h=Math.round((H-pb-14)*v/mx),x=pl+i*bw;out+='<rect x="'+(x+bw*.15).toFixed(1)+'" y="'+(H-pb-h)+'" width="'+(bw*.7).toFixed(1)+'" height="'+Math.max(h,v?2:0)+'" rx="2" fill="'+(color||"#b8f23a")+'"><title>'+esc(labels[i])+": "+esc(fmt?fmt(v):v)+'</title></rect>'});
  var step=Math.ceil(n/7);labels.forEach(function(l,i){if(i%step===0||i===n-1)out+='<text x="'+(pl+i*bw+bw/2).toFixed(1)+'" y="'+(H-5)+'" text-anchor="middle">'+esc(l)+'</text>'});
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik batang, nilai tertinggi '+esc(fmt?fmt(mx):mx)+'"><text x="'+pl+'" y="10">'+esc(fmt?fmt(mx):mx)+'</text><line x1="'+pl+'" x2="'+(W-pl)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'" stroke="#2a3830"/>'+out+'</svg>';
}
function lineChart(pts,unit){
  var W=600,H=190,L=40,Rr=14,T=14,B=26,ys=pts.map(function(p){return p.y}),lo=Math.min.apply(null,ys),hi=Math.max.apply(null,ys);
  if(hi-lo<2){hi+=1;lo-=1}var pad=(hi-lo)*.15;lo-=pad;hi+=pad;
  function X(i){return L+(pts.length>1?i*(W-L-Rr)/(pts.length-1):(W-L-Rr)/2)}function Y(v){return T+(H-T-B)*(1-(v-lo)/(hi-lo))}
  var d="",dots="",grid="";
  pts.forEach(function(p,i){d+=(i?"L":"M")+X(i).toFixed(1)+" "+Y(p.y).toFixed(1);dots+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="4" fill="#b8f23a"><title>'+esc(p.l)+": "+p.y+" "+unit+'</title></circle>'});
  [0,1,2].forEach(function(k){var v=lo+(hi-lo)*k/2,y=Y(v);grid+='<line x1="'+L+'" x2="'+(W-Rr)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="#2a3830"/><text x="'+(L-6)+'" y="'+(y+3).toFixed(1)+'" text-anchor="end">'+v.toFixed(1)+'</text>'});
  var xl='<text x="'+X(0)+'" y="'+(H-6)+'" text-anchor="'+(pts.length>1?"start":"middle")+'">'+esc(pts[0].l)+'</text>';
  if(pts.length>1)xl+='<text x="'+X(pts.length-1)+'" y="'+(H-6)+'" text-anchor="end">'+esc(pts[pts.length-1].l)+'</text>';
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik berat badan dari '+pts[0].y+' ke '+pts[pts.length-1].y+' '+unit+'">'+grid+'<path d="'+d+'" fill="none" stroke="#b8f23a" stroke-width="2.5" stroke-linejoin="round"/>'+dots+xl+'</svg>';
}

/* ---------- kartu & struk ---------- */
function cardHtml(m){
  var pl=plan(m.planId);
  return '<div class="mcard printable" id="mcard"><div class="top"><div class="gn"><i aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M3 9v6M6.5 6v12M17.5 6v12M21 9v6M6.5 12h11"/></svg></i>Kinetik Fit Center</div><span style="font-size:11px;opacity:.8">KARTU ANGGOTA</span></div>'+
  '<div><div class="nm">'+esc(m.name)+'</div><div class="meta"><span>Paket<b>'+esc(pl.name)+'</b></span><span>Berlaku sampai<b>'+fmtDate(m.end)+'</b></span><span>Sejak<b>'+fmtDate(m.joined)+'</b></span></div></div>'+
  '<div class="bc">'+barcode(m.no)+'<small>'+esc(m.no)+'</small></div></div>';
}
function receiptHtml(p){
  var base=p.amount+(p.disc||0);
  return '<div class="rc printable"><h4>Kinetik Fit Center</h4><div style="font-size:12px;color:#555">Jl. Contoh Raya No. 12, Kota Contoh</div><hr>'+
  '<div class="sum"><div><span>No. struk</span><b>'+esc(p.no)+'</b></div><div><span>Tanggal</span><span>'+fmtDate(dOf(p.at))+' '+hm(p.at)+'</span></div><div><span>Pelanggan</span><span>'+esc(p.name)+'</span></div></div><hr>'+
  '<div class="sum"><div><span>'+esc(p.label)+'</span><span>'+rp(base)+'</span></div>'+(p.disc?'<div><span>Promo '+esc(p.promo)+'</span><span>-'+rp(p.disc)+'</span></div>':'')+'<div class="tot"><span>Total</span><span>'+rp(p.amount)+'</span></div><div><span>Metode</span><span>'+esc(p.method)+'</span></div></div><hr><div style="font-size:12px;text-align:center;color:#555">Terima kasih. Struk contoh untuk demo.</div></div>';
}
function openReceipt(p){openSheet("Struk "+p.no,receiptHtml(p)+'<div class="rowf" style="margin-top:12px"><button class="btn p" type="button" data-act="print">Cetak struk</button><button class="btn" type="button" data-act="close">Tutup</button></div>')}

/* ---------- renew sheet (admin, kasir, portal) ---------- */
function openRenew(mid,ctx){
  var m=mById(mid);if(!m)return;
  if(m.frozen){toast("Aktifkan kembali keanggotaan dulu sebelum perpanjang.",1);return}
  var pm=ctx==="portal"?["QRIS","Transfer virtual account"]:["Tunai","QRIS","Transfer","Kartu debit"];
  var opts=db.plans.map(function(p,i){return '<label class="opt'+(p.id===m.planId?" on":"")+'"><input type="radio" name="plan" value="'+p.id+'"'+(p.id===m.planId?" checked":"")+'><span><b>'+esc(p.name)+'</b> &middot; '+rp(p.price)+'<br><span class="mu sm">'+rp(perMonth(p))+' per bulan</span></span></label>'}).join("");
  openSheet("Perpanjang keanggotaan",'<form data-form="renew" data-live="renew" novalidate><input type="hidden" name="mid" value="'+m.id+'"><input type="hidden" name="ctx" value="'+ctx+'">'+
  '<p class="mu sm">'+esc(m.name)+' ('+esc(m.no)+'), berlaku sampai '+fmtDate(m.end)+'.</p>'+opts+
  '<label class="fld"><span>Kode promo (opsional)</span><input class="inp" name="promo" autocomplete="off" maxlength="20" placeholder="mis. BARU10"></label>'+
  '<label class="fld"><span>Metode bayar'+(ctx==="portal"?" (simulasi)":"")+'</span><select name="method">'+pm.map(function(x){return '<option>'+x+'</option>'}).join("")+'</select></label>'+
  '<div class="sum" id="rsum" style="margin-bottom:12px"></div><button class="btn p w" type="submit">'+(ctx==="portal"?"Bayar (simulasi)":"Proses pembayaran")+'</button></form>');
  updateRenewSum(sheetEl.querySelector("form"));
}
function updateRenewSum(form){
  var m=mById(+form.mid.value),pid=+(form.querySelector("input[name=plan]:checked")||{}).value,pl=plan(pid),box=$("rsum");if(!pl||!box)return;
  var pr=calcPromo(form.promo.value,pl),rd=renewDates(m,pl);
  [].forEach.call(form.querySelectorAll(".opt"),function(o){o.classList.toggle("on",o.querySelector("input").checked)});
  box.innerHTML='<div><span>Paket '+esc(pl.name)+'</span><span>'+rp(pl.price)+'</span></div>'+(pr.disc?'<div><span>Promo</span><span>-'+rp(pr.disc)+'</span></div>':'')+'<div class="tot"><span>Total</span><span>'+rp(pl.price-pr.disc)+'</span></div><div class="mu sm"><span>Berlaku '+fmtDate(rd.start)+' sampai '+fmtDate(rd.end)+'</span></div>'+(form.promo.value.trim()?'<div class="sm" style="'+(pr.ok?"color:var(--gn)":"color:var(--rd)")+'"><span>'+esc(pr.msg)+'</span></div>':'');
}

/* ---------- routing ---------- */
function parseHash(){var h=location.hash.replace(/^#\/?/,"");var q=h.indexOf("?");if(q>-1)h=h.slice(0,q);var p=h.split("/");return{r:p[0]||"home",a:p[1]||"",b:p[2]||""}}
var TITLES={home:"Beranda",paket:"Paket keanggotaan",jadwal:"Jadwal kelas",daftar:"Daftar anggota",portal:"Portal anggota",admin:"Panel gym",kartu:"Kartu anggota"};
function route(fresh){
  var h=parseHash(),keep=(fresh===false)?window.pageYOffset:0;
  closeSheetSilent();
  var html;
  switch(h.r){
    case"paket":html=viewPaket();break;
    case"jadwal":html=viewJadwal();break;
    case"daftar":html=viewDaftar();break;
    case"kartu":html=viewKartu(h.a);break;
    case"portal":html=viewPortal(h.a);break;
    case"admin":html=viewAdmin(h.a);break;
    default:html=viewHome();h.r="home";
  }
  view.innerHTML=html;
  [].forEach.call(document.querySelectorAll("#nav a"),function(a){a.classList.toggle("cur",a.dataset.r===h.r)});
  document.title=(TITLES[h.r]||"Kinetik Fit Center")+" | Kinetik Fit Center";
  $("nav").classList.remove("on");$("menub").setAttribute("aria-expanded","false");
  if(h.r==="admin"&&typeof adminMount==="function")adminMount(h.a);
  window.scrollTo(0,keep);
}
function closeSheetSilent(){if(sheetOpen()){ov.classList.remove("on");sheetEl.innerHTML=""}}
function rerender(){var y=window.pageYOffset,open=sheetOpen();var h=parseHash();var html;route(false);window.scrollTo(0,y)}
window.addEventListener("hashchange",function(){route(true)});

/* ---------- beranda ---------- */
function viewHome(){
  var best=bestPlan();
  var plans=db.plans.map(planCard).join("");
  var cl=liveClasses().map(function(c){return '<article class="card flat cls">'+photo(c,"ar43")+'<div class="bd"><div><span class="pill">'+esc(c.level)+'</span> <span class="pill">'+c.dur+' menit</span></div><h3>'+esc(c.name)+'</h3><p class="mu sm" style="margin:0">'+esc(c.desc)+'</p><div style="margin-top:auto;padding-top:8px"><button class="btn s w" type="button" data-act="seeclass" data-id="'+c.id+'">Lihat jadwal '+esc(c.name)+'</button></div></div></article>'}).join("");
  var co=db.coaches.map(function(c){return '<div class="card coach">'+av(c.name,c.c1,c.c2)+'<div><b>'+esc(c.name)+'</b><div class="mu sm">'+esc(c.spec)+'</div></div></div>'}).join("");
  var fi=["Loker dan shower","Musala","Parkir motor dan mobil","Area peregangan","Penitipan tas","Air minum isi ulang"].map(function(x){return '<div>'+IC.check+x+'</div>'}).join("");
  return '<section class="hero"><div class="ph">'+'<img src="img/ruang-latihan.jpg" alt="'+esc(PHOTO_ALT["ruang-latihan"])+'" width="1000" height="750"></div><div class="wrap"><div class="in"><span class="eyebrow">Pusat kebugaran demo</span><h1>Latihan teratur mulai dari <em>satu kartu</em>.</h1><p>Daftar online, booking kelas, dan pantau masa aktif keanggotaan dari ponsel. Datang, pindai kartu, latihan.</p><div class="cta"><a class="btn p" href="#/daftar">Daftar sekarang</a><a class="btn" href="#/jadwal">Lihat jadwal kelas</a></div><div class="facts"><span><b>06.00 sampai 22.00</b> buka setiap hari</span><span><b>'+liveClasses().length+'</b> jenis kelas</span><span><b>Booking</b> dengan daftar tunggu otomatis</span></div></div></div></section>'+
  '<section class="sec"><div class="wrap"><span class="eyebrow">Paket keanggotaan</span><h2>Pilih masa berlatih</h2><p class="lead">Makin panjang paketnya, makin murah per bulan. Biaya kartu '+rp(REG_FEE)+' hanya sekali saat mendaftar.</p><div class="grid g3" style="margin-top:22px">'+plans+'</div><p class="sm mu" style="margin-top:12px">Punya kode promo? Masukkan saat mendaftar. <a href="#/paket">Lihat semua kode aktif</a>.</p></div></section>'+
  '<section class="sec alt"><div class="wrap"><span class="eyebrow">Kelas grup</span><h2>'+liveClasses().length+' kelas, semua termasuk paket</h2><div class="grid g3" style="margin-top:22px">'+cl+'</div></div></section>'+
  '<section class="sec"><div class="wrap"><span class="eyebrow">Pelatih</span><h2>Dipandu pelatih tetap</h2><div class="grid g3" style="margin-top:18px">'+co+'</div></div></section>'+
  '<section class="sec alt"><div class="wrap"><span class="eyebrow">Fasilitas</span><h2>Ruang latihan yang lapang</h2><div class="fac" style="margin-top:18px"><div class="it big">'+pimg("ruang-latihan","ar43")+'<span>Rak beban dan lintasan sprint</span></div><div class="it">'+pimg("area-kardio","ar43")+'<span>Area kardio</span></div><div class="it">'+pimg("dumbbell","ar43")+'<span>Dumbbell sampai berat</span></div><div class="it">'+pimg("plate-warna","ar43")+'<span>Plate dan barbel kelas</span></div><div class="it">'+pimg("kettlebell","ar43")+'<span>Kettlebell</span></div></div><div class="ficons">'+fi+'</div></div></section>'+
  '<section class="sec"><div class="wrap" style="text-align:center"><h2>Sudah jadi anggota?</h2><p class="lead" style="margin:0 auto 16px">Masuk ke portal dengan nomor anggota dan telepon untuk booking kelas dan melihat sisa masa aktif.</p><div class="cta" style="justify-content:center"><a class="btn p" href="#/portal">Portal anggota</a><a class="btn" href="#/daftar">Daftar baru</a></div></div></section>';
}
function planCard(p){
  var hot=bestPlan().id===p.id;
  return '<article class="card plan'+(hot?" hot":"")+'">'+(hot?'<span class="tag">Paling hemat</span>':'')+'<h3>'+esc(p.name)+'</h3><div class="price">'+rp(p.price)+'</div><div class="mu sm">'+rp(perMonth(p))+' per bulan &middot; '+p.months+' bulan</div><ul class="perks">'+p.perks.map(function(x){return '<li>'+IC.check+'<span>'+esc(x)+'</span></li>'}).join("")+'</ul><button class="btn '+(hot?"p":"")+' w" type="button" data-act="pickplan" data-id="'+p.id+'" style="margin-top:auto">Daftar paket '+esc(p.name)+'</button></article>';
}
function viewPaket(){
  var pr=db.promos.filter(function(x){return x.active}).map(function(x){return '<div class="li"><div class="l"><b>'+esc(x.code)+'</b><div class="mu sm">'+(x.type==="pct"?x.val+"% dari harga paket":"Potongan "+rp(x.val))+', paket minimal '+x.minMonths+' bulan'+(x.max?', kuota tersisa '+Math.max(0,x.max-x.used):"")+'</div></div></div>'}).join("")||'<div class="empty">Belum ada promo aktif.</div>';
  return '<div class="page"><div class="wrap"><span class="eyebrow">Paket</span><h1 style="font-size:clamp(26px,5vw,40px)">Paket keanggotaan</h1><p class="lead">Semua paket memberi akses gym dan kelas grup. Pembayaran di sini hanya simulasi.</p><div class="grid g3" style="margin:22px 0">'+db.plans.map(planCard).join("")+'</div><div class="split"><div><h2 style="font-size:22px">Aturan singkat</h2><div class="list"><div class="li"><div class="l">Biaya kartu anggota '+rp(REG_FEE)+', hanya saat pendaftaran pertama.</div></div><div class="li"><div class="l">Masa aktif dihitung dari tanggal mulai yang Anda pilih (sampai 30 hari ke depan).</div></div><div class="li"><div class="l">Paket 3 bulan dan tahunan boleh dibekukan, total maksimal '+FREEZE_MAX+' hari per periode. Masa aktif diperpanjang sebanyak hari beku.</div></div><div class="li"><div class="l">Booking kelas bisa dibatalkan sampai 2 jam sebelum mulai. Kelas penuh menerima daftar tunggu.</div></div></div></div><div><h2 style="font-size:22px">Kode promo aktif</h2><div class="list">'+pr+'</div></div></div></div></div>';
}

/* ---------- jadwal ---------- */
function weekDates(){var t=today(),a=[];for(var i=0;i<7;i++)a.push(addDays(t,i));return a}
function viewJadwal(){
  var dates=weekDates(),m=curMember();if(!SC.day||dates.indexOf(SC.day)<0)SC.day=dates[0];
  var days=dates.map(function(d){var dt=P(d);return '<button class="day'+(d===SC.day?" on":"")+'" type="button" data-act="day" data-d="'+d+'" aria-pressed="'+(d===SC.day)+'"><span>'+DOWS[dt.getDay()]+'</span><b>'+dt.getDate()+'</b></button>'}).join("");
  var co='<option value="">Semua kelas</option>'+liveClasses().map(function(c){return '<option value="'+c.id+'"'+(String(c.id)===String(SC.cls)?" selected":"")+'>'+esc(c.name)+'</option>'}).join("");
  return '<div class="page"><div class="wrap"><span class="eyebrow">Jadwal</span><h1 style="font-size:clamp(26px,5vw,40px)">Jadwal kelas mingguan</h1>'+
  (m?'<div class="hint">Masuk sebagai <b>'+esc(m.name)+'</b> ('+esc(m.no)+'). Booking langsung tercatat di portal Anda.</div>':'<div class="hint">Untuk booking, masuk dulu lewat <a href="#/portal">portal anggota</a>. Contoh demo: <b>GYM-0001</b> dengan telepon <b>0812-0000-0001</b>.</div>')+
  '<div class="days" role="group" aria-label="Pilih hari">'+days+'</div><div class="toolbar"><label class="fld"><span>Filter kelas</span><select id="clsf" data-act-change="clsf">'+co+'</select></label></div><div id="slots">'+slotsHtml()+'</div></div></div>';
}
function slotsHtml(){
  var list=dayInstances(SC.day).filter(function(s){return !SC.cls||String(s.classId)===String(SC.cls)});
  if(!list.length)return '<div class="empty">Tidak ada kelas pada hari ini'+(SC.cls?" untuk kelas yang dipilih":"")+'.</div>';
  return '<div class="grid g2">'+list.map(function(s){return slotCard(s,SC.day)}).join("")+'</div>';
}
function slotCard(s,date){
  var c=cls(s.classId),co=coach(s.coachId),m=curMember(),bk=booked(s.id,date),w=waitN(s.id,date),full=bk>=s.cap;
  var st=startOf(date,s.time),en=endOf(date,s),now=new Date(),past=st<=now,mine=m?myBooking(m.id,s.id,date):null,act="";
  if(past)act='<span class="pill mt">'+(en>now?"Sedang berlangsung":"Selesai")+'</span>';
  else if(mine&&mine.status==="booked")act='<span class="pill ok">Anda terdaftar</span> <button class="btn s d" type="button" data-act="cancelb" data-id="'+mine.id+'">Batalkan</button>';
  else if(mine&&mine.status==="wait")act='<span class="pill wr">Daftar tunggu #'+(bookingsOf(s.id,date,"wait").map(function(b){return b.id}).indexOf(mine.id)+1)+'</span> <button class="btn s d" type="button" data-act="cancelb" data-id="'+mine.id+'">Keluar antrean</button>';
  else act='<button class="btn s '+(full?"":"p")+'" type="button" data-act="book" data-sid="'+s.id+'" data-date="'+date+'">'+(full?"Masuk daftar tunggu":"Booking")+'</button>';
  return '<article class="card slot"><div class="t">'+s.time.replace(":",".")+'<small>s.d. '+hm(en)+'</small></div><div><h3 style="margin:0">'+esc(c.name)+'</h3><div class="mu sm">'+esc(co?co.name:"-")+' &middot; '+esc(s.room)+' &middot; '+esc(c.level)+'</div><div class="cap'+(full?" full":"")+'"><i style="width:'+Math.min(100,Math.round(bk/s.cap*100))+'%"></i></div><div class="row"><span class="sm">'+(full?'<b style="color:var(--or)">Penuh</b>'+(w?" &middot; "+w+" menunggu":""):'<b>'+(s.cap-bk)+'</b> dari '+s.cap+' tempat tersisa')+'</span></div><div class="row" style="margin-top:10px">'+act+'</div></div></article>';
}
function doBook(sid,date){
  var m=curMember();
  if(!m){RET="#/jadwal";toast("Masuk dulu ke portal untuk booking.",1);go("#/portal");return}
  var r=bookClass(m.id,sid,date);toast(r.msg,!r.ok);rerender();
}

/* ---------- daftar anggota ---------- */
var REG=null;
function newReg(){return{step:1,name:"",phone:"",email:"",birth:"",goal:"Kebugaran umum",agree:false,planId:2,start:today(),promo:"",method:"QRIS",paying:false,done:null}}
function viewDaftar(){
  if(!REG)REG=newReg();var r=REG;
  if(r.done)return viewDone();
  var steps=["Data diri","Paket","Pembayaran"].map(function(s,i){return '<li class="'+(r.step>=i+1?"on":"")+'">'+(i+1)+'. '+s+'</li>'}).join("");
  var body="";
  if(r.step===1)body='<form data-form="reg1" novalidate><label class="fld"><span>Nama lengkap</span><input class="inp" name="name" value="'+esc(r.name)+'" maxlength="60" autocomplete="name" required></label><div class="two k"><label class="fld"><span>Nomor telepon</span><input class="inp" name="phone" value="'+esc(r.phone)+'" inputmode="tel" placeholder="0812-0000-1234" autocomplete="tel" required></label><label class="fld"><span>Tanggal lahir</span><input class="inp" type="date" name="birth" value="'+esc(r.birth)+'" max="'+today()+'" required></label></div><label class="fld"><span>Email (opsional)</span><input class="inp" type="email" name="email" value="'+esc(r.email)+'" maxlength="80" autocomplete="email"></label><label class="fld"><span>Tujuan latihan</span><select name="goal">'+["Turun berat badan","Tambah massa otot","Kebugaran umum","Kelenturan"].map(function(g){return '<option'+(g===r.goal?" selected":"")+'>'+g+'</option>'}).join("")+'</select></label><label class="chk"><input type="checkbox" name="agree"'+(r.agree?" checked":"")+'><span>Saya sehat untuk berolahraga dan menyetujui tata tertib gym.</span></label><button class="btn p w" type="submit">Lanjut pilih paket</button></form>';
  else if(r.step===2){
    var pl=plan(r.planId),pr=calcPromo(r.promo,pl,true);
    body='<form data-form="reg2" data-live="reg" novalidate>'+db.plans.map(function(p){return '<label class="opt'+(p.id===r.planId?" on":"")+'"><input type="radio" name="plan" value="'+p.id+'"'+(p.id===r.planId?" checked":"")+'><span><b>'+esc(p.name)+'</b> &middot; '+rp(p.price)+'<br><span class="mu sm">'+rp(perMonth(p))+' per bulan'+(p.id===bestPlan().id?" &middot; paling hemat":"")+'</span></span></label>'}).join("")+
    '<label class="fld"><span>Mulai berlaku</span><input class="inp" type="date" name="start" value="'+r.start+'" min="'+today()+'" max="'+addDays(today(),30)+'"></label><div class="rowf" style="align-items:end"><label class="fld" style="flex:1 1 160px;margin:0"><span>Kode promo (opsional)</span><input class="inp" name="promo" value="'+esc(r.promo)+'" maxlength="20" autocomplete="off"></label><button class="btn" type="button" data-act="applypromo">Pakai kode</button></div><div id="pmsg" class="sm" style="margin:6px 0 12px;min-height:20px;color:'+(pr.ok?"var(--gn)":"var(--rd)")+'">'+esc(r.promo?pr.msg:"")+'</div><div class="rowf"><button class="btn" type="button" data-act="regback">Kembali</button><button class="btn p" type="submit">Lanjut ke pembayaran</button></div></form>';
  }else body=regPay();
  return '<div class="page"><div class="wrap" style="max-width:920px"><span class="eyebrow">Pendaftaran</span><h1 style="font-size:clamp(26px,5vw,40px)">Daftar anggota baru</h1><ol class="steps" aria-label="Langkah">'+steps+'</ol><div class="split"><div class="card">'+body+'</div>'+regSummary()+'</div></div></div>';
}
function regTotals(){var pl=plan(REG.planId),pr=calcPromo(REG.promo,pl,true),disc=pr.ok?pr.disc:0;return{pl:pl,pr:pr,disc:disc,total:pl.price-disc+REG_FEE,end:addDays(addMonths(REG.start,pl.months),-1)}}
function regSummary(){
  var r=REG,t=regTotals();
  return '<aside class="card sticky"><h3>Ringkasan</h3><div class="sum"><div><span>Paket '+esc(t.pl.name)+'</span><span>'+rp(t.pl.price)+'</span></div><div><span>Biaya kartu</span><span>'+rp(REG_FEE)+'</span></div>'+(t.disc?'<div><span>Promo '+esc(r.promo.toUpperCase())+'</span><span>-'+rp(t.disc)+'</span></div>':'')+'<div class="tot"><span>Total</span><span>'+rp(t.total)+'</span></div></div><p class="mu sm" style="margin:10px 0 0">Berlaku '+fmtDate(r.start)+' sampai '+fmtDate(t.end)+'.</p></aside>';
}
function regPay(){
  var r=REG,t=regTotals();
  var ms=["QRIS","Transfer virtual account","Bayar tunai di gym"];
  if(!r.paying)return '<form data-form="reg3" novalidate><h3>Metode pembayaran</h3>'+ms.map(function(x){return '<label class="opt'+(x===r.method?" on":"")+'"><input type="radio" name="method" value="'+x+'"'+(x===r.method?" checked":"")+'><span><b>'+x+'</b></span></label>'}).join("")+'<div class="rowf"><button class="btn" type="button" data-act="regback">Kembali</button><button class="btn p" type="submit">Lanjut bayar '+rp(t.total)+'</button></div></form>';
  var info=r.method==="QRIS"?'<div class="av" style="width:90px;height:90px;border-radius:12px;background:#fff;color:#111;font-size:12px;text-align:center">QRIS<br>contoh</div><div class="sm mu">Pindai kode QRIS di aplikasi pembayaran Anda (simulasi).</div>':r.method==="Transfer virtual account"?'<div class="mu sm">Nomor virtual account (contoh)</div><div class="va">8800 0000 1234</div>':'<div class="mu sm">Bayar tunai ke kasir saat datang. Pada demo ini dianggap lunas.</div>';
  return '<h3>Selesaikan pembayaran</h3><div class="pay">'+info+'<div class="b" style="font-size:20px">'+rp(t.total)+'</div></div><p class="mu sm">Ini simulasi. Tidak ada uang sungguhan yang diproses.</p><div class="rowf"><button class="btn" type="button" data-act="regunpay">Ganti metode</button><button class="btn p" type="button" data-act="regpaid">Saya sudah bayar (simulasi)</button></div>';
}
function viewDone(){
  var m=mById(REG.done.mid),p=REG.done.pay;
  return '<div class="page"><div class="wrap" style="max-width:720px"><div class="okm" role="status"><b>Pendaftaran berhasil.</b> Selamat bergabung, '+esc(m.name)+'.</div>'+cardHtml(m)+'<div class="card" style="margin-top:14px"><h3>Untuk masuk ke portal</h3><p class="sm" style="margin:0">Nomor anggota <b>'+esc(m.no)+'</b> dan telepon <b>'+esc(fmtPhone(m.phone))+'</b>. Tunjukkan kode batang di kartu saat check-in.</p></div><div class="rowf" style="margin-top:14px"><button class="btn p" type="button" data-act="print">Cetak kartu</button><button class="btn" type="button" data-act="receipt" data-id="'+p.id+'">Lihat struk</button><button class="btn" type="button" data-act="regtoportal">Buka portal</button><button class="btn" type="button" data-act="regnew">Daftar anggota lain</button></div></div></div>';
}
function createMember(r,method){
  var t=regTotals(),id=nid("m"),no="GYM-"+("0000"+id).slice(-4);
  var m={id:id,no:no,name:r.name.trim(),phone:normPhone(r.phone),email:r.email.trim(),birth:r.birth,planId:r.planId,start:r.start,end:t.end,frozen:null,freezeDays:0,joined:today(),note:"",goal:r.goal};
  db.members.push(m);
  if(t.pr.promo&&t.pr.ok)t.pr.promo.used++;
  var pay=addPayment({mid:id,name:m.name,kind:"daftar",label:"Paket "+t.pl.name+" + kartu",amount:t.total,disc:t.disc,promo:t.pr.promo&&t.pr.ok?t.pr.promo.code:"",method:method});
  db.notifs.push({id:nid("n"),mid:id,at:nowIso(),text:"Selamat datang di Kinetik Fit Center."});
  save();return{m:m,pay:pay};
}
function validateReg1(f){
  var name=f.name.value.trim(),ph=normPhone(f.phone.value),em=f.email.value.trim(),b=f.birth.value;
  if(name.length<3)return"Nama minimal 3 huruf.";
  if(!/^[A-Za-zÀ-ɏ .,'\-]+$/.test(name))return"Nama hanya boleh berisi huruf dan spasi.";
  if(!/^08\d{8,11}$/.test(ph))return"Nomor telepon harus diawali 08 dan 10 sampai 13 angka.";
  if(memberByPhone(ph))return"Nomor ini sudah terdaftar sebagai anggota. Masuk lewat portal anggota.";
  if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return"Format email belum benar.";
  if(!b)return"Tanggal lahir wajib diisi.";
  var age=diff(b,today())/365.25;if(age<12)return"Usia minimal 12 tahun.";if(age>90)return"Periksa tanggal lahir Anda.";
  if(!f.agree.checked)return"Centang persetujuan tata tertib untuk melanjutkan.";
  return"";
}

/* ---------- kartu ---------- */
function viewKartu(no){
  var m=memberByNo(no),me=curMember();
  if(!m)return '<div class="page"><div class="wrap"><div class="empty">Kartu tidak ditemukan.</div></div></div>';
  if(!isAdmin()&&!(me&&me.id===m.id))return '<div class="page"><div class="wrap" style="max-width:520px"><div class="err">Masuk dulu untuk melihat kartu anggota.</div><a class="btn p" href="#/portal">Ke portal anggota</a></div></div>';
  return '<div class="page"><div class="wrap" style="max-width:520px"><h1 style="font-size:28px">Kartu anggota</h1><p class="mu">Cetak atau simpan sebagai PDF. Kode batang dibaca pemindai di meja check-in.</p>'+cardHtml(m)+'<div class="rowf nopr" style="margin-top:14px"><button class="btn p" type="button" data-act="print">Cetak kartu</button><a class="btn" href="'+(isAdmin()?"#/admin/anggota":"#/portal")+'">Kembali</a></div></div></div>';
}

/* ---------- portal ---------- */
function viewPortal(tab){
  var m=curMember();
  if(!m)return '<div class="page"><div class="wrap" style="max-width:460px"><span class="eyebrow">Portal anggota</span><h1 style="font-size:30px">Masuk</h1><div class="hint">Demo: nomor <b>GYM-0001</b>, telepon <b>0812-0000-0001</b>. Anggota lain: GYM-0002 sampai GYM-0030 dengan telepon 0812-0000-00NN.</div><form class="card" data-form="login" novalidate><label class="fld"><span>Nomor anggota</span><input class="inp" name="no" placeholder="GYM-0001" autocomplete="username" required></label><label class="fld"><span>Nomor telepon</span><input class="inp" name="phone" inputmode="tel" placeholder="0812-0000-0001" autocomplete="tel" required></label><button class="btn p w" type="submit">Masuk</button></form><p class="sm mu" style="margin-top:12px">Belum punya kartu? <a href="#/daftar">Daftar anggota</a>.</p></div></div>';
  tab=tab||"ringkasan";
  var tabs=[["ringkasan","Ringkasan"],["booking","Booking saya"],["kunjungan","Kunjungan"],["latihan","Catatan latihan"]].map(function(t){return '<a class="tab'+(t[0]===tab?" on":"")+'" href="#/portal/'+t[0]+'">'+t[1]+'</a>'}).join("");
  var body={ringkasan:pRingkasan,booking:pBooking,kunjungan:pKunjungan,latihan:pLatihan}[tab]||pRingkasan;
  return '<div class="page"><div class="wrap" style="max-width:980px"><div class="rowf" style="align-items:center;justify-content:space-between;margin-bottom:14px"><div class="coach">'+av(m.name,null,null)+'<div><h1 style="font-size:24px;margin:0">'+esc(m.name)+'</h1><div class="mu sm">'+esc(m.no)+' &middot; '+badge(m)+'</div></div></div><button class="btn s" type="button" data-act="logout" style="flex:none">Keluar</button></div><nav class="tabs" aria-label="Menu portal">'+tabs+'</nav>'+body(m)+'</div></div>';
}
function pRingkasan(m){
  var pl=plan(m.planId),st=mState(m),left=remaining(m),total=Math.max(1,diff(m.start,m.end)+1),used=Math.min(total,Math.max(0,diff(m.start,today())+1)),pct=st==="expired"?100:Math.round(used/total*100);
  var cl=st==="expired"?"bad":st==="soon"?"warn":"";
  var lbl=st==="expired"?"Berakhir "+Math.abs(left)+" hari lalu":st==="frozen"?"Dibekukan sejak "+fmtDate(m.frozen.since):st==="notyet"?"Mulai "+fmtDate(m.start):left+" hari lagi";
  var t=today(),mo=t.slice(0,7),vis=db.visits.filter(function(v){return v.mid===m.id&&dOf(v.at).slice(0,7)===mo}).length;
  var up=db.bookings.filter(function(b){return b.mid===m.id&&(b.status==="booked"||b.status==="wait")&&b.date>=t}).length;
  var lastW=db.workouts.filter(function(w){return w.mid===m.id&&w.weight}).sort(function(a,b){return a.date<b.date?1:-1})[0];
  var fr=m.frozen?'<button class="btn" type="button" data-act="unfreeze">Aktifkan kembali</button>':(pl.months>=3&&(st==="active"||st==="soon")?'<button class="btn" type="button" data-act="freezeq">Bekukan keanggotaan</button>':'');
  var ns=db.notifs.filter(function(n){return n.mid===m.id}).sort(function(a,b){return a.id<b.id?1:-1}).slice(0,4).map(function(n){return '<div class="li"><div class="l sm">'+esc(n.text)+'</div><span class="mu sm">'+fmtDate(dOf(n.at))+'</span></div>'}).join("");
  return '<div class="split"><div><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div class="mu sm">Paket '+esc(pl.name)+'</div><div style="font-size:26px;font-weight:800">'+lbl+'</div></div>'+badge(m)+'</div><div class="bar '+cl+'" style="margin:14px 0 8px" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100" aria-label="Masa aktif terpakai"><i style="width:'+pct+'%"></i></div><div class="sm mu">'+fmtDate(m.start)+' sampai '+fmtDate(m.end)+(m.freezeDays?' &middot; hari beku terpakai '+m.freezeDays+' dari '+FREEZE_MAX:'')+'</div><div class="rowf" style="margin-top:14px"><button class="btn p" type="button" data-act="renewp">Perpanjang</button>'+fr+'<a class="btn" href="#/kartu/'+esc(m.no)+'">Kartu anggota</a></div></div><div class="grid g3" style="margin-top:14px"><div class="stat"><b>'+vis+'</b><span>Kunjungan bulan ini</span></div><div class="stat"><b>'+up+'</b><span>Booking mendatang</span></div><div class="stat"><b>'+(lastW?lastW.weight+" kg":"-")+'</b><span>Berat terakhir dicatat</span></div></div></div><div><h3>Pemberitahuan</h3><div class="list">'+(ns||'<div class="empty">Belum ada.</div>')+'</div></div></div>';
}
var BST={booked:["Terkonfirmasi","ok"],wait:["Daftar tunggu","wr"],attended:["Hadir","ok"],noshow:["Tidak hadir","er"],cancelled:["Dibatalkan","mt"]};
function pBooking(m){
  var t=today(),mine=db.bookings.filter(function(b){return b.mid===m.id}).map(function(b){return{b:b,s:sess(b.sid)}}).filter(function(x){return x.s});
  var up=mine.filter(function(x){return(x.b.status==="booked"||x.b.status==="wait")&&startOf(x.b.date,x.s.time)>new Date()}).sort(function(a,b){return startOf(a.b.date,a.s.time)-startOf(b.b.date,b.s.time)});
  var past=mine.filter(function(x){return up.indexOf(x)<0&&x.b.status!=="cancelled"||x.b.status==="cancelled"&&x.b.date>=addDays(t,-14)&&up.indexOf(x)<0}).sort(function(a,b){return startOf(b.b.date,b.s.time)-startOf(a.b.date,a.s.time)}).slice(0,12);
  function row(x,can){var c=cls(x.s.classId),st=BST[x.b.status],pos=x.b.status==="wait"?" #"+(bookingsOf(x.s.id,x.b.date,"wait").map(function(z){return z.id}).indexOf(x.b.id)+1):"";return '<div class="li"><div class="l"><b>'+esc(c.name)+'</b><div class="mu sm">'+fmtDay(x.b.date)+' &middot; '+x.s.time.replace(":",".")+' &middot; '+esc(x.s.room)+'</div></div><span class="pill '+st[1]+'">'+st[0]+pos+'</span>'+(can?'<button class="btn s d" type="button" data-act="cancelb" data-id="'+x.b.id+'">Batalkan</button>':'')+'</div>'}
  return '<div class="rowf" style="justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0">Booking mendatang</h3><a class="btn s p" href="#/jadwal">Booking kelas</a></div><div class="list">'+(up.map(function(x){return row(x,1)}).join("")||'<div class="empty">Belum ada booking. Pilih kelas di jadwal.</div>')+'</div><h3 style="margin:22px 0 10px">Riwayat</h3><div class="list">'+(past.map(function(x){return row(x,0)}).join("")||'<div class="empty">Belum ada riwayat.</div>')+'</div>';
}
function pKunjungan(m){
  var t=today(),vs=db.visits.filter(function(v){return v.mid===m.id}).sort(function(a,b){return a.at<b.at?1:-1});
  var wk=[],lb=[];for(var i=7;i>=0;i--){var a=addDays(t,-i*7-6),b=addDays(t,-i*7);wk.push(vs.filter(function(v){var d=dOf(v.at);return d>=a&&d<=b}).length);lb.push(P(b).getDate()+" "+MON[P(b).getMonth()])}
  var n30=vs.filter(function(v){return dOf(v.at)>=addDays(t,-29)}).length;
  return '<div class="grid g3" style="margin-bottom:14px"><div class="stat"><b>'+vs.length+'</b><span>Total kunjungan tercatat</span></div><div class="stat"><b>'+n30+'</b><span>30 hari terakhir</span></div><div class="stat"><b>'+(vs[0]?fmtDay(dOf(vs[0].at)):"-")+'</b><span>Kunjungan terakhir</span></div></div><div class="card"><h3>Kunjungan per minggu</h3>'+barChart(wk,lb,null)+'</div><h3 style="margin:20px 0 10px">Riwayat kunjungan</h3><div class="list">'+(vs.slice(0,15).map(function(v){return '<div class="li"><div class="l">'+fmtDay(dOf(v.at))+'</div><span class="mu">pukul '+hm(v.at)+'</span></div>'}).join("")||'<div class="empty">Belum ada kunjungan.</div>')+'</div>';
}
function pLatihan(m){
  var ws=db.workouts.filter(function(w){return w.mid===m.id}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:a.id-b.id});
  var pts=ws.filter(function(w){return w.weight}).slice(-12).map(function(w){return{y:w.weight,l:fmtDate(w.date)}});
  var chart=pts.length>=2?lineChart(pts,"kg"):'<div class="empty">Catat berat badan minimal dua kali untuk melihat grafik.</div>';
  var delta=pts.length>=2?Math.round((pts[pts.length-1].y-pts[0].y)*10)/10:0;
  var types=["Kekuatan","Kardio","Kelas grup","Fleksibilitas","Lainnya"];
  var list=ws.slice().reverse().slice(0,15).map(function(w){return '<div class="li"><div class="l"><b>'+esc(w.type)+'</b> &middot; '+w.min+' menit'+(w.weight?' &middot; '+w.weight+' kg':'')+'<div class="mu sm">'+fmtDate(w.date)+(w.note?' &middot; '+esc(w.note):'')+'</div></div><button class="btn s d" type="button" data-act="delw" data-id="'+w.id+'" data-arm="1">Hapus</button></div>'}).join("")||'<div class="empty">Belum ada catatan.</div>';
  return '<div class="split"><div><div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Berat badan</h3>'+(pts.length>=2?'<span class="pill '+(delta<=0?"ok":"wr")+'">'+(delta>0?"+":"")+delta+' kg sejak '+esc(pts[0].l)+'</span>':'')+'</div>'+chart+'</div><h3 style="margin:20px 0 10px">Riwayat latihan</h3><div class="list">'+list+'</div></div><form class="card" data-form="workout" novalidate><h3>Catat latihan</h3><div class="two k"><label class="fld"><span>Tanggal</span><input class="inp" type="date" name="date" value="'+today()+'" max="'+today()+'" required></label><label class="fld"><span>Berat badan (kg)</span><input class="inp" name="weight" inputmode="decimal" placeholder="mis. 72,5"></label></div><div class="two k"><label class="fld"><span>Jenis latihan</span><select name="type">'+types.map(function(x){return '<option>'+x+'</option>'}).join("")+'</select></label><label class="fld"><span>Durasi (menit)</span><input class="inp" name="min" inputmode="numeric" placeholder="45" required></label></div><label class="fld"><span>Catatan (opsional)</span><input class="inp" name="note" maxlength="80"></label><button class="btn p w" type="submit">Simpan catatan</button></form></div>';
}

/* ---------- form handlers ---------- */
var FORMS={
  login:function(f){
    var m=memberByNo(f.no.value);
    if(!f.no.value.trim()||!f.phone.value.trim())return ferr(f,"Isi nomor anggota dan telepon.");
    if(!m||normPhone(m.phone)!==normPhone(f.phone.value))return ferr(f,"Nomor anggota atau telepon tidak cocok.");
    sessionStorage.setItem(SESS,String(m.id));toast("Selamat datang, "+m.name.split(" ")[0]+".");
    var r=RET;RET="";go(r||"#/portal");
  },
  reg1:function(f){
    var e=validateReg1(f);if(e)return ferr(f,e);
    REG.name=f.name.value.trim();REG.phone=f.phone.value.trim();REG.email=f.email.value.trim();REG.birth=f.birth.value;REG.goal=f.goal.value;REG.agree=true;REG.step=2;route(true);
  },
  reg2:function(f){
    var s=f.start.value,pl=+(f.querySelector("input[name=plan]:checked")||{}).value;
    if(!pl)return ferr(f,"Pilih salah satu paket.");
    if(!s||s<today()||s>addDays(today(),30))return ferr(f,"Tanggal mulai harus antara hari ini dan 30 hari ke depan.");
    var pr=calcPromo(f.promo.value,plan(pl),true);if(!pr.ok)return ferr(f,pr.msg);
    REG.planId=pl;REG.start=s;REG.promo=f.promo.value.trim().toUpperCase();REG.step=3;route(true);
  },
  reg3:function(f){REG.method=f.querySelector("input[name=method]:checked").value;REG.paying=true;route(true)},
  renew:function(f){
    var m=mById(+f.mid.value),pl=plan(+(f.querySelector("input[name=plan]:checked")||{}).value);
    if(!pl)return ferr(f,"Pilih paket.");
    var r=renew(m,pl,f.promo.value,f.method.value);if(!r.ok)return ferr(f,r.msg);
    toast(r.msg);rerender();openReceipt(r.pay);
  },
  workout:function(f){
    var m=curMember(),w=f.weight.value.replace(",",".").trim(),min=+f.min.value,d=f.date.value;
    if(!d||d>today())return ferr(f,"Tanggal tidak boleh kosong atau di masa depan.");
    if(w!==""&&(!/^\d+(\.\d)?$/.test(w)||+w<30||+w>250))return ferr(f,"Berat badan harus 30 sampai 250 kg (maksimal satu desimal).");
    if(!/^\d+$/.test(f.min.value.trim())||min<5||min>300)return ferr(f,"Durasi harus 5 sampai 300 menit.");
    db.workouts.push({id:nid("w"),mid:m.id,date:d,weight:w===""?null:+w,type:f.type.value,min:min,note:f.note.value.trim()});save();toast("Catatan tersimpan.");rerender();
  }
};
document.addEventListener("submit",function(e){var f=e.target.closest("form[data-form]");if(!f)return;e.preventDefault();fclr(f);var fn=FORMS[f.dataset.form]||(window.ADMIN_FORMS&&ADMIN_FORMS[f.dataset.form]);if(fn)fn(f)});
function liveUpdate(e){
  var f=e.target.closest("form[data-live]");if(!f)return;
  if(f.dataset.live==="renew")updateRenewSum(f);
  if(f.dataset.live==="reg"){
    var pid=+(f.querySelector("input[name=plan]:checked")||{}).value||REG.planId;
    REG.planId=pid;REG.promo=f.promo.value.trim().toUpperCase();REG.start=f.start.value||REG.start;
    [].forEach.call(f.querySelectorAll(".opt"),function(o){o.classList.toggle("on",o.querySelector("input").checked)});
    var pr=calcPromo(REG.promo,plan(pid),true),pm=$("pmsg");if(pm){pm.style.color=pr.ok?"var(--gn)":"var(--rd)";pm.textContent=REG.promo?pr.msg:""}
    var s=document.querySelector("aside.card");if(s)s.outerHTML=regSummary();
  }
}
document.addEventListener("input",liveUpdate);document.addEventListener("change",liveUpdate);

/* ---------- klik ---------- */
var armTimer=null;
document.addEventListener("click",function(e){
  var el=e.target.closest("[data-act]");if(!el)return;
  if(el.dataset.arm){
    if(el.dataset.armed!=="1"){el.dataset.armed="1";el._t=el.textContent;el.textContent="Tekan lagi untuk hapus";el.classList.add("arm");setTimeout(function(){if(el.isConnected){el.dataset.armed="";el.textContent=el._t;el.classList.remove("arm")}},3500);return}
  }
  act(el.dataset.act,el,e);
});
document.addEventListener("change",function(e){var el=e.target;if(el.id==="clsf"){SC.cls=el.value;$("slots").innerHTML=slotsHtml()}});
function act(a,el,e){
  var m=curMember(),d=el.dataset;
  switch(a){
    case"close":closeSheet();break;
    case"print":window.print();break;
    case"menu":break;
    case"reset":if(!el.dataset.rs){el.dataset.rs="1";el._t=el.textContent;el.textContent="Tekan lagi untuk reset";setTimeout(function(){if(el.isConnected){el.dataset.rs="";el.textContent=el._t}},3500)}else{resetAll();REG=null;SC={day:null,cls:""};toast("Data demo dikembalikan ke awal.");go("#/")}break;
    case"pickplan":REG=newReg();REG.planId=+d.id;go("#/daftar");break;
    case"seeclass":SC.cls=String(d.id);SC.day=null;go("#/jadwal");break;
    case"day":SC.day=d.d;rerender();break;
    case"book":doBook(+d.sid,d.date);break;
    case"cancelb":{var r=cancelBooking(+d.id,isAdmin()&&!m);toast(r.msg,!r.ok);rerender();break}
    case"logout":sessionStorage.removeItem(SESS);toast("Anda sudah keluar.");go("#/portal");break;
    case"renewp":openRenew(m.id,"portal");break;
    case"freezeq":openSheet("Bekukan keanggotaan",'<p>Selama dibekukan masa aktif tidak berkurang. Maksimal '+FREEZE_MAX+' hari per periode (tersisa '+(FREEZE_MAX-(m.freezeDays||0))+' hari). Check-in dan booking tidak bisa dipakai, dan booking mendatang dibatalkan.</p><p class="mu sm">Saat diaktifkan kembali, tanggal berakhir ditambah sebanyak hari beku.</p><div class="rowf"><button class="btn" type="button" data-act="close">Batal</button><button class="btn p" type="button" data-act="freezego">Bekukan sekarang</button></div>');break;
    case"freezego":{var r2=freezeMember(m);closeSheet();toast(r2.msg,!r2.ok);rerender();break}
    case"unfreeze":{var r3=unfreezeMember(m);toast(r3.msg,!r3.ok);rerender();break}
    case"delw":db.workouts=db.workouts.filter(function(w){return w.id!==+d.id});save();toast("Catatan dihapus.");rerender();break;
    case"applypromo":{var f=el.closest("form"),pr=calcPromo(f.promo.value,plan(REG.planId),true);REG.promo=f.promo.value.trim().toUpperCase();var pm=$("pmsg");pm.style.color=pr.ok?"var(--gn)":"var(--rd)";pm.textContent=f.promo.value.trim()?pr.msg:"Isi kode promo dulu.";var s=document.querySelector("aside.card");if(s)s.outerHTML=regSummary();break}
    case"regback":REG.step=Math.max(1,REG.step-1);REG.paying=false;route(true);break;
    case"regunpay":REG.paying=false;route(true);break;
    case"regpaid":{var res=createMember(REG,REG.method);REG.done={mid:res.m.id,pay:res.pay};sessionStorage.setItem(SESS,String(res.m.id));toast("Pembayaran berhasil (simulasi).");route(true);break}
    case"regnew":REG=newReg();route(true);break;
    case"regtoportal":go("#/portal");break;
    case"receipt":{var p=db.payments.filter(function(x){return x.id===+d.id})[0];if(p)openReceipt(p);break}
    default:if(typeof adminAct==="function")adminAct(a,el,e);
  }
}
$("menub").addEventListener("click",function(){var n=$("nav"),o=n.classList.toggle("on");this.setAttribute("aria-expanded",o)});
document.addEventListener("click",function(e){if(!e.target.closest(".hd"))$("nav").classList.remove("on")});

load();
route(true);
