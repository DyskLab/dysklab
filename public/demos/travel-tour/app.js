/* Nusa Jelajah Travel (demo fiktif): tampilan pelanggan dan panel biro. Butuh data.js. */
(function(){
"use strict";
var esc=T.esc,rp=T.rp,dfmt=T.dfmt,dshort=T.dshort,today=T.today;
var $=function(id){return document.getElementById(id)};
var view=$("view");
var OKS="travel.v1.ok",AUTH="travel.v1.auth";
var cf={q:"",dest:"",dur:"",price:"",tema:"",tipe:"",from:"",to:"",sort:"dekat"};
var wz=null,af={q:"",st:"",pkg:""},ap="menunggu",aj={pkg:"",past:false},toastT=0,lastCsv="";

/* ---------- util ---------- */
function toast(m,er){var t=$("toast");t.textContent=m;t.className="on"+(er?" er":"");clearTimeout(toastT);toastT=setTimeout(function(){t.className=""},3200)}
function photo(k,alt,cls,eager){return '<div class="ph '+(cls||"")+'"><img src="img/'+esc(k)+'.jpg" alt="'+esc(alt||T.PH[k]||"")+'" '+(eager?"":'loading="lazy" ')+'width="1000" height="667"></div>'}
function opt(v,l,sel){return '<option value="'+esc(v)+'"'+(String(sel)===String(v)?" selected":"")+'>'+esc(l)+'</option>'}
function field(id,label,val,o){o=o||{};return '<label class="f"><span class="l">'+esc(label)+'</span><input id="'+id+'" name="'+id+'" value="'+esc(val)+'" '+(o.type?'type="'+o.type+'" ':"")+(o.attr||"")+' aria-describedby="e_'+id+'"><span class="err" id="e_'+id+'"></span>'+(o.hint?'<span class="hint">'+esc(o.hint)+'</span>':"")+'</label>'}
function setErr(id,m){var e=$("e_"+id),i=$(id);if(e)e.textContent=m||"";if(i){if(m)i.setAttribute("aria-invalid","true");else i.removeAttribute("aria-invalid")}return !m}
function clearErr(root){(root||document).querySelectorAll("[aria-invalid]").forEach(function(i){i.removeAttribute("aria-invalid")});(root||document).querySelectorAll(".err").forEach(function(e){e.textContent=""})}
function stars(a){return '<span class="stars" aria-label="Rating '+a.toFixed(1)+' dari 5">&#9733; '+a.toFixed(1)+'</span>'}
function badge(k,l){return '<span class="badge s-'+k+'">'+esc(l)+'</span>'}
function stBadge(b){return badge(b.status,T.statusLabel(b))}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-")}
function firstLast(n){var a=String(n).trim().split(/\s+/);return a[0]+(a[1]?" "+a[1].charAt(0).toUpperCase()+".":"")}
function maskId(s){return s?"************"+String(s).slice(-4):"-"}
function verified(){try{return JSON.parse(sessionStorage.getItem(OKS)||"[]")}catch(e){return[]}}
function verify(c){var v=verified();if(v.indexOf(c)<0)v.push(c);try{sessionStorage.setItem(OKS,JSON.stringify(v))}catch(e){}}
function isAdmin(){try{return sessionStorage.getItem(AUTH)==="1"}catch(e){return false}}
function csv(name,rows){
 var s="﻿"+rows.map(function(r){return r.map(function(c){
  var neg=typeof c==="string"&&/^[=+\-@\t\r]/.test(c);c=String(c==null?"":c);if(neg)c="'"+c;return '"'+c.replace(/"/g,'""')+'"'}).join(",")}).join("\r\n");
 lastCsv=s;window.__csv={name:name,text:s};
 try{var u=URL.createObjectURL(new Blob([s],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)}catch(e){}
 toast("File "+name+" dibuat ("+(rows.length-1)+" baris).");
}
function printHTML(h){$("print").innerHTML='<div class="pr">'+h+'</div>';window.__printed=h;try{window.print()}catch(e){}}

/* ---------- sheet ---------- */
var opener=null;
function openSheet(title,html){
 opener=document.activeElement;
 $("sheetwrap").innerHTML='<div class="sw"><div class="sbk" data-act="sheet-close"></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sht"><header><h2 id="sht">'+esc(title)+'</h2><button class="x" data-act="sheet-close" aria-label="Tutup">&times;</button></header><div class="sb" id="sbody">'+html+'</div></section></div>';
 document.body.classList.add("lock");
 var f=$("sbody").querySelector("input:not([type=hidden]),select,textarea");if(f&&matchMedia("(min-width:760px)").matches)f.focus();else $("sht").setAttribute("tabindex","-1");
}
function closeSheet(){var had=!!$("sbody");$("sheetwrap").innerHTML="";document.body.classList.remove("lock");window.__sheet=null;if(had&&opener&&opener.isConnected&&opener.focus)try{opener.focus({preventScroll:true})}catch(e){}opener=null}
function inSheet(){return !!$("sbody")}

/* ---------- header / footer ---------- */
function renderChrome(route){
 var b=T.db.biro,n=route[0];
 var cek=n==="cek"||n==="booking";
 $("top").innerHTML='<div class="wrap"><a class="logo" href="#/" aria-label="'+esc(b.nama)+', beranda"><span class="tk"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 18l9-3 8-10 3 1-4 9 7-2 2 2-8 4-5 7-3-1 2-7-9 2z" fill="currentColor"/></svg></span><span class="nm">'+esc(b.nama.replace(/\s*Travel$/,""))+'<small>Travel</small></span></a><nav class="nav" aria-label="Utama"><a href="#/paket"'+(n==="paket"||n==="pesan"?' class="on" aria-current="page"':"")+'>Paket</a><a href="#/sewa"'+(n==="sewa"?' class="on" aria-current="page"':"")+'>Sewa</a></nav><a class="stbtn'+(cek?" on":"")+'" href="#/cek"'+(cek?' aria-current="page"':"")+'>Cek booking</a></div>';
 $("foot").innerHTML='<div class="wrap"><div class="rmap" aria-hidden="true"><i class="arc a1"></i><i class="arc a2"></i><i class="arc a3"></i><i class="arc a4"></i><span class="pt p1">Jakarta</span><span class="pt p2">Yogyakarta</span><span class="pt p3">Bromo</span><span class="pt p4">Bali</span><span class="pt p5">Labuan Bajo</span></div><div class="fcols"><div><strong>'+esc(b.nama)+'</strong> (demo fiktif). Harga, jadwal, dan paket adalah contoh. Hubungi kami: <a href="https://wa.me/62'+esc(b.wa.replace(/^0/,""))+'" rel="noopener">WhatsApp '+esc(b.wa)+'</a></div><div>Foto: Wikimedia Commons, <a href="#/kredit">lihat kredit</a> | <a href="#/admin">Panel biro</a></div></div></div>';
}

/* ---------- router ---------- */
function parse(){
 var h=location.hash.replace(/^#\/?/,""),q={},i=h.indexOf("?");
 if(i>=0){h.slice(i+1).split("&").forEach(function(x){var a=x.split("=");q[decodeURIComponent(a[0])]=decodeURIComponent(a[1]||"")});h=h.slice(0,i)}
 return{r:h.split("/").filter(Boolean),q:q};
}
function go(h){if(location.hash==="#"+h)render();else location.hash=h}
function render(){
 var p=parse(),r=p.r,n=r[0]||"",title="Nusa Jelajah Travel";
 document.body.classList.remove("hasstick");closeSheet();
 renderChrome(r);
 var html="",h1="";
 if(n==="")html=vHome();
 else if(n==="paket"&&r[1]){var pk=T.pkg(r[1]);if(pk&&pk.active){html=vDetail(pk);title=pk.name}else html=vNotFound()}
 else if(n==="paket"){html=vCatalog();title="Paket wisata"}
 else if(n==="pesan"){var pp=T.pkg(r[1]);if(pp&&pp.active){if(!wz||wz.pid!==pp.id)wzInit(pp,p.q.dep);else if(p.q.dep&&wz.step===1){var dd0=T.dep(p.q.dep);if(dd0&&dd0.pkg===pp.id&&T.depState(dd0).k==="ok")wz.dep=dd0.id}html=vWizard();title="Pesan "+pp.name}else html=vNotFound()}
 else if(n==="cek"){html=vCek(p.q);title="Cek booking"}
 else if(n==="booking"){html=vBooking(r[1]);title="Booking "+(r[1]||"")}
 else if(n==="sewa"){html=vSewa();title="Sewa homestay dan transport"}
 else if(n==="kredit"){html=vKredit();title="Kredit foto";loadCredits()}
 else if(n==="admin"){html=vAdmin(r[1]||"ringkasan");title="Panel biro"}
 else html=vNotFound();
 view.innerHTML=html;
 document.title=title+" | Nusa Jelajah";
 if(n==="paket"&&r[1]||n==="pesan")document.body.classList.toggle("hasstick",n==="paket");
 var hd=view.querySelector("h1");if(hd){hd.setAttribute("tabindex","-1")}
 if(!window.__noscroll)window.scrollTo(0,0);
 if(n==="paket"&&!r[1])renderResults();
}
function vNotFound(){return '<div class="wrap"><div class="empty"><h1>Halaman tidak ditemukan</h1><p>Paket atau halaman yang Anda cari tidak ada.</p><a class="btn" href="#/paket">Lihat semua paket</a></div></div>'}

/* ---------- kartu paket ---------- */
function nextDep(p){return T.depsOf(p.id).filter(function(d){return T.depState(d).k==="ok"})[0]||null}
function pcard(p){
 var r=T.rate(p.id),nd=nextDep(p);
 return '<a class="card pc" href="#/paket/'+p.id+'"><div class="frame">'+photo(p.cover,T.PH[p.cover])+'<span class="stamp"><small>mulai</small><b>'+rp(p.t6)+'</b><small>/orang</small></span></div><div class="bd"><div class="tags"><span class="tag">'+T.dur(p)+'</span><span class="badge">'+esc(p.tipe)+'</span></div><h3>'+esc(p.name)+'</h3><div class="sm mut">'+esc(p.dest)+' | '+esc(p.tema)+'</div><div class="sm">'+(nd?'Berangkat berikutnya '+dshort(nd.date)+' ('+T.depState(nd).label.toLowerCase()+')':'<span class="mut">Belum ada jadwal terbuka</span>')+'</div><div class="pr">'+(r.n?'<div>'+stars(r.avg)+' <span class="sm mut">('+r.n+')</span></div>':'<span class="sm mut">Belum ada ulasan</span>')+'<span class="hnd go">lihat kartu pos</span></div></div></a>';
}

/* ---------- beranda ---------- */
function vHome(){
 var ps=T.db.pkgs.filter(function(p){return p.active}),dests={},order=[];
 ps.forEach(function(p){if(!dests[p.dest]){dests[p.dest]={cover:p.cover,min:p.t6,days:T.dur(p),n:0};order.push(p.dest)}var o=dests[p.dest];o.n++;if(p.t6<o.min)o.min=p.t6});
 var pop=ps.slice().sort(function(a,b){return T.rate(b.id).avg-T.rate(a.id).avg}).slice(0,3);
 var dopts=opt("","Semua destinasi","")+order.map(function(d){return opt(d,d,"")}).join("");
 var hero=["Yogyakarta","Bromo dan Ijen","Bali","Labuan Bajo","Raja Ampat"].filter(function(d){return dests[d]});
 var up=T.db.deps.filter(function(d){var p=T.pkg(d.pkg);return p&&p.active&&d.date>=today()}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0}).slice(0,8);
 var nd=up[0],pmDate=nd?dshort(nd.date):dshort(today());
 var panels=hero.map(function(d,i){var o=dests[d],pid="pn"+i;
  return '<article class="pn'+(i===1?" on":"")+'" data-i="'+i+'"><img src="img/'+o.cover+'.jpg" alt="'+esc(T.PH[o.cover])+'" width="1000" height="667"'+(i===1?"":' loading="lazy"')+'><button type="button" class="pbtn" aria-expanded="'+(i===1)+'" aria-controls="'+pid+'"><span class="vl">'+esc(d)+'</span><span class="sr">Tampilkan '+esc(d)+'</span></button><div class="info" id="'+pid+'"><span class="hnd">no. 0'+(i+1)+'</span><h2>'+esc(d)+'</h2><p class="meta2"><span class="tag">'+o.days+'</span> mulai <strong>'+rp(o.min)+'</strong> /orang</p><a class="btn ac" href="#/paket" data-act="dest" data-d="'+esc(d)+'">Lihat paket</a></div></article>'}).join("");
 var board=up.length?'<div class="board"><table><caption class="sr">Jadwal keberangkatan terdekat</caption><thead><tr><th scope="col">Tanggal</th><th scope="col">Tujuan</th><th scope="col" class="n">Kursi</th><th scope="col">Status</th></tr></thead><tbody>'+up.map(function(d){var p=T.pkg(d.pkg),s=T.depState(d),left=T.seatsLeft(d),sk=s.k==="ok"?(left<=4?"low":"open"):s.k==="penuh"?"full":"shut",sl=s.k==="ok"?(left<=4?"Hampir penuh":"Buka"):s.k==="penuh"?"Penuh":"Ditutup";
  return '<tr><td class="dt">'+flip(dshort(d.date).replace(/\s\d{4}$/,""))+'</td><td class="to"><a href="#/paket/'+p.id+'">'+esc(p.dest)+'</a><small>'+esc(p.name.replace(/\s\d+H\d+M$/,""))+'</small></td><td class="n">'+flip(String(Math.max(0,left)))+'</td><td><span class="bs bs-'+sk+'">'+sl+'</span></td></tr>'}).join("")+'</tbody></table></div>':'<div class="empty"><h3>Belum ada jadwal terbuka</h3></div>';
 var steps=[["Pilih paket","Saring menurut destinasi, durasi, harga, dan tanggal."],["Pilih jadwal","Atur jumlah peserta dan kamar. Harga turun untuk grup lebih besar."],["Isi data peserta","Satu formulir per orang, dicek otomatis."],["Bayar DP","Dapat kode booking untuk cek status dan cetak voucher."]];
 return '<section class="hero" aria-labelledby="hh"><div class="wrap hhead"><div class="pm" aria-hidden="true"><span class="pmt">NUSA JELAJAH</span><b>'+esc(pmDate)+'</b><span class="pmt">BERANGKAT</span></div><p class="hnd note">kartu pos dari perjalanan berikutnya</p><h1 id="hh">Ke mana cerita Anda <em>berikutnya?</em></h1><p class="lead">Paket wisata domestik, open trip, dan sewa homestay atau transport. Pilih jadwal, isi data peserta, bayar DP.</p></div><div class="acc" id="acc" role="group" aria-label="Destinasi unggulan">'+panels+'</div></section>'+
 '<div class="wrap"><form class="bp" id="hs" role="search" aria-label="Cari paket"><div class="bpl"><span class="bpt">Boarding pass paket</span></div><label class="f"><span class="l">Destinasi</span><select id="hsd">'+dopts+'</select></label><label class="f"><span class="l">Durasi</span><select id="hsdur">'+opt("","Semua durasi","")+opt("1","2 sampai 3 hari","")+opt("2","4 sampai 5 hari","")+opt("3","6 hari atau lebih","")+'</select></label><label class="f"><span class="l">Tema</span><select id="hstema">'+opt("","Semua tema","")+T.TEMAS.map(function(t){return opt(t,t,"")}).join("")+'</select></label><div class="bps"><button class="btn ac" type="submit">Cari paket</button></div></form>'+
 '<section class="sec" aria-labelledby="h-pop"><div class="sh"><h2 id="h-pop">Paket terpopuler</h2><span class="hnd">dipilih dari rating ulasan contoh</span></div><div class="grid g3 pop">'+pop.map(pcard).join("")+'</div><p class="c" style="margin-top:18px"><a class="btn ghost" href="#/paket">Lihat semua '+ps.length+' paket</a></p></section>'+
 '<section class="sec" aria-labelledby="h-cara"><div class="sh"><h2 id="h-cara">Cara pesan</h2><span class="hnd">empat perhentian</span></div><ol class="route">'+steps.map(function(s,i){return '<li><span class="stop">'+(i+1)+'</span><strong>'+s[0]+'</strong><span class="sm mut">'+s[1]+'</span></li>'}).join("")+'</ol></section>'+
 '<section class="sec" aria-labelledby="h-jd"><div class="sh"><h2 id="h-jd">Jadwal keberangkatan terdekat</h2><span class="hnd">diperbarui dari data kuota</span></div>'+board+'</section>'+
 '<section class="sec" aria-labelledby="h-ul"><div class="sh"><h2 id="h-ul">Ulasan peserta (contoh)</h2></div><div class="grid g3">'+T.db.reviews.slice(0,3).map(function(r){var p=T.pkg(r.pkg);return '<div class="card flat note-card">'+stars(r.rating)+'<p style="margin:6px 0">'+esc(r.text)+'</p><div class="sm mut"><span class="hnd">'+esc(r.name)+'</span> | '+esc(p?p.name:"")+'</div></div>'}).join("")+'</div></section>'+
 '<section class="sec lug"><div class="lugt"><span class="tag">Sewa</span><div><h2>Perlu homestay atau kendaraan sendiri?</h2><p>Sewa minibus, mobil dengan sopir, motor, atau homestay tanpa ikut paket.</p></div><a class="btn" href="#/sewa">Lihat layanan sewa</a></div></section></div>';
}
function flip(s){return '<span class="fl" aria-label="'+esc(s)+'">'+String(s).split("").map(function(c){return c===" "?'<i class="sp"></i>':'<i aria-hidden="true">'+esc(c)+'</i>'}).join("")+'</span>'}

/* ---------- katalog ---------- */
function vCatalog(){
 var dopts=opt("","Semua",cf.dest)+T.DESTS.filter(function(d){return T.db.pkgs.some(function(p){return p.dest===d&&p.active})}).map(function(d){return opt(d,d,cf.dest)}).join("");
 return '<div class="wrap"><h1 style="margin-top:20px">Paket wisata</h1><div class="cat" id="cat"><aside class="filters" aria-label="Saring paket"><div class="card"><label class="f"><span class="l">Cari paket</span><input id="f_q" data-f="q" value="'+esc(cf.q)+'" placeholder="nama, tempat, tema" maxlength="40"></label>'+
 '<label class="f"><span class="l">Destinasi</span><select data-f="dest">'+dopts+'</select></label>'+
 '<label class="f"><span class="l">Durasi</span><select data-f="dur">'+opt("","Semua",cf.dur)+opt("1","2 sampai 3 hari",cf.dur)+opt("2","4 sampai 5 hari",cf.dur)+opt("3","6 hari atau lebih",cf.dur)+'</select></label>'+
 '<label class="f"><span class="l">Harga mulai dari</span><select data-f="price">'+opt("","Semua",cf.price)+opt("1","Di bawah Rp 2 juta",cf.price)+opt("2","Rp 2 sampai 4 juta",cf.price)+opt("3","Rp 4 sampai 6 juta",cf.price)+opt("4","Di atas Rp 6 juta",cf.price)+'</select></label>'+
 '<label class="f"><span class="l">Tema</span><select data-f="tema">'+opt("","Semua",cf.tema)+T.TEMAS.map(function(t){return opt(t,t,cf.tema)}).join("")+'</select></label>'+
 '<label class="f"><span class="l">Jenis</span><select data-f="tipe">'+opt("","Semua",cf.tipe)+T.TIPES.map(function(t){return opt(t,t,cf.tipe)}).join("")+'</select></label>'+
 '<div class="row2 keep"><label class="f"><span class="l">Berangkat dari</span><input type="date" data-f="from" value="'+esc(cf.from)+'"></label><label class="f"><span class="l">sampai</span><input type="date" data-f="to" value="'+esc(cf.to)+'"></label></div>'+
 '<button class="btn ghost full" data-act="cf-reset" type="button">Hapus semua filter</button></div></aside><section aria-live="polite"><div class="rescount"><strong id="rc"></strong><label class="sm" style="display:flex;gap:8px;align-items:center">Urutkan <select data-f="sort" style="width:auto"><option value="dekat"'+(cf.sort==="dekat"?" selected":"")+'>Berangkat terdekat</option><option value="murah"'+(cf.sort==="murah"?" selected":"")+'>Harga terendah</option><option value="mahal"'+(cf.sort==="mahal"?" selected":"")+'>Harga tertinggi</option><option value="rating"'+(cf.sort==="rating"?" selected":"")+'>Rating tertinggi</option></select></label></div><div class="grid" id="res"></div></section></div></div>';
}
function filtered(){
 var L=T.db.pkgs.filter(function(p){
  if(!p.active)return false;
  if(cf.q){var s=(p.name+" "+p.dest+" "+p.desc+" "+p.tema+" "+p.tipe).toLowerCase();if(s.indexOf(cf.q.trim().toLowerCase())<0)return false}
  if(cf.dest&&p.dest!==cf.dest)return false;if(cf.tema&&p.tema!==cf.tema)return false;if(cf.tipe&&p.tipe!==cf.tipe)return false;
  var d=T.days(p);
  if(cf.dur==="1"&&d>3)return false;if(cf.dur==="2"&&(d<4||d>5))return false;if(cf.dur==="3"&&d<6)return false;
  var x=p.t1;
  if(cf.price==="1"&&x>=2e6)return false;if(cf.price==="2"&&(x<2e6||x>=4e6))return false;if(cf.price==="3"&&(x<4e6||x>=6e6))return false;if(cf.price==="4"&&x<6e6)return false;
  if(cf.from||cf.to){var ok=T.depsOf(p.id).some(function(dp){return T.depState(dp).k==="ok"&&(!cf.from||dp.date>=cf.from)&&(!cf.to||dp.date<=cf.to)});if(!ok)return false}
  return true;
 });
 function nd(p){var d=nextDep(p);return d?d.date:"9999"}
 L.sort(function(a,b){
  if(cf.sort==="murah")return a.t1-b.t1;if(cf.sort==="mahal")return b.t1-a.t1;
  if(cf.sort==="rating")return T.rate(b.id).avg-T.rate(a.id).avg;
  return nd(a)<nd(b)?-1:nd(a)>nd(b)?1:0;
 });
 return L;
}
function renderResults(){
 var L=filtered(),rc=$("rc"),res=$("res");if(!res)return;
 rc.textContent=L.length+" paket ditemukan";
 res.innerHTML=L.length?L.map(pcard).join(""):'<div class="empty card" style="grid-column:1/-1"><h3>Tidak ada paket yang cocok</h3><p>Longgarkan filter, misalnya kosongkan tanggal atau harga.</p><button class="btn ghost" data-act="cf-reset" type="button">Hapus semua filter</button></div>';
 var dd=$("cat");if(dd)dd.classList.toggle("wide",window.innerWidth>=1100&&false);
}

/* ---------- detail paket ---------- */
function vDetail(p){
 var r=T.rate(p.id),ds=T.depsOf(p.id).filter(function(d){return d.date>=today()}),rv=T.db.reviews.filter(function(x){return x.pkg===p.id});
 var ph=p.photos&&p.photos.length?p.photos:[p.cover],nd=nextDep(p);
 var faq=(p.faq||[]).concat(T.FAQ);
 var it=p.it.map(function(x,i){return '<details class="ac"'+(i===0?" open":"")+'><summary>Hari '+(i+1)+': '+esc(x.t)+'</summary><div class="in">'+esc(x.d)+'</div></details>'}).join("");
 var rows=ds.map(function(d){
  var s=T.depState(d),pct=Math.round(T.seatsUsed(d.id)/d.quota*100);
  return '<tr><td data-l="Berangkat"><strong>'+dfmt(d.date)+'</strong><br><span class="sm mut">sampai '+dshort(T.addD(d.date,T.days(p)-1))+'</span></td><td data-l="Kursi">'+(s.k==="ok"||s.k==="penuh"?'<div class="bar'+(s.k==="penuh"?" full":pct>70?" hi":"")+'" role="img" aria-label="'+pct+'% terisi"><i style="width:'+pct+'%"></i></div><span class="sm">'+esc(s.k==="penuh"?"Penuh":"Sisa "+T.seatsLeft(d)+" dari "+d.quota)+'</span>':'<span class="sm mut">'+esc(s.label)+'</span>')+'</td><td class="act">'+(s.k==="ok"?'<a class="btn sm" href="#/pesan/'+p.id+'?dep='+d.id+'">Pilih jadwal</a>':'<button class="btn sm" disabled>'+esc(s.label)+'</button>')+'</td></tr>';
 }).join("");
 var tiers='<table class="t"><thead><tr><th>Peserta per booking</th><th class="n">Dewasa</th><th class="n">Anak</th></tr></thead><tbody>'+[[1,"1 sampai 2 orang"],[3,"3 sampai 5 orang"],[6,"6 orang atau lebih"]].map(function(x){var u=T.tierPrice(p,x[0]);return '<tr><td>'+x[1]+'</td><td class="n">'+rp(u)+'</td><td class="n">'+rp(Math.round(u*p.child/100/5000)*5000)+'</td></tr>'}).join("")+'</tbody></table><p class="sm mut" style="margin-top:8px">Kamar single: tambahan '+rp(p.single)+' per orang. Asuransi perjalanan: '+rp(T.INS)+' per orang (opsional). '+esc(p.optN)+': '+rp(p.optP)+' per orang (opsional).</p>';
 return '<div class="wrap"><p class="sm" style="margin:14px 0 0"><a href="#/paket">Semua paket</a> / '+esc(p.dest)+'</p><h1 style="margin-top:8px">'+esc(p.name)+'</h1><div class="meta"><span class="badge">'+esc(p.tipe)+'</span><span>'+T.dur(p)+'</span><span>'+esc(p.dest)+'</span><span>'+esc(p.tema)+'</span>'+(r.n?'<span>'+stars(r.avg)+' ('+r.n+' ulasan)</span>':"")+'</div>'+
 '<div class="det"><div><div class="gal" id="gal">'+photo(ph[0],T.PH[ph[0]],"main",true).replace('class="ph main"','class="ph main" id="galm"')+(ph.length>1?'<div class="thumbs" role="group" aria-label="Galeri foto">'+ph.map(function(k,i){return '<button type="button" data-act="gal" data-k="'+k+'" class="'+(i?"":"on")+'" aria-label="Foto: '+esc(T.PH[k])+'"><img src="img/'+k+'.jpg" alt="" width="152" height="112" loading="lazy"></button>'}).join("")+'</div>':"")+'</div>'+
 '<section class="sec"><h2>Ringkasan</h2><p>'+esc(p.desc)+'</p><p class="sm"><strong>Titik kumpul:</strong> '+esc(p.meet)+'</p></section>'+
 '<section class="sec"><h2>Itinerary</h2>'+it+'</section>'+
 '<section class="sec two"><div class="card flat"><h3>Termasuk</h3><ul class="clean ic">'+p.inc.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul></div><div class="card flat"><h3>Tidak termasuk</h3><ul class="clean ic no">'+p.exc.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul></div></section>'+
 '<section class="sec" id="jadwal"><h2>Jadwal keberangkatan</h2>'+(rows?'<table class="t rt"><thead><tr><th>Berangkat</th><th>Kursi</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>':'<div class="empty card flat">Belum ada jadwal. Hubungi biro lewat WhatsApp.</div>')+'</section>'+
 '<section class="sec"><h2>Harga</h2>'+tiers+'</section>'+
 '<section class="sec"><h2>Syarat dan ketentuan</h2><ul style="padding-left:20px;margin:0">'+T.SYARAT.map(function(x){return '<li style="margin-bottom:6px">'+esc(x)+'</li>'}).join("")+'</ul></section>'+
 '<section class="sec"><h2>Pertanyaan umum</h2>'+faq.map(function(f){return '<details class="ac"><summary>'+esc(f.q)+'</summary><div class="in">'+esc(f.a)+'</div></details>'}).join("")+'</section>'+
 '<section class="sec"><h2>Ulasan (contoh)</h2>'+(rv.length?rv.map(function(x){return '<div class="rv">'+stars(x.rating)+' <strong>'+esc(x.name)+'</strong> <span class="sm mut">'+dshort(T.iso(new Date(x.at)))+'</span><p style="margin:4px 0 0">'+esc(x.text)+'</p></div>'}).join(""):'<p class="mut">Belum ada ulasan.</p>')+'</section></div>'+
 '<aside class="side"><div class="card"><div class="price"><small>mulai</small> '+rp(p.t6)+' <small>/orang</small></div><p class="sm mut">Harga dewasa untuk 6 orang atau lebih. Sendiri: '+rp(p.t1)+'.</p>'+(nd?'<p class="sm">Berangkat berikutnya: <strong>'+dshort(nd.date)+'</strong></p><a class="btn ac full" href="#/pesan/'+p.id+'?dep='+nd.id+'">Pesan sekarang</a>':'<p class="alert">Belum ada jadwal terbuka.</p>')+'<button class="btn ghost full" style="margin-top:8px" data-act="goto" data-t="jadwal" type="button">Lihat semua jadwal</button></div><div class="card flat sm"><strong>DP 30%</strong> saat booking, pelunasan 14 hari sebelum berangkat. Kode booking langsung dibuat.</div></aside></div></div>'+
 (nd?'<div class="stick"><div class="price"><small>mulai</small> '+rp(p.t6)+'</div><a class="btn ac" href="#/pesan/'+p.id+'?dep='+nd.id+'">Pesan sekarang</a></div>':"");
}

/* ---------- wizard pemesanan ---------- */
function wzInit(p,depId){
 var ds=T.depsOf(p.id).filter(function(d){return T.depState(d).k==="ok"}),pick=ds.filter(function(d){return d.id===depId})[0]||ds[0]||null;
 wz={pid:p.id,dep:pick?pick.id:"",a:2,k:0,s:0,ins:false,opt:0,promo:"",promoOk:"",promoMsg:"",step:1,contact:{name:"",phone:"",email:""},pax:[],same:true,mode:"dp",agree:false,busy:false};
}
function fixParity(){if(wz.s>wz.a)wz.s=wz.a;if((wz.a-wz.s)%2!==0)wz.s=wz.s<wz.a?wz.s+1:wz.s-1}
function wzQ(){var p=T.pkg(wz.pid);return T.quote(p,{a:wz.a,k:wz.k,s:wz.s,ins:wz.ins?1:0,opt:wz.opt,promo:wz.promoOk})}
function dpPossible(){var d=T.dep(wz.dep);return d&&T.diff(today(),d.date)>=14}
function sumHTML(){
 var p=T.pkg(wz.pid),d=T.dep(wz.dep),q=wzQ(),pl=d?T.planPay(q.total,d.date,today(),wz.step===3?wz.mode:"dp"):null;
 var h='<div class="card sum"><h3>Ringkasan</h3><p class="sm" style="margin-bottom:8px"><strong>'+esc(p.name)+'</strong><br>'+(d?dfmt(d.date)+' ('+T.dur(p)+')':'<span class="err">Belum memilih jadwal</span>')+'</p>';
 q.lines.forEach(function(x){h+='<div class="ln"><span>'+esc(x.l)+' x'+x.q+'</span><span>'+rp(x.q*x.u)+'</span></div>'});
 if(q.disc)h+='<div class="ln" style="color:var(--ok)"><span>Promo '+esc(wz.promoOk)+'</span><span>-'+rp(q.disc)+'</span></div>';
 h+='<div class="ln tot"><span>Total</span><span>'+rp(q.total)+'</span></div>';
 if(pl){
  if(pl.mode==="dp")h+='<p class="sm" style="margin:10px 0 0">DP '+rp(pl.dpAmt)+' sebelum '+dshort(pl.dpDue)+'.<br>Pelunasan '+rp(q.total-pl.dpAmt)+' sebelum '+dshort(pl.finalDue)+'.</p>';
  else h+='<p class="sm" style="margin:10px 0 0">Bayar lunas '+rp(q.total)+' sebelum '+dshort(pl.dpDue)+(wz.step<3&&dpPossible()?' (atau pilih DP di langkah terakhir)':'')+'.</p>';
 }
 return h+'</div>';
}
function parityNote(){
 var ev=(wz.a-wz.s)%2===0,n=wz.a+wz.k,d=T.dep(wz.dep),left=d?T.seatsLeft(d):0;
 var h='<p class="sm mut">Total '+n+' kursi'+(d?', sisa '+left+' di jadwal ini':"")+'. Kamar twin: '+(wz.a-wz.s)+' dewasa, single: '+wz.s+'.</p>';
 if(!ev)h+='<p class="err" role="alert">Dewasa di kamar twin harus genap. Tambah satu peserta kamar single.</p>';
 if(d&&n>left)h+='<p class="err" role="alert">Kursi tidak cukup: tersisa '+left+'.</p>';
 return h;
}
function stepper(k,label,min,max,val,hint){
 var L=label;label=esc(label);
 return '<div class="f" style="margin-bottom:12px"><span class="l" style="display:block;font-weight:600;font-size:.9rem;margin-bottom:4px" id="l_'+k+'">'+label+'</span><div class="step"><button type="button" data-act="wz-dec" data-k="'+k+'" aria-label="Kurangi '+label+'">-</button><input id="w_'+k+'" data-w="'+k+'" inputmode="numeric" value="'+val+'" aria-labelledby="l_'+k+'" data-min="'+min+'" data-max="'+max+'"><button type="button" data-act="wz-inc" data-k="'+k+'" aria-label="Tambah '+label+'">+</button></div>'+(hint?'<span class="hint">'+hint+'</span>':"")+'<span class="err" id="e_w_'+k+'"></span></div>';
}
function vWizard(){
 var p=T.pkg(wz.pid),ds=T.depsOf(p.id).filter(function(d){return d.date>=today()});
 var h='<div class="wrap"><p class="sm" style="margin:14px 0 0"><a href="#/paket/'+p.id+'">Kembali ke paket</a></p><h1 style="margin-top:8px">Pesan: '+esc(p.name)+'</h1><ol class="prog" aria-label="Langkah">'+["Jadwal dan peserta","Data peserta","Ringkasan dan bayar"].map(function(s,i){return '<li class="'+(wz.step===i+1?"on":wz.step>i+1?"done":"")+'"'+(wz.step===i+1?' aria-current="step"':"")+'>'+(i+1)+'. '+s+'</li>'}).join("")+'</ol><div class="wz"><div>';
 if(wz.step===1){
  var q=wzQ(),n=wz.a+wz.k;
  h+='<div class="card"><h2>1. Pilih keberangkatan</h2><div role="radiogroup" aria-label="Keberangkatan">'+ds.map(function(d){
   var s=T.depState(d),ok=s.k==="ok";
   return '<label class="dep'+(wz.dep===d.id?" on":"")+(ok?"":" off")+'"><input type="radio" name="dep" value="'+d.id+'" data-act="wz-dep" '+(wz.dep===d.id?"checked ":"")+(ok?"":"disabled ")+'><span class="i"><strong>'+dfmt(d.date)+'</strong><br><span class="sm mut">sampai '+dshort(T.addD(d.date,T.days(p)-1))+'</span></span><span class="badge '+(ok?"s-ok":"s-batal")+'">'+esc(s.label)+'</span></label>'}).join("")+'</div><span class="err" id="e_dep"></span></div>'+
  '<div class="card" style="margin-top:14px"><h2>2. Peserta dan kamar</h2><div class="row2 keep">'+stepper("a","Dewasa",1,20,wz.a,"12 tahun ke atas")+stepper("k","Anak",0,10,wz.k,"2 sampai 11 tahun")+'</div>'+stepper("s","Dewasa di kamar single",0,wz.a,wz.s,"Tambahan "+rp(p.single)+" per orang. Sisanya sekamar berdua (twin).")+'<div id="wzpar">'+parityNote()+'</div></div>'+
  '<div class="card" style="margin-top:14px"><h2>3. Tambahan</h2><label class="chk"><input type="checkbox" id="w_ins" '+(wz.ins?"checked":"")+'><span><strong>Asuransi perjalanan</strong> '+rp(T.INS)+' per orang<br><span class="sm mut">Perlu data tambahan dari peserta.</span></span></label><div style="margin-top:6px">'+stepper("opt",p.optN+" (jumlah peserta)",0,n,wz.opt,rp(p.optP)+" per orang")+'</div></div>'+
  '<div class="card" style="margin-top:14px"><h2>4. Kode promo</h2><div style="display:flex;gap:8px;align-items:start"><label class="f" style="flex:1;margin:0"><span class="l">Kode promo (opsional)</span><input id="w_promo" value="'+esc(wz.promo)+'" maxlength="20" autocapitalize="characters" aria-describedby="pmsg"></label><button class="btn ghost" style="margin-top:24px" type="button" data-act="wz-promo">Terapkan</button></div><div id="pmsg" class="sm" aria-live="polite" style="margin-top:6px">'+(wz.promoMsg||'<span class="mut">Contoh kode: JALAN10, HEMAT200.</span>')+'</div></div>'+
  '<div style="margin-top:16px;display:flex;justify-content:flex-end"><button class="btn ac" type="button" data-act="wz-next">Lanjut: data peserta</button></div>';
 }else if(wz.step===2){
  syncPax();var d=T.dep(wz.dep);
  h+='<div class="card"><h2>Kontak pemesan</h2>'+field("c_name","Nama lengkap",wz.contact.name,{attr:'autocomplete="name" maxlength="60"'})+'<div class="row2">'+field("c_phone","Nomor HP",wz.contact.phone,{type:"tel",attr:'autocomplete="tel" inputmode="tel" maxlength="16"',hint:"Contoh: 0812-0000-1234"})+field("c_email","Email",wz.contact.email,{type:"email",attr:'autocomplete="email" maxlength="80"'})+'</div></div><div class="card" style="margin-top:14px"><h2>Data peserta</h2><label class="chk"><input type="checkbox" id="w_same" '+(wz.same?"checked":"")+'><span>Peserta 1 adalah pemesan</span></label>';
  wz.pax.forEach(function(x,i){
   var kid=x.t==="K";
   h+='<div class="paxc" data-i="'+i+'"><h4>Peserta '+(i+1)+' '+badge(kid?"selesai":"dp",kid?"Anak":"Dewasa")+'</h4>'+field("p"+i+"_n","Nama sesuai identitas",x.n,{attr:'maxlength="60" data-p="'+i+'" data-pk="n"'})+'<div class="row2"><label class="f"><span class="l">Jenis kelamin</span><select id="p'+i+'_g" data-p="'+i+'" data-pk="g" aria-describedby="e_p'+i+'_g">'+opt("","Pilih",x.g)+opt("L","Laki-laki",x.g)+opt("P","Perempuan",x.g)+'</select><span class="err" id="e_p'+i+'_g"></span></label>'+field("p"+i+"_b","Tanggal lahir",x.bd,{type:"date",attr:'data-p="'+i+'" data-pk="bd" max="'+today()+'"',hint:kid?"Usia 2 sampai 11 tahun saat berangkat":"Usia 12 tahun ke atas saat berangkat"})+'</div>'+field("p"+i+"_i",kid?"No. KIA atau identitas (opsional)":"No. KTP atau paspor (16 digit)",x.idn,{attr:'inputmode="numeric" maxlength="16" data-p="'+i+'" data-pk="idn"'})+'<label class="f" style="margin:0"><span class="l">Catatan (alergi, diet, kebutuhan khusus)</span><input id="p'+i+'_c" value="'+esc(x.note)+'" maxlength="100" data-p="'+i+'" data-pk="note"></label></div>';
  });
  h+='</div><div style="margin-top:16px;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap"><button class="btn ghost" type="button" data-act="wz-back">Kembali</button><button class="btn ac" type="button" data-act="wz-next">Lanjut: ringkasan</button></div>';
 }else{
  var d3=T.dep(wz.dep),q3=wzQ(),dpOk=dpPossible();if(!dpOk)wz.mode="full";
  var pdp=T.planPay(q3.total,d3.date,today(),"dp"),pfl=T.planPay(q3.total,d3.date,today(),"full");
  h+='<div class="card"><h2>Periksa pesanan</h2><dl class="kv"><dt>Paket</dt><dd>'+esc(p.name)+'</dd><dt>Berangkat</dt><dd>'+dfmt(d3.date)+'</dd><dt>Pemesan</dt><dd>'+esc(wz.contact.name)+', '+esc(wz.contact.phone)+'</dd><dt>Peserta</dt><dd>'+wz.pax.map(function(x){return esc(x.n)}).join(", ")+'</dd><dt>Kamar</dt><dd>'+(wz.a-wz.s)+' dewasa twin, '+wz.s+' single</dd></dl></div>'+
  '<div class="card" style="margin-top:14px"><h2>Pilih pembayaran</h2><div role="radiogroup" aria-label="Skema pembayaran"><label class="dep'+(wz.mode==="dp"?" on":"")+(dpOk?"":" off")+'"><input type="radio" name="mode" value="dp" '+(wz.mode==="dp"?"checked ":"")+(dpOk?"":"disabled ")+'data-act="wz-mode"><span class="i"><strong>DP '+T.db.biro.dp+'%: '+rp(pdp.dpAmt)+'</strong><br><span class="sm mut">'+(dpOk?'Jatuh tempo '+dshort(pdp.dpDue)+'. Sisa '+rp(q3.total-pdp.dpAmt)+' sebelum '+dshort(pdp.finalDue):'Tidak tersedia: berangkat kurang dari 14 hari lagi')+'</span></span></label><label class="dep'+(wz.mode==="full"?" on":"")+'"><input type="radio" name="mode" value="full" '+(wz.mode==="full"?"checked ":"")+'data-act="wz-mode"><span class="i"><strong>Lunas: '+rp(q3.total)+'</strong><br><span class="sm mut">Jatuh tempo '+dshort(pfl.dpDue)+'</span></span></label></div></div>'+
  '<div class="card" style="margin-top:14px"><label class="chk"><input type="checkbox" id="w_agree" '+(wz.agree?"checked":"")+' aria-describedby="e_agree"><span>Saya setuju dengan syarat dan ketentuan, termasuk jadwal pembayaran dan ketentuan pembatalan.</span></label><span class="err" id="e_agree"></span></div>'+
  '<div style="margin-top:16px;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap"><button class="btn ghost" type="button" data-act="wz-back">Kembali</button><button class="btn ac" type="button" data-act="wz-submit">Buat booking</button></div>';
 }
 return h+'</div><aside class="sum-wrap" id="wzsum">'+sumHTML()+'</aside></div></div>';
}
function syncPax(){
 var n=wz.a+wz.k;
 while(wz.pax.length<n)wz.pax.push({n:"",t:"D",g:"",bd:"",idn:"",note:""});
 wz.pax.length=n;
 wz.pax.forEach(function(x,i){x.t=i<wz.a?"D":"K"});
 if(wz.same&&wz.pax[0])wz.pax[0].n=wz.contact.name;
}
function wzPartial(){var e=$("wzpar"),s=$("wzsum");if(e)e.innerHTML=parityNote();if(s)s.innerHTML=sumHTML()}
function wzRefresh(focusSel){
 var y=window.scrollY;window.__noscroll=true;render();window.__noscroll=false;window.scrollTo(0,y);
 if(focusSel){var el=view.querySelector(focusSel);if(el)el.focus()}
}
function ageAt(bd,on){var a=T.pd(bd),b=T.pd(on),y=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))y--;return y}
function wzCheck1(){
 var d=T.dep(wz.dep),ok=true,n=wz.a+wz.k,p=T.pkg(wz.pid);
 ok=setErr("dep",d&&T.depState(d).k==="ok"?"":"Pilih keberangkatan yang masih terbuka.")&&ok;
 if(d&&T.depState(d).k==="ok"){if(n>T.seatsLeft(d)){toast("Kursi tidak cukup: tersisa "+T.seatsLeft(d)+".",true);ok=false}}
 if(wz.a<1){setErr("w_a","Minimal 1 dewasa.");ok=false}else setErr("w_a","");
 if(n>20){setErr("w_a","Maksimal 20 peserta per booking. Hubungi biro untuk rombongan.");ok=false}
 if((wz.a-wz.s)%2!==0){setErr("w_s","Dewasa di kamar twin harus genap.");ok=false}else setErr("w_s","");
 if(wz.opt>n){setErr("w_opt","Tidak boleh lebih dari jumlah peserta.");ok=false}else setErr("w_opt","");
 if(wz.promo.trim()&&wz.promo.trim().toUpperCase()!==wz.promoOk){toast("Kode promo belum diterapkan. Tekan Terapkan atau kosongkan.",true);ok=false}
 if(ok&&wz.promoOk){var q=T.quote(p,{a:wz.a,k:wz.k,s:wz.s,ins:wz.ins?1:0,opt:wz.opt,promo:wz.promoOk});if(!q.promo.ok){wz.promoOk="";wz.promoMsg='<span class="err">'+esc(q.promo.msg)+'</span>';toast(q.promo.msg,true);wzRefresh();return false}}
 return ok;
}
function wzCheck2(){
 var ok=true,d=T.dep(wz.dep),c=wz.contact,first=null;
 function chk(id,m){if(m&&!first)first=id;ok=setErr(id,m)&&ok}
 chk("c_name",c.name.trim().length<3?"Nama minimal 3 huruf.":!/^[\p{L} .'\-]+$/u.test(c.name.trim())?"Nama hanya boleh huruf.":"");
 var ph=c.phone.replace(/[\s\-]/g,"");
 chk("c_phone",!/^08\d{8,11}$/.test(ph)?"Nomor HP harus diawali 08 dan 10 sampai 13 digit.":"");
 chk("c_email",!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())?"Format email belum benar.":"");
 wz.pax.forEach(function(x,i){
  var kid=x.t==="K",pre="p"+i;
  chk(pre+"_n",x.n.trim().length<3?"Nama minimal 3 huruf.":!/^[\p{L} .'\-]+$/u.test(x.n.trim())?"Nama hanya boleh huruf.":"");
  chk(pre+"_g",x.g?"":"Pilih jenis kelamin.");
  var m="";
  if(!x.bd)m="Isi tanggal lahir.";else{var ag=ageAt(x.bd,d.date);if(isNaN(ag)||x.bd>today())m="Tanggal lahir tidak valid.";else if(kid&&(ag<2||ag>11))m="Peserta anak harus berusia 2 sampai 11 tahun saat berangkat (sekarang "+ag+").";else if(!kid&&ag<12)m="Peserta dewasa minimal 12 tahun saat berangkat (sekarang "+ag+").";else if(ag>90)m="Tanggal lahir tidak valid."}
  chk(pre+"_b",m);
  var idn=x.idn.trim();
  chk(pre+"_i",kid?(idn&&!/^\d{16}$/.test(idn)?"Isi 16 digit atau kosongkan.":""):(!/^\d{16}$/.test(idn)?"Nomor identitas harus 16 digit angka.":""));
 });
 if(first){var el=$(first);if(el)el.focus();toast("Periksa isian yang bertanda merah.",true)}
 return ok;
}
function wzSubmit(){
 if(wz.busy)return;
 var p=T.pkg(wz.pid),d=T.dep(wz.dep);
 if(!wz.agree){setErr("agree","Centang persetujuan untuk melanjutkan.");return}setErr("agree","");
 if(!d||T.depState(d).k!=="ok"){toast("Jadwal ini sudah tidak tersedia. Pilih jadwal lain.",true);wz.step=1;wzRefresh();return}
 var n=wz.a+wz.k;if(n>T.seatsLeft(d)){toast("Kursi tidak cukup: tersisa "+T.seatsLeft(d)+".",true);wz.step=1;wzRefresh();return}
 wz.busy=true;
 var q=wzQ(),pl=T.planPay(q.total,d.date,today(),wz.mode),code=T.newCode(),b={code:code,pkg:p.id,dep:d.id,a:wz.a,k:wz.k,s:wz.s,ins:wz.ins?1:0,opt:wz.opt,promo:q.promo&&q.promo.ok?wz.promoOk:"",
  contact:{name:wz.contact.name.trim(),phone:wz.contact.phone.trim(),email:wz.contact.email.trim()},pax:[],lines:q.lines,sub:q.sub,disc:q.disc,total:q.total,mode:pl.mode,dpAmt:pl.dpAmt,dpDue:pl.dpDue,finalDue:pl.finalDue,status:"menunggu",at:new Date().toISOString(),pays:[],note:"",refund:null};
 wz.pax.forEach(function(x){var o={n:x.n.trim(),t:x.t,g:x.g,bd:x.bd,idn:x.idn.trim(),note:x.note.trim(),docs:{}};T.docKeys(p,b).forEach(function(k){o.docs[k]=0});b.pax.push(o)});
 T.db.books.push(b);
 if(!T.save()){T.db.books.pop();wz.busy=false;toast("Penyimpanan penuh atau diblokir. Booking tidak dibuat.",true);return}
 verify(code);wz=null;toast("Booking "+code+" dibuat. Simpan kodenya.");go("/booking/"+code);
}

/* ---------- cek booking ---------- */
function vCek(q){
 return '<div class="wrap" style="max-width:560px"><h1 style="margin-top:20px">Cek booking</h1><div class="card"><form id="fcek" novalidate>'+field("ck_code","Kode booking",q.kode||"",{attr:'placeholder="TRV-XXXXX" autocapitalize="characters" maxlength="12"'})+field("ck_hp","4 digit terakhir nomor HP pemesan","",{attr:'inputmode="numeric" maxlength="4" autocomplete="off"'})+'<button class="btn full" type="submit">Lihat booking</button></form></div><div class="card flat sm" style="margin-top:14px"><strong>Coba contoh:</strong> <button class="chip" type="button" data-act="cek-ex" data-c="TRV-K7M2X" data-h="1100">TRV-K7M2X (lunas)</button> <button class="chip" type="button" data-act="cek-ex" data-c="TRV-M8P3F" data-h="1128">TRV-M8P3F (menunggu DP)</button> <button class="chip" type="button" data-act="cek-ex" data-c="TRV-B9T5C" data-h="1114">TRV-B9T5C (selesai)</button></div></div>';
}
var STEPS=["menunggu","dp","lunas","berangkat","selesai"];
function vBooking(code){
 var b=T.book(code);
 if(!b)return '<div class="wrap"><div class="empty"><h1>Booking tidak ditemukan</h1><a class="btn" href="#/cek">Cek booking lain</a></div></div>';
 if(verified().indexOf(b.code)<0)return '<div class="wrap" style="max-width:560px"><div class="alert">Verifikasi dulu: masukkan kode dan 4 digit terakhir HP.</div>'+vCek({kode:b.code})+'</div>';
 var p=T.pkg(b.pkg),d=T.dep(b.dep),paid=T.paid(b),pend=T.pending(b),rem=b.total-paid-pend,od=T.overdue(b);
 var ci=STEPS.indexOf(b.status);
 var tl=b.status==="batal"?'<p>'+badge("batal","Booking dibatalkan")+'</p>':'<ol class="tl" aria-label="Status booking">'+STEPS.map(function(s,i){return '<li class="'+(i<=ci?"on":"")+'"'+(i===ci?' aria-current="step"':"")+'>'+esc(s==="menunggu"?(b.mode==="full"?"Menunggu bayar":"Menunggu DP"):T.SL[s])+'</li>'}).join("")+'</ol>';
 var h='<div class="wrap"><p class="sm" style="margin:14px 0 0"><a href="#/cek">Cek booking lain</a></p><h1 style="margin-top:8px">Booking <span class="code">'+esc(b.code)+'</span> '+stBadge(b)+'</h1>'+tl+(od?'<div class="alert er" role="alert">'+esc(od)+'. Segera lakukan pembayaran atau hubungi biro.</div>':"")+
 '<div class="det"><div>'+
 '<section class="card"><h2>Perjalanan</h2><div style="display:grid;gap:12px;grid-template-columns:110px 1fr;align-items:start">'+photo(p.cover,T.PH[p.cover],"")+'<div><strong>'+esc(p.name)+'</strong><br><span class="sm">'+dfmt(d.date)+' sampai '+dshort(T.addD(d.date,T.days(p)-1))+'</span><br><span class="sm mut">Titik kumpul: '+esc(p.meet)+'</span></div></div><dl class="kv" style="margin-top:12px"><dt>Pemesan</dt><dd>'+esc(b.contact.name)+'</dd><dt>Kontak</dt><dd>'+esc(b.contact.phone)+', '+esc(b.contact.email)+'</dd><dt>Dibuat</dt><dd>'+T.stamp(b.at)+'</dd></dl></section>'+
 '<section class="card" style="margin-top:14px"><h2>Peserta dan dokumen</h2><div class="resp"><table class="t rt"><thead><tr><th>Nama</th><th>Kamar</th><th>Identitas</th><th>Checklist dokumen</th></tr></thead><tbody>'+b.pax.map(function(x,i){return '<tr><td data-l="Nama"><strong>'+esc(x.n)+'</strong><br><span class="sm mut">'+(x.t==="K"?"Anak":"Dewasa")+(x.g==="L"?", L":", P")+'</span></td><td data-l="Kamar">'+esc(T.roomOf(b,i))+'</td><td data-l="Identitas">'+esc(maskId(x.idn))+'</td><td class="act">'+docPills(p,b,x,i,false)+'</td></tr>'}).join("")+'</tbody></table></div><p class="sm mut">Kirim dokumen ke biro lewat WhatsApp, lalu tekan "belum" untuk menandai sudah dikirim. Biro yang menandai lengkap.</p></section>';
 h+=bookingPay(b,p,d,paid,pend,rem);
 h+=reviewBox(b);
 h+='</div><aside class="side"><div class="card sum"><h3>Rincian biaya</h3>'+b.lines.map(function(x){return '<div class="ln"><span>'+esc(x.l)+' x'+x.q+'</span><span>'+rp(x.q*x.u)+'</span></div>'}).join("")+(b.disc?'<div class="ln" style="color:var(--ok)"><span>Promo '+esc(b.promo)+'</span><span>-'+rp(b.disc)+'</span></div>':"")+'<div class="ln tot"><span>Total</span><span>'+rp(b.total)+'</span></div><div class="ln"><span>Terbayar</span><span>'+rp(paid)+'</span></div>'+(pend?'<div class="ln"><span>Menunggu verifikasi</span><span>'+rp(pend)+'</span></div>':"")+'<div class="ln"><strong>Sisa</strong><strong>'+rp(Math.max(0,b.total-paid))+'</strong></div></div>'+
 '<div class="card flat"><h3>Dokumen</h3><div class="actions"><button class="btn ghost" data-act="print-itin" data-c="'+esc(b.code)+'" type="button">Cetak e-itinerary</button><button class="btn ghost" data-act="print-vch" data-c="'+esc(b.code)+'" type="button"'+(["lunas","berangkat","selesai"].indexOf(b.status)<0?' disabled':'')+'>Cetak voucher</button></div>'+(["lunas","berangkat","selesai"].indexOf(b.status)<0?'<p class="sm mut" style="margin-top:8px">Voucher tersedia setelah lunas.</p>':"")+'</div></aside></div></div>';
 return h;
}
function docPills(p,b,x,i,admin){
 return T.docKeys(p,b).map(function(k){var v=x.docs[k]||0,l=v===2?"lengkap":v===1?"dikirim":"belum";
  var act=admin?'data-act="doc-adm" data-c="'+esc(b.code)+'" data-i="'+i+'" data-k="'+k+'"':(v===0?'data-act="doc-send" data-c="'+esc(b.code)+'" data-i="'+i+'" data-k="'+k+'"':"disabled");
  return '<button type="button" class="doc d'+v+'" '+act+' aria-label="'+esc(T.DOCL[k])+' '+esc(x.n)+': '+l+'">'+esc(T.DOCL[k])+': '+l+'</button>'}).join("");
}
function bookingPay(b,p,d,paid,pend,rem){
 var h='<section class="card" style="margin-top:14px"><h2>Pembayaran</h2><dl class="kv"><dt>'+(b.mode==="dp"?"DP":"Pembayaran")+'</dt><dd>'+rp(b.dpAmt)+' sebelum '+dshort(b.dpDue)+'</dd>'+(b.mode==="dp"?'<dt>Pelunasan</dt><dd>'+rp(b.total-b.dpAmt)+' sebelum '+dshort(b.finalDue)+'</dd>':"")+'</dl>';
 h+=b.pays.length?'<table class="t rt" style="margin-top:10px"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Metode</th><th class="n">Jumlah</th><th>Status</th></tr></thead><tbody>'+b.pays.map(function(y){return '<tr><td data-l="Tanggal">'+T.stamp(y.at)+'</td><td data-l="Jenis">'+esc(y.kind)+'</td><td data-l="Metode">'+esc(y.method)+'</td><td class="n" data-l="Jumlah">'+rp(y.amt)+'</td><td data-l="Status">'+badge(y.st==="ok"?"ok":y.st==="tolak"?"tolak":"warn",y.st==="ok"?"Terkonfirmasi":y.st==="tolak"?"Ditolak":"Menunggu verifikasi")+'</td></tr>'}).join("")+'</tbody></table>':'<p class="mut" style="margin-top:10px">Belum ada pembayaran.</p>';
 if(b.status==="batal"){h+='<p class="alert" style="margin-top:10px">Booking dibatalkan.'+(b.refund?' Pengembalian dana '+rp(b.refund.amt)+' ('+b.refund.pct+'% dari pembayaran terkonfirmasi) diproses biro.':"")+'</p>'}
 else if(["berangkat","selesai"].indexOf(b.status)<0&&rem>0){
  var opts="";
  if(b.mode==="dp"&&paid+pend<b.dpAmt)opts+=opt("DP","DP: "+rp(b.dpAmt-paid-pend),"");
  opts+=opt("Sisa",(b.mode==="dp"&&paid+pend<b.dpAmt?"Langsung lunas":"Sisa pembayaran")+": "+rp(rem),"");
  h+='<form id="fpay" data-c="'+esc(b.code)+'" style="margin-top:14px" novalidate><h3>Simulasi pembayaran</h3><p class="sm mut">Ini simulasi: tidak ada uang yang bergerak. Rekening contoh: Bank Contoh 000-000-0000 a.n. '+esc(T.db.biro.nama)+'.</p><div class="row2"><label class="f"><span class="l">Bayar</span><select id="py_k">'+opts+'</select></label><label class="f"><span class="l">Metode</span><select id="py_m">'+T.METHODS.map(function(m){return opt(m,m,"")}).join("")+'</select></label></div>'+field("py_r","No. referensi transfer (opsional)","",{attr:'maxlength="20"'})+'<button class="btn" type="submit">Saya sudah bayar</button></form>';
 }else if(rem<=0&&pend>0)h+='<p class="alert in" style="margin-top:10px">Pembayaran sedang diverifikasi biro.</p>';
 return h+'</section>';
}
function reviewBox(b){
 if(b.status!=="selesai")return"";
 var ex=T.db.reviews.filter(function(r){return r.code===b.code})[0];
 if(ex)return '<section class="card" style="margin-top:14px"><h2>Ulasan Anda</h2>'+stars(ex.rating)+'<p>'+esc(ex.text)+'</p></section>';
 return '<section class="card" style="margin-top:14px"><h2>Tulis ulasan</h2><form id="frev" data-c="'+esc(b.code)+'" novalidate><label class="f"><span class="l">Rating</span><select id="rv_r">'+[5,4,3,2,1].map(function(n){return opt(n,n+" dari 5","5")}).join("")+'</select></label><label class="f"><span class="l">Ulasan (10 sampai 300 huruf)</span><textarea id="rv_t" maxlength="300" aria-describedby="e_rv_t"></textarea><span class="err" id="e_rv_t"></span></label><button class="btn" type="submit">Kirim ulasan</button></form></section>';
}

/* ---------- sewa ---------- */
function vSewa(){
 return '<div class="wrap"><h1 style="margin-top:20px">Sewa homestay dan transport</h1><p class="mut">Tanpa ikut paket. Kirim permintaan, biro menghubungi Anda untuk konfirmasi ketersediaan.</p><div class="grid">'+T.RENT.map(function(r){return '<div class="card"><h3>'+esc(r.n)+'</h3><p class="sm mut">'+esc(r.d)+'</p><div class="price">'+rp(r.p)+' <small>/'+r.u+'</small></div></div>'}).join("")+'</div>'+
 '<div class="card" style="margin-top:20px;max-width:640px"><h2>Ajukan sewa</h2><form id="fsewa" novalidate><label class="f"><span class="l">Layanan</span><select id="sw_i">'+T.RENT.map(function(r){return opt(r.id,r.n+" ("+rp(r.p)+"/"+r.u+")","")}).join("")+'</select></label><div class="row3">'+field("sw_d","Mulai tanggal","",{type:"date",attr:'min="'+T.addD(today(),1)+'"'})+field("sw_n","Lama (hari atau malam)","1",{attr:'inputmode="numeric" maxlength="2"'})+field("sw_q","Jumlah unit","1",{attr:'inputmode="numeric" maxlength="2"'})+'</div><div class="row2">'+field("sw_name","Nama","",{attr:'maxlength="60" autocomplete="name"'})+field("sw_hp","Nomor HP","",{type:"tel",attr:'inputmode="tel" maxlength="16" autocomplete="tel"'})+'</div><label class="f"><span class="l">Catatan (opsional)</span><textarea id="sw_c" maxlength="200"></textarea></label><p class="sm" id="sw_est" aria-live="polite"></p><button class="btn" type="submit">Kirim permintaan</button></form></div></div>';
}
function swEst(){var e=$("sw_est");if(!e)return;var r=T.RENT.filter(function(x){return x.id===$("sw_i").value})[0],n=parseInt($("sw_n").value,10),q=parseInt($("sw_q").value,10);e.textContent=r&&n>0&&q>0?"Perkiraan biaya: "+rp(r.p*n*q)+" ("+q+" unit x "+n+" "+r.u+"). Belum termasuk biaya lain.":""}

/* ---------- kredit ---------- */
function vKredit(){return '<div class="wrap" style="max-width:820px"><h1 style="margin-top:20px">Kredit foto</h1><p class="mut">Semua foto dari Wikimedia Commons, dipakai sesuai lisensi masing-masing. Berkas lengkap: <a href="credits.json">credits.json</a>.</p><div id="cred" class="card"><p class="mut">Memuat...</p></div></div>'}
function loadCredits(){
 fetch("credits.json").then(function(r){return r.json()}).then(function(L){
  var e=$("cred");if(!e)return;
  e.innerHTML='<table class="t rt"><thead><tr><th>Foto</th><th>Judul berkas</th><th>Pembuat</th><th>Lisensi</th></tr></thead><tbody>'+L.map(function(c){return '<tr><td data-l="Foto"><img src="'+esc(c.file)+'" alt="" width="80" height="54" loading="lazy" style="border-radius:6px;width:80px;height:54px;object-fit:cover"></td><td data-l="Judul"><a href="'+esc(c.source)+'" rel="noopener" target="_blank">'+esc(c.title)+'</a></td><td data-l="Pembuat">'+esc(c.author)+'</td><td data-l="Lisensi">'+esc(c.license)+'</td></tr>'}).join("")+'</tbody></table>';
 }).catch(function(){var e=$("cred");if(e)e.innerHTML='<p>Daftar tidak bisa dimuat di sini. Buka <a href="credits.json">credits.json</a>.</p>'});
}

/* ---------- cetak ---------- */
function bizHead(){var b=T.db.biro;return '<h1>'+esc(b.nama)+'</h1><p>Kontak darurat: '+esc(b.wa)+' | Dokumen contoh (demo fiktif)</p>'}
function itinHTML(p,d){return '<h2>Itinerary</h2><table><tbody>'+p.it.map(function(x,i){return '<tr><td style="width:90px">Hari '+(i+1)+'<br>'+dshort(T.addD(d.date,i))+'</td><td><strong>'+esc(x.t)+'</strong><br>'+esc(x.d)+'</td></tr>'}).join("")+'</tbody></table>'}
function paxTable(b,p){return '<table><thead><tr><th>No</th><th>Nama</th><th>Jenis</th><th>Kamar</th><th>Identitas</th></tr></thead><tbody>'+b.pax.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+esc(x.n)+'</td><td>'+(x.t==="K"?"Anak":"Dewasa")+'</td><td>'+esc(T.roomOf(b,i))+'</td><td>'+esc(maskId(x.idn))+'</td></tr>'}).join("")+'</tbody></table>'}
function printItin(code){
 var b=T.book(code),p=T.pkg(b.pkg),d=T.dep(b.dep);
 printHTML(bizHead()+'<h2>E-itinerary '+esc(b.code)+'</h2><p><strong>'+esc(p.name)+'</strong><br>'+dfmt(d.date)+' sampai '+dshort(T.addD(d.date,T.days(p)-1))+'<br>Titik kumpul: '+esc(p.meet)+'</p>'+itinHTML(p,d)+'<h2>Peserta</h2>'+paxTable(b,p)+'<h2>Bawa</h2><p>Tanda pengenal asli, obat pribadi, pakaian sesuai cuaca'+(p.health?", surat sehat":"")+'.</p>');
}
function printVoucher(code){
 var b=T.book(code),p=T.pkg(b.pkg),d=T.dep(b.dep);
 printHTML(bizHead()+'<h2>VOUCHER '+esc(b.code)+'</h2><p>Status: <strong>'+esc(T.statusLabel(b))+'</strong> | Total '+rp(b.total)+' | Terbayar '+rp(T.paid(b))+'</p><p><strong>'+esc(p.name)+'</strong><br>Berangkat '+dfmt(d.date)+'<br>Titik kumpul: '+esc(p.meet)+'<br>Pemesan: '+esc(b.contact.name)+', '+esc(b.contact.phone)+'</p><h2>Peserta</h2>'+paxTable(b,p)+'<h2>Termasuk</h2><ul>'+p.inc.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul><h2>Tidak termasuk</h2><ul>'+p.exc.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul><p>Tunjukkan voucher ini dan tanda pengenal kepada pemandu.</p>');
}
function manifestRows(dp){
 var rows=[];T.db.books.filter(function(b){return b.dep===dp.id&&b.status!=="batal"}).forEach(function(b){b.pax.forEach(function(x,i){rows.push({b:b,x:x,i:i})})});return rows;
}
function printManifest(depId){
 var d=T.dep(depId),p=T.pkg(d.pkg),rows=manifestRows(d),used=T.seatsUsed(d.id);
 printHTML(bizHead()+'<h2>Manifest peserta</h2><p><strong>'+esc(p.name)+'</strong><br>Berangkat '+dfmt(d.date)+' | Peserta '+used+' dari kuota '+d.quota+'<br>Titik kumpul: '+esc(p.meet)+'</p><table><thead><tr><th>No</th><th>Nama</th><th>Jenis</th><th>L/P</th><th>Lahir</th><th>Identitas</th><th>Kamar</th><th>Booking</th><th>HP pemesan</th><th>Dokumen</th><th>Catatan</th></tr></thead><tbody>'+(rows.length?rows.map(function(r,n){var ok=T.docKeys(p,r.b).every(function(k){return r.x.docs[k]===2});return '<tr><td>'+(n+1)+'</td><td>'+esc(r.x.n)+'</td><td>'+(r.x.t==="K"?"Anak":"Dewasa")+'</td><td>'+esc(r.x.g)+'</td><td>'+esc(r.x.bd)+'</td><td>'+esc(maskId(r.x.idn))+'</td><td>'+esc(T.roomOf(r.b,r.i))+'</td><td>'+esc(r.b.code)+'</td><td>'+esc(r.b.contact.phone)+'</td><td>'+(ok?"Lengkap":"Belum")+'</td><td>'+esc(r.x.note)+'</td></tr>'}).join(""):'<tr><td colspan="11">Belum ada peserta.</td></tr>')+'</tbody></table>');
}

/* ================= PANEL BIRO ================= */
var ATABS=[["ringkasan","Ringkasan"],["booking","Booking"],["paket","Paket"],["jadwal","Jadwal"],["bayar","Pembayaran"],["sewa","Sewa"],["laporan","Laporan"],["atur","Pengaturan"]];
function payQueue(){var L=[];T.db.books.forEach(function(b){b.pays.forEach(function(y){L.push({b:b,y:y})})});return L.sort(function(a,b){return a.y.at<b.y.at?1:-1})}
function vAdmin(tab){
 if(!isAdmin())return '<div class="wrap"><div class="card login"><h1>Panel biro</h1><p class="sm">PIN demo: <strong>'+esc(T.db.biro.pin)+'</strong></p><form id="flogin" novalidate><label class="f"><span class="l">PIN (4 angka)</span><input id="pin" inputmode="numeric" maxlength="4" autocomplete="off" type="password" aria-describedby="e_pin"><span class="err" id="e_pin"></span></label><button class="btn full" type="submit">Masuk</button></form></div></div>';
 if(!ATABS.some(function(t){return t[0]===tab}))tab="ringkasan";
 var np=payQueue().filter(function(x){return x.y.st==="menunggu"}).length,ns=T.db.rents.filter(function(r){return r.st==="baru"}).length;
 var h='<div class="wrap"><div class="adm"><nav class="atabs" aria-label="Menu panel">'+ATABS.map(function(t){var n=t[0]==="bayar"?np:t[0]==="sewa"?ns:0;return '<a href="#/admin/'+t[0]+'"'+(t[0]===tab?' class="on" aria-current="page"':"")+'>'+t[1]+(n?' <span class="n" aria-label="'+n+' baru">'+n+'</span>':"")+'</a>'}).join("")+'</nav><div id="atab" style="min-width:0">';
 h+=({ringkasan:aRing,booking:aBook,paket:aPaket,jadwal:aJadwal,bayar:aBayar,sewa:aSewa,laporan:aLap,atur:aAtur})[tab]();
 return h+'</div></div></div>';
}
function netRev(){return T.sum(T.db.books,function(b){return T.paid(b)-(b.refund?b.refund.amt:0)})}
function kpi(l,v){return '<div class="kpi"><span>'+esc(l)+'</span><b>'+v+'</b></div>'}
function depRow(d,withBtn){
 var p=T.pkg(d.pkg),u=T.seatsUsed(d.id),pct=Math.round(u/d.quota*100);
 return '<tr><td data-l="Paket"><strong>'+esc(p.name)+'</strong><br><span class="sm mut">'+dfmt(d.date)+'</span></td><td data-l="Terisi"><div class="bar'+(u>=d.quota?" full":pct>70?" hi":"")+'"><i style="width:'+pct+'%"></i></div><span class="sm">'+u+' / '+d.quota+' kursi</span></td><td class="act">'+(withBtn?'<button class="btn ghost sm" data-act="manifest" data-d="'+d.id+'" type="button">Cetak manifest</button>':"")+'</td></tr>';
}
function aRing(){
 var act=T.db.books.filter(function(b){return b.status!=="batal"&&b.status!=="selesai"}),piut=T.sum(T.db.books.filter(function(b){return["menunggu","dp","lunas","berangkat"].indexOf(b.status)>=0}),function(b){return Math.max(0,b.total-T.paid(b))});
 var t=today(),soon=T.db.deps.filter(function(d){return d.date>=t&&d.date<=T.addD(t,30)}),cap=T.sum(soon,function(d){return d.quota}),used=T.sum(soon,function(d){return T.seatsUsed(d.id)});
 var pend=payQueue().filter(function(x){return x.y.st==="menunggu"}),od=T.db.books.filter(function(b){return T.overdue(b)});
 var up=T.db.deps.filter(function(d){return d.date>=t}).sort(function(a,b){return a.date<b.date?-1:1}).slice(0,5);
 return '<h1>Ringkasan</h1><div class="kpis">'+kpi("Booking aktif",act.length)+kpi("Omzet bersih",rp(netRev()))+kpi("Piutang pelanggan",rp(piut))+kpi("Kursi terisi 30 hari",used+" / "+cap+" ("+(cap?Math.round(used/cap*100):0)+"%)")+'</div>'+
 '<div class="two" style="margin-top:14px"><section class="card"><h2>Perlu tindakan</h2>'+(pend.length||od.length?'<ul class="clean">'+(pend.length?'<li style="margin-bottom:8px">'+pend.length+' pembayaran menunggu verifikasi <a class="btn sm" href="#/admin/bayar">Buka</a></li>':"")+od.slice(0,5).map(function(b){return '<li style="margin-bottom:8px">'+badge("warn",T.overdue(b))+' <span class="code">'+esc(b.code)+'</span> '+esc(b.contact.name)+' <button class="btn ghost sm" data-act="adm-book" data-c="'+esc(b.code)+'" type="button">Buka</button></li>'}).join("")+'</ul>':'<p class="mut">Tidak ada yang tertunda.</p>')+'</section><section class="card"><h2>Keberangkatan terdekat</h2><table class="t rt"><tbody>'+up.map(function(d){return depRow(d,true)}).join("")+'</tbody></table></section></div>';
}
/* ----- booking ----- */
function bookRows(){
 var q=af.q.trim().toLowerCase();
 return T.db.books.filter(function(b){return(!af.st||b.status===af.st)&&(!af.pkg||b.pkg===af.pkg)&&(!q||(b.code+" "+b.contact.name+" "+b.contact.phone).toLowerCase().indexOf(q)>=0)}).sort(function(a,b){return a.at<b.at?1:-1});
}
function bookTable(){
 var L=bookRows();
 if(!L.length)return '<div class="empty card"><h3>Tidak ada booking</h3><p>Ubah filter atau pencarian.</p></div>';
 return '<table class="t rt"><thead><tr><th>Kode</th><th>Pemesan</th><th>Paket</th><th class="n">Total</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(b){var p=T.pkg(b.pkg),d=T.dep(b.dep),od=T.overdue(b);return '<tr><td data-l="Kode"><span class="code">'+esc(b.code)+'</span></td><td data-l="Pemesan">'+esc(b.contact.name)+'<br><span class="sm mut">'+(b.a+b.k)+' peserta</span></td><td data-l="Paket">'+esc(p.name)+'<br><span class="sm mut">'+dshort(d.date)+'</span></td><td class="n" data-l="Total">'+rp(b.total)+'<br><span class="sm mut">dibayar '+rp(T.paid(b))+'</span></td><td data-l="Status">'+stBadge(b)+(od?'<br>'+badge("warn",od):"")+'</td><td class="act"><button class="btn ghost sm" data-act="adm-book" data-c="'+esc(b.code)+'" type="button">Buka</button></td></tr>'}).join("")+'</tbody></table>';
}
function aBook(){
 return '<h1>Booking</h1><div class="tb"><label class="f grow"><span class="l">Cari kode, nama, atau HP</span><input data-af="q" value="'+esc(af.q)+'"></label><label class="f"><span class="l">Status</span><select data-af="st">'+opt("","Semua",af.st)+Object.keys(T.SL).map(function(k){return opt(k,T.SL[k],af.st)}).join("")+'</select></label><label class="f"><span class="l">Paket</span><select data-af="pkg">'+opt("","Semua",af.pkg)+T.db.pkgs.map(function(p){return opt(p.id,p.name,af.pkg)}).join("")+'</select></label><button class="btn ghost" data-act="csv-book" type="button">Unduh CSV</button></div><div id="btab">'+bookTable()+'</div>';
}
function bookSheet(code){
 var b=T.book(code),p=T.pkg(b.pkg),d=T.dep(b.dep),paid=T.paid(b),pend=T.pending(b),rem=b.total-paid,dpd=b.mode==="dp"&&paid<b.dpAmt;
 var h='<dl class="kv"><dt>Status</dt><dd>'+stBadge(b)+(T.overdue(b)?" "+badge("warn",T.overdue(b)):"")+'</dd><dt>Paket</dt><dd>'+esc(p.name)+'</dd><dt>Berangkat</dt><dd>'+dfmt(d.date)+'</dd><dt>Pemesan</dt><dd>'+esc(b.contact.name)+'<br>'+esc(b.contact.phone)+', '+esc(b.contact.email)+'</dd><dt>Dibuat</dt><dd>'+T.stamp(b.at)+'</dd><dt>Total</dt><dd>'+rp(b.total)+(b.disc?' (promo '+esc(b.promo)+' -'+rp(b.disc)+')':"")+'</dd><dt>Terbayar</dt><dd>'+rp(paid)+' | sisa '+rp(Math.max(0,rem))+'</dd><dt>Jatuh tempo</dt><dd>'+(b.mode==="dp"?"DP "+dshort(b.dpDue)+", lunas "+dshort(b.finalDue):"Lunas "+dshort(b.dpDue))+'</dd>'+(b.refund?'<dt>Pengembalian</dt><dd>'+rp(b.refund.amt)+' ('+b.refund.pct+'%)</dd>':"")+'</dl>';
 var acts="";
 if(b.status==="lunas")acts+='<button class="btn" data-act="st-go" data-c="'+esc(b.code)+'" data-s="berangkat" type="button">Tandai berangkat</button>';
 if(b.status==="berangkat")acts+='<button class="btn" data-act="st-go" data-c="'+esc(b.code)+'" data-s="selesai" type="button">Tandai selesai</button>';
 if(["menunggu","dp","lunas"].indexOf(b.status)>=0){var rf=T.refundFor(b);acts+='<button class="btn dg" data-arm="1" data-armtext="Tekan lagi: batalkan (kembali '+rp(rf.amt)+')" data-act="st-go" data-c="'+esc(b.code)+'" data-s="batal" type="button">Batalkan booking</button>'}
 acts+='<button class="btn ghost" data-act="print-itin" data-c="'+esc(b.code)+'" type="button">Cetak itinerary</button><button class="btn ghost" data-act="print-vch" data-c="'+esc(b.code)+'" type="button">Cetak voucher</button>';
 h+='<div class="actions" style="margin:12px 0">'+acts+'</div>';
 h+='<h3>Pembayaran</h3>'+(b.pays.length?'<table class="t rt"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Metode</th><th class="n">Jumlah</th><th>Status</th><th></th></tr></thead><tbody>'+b.pays.map(function(y,i){return '<tr><td data-l="Tanggal">'+T.stamp(y.at)+'</td><td data-l="Jenis">'+esc(y.kind)+'</td><td data-l="Metode">'+esc(y.method)+(y.ref?'<br><span class="sm mut">'+esc(y.ref)+'</span>':"")+'</td><td class="n" data-l="Jumlah">'+rp(y.amt)+'</td><td data-l="Status">'+badge(y.st==="ok"?"ok":y.st==="tolak"?"tolak":"warn",y.st==="ok"?"Terkonfirmasi":y.st==="tolak"?"Ditolak":"Menunggu")+'</td><td class="act">'+(y.st==="menunggu"?'<div class="actions"><button class="btn sm" data-act="pay-ok" data-c="'+esc(b.code)+'" data-i="'+i+'" type="button">Konfirmasi</button><button class="btn dg sm" data-act="pay-no" data-c="'+esc(b.code)+'" data-i="'+i+'" type="button">Tolak</button></div>':"")+'</td></tr>'}).join("")+'</tbody></table>':'<p class="mut">Belum ada pembayaran.</p>');
 if(["menunggu","dp","lunas"].indexOf(b.status)>=0&&rem>0)h+='<form id="fcatat" data-c="'+esc(b.code)+'" style="margin-top:12px" novalidate><h3>Catat pembayaran diterima</h3><div class="row3"><label class="f"><span class="l">Jenis</span><select id="ct_k">'+opt("DP","DP",dpd?"DP":"")+opt("Pelunasan","Pelunasan",dpd?"":"Pelunasan")+opt("Lunas","Lunas","")+'</select></label>'+field("ct_a","Jumlah (Rp)",String(dpd?b.dpAmt-paid:rem),{attr:'inputmode="numeric" maxlength="12"'})+'<label class="f"><span class="l">Metode</span><select id="ct_m">'+T.METHODS.concat(["Tunai di kantor"]).map(function(m){return opt(m,m,"")}).join("")+'</select></label></div><button class="btn" type="submit">Catat dan konfirmasi</button></form>';
 h+='<h3 style="margin-top:18px">Peserta dan dokumen</h3><p class="sm mut">Tekan tanda dokumen untuk mengganti antara belum dan lengkap.</p><table class="t rt"><thead><tr><th>Nama</th><th>Kamar</th><th>Lahir</th><th>Identitas</th><th>Dokumen</th></tr></thead><tbody>'+b.pax.map(function(x,i){return '<tr><td data-l="Nama"><strong>'+esc(x.n)+'</strong><br><span class="sm mut">'+(x.t==="K"?"Anak":"Dewasa")+', '+esc(x.g)+(x.note?" | "+esc(x.note):"")+'</span></td><td data-l="Kamar">'+esc(T.roomOf(b,i))+'</td><td data-l="Lahir">'+esc(x.bd)+'</td><td data-l="Identitas">'+esc(maskId(x.idn))+'</td><td class="act">'+docPills(p,b,x,i,true)+'</td></tr>'}).join("")+'</tbody></table>';
 h+='<form id="fnote" data-c="'+esc(b.code)+'" style="margin-top:14px"><label class="f"><span class="l">Catatan internal</span><textarea id="nt" maxlength="300">'+esc(b.note)+'</textarea></label><button class="btn ghost" type="submit">Simpan catatan</button></form>';
 if(b.status==="batal")h+='<button class="btn dg" style="margin-top:14px" data-arm="1" data-armtext="Tekan lagi: hapus permanen" data-act="book-del" data-c="'+esc(b.code)+'" type="button">Hapus booking</button>';
 return h;
}
function showBook(code){
 var b=T.book(code);if(!b)return;
 if(inSheet()&&window.__sheet===code){$("sbody").innerHTML=bookSheet(code);var h=$("sht");if(h)h.textContent="Booking "+code}
 else{openSheet("Booking "+code,bookSheet(code));window.__sheet=code}
}
function afterAdmin(code){render0();if(code)showBook(code)}
function render0(){
 var y=window.scrollY,p=parse().r;
 if(p[0]!=="admin")return;
 view.innerHTML=vAdmin(p[1]||"ringkasan");
 window.scrollTo(0,y);
}
/* ----- paket ----- */
function aPaket(){
 return '<h1>Paket</h1><div class="tb"><button class="btn" data-act="pk-edit" data-id="" type="button">Tambah paket</button></div><table class="t rt"><thead><tr><th>Paket</th><th class="n">Harga dewasa</th><th>Jadwal</th><th>Status</th><th></th></tr></thead><tbody>'+T.db.pkgs.map(function(p){var ds=T.depsOf(p.id).filter(function(d){return d.date>=today()}),bk=T.db.books.filter(function(b){return b.pkg===p.id}).length;return '<tr><td data-l="Paket"><strong>'+esc(p.name)+'</strong><br><span class="sm mut">'+esc(p.dest)+' | '+esc(p.tipe)+' | '+T.dur(p)+'</span></td><td class="n" data-l="Harga">'+rp(p.t1)+'<br><span class="sm mut">grup 6+: '+rp(p.t6)+'</span></td><td data-l="Jadwal">'+ds.length+' mendatang<br><span class="sm mut">'+bk+' booking</span></td><td data-l="Status">'+badge(p.active?"ok":"batal",p.active?"Tayang":"Disembunyikan")+'</td><td class="act"><div class="actions"><button class="btn ghost sm" data-act="pk-edit" data-id="'+p.id+'" type="button">Ubah</button><button class="btn ghost sm" data-act="pk-toggle" data-id="'+p.id+'" type="button">'+(p.active?"Sembunyikan":"Tayangkan")+'</button><button class="btn dg sm" data-arm="1" data-armtext="Tekan lagi: hapus" data-act="pk-del" data-id="'+p.id+'" type="button">Hapus</button></div></td></tr>'}).join("")+'</tbody></table>';
}
function itRow(x,i){return '<div class="itrow" data-it><div class="row2" style="grid-template-columns:1fr auto;align-items:end"><label class="f" style="margin:0"><span class="l">Judul hari <b data-no>'+(i+1)+'</b></span><input data-it-t maxlength="80" value="'+esc(x.t)+'"></label><button class="btn dg sm" type="button" data-act="it-del" aria-label="Hapus hari">Hapus</button></div><label class="f" style="margin:8px 0 0"><span class="l">Kegiatan</span><textarea data-it-d maxlength="400">'+esc(x.d)+'</textarea></label></div>'}
function pkForm(id){
 var p=id?T.pkg(id):{id:"",name:"",dest:T.DESTS[0],tipe:T.TIPES[0],tema:T.TEMAS[0],active:true,health:false,cover:"borobudur",photos:["borobudur"],t1:0,t3:0,t6:0,child:75,single:0,optN:"",optP:0,desc:"",inc:[],exc:[],it:[{t:"",d:""}],faq:[],meet:""};
 var ph=Object.keys(T.PH);
 return '<form id="fpk" data-id="'+esc(id||"")+'" novalidate><div class="row2">'+field("k_name","Nama paket",p.name,{attr:'maxlength="70"'})+'<label class="f"><span class="l">Destinasi</span><input id="k_dest" list="dl" value="'+esc(p.dest)+'" maxlength="40" aria-describedby="e_k_dest"><datalist id="dl">'+T.DESTS.map(function(x){return '<option value="'+esc(x)+'">'}).join("")+'</datalist><span class="err" id="e_k_dest"></span></label></div><div class="row3"><label class="f"><span class="l">Jenis</span><select id="k_tipe">'+T.TIPES.map(function(t){return opt(t,t,p.tipe)}).join("")+'</select></label><label class="f"><span class="l">Tema</span><select id="k_tema">'+T.TEMAS.map(function(t){return opt(t,t,p.tema)}).join("")+'</select></label>'+field("k_meet","Titik kumpul",p.meet,{attr:'maxlength="100"'})+'</div>'+
 '<label class="f"><span class="l">Deskripsi singkat</span><textarea id="k_desc" maxlength="400" aria-describedby="e_k_desc">'+esc(p.desc)+'</textarea><span class="err" id="e_k_desc"></span></label>'+
 '<h3>Harga per orang (Rp)</h3><div class="row3">'+field("k_t1","Dewasa, 1-2 orang",p.t1||"",{attr:'inputmode="numeric" maxlength="9"'})+field("k_t3","Dewasa, 3-5 orang",p.t3||"",{attr:'inputmode="numeric" maxlength="9"'})+field("k_t6","Dewasa, 6+ orang",p.t6||"",{attr:'inputmode="numeric" maxlength="9"'})+'</div><div class="row3">'+field("k_child","Harga anak (% dari dewasa)",p.child,{attr:'inputmode="numeric" maxlength="3"'})+field("k_single","Tambahan kamar single",p.single||"",{attr:'inputmode="numeric" maxlength="9"'})+'<label class="chk" style="margin-top:28px"><input type="checkbox" id="k_health" '+(p.health?"checked":"")+'><span>Wajib surat sehat</span></label></div><div class="row2">'+field("k_optn","Nama tur opsional",p.optN,{attr:'maxlength="60"'})+field("k_optp","Harga tur opsional",p.optP||"",{attr:'inputmode="numeric" maxlength="9"'})+'</div>'+
 '<div class="row2"><label class="f"><span class="l">Termasuk (satu per baris)</span><textarea id="k_inc" aria-describedby="e_k_inc">'+esc(p.inc.join("\n"))+'</textarea><span class="err" id="e_k_inc"></span></label><label class="f"><span class="l">Tidak termasuk (satu per baris)</span><textarea id="k_exc">'+esc(p.exc.join("\n"))+'</textarea></label></div>'+
 '<h3>Itinerary</h3><div id="itl">'+p.it.map(itRow).join("")+'</div><span class="err" id="e_itl"></span><button class="btn ghost sm" type="button" data-act="it-add" style="margin-bottom:14px">Tambah hari</button>'+
 '<label class="f"><span class="l">Pertanyaan khusus paket (format: Pertanyaan | Jawaban, satu per baris)</span><textarea id="k_faq">'+esc((p.faq||[]).map(function(f){return f.q+" | "+f.a}).join("\n"))+'</textarea></label>'+
 '<h3>Foto</h3><p class="sm mut">Pilih foto sampul dan foto galeri dari pustaka.</p><div class="photos" role="group" aria-label="Foto galeri">'+ph.map(function(k){return '<label><div class="ph"><img src="img/'+k+'.jpg" alt="" loading="lazy" width="200" height="133"></div><span class="pk"><input type="checkbox" name="gal" value="'+k+'" '+((p.photos||[]).indexOf(k)>=0?"checked":"")+' aria-label="Galeri: '+esc(T.PH[k])+'"> '+esc(k)+'</span></label>'}).join("")+'</div><label class="f" style="margin-top:10px"><span class="l">Foto sampul</span><select id="k_cover">'+ph.map(function(k){return opt(k,T.PH[k],p.cover)}).join("")+'</select></label>'+
 '<label class="chk"><input type="checkbox" id="k_act" '+(p.active?"checked":"")+'><span>Tayang di situs</span></label><div class="actions"><button class="btn" type="submit">Simpan paket</button><button class="btn ghost" type="button" data-act="sheet-close">Batal</button></div></form>';
}
function pkSave(f){
 var id=f.dataset.id,old=id?T.pkg(id):null,ok=true;
 function v(i){return $(i).value.trim()}function n(i){return parseInt(String(v(i)).replace(/\D/g,""),10)||0}
 clearErr(f);
 ok=setErr("k_name",v("k_name").length<4?"Nama paket minimal 4 huruf.":"")&&ok;
 ok=setErr("k_dest",v("k_dest").length<3?"Isi destinasi.":"")&&ok;
 ok=setErr("k_desc",v("k_desc").length<20?"Deskripsi minimal 20 huruf.":"")&&ok;
 ok=setErr("k_meet",v("k_meet").length<5?"Isi titik kumpul.":"")&&ok;
 var t1=n("k_t1"),t3=n("k_t3"),t6=n("k_t6");
 ok=setErr("k_t1",t1<100000?"Harga minimal Rp 100.000.":"")&&ok;
 ok=setErr("k_t3",t3<100000||t3>t1?"Harus terisi dan tidak lebih mahal dari harga 1-2 orang.":"")&&ok;
 ok=setErr("k_t6",t6<100000||t6>t3?"Harus terisi dan tidak lebih mahal dari harga 3-5 orang.":"")&&ok;
 var ch=n("k_child");ok=setErr("k_child",ch<30||ch>100?"Isi 30 sampai 100.":"")&&ok;
 ok=setErr("k_single",$("k_single").value===""?"Isi 0 jika tidak ada.":"")&&ok;
 ok=setErr("k_optn",v("k_optn").length<3?"Isi nama tur opsional.":"")&&ok;
 ok=setErr("k_optp",$("k_optp").value===""?"Isi harga tur opsional.":"")&&ok;
 var inc=v("k_inc").split("\n").map(function(x){return x.trim()}).filter(Boolean),exc=v("k_exc").split("\n").map(function(x){return x.trim()}).filter(Boolean);
 ok=setErr("k_inc",inc.length?"":"Isi minimal satu item termasuk.")&&ok;
 var it=[].slice.call(f.querySelectorAll("[data-it]")).map(function(r){return{t:r.querySelector("[data-it-t]").value.trim(),d:r.querySelector("[data-it-d]").value.trim()}});
 var itok=it.length>0&&it.every(function(x){return x.t&&x.d});
 var el=$("e_itl");el.textContent=itok?"":"Minimal 1 hari dan setiap hari harus punya judul dan kegiatan.";ok=itok&&ok;
 var gal=[].slice.call(f.querySelectorAll("[name=gal]:checked")).map(function(x){return x.value}),cover=$("k_cover").value;
 if(gal.indexOf(cover)<0)gal.unshift(cover);
 if(!ok){toast("Periksa isian yang bertanda merah.",true);var bad=f.querySelector("[aria-invalid]");if(bad)bad.focus();return}
 var faq=v("k_faq").split("\n").map(function(l){var a=l.split("|");return a.length>1?{q:a[0].trim(),a:a.slice(1).join("|").trim()}:null}).filter(function(x){return x&&x.q&&x.a});
 var o={name:v("k_name"),dest:v("k_dest"),tipe:$("k_tipe").value,tema:$("k_tema").value,meet:v("k_meet"),desc:v("k_desc"),t1:t1,t3:t3,t6:t6,child:ch,single:n("k_single"),health:$("k_health").checked,optN:v("k_optn"),optP:n("k_optp"),inc:inc,exc:exc,it:it,faq:faq,photos:gal,cover:cover,active:$("k_act").checked};
 if(old){Object.keys(o).forEach(function(k){old[k]=o[k]})}
 else{o.id="p"+Date.now().toString(36);T.db.pkgs.push(o);
  var d={id:o.id+"d1",pkg:o.id,date:T.addD(today(),30),quota:12,closed:false};T.db.deps.push(d)}
 T.save();closeSheet();render();toast(old?"Paket disimpan.":"Paket ditambahkan dengan satu jadwal contoh (30 hari lagi).");
}
/* ----- jadwal ----- */
function aJadwal(){
 var L=T.db.deps.filter(function(d){return(!aj.pkg||d.pkg===aj.pkg)&&(aj.past||d.date>=today())}).sort(function(a,b){return a.date<b.date?-1:1});
 return '<h1>Jadwal dan kuota</h1><div class="tb"><label class="f"><span class="l">Paket</span><select data-aj="pkg">'+opt("","Semua",aj.pkg)+T.db.pkgs.map(function(p){return opt(p.id,p.name,aj.pkg)}).join("")+'</select></label><label class="chk" style="margin:0 0 12px"><input type="checkbox" data-aj="past" '+(aj.past?"checked":"")+'><span>Tampilkan yang sudah lewat</span></label><button class="btn" data-act="dp-edit" data-id="" type="button">Tambah jadwal</button><button class="btn ghost" data-act="csv-pax" data-d="" type="button">CSV semua peserta</button></div>'+(L.length?'<table class="t rt"><thead><tr><th>Paket dan tanggal</th><th>Kursi</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(d){var p=T.pkg(d.pkg),u=T.seatsUsed(d.id),pct=Math.round(u/d.quota*100),s=T.depState(d);return '<tr><td data-l="Paket"><strong>'+esc(p.name)+'</strong><br><span class="sm mut">'+dfmt(d.date)+'</span></td><td data-l="Kursi"><div class="bar'+(u>=d.quota?" full":pct>70?" hi":"")+'"><i style="width:'+pct+'%"></i></div><span class="sm">'+u+' terisi dari '+d.quota+'</span></td><td data-l="Status">'+badge(s.k==="ok"?"ok":s.k==="lewat"?"selesai":s.k==="penuh"?"batal":"warn",s.k==="ok"?"Buka, sisa "+s.left:s.label)+'</td><td class="act"><div class="actions"><button class="btn ghost sm" data-act="dp-edit" data-id="'+d.id+'" type="button">Ubah</button><button class="btn ghost sm" data-act="manifest" data-d="'+d.id+'" type="button">Manifest</button><button class="btn ghost sm" data-act="csv-pax" data-d="'+d.id+'" type="button">CSV</button><button class="btn dg sm" data-arm="1" data-armtext="Tekan lagi: hapus" data-act="dp-del" data-id="'+d.id+'" type="button">Hapus</button></div></td></tr>'}).join("")+'</tbody></table>':'<div class="empty card"><h3>Tidak ada jadwal</h3></div>');
}
function dpForm(id){
 var d=id?T.dep(id):{id:"",pkg:T.db.pkgs[0].id,date:T.addD(today(),30),quota:12,closed:false};
 return '<form id="fdp" data-id="'+esc(id||"")+'" novalidate><label class="f"><span class="l">Paket</span><select id="d_pkg"'+(id?" disabled":"")+'>'+T.db.pkgs.map(function(p){return opt(p.id,p.name,d.pkg)}).join("")+'</select></label>'+field("d_date","Tanggal berangkat",d.date,{type:"date"})+field("d_quota","Kuota kursi",d.quota,{attr:'inputmode="numeric" maxlength="3"',hint:id?"Terisi saat ini: "+T.seatsUsed(id):""})+'<label class="chk"><input type="checkbox" id="d_closed" '+(d.closed?"checked":"")+'><span>Tutup pendaftaran</span></label><div class="actions"><button class="btn" type="submit">Simpan jadwal</button><button class="btn ghost" type="button" data-act="sheet-close">Batal</button></div></form>';
}
/* ----- pembayaran ----- */
function aBayar(){
 var L=payQueue().filter(function(x){return ap==="semua"||x.y.st===ap});
 return '<h1>Pembayaran masuk</h1><div class="tb"><label class="f"><span class="l">Tampilkan</span><select data-ap="1">'+opt("menunggu","Menunggu verifikasi",ap)+opt("ok","Terkonfirmasi",ap)+opt("tolak","Ditolak",ap)+opt("semua","Semua",ap)+'</select></label><button class="btn ghost" data-act="csv-pay" type="button">Unduh CSV</button></div>'+(L.length?'<table class="t rt"><thead><tr><th>Tanggal</th><th>Booking</th><th>Jenis dan metode</th><th class="n">Jumlah</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(x){var i=x.b.pays.indexOf(x.y);return '<tr><td data-l="Tanggal">'+T.stamp(x.y.at)+'</td><td data-l="Booking"><button class="chip" style="min-height:36px" data-act="adm-book" data-c="'+esc(x.b.code)+'" type="button">'+esc(x.b.code)+'</button><br><span class="sm mut">'+esc(x.b.contact.name)+'</span></td><td data-l="Jenis">'+esc(x.y.kind)+'<br><span class="sm mut">'+esc(x.y.method)+(x.y.ref?" | "+esc(x.y.ref):"")+'</span></td><td class="n" data-l="Jumlah">'+rp(x.y.amt)+'</td><td data-l="Status">'+badge(x.y.st==="ok"?"ok":x.y.st==="tolak"?"tolak":"warn",x.y.st==="ok"?"Terkonfirmasi":x.y.st==="tolak"?"Ditolak":"Menunggu")+'</td><td class="act">'+(x.y.st==="menunggu"?'<div class="actions"><button class="btn sm" data-act="pay-ok" data-c="'+esc(x.b.code)+'" data-i="'+i+'" type="button">Konfirmasi</button><button class="btn dg sm" data-act="pay-no" data-c="'+esc(x.b.code)+'" data-i="'+i+'" type="button">Tolak</button></div>':"")+'</td></tr>'}).join("")+'</tbody></table>':'<div class="empty card"><h3>Tidak ada pembayaran</h3><p>Pembayaran dari pelanggan muncul di sini untuk diverifikasi.</p></div>');
}
/* ----- sewa ----- */
function aSewa(){
 var L=T.db.rents.slice().sort(function(a,b){return a.at<b.at?1:-1});
 return '<h1>Permintaan sewa</h1>'+(L.length?'<table class="t rt"><thead><tr><th>Permintaan</th><th>Layanan</th><th class="n">Perkiraan</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(r){var it=T.RENT.filter(function(x){return x.id===r.item})[0]||{n:"?",p:0,u:""};return '<tr><td data-l="Permintaan"><strong>'+esc(r.id)+'</strong> '+esc(r.name)+'<br><span class="sm mut">'+esc(r.phone)+' | mulai '+dshort(r.start)+'</span>'+(r.note?'<br><span class="sm">'+esc(r.note)+'</span>':"")+'</td><td data-l="Layanan">'+esc(it.n)+'<br><span class="sm mut">'+r.q+' unit x '+r.n+' '+esc(it.u)+'</span></td><td class="n" data-l="Perkiraan">'+rp(it.p*r.n*r.q)+'</td><td data-l="Status"><select data-rs="'+esc(r.id)+'" aria-label="Status '+esc(r.id)+'">'+["baru","diproses","selesai","batal"].map(function(s){return opt(s,s.charAt(0).toUpperCase()+s.slice(1),r.st)}).join("")+'</select></td><td class="act"><button class="btn dg sm" data-arm="1" data-armtext="Tekan lagi: hapus" data-act="rent-del" data-id="'+esc(r.id)+'" type="button">Hapus</button></td></tr>'}).join("")+'</tbody></table>':'<div class="empty card"><h3>Belum ada permintaan</h3><p>Permintaan dari halaman Sewa muncul di sini.</p></div>');
}
/* ----- laporan ----- */
function aLap(){
 var books=T.db.books,st={};Object.keys(T.SL).forEach(function(k){st[k]=0});books.forEach(function(b){st[b.status]++});
 var mx=Math.max.apply(null,Object.keys(st).map(function(k){return st[k]}).concat([1]));
 var per=T.db.pkgs.map(function(p){var bs=books.filter(function(b){return b.pkg===p.id&&b.status!=="batal"});return{p:p,n:bs.length,pax:T.sum(bs,function(b){return b.a+b.k}),rev:T.sum(books.filter(function(b){return b.pkg===p.id}),function(b){return T.paid(b)-(b.refund?b.refund.amt:0)}),val:T.sum(bs,function(b){return b.total}),r:T.rate(p.id)}});
 var deps=T.db.deps.filter(function(d){return d.date>=today()}).sort(function(a,b){return a.date<b.date?-1:1});
 return '<h1>Laporan</h1><div class="kpis">'+kpi("Omzet bersih",rp(netRev()))+kpi("Total booking",books.length)+kpi("Booking batal",st.batal)+kpi("Rata-rata nilai booking",rp(books.length?T.sum(books,function(b){return b.total})/books.length:0))+'</div><div class="actions" style="margin:12px 0"><button class="btn ghost" data-act="csv-book" type="button">CSV booking</button><button class="btn ghost" data-act="csv-pax" data-d="" type="button">CSV peserta</button><button class="btn ghost" data-act="csv-pay" type="button">CSV pembayaran</button></div>'+
 '<section class="card"><h2>Booking menurut status</h2>'+Object.keys(st).map(function(k){return '<div class="rbar"><span>'+T.SL[k]+'</span><div class="bar"><i style="width:'+Math.round(st[k]/mx*100)+'%"></i></div><strong>'+st[k]+'</strong></div>'}).join("")+'</section>'+
 '<section class="card" style="margin-top:14px"><h2>Per paket</h2><table class="t rt"><thead><tr><th>Paket</th><th class="n">Booking</th><th class="n">Peserta</th><th class="n">Nilai booking</th><th class="n">Omzet bersih</th><th>Rating</th></tr></thead><tbody>'+per.map(function(x){return '<tr><td data-l="Paket">'+esc(x.p.name)+'</td><td class="n" data-l="Booking">'+x.n+'</td><td class="n" data-l="Peserta">'+x.pax+'</td><td class="n" data-l="Nilai">'+rp(x.val)+'</td><td class="n" data-l="Omzet">'+rp(x.rev)+'</td><td data-l="Rating">'+(x.r.n?x.r.avg.toFixed(1)+" ("+x.r.n+")":"-")+'</td></tr>'}).join("")+'</tbody></table></section>'+
 '<section class="card" style="margin-top:14px"><h2>Keterisian jadwal mendatang</h2><table class="t rt"><tbody>'+deps.map(function(d){return depRow(d,false)}).join("")+'</tbody></table></section>';
}
/* ----- pengaturan ----- */
function aAtur(){
 var b=T.db.biro;
 return '<h1>Pengaturan</h1><div class="card" style="max-width:560px"><form id="fset" novalidate>'+field("s_nama","Nama biro",b.nama,{attr:'maxlength="40"'})+'<div class="row2">'+field("s_pin","PIN panel (4 angka)",b.pin,{attr:'inputmode="numeric" maxlength="4"'})+field("s_dp","Persentase DP",b.dp,{attr:'inputmode="numeric" maxlength="2"',hint:"10 sampai 90. Berlaku untuk booking baru."})+'</div><button class="btn" type="submit">Simpan</button></form></div><div class="card" style="max-width:560px;margin-top:14px"><h2>Data demo</h2><p class="sm mut">Semua data ada di browser ini (localStorage). Reset mengembalikan paket, jadwal, dan booking contoh.</p><div class="actions"><button class="btn dg" data-arm="1" data-armtext="Tekan lagi untuk reset" data-act="reset" id="reset" type="button">Reset data demo</button><button class="btn ghost" data-act="logout" type="button">Keluar</button></div></div>';
}

/* ---------- aksi ---------- */
function bookOf(t){return T.book(t.dataset.c)}
function confirmPay(b,i,ok){
 var y=b.pays[i];if(!y||y.st!=="menunggu")return;
 y.st=ok?"ok":"tolak";var before=b.status;T.recompute(b);T.save();
 toast(ok?"Pembayaran dikonfirmasi"+(before!==b.status?". Status: "+T.statusLabel(b):"."):"Pembayaran ditolak.");
 afterAdmin(inSheet()&&window.__sheet?window.__sheet:null);
}
function stGo(b,s){
 if(s==="berangkat"){if(b.status!=="lunas"||T.paid(b)<b.total){toast("Booking harus lunas dulu.",true);return}b.status="berangkat"}
 else if(s==="selesai"){if(b.status!=="berangkat"){toast("Tandai berangkat dulu.",true);return}b.status="selesai"}
 else if(s==="batal"){if(["menunggu","dp","lunas"].indexOf(b.status)<0){toast("Booking ini tidak bisa dibatalkan.",true);return}var rf=T.refundFor(b);b.refund=T.paid(b)>0?{amt:rf.amt,pct:rf.pct,at:new Date().toISOString()}:null;b.status="batal"}
 T.save();toast("Status: "+T.statusLabel(b)+(s==="batal"?". Kursi dilepas kembali ke jadwal.":"."));afterAdmin(b.code);
}
function act(a,t,e){
 switch(a){
  case"sheet-close":closeSheet();break;
  case"goto":var el=$(t.dataset.t);if(el){el.scrollIntoView({behavior:"smooth",block:"start"});el.setAttribute("tabindex","-1");el.focus({preventScroll:true})}break;
  case"gal":var k=t.dataset.k,m=$("galm");m.innerHTML='<img src="img/'+k+'.jpg" alt="'+esc(T.PH[k])+'" width="1000" height="667">';document.querySelectorAll(".thumbs button").forEach(function(x){x.classList.toggle("on",x===t)});break;
  case"dest":cf=blank();cf.dest=t.dataset.d;break;
  case"cf-reset":cf=blank();render();break;
  case"cek-ex":$("ck_code").value=t.dataset.c;$("ck_hp").value=t.dataset.h;$("ck_hp").focus();break;
  case"wz-dep":wz.dep=t.value;wzRefresh();break;
  case"wz-inc":case"wz-dec":{
   var key=t.dataset.k,inp=$("w_"+key),mn=+inp.dataset.min,mx=+inp.dataset.max,v=(parseInt(inp.value,10)||0)+(a==="wz-inc"?1:-1);
   v=Math.max(mn,Math.min(mx,v));wz[key]=v;if(key==="a"||key==="k"){fixParity();if(wz.opt>wz.a+wz.k)wz.opt=wz.a+wz.k}
   wzRefresh('[data-act="'+a+'"][data-k="'+key+'"]');break}
  case"wz-promo":{
   var c=$("w_promo").value.trim().toUpperCase();wz.promo=c;
   var p=T.pkg(wz.pid),q=T.quote(p,{a:wz.a,k:wz.k,s:wz.s,ins:wz.ins?1:0,opt:wz.opt,promo:""}),r=T.checkPromo(c,q.sub);
   if(r.ok){wz.promoOk=r.code;wz.promoMsg='<span style="color:var(--ok);font-weight:600">'+esc(r.msg)+'</span>'}else{wz.promoOk="";wz.promoMsg='<span class="err">'+esc(r.msg)+'</span>'}
   $("pmsg").innerHTML=wz.promoMsg;wzPartial();break}
  case"wz-next":
   if(wz.step===1){if(wzCheck1()){wz.step=2;render()}}
   else if(wz.step===2){readStep2();if(wzCheck2()){wz.step=3;if(!dpPossible())wz.mode="full";render()}}
   break;
  case"wz-back":if(wz.step===2)readStep2();wz.step--;render();break;
  case"wz-mode":wz.mode=t.value;wzRefresh();break;
  case"wz-submit":wzSubmit();break;
  case"print-itin":printItin(t.dataset.c);break;
  case"print-vch":printVoucher(t.dataset.c);break;
  case"doc-send":{var b=bookOf(t);b.pax[+t.dataset.i].docs[t.dataset.k]=1;T.save();toast("Ditandai sudah dikirim. Biro akan memeriksa.");render();break}
  case"doc-adm":{var b2=bookOf(t),x=b2.pax[+t.dataset.i];x.docs[t.dataset.k]=x.docs[t.dataset.k]===2?0:2;T.save();$("sbody").innerHTML=bookSheet(b2.code);break}
  case"adm-book":showBook(t.dataset.c);break;
  case"st-go":stGo(bookOf(t),t.dataset.s);break;
  case"pay-ok":confirmPay(bookOf(t),+t.dataset.i,true);break;
  case"pay-no":confirmPay(bookOf(t),+t.dataset.i,false);break;
  case"book-del":{var cd=t.dataset.c;T.db.books=T.db.books.filter(function(b){return b.code!==cd});T.save();closeSheet();render();toast("Booking dihapus.");break}
  case"pk-edit":openSheet(t.dataset.id?"Ubah paket":"Tambah paket",pkForm(t.dataset.id));break;
  case"pk-toggle":{var pk=T.pkg(t.dataset.id);pk.active=!pk.active;T.save();render();toast(pk.active?"Paket tayang.":"Paket disembunyikan.");break}
  case"pk-del":{var id=t.dataset.id;if(T.db.books.some(function(b){return b.pkg===id})){toast("Paket punya booking. Sembunyikan saja.",true);break}
   T.db.pkgs=T.db.pkgs.filter(function(p){return p.id!==id});T.db.deps=T.db.deps.filter(function(d){return d.pkg!==id});T.save();render();toast("Paket dihapus.");break}
  case"it-add":{var l=$("itl"),n=l.querySelectorAll("[data-it]").length;l.insertAdjacentHTML("beforeend",itRow({t:"",d:""},n));l.lastElementChild.querySelector("input").focus();break}
  case"it-del":{var rows=$("itl").querySelectorAll("[data-it]");if(rows.length<2){toast("Minimal satu hari.",true);break}t.closest("[data-it]").remove();$("itl").querySelectorAll("[data-no]").forEach(function(x,i){x.textContent=i+1});break}
  case"dp-edit":openSheet(t.dataset.id?"Ubah jadwal":"Tambah jadwal",dpForm(t.dataset.id));break;
  case"dp-del":{var did=t.dataset.id;if(T.db.books.some(function(b){return b.dep===did&&b.status!=="batal"})){toast("Jadwal punya booking aktif. Tutup pendaftaran saja.",true);break}
   if(T.db.books.some(function(b){return b.dep===did})){toast("Jadwal punya riwayat booking batal. Tutup pendaftaran saja.",true);break}
   T.db.deps=T.db.deps.filter(function(d){return d.id!==did});T.save();render();toast("Jadwal dihapus.");break}
  case"manifest":printManifest(t.dataset.d);break;
  case"rent-del":{T.db.rents=T.db.rents.filter(function(r){return r.id!==t.dataset.id});T.save();render();toast("Permintaan dihapus.");break}
  case"csv-book":csv("booking-nusa-jelajah.csv",[["Kode","Dibuat","Pemesan","HP","Email","Paket","Berangkat","Dewasa","Anak","Single","Total","Terbayar","Status"]].concat(T.db.books.map(function(b){var d=T.dep(b.dep);return[b.code,T.iso(new Date(b.at)),b.contact.name,b.contact.phone,b.contact.email,T.pkg(b.pkg).name,d.date,b.a,b.k,b.s,b.total,T.paid(b),T.statusLabel(b)]})));break;
  case"csv-pax":{var did2=t.dataset.d,rws=[["Berangkat","Paket","Booking","No","Nama","Jenis","L/P","Lahir","Identitas (disamarkan)","Kamar","Dokumen lengkap","Catatan"]];
   T.db.books.filter(function(b){return b.status!=="batal"&&(!did2||b.dep===did2)}).forEach(function(b){var d=T.dep(b.dep),p=T.pkg(b.pkg);b.pax.forEach(function(x,i){rws.push([d.date,p.name,b.code,i+1,x.n,x.t==="K"?"Anak":"Dewasa",x.g,x.bd,maskId(x.idn),T.roomOf(b,i),T.docKeys(p,b).every(function(k){return x.docs[k]===2})?"ya":"belum",x.note])})});
   csv("peserta-nusa-jelajah.csv",rws);break}
  case"csv-pay":csv("pembayaran-nusa-jelajah.csv",[["Tanggal","Booking","Pemesan","Jenis","Metode","Referensi","Jumlah","Status"]].concat(payQueue().map(function(x){return[x.y.at,x.b.code,x.b.contact.name,x.y.kind,x.y.method,x.y.ref,x.y.amt,x.y.st]})));break;
  case"logout":try{sessionStorage.removeItem(AUTH)}catch(er){}go("/admin");render();break;
  case"reset":T.reset();wz=null;try{sessionStorage.removeItem(OKS)}catch(er){}closeSheet();cf=blank();af={q:"",st:"",pkg:""};toast("Data demo dikembalikan.");go("/admin/ringkasan");render();break;
 }
}
function blank(){return{q:"",dest:"",dur:"",price:"",tema:"",tipe:"",from:"",to:"",sort:"dekat"}}
function readStep2(){
 if(!wz||wz.step!==2)return;
 var g=function(i){var e=$(i);return e?e.value:""};
 if($("c_name")){wz.contact={name:g("c_name"),phone:g("c_phone"),email:g("c_email")}}
 wz.pax.forEach(function(x,i){if(!$("p"+i+"_n"))return;x.n=g("p"+i+"_n");x.g=g("p"+i+"_g");x.bd=g("p"+i+"_b");x.idn=g("p"+i+"_i");x.note=g("p"+i+"_c")});
 if(wz.same&&wz.pax[0]&&!wz.pax[0].n.trim())wz.pax[0].n=wz.contact.name;
}

/* ---------- event ---------- */
document.addEventListener("click",function(e){
 var t=e.target.closest("[data-act]");if(!t||t.disabled)return;
 if(t.tagName==="INPUT")return;
 if(t.hasAttribute("data-arm")&&!t.classList.contains("arm")){
  e.preventDefault();t.dataset.t0=t.textContent;t.classList.add("arm");t.textContent=t.dataset.armtext;
  clearTimeout(t._at);t._at=setTimeout(function(){if(t.isConnected){t.classList.remove("arm");t.textContent=t.dataset.t0}},4000);return;
 }
 if(t.getAttribute("data-act")==="dest"){act("dest",t,e);return}
 e.preventDefault();act(t.getAttribute("data-act"),t,e);
});
document.addEventListener("change",function(e){
 var t=e.target;
 if(t.matches&&t.matches("input[data-act]")){act(t.getAttribute("data-act"),t,e);return}
 if(t.dataset.f){cf[t.dataset.f]=t.value;renderResults();return}
 if(t.dataset.af!==undefined){af[t.dataset.af]=t.value;$("btab").innerHTML=bookTable();return}
 if(t.dataset.aj!==undefined){aj[t.dataset.aj]=t.type==="checkbox"?t.checked:t.value;render();return}
 if(t.dataset.ap){ap=t.value;render();return}
 if(t.dataset.rs){var r=T.db.rents.filter(function(x){return x.id===t.dataset.rs})[0];r.st=t.value;T.save();toast("Status "+r.id+": "+t.value);return}
 if(t.id==="w_ins"){wz.ins=t.checked;wzPartial();return}
 if(t.id==="w_same"){wz.same=t.checked;readStep2();if(wz.same&&wz.pax[0]){wz.pax[0].n=wz.contact.name;var n0=$("p0_n");if(n0)n0.value=wz.contact.name}return}
 if(t.dataset.p!==undefined){wz.pax[+t.dataset.p][t.dataset.pk]=t.value;return}
 if(t.id==="w_agree"){wz.agree=t.checked;if(t.checked)setErr("agree","");return}
 if(t.id==="sw_i")swEst();
});
document.addEventListener("input",function(e){
 var t=e.target;
 if(t.dataset.f&&(t.type==="text"||t.type==="search")){cf[t.dataset.f]=t.value;renderResults();return}
 if(t.dataset.af==="q"){af.q=t.value;$("btab").innerHTML=bookTable();return}
 if(t.dataset.w){
  var k=t.dataset.w,v=parseInt(t.value,10);if(isNaN(v))return;v=Math.max(+t.dataset.min,Math.min(+t.dataset.max,v));wz[k]=v;
  if(k==="a"||k==="k"){var s0=wz.s;if(wz.s>wz.a)wz.s=wz.a;if(wz.opt>wz.a+wz.k)wz.opt=wz.a+wz.k}
  wzPartial();return;
 }
 if(t.dataset.p!==undefined){wz.pax[+t.dataset.p][t.dataset.pk]=t.value;if(t.dataset.p==="0"&&t.dataset.pk==="n"&&wz.same){/* biarkan */}return}
 if(t.id==="c_name"&&wz.same&&wz.pax[0]){wz.pax[0].n=t.value;var n0=$("p0_n");if(n0)n0.value=t.value}
 if(t.id==="w_promo"){wz.promo=t.value}
 if(t.id==="sw_n"||t.id==="sw_q")swEst();
 if(t.id==="ck_code")t.value=t.value.toUpperCase();
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&inSheet())closeSheet()});
document.addEventListener("submit",function(e){
 var f=e.target;e.preventDefault();var id=f.id;
 if(id==="hs"){cf=blank();cf.dest=$("hsd").value;cf.dur=$("hsdur").value;cf.tema=$("hstema").value;go("/paket");return}
 if(id==="fcek"){
  var code=$("ck_code").value.trim().toUpperCase(),hp=$("ck_hp").value.trim(),ok=true;
  ok=setErr("ck_code",code?"":"Isi kode booking.")&&ok;ok=setErr("ck_hp",/^\d{4}$/.test(hp)?"":"Isi 4 digit angka.")&&ok;if(!ok)return;
  var b=T.book(code);
  if(!b||b.contact.phone.replace(/\D/g,"").slice(-4)!==hp){setErr("ck_hp","Kode atau 4 digit HP tidak cocok.");toast("Booking tidak ditemukan.",true);return}
  verify(b.code);go("/booking/"+b.code);return;
 }
 if(id==="fpay"){
  var b2=T.book(f.dataset.c),paid=T.paid(b2),pend=T.pending(b2),rem=b2.total-paid-pend,kind=$("py_k").value,amt=kind==="DP"?b2.dpAmt-paid-pend:rem;
  if(amt<=0||amt>rem){toast("Jumlah pembayaran tidak valid.",true);return}
  var ref=$("py_r").value.trim();if(ref&&!/^[A-Za-z0-9\-]{4,20}$/.test(ref)){setErr("py_r","Referensi 4 sampai 20 huruf atau angka.");return}
  b2.pays.push({id:b2.code+"-"+(b2.pays.length+1),at:new Date().toISOString(),amt:amt,kind:kind==="DP"?"DP":(paid+pend>0?"Pelunasan":"Lunas"),method:$("py_m").value,ref:ref||"-",st:"menunggu"});
  T.save();toast("Pembayaran "+rp(amt)+" tercatat, menunggu verifikasi biro.");render();return;
 }
 if(id==="frev"){
  var b3=T.book(f.dataset.c),txt=$("rv_t").value.trim();
  if(txt.length<10){setErr("rv_t","Tulis minimal 10 huruf.");return}setErr("rv_t","");
  T.db.reviews.push({id:T.nextId("v"),pkg:b3.pkg,name:firstLast(b3.contact.name),rating:+$("rv_r").value,text:txt,at:new Date().toISOString(),code:b3.code});T.save();toast("Terima kasih, ulasan tersimpan.");render();return;
 }
 if(id==="fsewa"){
  var ok2=true,d=$("sw_d").value,n=parseInt($("sw_n").value,10),q=parseInt($("sw_q").value,10),nm=$("sw_name").value.trim(),hp2=$("sw_hp").value.replace(/[\s\-]/g,"");
  ok2=setErr("sw_d",!d?"Isi tanggal mulai.":d<T.addD(today(),1)?"Mulai paling cepat besok.":"")&&ok2;
  ok2=setErr("sw_n",!(n>=1&&n<=30)?"Isi 1 sampai 30.":"")&&ok2;
  ok2=setErr("sw_q",!(q>=1&&q<=10)?"Isi 1 sampai 10.":"")&&ok2;
  ok2=setErr("sw_name",nm.length<3?"Nama minimal 3 huruf.":"")&&ok2;
  ok2=setErr("sw_hp",!/^08\d{8,11}$/.test(hp2)?"Nomor HP harus diawali 08, 10 sampai 13 digit.":"")&&ok2;
  if(!ok2){toast("Periksa isian yang bertanda merah.",true);return}
  var rid="SW"+(T.db.seq.SW=(T.db.seq.SW||100)+1);
  T.db.rents.push({id:rid,item:$("sw_i").value,start:d,n:n,q:q,name:nm,phone:$("sw_hp").value.trim(),note:$("sw_c").value.trim(),st:"baru",at:new Date().toISOString()});T.save();
  view.querySelector("#fsewa").parentNode.innerHTML='<h2>Permintaan terkirim</h2><p>Nomor permintaan <span class="code">'+esc(rid)+'</span>. Biro akan menghubungi '+esc(nm)+' di '+esc($("sw_hp").value)+' untuk konfirmasi.</p><a class="btn ghost" href="#/sewa" data-act="sewa-lagi">Ajukan lagi</a>';toast("Permintaan sewa terkirim.");return;
 }
 if(id==="flogin"){if($("pin").value===T.db.biro.pin){try{sessionStorage.setItem(AUTH,"1")}catch(er){}render()}else{setErr("pin","PIN salah. PIN demo: "+T.db.biro.pin)}return}
 if(id==="fpk"){pkSave(f);return}
 if(id==="fdp"){
  var did=f.dataset.id,old=did?T.dep(did):null,pid=old?old.pkg:$("d_pkg").value,date=$("d_date").value,qt=parseInt($("d_quota").value,10),ok3=true;
  ok3=setErr("d_date",!date?"Isi tanggal.":(!old&&date<today())?"Tanggal tidak boleh lewat.":T.db.deps.some(function(x){return x.pkg===pid&&x.date===date&&x.id!==did})?"Paket ini sudah punya jadwal di tanggal tersebut.":"")&&ok3;
  var used=old?T.seatsUsed(old.id):0;
  ok3=setErr("d_quota",!(qt>=1&&qt<=60)?"Isi 1 sampai 60.":qt<used?"Kuota tidak boleh di bawah peserta terdaftar ("+used+").":"")&&ok3;
  if(!ok3)return;
  if(old){old.date=date;old.quota=qt;old.closed=$("d_closed").checked}else T.db.deps.push({id:pid+"d"+Date.now().toString(36),pkg:pid,date:date,quota:qt,closed:$("d_closed").checked});
  T.save();closeSheet();render();toast("Jadwal disimpan.");return;
 }
 if(id==="fcatat"){
  var b4=T.book(f.dataset.c),amt2=parseInt($("ct_a").value.replace(/\D/g,""),10)||0,rem2=b4.total-T.paid(b4);
  if(!(amt2>0)){setErr("ct_a","Isi jumlah lebih dari 0.");return}
  if(amt2>rem2){setErr("ct_a","Melebihi sisa tagihan ("+rp(rem2)+").");return}setErr("ct_a","");
  b4.pays.push({id:b4.code+"-"+(b4.pays.length+1),at:new Date().toISOString(),amt:amt2,kind:$("ct_k").value,method:$("ct_m").value,ref:"admin",st:"ok"});
  var bf=b4.status;T.recompute(b4);T.save();toast("Pembayaran dicatat"+(bf!==b4.status?". Status: "+T.statusLabel(b4):"."));afterAdmin(b4.code);return;
 }
 if(id==="fnote"){var b5=T.book(f.dataset.c);b5.note=$("nt").value.trim();T.save();toast("Catatan disimpan.");return}
 if(id==="fset"){
  var nm2=$("s_nama").value.trim(),pin=$("s_pin").value.trim(),dpv=parseInt($("s_dp").value,10),ok4=true;
  ok4=setErr("s_nama",nm2.length<3?"Nama minimal 3 huruf.":"")&&ok4;ok4=setErr("s_pin",/^\d{4}$/.test(pin)?"":"PIN harus 4 angka.")&&ok4;ok4=setErr("s_dp",dpv>=10&&dpv<=90?"":"Isi 10 sampai 90.")&&ok4;
  if(!ok4)return;T.db.biro.nama=nm2;T.db.biro.pin=pin;T.db.biro.dp=dpv;T.save();render();toast("Pengaturan disimpan.");return;
 }
});
/* hero akordeon */
function accOn(pn){
 var all=document.querySelectorAll("#acc .pn");
 all.forEach(function(x){var on=x===pn;x.classList.toggle("on",on);var b=x.querySelector(".pbtn");if(b)b.setAttribute("aria-expanded",on)});
}
document.addEventListener("click",function(e){var pn=e.target.closest&&e.target.closest("#acc .pn");if(pn&&!e.target.closest("a"))accOn(pn)});
document.addEventListener("mouseover",function(e){var pn=e.target.closest&&e.target.closest("#acc .pn");if(pn&&!pn.classList.contains("on")&&window.matchMedia("(hover:hover) and (min-width:760px)").matches)accOn(pn)});
document.addEventListener("focusin",function(e){var pn=e.target.closest&&e.target.closest("#acc .pn");if(pn&&!pn.classList.contains("on"))accOn(pn)});
window.addEventListener("hashchange",render);
window.addEventListener("storage",function(){});
render();
})();
